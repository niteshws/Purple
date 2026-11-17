import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { Price, QtyStepper, Modal } from './ui'
import { products, getProduct, formatINR, stockFor, type Product } from '../data/products'
import { collections } from '../data/collections'
import { useCart, useUI, cartTotals, FREE_SHIPPING_FROM, GIFT_CARD_HANDLE, linePrice, type CartLine } from '../store'
import { useDebounced, useDialog, useLockScroll } from '../lib/hooks'

/* ==========================================================================
   Search — predictive overlay
   ========================================================================== */
export function searchProducts(q: string): Product[] {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return []
  const scored = products
    .map((p) => {
      const hay = `${p.name} ${p.type} ${p.departments.join(' ')} ${p.gender} ${p.colors.map((c) => c.name).join(' ')} ${p.material} ${p.occasions.join(' ')} ${p.description}`.toLowerCase()
      let score = 0
      for (const t of terms) {
        const stem = t.replace(/(es|s)$/, '')
        if (p.name.toLowerCase().includes(stem)) score += 5
        else if (hay.includes(stem)) score += 2
        else return { p, score: -1 }
      }
      return { p, score: score + p.popularity / 100 }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
  return scored.map((x) => x.p)
}

const POPULAR = ['Knitted sweater', 'Varsity jacket', 'Party dress', 'Sneakers', 'Denim', 'First walkers']

export function SearchOverlay() {
  const open = useUI((s) => s.searchOpen)
  const setSearch = useUI((s) => s.setSearch)
  const [q, setQ] = useState('')
  const dq = useDebounced(q, 120)
  const ref = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  useLockScroll(open)
  useDialog(open, ref, () => setSearch(false), input)
  useEffect(() => setSearch(false), [pathname])
  const results = useMemo(() => searchProducts(dq).slice(0, 6), [dq])
  const cols = useMemo(
    () => (dq.length > 1 ? collections.filter((c) => `${c.title} ${c.titleEm ?? ''} ${c.eyebrow}`.toLowerCase().includes(dq.toLowerCase())).slice(0, 3) : []),
    [dq],
  )
  const submit = (term: string) => {
    if (!term.trim()) return
    setSearch(false)
    navigate(`/search?q=${encodeURIComponent(term.trim())}`)
  }
  return (
    <div className={`search-ov${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <div className="search-ov__scrim" onClick={() => setSearch(false)} />
      <div className="search-ov__panel" ref={ref} role="dialog" aria-modal="true" aria-label="Search">
        <div className="container">
          <form
            className="search-ov__form"
            role="search"
            onSubmit={(e) => {
              e.preventDefault()
              submit(q)
            }}
          >
            <Icon name="search" size={24} />
            <label htmlFor="search-input" className="sr-only">
              Search Purple United
            </label>
            <input
              id="search-input"
              ref={input}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search knits, party dresses, sneakers…"
              autoComplete="off"
              aria-controls="search-results"
            />
            {q && (
              <button type="button" className="link" onClick={() => setQ('')}>
                Clear
              </button>
            )}
            <button type="button" className="icon-btn" onClick={() => setSearch(false)} aria-label="Close search">
              <Icon name="close" />
            </button>
          </form>
          {/* Announce a short summary instead of re-reading the whole results list on every keystroke (WCAG 4.1.3). */}
          <p className="sr-only" role="status">
            {dq ? (results.length || cols.length ? `${results.length} ${results.length === 1 ? 'product' : 'products'}${cols.length ? ` and ${cols.length} ${cols.length === 1 ? 'collection' : 'collections'}` : ''} for ${dq}` : `No matches for ${dq}`) : ''}
          </p>
          <div className="search-ov__body" id="search-results">
            {!dq ? (
              <div className="search-ov__suggest">
                <p className="eyebrow">Popular searches</p>
                <div className="chips">
                  {POPULAR.map((t) => (
                    <button key={t} type="button" className="chip" onClick={() => setQ(t)}>
                      {t}
                    </button>
                  ))}
                </div>
                <p className="eyebrow" style={{ marginTop: 28 }}>
                  Explore
                </p>
                <div className="chips">
                  {['new-arrivals', 'winter-edit', 'celebration-party', 'infants'].map((h) => {
                    const c = collections.find((x) => x.handle === h)!
                    return (
                      <Link key={h} to={`/collections/${h}`} className="chip" onClick={() => setSearch(false)}>
                        {c.title} {c.titleEm}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : results.length === 0 && cols.length === 0 ? (
              <div className="search-ov__none">
                <p className="h4">No matches for “{dq}”.</p>
                <p className="muted">Try a broader word like “jacket”, “dress” or “shoes” — or let our stylist help.</p>
                <Link to="/ask-purple" className="link" onClick={() => setSearch(false)}>
                  Ask Purple <Icon name="arrow" size={16} className="icon-arrow" />
                </Link>
              </div>
            ) : (
              <div className="search-ov__results">
                {cols.length > 0 && (
                  <div className="search-ov__cols">
                    <p className="eyebrow">Collections</p>
                    {cols.map((c) => (
                      <Link key={c.handle} to={`/collections/${c.handle}`} onClick={() => setSearch(false)}>
                        {c.title} {c.titleEm} <Icon name="arrow" size={14} />
                      </Link>
                    ))}
                  </div>
                )}
                <div>
                  <p className="eyebrow">Products</p>
                  <ul role="list" className="search-ov__list">
                    {results.map((p) => (
                      <li key={p.handle}>
                        <Link to={`/products/${p.handle}`} onClick={() => setSearch(false)}>
                          <img src={p.colors[0].images[0]} alt="" loading="lazy" />
                          <span>
                            <span className="search-ov__name">{p.name}</span>
                            <span className="muted body-sm">{p.type}</span>
                          </span>
                          <Price price={p.price} compareAt={p.compareAt} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button type="button" className="link" onClick={() => submit(dq)}>
                    See all results for “{dq}” <Icon name="arrow" size={16} className="icon-arrow" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   Cart line + drawer
   ========================================================================== */
export function CartLineRow({ line, compact }: { line: CartLine; compact?: boolean }) {
  const setQty = useCart((s) => s.setQty)
  const remove = useCart((s) => s.remove)
  const restore = useCart((s) => s.restore)
  const changeVariant = useCart((s) => s.changeVariant)
  const toast = useUI((s) => s.toast)
  const setCart = useUI((s) => s.setCart)
  const isGift = line.handle === GIFT_CARD_HANDLE
  const p = isGift ? undefined : getProduct(line.handle)
  const [editing, setEditing] = useState(false)
  if (!isGift && !p) return null
  const image = isGift ? '/img/brand/gift-card.webp' : p!.colors.find((c) => c.name === line.color)?.images[0]
  const max = p ? Math.min(10, stockFor(p, line.color, line.size)) : 1
  const name = isGift ? 'Purple United Gift Card' : p!.name
  const onRemove = (e: { currentTarget: HTMLElement }) => {
    // The line unmounts, so hand focus to the neighbouring line, or to the bag heading (WCAG 2.4.3).
    const li = e.currentTarget.closest('li')
    const list = li?.parentElement
    const idx = list && li ? Array.prototype.indexOf.call(list.children, li) : -1
    setTimeout(() => {
      const rest = list?.isConnected ? Array.from(list.querySelectorAll<HTMLElement>(':scope > li')) : []
      const target = (rest[idx] ?? rest[idx - 1])?.querySelector<HTMLElement>('.cline__name a, .cline__links button')
      if (target) return target.focus()
      const h = document.getElementById('cart-h') ?? document.querySelector<HTMLElement>('main h1')
      if (h) {
        h.setAttribute('tabindex', '-1')
        h.focus()
      }
    }, 40)
    const removed = remove(line.key)
    if (removed)
      toast({ kind: 'info', title: 'Removed from your bag', body: isGift ? 'Purple gift card' : p!.name, action: { label: 'Undo', onClick: () => restore(removed) } })
  }
  return (
    <li className={`cline${compact ? ' cline--compact' : ''}`}>
      {isGift ? (
        <div className="cline__img cline__img--gift">
          <img src={image} alt="" />
        </div>
      ) : (
        // Duplicate of the product-name link below: kept for pointer users, hidden from keyboard and screen readers.
        <Link to={`/products/${p!.handle}?color=${encodeURIComponent(line.color)}`} className="cline__img" onClick={() => setCart(false)} tabIndex={-1} aria-hidden="true">
          <img src={image} alt="" loading="lazy" />
        </Link>
      )}
      <div className="cline__body">
        <div className="cline__top">
          <div>
            <p className="cline__name">
              {isGift ? 'Purple United Gift Card' : <Link to={`/products/${p!.handle}`} onClick={() => setCart(false)}>{p!.name}</Link>}
            </p>
            <p className="cline__var">
              {isGift ? `${line.size} · for ${line.gift?.recipientName}` : `${line.color} · ${line.size}`}
            </p>
          </div>
          <span className="cline__price">{formatINR(linePrice(line) * line.qty)}</span>
        </div>
        {editing && p && (
          <div className="cline__edit">
            <label className="sr-only" htmlFor={`c-${line.key}`}>Colour</label>
            <select id={`c-${line.key}`} className="select select--sm" value={line.color} onChange={(e) => {
              const c = e.target.value
              const s = p.sizes.find((sz) => stockFor(p, c, sz) > 0) ?? line.size
              changeVariant(line.key, c, stockFor(p, c, line.size) > 0 ? line.size : s)
            }}>
              {p.colors.map((c) => <option key={c.name} disabled={c.soldOut}>{c.name}</option>)}
            </select>
            <label className="sr-only" htmlFor={`s-${line.key}`}>Size</label>
            <select id={`s-${line.key}`} className="select select--sm" value={line.size} onChange={(e) => changeVariant(line.key, line.color, e.target.value)}>
              {p.sizes.map((s) => <option key={s} disabled={stockFor(p, line.color, s) === 0}>{s}{stockFor(p, line.color, s) === 0 ? ' — sold out' : ''}</option>)}
            </select>
          </div>
        )}
        <div className="cline__actions">
          {isGift ? <span className="body-sm muted">Delivered by email</span> : <QtyStepper value={line.qty} max={max} onChange={(n) => setQty(line.key, n)} size="sm" label={`Quantity, ${name}`} />}
          <div className="cline__links">
            {p && p.sizeSystem !== 'one-size' && (
              <button type="button" onClick={() => setEditing((e) => !e)} aria-expanded={editing}>
                {editing ? 'Done' : 'Edit'}
                <span className="sr-only"> {name}</span>
              </button>
            )}
            <button type="button" onClick={onRemove}>
              Remove<span className="sr-only"> {name}</span>
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}

export function FreeShippingMeter({ subtotal }: { subtotal: number }) {
  const left = Math.max(0, FREE_SHIPPING_FROM - subtotal)
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_FROM) * 100)
  return (
    <div className="ship-meter">
      <p>
        <Icon name="delivery" size={18} />
        {left > 0 ? (
          <span>
            Add <strong>{formatINR(left)}</strong> more for free standard delivery
          </span>
        ) : (
          <span>Your order qualifies for <strong>free standard delivery</strong></span>
        )}
      </p>
      <div className="ship-meter__bar" aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function CartDrawer() {
  const open = useUI((s) => s.cartOpen)
  const setCart = useUI((s) => s.setCart)
  const lines = useCart((s) => s.lines)
  const discount = useCart((s) => s.discount)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  useLockScroll(open)
  useDialog(open, ref, () => setCart(false))
  useEffect(() => setCart(false), [pathname])
  const t = cartTotals(lines, discount)
  const recs = useMemo(() => {
    const inBag = new Set(lines.map((l) => l.handle))
    return products.filter((p) => !inBag.has(p.handle) && (p.departments.includes('footwear') || p.type === 'Sweaters')).sort((a, b) => b.popularity - a.popularity).slice(0, 3)
  }, [lines])
  return (
    <div className={`drawer drawer--right${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <div className="drawer__scrim" onClick={() => setCart(false)} />
      <div className="drawer__panel cart-drawer" ref={ref} role="dialog" aria-modal="true" aria-labelledby="cart-h">
        <div className="drawer__head">
          <h2 id="cart-h" className="h4">
            Your bag <span className="muted body-sm">({t.count} {t.count === 1 ? 'item' : 'items'})</span>
          </h2>
          <button type="button" className="icon-btn" onClick={() => setCart(false)} aria-label="Close bag">
            <Icon name="close" />
          </button>
        </div>
        {lines.length === 0 ? (
          <div className="cart-drawer__empty">
            <span className="empty__icon">
              <Icon name="bag" size={30} strokeWidth={1.2} />
            </span>
            <p className="h4">Your bag is waiting</p>
            <p className="muted">Start with something new for the season.</p>
            <div className="cart-drawer__empty-links">
              <Link to="/collections/new-arrivals" className="btn">
                Shop new arrivals
              </Link>
              <Link to="/collections/best-sellers" className="btn btn--outline">
                Customer favourites
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="cart-drawer__scroll">
              <FreeShippingMeter subtotal={t.subtotal} />
              <ul role="list" className="cart-lines">
                {lines.map((l) => (
                  <CartLineRow key={l.key} line={l} />
                ))}
              </ul>
              {recs.length > 0 && (
                <div className="cart-drawer__recs">
                  <p className="eyebrow">Complete the look</p>
                  <ul role="list">
                    {recs.map((p) => (
                      <li key={p.handle}>
                        <Link to={`/products/${p.handle}`}>
                          <img src={p.colors[0].images[0]} alt="" loading="lazy" />
                          <span>
                            <span className="cline__name">{p.name}</span>
                            <Price price={p.price} compareAt={p.compareAt} />
                          </span>
                          <Icon name="arrow" size={16} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="cart-drawer__foot">
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
              </dl>
              <button
                type="button"
                className="btn btn--block"
                onClick={() => {
                  setCart(false)
                  navigate('/checkout')
                }}
              >
                <Icon name="lock" size={16} /> Checkout · {formatINR(t.total)}
              </button>
              <Link to="/cart" className="link cart-drawer__view">
                View full bag
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ==========================================================================
   Size guide — general reference (not product-specific dimensions)
   ========================================================================== */
const APPAREL_ROWS = [
  ['2-3Y', '92–98', '52–54'],
  ['3-4Y', '98–104', '54–56'],
  ['4-5Y', '104–110', '56–58'],
  ['5-6Y', '110–116', '58–60'],
  ['6-7Y', '116–122', '60–62'],
  ['7-8Y', '122–128', '62–65'],
  ['8-9Y', '128–134', '65–67'],
  ['9-10Y', '134–140', '67–70'],
  ['10-11Y', '140–146', '70–73'],
  ['11-12Y', '146–152', '73–76'],
  ['12-13Y', '152–158', '76–79'],
  ['13-14Y', '158–164', '79–82'],
]
const INFANT_ROWS = [
  ['0-3M', '50–62', 'up to 6'],
  ['3-6M', '62–68', '6–8'],
  ['6-9M', '68–74', '8–9'],
  ['9-12M', '74–80', '9–10'],
  ['12-18M', '80–86', '10–11.5'],
  ['18-24M', '86–92', '11.5–12.5'],
]
const SHOE_ROWS = [
  ['UK 5K', '12.5', '1–2 years'],
  ['UK 6K', '13.3', '2 years'],
  ['UK 7K', '14.2', '2–3 years'],
  ['UK 8K', '15.0', '3 years'],
  ['UK 9K', '15.9', '3–4 years'],
  ['UK 10K', '16.7', '4–5 years'],
  ['UK 11K', '17.6', '5–6 years'],
  ['UK 12K', '18.4', '6–7 years'],
  ['UK 13K', '19.3', '7–8 years'],
  ['UK 1', '20.1', '8–9 years'],
  ['UK 2', '21.0', '9–10 years'],
  ['UK 3', '21.8', '10–11 years'],
  ['UK 4', '22.6', '11–12 years'],
  ['UK 5', '23.5', '12–14 years'],
]

export function SizeGuideModal() {
  const sys = useUI((s) => s.sizeGuide)
  const close = useUI((s) => s.openSizeGuide)
  const [tab, setTab] = useState<'apparel' | 'infant' | 'footwear'>('apparel')
  useEffect(() => {
    if (sys === 'infant') setTab('infant')
    else if (sys === 'footwear' || sys === 'infant-footwear') setTab('footwear')
    else if (sys) setTab('apparel')
  }, [sys])
  return (
    <Modal open={!!sys} onClose={() => close(null)} title="Size guide" wide>
      {/* Full tabs pattern: one tab stop, arrow / Home / End keys, tabs linked to the panel (WCAG 4.1.2). */}
      <div
        className="tabs"
        role="tablist"
        aria-label="Size guide categories"
        onKeyDown={(e) => {
          const order = ['apparel', 'infant', 'footwear'] as const
          const i = order.indexOf(tab)
          const n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: order.length - 1 }[e.key]
          if (n === undefined) return
          e.preventDefault()
          const t = order[(n + order.length) % order.length]
          setTab(t)
          setTimeout(() => document.getElementById(`sg-tab-${t}`)?.focus(), 0)
        }}
      >
        {(['apparel', 'infant', 'footwear'] as const).map((t) => (
          <button
            key={t}
            id={`sg-tab-${t}`}
            role="tab"
            type="button"
            aria-selected={tab === t}
            aria-controls="sg-panel"
            tabIndex={tab === t ? 0 : -1}
            className={`tabs__tab${tab === t ? ' is-active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'apparel' ? 'Kids clothing' : t === 'infant' ? 'Infants' : 'Footwear'}
          </button>
        ))}
      </div>
      <div className="size-guide" role="tabpanel" id="sg-panel" aria-labelledby={`sg-tab-${tab}`}>
        <p className="body-sm muted">
          A general reference by age and height. Every child grows differently — if they are between sizes, choose the larger one for room to grow. Product-specific
          measurements will be shown here once supplied by Purple United.
        </p>
        <div className="table-wrap">
          <table className="table">
            <caption className="sr-only">{tab} size reference</caption>
            <thead>
              {tab === 'footwear' ? (
                <tr>
                  <th scope="col">Size</th>
                  <th scope="col">Foot length (cm)</th>
                  <th scope="col">Typical age</th>
                </tr>
              ) : (
                <tr>
                  <th scope="col">Size</th>
                  <th scope="col">Height (cm)</th>
                  <th scope="col">{tab === 'infant' ? 'Weight (kg)' : 'Chest (cm)'}</th>
                </tr>
              )}
            </thead>
            <tbody>
              {(tab === 'apparel' ? APPAREL_ROWS : tab === 'infant' ? INFANT_ROWS : SHOE_ROWS).map((r) => (
                <tr key={r[0]}>
                  {r.map((c, i) => (i === 0 ? <th scope="row" key={i}>{c}</th> : <td key={i}>{c}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="size-guide__how">
          <div>
            <Icon name="ruler" />
            <p>
              <strong>Height</strong> — measure standing straight, without shoes, from the top of the head to the floor.
            </p>
          </div>
          <div>
            <Icon name="size" />
            <p>
              <strong>{tab === 'footwear' ? 'Foot length' : 'Chest'}</strong> —{' '}
              {tab === 'footwear' ? 'stand on paper, mark heel and longest toe, and measure the distance. Add about 1 cm for growing room.' : 'measure around the fullest part of the chest, under the arms, keeping the tape level.'}
            </p>
          </div>
        </div>
        <p className="demo-note">General guide for this demonstration — final charts to be confirmed with Purple United’s product team.</p>
      </div>
    </Modal>
  )
}
