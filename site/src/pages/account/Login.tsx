import '../../styles/commerce.css'
import { useState, type ReactNode, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { Field, Img } from '../../components/ui'
import { useAccount, useUI } from '../../store'
import { useMeta, validEmail } from '../../lib/hooks'

export function AuthLayout({ image, pos, caption, children }: { image: string; pos?: string; caption: ReactNode; children: ReactNode }) {
  return (
    <div className="auth">
      <div className="auth__media">
        <Img src={image} alt="" pos={pos} eager />
        <div className="auth__media-caption">{caption}</div>
      </div>
      <div className="auth__panel">{children}</div>
    </div>
  )
}

export function PasswordInput({ id, value, onChange, invalid, describedBy, autoComplete }: { id: string; value: string; onChange: (v: string) => void; invalid?: boolean; describedBy?: string; autoComplete: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="pw-wrap">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        autoComplete={autoComplete}
      />
      <button type="button" className="pw-toggle" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}

export const safeNext = (n: string | null) => (n && n.startsWith('/') && !n.startsWith('//') ? n : '/account')

export default function Login() {
  useMeta('Sign in', 'Sign in to your Purple United account.', { canonical: '/account/login' })
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const login = useAccount((s) => s.login)
  const toast = useUI((s) => s.toast)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [formErr, setFormErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (!validEmail(email)) er.email = 'Enter a valid email address.'
    if (!pw) er.pw = 'Enter your password.'
    setErrs(er)
    setFormErr('')
    if (Object.keys(er).length) return document.getElementById(er.email ? 'li-email' : 'li-pw')?.focus()
    setBusy(true)
    setTimeout(() => {
      const r = login(email, pw)
      setBusy(false)
      if (!r.ok) {
        setFormErr(r.message ?? 'Sign in failed.')
        return
      }
      toast({ title: 'Welcome back', body: 'You’re signed in.' })
      navigate(next, { replace: true })
    }, 550)
  }

  return (
    <AuthLayout
      image="/img/campaign/wardrobe/story-hero.webp"
      pos="40% 30%"
      caption={
        <>
          <p className="eyebrow">Purple United</p>
          <p className="signature">Made for every version of them.</p>
        </>
      }
    >
      <form className="auth__form" onSubmit={submit} noValidate>
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="h2">
            Welcome <em>back.</em>
          </h1>
        </div>
        {formErr && (
          <div className="form-error" role="alert">
            <Icon name="alert" size={18} /> {formErr}
          </div>
        )}
        <Field id="li-email" label="Email" error={errs.email}>
          <input
            id="li-email"
            type="email"
            className="input"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errs.email || undefined}
            aria-describedby={errs.email ? 'li-email-err' : undefined}
          />
        </Field>
        <Field id="li-pw" label="Password" error={errs.pw}>
          <PasswordInput id="li-pw" value={pw} onChange={setPw} invalid={!!errs.pw} describedBy={errs.pw ? 'li-pw-err' : undefined} autoComplete="current-password" />
        </Field>
        <div className="auth__row">
          <span />
          <Link to="/account/reset" className="text-link body-sm">
            Forgot password?
          </Link>
        </div>
        <button type="submit" className={`btn btn--block${busy ? ' is-loading' : ''}`}>
          Sign in
        </button>
        <p className="auth__alt">
          New to Purple United? <Link to={`/account/register${next !== '/account' ? `?next=${encodeURIComponent(next)}` : ''}`}>Create an account</Link>
        </p>
        <p className="demo-note">Demo accounts are stored only in this browser. Please don’t reuse a real password.</p>
      </form>
    </AuthLayout>
  )
}
