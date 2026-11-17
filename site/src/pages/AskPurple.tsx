import '../styles/experience.css'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Breadcrumbs, Price } from '../components/ui'
import {
  products,
  stockFor,
  formatINR,
  isProductSoldOut,
  allColorFamilies,
  colorFamiliesOf,
  type Product,
  type AgeGroup,
  type Occasion,
  type Style,
} from '../data/products'
import { useWishlist, useUI } from '../store'
import { addToBag, toggleWish } from '../lib/commerce'
import { useMeta } from '../lib/hooks'

/* ==========================================================================
   Ask Purple — transparent, rule-based stylist over the demo catalogue.
   Not AI: every suggestion comes from the scoring rules below.
   ========================================================================== */

type Prefs = {
  age: string // '0-6m' | '6-12m' | '12-24m' | '2'..'14'
  gender: 'girl' | 'boy' | 'any'
  occasion: Occasion | ''
  styles: Style[]
  budget: number // per piece, 0 = no limit
  apparelSize: string // '' = auto
  shoeSize: string // '' = auto
  colors: string[]
}

const DEFAULT: Prefs = { age: '6', gender: 'any', occasion: '', styles: [], budget: 0, apparelSize: '', shoeSize: '', colors: [] }
const KEY = 'pu-ask-purple'

const AGES = [
  { v: '0-6m', l: '0–6 months' },
  { v: '6-12m', l: '6–12 months' },
  { v: '12-24m', l: '12–24 months' },
  ...Array.from({ length: 13 }, (_, i) => ({ v: String(i + 2), l: `${i + 2} years` })),
]
const OCCASIONS: { v: Occasion; l: string }[] = [
  { v: 'everyday', l: 'Everyday' },
  { v: 'celebration', l: 'Celebration & party' },
  { v: 'festive', l: 'Festive' },
  { v: 'weekend', l: 'Weekend adventures' },
  { v: 'special', l: 'Special moments' },
]
const STYLES: { v: Style; l: string }[] = [
  { v: 'classic', l: 'Classic' },
  { v: 'sporty', l: 'Sporty' },
  { v: 'playful', l: 'Playful' },
  { v: 'smart', l: 'Smart' },
  { v: 'cosy', l: 'Cosy' },
]
const BUDGETS = [
  { v: 1000, l: 'Up to ₹1,000' },
  { v: 2000, l: 'Up to ₹2,000' },
  { v: 3000, l: 'Up to ₹3,000' },
  { v: 5000, l: 'Up to ₹5,000' },
  { v: 0, l: 'No limit' },
]
const KID_SIZES = ['2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y', '8-9Y', '9-10Y', '10-11Y', '11-12Y', '12-13Y', '13-14Y']
const INFANT_SIZES = ['0-3M', '3-6M', '6-9M', '9-12M', '12-18M', '18-24M']
const SHOE_SIZES = ['UK 5K', 'UK 6K', 'UK 7K', 'UK 8K', 'UK 9K', 'UK 10K', 'UK 11K', 'UK 12K', 'UK 13K', 'UK 1', 'UK 2', 'UK 3', 'UK 4', 'UK 5']

const isInfant = (age: string) => age.endsWith('m')
const years = (age: string) => (isInfant(age) ? 0 : Number(age))
function ageGroup(age: string): AgeGroup {
  if (isInfant(age)) return '0-2'
  const y = Number(age)
  return y <= 5 ? '2-5' : y <= 9 ? '6-9' : '10-14'
}
function suggestApparel(age: string) {
  if (age === '0-6m') return '3-6M'
  if (age === '6-12m') return '9-12M'
  if (age === '12-24m') return '18-24M'
  const y = Math.min(13, Math.max(2, Number(age)))
  return `${y}-${y + 1}Y`
}
function suggestShoe(age: string) {
  if (isInfant(age)) return age === '0-6m' ? '0-6M' : age === '6-12m' ? '6-12M' : '12-18M'
  const y = Number(age)
  const map: Record<number, string> = { 2: 'UK 7K', 3: 'UK 8K', 4: 'UK 10K', 5: 'UK 11K', 6: 'UK 12K', 7: 'UK 13K', 8: 'UK 1', 9: 'UK 2', 10: 'UK 3', 11: 'UK 4', 12: 'UK 5', 13: 'UK 5', 14: 'UK 5' }
  return map[y] ?? 'UK 1'
}

