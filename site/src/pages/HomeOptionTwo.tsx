import { useEffect, useRef, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { useMeta } from '../lib/hooks'
import '../styles/home-option-two.css'

const ASSETS = '/img/home-option-two/'

function CampaignImage({ name, alt, mobile = false, eager = false, portrait = false }: {
  name: string; alt: string; mobile?: boolean; eager?: boolean; portrait?: boolean
}) {
  return (
    <picture className="h2-picture">
      {mobile && <source media="(max-width: 1023px)" srcSet={`${ASSETS}${name}-mobile-640.webp 640w, ${ASSETS}${name}-mobile.webp 1080w`} sizes="100vw" width="1080" height="1440" />}
      <img
        src={`${ASSETS}${name}.webp`}
        srcSet={portrait ? `${ASSETS}${name}-640.webp 640w, ${ASSETS}${name}.webp 1280w` : `${ASSETS}${name}-1280.webp 1280w, ${ASSETS}${name}.webp 1920w`}
        sizes={portrait ? '(max-width: 1023px) 100vw, 50vw' : '100vw'}
        width={portrait ? 1280 : 1920}
        height={portrait ? 1600 : 1080}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        decoding="async"
      />
    </picture>
  )
}

function StoryLink({ to, children, light = false }: { to: string; children: string; light?: boolean }) {
  return <Link to={to} className={`h2-link${light ? ' h2-link--light' : ''}`}><span>{children}</span><Icon name="arrow" size={19} /></Link>
}

function useCampaignMotion(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const element = root.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!element || reduced.matches) return
    const reveals = Array.from(element.querySelectorAll<HTMLElement>('[data-h2-reveal]'))
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('h2-visible')
          observer?.unobserve(entry.target)
        }
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }) : null
    if (observer) {
      element.classList.add('h2-motion')
      reveals.forEach((reveal) => observer.observe(reveal))
    }
    const panels = Array.from(element.querySelectorAll<HTMLElement>('[data-h2-parallax]'))
    let frame = 0
    const update = () => {
      frame = 0
      if (reduced.matches || window.innerWidth < 1024) return
      for (const panel of panels) {
        const bounds = panel.getBoundingClientRect()
        if (bounds.bottom < 0 || bounds.top > window.innerHeight) continue
        const distance = Math.max(-24, Math.min(24, (window.innerHeight / 2 - bounds.top - bounds.height / 2) * 0.045))
        panel.style.setProperty('--h2-parallax', `${distance}px`)
      }
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    update()
    return () => {
      observer?.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      element.classList.remove('h2-motion')
    }
  }, [root])
}

