import '../styles/info.css'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Img, Breadcrumbs, EmptyState } from '../components/ui'
import { ProductCard } from '../components/ProductCard'
import { articles, articleBySlug } from '../data/journal'
import { products, type Product } from '../data/products'
import { useMeta } from '../lib/hooks'

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

const SHOP_FILTER: Record<string, (p: Product) => boolean> = {
  'the-art-of-winter-layering': (p) => p.collections.includes('winter-edit'),
  'dressing-for-the-first-birthday': (p) => p.departments.includes('infants') && (p.occasions.includes('special') || p.occasions.includes('celebration')),
  'the-winter-edit-is-here': (p) => p.collections.includes('winter-edit') && !!p.isNew,
  'caring-for-knitwear': (p) => p.type === 'Sweaters' || p.type === 'Sweatshirts & Hoodies',
  'the-new-arrival-gift-guide': (p) => p.departments.includes('infants'),
  'from-a-label-to-life': (p) => p.collections.includes('best-sellers'),
}

/* A pull quote per story — taken from the article's own copy. */
const PULL: Record<string, string> = {
  'the-art-of-winter-layering': 'Start light, finish with something that feels special, and let them choose the colour.',
  'dressing-for-the-first-birthday': 'The best outfit is the one they forget they are wearing.',
  'the-winter-edit-is-here': 'Warmth you can see.',
  'caring-for-knitwear': 'Knitwear rewards a little care.',
  'the-new-arrival-gift-guide': 'Soft, useful and a little bit beautiful.',
  'from-a-label-to-life': 'Plant, water, watch it bloom.',
}

export default function ArticlePage() {
  const { slug = '' } = useParams()
  const a = articleBySlug.get(slug)
  const [copied, setCopied] = useState(false)
  useMeta(a ? a.title : 'Story not found', a?.dek, a ? {
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: a.title,
      description: a.dek,
      datePublished: a.date,
      image: `https://purpleunited.com${a.image}`,
      publisher: { '@type': 'Organization', name: 'Purple United Kids' },
    },
  } : undefined)

  const shop = useMemo(() => {
    if (!a) return []
    const f = SHOP_FILTER[a.slug] ?? (() => true)
    return products.filter(f).sort((x, y) => y.popularity - x.popularity).slice(0, 4)
  }, [a])
  const related = useMemo(() => {
    if (!a) return []
    const same = articles.filter((x) => x.slug !== a.slug && x.category === a.category)
    const others = articles.filter((x) => x.slug !== a.slug && x.category !== a.category)
    return [...same, ...others].slice(0, 2)
  }, [a])

  if (!a)
    return (
      <div className="container">
        <EmptyState
          headingLevel={1}
          icon="list"
          title="We couldn’t find that story"
          body="It may have moved, or the link may be mistyped. There are plenty more in the Journal."
          action={
            <Link to="/journal" className="btn">
              Back to the Journal
            </Link>
          }
        />
      </div>
    )

  const half = Math.ceil(a.body.length / 2)
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <article>
      <header className="article-hero">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Journal', to: '/journal' }, { label: a.title }]} />
          <div className="article-hero__head reveal">
            <Link to={`/journal?category=${encodeURIComponent(a.category)}`} className="eyebrow">
              {a.category}
            </Link>
            <h1 className="h1">{a.title}</h1>
            <p className="lead">{a.dek}</p>
            <span className="jmeta">
              <span>{fmtDate(a.date)}</span>
              <span className="dot" aria-hidden="true" />
              <span>{a.readMins} min read</span>
            </span>
          </div>
        </div>
        <div className="container article-hero__media">
          <Img src={a.image} alt="" pos={a.imagePos} eager />
        </div>
      </header>

      <div className="article-body">
        <div className="container article-body__grid">
          <aside className="article-aside" aria-label="Story details">
            <span>By the Purple United team</span>
            <span>{a.readMins} min read</span>
            <button type="button" className="link" onClick={share}>
              <Icon name={copied ? 'check' : 'arrow'} size={14} /> {copied ? 'Link copied' : 'Copy link'}
            </button>
            <span role="status" className="sr-only">
              {copied ? 'Link copied to clipboard' : ''}
            </span>
          </aside>
          <div className="article-body__main">
            {a.body.slice(0, half).map((b, i) => (
              <div key={i}>
                {b.h && <h2>{b.h}</h2>}
                <p>{b.p}</p>
              </div>
            ))}
            <blockquote className="pull">“{PULL[a.slug] ?? a.dek}”</blockquote>
            {a.body.slice(half).map((b, i) => (
              <div key={`b${i}`}>
                {b.h && <h2>{b.h}</h2>}
                <p>{b.p}</p>
              </div>
            ))}
            {a.shop && (
              <p style={{ marginTop: 32 }}>
                <Link to={a.shop.to} className="btn">
                  {a.shop.label} <Icon name="arrow" size={18} className="icon-arrow" />
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>

      {shop.length > 0 && (
        <section className="section bg-paper shop-story" aria-labelledby="shop-story-h">
          <div className="container">
            <div className="section-head">
              <div className="section-head__text">
                <p className="eyebrow">Shop the story</p>
                <h2 id="shop-story-h" className="h2">
                  Pieces we <em>had in mind.</em>
                </h2>
              </div>
              {a.shop && (
                <Link to={a.shop.to} className="link">
                  See more <Icon name="arrow" size={16} className="icon-arrow" />
                </Link>
              )}
            </div>
            <div className="pgrid">
              {shop.map((p) => (
                <ProductCard key={p.handle} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="section-sm section" aria-labelledby="related-h">
          <div className="container">
            <div className="section-head">
              <div className="section-head__text">
                <p className="eyebrow">Keep reading</p>
                <h2 id="related-h" className="h3">
                  More from the <em>Journal</em>
                </h2>
              </div>
              <Link to="/journal" className="link">
                All stories <Icon name="arrow" size={16} className="icon-arrow" />
              </Link>
            </div>
            <div className="related">
              {related.map((r) => (
                <Link key={r.slug} to={`/journal/${r.slug}`}>
                  <Img src={r.image} alt="" pos={r.imagePos} />
                  <span>
                    <span className="eyebrow">{r.category}</span>
                    <span className="h4">{r.title}</span>
                    <span className="muted body-sm">{r.readMins} min read</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  )
}
