import '../styles/commerce.css'
import { useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Crest, EmptyState, Field } from '../components/ui'
import { getProduct, formatINR } from '../data/products'
import { useAccount, useCart, useCurrentUser, cartTotals, linePrice, GIFT_CARD_HANDLE, FREE_SHIPPING_FROM, STANDARD_SHIPPING_FEE, type Address, type Order, type OrderLine } from '../store'
import { useMeta, validEmail, validPhone, validPincode } from '../lib/hooks'
import { DiscountForm, GIFT_NOTE_KEY, readGiftNote } from './Cart'

const NO_ADDRESSES: Address[] = []

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jammu & Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]
const BANKS = ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra Bank', 'Other bank']
const TEST_CARD = '4242 4242 4242 4242'
const EXPRESS_FEE = 149 // demonstration rate

type Errors = Record<string, string>
type Ship = 'standard' | 'express'
type Pay = 'upi' | 'card' | 'netbanking' | 'cod'

const STEPS = ['Contact', 'Delivery', 'Shipping', 'Payment', 'Review'] as const

function focusFirst(errs: Errors) {
  const first = Object.keys(errs)[0]
  if (first) setTimeout(() => document.getElementById(`co-${first}`)?.focus(), 20)
}

export default function Checkout() {
  useMeta('Checkout', 'Secure checkout — Purple United Kids (demonstration).', { canonical: '/checkout' })
  const navigate = useNavigate()
  const lines = useCart((s) => s.lines)
  const discount = useCart((s) => s.discount)
  const clearCart = useCart((s) => s.clear)
  const user = useCurrentUser()
  const current = useAccount((s) => s.current)
  const saved = useAccount((s) => (s.current ? s.addresses[s.current] : undefined)) ?? NO_ADDRESSES
  const saveAddress = useAccount((s) => s.saveAddress)
  const placeOrder = useAccount((s) => s.placeOrder)

  const [step, setStep] = useState(0)
  const [maxStep, setMaxStep] = useState(0)
  const [errors, setErrors] = useState<Errors>({})
  const [processing, setProcessing] = useState(false)

  const [contact, setContact] = useState({ email: user?.email ?? '', phone: user?.phone ?? '', updates: true })
  const def = saved.find((a) => a.isDefault) ?? saved[0]
  const [addrChoice, setAddrChoice] = useState<string>(def ? def.id : 'new')
  const [addr, setAddr] = useState({ name: user?.name ?? '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' })
  const [saveAddr, setSaveAddr] = useState(true)
  const [ship, setShip] = useState<Ship>('standard')
  const [pay, setPay] = useState<Pay>('upi')
  const [upi, setUpi] = useState('')
  const [card, setCard] = useState({ number: TEST_CARD, name: user?.name ?? '', exp: '12/30', cvc: '123' })
  const [bank, setBank] = useState('')
  const [agree, setAgree] = useState(false)

  const subtotal = cartTotals(lines, discount).subtotal
  const standardFee = subtotal >= FREE_SHIPPING_FROM ? 0 : STANDARD_SHIPPING_FEE
  const shipFee = ship === 'express' ? EXPRESS_FEE : standardFee
  const t = cartTotals(lines, discount, shipFee)
  const hasPhysical = lines.some((l) => l.handle !== GIFT_CARD_HANDLE)

  const chosenAddress: Omit<Address, 'id' | 'label'> = useMemo(() => {
    const a = addrChoice !== 'new' ? saved.find((x) => x.id === addrChoice) : undefined
    return a ? { name: a.name, phone: a.phone, line1: a.line1, line2: a.line2, city: a.city, state: a.state, pincode: a.pincode } : addr
  }, [addrChoice, saved, addr])

  if (!lines.length && !processing)
    return (
      <div className="container cm-page">
        <EmptyState
          headingLevel={1}
          icon="bag"
          title="Your bag is empty"
          body="Add a few pieces before checking out."
          action={
            <Link to="/collections/new-arrivals" className="btn">
              Shop new arrivals
            </Link>
          }
        />
      </div>
    )

  const validate = (i: number): Errors => {
    const e: Errors = {}
    if (i === 0) {
      if (!validEmail(contact.email)) e.email = 'Enter a valid email address, like name@example.com.'
      if (!validPhone(contact.phone)) e.phone = 'Enter a valid 10-digit Indian mobile number.'
    }
    if (i === 1 && addrChoice === 'new') {
      if (addr.name.trim().length < 2) e.name = 'Enter the recipient’s full name.'
      if (!validPhone(addr.phone)) e.aphone = 'Enter a valid 10-digit mobile number for delivery updates.'
      if (addr.line1.trim().length < 5) e.line1 = 'Enter the house number, building and street.'
      if (addr.city.trim().length < 2) e.city = 'Enter the city.'
      if (!addr.state) e.state = 'Choose a state.'
      if (!validPincode(addr.pincode)) e.pincode = 'Enter a valid 6-digit pincode.'
    }
    if (i === 3) {
      if (pay === 'upi' && !/^[\w.-]{2,}@[a-z]{2,}$/i.test(upi.trim())) e.upi = 'Enter a UPI ID in the format name@bank.'
      if (pay === 'card') {
        if (card.number.replace(/\s/g, '') !== TEST_CARD.replace(/\s/g, '')) e.card = `Demo mode accepts only the test number ${TEST_CARD}.`
        if (card.name.trim().length < 2) e.cname = 'Enter the name on the card.'
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.exp)) e.exp = 'Use MM/YY.'
        if (!/^\d{3}$/.test(card.cvc)) e.cvc = 'Enter 3 digits.'
      }
      if (pay === 'netbanking' && !bank) e.bank = 'Choose your bank.'
    }
    if (i === 4 && !agree) e.agree = 'Please confirm you’ve read the returns policy.'
    return e
  }

  // Open a step and move keyboard / screen-reader focus to its heading, so nobody is
  // left on <body> when the previous step's controls unmount (WCAG 2.4.3).
  const goStep = (n: number) => {
    setStep(n)
    setTimeout(() => {
      const h = document.getElementById(`co-h-${n}`)
      if (!h) return
      h.focus({ preventScroll: true })
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      document.getElementById(`co-step-${n}`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    }, 60)
  }

  const next = (i: number) => {
    const e = validate(i)
    setErrors(e)
    if (Object.keys(e).length) return focusFirst(e)
    // Don't make people type the same mobile number twice (WCAG 3.3.7).
    if (i === 0 && !addr.phone) setAddr((a) => ({ ...a, phone: contact.phone }))
    if (i === 1 && addrChoice === 'new' && current && saveAddr) {
      saveAddress({ id: `a${Date.now()}`, label: saved.length ? 'Address' : 'Home', ...addr, isDefault: !saved.length })
    }
    const n = i + 1
    setMaxStep((m) => Math.max(m, n))
    goStep(n)
  }

  const place = () => {
    for (let i = 0; i <= 4; i++) {
      const e = validate(i)
      if (Object.keys(e).length) {
        setErrors(e)
        setStep(i)
        return focusFirst(e)
      }
    }
    setErrors({})
    setProcessing(true)
    const id = `PU-${Math.floor(100000 + Math.random() * 900000)}`
    const olines: OrderLine[] = lines.map((l) => {
      if (l.handle === GIFT_CARD_HANDLE)
        return { handle: l.handle, name: 'Purple United Gift Card', color: l.color, size: l.size, qty: l.qty, price: linePrice(l), image: '/img/brand/gift-card.webp', gift: l.gift }
      const p = getProduct(l.handle)
      return {
        handle: l.handle,
        name: p?.name ?? l.handle,
        color: l.color,
        size: l.size,
        qty: l.qty,
        price: linePrice(l),
        image: p?.colors.find((c) => c.name === l.color)?.images[0] ?? '',
      }
    })
    const order: Order = {
      id,
      email: contact.email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
      lines: olines,
      subtotal: t.subtotal,
      discount: t.discountAmt,
      shipping: t.shipping,
      total: t.total,
      shippingMethod: ship === 'express' ? 'Express delivery (1–3 business days)' : 'Standard delivery (3–7 business days)',
      payment: { upi: 'UPI', card: 'Card ending 4242 (test)', netbanking: `Net banking · ${bank}`, cod: 'Cash on delivery' }[pay],
      address: hasPhysical ? chosenAddress : { name: '', phone: '', line1: '', city: '', state: '', pincode: '' },
      status: 'Confirmed',
    }
    setTimeout(() => {
      placeOrder(order)
      try {
        sessionStorage.removeItem(GIFT_NOTE_KEY)
      } catch {
        /* ignore */
      }
      navigate(`/checkout/confirmation/${id}`, { replace: true })
      clearCart()
    }, 1700)
  }

  const err = (k: string) => errors[k]
  const inv = (k: string) => ({ 'aria-invalid': !!errors[k] || undefined, 'aria-describedby': errors[k] ? `co-${k}-err` : undefined })
  const clr = (k: string) => errors[k] && setErrors((x) => ({ ...x, [k]: '' }))

  const summaries = [
    `${contact.email} · ${contact.phone}`,
    hasPhysical ? `${chosenAddress.name}, ${chosenAddress.line1}, ${chosenAddress.city} ${chosenAddress.pincode}` : 'Digital delivery only',
    ship === 'express' ? `Express · ${formatINR(EXPRESS_FEE)}` : `Standard · ${standardFee === 0 ? 'Free' : formatINR(standardFee)}`,
    { upi: `UPI · ${upi}`, card: 'Card ending 4242 (test)', netbanking: `Net banking · ${bank}`, cod: 'Cash on delivery' }[pay],
    '',
  ]

  const Step = ({ i, children }: { i: number; children: ReactNode }) => {
    const done = i !== step && i < Math.max(step, maxStep)
    return (
      <section className={`co-step${step === i ? ' is-current' : done ? ' is-done' : ''}`} id={`co-step-${i}`} aria-labelledby={`co-h-${i}`}>
        <div className="co-step__head">
          <span className="co-step__num">{done ? <Icon name="check" size={16} /> : i + 1}</span>
          <div className="co-step__title">
            <h2 id={`co-h-${i}`} tabIndex={-1}>{STEPS[i] === 'Delivery' ? 'Delivery address' : STEPS[i] === 'Shipping' ? 'Shipping method' : STEPS[i] === 'Review' ? 'Review & place order' : STEPS[i]}</h2>
            {done && summaries[i] && <p className="co-step__summary">{summaries[i]}</p>}
          </div>
          {done && (
            <button type="button" className="co-step__edit" onClick={() => goStep(i)} aria-label={`Edit ${STEPS[i]}`}>
              Edit
            </button>
          )}
        </div>
        {step === i && <div className="co-step__body">{children}</div>}
      </section>
    )
  }

  return (
    <div className="co">
      <div className="container">
        <div className="co-top">
          <Link to="/cart" className="link">
            <Icon name="arrow-left" size={16} /> Back to bag
          </Link>
          <span className="co-top__secure">
            <Icon name="lock" size={16} /> Secure checkout
          </span>
        </div>
        <div className="cm-note cm-note--gold co-demo" role="note">
          <Icon name="info" size={18} />
          <span>
            <strong>Demo mode — no payment is taken.</strong> Do not enter real card or bank details. This prototype is not connected to Purple United’s live store.
          </span>
        </div>
        <details className="co-mobile-sum">
          <summary>
            <span>
              Order summary · {t.count} {t.count === 1 ? 'item' : 'items'}
            </span>
            <span>
              {formatINR(t.total)} <Icon name="chevron-down" size={16} />
            </span>
          </summary>
          <OrderSummary shipFee={shipFee} />
        </details>

        <div className="co-layout">
          <div>
            <h1 className="sr-only">Checkout</h1>
            <ol className="co-progress" aria-label="Checkout progress">
              {STEPS.map((s, i) => (
                <li key={s} className={i < step ? 'is-done' : i === step ? 'is-current' : ''} aria-current={i === step ? 'step' : undefined}>
                  <span>
                    {i + 1}. {s}
                  </span>
                </li>
              ))}
            </ol>

            {Step({
              i: 0,
              children: (
                <form
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault()
                    next(0)
                  }}
                >
                  {!user && (
                    <p className="body-sm muted" style={{ marginBottom: 16 }}>
                      Have an account?{' '}
                      <Link to="/account/login?next=/checkout" className="text-link">
                        Sign in
                      </Link>{' '}
                      for faster checkout — or continue as a guest.
                    </p>
                  )}
                  <div className="co-grid">
                    <Field id="co-email" label="Email" error={err('email')}>
                      <input id="co-email" type="email" className="input" autoComplete="email" value={contact.email} onChange={(e) => (setContact({ ...contact, email: e.target.value }), clr('email'))} {...inv('email')} />
                    </Field>
                    <Field id="co-phone" label="Mobile number" error={err('phone')} hint="For delivery updates by SMS.">
                      <input id="co-phone" type="tel" inputMode="tel" className="input" autoComplete="tel" placeholder="98765 43210" value={contact.phone} onChange={(e) => (setContact({ ...contact, phone: e.target.value }), clr('phone'))} {...inv('phone')} />
                    </Field>
                    <label className="checkbox span-2">
                      <input type="checkbox" checked={contact.updates} onChange={(e) => setContact({ ...contact, updates: e.target.checked })} />
                      <span>Email me about new collections and Purple Circle previews.</span>
                    </label>
                  </div>
                  <div className="co-actions">
                    <button type="submit" className="btn">
                      Continue to delivery <Icon name="arrow" size={18} className="icon-arrow" />
                    </button>
                  </div>
                </form>
              ),
            })}

            {Step({
              i: 1,
              children: (
                <form
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault()
                    next(1)
                  }}
                >
                  {!hasPhysical ? (
                    <p className="muted">Your bag only contains gift cards, which are delivered by email — no address needed.</p>
                  ) : (
                    <>
                      {saved.length > 0 && (
                        <div className="co-saved" role="radiogroup" aria-label="Saved addresses">
                          {saved.map((a) => (
                            <label key={a.id} className="radio-card">
                              <input type="radio" name="addr" checked={addrChoice === a.id} onChange={() => setAddrChoice(a.id)} />
                              <span className="co-option__main">
                                <span className="co-option__title">
                                  {a.label}
                                  {a.isDefault && <span className="tag tag--muted">Default</span>}
                                </span>
                                <span className="co-saved__addr">
                                  {a.name} · {a.line1}
                                  {a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} {a.pincode}
                                </span>
                              </span>
                            </label>
                          ))}
                          <label className="radio-card">
                            <input type="radio" name="addr" checked={addrChoice === 'new'} onChange={() => setAddrChoice('new')} />
                            <span className="co-option__main">
                              <span className="co-option__title">Use a new address</span>
                            </span>
                          </label>
                        </div>
                      )}
                      {addrChoice === 'new' && (
                        <div className="co-grid">
                          <Field id="co-name" label="Full name" error={err('name')}>
                            <input id="co-name" className="input" autoComplete="name" value={addr.name} onChange={(e) => (setAddr({ ...addr, name: e.target.value }), clr('name'))} {...inv('name')} />
                          </Field>
                          <Field id="co-aphone" label="Mobile number" error={err('aphone')}>
                            <input id="co-aphone" type="tel" inputMode="tel" className="input" autoComplete="tel" value={addr.phone} onChange={(e) => (setAddr({ ...addr, phone: e.target.value }), clr('aphone'))} {...inv('aphone')} />
                          </Field>
                          <div className="span-2">
                            <Field id="co-line1" label="House no., building, street" error={err('line1')}>
                              <input id="co-line1" className="input" autoComplete="address-line1" value={addr.line1} onChange={(e) => (setAddr({ ...addr, line1: e.target.value }), clr('line1'))} {...inv('line1')} />
                            </Field>
                          </div>
                          <div className="span-2">
                            <Field id="co-line2" label="Area, landmark" optional>
                              <input id="co-line2" className="input" autoComplete="address-line2" value={addr.line2} onChange={(e) => setAddr({ ...addr, line2: e.target.value })} />
                            </Field>
                          </div>
                          <Field id="co-pincode" label="Pincode" error={err('pincode')}>
                            <input id="co-pincode" inputMode="numeric" maxLength={6} className="input" autoComplete="postal-code" value={addr.pincode} onChange={(e) => (setAddr({ ...addr, pincode: e.target.value.replace(/\D/g, '') }), clr('pincode'))} {...inv('pincode')} />
                          </Field>
                          <Field id="co-city" label="City" error={err('city')}>
                            <input id="co-city" className="input" autoComplete="address-level2" value={addr.city} onChange={(e) => (setAddr({ ...addr, city: e.target.value }), clr('city'))} {...inv('city')} />
                          </Field>
                          <div className="span-2">
                            <Field id="co-state" label="State" error={err('state')}>
                              <select id="co-state" className="select" autoComplete="address-level1" value={addr.state} onChange={(e) => (setAddr({ ...addr, state: e.target.value }), clr('state'))} {...inv('state')}>
                                <option value="">Select state</option>
                                {STATES.map((s) => (
                                  <option key={s}>{s}</option>
                                ))}
                              </select>
                            </Field>
                          </div>
                          {current && (
                            <label className="checkbox span-2">
                              <input type="checkbox" checked={saveAddr} onChange={(e) => setSaveAddr(e.target.checked)} />
                              <span>Save this address to my account</span>
                            </label>
                          )}
                        </div>
                      )}
                    </>
                  )}
                  <div className="co-actions">
                    <button type="submit" className="btn">
                      Continue to shipping <Icon name="arrow" size={18} className="icon-arrow" />
                    </button>
                  </div>
                </form>
              ),
            })}

            {Step({
              i: 2,
              children: (
                <div>
                  <div className="co-options" role="radiogroup" aria-label="Shipping method">
                    <label className="radio-card">
                      <input type="radio" name="ship" checked={ship === 'standard'} onChange={() => setShip('standard')} />
                      <span className="co-option__main">
                        <span className="co-option__title">
                          Standard delivery <span>{standardFee === 0 ? 'Free' : formatINR(standardFee)}</span>
                        </span>
                        <span className="co-option__desc">Ships within 24–48 hours · 3–7 business days, depending on location. Free from {formatINR(FREE_SHIPPING_FROM)}.</span>
                      </span>
                    </label>
                    <label className="radio-card">
                      <input type="radio" name="ship" checked={ship === 'express'} onChange={() => setShip('express')} />
                      <span className="co-option__main">
                        <span className="co-option__title">
                          Express delivery <span>{formatINR(EXPRESS_FEE)}</span>
                        </span>
                        <span className="co-option__desc">Priority dispatch · demo option — rates and timelines to be confirmed with Purple United.</span>
                      </span>
                    </label>
                  </div>
                  <p className="demo-note" style={{ marginTop: 12 }}>
                    Delivery fees and express service are demonstration values — to be confirmed with Purple United.
                  </p>
                  <div className="co-actions">
                    <button type="button" className="btn" onClick={() => next(2)}>
                      Continue to payment <Icon name="arrow" size={18} className="icon-arrow" />
                    </button>
                  </div>
                </div>
              ),
            })}

            {Step({
              i: 3,
              children: (
                <form
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault()
                    next(3)
                  }}
                >
                  <div className="co-options" role="radiogroup" aria-label="Payment method">
                    {(
                      [
                        ['upi', 'upi', 'UPI', 'Pay with any UPI app'],
                        ['card', 'card', 'Credit or debit card', 'Test card only in this demo'],
                        ['netbanking', 'lock', 'Net banking', 'Choose your bank'],
                        ['cod', 'cash', 'Cash on delivery', 'Pay when your order arrives'],
                      ] as const
                    ).map(([k, icon, title, desc]) => (
                      <div key={k}>
                        <label className="radio-card">
                          <input type="radio" name="pay" checked={pay === k} onChange={() => (setPay(k), setErrors({}))} />
                          <Icon name={icon} className="co-option__icon" />
                          <span className="co-option__main">
                            <span className="co-option__title">{title}</span>
                            <span className="co-option__desc">{desc}</span>
                          </span>
                        </label>
                        {pay === k && k === 'upi' && (
                          <div className="co-pay-panel">
                            <Field id="co-upi" label="UPI ID" error={err('upi')} hint="Demo — no collect request will be sent.">
                              <input id="co-upi" className="input" placeholder="name@bank" value={upi} onChange={(e) => (setUpi(e.target.value), clr('upi'))} {...inv('upi')} autoComplete="off" />
                            </Field>
                          </div>
                        )}
                        {pay === k && k === 'card' && (
                          <div className="co-pay-panel">
                            <div className="cm-note" role="note">
                              <Icon name="alert" size={18} />
                              <span>
                                <strong>Demo mode — no payment is taken.</strong> Do not enter real card details. The test number {TEST_CARD} is prefilled.
                              </span>
                            </div>
                            <div className="co-grid">
                              <div className="span-2">
                                <Field id="co-card" label="Card number (test)" error={err('card')}>
                                  <input id="co-card" className="input" inputMode="numeric" autoComplete="off" value={card.number} onChange={(e) => (setCard({ ...card, number: e.target.value }), clr('card'))} {...inv('card')} />
                                </Field>
                              </div>
                              <div className="span-2">
                                <Field id="co-cname" label="Name on card" error={err('cname')}>
                                  <input id="co-cname" className="input" autoComplete="off" value={card.name} onChange={(e) => (setCard({ ...card, name: e.target.value }), clr('cname'))} {...inv('cname')} />
                                </Field>
                              </div>
                              <Field id="co-exp" label="Expiry (MM/YY)" error={err('exp')}>
                                <input id="co-exp" className="input" autoComplete="off" value={card.exp} onChange={(e) => (setCard({ ...card, exp: e.target.value }), clr('exp'))} {...inv('exp')} />
                              </Field>
                              <Field id="co-cvc" label="CVC (test)" error={err('cvc')}>
                                <input id="co-cvc" className="input" inputMode="numeric" maxLength={3} autoComplete="off" value={card.cvc} onChange={(e) => (setCard({ ...card, cvc: e.target.value.replace(/\D/g, '') }), clr('cvc'))} {...inv('cvc')} />
                              </Field>
                            </div>
                          </div>
                        )}
                        {pay === k && k === 'netbanking' && (
                          <div className="co-pay-panel">
                            <Field id="co-bank" label="Bank" error={err('bank')} hint="Demo — you won’t be redirected to a bank.">
                              <select id="co-bank" className="select" value={bank} onChange={(e) => (setBank(e.target.value), clr('bank'))} {...inv('bank')}>
                                <option value="">Select your bank</option>
                                {BANKS.map((b) => (
                                  <option key={b}>{b}</option>
                                ))}
                              </select>
                            </Field>
                          </div>
                        )}
                        {pay === k && k === 'cod' && (
                          <div className="co-pay-panel">
                            <p className="body-sm">Please keep the exact amount ready. Refunds for cash-on-delivery orders are made by bank transfer and may take 2–3 weeks.</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="co-actions">
                    <button type="submit" className="btn">
                      Review order <Icon name="arrow" size={18} className="icon-arrow" />
                    </button>
                  </div>
                </form>
              ),
            })}

            {Step({
              i: 4,
              children: (
                <div className="co-review">
                  {/* Each row is a labelled group; a <dl> can't contain the Edit buttons (WCAG 1.3.1). */}
                  <div style={{ margin: 0 }}>
                    {[
                      ['Contact', summaries[0], 0],
                      ['Deliver to', hasPhysical ? `${chosenAddress.name}, ${chosenAddress.line1}${chosenAddress.line2 ? `, ${chosenAddress.line2}` : ''}, ${chosenAddress.city}, ${chosenAddress.state} ${chosenAddress.pincode} · ${chosenAddress.phone}` : 'Gift cards delivered by email', 1],
                      ['Shipping', summaries[2], 2],
                      ['Payment', summaries[3], 3],
                    ].map(([label, val, i]) => (
                      <div key={label as string} className="co-review__block" role="group" aria-label={label as string}>
                        <span className="co-review__term">{label}</span>
                        <span className="co-review__val">{val}</span>
                        <button type="button" className="co-step__edit" onClick={() => goStep(i as number)} aria-label={`Edit ${label}`}>
                          Edit
                        </button>
                      </div>
                    ))}
                  </div>
                  {readGiftNote() && (
                    <div className="cm-note cm-note--oat">
                      <Icon name="gift" size={18} />
                      <span>Gift note: “{readGiftNote()}”</span>
                    </div>
                  )}
                  <label className="checkbox">
                    <input
                      id="co-agree"
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => (setAgree(e.target.checked), clr('agree'))}
                      aria-invalid={!!errors.agree || undefined}
                      aria-describedby={errors.agree ? 'co-agree-err' : undefined}
                    />
                    <span>
                      I’ve read the{' '}
                      <Link to="/help#returns" className="text-link" target="_blank">
                        returns & exchange policy
                      </Link>{' '}
                      (7-day returns on unused items with tags).
                    </span>
                  </label>
                  {errors.agree && (
                    <p className="field__error" id="co-agree-err">
                      <Icon name="alert" size={15} /> {errors.agree}
                    </p>
                  )}
                  <div className="co-actions">
                    <button type="button" className={`btn${processing ? ' is-loading' : ''}`} onClick={place}>
                      <Icon name="lock" size={16} /> Place order · {formatINR(t.total)}
                    </button>
                  </div>
                  <p className="co-terms">This is a demonstration. Placing the order simulates confirmation only — nothing is charged and no email is sent.</p>
                </div>
              ),
            })}
          </div>

          <aside className="co-aside" aria-label="Order summary">
            <OrderSummary shipFee={shipFee} />
          </aside>
        </div>
      </div>

      {processing && (
        <div className="co-processing" role="alertdialog" aria-live="assertive" aria-label="Processing your order">
          <div className="co-processing__card">
            <Crest variant="mark" style={{ height: 64, width: 'auto' }} />
            <div className="co-processing__ring" aria-hidden="true" />
            <p className="h4">Confirming your order…</p>
            <p className="muted body-sm">Simulated payment — nothing is being charged.</p>
          </div>
        </div>
      )}
    </div>
  )
}

