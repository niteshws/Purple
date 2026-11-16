import '../../styles/commerce.css'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { Field } from '../../components/ui'
import { useMeta, validEmail } from '../../lib/hooks'
import { AuthLayout } from './Login'

export default function Reset() {
  useMeta('Reset password', 'Reset your Purple United account password.', { canonical: '/account/reset' })
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const [state, setState] = useState<'idle' | 'busy' | 'sent'>('idle')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!validEmail(email)) {
      setErr('Enter the email address you registered with.')
      document.getElementById('rs-email')?.focus()
      return
    }
    setErr('')
    setState('busy')
    setTimeout(() => setState('sent'), 700)
  }
  return (
    <AuthLayout
      image="/img/editorial/baby-knit.webp"
      pos="50% 40%"
      caption={
        <>
          <p className="eyebrow">Purple United</p>
          <p className="signature">Room to grow, stitched in.</p>
        </>
      }
    >
      {state === 'sent' ? (
        <div className="auth__form auth__sent" role="status">
          <span className="empty__icon">
            <Icon name="mail" size={28} strokeWidth={1.3} />
          </span>
          <h1 className="h2">
            Check your <em>inbox.</em>
          </h1>
          <p className="muted">
            If an account exists for <strong>{email}</strong>, a reset link would be on its way. It would expire in 30 minutes.
          </p>
          <p className="demo-note">Demo: no email was sent. Create a new demo account if you’ve forgotten the password.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/account/login" className="btn">
              Back to sign in
            </Link>
            <button type="button" className="btn btn--outline" onClick={() => setState('idle')}>
              Use another email
            </button>
          </div>
        </div>
      ) : (
        <form className="auth__form" onSubmit={submit} noValidate>
          <div>
            <p className="eyebrow">Password help</p>
            <h1 className="h2">
              Reset your <em>password.</em>
            </h1>
          </div>
          <p className="muted">Enter your email and we’ll send you a link to choose a new password.</p>
          <Field id="rs-email" label="Email" error={err}>
            <input
              id="rs-email"
              type="email"
              className="input"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!err || undefined}
              aria-describedby={err ? 'rs-email-err' : undefined}
            />
          </Field>
          <button type="submit" className={`btn btn--block${state === 'busy' ? ' is-loading' : ''}`}>
            Send reset link
          </button>
          <p className="auth__alt">
            Remembered it? <Link to="/account/login">Sign in</Link>
          </p>
          <p className="demo-note">Demonstration flow — no email is sent.</p>
        </form>
      )}
    </AuthLayout>
  )
}
