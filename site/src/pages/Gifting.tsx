import '../styles/experience.css'
import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Accordion, Breadcrumbs, Field, Img } from '../components/ui'
import { ProductCard } from '../components/ProductCard'
import { products, formatINR, isProductSoldOut } from '../data/products'
import { useCart, useUI } from '../store'
import { useMeta, validEmail } from '../lib/hooks'

const DESIGNS = [
  { k: 'Plum Crest', cls: 'gc--plum', note: 'Royal plum with champagne crest' },
  { k: 'Ivory Bow', cls: 'gc--ivory', note: 'Ivory with a plum signature' },
  { k: 'Rose Milestone', cls: 'gc--rose', note: 'Soft rose for new arrivals' },
]
const AMOUNTS = [1000, 2000, 3000, 5000]

function GiftCardVisual({ design, amount, to, from, message }: { design: string; amount: number; to: string; from: string; message: string }) {
  const d = DESIGNS.find((x) => x.k === design) ?? DESIGNS[0]
  const dark = d.cls === 'gc--plum'
  return (
    <div className="gc-wrap">
    <div className={`gc ${d.cls}`}>
      <div className="gc__top">
        <img src={`/img/brand/crest-mark${dark ? '-reversed' : ''}.png`} alt="" className="gc__mark" />
        <span className="gc__label">Gift card</span>
      </div>
      <p className="gc__line">A little something, made special.</p>
      <div className="gc__bottom">
        <span className="gc__amount">{amount ? formatINR(amount) : '₹—'}</span>
        <span className="gc__to">{to ? `For ${to}` : 'For someone special'}</span>
      </div>
    </div>
      <div className="gc-msg" aria-live="polite">
        <p className="signature">{message ? `“${message}”` : 'Your personal message will appear here.'}</p>
        <p className="gc-msg__from">{from ? `— ${from}` : ''}</p>
      </div>
    </div>
  )
}

