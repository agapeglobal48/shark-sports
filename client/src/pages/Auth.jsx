import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useSeo } from '../hooks/useSeo.js'
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'
import { HERO_VIDEO, LOGO } from '../config.js'
import { useAuth } from '../context/AuthContext.jsx'
import { SplitLines } from '../components/motion.jsx'

export function Login() {
  return <AuthPage mode="login" />
}

export function Register() {
  return <AuthPage mode="register" />
}

function AuthPage({ mode }) {
  const isLogin = mode === 'login'
  const { user, ready, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/account'

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPw, setShowPw] = useState(false)

  useSeo({ title: isLogin ? 'Log in' : 'Create account', noindex: true })

  if (ready && user) return <Navigate to={redirectTo} replace />

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: undefined }))
  }

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setMessage('')
    setErrors({})
    try {
      if (isLogin) await login(form.email, form.password)
      else await register(form.name, form.email, form.password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setErrors(err.errors || {})
      setMessage(Object.keys(err.errors || {}).length ? '' : err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Visual side */}
      <div className="relative hidden overflow-hidden lg:block">
        <video src={HERO_VIDEO.desktop} poster={HERO_VIDEO.poster} autoPlay muted loop playsInline aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/40 to-ink/70" />
        <div className="relative flex h-full flex-col justify-end p-14 pb-20">
          <img src={LOGO} alt="" className="mb-10 w-48" />
          <h2 className="font-display text-8xl uppercase leading-[0.88]">
            <SplitLines lines={isLogin ? ['Welcome', <span key="b" className="text-blaze">back.</span>] : ['Join the', <span key="p" className="text-blaze">pack.</span>]} delay={0.2} />
          </h2>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-4 pb-16 pt-28 sm:px-6">
        <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <p className="eyebrow mb-3">{isLogin ? 'Log in' : 'Create account'}</p>
          <h1 className="font-display text-5xl uppercase md:text-6xl">{isLogin ? 'Good to see you' : 'Get started'}</h1>
          <p className="mt-3 text-mute">
            {isLogin ? 'New here? ' : 'Already have an account? '}
            <Link to={isLogin ? '/register' : '/login'} state={location.state} className="link-sweep font-bold text-bone">
              {isLogin ? 'Create an account' : 'Log in'}
            </Link>
          </p>

          <form onSubmit={submit} className="mt-10 space-y-5" noValidate>
            {!isLogin && <Field label="Full name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />}
            <Field label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
            <Field
              label="Password"
              type={showPw ? 'text' : 'password'}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={form.password}
              onChange={set('password')}
              error={errors.password}
              hint={!isLogin && 'At least 8 characters, with a letter and a number.'}
              suffix={
                <button type="button" onClick={() => setShowPw((s) => !s)} className="p-1 text-mute hover:text-bone" aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            {message && (
              <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-blaze/40 bg-blaze/10 px-4 py-3 text-sm text-blaze" role="alert">
                {message}
              </motion.p>
            )}

            <button type="submit" disabled={busy} className="btn btn-primary group w-full">
              {busy ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? 'Log in' : 'Create account'}
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

function Field({ label, error, hint, suffix, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-mute">{label}</span>
      <span className="relative flex items-center">
        <input {...props} className={`input ${suffix ? 'pr-12' : ''} ${error ? 'border-blaze' : ''}`} aria-invalid={!!error} />
        {suffix && <span className="absolute right-3">{suffix}</span>}
      </span>
      {error ? (
        <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 block text-sm text-blaze">
          {error}
        </motion.span>
      ) : (
        hint && <span className="mt-2 block text-xs text-mute">{hint}</span>
      )}
    </label>
  )
}
