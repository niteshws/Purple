import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Breadcrumbs, Img, EmptyState } from '../components/ui'
import { ProductCard } from '../components/ProductCard'
import { collectionByHandle } from '../data/collections'
import { products, allColorFamilies, colorFamiliesOf, stockFor, formatINR, AGE_LABELS, type Product, type AgeGroup, type Department } from '../data/products'
import { useLockScroll, useMeta, useMedia } from '../lib/hooks'
import NotFound from './NotFound'

const SORTS = [
  { k: 'featured', label: 'Featured' },
  { k: 'newest', label: 'Newest' },
  { k: 'price-asc', label: 'Price: low to high' },
  { k: 'price-desc', label: 'Price: high to low' },
  { k: 'best', label: 'Best selling' },
] as const
const DEPTS: { k: Department; label: string }[] = [
  { k: 'boys', label: 'Boys' },
  { k: 'girls', label: 'Girls' },
  { k: 'infants', label: 'Infants' },
  { k: 'footwear', label: 'Footwear' },
  { k: 'accessories', label: 'Accessories' },
]
const AGES: AgeGroup[] = ['0-2', '2-5', '6-9', '10-14']
const SIZE_ORDER = [
  '0-3M', '3-6M', '6-9M', '9-12M', '12-18M', '18-24M', '0-6M', '6-12M',
  '2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y', '8-9Y', '9-10Y', '10-11Y', '11-12Y', '12-13Y', '13-14Y',
  'UK 5K', 'UK 6K', 'UK 7K', 'UK 8K', 'UK 9K', 'UK 10K', 'UK 11K', 'UK 12K', 'UK 13K', 'UK 1', 'UK 2', 'UK 3', 'UK 4', 'UK 5', 'One size',
]
const PAGE = 12

type Filters = {
  dept: string[]
  type: string[]
  age: string[]
  size: string[]
  color: string[]
  max: number | null
  instock: boolean
}

const list = (sp: URLSearchParams, k: string) => (sp.get(k) ? sp.get(k)!.split(',').filter(Boolean) : [])

function readFilters(sp: URLSearchParams): Filters {
  return {
    dept: list(sp, 'dept'),
    type: list(sp, 'type'),
    age: list(sp, 'age'),
    size: list(sp, 'size'),
    color: list(sp, 'color'),
    max: sp.get('max') ? Number(sp.get('max')) : null,
    instock: sp.get('instock') === '1',
  }
}

function inStockAny(p: Product, sizes?: string[]) {
  return p.colors.some((c) => (sizes && sizes.length ? sizes.filter((s) => p.sizes.includes(s)) : p.sizes).some((s) => stockFor(p, c.name, s) > 0))
}

function apply(base: Product[], f: Filters, skip?: keyof Filters) {
  return base.filter((p) => {
    if (skip !== 'dept' && f.dept.length && !f.dept.some((d) => p.departments.includes(d as Department))) return false
    if (skip !== 'type' && f.type.length && !f.type.includes(p.type)) return false
    if (skip !== 'age' && f.age.length && !f.age.some((a) => p.ageGroups.includes(a as AgeGroup))) return false
    if (skip !== 'size' && f.size.length && !f.size.some((s) => p.sizes.includes(s))) return false
    if (skip !== 'color' && f.color.length && !colorFamiliesOf(p).some((c) => f.color.includes(c))) return false
    if (skip !== 'max' && f.max !== null && p.price > f.max) return false
    if (skip !== 'instock' && f.instock && !inStockAny(p, f.size)) return false
    return true
  })
}

function sortList(ls: Product[], sort: string) {
  const a = [...ls]
  switch (sort) {
    case 'newest':
      return a.sort((x, y) => y.addedAt.localeCompare(x.addedAt))
    case 'price-asc':
      return a.sort((x, y) => x.price - y.price)
    case 'price-desc':
      return a.sort((x, y) => y.price - x.price)
    case 'best':
      return a.sort((x, y) => y.popularity - x.popularity)
    default:
      return a.sort((x, y) => Number(!!y.isNew) * 30 + y.popularity - (Number(!!x.isNew) * 30 + x.popularity))
  }
}

