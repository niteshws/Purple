import { useState, useRef, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import { Crest } from './ui'
import { CONTACT, STORE_COUNT } from '../data/site'
import { validEmail, useDialog } from '../lib/hooks'
import { AppearanceSegmented } from './Appearance'
import { HomeDesignSwitch } from './HomeDesignSwitch'

export function Newsletter({ tone = 'dark', compact }: { tone?: 'dark' | 'light'; compact?: boolean }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'error' | 'loading' | 'done'>('idle')
  const [consent, setConsent] = useState(true)
  const doneRef = useRef<HTMLDivElement>(null)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!validEmail(email)) {
      // Put focus on the field so its error is announced (WCAG 3.3.1).
      setState('error')
      setTimeout(() => document.getElementById(`nl-${tone}`)?.focus(), 20)
      return
    }
    // The form is replaced by the confirmation, so move focus there (WCAG 2.4.3).
    const hadFocus = (e.currentTarget as HTMLElement).contains(document.activeElement)
    setState('loading')
    setTimeout(() => {
      setState('done')
      if (hadFocus) setTimeout(() => doneRef.current?.focus(), 20)
    }, 700)
  }
  if (state === 'done')
    return (
      <div className="newsletter newsletter--done" role="status" ref={doneRef} tabIndex={-1}>
        <Icon name="check" />
        <p>
          <strong>You’re on the list.</strong> Look out for one beautiful story per send — never a flood. <span className="demo-note">Demo: no email was sent.</span>
        </p>
      </div>
    )
  return (
    <form className={`newsletter newsletter--${tone}${compact ? ' newsletter--compact' : ''}`} onSubmit={submit} noValidate>
      <label htmlFor={`nl-${tone}`} className="sr-only">
        Email address
      </label>
      <div className="newsletter__row">
        <input
          id={`nl-${tone}`}
          type="email"
          className="input"
          placeholder="Your email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (state === 'error') setState('idle')
          }}
          aria-invalid={state === 'error'}
          aria-describedby={state === 'error' ? `nl-${tone}-err` : undefined}
          autoComplete="email"
        />
        <button className={`btn ${tone === 'dark' ? 'btn--ivory' : ''}${state === 'loading' ? ' is-loading' : ''}`} type="submit">
          Subscribe
        </button>
      </div>
      {state === 'error' && (
        <p className="field__error" id={`nl-${tone}-err`}>
          <Icon name="alert" size={15} /> Please enter a valid email address.
        </p>
      )}
      {!compact && (
        <label className="checkbox newsletter__consent">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>Send me new collections, styling stories and member previews. Unsubscribe anytime.</span>
        </label>
      )}
    </form>
  )
}

const COLS = [
  {
    title: 'Shop',
    links: [
      ['New arrivals', '/collections/new-arrivals'],
      ['Boys', '/collections/boys'],
      ['Girls', '/collections/girls'],
      ['Infants', '/collections/infants'],
      ['Footwear & accessories', '/collections/footwear-accessories'],
      ['The Winter Edit', '/collections/winter-edit'],
      ['Gift cards', '/gifting'],
    ],
  },
  {
    title: 'Help',
    links: [
      ['Contact us', '/contact'],
      ['Shipping & delivery', '/help#shipping'],
      ['Returns & exchanges', '/help#returns'],
      ['FAQs', '/help#faq'],
      ['Track an order', '/account/orders'],
      ['Size guide', '/help#sizing'],
    ],
  },
  {
    title: 'Purple United',
    links: [
      ['Our story', '/about'],
      ['Our craft', '/craft'],
      ['The Journal', '/journal'],
      ['Purple Circle', '/purple-circle'],
      ['Ask Purple stylist', '/ask-purple'],
      ['Store locator', '/stores'],
    ],
  },
]

