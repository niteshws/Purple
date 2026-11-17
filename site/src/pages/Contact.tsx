import '../styles/info.css'
import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Breadcrumbs, Field, Img } from '../components/ui'
import { CONTACT } from '../data/site'
import { useMeta, validEmail, validPhone } from '../lib/hooks'

const TOPICS = ['Order or delivery', 'Returns & exchanges', 'Sizing advice', 'Product question', 'Store or gifting', 'Something else']

type Form = { name: string; email: string; phone: string; topic: string; order: string; message: string; consent: boolean }
const EMPTY: Form = { name: '', email: '', phone: '', topic: '', order: '', message: '', consent: false }

function validate(f: Form) {
  const e: Partial<Record<keyof Form, string>> = {}
  if (f.name.trim().length < 2) e.name = 'Please tell us your name.'
  if (!f.email.trim()) e.email = 'Please enter your email address.'
  else if (!validEmail(f.email)) e.email = 'That email doesn’t look quite right — check for a typo.'
  if (f.phone.trim() && !validPhone(f.phone)) e.phone = 'Enter a 10-digit Indian mobile number, e.g. 98765 43210.'
  if (!f.topic) e.topic = 'Choose what your message is about.'
  if (f.order.trim() && !/^[A-Za-z0-9#-]{4,20}$/.test(f.order.trim())) e.order = 'Order numbers use letters and numbers only.'
  if (f.message.trim().length < 10) e.message = 'Please add a little more detail (at least 10 characters).'
  if (!f.consent) e.consent = 'Please confirm we can use these details to reply.'
  return e
}

export default function Contact() {
  useMeta('Contact Us', 'Get in touch with Purple United Kids customer care by phone, email or WhatsApp, or send us a message.')
  const [f, setF] = useState<Form>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({})
  const [touched, setTouched] = useState(false)
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const formRef = useRef<HTMLFormElement>(null)

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    const next = { ...f, [k]: v }
    setF(next)
    if (touched) setErrors(validate(next))
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    const errs = validate(f)
    setErrors(errs)
    const first = Object.keys(errs)[0]
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    setState('loading')
    setTimeout(() => setState('done'), 900)
  }
  const err = (k: keyof Form) => (errors[k] ? { 'aria-invalid': true, 'aria-describedby': `c-${k}-err` } : {})
  const errCount = Object.keys(errors).length

  return (
    <div className="container">
      <div className="page-head">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Contact us' }]} />
        <div className="contact-head__grid">
          <div className="page-head__title">
            <p className="eyebrow">Contact us</p>
            <h1 className="h1">
              We’re here, <em>like a trusted friend.</em>
            </h1>
            <p className="lead">Questions about an order, a size or a gift? Send us a note and our customer care team will get back to you.</p>
          </div>
          <Img src="/img/campaign/wardrobe/contact-boutique.webp" alt="A boutique associate helping a parent choose childrenswear" ratio="3/2" eager />
        </div>
      </div>

      <div className="contact">
        <div className="contact__form-wrap">
          {state === 'done' ? (
            <div className="contact-success" role="status" tabIndex={-1} ref={(el) => el?.focus()}>
              <span className="contact-success__icon">
                <Icon name="check" size={26} />
              </span>
              <h2 className="h3">Thank you, {f.name.trim().split(' ')[0]}.</h2>
              <p className="prose">
                We’ve noted your message about “{f.topic.toLowerCase()}” and would reply to {f.email.trim()} within our working hours ({CONTACT.supportHours}).
              </p>
              <p className="demo-note">Demo: your message was not sent. In the live site this form would reach {CONTACT.email}.</p>
              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => {
                    setF(EMPTY)
                    setErrors({})
                    setTouched(false)
                    setState('idle')
                  }}
                >
                  Send another message
                </button>
                <Link to="/" className="link">
                  Back to shopping
                </Link>
              </div>
            </div>
          ) : (
            <form className="contact-form" onSubmit={submit} noValidate ref={formRef} aria-labelledby="cf-h">
              <h2 id="cf-h" className="h3">
                Send us a message
              </h2>
              {touched && errCount > 0 && (
                <div className="form-alert" role="alert">
                  <Icon name="alert" size={18} />
                  <span>
                    Please check {errCount === 1 ? 'one field' : `${errCount} fields`} below.
                  </span>
                </div>
              )}
              <div className="contact-form__row">
                <Field id="c-name" label="Your name" error={errors.name}>
                  <input id="c-name" name="name" className="input" autoComplete="name" value={f.name} onChange={(e) => set('name', e.target.value)} {...err('name')} />
                </Field>
                <Field id="c-email" label="Email address" error={errors.email}>
                  <input id="c-email" name="email" type="email" className="input" autoComplete="email" value={f.email} onChange={(e) => set('email', e.target.value)} {...err('email')} />
                </Field>
              </div>
              <div className="contact-form__row">
                <Field id="c-phone" label="Mobile number" optional error={errors.phone} hint="So we can call back if it’s quicker">
                  <input id="c-phone" name="phone" type="tel" inputMode="tel" className="input" autoComplete="tel" placeholder="98765 43210" value={f.phone} onChange={(e) => set('phone', e.target.value)} {...err('phone')} />
                </Field>
                <Field id="c-order" label="Order number" optional error={errors.order}>
                  <input id="c-order" name="order" className="input" placeholder="e.g. PU10293" value={f.order} onChange={(e) => set('order', e.target.value)} {...err('order')} />
                </Field>
              </div>
              <Field id="c-topic" label="What is it about?" error={errors.topic}>
                <select id="c-topic" name="topic" className="select" value={f.topic} onChange={(e) => set('topic', e.target.value)} {...err('topic')}>
                  <option value="">Choose a topic</option>
                  {TOPICS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field id="c-message" label="Your message" error={errors.message}>
                <textarea id="c-message" name="message" className="textarea" maxLength={1000} value={f.message} onChange={(e) => set('message', e.target.value)} {...err('message')} />
              </Field>
              <span className="char-count" aria-hidden="true">
                {f.message.length}/1000
              </span>
              <div className="field">
                <label className="checkbox">
                  <input type="checkbox" name="consent" checked={f.consent} onChange={(e) => set('consent', e.target.checked)} {...err('consent')} />
                  <span>I agree that Purple United may use these details to reply to my message.</span>
                </label>
                {errors.consent && (
                  <p className="field__error" id="c-consent-err">
                    <Icon name="alert" size={15} /> {errors.consent}
                  </p>
                )}
              </div>
              <div className="contact-form__foot">
                <span className="demo-note">Demonstration form — nothing is sent.</span>
                <button type="submit" className={`btn${state === 'loading' ? ' is-loading' : ''}`} disabled={state === 'loading'}>
                  Send message <Icon name="arrow" size={18} className="icon-arrow" />
                </button>
              </div>
            </form>
          )}
        </div>

        <aside className="contact__aside" aria-label="Other ways to reach us">
          <div className="svc-card svc-card--plum on-dark">
            <p className="eyebrow">Customer care</p>
            <ul className="svc-list" role="list">
              <li>
                <Icon name="phone" size={20} />
                <span>
                  <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
                  <small>{CONTACT.supportHours}</small>
                </span>
              </li>
              <li>
                <Icon name="mail" size={20} />
                <span>
                  <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                  <small>We reply within working hours</small>
                </span>
              </li>
              <li>
                <Icon name="whatsapp" size={20} />
                <span>
                  <a href={CONTACT.whatsappHref} target="_blank" rel="noreferrer">
                    WhatsApp {CONTACT.whatsapp}
                  </a>
                  <small>Opens WhatsApp · nothing is sent until you press send</small>
                </span>
              </li>
            </ul>
          </div>
          <div className="svc-card">
            <p className="eyebrow">Registered office</p>
            <ul className="svc-list" role="list">
              <li>
                <Icon name="pin" size={20} />
                <span>
                  {CONTACT.company}
                  <small>{CONTACT.companyNote}</small>
                  <small>{CONTACT.address}</small>
                </span>
              </li>
            </ul>
          </div>
          <nav className="quick-links" aria-label="Quick help">
            <Link to="/account/orders">
              Track an order <Icon name="arrow" size={16} />
            </Link>
            <Link to="/help#returns">
              Returns <Icon name="arrow" size={16} />
            </Link>
            <Link to="/stores">
              Find a store <Icon name="arrow" size={16} />
            </Link>
            <Link to="/ask-purple">
              Ask Purple <Icon name="arrow" size={16} />
            </Link>
          </nav>
        </aside>
      </div>
    </div>
  )
}
