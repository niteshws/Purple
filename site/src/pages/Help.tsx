import '../styles/info.css'
import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Breadcrumbs, Accordion } from '../components/ui'
import { CONTACT, POLICY, FAQS } from '../data/site'
import { useMeta } from '../lib/hooks'
import { useUI } from '../store'

const TOC = [
  ['shipping', 'Shipping & delivery'],
  ['returns', 'Returns & exchanges'],
  ['faq', 'FAQs'],
  ['sizing', 'Sizing help'],
  ['privacy', 'Privacy'],
  ['terms', 'Terms of use'],
] as const

const FAQ_CATS = ['All', ...Array.from(new Set(FAQS.map((f) => f.cat)))]

function highlight(text: string, q: string): ReactNode {
  if (!q.trim()) return text
  const esc = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${esc})`, 'ig'))
  return parts.map((p, i) => (p.toLowerCase() === q.trim().toLowerCase() ? <mark className="hl" key={i}>{p}</mark> : p))
}

export default function Help() {
  useMeta('Help — Shipping, Returns & FAQs', 'Shipping and delivery times, 7-day returns and exchanges, refunds, sizing help and answers to common questions from Purple United Kids.')
  const openGuide = useUI((s) => s.openSizeGuide)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const faqs = useMemo(() => {
    const t = q.trim().toLowerCase()
    return FAQS.filter((f) => (cat === 'All' || f.cat === cat) && (!t || `${f.q} ${f.a}`.toLowerCase().includes(t)))
  }, [q, cat])

  return (
    <>
      <section className="help-hero">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Help' }]} />
          <div className="help-hero__grid">
            <div className="help-hero__title">
              <p className="eyebrow">Customer care</p>
              <h1 className="h1">
                How can we <em>help?</em>
              </h1>
              <p className="lead">Delivery, returns, sizing and everything in between. Still stuck? Our team is here {CONTACT.supportHours}.</p>
            </div>
            <nav className="help-quick" aria-label="Popular help topics">
              <Link to="/account/orders">
                <Icon name="box" /> Track an order
              </Link>
              <a href="#returns">
                <Icon name="return" /> Start a return
              </a>
              <a href="#sizing">
                <Icon name="ruler" /> Find their size
              </a>
              <Link to="/contact">
                <Icon name="chat" /> Contact us
              </Link>
            </nav>
          </div>
        </div>
      </section>

      <div className="container help-layout">
        <nav className="help-toc" aria-label="On this page">
          <p className="eyebrow">On this page</p>
          <ul role="list">
            {TOC.map(([id, l]) => (
              <li key={id}>
                <a href={`#${id}`}>{l}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <section id="shipping" className="help-section" aria-labelledby="h-shipping">
            <div className="help-section__head">
              <p className="eyebrow">01</p>
              <h2 id="h-shipping" className="h2">
                Shipping & <em>delivery</em>
              </h2>
            </div>
            <div className="facts">
              <div className="fact">
                <span className="fact__v">{POLICY.shipsWithin}</span>
                <span className="fact__l">Orders usually ship within this time</span>
              </div>
              <div className="fact">
                <span className="fact__v">3–7 days</span>
                <span className="fact__l">Typical delivery, in business days, depending on location</span>
              </div>
              <div className="fact">
                <span className="fact__v">SMS & email</span>
                <span className="fact__l">A tracking link is sent once your order ships</span>
              </div>
            </div>
            <div className="prose">
              <p>
                We pack every order with care and hand it to our delivery partners as quickly as we can. Once your parcel is on its way, you’ll receive a tracking
                link by SMS or email. Signed-in customers can also follow orders from <Link to="/account/orders" className="text-link">My Account</Link>.
              </p>
            </div>
            <div className="note-box">
              <Icon name="info" size={18} />
              <span>
                Shipping charges apply to orders under ₹{POLICY.smallOrderThreshold}. Exact shipping fees and any express options are to be confirmed by Purple United —
                rates shown in this demonstration’s checkout are illustrative.
              </span>
            </div>
          </section>

          <section id="returns" className="help-section" aria-labelledby="h-returns">
            <div className="help-section__head">
              <p className="eyebrow">02</p>
              <h2 id="h-returns" className="h2">
                Returns & <em>exchanges</em>
              </h2>
              <p className="lead">
                Changed your mind, or need another size? You have {POLICY.returnWindowDays} days from receiving your order.
              </p>
            </div>
            <div className="facts">
              <div className="fact">
                <span className="fact__v">{POLICY.returnWindowDays} days</span>
                <span className="fact__l">To return or exchange, from the day you receive it</span>
              </div>
              <div className="fact">
                <span className="fact__v">Free</span>
                <span className="fact__l">Replacement for a size mismatch or a defective item (conditions apply)</span>
              </div>
              <div className="fact">
                <span className="fact__v">Pickup</span>
                <span className="fact__l">Arranged by default where available</span>
              </div>
            </div>
            <h3 className="h4">What we can accept</h3>
            <ul className="check-list" role="list">
              <li>
                <Icon name="check" size={18} /> Unused, and not damaged while in your possession
              </li>
              <li>
                <Icon name="check" size={18} /> The same item that was shipped to you
              </li>
              <li>
                <Icon name="check" size={18} /> In its original condition, with the brand box, MRP tag and any accessories
              </li>
              <li>
                <Icon name="check" size={18} /> Any gift that came with the product, returned along with it
              </li>
            </ul>
            <h3 className="h4">How to return</h3>
            <ol className="steps" role="list">
              <li>
                <span>
                  <strong>Raise a request</strong> from <Link to="/account/orders" className="text-link">My Account</Link>, or email{' '}
                  <a href={`mailto:${CONTACT.email}`} className="text-link">{CONTACT.email}</a> with your order ID and the reason.
                </span>
              </li>
              <li>
                <span>
                  <strong>Pack it up</strong> in its original condition, with tags and the brand box.
                </span>
              </li>
              <li>
                <span>
                  <strong>We collect it.</strong> Pickup is the default. If your pincode isn’t eligible, self-ship with any courier (Speed Post preferred) — write
                  “SELF SHIP” on the parcel and your order ID in bold — to: {CONTACT.returnsAddress}.
                </span>
              </li>
              <li>
                <span>
                  <strong>Refund or replacement.</strong> Prepaid orders are refunded {POLICY.prepaidRefund}. Cash-on-delivery orders are refunded {POLICY.codRefund}.
                </span>
              </li>
            </ol>
            <div className="note-box">
              <Icon name="info" size={18} />
              <span>
                Refunds exclude any discount or promotional value. Shipping charges paid on orders under ₹{POLICY.smallOrderThreshold} are non-refundable. To cancel
                an order, email us or WhatsApp {CONTACT.whatsapp} with your order ID — orders cancelled before shipping are refunded in full; after shipping, a
                cancellation is treated as a return. Return support: {CONTACT.supportHours}, {CONTACT.phone}.
              </span>
            </div>
          </section>

          <section id="faq" className="help-section" aria-labelledby="h-faq">
            <div className="help-section__head">
              <p className="eyebrow">03</p>
              <h2 id="h-faq" className="h2">
                Frequently asked <em>questions</em>
              </h2>
            </div>
            <div className="faq-tools">
              <div className="faq-search">
                <Icon name="search" size={18} />
                <label htmlFor="faq-q" className="sr-only">
                  Search questions
                </label>
                <input id="faq-q" className="input" type="search" placeholder="Search — e.g. refund, size, delivery" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <div className="tabs" role="toolbar" aria-label="Question categories">
                {FAQ_CATS.map((c) => (
                  <button key={c} type="button" className={`tabs__tab${cat === c ? ' is-active' : ''}`} aria-pressed={cat === c} onClick={() => setCat(c)}>
                    {c}
                  </button>
                ))}
              </div>
              <p className="faq-count" aria-live="polite">
                {faqs.length} {faqs.length === 1 ? 'question' : 'questions'}
                {q.trim() ? ` matching “${q.trim()}”` : ''}
              </p>
            </div>
            {faqs.length === 0 ? (
              <div className="faq-empty">
                <Icon name="search" size={26} />
                <p className="h4">No answers match that search.</p>
                <p className="muted">Try a simpler word, or ask our team directly.</p>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={() => {
                      setQ('')
                      setCat('All')
                    }}
                  >
                    Clear search
                  </button>
                  <Link to="/contact" className="btn btn--sm">
                    Contact us
                  </Link>
                </div>
              </div>
            ) : (
              <Accordion
                key={`${cat}-${q}`}
                items={faqs.map((f) => ({
                  title: (
                    <span className="faq-q">
                      {cat === 'All' && <span className="faq-cat">{f.cat}</span>}
                      {highlight(f.q, q)}
                    </span>
                  ),
                  body: <p>{highlight(f.a, q)}</p>,
                }))}
              />
            )}
          </section>

          <section id="sizing" className="help-section" aria-labelledby="h-sizing">
            <div className="help-section__head">
              <p className="eyebrow">04</p>
              <h2 id="h-sizing" className="h2">
                Sizing <em>help</em>
              </h2>
              <p className="prose">
                We size by age and height. Every product page has a size guide; sizes can vary slightly by style. If they’re between sizes, choose the larger
                one — there’s always a growth spurt around the corner.
              </p>
            </div>
            <div className="size-mini">
              <div>
                <strong>Infants</strong>
                <span>0–3 months to 18–24 months, by height and weight</span>
              </div>
              <div>
                <strong>Kids clothing</strong>
                <span>2–3 years to 13–14 years, by height and chest</span>
              </div>
              <div>
                <strong>Footwear</strong>
                <span>UK 5K to UK 5, by foot length — add about 1 cm to grow</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
              <button type="button" className="btn" onClick={() => openGuide('apparel')}>
                <Icon name="ruler" size={18} /> Open the size guide
              </button>
              <a href={`${CONTACT.whatsappHref}?text=${encodeURIComponent('Hi Purple United, could you help me choose a size?')}`} target="_blank" rel="noreferrer" className="link">
                Ask for size help on WhatsApp
              </a>
            </div>
            <p className="demo-note">Size charts in this demonstration are a general guide; product-specific charts to be supplied by Purple United.</p>
          </section>

          <section id="privacy" className="help-section" aria-labelledby="h-privacy">
            <div className="help-section__head">
              <p className="eyebrow">05</p>
              <h2 id="h-privacy" className="h3">Privacy</h2>
            </div>
            <div className="legal-card">
              <p className="prose">In short, we use your details only to fulfil your orders, look after your account and — if you choose — keep you updated.</p>
              <ul>
                <li>We collect what we need to process and deliver orders and provide support.</li>
                <li>Marketing messages are opt-in, and you can unsubscribe at any time.</li>
                <li>You can ask us about the data we hold by writing to {CONTACT.email}.</li>
              </ul>
              <p className="demo-note">Summary for this demonstration · the full privacy policy is published on purpleunited.com.</p>
            </div>
          </section>

          <section id="terms" className="help-section" aria-labelledby="h-terms">
            <div className="help-section__head">
              <p className="eyebrow">06</p>
              <h2 id="h-terms" className="h3">Terms of use</h2>
            </div>
            <div className="legal-card">
              <ul>
                <li>This site is operated by {CONTACT.company} ({CONTACT.companyNote.toLowerCase()}).</li>
                <li>Prices, availability and promotions may change; the price at checkout applies to your order.</li>
                <li>Returns, exchanges and refunds follow the policy set out above.</li>
              </ul>
              <p className="demo-note">Summary for this demonstration · the full terms and conditions are published on purpleunited.com.</p>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
