import '../styles/info.css'
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Img, Breadcrumbs, EmptyState } from '../components/ui'
import { Newsletter } from '../components/Footer'
import { articles, type Article } from '../data/journal'
import { useMeta } from '../lib/hooks'

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

const CATS = ['All', ...Array.from(new Set(articles.map((a) => a.category)))] as const

function Meta({ a }: { a: Article }) {
  return (
    <span className="jmeta">
      <span>{fmtDate(a.date)}</span>
      <span className="dot" aria-hidden="true" />
      <span>{a.readMins} min read</span>
    </span>
  )
}

export default function Journal() {
  useMeta('The Journal', 'Styling inspiration, childhood milestones, seasonal edits, clothing care and gift guides from Purple United Kids.')
  const [params, setParams] = useSearchParams()
  const cat = params.get('category') ?? 'All'
  const list = useMemo(
    () => [...articles].sort((a, b) => b.date.localeCompare(a.date)).filter((a) => cat === 'All' || a.category === cat),
    [cat],
  )
  const [lead, ...rest] = list
  return (
    <div className="container">
      <div className="info-crumbs">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Journal' }]} />
      </div>
      <header className="journal-head">
        <div className="journal-head__title">
          <p className="eyebrow">Stories on growing up</p>
          <h1 className="display">
            The <em>Journal</em>
          </h1>
        </div>
        <p className="muted" style={{ maxWidth: 360 }}>
          Styling notes, milestones and the small rituals of childhood — one good story at a time.
        </p>
      </header>
      <div className="journal-filters" role="toolbar" aria-label="Filter stories by category">
        {CATS.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip${cat === c ? ' is-active' : ''}`}
            aria-pressed={cat === c}
            onClick={() => {
              const p = new URLSearchParams(params)
              if (c === 'All') p.delete('category')
              else p.set('category', c)
              setParams(p, { replace: true })
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {!lead ? (
        <EmptyState icon="list" title="No stories here yet" body="We’re writing them. Try another category." action={<Link to="/journal" className="btn">All stories</Link>} />
      ) : (
        <>
          <Link to={`/journal/${lead.slug}`} className="jlead" key={lead.slug}>
            <Img src={lead.image} alt="" pos={lead.imagePos} eager />
            <div className="jlead__text">
              <span className="eyebrow">{lead.category} · Featured</span>
              <h2 className="h1">{lead.title}</h2>
              <p className="lead">{lead.dek}</p>
              <Meta a={lead} />
              <span className="link">
                Read the story <Icon name="arrow" size={16} className="icon-arrow" />
              </span>
            </div>
          </Link>
          {rest.length > 0 && (
            <div className="jgrid">
              {rest.map((a, i) => (
                <Link key={a.slug} to={`/journal/${a.slug}`} className="jcard reveal" style={{ ['--d' as string]: `${(i % 3) * 80}ms` }}>
                  <Img src={a.image} alt="" pos={a.imagePos} />
                  <span className="eyebrow">{a.category}</span>
                  <h2 className="h4">{a.title}</h2>
                  <p className="jcard__dek">{a.dek}</p>
                  <Meta a={a} />
                </Link>
              ))}
            </div>
          )}
          {rest.length === 0 && <div style={{ height: 'var(--section-sm)' }} />}
        </>
      )}

      <section className="bg-oat" style={{ borderRadius: 'var(--r-lg)', padding: 'clamp(28px,4vw,56px)', marginBottom: 'var(--section)', display: 'grid', gap: 16 }}>
        <p className="eyebrow">The Purple letter</p>
        <h2 className="h3">One beautiful story per send — never a flood.</h2>
        <div style={{ maxWidth: 560 }}>
          <Newsletter tone="light" />
        </div>
      </section>
    </div>
  )
}
