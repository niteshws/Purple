import '../styles/commerce.css'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Breadcrumbs, EmptyState } from '../components/ui'
import { ProductCard } from '../components/ProductCard'
import { CartLineRow, FreeShippingMeter } from '../components/Overlays'
import { products, formatINR } from '../data/products'
import { useCart, cartTotals, DISCOUNTS, FREE_SHIPPING_FROM, STANDARD_SHIPPING_FEE } from '../store'
import { useMeta } from '../lib/hooks'

export const GIFT_NOTE_KEY = 'pu-gift-note'
export const readGiftNote = () => {
  try {
    return sessionStorage.getItem(GIFT_NOTE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function DiscountForm() {
  const discount = useCart((s) => s.discount)
  const apply = useCart((s) => s.applyDiscount)
  const clear = useCart((s) => s.clearDiscount)
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  if (discount)
    return (
      <div className="discount-applied" role="status">
        <span>
          <Icon name="check" size={16} /> {DISCOUNTS[discount]?.label ?? discount}
        </span>
        <button type="button" onClick={() => clear()}>
          Remove
        </button>
      </div>
    )
  return (
    <form
      className="discount-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        setBusy(true)
        setTimeout(() => {
          const r = apply(code)
          setMsg({ ok: r.ok, text: r.message })
          setBusy(false)
        }, 450)
      }}
    >
      <label htmlFor="discount-code" className="field__label">
        Discount code
      </label>
      <div className="discount-form__row">
        <input
          id="discount-code"
          className="input"
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setMsg(null)
          }}
          placeholder="Enter code"
          aria-invalid={msg ? !msg.ok : undefined}
          aria-describedby="discount-msg"
          autoComplete="off"
        />
        <button type="submit" className={`btn btn--outline${busy ? ' is-loading' : ''}`}>
          Apply
        </button>
      </div>
      <div id="discount-msg" aria-live="polite">
        {msg && !msg.ok && (
          <p className="field__error">
            <Icon name="alert" size={15} /> {msg.text}
          </p>
        )}
        {!msg && <p className="field__hint">Demo code: WELCOME10</p>}
      </div>
    </form>
  )
}

export default function Cart() {
  useMeta('Your bag', 'Review the pieces in your Purple United bag.', { canonical: '/cart' })
  const lines = useCart((s) => s.lines)
  const discount = useCart((s) => s.discount)
  const navigate = useNavigate()
  const t = cartTotals(lines, discount)
  const [note, setNote] = useState(readGiftNote)
  const recs = useMemo(() => {
    const inBag = new Set(lines.map((l) => l.handle))
    return products
      .filter((p) => !inBag.has(p.handle))
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 4)
  }, [lines])

  const saveNote = (v: string) => {
    setNote(v)
    try {
      sessionStorage.setItem(GIFT_NOTE_KEY, v)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="cm-page">
      <div className="container">
        <header className="cm-head">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Bag' }]} />
          <div className="cm-head__row">
            <div className="cm-head__title">
              <h1 className="h1">
                Your <em>bag</em>
              </h1>
            </div>
            {lines.length > 0 && (
              <Link to="/collections/all" className="link">
                <Icon name="arrow-left" size={16} /> Continue shopping
              </Link>
            )}
          </div>
        </header>

        {lines.length === 0 ? (
          <EmptyState
            icon="bag"
            title="Your bag is waiting"
            body="Nothing here yet. Start with the new season, or revisit the pieces you’ve saved."
            action={
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link to="/collections/new-arrivals" className="btn">
                  Shop new arrivals
                </Link>
                <Link to="/wishlist" className="btn btn--outline">
                  View wishlist
                </Link>
              </div>
            }
          />
        ) : (
          <div className="cart-layout">
            <div className="cart-layout__main">
              <p className="cm-count" style={{ marginBottom: 12 }}>
                {t.count} {t.count === 1 ? 'item' : 'items'}
              </p>
              <ul role="list" className="cart-lines">
                {lines.map((l) => (
                  <CartLineRow key={l.key} line={l} />
                ))}
              </ul>
              <div className="cart-perks">
                <div>
                  <Icon name="delivery" />
                  <strong>Delivery</strong>
                  <span>Ships within 24–48 hours · usually arrives in 3–7 business days.</span>
                </div>
                <div>
                  <Icon name="return" />
                  <strong>7-day returns</strong>
                  <span>Free replacement for a size mismatch (conditions apply).</span>
                </div>
                <div>
                  <Icon name="store" />
                  <strong>Exchange in store</strong>
                  <span>
                    Visit one of our <Link to="/stores" className="text-link">99 stores</Link> to try sizes in person.
                  </span>
                </div>
              </div>
            </div>

            <aside className="summary" aria-labelledby="sum-h">
              <h2 id="sum-h" className="h4">
                Order summary
              </h2>
              <FreeShippingMeter subtotal={t.subtotal} />
              <DiscountForm />
              <details className="gift-note-toggle" open={!!note}>
                <summary>
                  <Icon name="gift" size={18} /> Add a gift note
                </summary>
                <label htmlFor="gift-note" className="sr-only">
                  Gift note
                </label>
                <textarea
                  id="gift-note"
                  className="textarea"
                  maxLength={240}
                  value={note}
                  onChange={(e) => saveNote(e.target.value)}
                  placeholder="Happy birthday, little one! With love…"
                />
                <p className="field__hint">{240 - note.length} characters left · printed on an ivory card, prices hidden.</p>
              </details>
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
                  <dt>Standard delivery</dt>
                  <dd>{t.shipping === 0 ? 'Free' : formatINR(t.shipping)}</dd>
                </div>
                <div className="totals__grand">
                  <dt>Total</dt>
                  <dd>{formatINR(t.total)}</dd>
                </div>
              </dl>
              <button type="button" className="btn btn--block" onClick={() => navigate('/checkout')}>
                <Icon name="lock" size={16} /> Secure checkout
              </button>
              <div className="summary__trust">
                <span>
                  <Icon name="delivery" size={16} /> Free standard delivery from {formatINR(FREE_SHIPPING_FROM)} · otherwise {formatINR(STANDARD_SHIPPING_FEE)} (demo rate)
                </span>
                <span>
                  <Icon name="shield" size={16} /> Demonstration checkout — no payment is taken
                </span>
              </div>
            </aside>
          </div>
        )}

        {recs.length > 0 && (
          <section className="cart-recs" aria-labelledby="recs-h">
            <div className="section-head">
              <div className="section-head__text">
                <p className="eyebrow">Picked for you</p>
                <h2 id="recs-h" className="h2">
                  You may also <em>like</em>
                </h2>
              </div>
            </div>
            <div className="pgrid">
              {recs.map((p) => (
                <ProductCard key={p.handle} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
