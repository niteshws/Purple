import '../styles/info.css'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Img, Breadcrumbs, Crest } from '../components/ui'
import { STORE_COUNT } from '../data/site'
import { useMeta } from '../lib/hooks'

const VALUES = [
  { t: 'Premium quality', d: 'Fabric, fit and finish you can feel.' },
  { t: 'Child-led expression', d: 'Clothes that let them be themselves.' },
  { t: 'Thoughtful & responsible', d: 'Made to last, sized to grow.' },
]

const TERRITORIES = [
  { n: '01', t: 'The art of growing up', line: 'Made for every version of them.', d: 'Warm, nostalgic and milestone-led. Purple grows with your child.', img: '/img/editorial/art-of-growing-up.webp' },
  { n: '02', t: 'The little originals', line: 'Born to be their own.', d: 'Bold, playful and full of self-expression. Their personality, dressed with style.', img: '/img/editorial/born-to-be.webp' },
  { n: '03', t: 'A little extraordinary', line: 'Premium, reimagined for childhood.', d: 'Refined and aspirational. Everyday moments, made special.', img: '/img/editorial/sisters-pink.webp' },
]

const VISION = [
  { y: 'Year 1', t: 'Establish', d: 'Positioning, identity and one consistent brand. Every new store opens in the new Purple.' },
  { y: 'Year 2', t: 'Elevate', d: 'A stronger premium perception and a richer customer experience.' },
  { y: 'Year 3', t: 'Connect', d: 'Deeper brand affinity and distinct collection storytelling.' },
  { y: 'Years 4–5', t: 'Expand', d: 'Stronger brand equity and new opportunities to grow.' },
]

