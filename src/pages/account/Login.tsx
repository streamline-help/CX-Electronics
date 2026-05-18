import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Zap, Loader2, Check, AlertTriangle, MailCheck } from 'lucide-react'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { customerSupabase } from '../../lib/customerAuth'

// Does the URL carry a Supabase confirmation/recovery payload we must consume
// ourselves? The customer client runs with detectSessionInUrl:false (so it
// never fights the admin client over the URL), which means a freshly-confirmed
// signup link landing here would otherwise be ignored and the user stuck on
// the login form. We detect tokens and establish the session manually.
function hasAuthPayload(): boolean {
  const h = window.location.hash
  const s = window.location.search
  if (/[#&]error=/.test(h)) return false
  return /access_token=/.test(h) || /[?&]code=/.test(s)
}

// Parse Supabase auth errors that arrive in the URL hash, e.g.
// #error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
function parseHashError(hash: string): { code: string | null; message: string | null } {
  if (!hash || hash.length < 2) return { code: null, message: null }
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  if (!params.get('error')) return { code: null, message: null }
  const description = params.get('error_description')
  const message = description ? decodeURIComponent(description.replace(/\+/g, ' ')) : params.get('error')
  return { code: params.get('error_code'), message }
}

export function AccountLogin() {
  const { signIn, resendConfirmation } = useCustomerAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? '/account'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [linkError, setLinkError] = useState<{ code: string | null; message: string } | null>(null)
  const [resendState, setResendState] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(hasAuthPayload)

  // 1) Surface Supabase confirmation errors (e.g. otp_expired) from the hash.
  // 2) If the URL carries a valid confirmation/recovery payload, establish the
  //    session ourselves and drop the user straight into their account.
  useEffect(() => {
    const parsed = parseHashError(window.location.hash)
    if (parsed.message) {
      setLinkError({ code: parsed.code, message: parsed.message })
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      return
    }

    if (!hasAuthPayload()) return

    let cancelled = false
    ;(async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const code = new URLSearchParams(window.location.search).get('code')

        let failed = false
        if (accessToken && refreshToken) {
          const { error } = await customerSupabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          failed = !!error
        } else if (code) {
          const { error } = await customerSupabase.auth.exchangeCodeForSession(code)
          failed = !!error
        }

        if (cancelled) return
        // Clean the token out of the address bar either way.
        window.history.replaceState(null, '', window.location.pathname)

        if (failed) {
          setLinkError({
            code: 'otp_expired',
            message: 'Your email link has expired or was already used.',
          })
          setConfirming(false)
        } else {
          navigate(from, { replace: true })
        }
      } catch {
        if (!cancelled) {
          setLinkError({ code: null, message: 'Could not confirm this link. Please sign in.' })
          setConfirming(false)
        }
      }
    })()

    return () => { cancelled = true }
  }, [navigate, from])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const err = await signIn(email, password, remember)
    if (err) { setError(err); setLoading(false) }
    else navigate(from, { replace: true })
  }

  async function handleResend() {
    if (!email.trim()) {
      setResendState('error')
      setResendMessage('Enter your email above first, then click resend.')
      return
    }
    setResendState('loading')
    setResendMessage(null)
    const err = await resendConfirmation(email.trim())
    if (err) {
      setResendState('error')
      setResendMessage(err)
    } else {
      setResendState('sent')
      setResendMessage(`A new confirmation link was sent to ${email}.`)
    }
  }

  const isExpiredLink = linkError?.code === 'otp_expired' || /expired|invalid/i.test(linkError?.message ?? '')

  if (confirming) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center px-4 gap-4">
        <Loader2 className="w-8 h-8 text-[#E63939] animate-spin" />
        <p className="text-white/50 text-sm">Confirming your account…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-[#E63939] rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-extrabold text-white text-lg tracking-tight">CW Electronics</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Sign in</h1>
          <p className="text-white/50 text-sm mt-1">
            New customer?{' '}
            <Link to="/account/register" className="text-[#E63939] hover:underline font-medium">Create account</Link>
          </p>
        </div>

        {/* Email-link error banner (e.g. otp_expired) */}
        {linkError && (
          <div className="mb-4 bg-amber-900/30 border border-amber-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-300">
                  {isExpiredLink ? 'Confirmation link expired' : 'Confirmation problem'}
                </p>
                <p className="text-xs text-amber-200/80 mt-0.5 leading-snug">
                  {isExpiredLink
                    ? 'Your email link has expired or was already used. Enter your email below and we’ll send a fresh one.'
                    : linkError.message}
                </p>
              </div>
            </div>
            {resendMessage && (
              <p className={`text-xs flex items-center gap-1.5 ${resendState === 'sent' ? 'text-green-400' : 'text-red-300'}`}>
                {resendState === 'sent' && <MailCheck className="w-3.5 h-3.5" />}
                {resendMessage}
              </p>
            )}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendState === 'loading' || resendState === 'sent'}
              className="w-full flex items-center justify-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-50 text-amber-200 font-semibold text-xs py-2 rounded-lg transition-colors"
            >
              {resendState === 'loading' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {resendState === 'sent' ? 'Email sent — check your inbox' : 'Resend confirmation email'}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-900/40 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
              className="w-full px-3 py-2.5 text-sm bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63939] placeholder:text-white/30"
              placeholder="you@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
              className="w-full px-3 py-2.5 text-sm bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63939] placeholder:text-white/30"
              placeholder="••••••••" />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <span
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  remember
                    ? 'bg-[#E63939] border-[#E63939]'
                    : 'border-white/30 group-hover:border-white/50'
                }`}
              >
                {remember && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </span>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="sr-only"
              />
              <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">Remember me</span>
            </label>
            <Link to="/account/forgot-password" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center mt-6">
          <Link to="/" className="text-sm text-white/30 hover:text-white/60">← Back to store</Link>
        </p>
      </div>
    </div>
  )
}