function GiftCardBuilder() {
  const today = new Date().toISOString().slice(0, 10)
  const [design, setDesign] = useState(DESIGNS[0].k)
  const [preset, setPreset] = useState<number | 'custom'>(2000)
  const [custom, setCustom] = useState('')
  const [f, setF] = useState({ recipientName: '', recipientEmail: '', senderName: '', message: '', deliveryDate: today })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [added, setAdded] = useState<null | { amount: number; to: string }>(null)
  const addGiftCard = useCart((s) => s.addGiftCard)
  const setCart = useUI((s) => s.setCart)
  const amount = preset === 'custom' ? Number(custom.replace(/\D/g, '')) || 0 : preset
  const set = (k: keyof typeof f, v: string) => {
    setF((x) => ({ ...x, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }))
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (preset === 'custom' && (amount < 500 || amount > 25000)) er.amount = 'Choose an amount between ₹500 and ₹25,000.'
    if (!f.recipientName.trim()) er.recipientName = 'Who is the gift for?'
    if (!validEmail(f.recipientEmail)) er.recipientEmail = 'Enter a valid email address for the recipient.'
    if (!f.senderName.trim()) er.senderName = 'Add your name so they know who it’s from.'
    if (!f.deliveryDate || f.deliveryDate < today) er.deliveryDate = 'Choose today or a future date.'
    setErrors(er)
    const first = Object.keys(er)[0]
    if (first) {
      document.getElementById(first === 'amount' ? 'gc-custom' : `gc-${first}`)?.focus()
      return
    }
    setBusy(true)
    setTimeout(() => {
      addGiftCard({ amount, design, recipientName: f.recipientName.trim(), recipientEmail: f.recipientEmail.trim(), senderName: f.senderName.trim(), message: f.message.trim(), deliveryDate: f.deliveryDate })
      setBusy(false)
      setAdded({ amount, to: f.recipientName.trim() })
      setCart(true)
    }, 600)
  }
  const reset = () => {
    setAdded(null)
    setF({ recipientName: '', recipientEmail: '', senderName: '', message: '', deliveryDate: today })
  }
  return (
    <section className="gcb section" id="gift-card" aria-labelledby="gcb-h">
      <div className="container gcb__grid">
        <div className="gcb__preview">
          <div className="gcb__sticky">
            <GiftCardVisual design={design} amount={amount} to={f.recipientName} from={f.senderName} message={f.message} />
            <p className="muted body-sm gcb__preview-note">
              <Icon name="mail" size={16} /> Delivered by email on{' '}
              {f.deliveryDate ? new Date(f.deliveryDate + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'your chosen date'}. Redeemable online and in store.
            </p>
          </div>
        </div>
        <div className="gcb__form-wrap">
          <p className="eyebrow">Purple gift card</p>
          <h2 id="gcb-h" className="h2">
            Let them <em>choose.</em>
          </h2>
          <p className="muted">The right size, at the right time — online or in any of our stores.</p>
          {added ? (
            <div className="gcb__done" role="status">
              <span className="tryon-done__icon">
                <Icon name="gift" size={26} />
              </span>
              <h3 className="h3">Added to your bag.</h3>
              <p>
                A {formatINR(added.amount)} gift card for {added.to} is waiting in your bag. Complete checkout to send it.
              </p>
              <div className="gcb__done-actions">
                <button type="button" className="btn" onClick={() => setCart(true)}>
                  View bag
                </button>
                <button type="button" className="link" onClick={reset}>
                  Create another gift card
                </button>
              </div>
              <p className="demo-note">Demo flow — no email is sent and no real gift card is issued.</p>
            </div>
          ) : (
            <form className="gcb__form" onSubmit={submit} noValidate>
              <fieldset>
                <legend className="field__label">1 · Choose a design</legend>
                <div className="gcb__designs">
                  {DESIGNS.map((d) => (
                    <label key={d.k} className={`gcb__design${design === d.k ? ' is-on' : ''}`}>
                      <input type="radio" name="gc-design" value={d.k} checked={design === d.k} onChange={() => setDesign(d.k)} className="sr-only" />
                      <span className={`gcb__swatch ${d.cls}`} aria-hidden="true" />
                      <span className="gcb__design-name">{d.k}</span>
                      <span className="sr-only">{d.note}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="field__label">2 · Choose an amount</legend>
                <div className="gcb__amounts">
                  {AMOUNTS.map((a) => (
                    <button key={a} type="button" className={`chip${preset === a ? ' is-active' : ''}`} aria-pressed={preset === a} onClick={() => { setPreset(a); setErrors((e) => ({ ...e, amount: '' })) }}>
                      {formatINR(a)}
                    </button>
                  ))}
                  <button type="button" className={`chip${preset === 'custom' ? ' is-active' : ''}`} aria-pressed={preset === 'custom'} onClick={() => { setPreset('custom'); setTimeout(() => document.getElementById('gc-custom')?.focus(), 20) }}>
                    Other amount
                  </button>
                </div>
                {preset === 'custom' && (
                  <div className="gcb__custom">
                    <Field id="gc-custom" label="Amount (₹500 – ₹25,000)" error={errors.amount}>
                      <input
                        id="gc-custom"
                        className="input"
                        inputMode="numeric"
                        value={custom}
                        onChange={(e) => { setCustom(e.target.value.replace(/[^\d]/g, '').slice(0, 5)); setErrors((er) => ({ ...er, amount: '' })) }}
                        placeholder="e.g. 2500"
                        aria-invalid={!!errors.amount}
                        aria-describedby={errors.amount ? 'gc-custom-err' : undefined}
                      />
                    </Field>
                  </div>
                )}
              </fieldset>
              <fieldset>
                <legend className="field__label">3 · Who is it for?</legend>
                <div className="gcb__two">
                  <Field id="gc-recipientName" label="Recipient’s name" error={errors.recipientName}>
                    <input id="gc-recipientName" className="input" value={f.recipientName} onChange={(e) => set('recipientName', e.target.value)} aria-invalid={!!errors.recipientName} aria-describedby={errors.recipientName ? 'gc-recipientName-err' : undefined} />
                  </Field>
                  <Field id="gc-recipientEmail" label="Recipient’s email" error={errors.recipientEmail}>
                    <input id="gc-recipientEmail" type="email" className="input" value={f.recipientEmail} onChange={(e) => set('recipientEmail', e.target.value)} aria-invalid={!!errors.recipientEmail} aria-describedby={errors.recipientEmail ? 'gc-recipientEmail-err' : undefined} />
                  </Field>
                  <Field id="gc-senderName" label="From" error={errors.senderName}>
                    <input id="gc-senderName" className="input" value={f.senderName} onChange={(e) => set('senderName', e.target.value)} autoComplete="name" aria-invalid={!!errors.senderName} aria-describedby={errors.senderName ? 'gc-senderName-err' : undefined} />
                  </Field>
                  <Field id="gc-deliveryDate" label="Delivery date" error={errors.deliveryDate}>
                    <input id="gc-deliveryDate" type="date" min={today} className="input" value={f.deliveryDate} onChange={(e) => set('deliveryDate', e.target.value)} aria-invalid={!!errors.deliveryDate} aria-describedby={errors.deliveryDate ? 'gc-deliveryDate-err' : undefined} />
                  </Field>
                </div>
                <Field id="gc-message" label="Personal message" optional hint={`${250 - f.message.length} characters left`}>
                  <textarea id="gc-message" className="textarea" rows={3} maxLength={250} value={f.message} onChange={(e) => set('message', e.target.value)} placeholder="Happy first birthday, little one…" aria-describedby="gc-message-hint" />
                </Field>
              </fieldset>
              <div className="gcb__submit">
                <span className="gcb__total">{amount ? formatINR(amount) : '₹—'}</span>
                <button type="submit" className={`btn${busy ? ' is-loading' : ''}`}>
                  <Icon name="bag" size={18} /> Add gift card to bag
                </button>
              </div>
              <p className="demo-note">Demo flow — gift cards are simulated; no email is sent and no card is issued.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

const BUDGETS = [
  { k: 'u1000', label: 'Under ₹1,000', test: (p: number) => p < 1000 },
  { k: 'u2000', label: 'Under ₹2,000', test: (p: number) => p >= 1000 && p < 2000 },
  { k: 'special', label: 'Something special', test: (p: number) => p >= 2000 },
]

export default function Gifting() {
  useMeta('Gifting & gift cards', 'Purple United gift cards and gift ideas for birthdays, baby showers and every celebration — beautifully packaged.')
  const [budget, setBudget] = useState(BUDGETS[0].k)
  const ideas = useMemo(() => {
    const b = BUDGETS.find((x) => x.k === budget)!
    return products.filter((p) => b.test(p.price) && !isProductSoldOut(p)).sort((a, b2) => b2.popularity - a.popularity).slice(0, 4)
  }, [budget])
  return (
    <div className="gifting-page">
      <section className="gift-hero">
        <div className="gift-hero__text">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Gifting' }]} />
          <p className="eyebrow">Gifting</p>
          <h1 className="display">
            The joy of <em>giving.</em>
          </h1>
          <p className="lead">For birthdays, baby showers, naming ceremonies and every “just because” — gifts that feel like Purple from the moment the ribbon comes off.</p>
          <div className="gift-hero__ctas">
            <a href="#gift-card" className="btn">
              Send a gift card <Icon name="arrow" size={18} className="icon-arrow" />
            </a>
            <a href="#gift-ideas" className="link">
              Gift ideas by budget
            </a>
          </div>
        </div>
        <div className="gift-hero__media">
          <Img src="/img/brand/packaging-hero.webp" alt="Plum and ivory Purple United gift boxes with tissue paper and a lilac knit sweater" eager />
          <p className="signature gift-hero__quote">“Handle with joy.”</p>
        </div>
      </section>

      <GiftCardBuilder />

      <section className="section bg-paper" id="gift-ideas" aria-labelledby="ideas-h">
        <div className="container">
          <div className="section-head">
            <div className="section-head__text">
              <p className="eyebrow">Gift ideas</p>
              <h2 id="ideas-h" className="h2">
                Chosen with <em>care.</em>
              </h2>
            </div>
            <div className="chips" role="tablist" aria-label="Budget">
              {BUDGETS.map((b) => (
                <button key={b.k} type="button" role="tab" aria-selected={budget === b.k} className={`chip${budget === b.k ? ' is-active' : ''}`} onClick={() => setBudget(b.k)}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
          <div className="pgrid" role="tabpanel" aria-live="polite">
            {ideas.map((p) => (
              <ProductCard key={p.handle} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="section gift-pack" aria-labelledby="pack-h">
        <div className="container gift-pack__grid">
          <div className="gift-pack__media">
            <Img src="/img/brand/gift-box.webp" alt="A plum Purple United gift box tied with an ivory satin ribbon" ratio="796/585" />
            <Img src="/img/brand/shipping-box.webp" alt="A kraft shipping carton with plum Purple United tape" ratio="1600/915" className="gift-pack__second" />
          </div>
          <div className="gift-pack__text">
            <p className="eyebrow">
              The unboxing <span className="tag tag--gold">Concept</span>
            </p>
            <h2 id="pack-h" className="h2">
              Even the box <em>says Purple.</em>
            </h2>
            <ol role="list" className="gift-pack__list">
              <li>
                <span>01</span>
                <div>
                  <h3 className="h4">A plum gift box</h3>
                  <p className="muted">Crest-embossed, tied with an ivory satin ribbon — made to be kept.</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <h3 className="h4">Ivory tissue & a handwritten card</h3>
                  <p className="muted">Your message, written in our signature script.</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <h3 className="h4">“Handle with joy”</h3>
                  <p className="muted">A small smile on the carton, before the unboxing even begins.</p>
                </div>
              </li>
            </ol>
            <p className="demo-note">Packaging shown is the proposed identity from the PixelCrayons brand proposal.</p>
          </div>
        </div>
      </section>

      <section className="section bg-oat" aria-labelledby="gfaq-h">
        <div className="container container--text">
          <p className="eyebrow">Questions</p>
          <h2 id="gfaq-h" className="h2" style={{ marginBottom: 24 }}>
            Gifting, <em>answered.</em>
          </h2>
          <Accordion
            items={[
              { title: 'How is the gift card delivered?', body: <p>By email to the recipient on the date you choose, with your personal message. In this demonstration no email is sent.</p> },
              { title: 'Where can it be used?', body: <p>Gift cards are designed to be redeemed online and in Purple United stores. Final redemption rules will be confirmed with Purple United.</p> },
              { title: 'Can I add gift packaging to an order?', body: <p>Gift packaging is part of the proposed relaunch experience. Ask in store for gifting help today.</p> },
              { title: 'What if the size isn’t right?', body: <p>Unused items with tags intact can be returned or exchanged within 7 days of delivery. Size mismatches are eligible for a free replacement (conditions apply).</p> },
            ]}
          />
          <p style={{ marginTop: 24 }}>
            <Link to="/help#returns" className="link">
              Returns & exchanges <Icon name="arrow" size={14} className="icon-arrow" />
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