export default function Collection() {
  const { handle = 'all' } = useParams()
  const c = collectionByHandle.get(handle)
  const [sp, setSp] = useSearchParams()
  const [drawer, setDrawer] = useState(false)
  const [pending, startTransition] = useTransition()
  const isMobile = useMedia('(max-width: 1000px)')
  useLockScroll(drawer && isMobile)
  const gridTop = useRef<HTMLDivElement>(null)

  const f = readFilters(sp)
  const sort = sp.get('sort') ?? 'featured'
  const shown = Math.max(PAGE, Number(sp.get('show') ?? PAGE))

  const base = useMemo(() => (c ? products.filter(c.filter) : []), [c])
  const filtered = useMemo(() => sortList(apply(base, f), sort), [base, sp.toString()])
  const priceMax = useMemo(() => Math.max(1000, Math.ceil(Math.max(...base.map((p) => p.price), 0) / 500) * 500), [base])

  useMeta(c ? `${c.title}${c.titleEm ? ` ${c.titleEm}` : ''} — Kids ${c.handle === 'footwear-accessories' ? 'Footwear & Accessories' : 'Clothing'}` : 'Collection not found', c?.description, {
    canonical: `/collections/${handle}`,
    jsonLd: c
      ? {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${c.title} ${c.titleEm ?? ''}`.trim(),
          description: c.description,
          url: `https://purpleunited.com/collections/${handle}`,
        }
      : undefined,
  })

  useEffect(() => {
    if (!drawer) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [drawer])

  if (!c) return <NotFound />

  const update = (patch: Record<string, string | null>, keepShow = false) => {
    startTransition(() => {
      const next = new URLSearchParams(sp)
      Object.entries(patch).forEach(([k, v]) => (v === null || v === '' ? next.delete(k) : next.set(k, v)))
      if (!keepShow) next.delete('show')
      setSp(next, { replace: true, preventScrollReset: true })
    })
  }
  const toggle = (key: 'dept' | 'type' | 'age' | 'size' | 'color', val: string) => {
    const cur = f[key]
    const next = cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val]
    update({ [key]: next.join(',') || null })
  }
  const clearAll = () => {
    const next = new URLSearchParams()
    if (sp.get('sort')) next.set('sort', sp.get('sort')!)
    setSp(next, { replace: true, preventScrollReset: true })
  }

  const chips: { label: string; onRemove: () => void }[] = [
    ...f.dept.map((d) => ({ label: DEPTS.find((x) => x.k === d)?.label ?? d, onRemove: () => toggle('dept', d) })),
    ...f.type.map((t) => ({ label: t, onRemove: () => toggle('type', t) })),
    ...f.age.map((a) => ({ label: AGE_LABELS[a as AgeGroup] ?? a, onRemove: () => toggle('age', a) })),
    ...f.size.map((s) => ({ label: `Size ${s}`, onRemove: () => toggle('size', s) })),
    ...f.color.map((s) => ({ label: s, onRemove: () => toggle('color', s) })),
    ...(f.max !== null ? [{ label: `Up to ${formatINR(f.max)}`, onRemove: () => update({ max: null }) }] : []),
    ...(f.instock ? [{ label: 'In stock', onRemove: () => update({ instock: null }) }] : []),
  ]

  // option counts (faceted: count with all other filters applied)
  const countBy = (key: keyof Filters, pred: (p: Product) => boolean) => apply(base, f, key).filter(pred).length
  const showDept = ['all', 'new-arrivals', 'best-sellers', 'winter-edit', 'denim', 'everyday-essentials', 'celebration-party', 'festive-dressing', 'weekend-adventures', 'special-moments', 'twinning-looks'].includes(handle)
  const types = Array.from(new Set(base.map((p) => p.type))).sort()
  const sizes = SIZE_ORDER.filter((s) => base.some((p) => p.sizes.includes(s)))
  const ages = AGES.filter((a) => base.some((p) => p.ageGroups.includes(a)))
  const colors = allColorFamilies.filter((cf) => base.some((p) => colorFamiliesOf(p).includes(cf.name)))
  const visible = filtered.slice(0, shown)

  const crumbs = [{ label: 'Home', to: '/' }, ...(handle !== 'all' ? [{ label: 'Shop', to: '/collections/all' }] : []), { label: `${c.title}${c.titleEm ? ` ${c.titleEm}` : ''}` }]

  return (
    <>
      <section className="coll-hero" aria-labelledby="coll-h">
        <div className="coll-hero__text">
          <Breadcrumbs items={crumbs} />
          <p className="eyebrow">{c.eyebrow}</p>
          <h1 id="coll-h" className="h1">
            {c.title} {c.titleEm && <em>{c.titleEm}</em>}
          </h1>
          <p className="lead">{c.description}</p>
          {c.related && (
            <div className="coll-hero__related" aria-label="Related categories">
              {c.related.map((r) => (
                <Link key={r.label} to={r.to} className="chip">
                  {r.label}
                </Link>
              ))}
            </div>
          )}
          {c.note && <p className="demo-note coll-hero__note">{c.note}</p>}
        </div>
        <div className="coll-hero__media">
          <Img src={c.image} alt="" pos={c.imagePosition} eager />
        </div>
      </section>

      <div className="container plp">
        {drawer && isMobile && <div className="filters-scrim" onClick={() => setDrawer(false)} />}
        <aside
          className={`filters${drawer ? ' is-open' : ''}`}
          aria-label="Product filters"
          role={isMobile ? 'dialog' : undefined}
          aria-modal={isMobile && drawer ? true : undefined}
        >
          <div className="filters__mobile-head">
            <h2 className="h4">Filter & sort</h2>
            <button type="button" className="icon-btn" onClick={() => setDrawer(false)} aria-label="Close filters">
              <Icon name="close" />
            </button>
          </div>
          <div className="filters__scroll">
            {isMobile && (
              <FilterGroup title="Sort by">
                {SORTS.map((s) => (
                  <label key={s.k} className="filters__opt">
                    <input type="radio" name="sort-m" checked={sort === s.k} onChange={() => update({ sort: s.k === 'featured' ? null : s.k })} className="radio-input" />
                    {s.label}
                  </label>
                ))}
              </FilterGroup>
            )}
            <label className="filters__toggle">
              <span>In stock only</span>
              <input type="checkbox" className="switch" checked={f.instock} onChange={(e) => update({ instock: e.target.checked ? '1' : null })} />
            </label>
            {showDept && (
              <FilterGroup title="Category">
                {DEPTS.filter((d) => base.some((p) => p.departments.includes(d.k))).map((d) => {
                  const n = countBy('dept', (p) => p.departments.includes(d.k))
                  return (
                    <label key={d.k} className={`filters__opt checkbox${n === 0 && !f.dept.includes(d.k) ? ' is-disabled' : ''}`}>
                      <input type="checkbox" checked={f.dept.includes(d.k)} onChange={() => toggle('dept', d.k)} />
                      {d.label} <span className="n">{n}</span>
                    </label>
                  )
                })}
              </FilterGroup>
            )}
            <FilterGroup title="Product type">
              {types.map((t) => {
                const n = countBy('type', (p) => p.type === t)
                return (
                  <label key={t} className={`filters__opt checkbox${n === 0 && !f.type.includes(t) ? ' is-disabled' : ''}`}>
                    <input type="checkbox" checked={f.type.includes(t)} onChange={() => toggle('type', t)} />
                    {t} <span className="n">{n}</span>
                  </label>
                )
              })}
            </FilterGroup>
            {ages.length > 1 && (
              <FilterGroup title="Age">
                {ages.map((a) => {
                  const n = countBy('age', (p) => p.ageGroups.includes(a))
                  return (
                    <label key={a} className={`filters__opt checkbox${n === 0 && !f.age.includes(a) ? ' is-disabled' : ''}`}>
                      <input type="checkbox" checked={f.age.includes(a)} onChange={() => toggle('age', a)} />
                      {AGE_LABELS[a]} <span className="n">{n}</span>
                    </label>
                  )
                })}
              </FilterGroup>
            )}
            {sizes.length > 1 && (
              <FilterGroup title="Size">
                <div className="filters__sizes">
                  {sizes.map((s) => (
                    <button key={s} type="button" className="size-pill" aria-pressed={f.size.includes(s)} onClick={() => toggle('size', s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </FilterGroup>
            )}
            <FilterGroup title="Colour">
              <div className="filters__colors">
                {colors.map((cf) => {
                  const n = countBy('color', (p) => colorFamiliesOf(p).includes(cf.name))
                  return (
                    <label key={cf.name} className={`filters__opt checkbox${n === 0 && !f.color.includes(cf.name) ? ' is-disabled' : ''}`}>
                      <input type="checkbox" checked={f.color.includes(cf.name)} onChange={() => toggle('color', cf.name)} />
                      <span className="filters__dot" style={{ ['--sw' as string]: cf.hex }} aria-hidden="true" />
                      {cf.name} <span className="n">{n}</span>
                    </label>
                  )
                })}
              </div>
            </FilterGroup>
            <FilterGroup title="Price">
              <div className="filters__price">
                <label htmlFor="price-max" className="sr-only">
                  Maximum price
                </label>
                <input
                  id="price-max"
                  type="range"
                  className="range"
                  min={500}
                  max={priceMax}
                  step={250}
                  value={f.max ?? priceMax}
                  onChange={(e) => update({ max: Number(e.target.value) >= priceMax ? null : e.target.value })}
                  aria-valuetext={`Up to ${formatINR(f.max ?? priceMax)}`}
                />
                <div className="filters__price-vals">
                  <span>₹500</span>
                  <span>Up to {formatINR(f.max ?? priceMax)}</span>
                </div>
              </div>
            </FilterGroup>
          </div>
          <div className="filters__mobile-foot">
            <button type="button" className="btn btn--outline" onClick={clearAll}>
              Clear all
            </button>
            <button type="button" className="btn" onClick={() => setDrawer(false)}>
              Show {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
            </button>
          </div>
        </aside>

        <div ref={gridTop}>
          <div className="plp__toolbar">
            <p className="plp__count" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}
            </p>
            <div className="plp__tools">
              <button type="button" className="btn btn--outline btn--sm plp__filter-btn" onClick={() => setDrawer(true)} aria-expanded={drawer}>
                <Icon name="filter" size={16} /> Filter{chips.length ? ` (${chips.length})` : ''}
              </button>
              {!isMobile && (
                <label className="plp__sort">
                  <span className="plp__sort-label muted">Sort</span>
                  <select className="select" value={sort} onChange={(e) => update({ sort: e.target.value === 'featured' ? null : e.target.value })}>
                    {SORTS.map((s) => (
                      <option key={s.k} value={s.k}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          </div>
          {chips.length > 0 && (
            <div className="plp__chips" aria-label="Active filters">
              {chips.map((ch) => (
                <button key={ch.label} type="button" className="chip" onClick={ch.onRemove} aria-label={`Remove filter ${ch.label}`}>
                  {ch.label} <Icon name="close" size={14} />
                </button>
              ))}
              <button type="button" className="plp__clear" onClick={clearAll}>
                Clear all
              </button>
            </div>
          )}
          {sort === 'best' && <p className="demo-note" style={{ marginBottom: 16 }}>Best-selling order uses demonstration popularity data.</p>}
          {filtered.length === 0 ? (
            <EmptyState
              icon="search"
              title="Nothing matches those filters"
              body="Try removing a filter or two — or let our stylist suggest something in their size."
              action={
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button type="button" className="btn" onClick={clearAll}>
                    Clear all filters
                  </button>
                  <Link to="/ask-purple" className="btn btn--outline">
                    Ask Purple
                  </Link>
                </div>
              }
            />
          ) : (
            <>
              <div className={`pgrid plp__grid${pending ? ' is-loading' : ''}`}>
                {visible.map((p, i) => (
                  <ProductCard key={p.handle} product={p} priority={i < 3} />
                ))}
              </div>
              {filtered.length > PAGE && (
                <div className="plp__more">
                  <p className="muted body-sm">
                    Showing {visible.length} of {filtered.length}
                  </p>
                  <div className="plp__progress" aria-hidden="true">
                    <span style={{ width: `${(visible.length / filtered.length) * 100}%` }} />
                  </div>
                  {visible.length < filtered.length && (
                    <button type="button" className="btn btn--outline" onClick={() => update({ show: String(shown + PAGE) }, true)}>
                      Load more
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true)
  const id = `fg-${title.replace(/\W+/g, '-').toLowerCase()}`
  return (
    <div className={`filters__group${open ? '' : ' is-collapsed'}`}>
      <button type="button" className="filters__head" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        {title}
        <Icon name="chevron-down" size={16} />
      </button>
      <div className="filters__body" id={id} hidden={!open}>
        {children}
      </div>
    </div>
  )
}
