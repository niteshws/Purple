import '../styles/experience.css'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Breadcrumbs, EmptyState, Img } from '../components/ui'
import { stores, storeStates, directionsUrl, telHref, type Store } from '../data/stores'
import { STORE_COUNT } from '../data/site'
import { useMeta } from '../lib/hooks'

const PAGE = 12

export function StoreCard({ s, compact }: { s: Store; compact?: boolean }) {
  return (
    <article className={`store-card${compact ? ' store-card--compact' : ''}`}>
      <div className="store-card__head">
        <p className="eyebrow">{[s.city, s.state].filter(Boolean).join(', ')}</p>
        <h3 className="h4">
          <Link to={`/stores/${s.id}`}>{s.name}</Link>
        </h3>
      </div>
      <p className="store-card__addr">
        <Icon name="pin" size={17} />
        <span>{s.address}</span>
      </p>
      <p className="store-card__meta">
        <Icon name="clock" size={17} />
        <span>{s.hours ? `Open daily · ${s.hours}` : 'Hours not listed'}</span>
      </p>
      {s.phone && (
        <p className="store-card__meta">
          <Icon name="phone" size={17} />
          <a href={telHref(s.phone)} className="text-link">
            {s.phone}
          </a>
        </p>
      )}
      <div className="store-card__actions">
        <Link to={`/stores/${s.id}`} className="btn btn--sm">
          Store details
        </Link>
        <a href={directionsUrl(s)} target="_blank" rel="noreferrer" className="link">
          Directions <Icon name="arrow" size={14} className="icon-arrow" />
          <span className="sr-only"> (opens Google Maps in a new tab)</span>
        </a>
      </div>
    </article>
  )
}

