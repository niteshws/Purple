import '../styles/info.css'
import { Link } from 'react-router-dom'
import { Icon, type IconName } from '../components/Icon'
import { Img, Breadcrumbs } from '../components/ui'
import { useMeta } from '../lib/hooks'
import { useUI } from '../store'

const PILLARS: { icon: IconName; t: string; d: string }[] = [
  { icon: 'leaf', t: 'Fabric', d: 'Soft knits, warm fleece, comfort denim and breathable cotton — chosen first for how they feel against the skin.' },
  { icon: 'size', t: 'Fit', d: 'Relaxed where they move, neat where it matters, with elastic waists and cuffs that stay put.' },
  { icon: 'sparkle', t: 'Finish', d: 'Ribbed trims, careful stitching and small details — a bow, a piped edge, an embroidered collar.' },
  { icon: 'shield', t: 'Comfort', d: 'Fastenings little hands can manage, smooth seams and fabrics that let them get on with playing.' },
]

const CARE: { icon: IconName; t: string; tips: string[] }[] = [
  { icon: 'sparkle', t: 'Knits & sweaters', tips: ['Wash cool and gentle, inside out', 'Dry flat in the shade — never hang a wet knit', 'Reshape while damp; fold rather than hang to store'] },
  { icon: 'box', t: 'Denim', tips: ['Wash inside out, cold, with similar colours', 'Expect some colour transfer from washed denim at first', 'Line dry in shade to keep the colour rich'] },
  { icon: 'leaf', t: 'Cotton & everyday wear', tips: ['Machine wash cold with similar colours', 'Turn printed pieces inside out', 'Skip the bleach; dry in shade'] },
  { icon: 'bag', t: 'Footwear', tips: ['Wipe clean with a soft, damp cloth', 'Air dry away from direct heat', 'Stuff with paper to keep the shape'] },
]

const LABELS = [
  ['Neck label', 'Woven plum and gold, soft on skin.'],
  ['Size label', 'Age and height, clear at a glance.'],
  ['Care label', 'Simple care, printed on satin.'],
  ['Hang tag', 'The fabric story, told in one line.'],
]