/** Pick the product size closest to the target, preferring in-stock sizes. */
function pickSize(p: Product, color: string, target: string): { size: string; exact: boolean } | null {
  if (p.sizeSystem === 'one-size') return stockFor(p, color, 'One size') > 0 ? { size: 'One size', exact: true } : null
  if (p.sizes.includes(target) && stockFor(p, color, target) > 0) return { size: target, exact: true }
  const ref = [...KID_SIZES, ...INFANT_SIZES, ...SHOE_SIZES, '0-6M', '6-12M', '12-18M']
  const order = (s: string) => {
    const a = SHOE_SIZES.indexOf(s)
    if (a >= 0) return a
    const k = KID_SIZES.indexOf(s)
    if (k >= 0) return k
    const i = INFANT_SIZES.indexOf(s)
    if (i >= 0) return i
    return ['0-6M', '6-12M', '12-18M'].indexOf(s) * 2
  }
  const t = order(target)
  const candidates = p.sizes.filter((s) => stockFor(p, color, s) > 0 && ref.includes(s))
  if (!candidates.length) return null
  candidates.sort((a, b) => Math.abs(order(a) - t) - Math.abs(order(b) - t))
  const best = candidates[0]
  if (Math.abs(order(best) - t) > 2) return null
  return { size: best, exact: false }
}

type Pick = { p: Product; color: string; size: string; exact: boolean; score: number; reasons: string[]; slot: Slot }
type Slot = 'outfit' | 'top' | 'bottom' | 'layer' | 'shoes' | 'extra'
function slotOf(p: Product): Slot {
  if (p.departments.includes('footwear')) return 'shoes'
  if (p.type === 'Soft Toys') return 'extra'
  if (p.type === 'Dresses' || p.type === 'Sets') return 'outfit'
  if (p.type === 'Jackets') return 'layer'
  if (['Jeans', 'Trousers', 'Shorts & Skirts'].includes(p.type)) return 'bottom'
  return 'top'
}

