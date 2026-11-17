import '../styles/commerce.css'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Breadcrumbs, Img } from '../components/ui'
import { ProductCard } from '../components/ProductCard'
import { searchProducts } from '../components/Overlays'
import { useMeta } from '../lib/hooks'

const DEPTS = [
  { k: 'all', label: 'All' },
  { k: 'girls', label: 'Girls' },
  { k: 'boys', label: 'Boys' },
  { k: 'infants', label: 'Infants' },
  { k: 'footwear', label: 'Footwear' },
  { k: 'accessories', label: 'Accessories' },
] as const
type Dept = (typeof DEPTS)[number]['k']

const SORTS = [
  { k: 'relevance', label: 'Most relevant' },
  { k: 'newest', label: 'Newest' },
  { k: 'price-asc', label: 'Price, low to high' },
  { k: 'price-desc', label: 'Price, high to low' },
] as const

const SUGGEST = ['Knitted sweater', 'Varsity jacket', 'Party dress', 'Sneakers', 'Denim', 'First walkers', 'Hoodie', 'Ballerinas']

export default function Search() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const dept = (params.get('dept') as Dept) || 'all'
  const sort = params.get('sort') || 'relevance'
  const [input, setInput] = useState(q)
  useEffect(() => setInput(q), [q])
  useMeta(q ? `Search: ${q}` : 'Search', q ? `Search results for “${q}” at Purple United Kids.` : 'Search Purple United Kids.', { canonical: '/search' })

  const base = useMemo(() => searchProducts(q), [q])
  const results = useMemo(() => {
    let r = dept === 'all' ? base : base.filter((p) => p.departments.includes(dept))
    if (sort === 'newest') r = [...r].sort((a, b) => b.addedAt.localeCompare(a.addedAt))
    if (sort === 'price-asc') r = [...r].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') r = [...r].sort((a, b) => b.price - a.price)
    return r
  }, [base, dept, sort])

  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([k, v]) => (v === null || v === '' || v === 'all' || v === 'relevance' ? next.delete(k) : next.set(k, v)))
    setParams(next, { replace: true })
  }

  const counts = useMemo(() => Object.fromEntries(DEPTS.map((d) => [d.k, d.k === 'all' ? base.length : base.filter((p) => p.departments.includes(d.k)).length])), [base])

  return (
    <div className="cm-page">
      <div className="container">
        <header className="cm-head">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Search' }]} />
          <div className="cm-head__title">
            <h1 className="eyebrow">Search{q ? <span className="sr-only"> results for “{q}”</span> : null}</h1>
            <form
              className="srch-form"
              role="search"
              onSubmit={(e) => {
                e.preventDefault()
                const next = new URLSearchParams()
                if (input.trim()) next.set('q', input.trim())
                setParams(next)
              }}
            >
              <label htmlFor="search-page-q" className="sr-only">
                Search products
              </label>
              <input id="search-page-q" value={input} onChange={(e) => setInput(e.target.value)} placeholder="What are you looking for?" autoComplete="off" />
              {input && (
                <button type="button" className="icon-btn" aria-label="Clear search" onClick={() => setInput('')}>
                  <Icon name="close" />
                </button>
              )}
              <button type="submit" className="icon-btn" aria-label="Search">
                <Icon name="search" />
              </button>
            </form>
            {q && (
              <p className="cm-count" aria-live="polite">
                {results.length} {results.length === 1 ? 'result' : 'results'} for “{q}”
                {dept !== 'all' ? ` in ${DEPTS.find((d) => d.k === dept)?.label}` : ''}
              </p>
            )}
          </div>
        </header>

        {!q ? (
          <SearchEmpty title="Start with a word or two." body="Try a product, a colour or an occasion — or browse a few favourites below." />
        ) : base.length === 0 ? (
          <SearchEmpty title={`We couldn’t find “${q}”.`} body="Check the spelling, try a broader word like “jacket” or “shoes”, or let our stylist suggest looks in their size." />
        ) : (
          <>
            <div className="srch-bar">
              <div className="chips" role="group" aria-label="Filter by department">
                {DEPTS.filter((d) => d.k === 'all' || counts[d.k] > 0).map((d) => (
                  <button key={d.k} type="button" className="chip" aria-pressed={dept === d.k} onClick={() => set({ dept: d.k })}>
                    {d.label} <span className="muted">({counts[d.k]})</span>
                  </button>
                ))}
              </div>
              <label className="sort-control">
                Sort by
                <select className="select" value={sort} onChange={(e) => set({ sort: e.target.value })}>
                  {SORTS.map((s) => (
                    <option key={s.k} value={s.k}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {results.length === 0 ? (
              <div className="empty">
                <h2 className="h3">Nothing in this department.</h2>
                <button type="button" className="btn btn--outline" onClick={() => set({ dept: 'all' })}>
                  Show all results
                </button>
              </div>
            ) : (
              <>
                {/* Keeps the outline h1 → h2 → product h3 (WCAG 1.3.1). */}
                <h2 className="sr-only">Results</h2>
                <div className="pgrid">
                  {results.map((p, i) => (
                    <ProductCard key={p.handle} product={p} priority={i < 4} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function SearchEmpty({ title, body }: { title: string; body: string }) {
  return (
    <div className="srch-empty">
      <div className="srch-empty__text">
        <h2 className="h2">{title}</h2>
        <p className="lead">{body}</p>
        <p className="eyebrow" style={{ marginTop: 8 }}>
          Popular searches
        </p>
        <div className="chips" style={{ marginTop: 0 }}>
          {SUGGEST.map((s) => (
            <Link key={s} to={`/search?q=${encodeURIComponent(s)}`} className="chip">
              {s}
            </Link>
          ))}
        </div>
        <Link to="/ask-purple" className="btn" style={{ marginTop: 12 }}>
          <Icon name="sparkle" size={18} /> Ask Purple stylist
        </Link>
      </div>
      <div className="srch-empty__cats">
        {[
          { l: 'Girls', to: '/collections/girls', img: '/img/campaign/wardrobe/shop-girls.webp' },
          { l: 'Boys', to: '/collections/boys', img: '/img/campaign/wardrobe/shop-boys.webp' },
          { l: 'Infants', to: '/collections/infants', img: '/img/campaign/wardrobe/shop-infants.webp' },
          { l: 'New in', to: '/collections/new-arrivals', img: '/img/campaign/wardrobe/shop-new.webp' },
        ].map((c) => (
          <Link key={c.l} to={c.to} className="srch-empty__cat">
            <Img src={c.img} alt="" pos="50% 25%" />
            <span>{c.l}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