export default function About() {
  useMeta('Our Story', 'Purple United Kids makes premium fashion for newborns to 14-year-olds — clothes children love to wear and parents trust to last.')
  return (
    <>
      <section className="about-hero">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Our story' }]} />
          <div className="about-hero__grid">
            <div className="about-hero__text reveal">
              <p className="eyebrow">
                <span className="kicker-rule" />
                Our story
              </p>
              <h1 className="display">
                The joy of <em>growing up.</em>
              </h1>
              <p className="lead">
                Growing up is their journey. Making it special is ours. Purple United Kids dresses children from their very first days to their early teens —
                boys, girls and infants, head to toe.
              </p>
              <p className="signature" style={{ fontSize: 24, color: 'var(--gold)' }}>
                A modern French sensibility for a new generation.
              </p>
            </div>
            <div className="about-hero__media reveal-img">
              <Img src="/img/editorial/art-of-growing-up.webp" alt="A brother and sister in soft lilac knits laughing together in a flowering garden" eager />
              <div className="about-hero__badge" aria-hidden="true">
                <Crest variant="mark" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="manifesto bg-oat">
        <div className="container reveal">
          <p className="eyebrow">What we believe</p>
          <p className="manifesto__line">
            Premium fashion. Individual expression. <em>The joy of growing up.</em>
          </p>
          <p className="manifesto__sub">
            Children want to express who they are. Parents want to give them the best as they grow. We sit happily in the middle — with clothes that are made
            well, feel wonderful and look entirely like them.
          </p>
          <p className="demo-note" style={{ marginTop: 22 }}>
            Proposed brand positioning · to be validated through consumer research
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container mission">
          <div className="mission__media reveal-img">
            <Img src="/img/editorial/baby-knit.webp" alt="A baby in a striped knit cardigan and bobble hat looking up curiously" pos="50% 35%" />
          </div>
          <div className="mission__body reveal">
            <p className="eyebrow">Our mission</p>
            <h2 className="mission__quote">
              “To make every stage of growing up feel special, with premium fashion children love to wear and parents trust to last.”
            </h2>
            <p className="prose">
              We describe ourselves as the first-of-its-kind premium fashion brand for kids — and our own stated vision is simple: to be the most admired
              premium fashion brand in kids’ fashion. That ambition starts with the product. Every piece is designed for real childhood: running, climbing,
              twirling, napping and growing out of everything far too quickly.
            </p>
            <div className="values">
              {VALUES.map((v) => (
                <div key={v.t}>
                  <h3 className="h4">{v.t}</h3>
                  <p>{v.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-paper">
        <div className="container">
          <div className="section-head reveal">
            <div className="section-head__text">
              <p className="eyebrow">Who we design for</p>
              <h2 className="h2">
                Two people, <em>one choice.</em>
              </h2>
            </div>
            <p className="muted" style={{ maxWidth: 380 }}>
              The child is the influencer. The parent is the buyer. We design so that both say yes.
            </p>
          </div>
          <div className="audience reveal">
            <div className="audience__col">
              <p className="eyebrow">The child</p>
              <h3 className="h3">
                Style, colour, <em>a say.</em>
              </h3>
              <ul role="list">
                {['Style & colour', 'Personal expression', 'Trends & discovery', 'Individuality', 'Confidence in what they wear'].map((x) => (
                  <li key={x}>
                    <Icon name="sparkle" size={16} /> {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="audience__col">
              <p className="eyebrow">The parent</p>
              <h3 className="h3">
                Quality you can <em>trust.</em>
              </h3>
              <ul role="list">
                {['Quality & comfort', 'Fit & durability', 'Value & trust', 'Age-appropriate fashion', 'Confidence in the choice'].map((x) => (
                  <li key={x}>
                    <Icon name="check" size={16} /> {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-wine on-dark">
        <div className="container">
          <div className="section-head reveal">
            <div className="section-head__text">
              <p className="eyebrow">Brand territories</p>
              <h2 className="h2">
                Three ways Purple <em>could feel.</em>
              </h2>
            </div>
            <span className="demo-note">Proposed territories · research will test all three</span>
          </div>
          <div className="territories">
            {TERRITORIES.map((t, i) => (
              <article key={t.n} className="territory reveal" style={{ ['--d' as string]: `${i * 90}ms` }}>
                <Img src={t.img} alt="" pos="50% 30%" />
                <p className="num">{t.n}</p>
                <div style={{ display: 'grid', gap: 8 }}>
                  <p className="eyebrow">{t.t}</p>
                  <h3 className="h3">{t.line}</h3>
                  <p>{t.d}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container presence">
          <div className="presence__text reveal">
            <p className="eyebrow">Come and visit</p>
            <p className="presence__stat">
              {STORE_COUNT}
              <em>.</em>
            </p>
            <h2 className="h3">Stores across India, and growing.</h2>
            <p className="prose">
              Online is often the first Purple moment. Our stores are where families see, touch and try — and where our team helps choose the right size. Find
              the one nearest you, with directions and opening hours.
            </p>
            <div>
              <Link to="/stores" className="btn">
                Find a store <Icon name="arrow" size={18} className="icon-arrow" />
              </Link>
            </div>
          </div>
          <div className="presence__media reveal-img">
            <Img src="/img/editorial/family-store.webp" alt="Parents holding up a floral dress for their toddler in a Purple United store" pos="50% 30%" />
          </div>
        </div>
      </section>

      <section className="section bg-oat">
        <div className="container">
          <div className="section-head reveal">
            <div className="section-head__text">
              <p className="eyebrow">
                Looking ahead <span className="tag tag--gold">Proposed</span>
              </p>
              <h2 className="h2">
                A brand that grows <em>with every generation.</em>
              </h2>
            </div>
          </div>
          <div className="vision reveal">
            {VISION.map((v) => (
              <div key={v.y} className="vision__step">
                <p className="eyebrow">{v.y}</p>
                <h3 className="h4">{v.t}</h3>
                <p>{v.d}</p>
              </div>
            ))}
          </div>
          <p className="demo-note" style={{ marginTop: 28 }}>
            Strategic ambitions from the brand proposal, not guaranteed outcomes.
          </p>
        </div>
      </section>

      <section className="section closing">
        <div className="container closing__inner">
          <div className="closing__media reveal-img">
            <Img src="/img/lifestyle/girls-group.webp" alt="Four girls in pastel dresses laughing together outdoors" />
          </div>
          <div className="closing__text reveal">
            <p className="signature" style={{ fontSize: 26, color: 'var(--gold)' }}>
              Fashion for their next chapter.
            </p>
            <h2 className="h2">
              Ready when <em>they are.</em>
            </h2>
            <div className="closing__ctas">
              <Link to="/collections/new-arrivals" className="btn">
                Shop new arrivals <Icon name="arrow" size={18} className="icon-arrow" />
              </Link>
              <Link to="/craft" className="link">
                Our craft
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