export default function Stores() {
  useMeta('Store locator', `Find your nearest Purple United Kids store — ${STORE_COUNT} stores across India. Addresses, opening hours, phone numbers and directions.`)
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const state = params.get('state') ?? ''
  const city = params.get('city') ?? ''
  const [draft, setDraft] = useState(q)
  const [shown, setShown] = useState(PAGE)
  const [locNote, setLocNote] = useState(false)

  useEffect(() => setDraft(q), [q])
  useEffect(() => setShown(PAGE), [q, state, city])

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)))
    setParams(next, { replace: true })
  }

  const cityOptions = useMemo(
    () => Array.from(new Set(stores.filter((s) => !state || s.state === state).map((s) => s.city))).sort(),
    [state],
  )

  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    return stores
      .filter((s) => (!state || s.state === state) && (!city || s.city === city))
      .filter((s) => !t || `${s.name} ${s.address} ${s.city} ${s.state} ${s.pincode}`.toLowerCase().includes(t))
      .sort((a, b) => a.state.localeCompare(b.state) || a.city.localeCompare(b.city) || a.name.localeCompare(b.name))
  }, [q, state, city])

  const stateCounts = useMemo(() => {
    const m = new Map<string, number>()
    stores.forEach((s) => s.state && m.set(s.state, (m.get(s.state) ?? 0) + 1))
    return m
  }, [])

  return (
    <div className="stores-page">
      <section className="stores-hero on-dark">
        <Img src="/img/retail/store-facade.webp" alt="Concept rendering of a Purple United boutique façade with arched windows" className="stores-hero__img" eager />
        <div className="stores-hero__shade" aria-hidden="true" />
        <div className="container stores-hero__inner">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Store locator' }]} />
          <p className="eyebrow">Visit us</p>
          <h1 className="h1">
            {STORE_COUNT} stores. <em>One Purple.</em>
          </h1>
          <p className="stores-hero__lead">See, touch and try the collection with our in-store team — from Punjab to Pune, Guwahati to Gurugram.</p>
          <form
            className="stores-search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault()
              update({ q: draft.trim() })
            }}
          >
            <label htmlFor="stores-q" className="sr-only">
              Search by city, store name or pincode
            </label>
            <Icon name="search" size={20} />
            <input id="stores-q" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="City, store name or pincode" autoComplete="off" />
            {draft && (
              <button
                type="button"
                className="icon-btn"
                aria-label="Clear search"
                onClick={() => {
                  setDraft('')
                  update({ q: '' })
                }}
              >
                <Icon name="close" size={18} />
              </button>
            )}
            <button type="submit" className="btn btn--sm">
              Search
            </button>
          </form>
          <p className="demo-note stores-hero__note">Façade shown is the proposed retail identity (concept).</p>
        </div>
      </section>

      <section className="container stores-body">
        <div className="stores-filters">
          <div className="stores-filters__row">
            <div className="stores-chips" role="group" aria-label="Filter by state">
              <button type="button" className={`chip${!state ? ' is-active' : ''}`} aria-pressed={!state} onClick={() => update({ state: '', city: '' })}>
                All India
              </button>
              {storeStates.map((st) => (
                <button key={st} type="button" className={`chip${state === st ? ' is-active' : ''}`} aria-pressed={state === st} onClick={() => update({ state: state === st ? '' : st, city: '' })}>
                  {st} <span className="stores-chips__n">{stateCounts.get(st)}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="stores-filters__row stores-filters__row--split">
            <div className="field stores-city">
              <label htmlFor="stores-city" className="field__label">
                City
              </label>
              <select id="stores-city" className="select" value={city} onChange={(e) => update({ city: e.target.value })}>
                <option value="">All cities{state ? ` in ${state}` : ''}</option>
                {cityOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="stores-loc">
              <button type="button" className="btn btn--outline btn--sm" onClick={() => setLocNote((v) => !v)} aria-expanded={locNote} aria-controls="loc-note">
                <Icon name="direction" size={16} /> Use my location
              </button>
              {locNote && (
                <p id="loc-note" className="stores-loc__note" role="status">
                  Distance-based search arrives with the live store integration. For now, search by city or pincode.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="stores-summary" aria-live="polite">
          <p>
            <strong>{results.length}</strong> {results.length === 1 ? 'store' : 'stores'}
            {q && (
              <>
                {' '}
                matching “{q}”
              </>
            )}
            {city ? ` in ${city}` : state ? ` in ${state}` : ''}
          </p>
          {(q || state || city) && (
            <button type="button" className="link" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
              Clear all
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <EmptyState
            icon="store"
            title="No stores found"
            body="We couldn’t find a store for that search. Try a nearby city, a different spelling, or browse all stores."
            action={
              <button type="button" className="btn" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
                Show all {STORE_COUNT} stores
              </button>
            }
          />
        ) : (
          <>
            <div className="stores-grid">
              {results.slice(0, shown).map((s) => (
                <StoreCard key={s.id} s={s} />
              ))}
            </div>
            {shown < results.length && (
              <div className="exp-center-cta stores-more">
                <p className="muted body-sm">
                  Showing {Math.min(shown, results.length)} of {results.length}
                </p>
                <button type="button" className="btn btn--outline" onClick={() => setShown((n) => n + PAGE)}>
                  Show more stores
                </button>
              </div>
            )}
          </>
        )}
        <p className="demo-note stores-source">Store information from Purple United’s store locator, Nov 2026 — verify before launch.</p>
      </section>

      <section className="stores-promise bg-oat">
        <div className="container stores-promise__grid">
          {[
            ['ruler', 'Try before you buy', 'Fitting help from our in-store team, for every age from newborn to 14.'],
            ['return', 'Easy size exchanges', 'Exchange unused items with tags intact within 7 days — conditions apply.'],
            ['gift', 'Gift wrapping', 'Ask in store for gifting help and a Purple gift card.'],
          ].map(([icon, t, d]) => (
            <div key={t} className="stores-promise__item">
              <Icon name={icon as 'ruler'} size={26} />
              <h2 className="h4">{t}</h2>
              <p className="muted">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