function OrderSummary({ shipFee }: { shipFee: number }) {
  const lines = useCart((s) => s.lines)
  const discount = useCart((s) => s.discount)
  const t = cartTotals(lines, discount, shipFee)
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div className="co-sum" ref={ref}>
      <h2 className="h4">In your bag</h2>
      <ul role="list" className="co-sum__lines">
        {lines.map((l) => {
          const isGift = l.handle === GIFT_CARD_HANDLE
          const p = isGift ? undefined : getProduct(l.handle)
          const img = isGift ? '/img/brand/gift-card.webp' : p?.colors.find((c) => c.name === l.color)?.images[0]
          return (
            <li key={l.key} className="co-sum__line">
              <span className="co-sum__thumb">
                <img src={img} alt="" loading="lazy" />
                <b aria-label={`Quantity ${l.qty}`}>{l.qty}</b>
              </span>
              <span>
                <span className="co-sum__name">{isGift ? 'Purple United Gift Card' : p?.name}</span>
                <br />
                <span className="muted">{isGift ? l.size : `${l.color} · ${l.size}`}</span>
              </span>
              <span>{formatINR(linePrice(l) * l.qty)}</span>
            </li>
          )
        })}
      </ul>
      <DiscountForm />
      <dl className="totals">
        <div>
          <dt>Subtotal</dt>
          <dd>{formatINR(t.subtotal)}</dd>
        </div>
        {t.discountAmt > 0 && (
          <div className="totals__disc">
            <dt>Discount ({discount})</dt>
            <dd>−{formatINR(t.discountAmt)}</dd>
          </div>
        )}
        <div>
          <dt>Delivery</dt>
          <dd>{t.shipping === 0 ? 'Free' : formatINR(t.shipping)}</dd>
        </div>
        <div className="totals__grand">
          <dt>Total</dt>
          <dd>{formatINR(t.total)}</dd>
        </div>
      </dl>
    </div>
  )
}
