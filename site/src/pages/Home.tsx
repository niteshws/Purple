import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Img, Price } from '../components/ui'
import { ProductCard } from '../components/ProductCard'
import { StoreVideo } from '../components/StoreVideo'
import { HeroCarousel } from '../components/HeroCarousel'
import { LoopVideo } from '../components/LoopVideo'
import { products, getProduct, stockFor, formatINR, type Product } from '../data/products'
import { occasionTiles } from '../data/collections'
import { articles } from '../data/journal'
import { STORE_COUNT } from '../data/site'
import { stores } from '../data/stores'
import { useMeta } from '../lib/hooks'
import { addToBag } from '../lib/commerce'
import { useUI } from '../store'

export default function Home() {
  useMeta('Purple United Kids — Premium Fashion for Their Next Chapter', 'Premium kidswear and footwear for boys, girls and infants, 0–14 years. Fabric, fit and finish you can feel — online and in 99 stores across India.', {
    canonical: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Purple United Kids',
      legalName: 'Purple United Sales Limited',
      url: 'https://purpleunited.com',
      logo: 'https://purpleunited.com/img/brand/crest-lockup.png',
      sameAs: ['https://www.instagram.com/purpleunitedkidsofficial', 'https://www.facebook.com/purpleunitedkids'],
    },
  })
  return (
    <>
      <Hero />
      <Categories />
      <ForHimForHer />
      <NewSeason />
      <NewArrivals />
      <LittleOriginals />
      <Occasions />
      <CompleteTheLook />
      <Craft />
      <FootwearCampaign />
      <Gifting />
      <PurpleCircleTeaser />
      <StoreExperience />
      <AskPurpleBand />
      <JournalTeaser />
    </>
  )
}

/* ---------------- 1 · Hero (auto-sliding campaign) ---------------- */
function Hero() {
  return <HeroCarousel />
}

