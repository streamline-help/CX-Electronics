import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { customerSupabase, setRememberMe } from '../lib/customerAuth'
import { notifySignup } from '../lib/webhooks'

export interface CustomerUser {
  id: string
  email: string
  name: string
  created_at: string
}

interface SignUpResult {
  error: string | null
  needsConfirmation: boolean
}

interface CustomerAuthContextType {
  user: CustomerUser | null
  loading: boolean
  signIn: (email: string, password: string, remember?: boolean) => Promise<string | null>
  signUp: (email: string, password: string, name: string, remember?: boolean) => Promise<SignUpResult>
  signOut: () => Promise<void>
  updateName: (name: string) => Promise<string | null>
  resendConfirmation: (email: string) => Promise<string | null>
}

const CustomerAuthContext = createContext<CustomerAuthContextType | null>(null)

function toCustomerUser(user: User): CustomerUser {
  return {
    id: user.id,
    email: user.email ?? '',
    name: (user.user_metadata?.name as string) ?? user.email ?? '',
    created_at: user.created_at,
  }
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null)
  const [loading, setLoading] = useState(true)
  // The ONLY thing that is allowed to clear the customer is an explicit
  // press of "Sign out". Everything else (navigation, tab focus changes,
  // cross-client broadcasts from the admin Supabase client, transient
  // GoTrue lock hiccups) must never log the customer out — the owner wants
  // customers to stay signed in until they deliberately leave.
  const explicitSignOutRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    customerSupabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      if (session?.user) setUser(toCustomerUser(session.user))
      setLoading(false)
    })

    const { data: { subscription } } = customerSupabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return

      if (event === 'SIGNED_OUT') {
        // Only honour a sign-out we initiated ourselves. Spurious SIGNED_OUT
        // events (cross-client, lock contention, refresh races) are ignored
        // so the customer is never kicked out unexpectedly.
        if (explicitSignOutRef.current) {
          setUser(null)
          explicitSignOutRef.current = false
        }
        return
      }

      // SIGNED_IN / USER_UPDATED / TOKEN_REFRESHED / INITIAL_SESSION:
      // only ever (re)affirm the user — never clear it.
      if (session?.user) setUser(toCustomerUser(session.user))
    })

    // When the tab regains focus, re-affirm the session if one exists.
    // This recovers the user object if React state was lost, but it will
    // never null the user out.
    function onVisibility() {
      if (document.visibilityState !== 'visible') return
      customerSupabase.auth.getSession().then(({ data: { session } }) => {
        if (!cancelled && session?.user) setUser(toCustomerUser(session.user))
      })
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  async function signUp(email: string, password: string, name: string, remember = true): Promise<SignUpResult> {
    setRememberMe(remember)
    const { data, error } = await customerSupabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/account/login`,
      },
    })

    if (error) return { error: error.message, needsConfirmation: false }

    // If Supabase returned a session immediately (email confirmation off),
    // set the user now so the redirect into /account lands logged-in.
    if (data.session?.user) setUser(toCustomerUser(data.session.user))

    // Fire welcome email — fire-and-forget
    notifySignup(name, email).catch(() => {})

    // No session yet → Supabase is waiting for email confirmation.
    const needsConfirmation = !!data.user && !data.session
    return { error: null, needsConfirmation }
  }

  async function signIn(email: string, password: string, remember = true): Promise<string | null> {
    setRememberMe(remember)
    const { data, error } = await customerSupabase.auth.signInWithPassword({ email, password })
    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('email not confirmed')) {
        return 'Please check your inbox and confirm your email before signing in.'
      }
      if (msg.includes('invalid login credentials')) {
        return 'Incorrect email or password.'
      }
      return error.message
    }
    // Set user immediately rather than waiting for the listener — avoids any
    // race between the navigation that follows and the auth state event.
    if (data.user) setUser(toCustomerUser(data.user))
    return null
  }

  async function signOut(): Promise<void> {
    explicitSignOutRef.current = true
    setUser(null)
    // scope:'local' = only sign out this client/tab. Default 'global' would
    // hit the auth server and could cascade into the admin session if the
    // server invalidates all refresh tokens for the same user.
    try {
      await customerSupabase.auth.signOut({ scope: 'local' })
    } catch {
      // Even if the network call fails, the local session is cleared and the
      // user is already nulled — treat the sign-out as done.
    }
  }

  async function updateName(name: string): Promise<string | null> {
    const { error } = await customerSupabase.auth.updateUser({ data: { name } })
    if (error) return error.message
    setUser((prev) => prev ? { ...prev, name } : prev)
    return null
  }

  async function resendConfirmation(email: string): Promise<string | null> {
    const { error } = await customerSupabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/account/login`,
      },
    })
    return error ? error.message : null
  }

  return (
    <CustomerAuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateName, resendConfirmation }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext)
  if (!ctx) throw new Error('useCustomerAuth must be inside CustomerAuthProvider')
  return ctx
}