function recommend(prefs: Prefs) {
  const group = ageGroup(prefs.age)
  const apparelTarget = prefs.apparelSize || suggestApparel(prefs.age)
  const shoeTarget = prefs.shoeSize || suggestShoe(prefs.age)
  const out: Pick[] = []
  for (const p of products) {
    if (isProductSoldOut(p)) continue
    if (!p.ageGroups.includes(group)) continue
    if (group === '0-2' && !p.departments.includes('infants')) continue
    if (group !== '0-2' && p.departments.includes('infants') && !p.departments.includes('accessories')) continue
    if (prefs.gender === 'girl' && p.gender === 'boys') continue
    if (prefs.gender === 'boy' && p.gender === 'girls') continue
    if (prefs.budget && p.price > prefs.budget) continue
    const reasons: string[] = []
    let score = p.popularity / 40
    // colour
    const fams = colorFamiliesOf(p)
    let color = p.colors.find((c) => !c.soldOut)!.name
    if (prefs.colors.length) {
      const hit = p.colors.find((c) => !c.soldOut && allColorFamilies.some((f) => prefs.colors.includes(f.name) && f.match.test(c.name)))
      if (hit) {
        color = hit.name
        score += 2
        reasons.push(`Comes in ${hit.name.toLowerCase()}`)
      } else if (!fams.some((f) => prefs.colors.includes(f))) score -= 1
    }
    const isShoe = p.departments.includes('footwear')
    const sz = pickSize(p, color, isShoe ? shoeTarget : apparelTarget)
    if (!sz) continue
    if (prefs.occasion) {
      if (p.occasions.includes(prefs.occasion)) {
        score += 3
        reasons.push(`Made for ${OCCASIONS.find((o) => o.v === prefs.occasion)!.l.toLowerCase()}`)
      } else score -= 2
    }
    const styleHits = prefs.styles.filter((s) => p.styles.includes(s))
    if (styleHits.length) {
      score += styleHits.length * 2
      reasons.push(`${styleHits.map((s) => STYLES.find((x) => x.v === s)!.l).join(' & ')} feel`)
    }
    if (prefs.budget) reasons.push(`${formatINR(p.price)} — within your budget`)
    reasons.push(sz.exact ? `In stock in ${sz.size}` : `Nearest available size: ${sz.size}`)
    if (p.isNew) {
      score += 0.5
      reasons.push('New this season')
    }
    out.push({ p, color, size: sz.size, exact: sz.exact, score, reasons, slot: slotOf(p) })
  }
  out.sort((a, b) => b.score - a.score)
  // Build up to two looks — each look stays coherent (one gender + unisex pieces)
  const used = new Set<string>()
  let lookGender: string | null = null
  const fits = (o: (typeof out)[number]) => !lookGender || o.p.gender === 'unisex' || o.p.gender === lookGender
  const claim = (o: (typeof out)[number]) => {
    used.add(o.p.handle)
    if (!lookGender && o.p.gender !== 'unisex') lookGender = o.p.gender
  }
  const take = (slot: Slot) => {
    const x = out.find((o) => o.slot === slot && !used.has(o.p.handle) && fits(o))
    if (x) claim(x)
    return x
  }
  const looks: { title: string; items: Pick[] }[] = []
  for (let i = 0; i < 2; i++) {
    lookGender = null
    const items: Pick[] = []
    const outfit = out.find((o) => o.slot === 'outfit' && !used.has(o.p.handle))
    const top = out.find((o) => o.slot === 'top' && !used.has(o.p.handle))
    const bottom = out.find((o) => o.slot === 'bottom' && !used.has(o.p.handle) && (!top || top.p.gender === 'unisex' || o.p.gender === 'unisex' || o.p.gender === top.p.gender))
    const useOutfit = outfit && (!top || !bottom || outfit.score >= (top.score + bottom.score) / 2)
    if (useOutfit && outfit) {
      claim(outfit)
      items.push(outfit)
    } else {
      const t = take('top')
      const b = take('bottom')
      if (t) items.push(t)
      if (b) items.push(b)
    }
    const layer = take('layer')
    if (layer && items.length) items.push(layer)
    const shoes = take('shoes')
    if (shoes) items.push(shoes)
    if (!items.length) {
      const extra = take('extra')
      if (extra) items.push(extra)
    }
    if (items.length >= 2) looks.push({ title: i === 0 ? 'Look one' : 'Look two', items })
    else items.forEach((x) => used.delete(x.p.handle))
  }
  return { looks, ranked: out.slice(0, 8), apparelTarget, shoeTarget, total: out.length }
}

function loadPrefs(): Prefs {
  try {
    const s = sessionStorage.getItem(KEY)
    return s ? { ...DEFAULT, ...JSON.parse(s) } : DEFAULT
  } catch {
    return DEFAULT
  }
}