export default function HomeOptionTwo() {
  const root = useRef<HTMLDivElement>(null)
  useCampaignMotion(root)
  useMeta('A Little More Wonder — Purple United Kids', 'A new perspective on growing up. Discover thoughtful layers, joyful occasionwear and soft first wardrobes in the Purple United winter campaign.', { canonical: '/' })

  return (
    <div ref={root} className="home-two" data-sr-on="1">
      <section className="h2-hero" data-sr="1" aria-labelledby="h2-hero-title">
        <div className="h2-hero__image" data-h2-parallax>
          <CampaignImage name="hero" mobile eager alt="Indian children’s winter fashion campaign in a sunlit stone courtyard, featuring tactile ivory knitwear" />
        </div>
        <div className="h2-hero__content">
          <p className="h2-kicker h2-hero__enter">The winter chapter · 2026</p>
          <h1 id="h2-hero-title" className="h2-hero__title h2-hero__enter"><span className="h2-hero__line">A little</span>{' '}<span className="h2-hero__line">more</span>{' '}<em>wonder.</em></h1>
          <p className="h2-hero__description h2-hero__enter">For big imaginations.<br /> And all the little moments.</p>
          <div className="h2-hero__enter"><StoryLink to="/collections/new-arrivals">Discover the new collection</StoryLink></div>
        </div>
        <div className="h2-hero__folio" aria-hidden="true"><span>Purple United / A world of their own</span><span>01 — 03</span></div>
      </section>

      <nav className="h2-index" aria-label="Explore the new collection">
        <span className="h2-index__caption">Their world, their way</span>
        <div className="h2-index__links">
          <Link to="/collections/girls">Girls <span>02–14</span></Link>
          <Link to="/collections/boys">Boys <span>02–14</span></Link>
          <Link to="/collections/infants">Infants <span>00–24m</span></Link>
          <Link to="/collections/footwear-accessories">Footwear <Icon name="arrow" size={16} /></Link>
        </div>
      </nav>

      <section className="h2-prologue h2-gutter" data-sr="1" aria-labelledby="h2-prologue-title">
        <p className="h2-kicker" data-h2-reveal>A world of their own</p>
        <h2 id="h2-prologue-title" data-h2-reveal>Let them be<br /><em>beautifully themselves.</em></h2>
        <div className="h2-prologue__aside" data-h2-reveal><span className="h2-tiny">A note on growing up</span><p>A little curious. A little fearless. Entirely their own. Clothes that follow their imagination, wherever it takes them.</p></div>
        <span className="h2-prologue__mark" aria-hidden="true">PU / 26</span>
      </section>

      <section className="h2-edits h2-gutter" id="their-world" data-sr="1" aria-label="The girls and boys edits">
        <article className="h2-edit h2-edit--girls" data-h2-reveal>
          <Link to="/collections/girls" className="h2-edit__image" aria-label="Explore the girls edit">
            <CampaignImage name="girls" portrait alt="A smiling Indian girl turning in a mauve pleated dress and rose cardigan against a warm stucco wall" />
            <span className="h2-image-corner" aria-hidden="true"><Icon name="arrow" size={24} /></span>
          </Link>
          <div className="h2-edit__meta"><span className="h2-kicker">01 / The girls edit</span><span className="h2-tiny">2–14 years</span></div>
          <h2>In her<br /><em>own rhythm.</em></h2>
          <div className="h2-edit__bottom"><p>Soft layers. Spirited days.<br />A little room to twirl.</p><StoryLink to="/collections/girls">Explore girls</StoryLink></div>
        </article>
        <article className="h2-edit h2-edit--boys" data-h2-reveal>
          <div className="h2-edit__note"><span className="h2-kicker">Made for the moments</span><p>Unscripted.<br /><em>Unmistakably them.</em></p></div>
          <Link to="/collections/boys" className="h2-edit__image" aria-label="Explore the boys edit">
            <CampaignImage name="boys" portrait alt="An Indian boy in a navy cable-knit sweater and oat corduroy trousers sitting in a sunlit artist’s studio" />
            <span className="h2-image-corner" aria-hidden="true"><Icon name="arrow" size={24} /></span>
          </Link>
          <div className="h2-edit__meta"><span className="h2-kicker">02 / The boys edit</span><span className="h2-tiny">2–14 years</span></div>
          <h2>The everyday<br /><em>explorer.</em></h2>
          <div className="h2-edit__bottom"><p>Comfort with character.<br />For taking the long way home.</p><StoryLink to="/collections/boys">Explore boys</StoryLink></div>
        </article>
      </section>

      <section className="h2-occasion" data-sr="1" aria-labelledby="h2-occasion-title">
        <div className="h2-occasion__image" data-h2-parallax><CampaignImage name="occasion" mobile alt="Children’s celebration campaign featuring rich plum velvet, an ivory collar and natural movement" /></div>
        <div className="h2-occasion__content" data-h2-reveal>
          <p className="h2-kicker">The celebration edit</p>
          <h2 id="h2-occasion-title">Little guests.<br /><em>Grand entrances.</em></h2>
          <p>For the party, the photograph,<br />and the dance before bedtime.</p>
          <StoryLink to="/collections/celebration-party" light>Dress for the occasion</StoryLink>
        </div>
        <div className="h2-campaign-caption"><span>Velvet evenings & a little magic</span><span>Campaign No. 02</span></div>
      </section>

      <section className="h2-infant h2-gutter" data-sr="1" aria-labelledby="h2-infant-title">
        <div className="h2-infant__copy" data-h2-reveal>
          <p className="h2-kicker">Their very first chapter · 0–24 months</p>
          <h2 id="h2-infant-title">Small<br />beginnings.<br /><em>Endless love.</em></h2>
          <p className="h2-infant__description">The softest layers for the biggest little changes. Thoughtful first wardrobes, made for closeness.</p>
          <StoryLink to="/collections/infants">Meet the infant collection</StoryLink>
          <p className="h2-infant__signature">Little by little, a whole new world.</p>
        </div>
        <figure className="h2-infant__image" data-h2-reveal><CampaignImage name="infant" portrait alt="An Indian baby with a natural smile wearing an ivory knitted romper on a soft oat blanket by a window" /><figcaption>Softness, in every small detail.</figcaption></figure>
      </section>

      <section className="h2-outside" data-sr="1" aria-labelledby="h2-outside-title">
        <div className="h2-outside__heading h2-gutter" data-h2-reveal><div><p className="h2-kicker">The art of everyday adventure</p><h2 id="h2-outside-title">Less hurry.<br /><em>More discovery.</em></h2></div><p>Open skies. Sandy pockets.<br />Nowhere else to be.</p></div>
        <div className="h2-outside__image" data-h2-reveal><CampaignImage name="outside" mobile alt="Children’s outdoor campaign on sandy coastal dunes, featuring relaxed knitwear and natural movement" /></div>
        <div className="h2-outside__caption h2-gutter"><span className="h2-tiny">The everyday essentials / Winter 2026</span><StoryLink to="/collections/weekend-adventures">Find their next adventure</StoryLink></div>
      </section>

      <section className="h2-epilogue h2-gutter" data-sr="1" aria-labelledby="h2-epilogue-title">
        <p className="h2-kicker" data-h2-reveal>From first steps to their next chapter</p>
        <h2 id="h2-epilogue-title" data-h2-reveal>Childhood is a world.<br /><em>Let them wear it.</em></h2>
        <div data-h2-reveal><StoryLink to="/collections/all">Explore Purple United</StoryLink></div>
        <p className="h2-art-note">Campaign imagery created for this concept.</p>
      </section>
    </div>
  )
}