export default function Craft() {
  useMeta('Our Craft', 'Fabric, fit and finish you can feel — how Purple United designs kidswear that keeps up, plus care guidance for knits, denim, cotton and footwear.')
  const openGuide = useUI((s) => s.openSizeGuide)
  return (
    <>
      <section className="craft-hero">
        <div className="craft-hero__text reveal">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Our craft' }]} />
          <p className="eyebrow">Our craft</p>
          <h1 className="h1">
            Soft-washed, well-made, <em>made to keep up.</em>
          </h1>
          <p className="lead">
            The product already earns its premium. Here’s what goes into it — and how to look after it, so it can be loved twice.
          </p>
          <div>
            <a href="#care" className="link">
              Jump to care guide <Icon name="chevron-down" size={16} />
            </a>
          </div>
        </div>
        <div className="craft-hero__media">
          <Img src="/img/campaign/wardrobe/craft-hero.webp" alt="A toddler in a yellow cotton pullover and olive trousers at a breakfast table" pos="50% 40%" eager />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head reveal">
            <div className="section-head__text">
              <p className="eyebrow">Fabric · fit · finish</p>
              <h2 className="h2">
                Quality you can <em>feel.</em>
              </h2>
            </div>
            <p className="muted" style={{ maxWidth: 400 }}>
              Product composition is listed on every product page and on the care label sewn into each garment.
            </p>
          </div>
          <div className="pillars reveal">
            {PILLARS.map((p) => (
              <div key={p.t} className="pillar">
                <Icon name={p.icon} size={28} strokeWidth={1.2} />
                <h3 className="h4">{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-paper">
        <div className="container grow">
          <div className="grow__media">
            <div className="reveal-img">
              <Img src="/img/campaign/wardrobe/craft-overalls.webp" alt="Soft quilted sage infant overalls over an oatmeal cotton top" />
            </div>
            <div className="reveal-img" style={{ ['--d' as string]: '140ms' }}>
              <Img src="/img/campaign/wardrobe/craft-romper.webp" alt="An ivory infant romper with a small embroidered animal and blue trim" />
            </div>
          </div>
          <div className="grow__text reveal">
            <p className="eyebrow">Sizing philosophy</p>
            <h2 className="h2">
              Room to grow, <em>stitched in.</em>
            </h2>
            <p className="prose">
              Children don’t grow on schedule. We size by age and height, and design with a little ease built in — so a piece bought in October still feels right
              in February. If they’re between sizes, choose the larger one.
            </p>
            <div className="grow__ruler" aria-label="Size runs from newborn to 14 years">
              {[
                ['0–24M', 'Infants'],
                ['2–5Y', 'Toddlers'],
                ['6–9Y', 'Kids'],
                ['10–14Y', 'Juniors'],
                ['UK 5K–5', 'Footwear'],
                ['One size', 'Toys'],
              ].map(([a, b]) => (
                <span key={a}>
                  {a}
                  <small>{b}</small>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
              <button type="button" className="btn btn--outline" onClick={() => openGuide('apparel')}>
                <Icon name="ruler" size={18} /> Open the size guide
              </button>
              <Link to="/help#sizing" className="link">
                Sizing help
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="care" style={{ scrollMarginTop: 140 }}>
        <div className="container care">
          <div className="care__intro reveal">
            <p className="eyebrow">Product care</p>
            <h2 className="h2">
              Loved twice, <em>looked after.</em>
            </h2>
            <p className="muted">General guidance by category. The care label sewn into each garment always has the final word.</p>
          </div>
          <div className="care__grid">
            {CARE.map((c, i) => (
              <article key={c.t} className="care-card reveal" style={{ ['--d' as string]: `${i * 70}ms` }}>
                <div className="care-card__h">
                  <Icon name={c.icon} size={24} strokeWidth={1.3} />
                  <h3 className="h4">{c.t}</h3>
                </div>
                <ul>
                  {c.tips.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-rose">
        <div className="container labels-band">
          <div className="reveal">
            <p className="eyebrow">
              Labels & tags <span className="tag tag--gold">Concept</span>
            </p>
            <h2 className="h2">
              Quality you can read, <em>inside every garment.</em>
            </h2>
            <p className="prose" style={{ marginTop: 14 }}>
              The proposed identity brings the same care to the details you only notice up close.
            </p>
            <ul className="labels-band__list" role="list">
              {LABELS.map(([a, b]) => (
                <li key={a}>
                  <strong>{a}</strong>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <p className="demo-note" style={{ marginTop: 18 }}>
              Concept artwork · fibre and care details shown on labels are samples.
            </p>
          </div>
          <div className="labels-band__media reveal-img">
            <Img src="/img/brand/labels.webp" alt="Concept Purple United neck, size and care labels in plum and ivory" />
          </div>
        </div>
      </section>

      <section className="section bg-wine on-dark">
        <div className="container seed">
          <div className="reveal">
            <p className="eyebrow">Thoughtful & responsible</p>
            <h2 className="h2">
              From a label <em>to life.</em>
            </h2>
            <p className="lead" style={{ color: 'rgba(248,243,235,.78)' }}>
              Purple United hang tags are already made of seed paper. Plant the tag, water it, and it grows into flowers.
            </p>
            <ol className="seed__steps" role="list">
              {[
                ['Tag', 'Every tag holds a promise.'],
                ['Planted', 'Into soil, with a little care.'],
                ['Nurtured', 'Watered daily, it grows stronger.'],
                ['Blooming', 'And one day, it blooms.'],
              ].map(([a, b], i) => (
                <li key={a}>
                  <span className="num">0{i + 1}</span>
                  <h3 className="h4">{a}</h3>
                  <p>{b}</p>
                </li>
              ))}
            </ol>
            <p className="demo-note" style={{ marginTop: 24 }}>
              Existing Purple initiative · shown in the proposed brand identity. Share yours with #gopurple.
            </p>
          </div>
          <div className="seed__media reveal-img">
            <Img src="/img/brand/seed-tag.webp" alt="Illustration of a seed-paper hang tag being planted and growing into flowers" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container production reveal">
          <p className="eyebrow">How we work</p>
          <h2 className="h2">
            Made to last, <em>sized to grow.</em>
          </h2>
          <p className="lead" style={{ marginInline: 'auto' }}>
            We would rather tell you less and show you more. These are the principles we design by.
          </p>
          <ul className="production__list" role="list">
            <li>
              <strong>Designed for real childhood</strong>
              Pieces are judged on how they move, wash and wear — not only how they photograph.
            </li>
            <li>
              <strong>Consistent, store after store</strong>
              The same quality online and in every Purple United store, with easy size exchanges.
            </li>
            <li>
              <strong>Honest information</strong>
              Composition and care on every label; product pages say what we know and nothing we can’t stand behind.
            </li>
          </ul>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
            <Link to="/collections/all" className="btn">
              Shop the collection <Icon name="arrow" size={18} className="icon-arrow" />
            </Link>
            <Link to="/about" className="link">
              Our story
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