export function Footer() {
  return (
    <footer className="site-footer on-dark">
      <div className="container">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <Crest variant="lockup" tone="dark" className="site-footer__crest" />
            <p className="signature site-footer__sig">Fashion for their next chapter.</p>
          </div>
          <div className="site-footer__news">
            <p className="eyebrow">The Purple letter</p>
            <h2 className="h3">One beautiful story per send.</h2>
            <Newsletter />
          </div>
        </div>
        <div className="site-footer__grid">
          {COLS.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <p className="eyebrow">{c.title}</p>
              <ul role="list">
                {c.links.map(([l, to]) => (
                  <li key={l}>
                    <Link to={to}>{l}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div className="site-footer__contact">
            <p className="eyebrow">Talk to us</p>
            <ul role="list">
              <li>
                <a href={CONTACT.phoneHref}>
                  <Icon name="phone" size={17} /> {CONTACT.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`}>
                  <Icon name="mail" size={17} /> {CONTACT.email}
                </a>
              </li>
              <li>
                <Link to="/stores">
                  <Icon name="store" size={17} /> {STORE_COUNT} stores across India
                </Link>
              </li>
            </ul>
            <div className="site-footer__social">
              <a href={CONTACT.instagram} target="_blank" rel="noreferrer" className="icon-btn" aria-label="Purple United on Instagram (opens in new tab)">
                <Icon name="instagram" />
              </a>
              <a href={CONTACT.facebook} target="_blank" rel="noreferrer" className="icon-btn" aria-label="Purple United on Facebook (opens in new tab)">
                <Icon name="facebook" />
              </a>
              <a href={CONTACT.linkedin} target="_blank" rel="noreferrer" className="icon-btn" aria-label="Purple United on LinkedIn (opens in new tab)">
                <Icon name="linkedin" />
              </a>
            </div>
          </div>
        </div>
        <div className="site-footer__pay">
          <span>
            <Icon name="lock" size={16} /> Secure checkout
          </span>
          <span>
            <Icon name="upi" size={16} /> UPI
          </span>
          <span>
            <Icon name="card" size={16} /> Cards & net banking
          </span>
          <span>
            <Icon name="return" size={16} /> 7-day returns & exchanges
          </span>
        </div>
        <div className="site-footer__legal">
          <p>
            © 2026 {CONTACT.company}. {CONTACT.address}.
          </p>
          <p className="site-footer__concept">
            Redesign concept by PixelCrayons for Purple United · Demonstration prototype — no real orders or payments are processed.
          </p>
          <div className="site-footer__appearance">
            <AppearanceSegmented tone="dark" />
            <HomeDesignSwitch />
          </div>
          <nav aria-label="Legal" className="site-footer__legal-links">
            <Link to="/help#returns">Returns policy</Link>
            <Link to="/help#privacy">Privacy</Link>
            <Link to="/help#terms">Terms</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

/* WhatsApp concierge — conceptual entry point (proposal p.30). Uses Purple United’s published
   WhatsApp number; nothing is sent until the customer presses send inside WhatsApp. */
const TOPICS = [
  { icon: 'box', label: 'Order updates', msg: 'Hi Purple United, I’d like an update on my order. My order ID is: ' },
  { icon: 'ruler', label: 'Size assistance', msg: 'Hi Purple United, could you help me choose a size? My child is __ years old and __ cm tall.' },
  { icon: 'sparkle', label: 'New arrivals', msg: 'Hi Purple United, what’s new this season for a __ year old?' },
  { icon: 'store', label: 'Store information', msg: 'Hi Purple United, which store is nearest to me? I’m in: ' },
  { icon: 'chat', label: 'Shopping support', msg: 'Hi Purple United, I need some help with: ' },
] as const

export function Concierge() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useDialog(open, ref, () => setOpen(false))
  return (
    <div className={`concierge${open ? ' is-open' : ''}`}>
      {open && (
        <div className="concierge__panel" ref={ref} role="dialog" aria-modal="true" aria-label="WhatsApp concierge">
          <div className="concierge__head">
            <Crest variant="mark" tone="dark" className="concierge__mark" />
            <div>
              <p className="concierge__title">Purple Concierge</p>
              <p className="concierge__sub">On WhatsApp · {CONTACT.supportHours.replace('Monday to Saturday', 'Mon–Sat')}</p>
            </div>
            <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close concierge">
              <Icon name="close" />
            </button>
          </div>
          <div className="concierge__body">
            <p className="concierge__bubble">Hello! How can we help today? Choose a topic and we’ll open WhatsApp with a message ready for you to edit and send.</p>
            <ul role="list">
              {TOPICS.map((t) => (
                <li key={t.label}>
                  <a href={`${CONTACT.whatsappHref}?text=${encodeURIComponent(t.msg)}`} target="_blank" rel="noreferrer">
                    <Icon name={t.icon} size={18} /> {t.label}
                    <Icon name="arrow" size={16} />
                  </a>
                </li>
              ))}
            </ul>
            <p className="demo-note">Concept · opens WhatsApp ({CONTACT.whatsapp}). Nothing is sent until you press send.</p>
          </div>
        </div>
      )}
      <button type="button" className="concierge__fab" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? 'Close WhatsApp concierge' : 'Open WhatsApp concierge'}>
        <Icon name={open ? 'close' : 'whatsapp'} size={24} />
        <span className="concierge__fab-label">Concierge</span>
      </button>
    </div>
  )
}