/* ---------------- 2 · Shop by category ---------------- */
const CATS = [
  { k: 'girls', label: 'Girls', sub: '2–14 years', to: '/collections/girls', img: '/img/category/girls.webp', pos: '50% 28%' },
  { k: 'boys', label: 'Boys', sub: '2–14 years', to: '/collections/boys', img: '/img/category/boys.webp', pos: '50% 24%' },
  { k: 'infants', label: 'Infants', sub: '0–24 months', to: '/collections/infants', img: '/img/lifestyle/infant-portrait.webp', pos: '50% 35%' },
  { k: 'footwear', label: 'Footwear', sub: 'Sneakers to first walkers', to: '/collections/footwear-accessories', img: '/img/campaign/footwear-podiums.webp', pos: '50% 45%' },
  { k: 'accessories', label: 'Accessories', sub: 'Soft toys & finishing touches', to: '/collections/footwear-accessories?type=Soft+Toys', img: '/img/lifestyle/nursery-toys.webp', pos: '50% 50%' },
]
function Categories() {
  return (
    <section className="section cats" id="categories" aria-labelledby="cats-h">
      <div className="container">
        <div className="section-head reveal">
          <div className="section-head__text">
            <p className="eyebrow">Shop by category</p>
            <h2 id="cats-h" className="h2">
              Newborn to early teens, <em>one Purple.</em>
            </h2>
          </div>
          <Link to="/collections/all" className="link">
            Shop everything <Icon name="arrow" size={16} className="icon-arrow" />
          </Link>
        </div>
        <div className="cats__grid">
          {CATS.map((c, i) => (
            <Link key={c.k} to={c.to} className={`cat cat--${c.k} reveal`} style={{ ['--d' as string]: `${i * 70}ms` }}>
              <Img src={c.img} alt="" pos={c.pos} className="cat__media" />
              <span className="cat__label">
                <span className="cat__title">{c.label}</span>
                <span className="cat__sub">{c.sub}</span>
                <span className="cat__arrow" aria-hidden="true">
                  <Icon name="arrow" size={18} />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- 3 · New season editorial ---------------- */
function NewSeason() {
  return (
    <section className="editorial section" aria-labelledby="ed-h">
      <div className="container editorial__grid">
        <figure className="editorial__main reveal-img">
          <Img src="/img/editorial/a-little-extraordinary.webp" alt="A girl in a plum velvet dress and a boy in an ivory bandhgala jacket walking hand in hand through a sunlit garden conservatory" ratio="1277/998" />
        </figure>
        <div className="editorial__side">
          <figure className="editorial__portrait reveal-img" style={{ ['--d' as string]: '160ms' }}>
            <Img src="/img/editorial/paris-portrait.webp" alt="Two children in tailored winter layers looking out over a city balcony" ratio="806/845" />
          </figure>
          <div className="editorial__text reveal" style={{ ['--d' as string]: '220ms' }}>
            <p className="eyebrow">Occasion dressing · Winter 2026</p>
            <h2 id="ed-h" className="h2">
              A little <em>extraordinary.</em>
            </h2>
            <p className="lead">
              Velvet for the festive table, tailoring for the family photograph, and a modern French sensibility that still lets them run, twirl and play.
            </p>
            <p className="signature editorial__sig">Everyday moments, made special.</p>
            <div className="editorial__ctas">
              <Link to="/collections/festive-dressing" className="btn">
                Shop festive dressing <Icon name="arrow" size={18} className="icon-arrow" />
              </Link>
              <Link to="/collections/celebration-party" className="link">
                Party & celebration
              </Link>
            </div>
            <p className="demo-note">Campaign imagery is concept art direction from the PixelCrayons proposal.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- 4 · New arrivals ---------------- */
const NA_TABS = [
  { k: 'all', label: 'All' },
  { k: 'girls', label: 'Girls' },
  { k: 'boys', label: 'Boys' },
  { k: 'infants', label: 'Infants' },
  { k: 'footwear', label: 'Footwear' },
] as const
function NewArrivals() {
  const [tab, setTab] = useState<(typeof NA_TABS)[number]['k']>('all')
  const list = useMemo(() => {
    const fresh = [...products].sort((a, b) => b.addedAt.localeCompare(a.addedAt))
    const f = tab === 'all' ? fresh.filter((p) => p.isNew) : fresh.filter((p) => p.departments.includes(tab))
    return f.slice(0, 8)
  }, [tab])
  return (
    <section className="section bg-paper" aria-labelledby="na-h">
      <div className="container">
        <div className="section-head reveal">
          <div className="section-head__text">
            <p className="eyebrow">Just landed</p>
            <h2 id="na-h" className="h2">
              New <em>arrivals</em>
            </h2>
          </div>
          <div className="na-tabs" role="tablist" aria-label="Filter new arrivals">
            {NA_TABS.map((t) => (
              <button key={t.k} role="tab" type="button" aria-selected={tab === t.k} className={`chip${tab === t.k ? ' is-active' : ''}`} onClick={() => setTab(t.k)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="pgrid na-grid" role="tabpanel" aria-label={`${NA_TABS.find((t) => t.k === tab)?.label} new arrivals`} key={tab}>
          {list.map((p, i) => (
            <div key={p.handle} className="na-item" style={{ ['--i' as string]: i }}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
        <div className="center-cta">
          <Link to={tab === 'all' ? '/collections/new-arrivals' : tab === 'footwear' ? '/collections/footwear-accessories' : `/collections/${tab}`} className="btn btn--outline">
            View all {tab === 'all' ? 'new arrivals' : NA_TABS.find((t) => t.k === tab)?.label.toLowerCase()} <Icon name="arrow" size={18} className="icon-arrow" />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ---------------- 4b · For Him & For Her ---------------- */
const EDITS = {
  her: {
    label: 'For Her',
    line: 'Frills for the party, denim for the playground and a little sparkle for every step.',
    to: '/collections/girls',
    cta: 'Shop girls',
    picks: ['layered-frill-dress', 'heart-print-denim-jacket', 'flared-stretch-lower', 'metallic-bow-ballerinas'],
  },
  him: {
    label: 'For Him',
    line: 'Easy tailoring, warm layers and sneakers made for the long way home.',
    to: '/collections/boys',
    cta: 'Shop boys',
    picks: ['varsity-jacket', 'colourblock-fleece-hoodie', 'wide-leg-jeans', 'dial-fit-sports-shoes'],
  },
} as const
type EditKey = keyof typeof EDITS

function EditColumn({ k, active, onFocus }: { k: EditKey; active: boolean; onFocus: () => void }) {
  const e = EDITS[k]
  const picks = e.picks.map((h) => getProduct(h)!).filter(Boolean)
  return (
    <div className={`fhf__col fhf__col--${k}${active ? ' is-active' : ''}`} onMouseEnter={onFocus} onFocus={onFocus} id={`fhf-${k}`} role="tabpanel" aria-labelledby={`fhf-tab-${k}`}>
      <p className="fhf__label signature">{e.label}</p>
      <p className="fhf__line">{e.line}</p>
      <ul role="list" className="fhf__picks">
        {picks.map((p, i) => (
          <li key={p.handle} style={{ ['--i' as string]: i }}>
            <Link to={`/products/${p.handle}`} className="fhf__pick">
              <span className="fhf__thumb">
                <img src={p.colors[0].images[0]} alt="" loading="lazy" width={600} height={750} />
              </span>
              <span className="fhf__meta">
                <span className="fhf__name">{p.name}</span>
                <span className="fhf__type">{p.type}</span>
                <Price price={p.price} compareAt={p.compareAt} />
              </span>
              <Icon name="arrow" size={16} className="fhf__go" />
            </Link>
          </li>
        ))}
      </ul>
      <Link to={e.to} className="link">
        {e.cta} <Icon name="arrow" size={16} className="icon-arrow" />
      </Link>
    </div>
  )
}

function ForHimForHer() {
  const [side, setSide] = useState<EditKey>('her')
  return (
    <section className={`section fhf fhf--${side}`} aria-labelledby="fhf-h">
      <div className="container">
        <div className="fhf__head reveal">
          <p className="eyebrow">Curated edits</p>
          <h2 id="fhf-h" className="h2">
            For him <em>&amp;</em> for her
          </h2>
          <p className="lead">Two wardrobes, one Purple. Pieces chosen to be mixed, matched and loved — whoever they are.</p>
          <div className="fhf__switch" role="tablist" aria-label="Choose an edit">
            {(['her', 'him'] as EditKey[]).map((k) => (
              <button
                key={k}
                id={`fhf-tab-${k}`}
                role="tab"
                type="button"
                aria-selected={side === k}
                aria-controls={`fhf-${k}`}
                className={`fhf__tab${side === k ? ' is-active' : ''}`}
                onClick={() => setSide(k)}
              >
                {EDITS[k].label}
              </button>
            ))}
          </div>
        </div>
        <div className="fhf__grid">
          <EditColumn k="her" active={side === 'her'} onFocus={() => setSide('her')} />
          <figure className="fhf__media reveal-img">
            <Img src="/img/editorial/for-him-for-her.webp" alt="A girl in a lilac tulle dress and a boy in a plum suit smiling back to back" ratio="1244/1094" pos="50% 30%" />
            <span className="fhf__shade" aria-hidden="true" />
            <figcaption className="fhf__caption">
              <span className={side === 'her' ? 'is-on' : ''}>For her</span>
              <span className="fhf__amp" aria-hidden="true">&amp;</span>
              <span className={side === 'him' ? 'is-on' : ''}>for him</span>
            </figcaption>
          </figure>
          <EditColumn k="him" active={side === 'him'} onFocus={() => setSide('him')} />
        </div>
      </div>
    </section>
  )
}

/* ---------------- 5 · The Little Originals ---------------- */
const ORIGINALS = [
  {
    name: 'The trailblazer',
    line: 'Six looks before breakfast — and every one entirely his own.',
    video: '/video/originals/trailblazer.mp4',
    poster: '/video/originals/trailblazer-poster.webp',
    label: 'A boy showing off one outfit after another in his bedroom — caps, shirts, shorts and sneakers',
  },
  {
    name: 'The free spirit',
    line: 'Mid-twirl, mid-laugh, always.',
    video: '/video/originals/free-spirit.mp4',
    poster: '/video/originals/free-spirit-poster.webp',
    label: 'A girl twirling and laughing in a striped shirt and pleated skirt set',
  },
  {
    name: 'The quiet charmer',
    line: 'Hands in pockets, a very good secret.',
    video: '/video/originals/quiet-charmer.mp4',
    poster: '/video/originals/quiet-charmer-poster.webp',
    label: 'A curly-haired boy in a white tee, jeans and sneakers, hands in pockets',
  },
]
function LittleOriginals() {
  return (
    <section className="originals on-dark" aria-labelledby="lo-h">
      <div className="container originals__intro reveal">
        <p className="eyebrow">Brand territory · The Little Originals</p>
        <h2 id="lo-h" className="h1">
          Born to be <em>their own.</em>
        </h2>
        <p className="lead originals__lead">
          Every child arrives with a personality already in full colour. We design clothes that let it show — bold, playful, comfortable, and entirely theirs.
        </p>
      </div>
      <div className="originals__grid container">
        {ORIGINALS.map((o, i) => (
          <figure key={o.name} className="original reveal" style={{ ['--d' as string]: `${i * 90}ms` }}>
            <div className="original__media">
              <LoopVideo src={o.video} poster={o.poster} label={`${o.name}: ${o.label}`} />
              <Link to="/collections/new-arrivals" className="btn btn--ivory original__cta">
                Find Their Look <Icon name="arrow" size={18} className="icon-arrow" />
              </Link>
            </div>
            <figcaption>
              <span className="original__n">0{i + 1}</span>
              <span className="original__name">{o.name}</span>
              <span className="original__line">{o.line}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

/* ---------------- 6 · Shop by occasion ---------------- */
function Occasions() {
  return (
    <section className="section occasions" aria-labelledby="oc-h">
      <div className="container">
        <div className="section-head reveal">
          <div className="section-head__text">
            <p className="eyebrow">Shop by occasion</p>
            <h2 id="oc-h" className="h2">
              Dressed for <em>every chapter.</em>
            </h2>
          </div>
          <p className="muted occasions__aside">From the school gate to the festive table — find the right look for the moment.</p>
        </div>
        <div className="occasions__grid">
          {occasionTiles.map((o, i) => (
            <Link key={o.handle} to={`/collections/${o.handle}`} className="occasion reveal" style={{ ['--d' as string]: `${i * 70}ms` }}>
              <Img src={o.image} alt="" pos={o.pos} />
              <span className="occasion__label">
                <span className="occasion__n">0{i + 1}</span>
                {o.label}
                <Icon name="arrow" size={18} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- 8 · Complete the look ---------------- */
const LOOK = [
  { handle: 'believe-in-yourself-tee', color: 'Orange', x: 44, y: 34, label: 'Top' },
  { handle: 'wide-leg-jeans', color: 'Black', x: 41, y: 64, label: 'Jeans' },
  { handle: 'aeroflex-mesh-sports-shoes', color: 'White', x: 58, y: 91, label: 'Shoes' },
  { handle: 'utility-denim-jacket', color: 'Black', x: 27, y: 44, label: 'Layer it' },
]
function CompleteTheLook() {
  const items = LOOK.map((l) => ({ ...l, p: getProduct(l.handle)! }))
  const [active, setActive] = useState(0)
  const [sel, setSel] = useState<Record<string, { on: boolean; size: string }>>(() =>
    Object.fromEntries(items.map((it) => [it.handle, { on: it.handle !== 'utility-denim-jacket', size: '' }])),
  )
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState(false)
  const setCart = useUI((s) => s.setCart)
  const toast = useUI((s) => s.toast)
  const chosen = items.filter((it) => sel[it.handle].on)
  const total = chosen.reduce((s, it) => s + it.p.price, 0)
  const addAll = () => {
    const errs: Record<string, boolean> = {}
    chosen.forEach((it) => {
      if (!sel[it.handle].size) errs[it.handle] = true
    })
    setErrors(errs)
    if (!chosen.length) return toast({ kind: 'error', title: 'Select at least one piece' })
    if (Object.keys(errs).length) return toast({ kind: 'error', title: 'Choose a size for each selected piece' })
    setBusy(true)
    setTimeout(() => {
      let ok = 0
      chosen.forEach((it) => {
        if (addToBag(it.handle, it.color, sel[it.handle].size, 1, { openDrawer: false, silent: true })) ok++
      })
      setBusy(false)
      if (ok) setCart(true)
    }, 500)
  }
  return (
    <section className="section look bg-oat" aria-labelledby="look-h">
      <div className="container look__grid">
        <div className="look__media reveal-img">
          <Img src="/img/lifestyle/boy-street.webp" alt="A boy in an orange tee and wide black jeans leaning on a lamp post on a tree-lined street" ratio="1/1" />
          {items.map((it, i) => (
            <button
              key={it.handle}
              type="button"
              className={`hotspot${active === i ? ' is-active' : ''}`}
              style={{ left: `${it.x}%`, top: `${it.y}%` }}
              onClick={() => setActive(i)}
              aria-label={`${it.label}: ${it.p.name}`}
              aria-pressed={active === i}
            >
              <span>{i + 1}</span>
            </button>
          ))}
          <div className="look__card" key={active}>
            <img src={items[active].p.colors.find((c) => c.name === items[active].color)!.images[0]} alt="" />
            <div>
              <p className="eyebrow">{items[active].label}</p>
              <p className="look__card-name">{items[active].p.name}</p>
              <Price price={items[active].p.price} compareAt={items[active].p.compareAt} />
            </div>
            <Link to={`/products/${items[active].handle}?color=${items[active].color}`} className="icon-btn" aria-label={`View ${items[active].p.name}`}>
              <Icon name="arrow" />
            </Link>
          </div>
        </div>
        <div className="look__panel reveal">
          <p className="eyebrow">Shop the look</p>
          <h2 id="look-h" className="h2">
            Complete <em>the look.</em>
          </h2>
          <p className="muted">Styled with pieces from the collection. Pick what you love, choose sizes, and add the whole look in one go.</p>
          <ul role="list" className="look__list">
            {items.map((it, i) => {
              const s = sel[it.handle]
              const img = it.p.colors.find((c) => c.name === it.color)!.images[0]
              return (
                <li key={it.handle} className={`look__item${s.on ? ' is-on' : ''}${active === i ? ' is-active' : ''}`} onMouseEnter={() => setActive(i)}>
                  <label className="checkbox look__check">
                    <input
                      type="checkbox"
                      checked={s.on}
                      onChange={(e) => setSel((x) => ({ ...x, [it.handle]: { ...x[it.handle], on: e.target.checked } }))}
                      aria-label={`Include ${it.p.name}`}
                    />
                  </label>
                  <Link to={`/products/${it.handle}?color=${it.color}`} className="look__thumb">
                    <img src={img} alt="" loading="lazy" />
                  </Link>
                  <div className="look__info">
                    <Link to={`/products/${it.handle}?color=${it.color}`} className="look__name">
                      {it.p.name}
                    </Link>
                    <span className="muted body-sm">
                      {it.color} · <Price price={it.p.price} />
                    </span>
                    <label className="sr-only" htmlFor={`look-${it.handle}`}>
                      Size for {it.p.name}
                    </label>
                    <select
                      id={`look-${it.handle}`}
                      className="select select--sm"
                      value={s.size}
                      aria-invalid={!!errors[it.handle]}
                      onChange={(e) => {
                        setSel((x) => ({ ...x, [it.handle]: { on: true, size: e.target.value } }))
                        setErrors((er) => ({ ...er, [it.handle]: false }))
                      }}
                    >
                      <option value="">Select size</option>
                      {it.p.sizes.map((sz) => {
                        const n = stockFor(it.p, it.color, sz)
                        return (
                          <option key={sz} value={sz} disabled={n === 0}>
                            {sz}
                            {n === 0 ? ' — sold out' : n <= 2 ? ' — only a few left' : ''}
                          </option>
                        )
                      })}
                    </select>
                    {errors[it.handle] && <span className="field__error">Choose a size</span>}
                  </div>
                </li>
              )
            })}
          </ul>
          <div className="look__foot">
            <div>
              <span className="muted body-sm">
                {chosen.length} {chosen.length === 1 ? 'piece' : 'pieces'} selected
              </span>
              <strong className="look__total">{formatINR(total)}</strong>
            </div>
            <button type="button" className={`btn${busy ? ' is-loading' : ''}`} onClick={addAll} disabled={!chosen.length}>
              <Icon name="bag" size={18} /> Add look to bag
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- 9 · Craft, comfort & quality ---------------- */
const CRAFT = [
  { t: 'Fabric & finish', d: 'Soft-washed knits, warm fleece and comfort denim — chosen for how they feel, not just how they look.' },
  { t: 'Thoughtful design', d: 'Easy openings, cuffed ankles, elastic waists and fastenings little hands can manage.' },
  { t: 'Comfort in movement', d: 'Relaxed fits and stretch where it counts, so they can climb, twirl and sit cross-legged.' },
  { t: 'Quality that lasts', d: 'Made to keep up through growth spurts — and to be handed down.' },
  { t: 'Responsible details', d: 'Our hang tags are made of seed paper. Plant one, and watch it bloom.' },
]
function Craft() {
  return (
    <section className="section craft" aria-labelledby="craft-h">
      <div className="container craft__grid">
        <div className="craft__media">
          <figure className="craft__big reveal-img">
            <Img src="/img/brand/knit-label.webp" alt="Close-up of a soft cream knit with a woven Purple United label" ratio="600/585" />
          </figure>
          <figure className="craft__small reveal-img" style={{ ['--d' as string]: '140ms' }}>
            <Img src="/img/lifestyle/infant-kimono-set.webp" alt="A cotton infant kimono set with matching hat and booties on a wooden stand" ratio="1/1" />
          </figure>
        </div>
        <div className="craft__text">
          <div className="reveal">
            <p className="eyebrow">Craft, comfort & quality</p>
            <h2 id="craft-h" className="h2">
              Room to grow, <em>stitched in.</em>
            </h2>
            <p className="lead">Premium isn’t a label. It’s fabric you can feel, a fit that moves, and a finish that lasts.</p>
          </div>
          <ol className="craft__list" role="list">
            {CRAFT.map((c, i) => (
              <li key={c.t} className="reveal" style={{ ['--d' as string]: `${i * 60}ms` }}>
                <span className="craft__n">0{i + 1}</span>
                <div>
                  <h3 className="h4">{c.t}</h3>
                  <p className="muted">{c.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link to="/craft" className="link reveal">
            Discover our craft <Icon name="arrow" size={16} className="icon-arrow" />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ---------------- 10 · Footwear & accessories ---------------- */
function FootwearCampaign() {
  const shoes = useMemo(() => products.filter((p) => p.departments.includes('footwear')).sort((a, b) => b.popularity - a.popularity).slice(0, 8), [])
  return (
    <section className="section shoes bg-rose" aria-labelledby="fw-h">
      <div className="container">
        <div className="shoes__hero">
          <div className="shoes__media reveal-img">
            <Img src="/img/campaign/footwear-unboxing.webp" alt="Lilac clogs, a unicorn soft toy and Purple United gift boxes arranged on a marble table" ratio="1600/1064" />
          </div>
          <div className="shoes__text reveal">
            <p className="eyebrow">Footwear & accessories</p>
            <h2 id="fw-h" className="h2">
              Head to toe, <em>one Purple.</em>
            </h2>
            <p className="lead">Sneakers, ballerinas and first walkers — styled with every collection, and boxed as beautifully as everything else.</p>
            <div className="shoes__links">
              {[
                ['Sneakers', '/collections/footwear-accessories?type=Sneakers'],
                ['Casual shoes', '/collections/footwear-accessories?type=Casual+Shoes'],
                ['Ballerinas', '/collections/footwear-accessories?type=Ballerinas'],
                ['First walkers', '/collections/footwear-accessories?type=Booties'],
                ['Soft toys', '/collections/footwear-accessories?type=Soft+Toys'],
              ].map(([l, to]) => (
                <Link key={l} to={to} className="chip">
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="rail shoes__rail" tabIndex={0} aria-label="Footwear — scroll horizontally">
          {shoes.map((p) => (
            <div key={p.handle} className="shoes__item">
              <ProductCard product={p} compact />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- 11 · Gifting ---------------- */
function Gifting() {
  return (
    <section className="gifting-band on-dark" aria-labelledby="gift-h">
      <div className="gifting-band__media">
        <Img src="/img/brand/packaging-hero.webp" alt="Plum and ivory Purple United gift boxes, tissue and a lilac knit sweater with seed-paper tags" />
      </div>
      <div className="gifting-band__text">
        <div className="reveal">
          <p className="eyebrow">Gifting</p>
          <h2 id="gift-h" className="h1">
            A little something, <em>made special.</em>
          </h2>
          <p className="lead">
            Plum boxes, ivory tissue and a handwritten note — for birthdays, baby showers and every “just because”. Or let them choose with a Purple gift card.
          </p>
          <p className="signature gifting-band__quote">“Handle with joy.”</p>
          <div className="gifting-band__ctas">
            <Link to="/gifting#gift-card" className="btn btn--ivory">
              Send a gift card <Icon name="arrow" size={18} className="icon-arrow" />
            </Link>
            <Link to="/gifting" className="link link--light">
              Explore gifting
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- 12 · Purple Circle ---------------- */
const TIERS = [
  { k: 'circle', name: 'Purple Circle', entry: 'Free to join', perks: ['Early access to new collections', 'A birthday surprise for your child', 'Stories and styling notes from the Journal'] },
  { k: 'plus', name: 'Circle Plus', entry: 'Annual spend threshold — to be defined', perks: ['Everything in Purple Circle', 'Free size exchanges in any store', 'Members-only collection previews'] },
  { k: 'prive', name: 'Circle Privé', entry: 'By invitation', perks: ['Everything in Circle Plus', 'Personal styling appointments', 'First look at limited edits'] },
]
function PurpleCircleTeaser() {
  const [t, setT] = useState(0)
  const tier = TIERS[t]
  return (
    <section className="section circle" aria-labelledby="pc-h">
      <div className="container circle__grid">
        <div className="circle__text reveal">
          <p className="eyebrow">
            Purple Circle <span className="tag tag--gold">Proposed</span>
          </p>
          <h2 id="pc-h" className="h2">
            Rewarding every visit. <em>Celebrating every milestone.</em>
          </h2>
          <p className="lead">A membership that grows with your family — online and in every store.</p>
          <div className="circle__tiers" role="tablist" aria-label="Membership tiers">
            {TIERS.map((x, i) => (
              <button key={x.k} role="tab" type="button" aria-selected={t === i} className={`circle__tier${t === i ? ' is-active' : ''}`} onClick={() => setT(i)}>
                <Icon name="crown" size={18} />
                {x.name}
              </button>
            ))}
          </div>
          <div className="circle__perks" role="tabpanel" key={tier.k}>
            <p className="circle__entry">{tier.entry}</p>
            <ul role="list">
              {tier.perks.map((p) => (
                <li key={p}>
                  <Icon name="check" size={18} /> {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="circle__ctas">
            <Link to="/purple-circle" className="btn">
              Explore Purple Circle <Icon name="arrow" size={18} className="icon-arrow" />
            </Link>
            <Link to="/account/register" className="link">
              Join free
            </Link>
          </div>
          <p className="demo-note">Concept · tier names, thresholds and benefits are illustrative and not yet approved.</p>
        </div>
        <div className={`circle__card circle__card--${tier.k} reveal`} aria-hidden="true">
          <div className="member-card">
            <img src="/img/brand/crest-mark-reversed.png" alt="" className="member-card__mark" />
            <span className="member-card__label">Member card</span>
            <span className="member-card__tier">{tier.name}</span>
            <span className="member-card__no">PU •••• 2027</span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- 13 · Store experience ---------------- */
function StoreExperience() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const cities = useMemo(() => new Set(stores.map((s) => s.city)).size, [])
  const states = useMemo(() => new Set(stores.map((s) => s.state).filter(Boolean)).size, [])
  return (
    <section className="store-band" aria-labelledby="st-h">
      <div className="store-band__media reveal-img">
        <StoreVideo />
      </div>
      <div className="container store-band__card-wrap">
        <div className="store-band__card reveal">
          <p className="eyebrow">Visit us</p>
          <h2 id="st-h" className="h2">
            A store that feels <em>unmistakably Purple.</em>
          </h2>
          <p className="muted">See, touch and try the collection with our in-store team — and exchange sizes easily, online or in store.</p>
          <dl className="store-band__stats">
            <div>
              <dt>Stores</dt>
              <dd>{STORE_COUNT}</dd>
            </div>
            <div>
              <dt>Cities</dt>
              <dd>{cities}</dd>
            </div>
            <div>
              <dt>States & UTs</dt>
              <dd>{states}</dd>
            </div>
          </dl>
          <form
            className="store-band__search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault()
              navigate(`/stores${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`)
            }}
          >
            <label htmlFor="store-q" className="sr-only">
              City or pincode
            </label>
            <Icon name="pin" size={18} />
            <input id="store-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Enter your city or pincode" />
            <button type="submit" className="btn btn--sm">
              Find a store
            </button>
          </form>
          <p className="demo-note">Walkthrough shows the proposed flagship store identity (concept).</p>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Ask Purple band ---------------- */
function AskPurpleBand() {
  return (
    <section className="ask-band" aria-labelledby="ask-h">
      <div className="container ask-band__inner reveal">
        <span className="ask-band__icon">
          <Icon name="sparkle" size={26} />
        </span>
        <div>
          <h2 id="ask-h" className="h3">
            Not sure where to start? <em>Ask Purple.</em>
          </h2>
          <p className="muted">Tell us their age, the occasion and your budget — we’ll suggest looks in their size.</p>
        </div>
        <Link to="/ask-purple" className="btn btn--outline">
          Try the stylist <Icon name="arrow" size={18} className="icon-arrow" />
        </Link>
      </div>
    </section>
  )
}

/* ---------------- 14 · Journal ---------------- */
function JournalTeaser() {
  const [lead, ...rest] = articles.filter((a) => ['the-art-of-winter-layering', 'dressing-for-the-first-birthday', 'caring-for-knitwear', 'the-new-arrival-gift-guide'].includes(a.slug))
  return (
    <section className="section journal-teaser" aria-labelledby="jr-h">
      <div className="container">
        <div className="section-head reveal">
          <div className="section-head__text">
            <p className="eyebrow">The Journal</p>
            <h2 id="jr-h" className="h2">
              Stories on <em>growing up.</em>
            </h2>
          </div>
          <Link to="/journal" className="link">
            All stories <Icon name="arrow" size={16} className="icon-arrow" />
          </Link>
        </div>
        <div className="jt__grid">
          <Link to={`/journal/${lead.slug}`} className="jt__lead reveal">
            <Img src={lead.image} alt="" pos={lead.imagePos} ratio="4/3" />
            <span className="eyebrow">{lead.category}</span>
            <span className="h3">{lead.title}</span>
            <span className="muted">{lead.dek}</span>
          </Link>
          <div className="jt__list">
            {rest.map((a, i) => (
              <Link key={a.slug} to={`/journal/${a.slug}`} className="jt__item reveal" style={{ ['--d' as string]: `${i * 80}ms` }}>
                <Img src={a.image} alt="" pos={a.imagePos} ratio="1/1" />
                <span>
                  <span className="eyebrow">{a.category}</span>
                  <span className="h4">{a.title}</span>
                  <span className="muted body-sm">{a.readMins} min read</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export type { Product }
