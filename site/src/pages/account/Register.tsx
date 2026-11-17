import '../../styles/commerce.css'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { Field } from '../../components/ui'
import { useAccount, useUI } from '../../store'
import { useMeta, validEmail } from '../../lib/hooks'
import { AuthLayout, PasswordInput, safeNext } from './Login'

function strength(pw: string) {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) s++
  return pw ? Math.max(1, s) : 0
}
const LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']

export default function Register() {
  useMeta('Create an account', 'Create your Purple United account and join Purple Circle.', { canonical: '/account/register' })
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const register = useAccount((s) => s.register)
  const toast = useUI((s) => s.toast)
  const navigate = useNavigate()
  const [f, setF] = useState({ name: '', email: '', pw: '', pw2: '', marketing: true })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [formErr, setFormErr] = useState('')
  const [busy, setBusy] = useState(false)
  const s = strength(f.pw)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (f.name.trim().length < 2) er.name = 'Enter your full name.'
    if (!validEmail(f.email)) er.email = 'Enter a valid email address.'
    if (f.pw.length < 8) er.pw = 'Use at least 8 characters.'
    if (f.pw2 !== f.pw || !f.pw2) er.pw2 = 'Passwords don’t match.'
    setErrs(er)
    setFormErr('')
    const first = Object.keys(er)[0]
    if (first) return document.getElementById(`rg-${first}`)?.focus()
    setBusy(true)
    setTimeout(() => {
      const r = register({ name: f.name, email: f.email, password: f.pw, marketing: f.marketing })
      setBusy(false)
      if (!r.ok) return setFormErr(r.message ?? 'Could not create account.')
      toast({ title: 'Welcome to Purple United', body: '250 welcome points added (demo).' })
      navigate(next, { replace: true })
    }, 650)
  }
  const inv = (k: string) => ({ 'aria-invalid': !!errs[k] || undefined, 'aria-describedby': errs[k] ? `rg-${k}-err` : undefined })

  return (
    <AuthLayout
      image="/img/campaign/wardrobe/shop-new.webp"
      pos="35% 30%"
      caption={
        <>
          <p className="eyebrow">The Little Originals</p>
          <p className="signature">Born to be their own.</p>
        </>
      }
    >
      <form className="auth__form" onSubmit={submit} noValidate>
        <div>
          <p className="eyebrow">Create an account</p>
          <h1 className="h2">
            Join the <em>Purple family.</em>
          </h1>
        </div>
        <div className="auth__perk">
          <Icon name="crown" size={22} />
          <span>
            You’ll join <strong>Purple Circle</strong> automatically — early access, a birthday surprise and 250 welcome points.{' '}
            <span className="muted">(Proposed programme.)</span>
          </span>
        </div>
        {formErr && (
          <div className="form-error" role="alert">
            <Icon name="alert" size={18} />
            <span>
              {formErr} <Link to="/account/login" className="text-link">Sign in</Link>
            </span>
          </div>
        )}
        <Field id="rg-name" label="Full name" error={errs.name}>
          <input id="rg-name" className="input" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} {...inv('name')} />
        </Field>
        <Field id="rg-email" label="Email" error={errs.email}>
          <input id="rg-email" type="email" className="input" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} {...inv('email')} />
        </Field>
        <Field id="rg-pw" label="Password" error={errs.pw} hint={f.pw ? `Strength: ${LABELS[s]}` : 'At least 8 characters. Mix letters, numbers and a symbol.'}>
          <PasswordInput id="rg-pw" value={f.pw} onChange={(v) => setF({ ...f, pw: v })} invalid={!!errs.pw} describedBy={errs.pw ? 'rg-pw-err' : 'rg-pw-hint'} autoComplete="new-password" />
          <div className="pw-meter" data-s={s} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        </Field>
        <Field id="rg-pw2" label="Confirm password" error={errs.pw2}>
          <PasswordInput id="rg-pw2" value={f.pw2} onChange={(v) => setF({ ...f, pw2: v })} invalid={!!errs.pw2} describedBy={errs.pw2 ? 'rg-pw2-err' : undefined} autoComplete="new-password" />
        </Field>
        <label className="checkbox">
          <input type="checkbox" checked={f.marketing} onChange={(e) => setF({ ...f, marketing: e.target.checked })} />
          <span>Send me new collections, styling stories and member previews.</span>
        </label>
        <button type="submit" className={`btn btn--block${busy ? ' is-loading' : ''}`}>
          Create account
        </button>
        <p className="auth__alt">
          Already have an account? <Link to="/account/login">Sign in</Link>
        </p>
        <p className="demo-note">Demo accounts are stored only in this browser. Please don’t reuse a real password.</p>
      </form>
    </AuthLayout>
  )
}
