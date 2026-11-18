import '../styles/experience.css'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Breadcrumbs, Price } from '../components/ui'
import { formatINR, allColorFamilies, type Style } from '../data/products'
import { useWishlist, useUI } from '../store'
import { addToBag, toggleWish } from '../lib/commerce'
import { useMeta } from '../lib/hooks'
import {
  AGES,
  OCCASIONS,
  STYLES,
  BUDGETS,
  KID_SIZES,
  INFANT_SIZES,
  SHOE_SIZES,
  INFANT_SHOE_SIZES,
  DEFAULT_PREFS as DEFAULT,
  PREFS_KEY as KEY,
  isInfant,
  suggestApparel,
  suggestShoe,
  recommend,
  loadPrefs,
  type Prefs,
  type Pick,
} from '../lib/askPurple'

/* ==========================================================================
   Ask Purple — transparent, rule-based stylist over the demo catalogue.
   Not AI: every suggestion comes from the scoring rules in lib/askPurple.ts
   (shared with the floating Ask Purple chat).
   ========================================================================== */

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
              {!BUDGETS.some((b) => b.v === prefs.budget) && <option value={prefs.budget}>Up to {formatINR(prefs.budget)}</option>}
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
                  {(infant ? INFANT_SHOE_SIZES : SHOE_SIZES).map((s) => (
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
