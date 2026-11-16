import '../styles/info.css'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Crest } from '../components/ui'
import { useMeta } from '../lib/hooks'

const LINKS = [
  ['New In', '/collections/new-arrivals'],
  ['Boys', '/collections/boys'],
  ['Girls', '/collections/girls'],
  ['Infants', '/collections/infants'],
  ['Find a store', '/stores'],
]

export default function NotFound() {
  useMeta('Page not found', 'This page has wandered off. Search Purple United Kids or explore our collections.')
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  return (
    <section className="nf container" aria-labelledby="nf-h">
      <div className="nf__inner">
        <span className="nf__code" aria-hidden="true">
          404
        </span>
        <Crest variant="mark" className="nf__crest" />
        <p className="eyebrow">Page not found</p>
        <h1 id="nf-h" className="h1">
          This page has <em>wandered off.</em>
        </h1>
        <p className="lead" style={{ marginInline: 'auto' }}>
          Like a little one at the park, it was here a moment ago. Let’s help you find what you were looking for.
        </p>
        <form
          className="nf__search"
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`)
          }}
        >
          <label htmlFor="nf-q" className="sr-only">
            Search Purple United
          </label>
          <input id="nf-q" className="input" type="search" placeholder="Search knits, dresses, sneakers…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button type="submit" className="btn" disabled={!q.trim()}>
            <Icon name="search" size={18} /> Search
          </button>
        </form>
        <nav className="nf__links" aria-label="Popular destinations">
          {LINKS.map(([l, to]) => (
            <Link key={to} to={to} className="chip">
              {l}
            </Link>
          ))}
        </nav>
        <Link to="/" className="link" style={{ marginTop: 8 }}>
          Back to the homepage <Icon name="arrow" size={16} className="icon-arrow" />
        </Link>
      </div>
    </section>
  )
}
