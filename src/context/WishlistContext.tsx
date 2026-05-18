import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { customerSupabase } from '../lib/customerAuth'

const KEY = 'cxx-wishlist'

function readLocal(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
}

function writeLocal(ids: string[]) {
  try { localStorage.setItem(KEY, JSON.stringify(ids)) } catch { /* ignore */ }
}

interface WishlistContextType {
  ids: string[]
  toggle: (id: string) => void
  has: (id: string) => boolean
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  // localStorage is the instant/offline store and the guest store. For a
  // signed-in customer we additionally mirror to the `wishlist` table so the
  // list follows them across devices.
  const [ids, setIds] = useState<string[]>(readLocal)
  const userIdRef = useRef<string | null>(null)

  // Converge device + cloud to their union: push local-only items up, pull
  // cloud items down. Runs on first load (if already signed in) and on every
  // sign-in on this device.
  async function syncWithCloud(userId: string) {
    const local = readLocal()
    const { data, error } = await customerSupabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', userId)
    if (error) return

    const cloud = (data ?? []).map((r) => r.product_id as string)
    const union = Array.from(new Set([...cloud, ...local]))
    const missingInCloud = union.filter((pid) => !cloud.includes(pid))

    if (missingInCloud.length > 0) {
      await customerSupabase
        .from('wishlist')
        .upsert(
          missingInCloud.map((pid) => ({ user_id: userId, product_id: pid })),
          { onConflict: 'user_id,product_id', ignoreDuplicates: true },
        )
    }

    setIds(union)
    writeLocal(union)
  }

  useEffect(() => {
    customerSupabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        userIdRef.current = session.user.id
        syncWithCloud(session.user.id)
      }
    })

    const { data: { subscription } } = customerSupabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        userIdRef.current = session.user.id
        if (event === 'SIGNED_IN') syncWithCloud(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        userIdRef.current = null
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  function toggle(id: string) {
    setIds((prev) => {
      const adding = !prev.includes(id)
      const next = adding ? [...prev, id] : prev.filter((i) => i !== id)
      writeLocal(next)

      const uid = userIdRef.current
      if (uid) {
        if (adding) {
          customerSupabase
            .from('wishlist')
            .upsert(
              { user_id: uid, product_id: id },
              { onConflict: 'user_id,product_id', ignoreDuplicates: true },
            )
            .then(() => {}, () => {})
        } else {
          customerSupabase
            .from('wishlist')
            .delete()
            .eq('user_id', uid)
            .eq('product_id', id)
            .then(() => {}, () => {})
        }
      }
      return next
    })
  }

  function has(id: string) {
    return ids.includes(id)
  }

  return (
    <WishlistContext.Provider value={{ ids, toggle, has }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be inside WishlistProvider')
  return ctx
}