function PickRow({ x, rank }: { x: Pick; rank?: number }) {
  const wished = useWishlist((s) => s.items.some((i) => i.handle === x.p.handle))
  const [busy, setBusy] = useState(false)
  const img = x.p.colors.find((c) => c.name === x.color)!.images[0]
  const href = `/products/${x.p.handle}?color=${encodeURIComponent(x.color)}`
  return (
    <li className="ask-pick">
      {/* Duplicate of the name link below: pointer-only, hidden from keyboard and screen readers (WCAG 2.4.4). */}
      <Link to={href} className="ask-pick__img" tabIndex={-1} aria-hidden="true">
        <img src={img} alt="" loading="lazy" />
        {rank !== undefined && <span className="ask-pick__rank">{rank}</span>}
      </Link>
      <div className="ask-pick__body">
        <Link to={href} className="ask-pick__name">
          {x.p.name}
          {rank !== undefined && <span className="sr-only">, pick {rank}</span>}
        </Link>
        <p className="muted body-sm">
          {x.color} · {x.size} · <Price price={x.p.price} compareAt={x.p.compareAt} />
        </p>
        <ul role="list" className="ask-pick__why" aria-label="Why we picked this">
          {x.reasons.slice(0, 3).map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <div className="ask-pick__actions">
          <button
            type="button"
            className={`btn btn--sm${busy ? ' is-loading' : ''}`}
            onClick={() => {
              setBusy(true)
              setTimeout(() => {
                addToBag(x.p.handle, x.color, x.size, 1, { openDrawer: false })
                setBusy(false)
              }, 350)
            }}
          >
            Add {x.size}
          </button>
          <button type="button" className={`icon-btn ask-pick__wish${wished ? ' is-on' : ''}`} aria-pressed={wished} aria-label={wished ? `Remove ${x.p.name} from wishlist` : `Save ${x.p.name} to wishlist`} onClick={() => toggleWish(x.p.handle, x.color)}>
            <Icon name={wished ? 'heart-fill' : 'heart'} size={19} />
          </button>
          <Link to={href} className="link">
            View
          </Link>
        </div>
      </div>
    </li>
  )
}

export default function AskPurple() {
  useMeta('Ask Purple — styling help', 'Tell us their age, the occasion and your budget — Ask Purple suggests looks from the collection in their size.')
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs)
  const [applied, setApplied] = useState<Prefs | null>(() => {
    try {
      return sessionStorage.getItem(KEY) ? loadPrefs() : null
    } catch {
      return null
    }
  })
  const resultsRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const set = <K extends keyof Prefs>(k: K, v: Prefs[K]) => setPrefs((p) => ({ ...p, [k]: v }))
  const toggleIn = <K extends 'styles' | 'colors'>(k: K, v: Prefs[K][number]) =>
    setPrefs((p) => ({ ...p, [k]: (p[k] as string[]).includes(v) ? (p[k] as string[]).filter((x) => x !== v) : [...(p[k] as string[]), v] }))

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(prefs))
    } catch {
      /* storage unavailable — preferences stay in memory */
    }
  }, [prefs])

  const result = useMemo(() => (applied ? recommend(applied) : null), [applied])
  const autoApparel = suggestApparel(prefs.age)
  const autoShoe = suggestShoe(prefs.age)
  const infant = isInfant(prefs.age)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setApplied({ ...prefs })
    setTimeout(() => resultsRef.current?.focus(), 60)
  }
  const addLook = (items: Pick[]) => {
    let n = 0
    items.forEach((x) => {
      if (addToBag(x.p.handle, x.color, x.size, 1, { openDrawer: false, silent: true })) n++
    })
    if (n) useUI.getState().setCart(true)
  }

  const summary = applied
    ? [
        AGES.find((a) => a.v === applied.age)?.l,
        applied.gender === 'any' ? null : applied.gender === 'girl' ? 'girl' : 'boy',
        applied.occasion ? OCCASIONS.find((o) => o.v === applied.occasion)?.l.toLowerCase() : null,
        applied.styles.length ? applied.styles.join(', ') : null,
        applied.budget ? `up to ${formatINR(applied.budget)} a piece` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : ''

  return (
    <div className="ask-page">
      <section className="container ask-head">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Ask Purple' }]} />
        <div className="ask-head__row">
          <span className="ask-head__icon" aria-hidden="true">
            <Icon name="sparkle" size={28} />
          </span>
          <div>
            <p className="eyebrow">Ask Purple · styling help</p>
            <h1 className="h1">
              Tell us about them. <em>We’ll find the looks.</em>
            </h1>
            <p className="lead">A few details about the child you’re shopping for — we’ll suggest pieces and complete looks from the collection, in their size.</p>
            <p className="demo-note">This demo uses simple rules over the catalogue — not live AI. Every suggestion explains why it was picked.</p>
          </div>
        </div>
      </section>

      <section className="container ask-grid">
        <form className="ask-form" ref={formRef} onSubmit={submit} aria-label="Shopping preferences">
          <div className="ask-q">
            <label htmlFor="ask-age" className="ask-q__label">
              How old are they?
            </label>
            <select
              id="ask-age"
              className="select"
              value={prefs.age}
              onChange={(e) => setPrefs((p) => ({ ...p, age: e.target.value, apparelSize: '', shoeSize: '' }))}
            >
              {AGES.map((a) => (
                <option key={a.v} value={a.v}>
                  {a.l}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="ask-q">
            <legend className="ask-q__label">Shopping for</legend>
            <div className="chips">
              {(
                [
                  ['girl', 'A girl'],
                  ['boy', 'A boy'],
                  ['any', 'Show me everything'],
                ] as const
              ).map(([v, l]) => (
                <button key={v} type="button" className={`chip${prefs.gender === v ? ' is-active' : ''}`} aria-pressed={prefs.gender === v} onClick={() => set('gender', v)}>
                  {l}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="ask-q">
            <legend className="ask-q__label">What’s the occasion?</legend>
            <div className="chips">
              {OCCASIONS.map((o) => (
                <button key={o.v} type="button" className={`chip${prefs.occasion === o.v ? ' is-active' : ''}`} aria-pressed={prefs.occasion === o.v} onClick={() => set('occasion', prefs.occasion === o.v ? '' : o.v)}>
                  {o.l}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="ask-q">
            <legend className="ask-q__label">
              Their style <span className="muted">(choose any)</span>
            </legend>
            <div className="chips">
              {STYLES.map((s) => (
                <button key={s.v} type="button" className={`chip${prefs.styles.includes(s.v) ? ' is-active' : ''}`} aria-pressed={prefs.styles.includes(s.v)} onClick={() => toggleIn('styles', s.v)}>
                  {s.l}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="ask-q">
            <label htmlFor="ask-budget" className="ask-q__label">
              Budget per piece
            </label>
            <select id="ask-budget" className="select" value={prefs.budget} onChange={(e) => set('budget', Number(e.target.value))}>
              {BUDGETS.map((b) => (
                <option key={b.v} value={b.v}>
                  {b.l}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="ask-q ask-q--sizes">
            <legend className="ask-q__label">Sizes</legend>
            <div className="ask-sizes">
              <div className="field">
                <label htmlFor="ask-apparel" className="field__label">
                  Clothing
                </label>
                <select id="ask-apparel" className="select" value={prefs.apparelSize} onChange={(e) => set('apparelSize', e.target.value)}>
                  <option value="">Suggested: {autoApparel}</option>
                  {(infant ? INFANT_SIZES : KID_SIZES).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="ask-shoe" className="field__label">
                  Shoes <span className="opt">(optional)</span>
                </label>
                <select id="ask-shoe" className="select" value={prefs.shoeSize} onChange={(e) => set('shoeSize', e.target.value)}>
                  <option value="">Suggested: {autoShoe}</option>
                  {(infant ? ['0-6M', '6-12M', '12-18M'] : SHOE_SIZES).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="field__hint">
              Suggested from age using our general size guide. <Link to="/help#sizing" className="text-link">How we size</Link>
            </p>
          </fieldset>

          <fieldset className="ask-q">
            <legend className="ask-q__label">
              Colours they love <span className="muted">(optional)</span>
            </legend>
            <div className="ask-colors">
              {allColorFamilies.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  className={`ask-color${prefs.colors.includes(c.name) ? ' is-on' : ''}`}
                  aria-pressed={prefs.colors.includes(c.name)}
                  onClick={() => toggleIn('colors', c.name)}
                >
                  <span style={{ background: c.hex }} aria-hidden="true" />
                  {c.name}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="ask-form__foot">
            <button type="submit" className="btn">
              <Icon name="sparkle" size={18} /> {applied ? 'Update suggestions' : 'Show suggestions'}
            </button>
            <button
              type="button"
              className="link"
              onClick={() => {
                setPrefs(DEFAULT)
                setApplied(null)
                try {
                  sessionStorage.removeItem(KEY)
                } catch {
                  /* ignore */
                }
              }}
            >
              Start again
            </button>
          </div>
        </form>

        <div className="ask-results" ref={resultsRef} tabIndex={-1} aria-live="polite" aria-label="Suggestions">
          {!result ? (
            <div className="ask-intro">
              <p className="signature ask-intro__quote">“Their personality, dressed with style.”</p>
              <ol role="list" className="ask-intro__steps">
                <li>
                  <span>01</span> Tell us their age — we’ll suggest a size.
                </li>
                <li>
                  <span>02</span> Add the occasion, style and budget.
                </li>
                <li>
                  <span>03</span> Get complete looks, with the reasons behind every pick.
                </li>
              </ol>
              <p className="muted body-sm">Prefer to browse? <Link to="/collections/new-arrivals" className="text-link">Shop new arrivals</Link> or <Link to="/stores" className="text-link">visit a store</Link> for in-person help.</p>
            </div>
          ) : result.total === 0 ? (
            <div className="ask-none">
              <h2 className="h3">Nothing quite fits — yet.</h2>
              <p className="muted">
                No pieces match {summary}. Try a higher budget, fewer styles or a different occasion.
              </p>
              <div className="chips">
                {applied!.budget > 0 && (
                  <button type="button" className="chip" onClick={() => { const n = { ...prefs, budget: 0 }; setPrefs(n); setApplied(n) }}>
                    Remove budget limit
                  </button>
                )}
                {applied!.styles.length > 0 && (
                  <button type="button" className="chip" onClick={() => { const n = { ...prefs, styles: [] as Style[] }; setPrefs(n); setApplied(n) }}>
                    Any style
                  </button>
                )}
                {applied!.occasion && (
                  <button type="button" className="chip" onClick={() => { const n = { ...prefs, occasion: '' as const }; setPrefs(n); setApplied(n) }}>
                    Any occasion
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="ask-summary">
                <p className="eyebrow">Suggestions for</p>
                <p className="ask-summary__text">{summary}</p>
                <p className="muted body-sm">
                  Sizes: {result.apparelTarget} clothing · {result.shoeTarget} shoes · {result.total} matching pieces
                </p>
                <button type="button" className="link ask-summary__refine" onClick={() => formRef.current?.querySelector<HTMLElement>('select, button')?.focus()}>
                  <Icon name="edit" size={15} /> Refine
                </button>
              </div>

              {result.looks.map((look) => {
                const total = look.items.reduce((s, x) => s + x.p.price, 0)
                return (
                  <section key={look.title} className="ask-look" aria-label={look.title}>
                    <div className="ask-look__head">
                      <h2 className="h3">
                        {look.title}
                        <em> · {look.items.map((x) => x.p.type.split(' ')[0].toLowerCase()).join(', ')}</em>
                      </h2>
                      <div className="ask-look__total">
                        <span className="muted body-sm">Look total</span>
                        <strong>{formatINR(total)}</strong>
                      </div>
                    </div>
                    <div className="ask-look__strip">
                      {look.items.map((x) => (
                        <Link key={x.p.handle} to={`/products/${x.p.handle}?color=${encodeURIComponent(x.color)}`} className="ask-look__tile">
                          <img src={x.p.colors.find((c) => c.name === x.color)!.images[0]} alt="" loading="lazy" />
                          <span>{x.p.name}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="ask-look__actions">
                      <button type="button" className="btn btn--sm" onClick={() => addLook(look.items)}>
                        <Icon name="bag" size={16} /> Add look to bag
                      </button>
                      <span className="muted body-sm">{look.items.some((x) => !x.exact) ? 'Includes nearest available sizes' : 'All pieces in your sizes'}</span>
                    </div>
                  </section>
                )
              })}

              <section className="ask-ranked" aria-label="Top picks">
                <h2 className="h3">Top picks, ranked</h2>
                <ul role="list">
                  {result.ranked.map((x, i) => (
                    <PickRow key={x.p.handle} x={x} rank={i + 1} />
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
