import { useEffect, useRef } from 'react'
import { useMeta } from '../lib/hooks'
import '../styles/home-option-two.css'

type Photo = { src: string; width: number; height: number }

const PHOTOS = {
  hero: { src: '/img/campaign/hero/little-originals-desktop.webp', width: 1983, height: 793 },
  heroMobile: { src: '/img/campaign/hero/little-originals-mobile.webp', width: 960, height: 720 },
  girls: { src: '/img/home-option-two/girls.webp', width: 1280, height: 1600 },
  boys: { src: '/img/campaign/wardrobe/home-boys.webp', width: 1122, height: 1402 },
  celebration: { src: '/img/campaign/hero/girls-edit-desktop.webp', width: 1983, height: 793 },
  celebrationMobile: { src: '/img/campaign/hero/girls-edit-mobile.webp', width: 960, height: 720 },
  infants: { src: '/img/campaign/hero/infant-edit-desktop.webp', width: 1983, height: 793 },
  infantsMobile: { src: '/img/campaign/hero/infant-edit-mobile.webp', width: 960, height: 720 },
  play: { src: '/img/home-option-two/outside-mobile.webp', width: 1080, height: 1440 },
  footwear: { src: '/img/campaign/footwear-podiums.webp', width: 1800, height: 1673 },
} satisfies Record<string, Photo>

/** Native image proportions keep the entire photograph visible, including every face. */
function CampaignPhoto({ photo, mobile, alt, eager = false }: {
  photo: Photo; mobile?: Photo; alt: string; eager?: boolean
}) {
  return (
    <picture className="h2-picture">
      {mobile && <source media="(max-width: 1023px)" srcSet={mobile.src} width={mobile.width} height={mobile.height} />}
      <img
        src={photo.src}
        width={photo.width}
        height={photo.height}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        decoding="async"
      />
    </picture>
  )
}

function Campaign({ name, photo, mobile, alt, line1, line2, label, hero = false }: {
  name: string; photo: Photo; mobile: Photo; alt: string; line1: string; line2: string;
  label: string; hero?: boolean
}) {
  const Heading = hero ? 'h1' : 'h2'
  const titleId = 'h2-' + name + '-title'
  return (
    <section id={'h2-' + name} className={'h2-campaign h2-campaign--' + name} data-sr="1" aria-labelledby={titleId}>
      <CampaignPhoto photo={photo} mobile={mobile} alt={alt} eager={hero} />
      <div className={'h2-campaign__content' + (hero ? ' h2-arrive' : '')} data-h2-reveal={hero ? undefined : ''}>
        <p className="h2-label">{label}</p>
        <Heading id={titleId}>{line1}<br />{' '}{line2}</Heading>
      </div>
    </section>
  )
}

export default function HomeOptionTwo() {
  const root = useRef<HTMLDivElement>(null)
  useMeta('Little Originals — Purple United Kids', 'Big little energy. Explore girls, boys, infants, occasionwear and footwear in the Purple United winter edit.', { canonical: '/' })

  useEffect(() => {
    const element = root.current
    if (!element || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('h2-visible')
          observer.unobserve(entry.target)
        }
      }
    }, { threshold: 0.06, rootMargin: '0px 0px -16px 0px' })
    element.classList.add('h2-motion')
    element.querySelectorAll('[data-h2-reveal]').forEach((target) => observer.observe(target))
    return () => {
      observer.disconnect()
      element.classList.remove('h2-motion')
    }
  }, [])

  return (
    <div ref={root} className="home-two" data-sr-on="1">
      <Campaign
        name="hero" hero photo={PHOTOS.hero} mobile={PHOTOS.heroMobile}
        alt="Three children laughing together in plum, rose and striped winter layers in a stone courtyard"
        label="New now · Winter 26" line1="Little" line2="originals."
      />

      <nav className="h2-index" aria-label="Explore homepage departments">
        <a href="#h2-girls">Girls</a>
        <a href="#h2-boys">Boys</a>
        <a href="#h2-infants">Infants</a>
        <a href="#h2-footwear">Footwear</a>
      </nav>

      <section className="h2-departments" data-sr="1" aria-label="The girls and boys edits">
        <article id="h2-girls" className="h2-department">
          <CampaignPhoto photo={PHOTOS.girls} alt="A girl twirling in a mauve pleated dress and rose cardigan against a warm stucco wall" />
          <div className="h2-department__caption" data-h2-reveal><div><span className="h2-label">2–14 years</span><h2>Girls.</h2></div></div>
        </article>
        <article id="h2-boys" className="h2-department">
          <CampaignPhoto photo={PHOTOS.boys} alt="A boy in an olive utility jacket, relaxed brown trousers and white sneakers" />
          <div className="h2-department__caption" data-h2-reveal><div><span className="h2-label">2–14 years</span><h2>Boys.</h2></div></div>
        </article>
      </section>

      <Campaign
        name="celebration" photo={PHOTOS.celebration} mobile={PHOTOS.celebrationMobile}
        alt="Two smiling girls twirling in rose and deep wine party dresses beneath terracotta arches"
        label="The occasion edit" line1="Party" line2="people."
      />

      <Campaign
        name="infants" photo={PHOTOS.infants} mobile={PHOTOS.infantsMobile}
        alt="Two little children smiling and playing together in ivory and rose knitwear by a sunlit window"
        label="0–24 months" line1="Small" line2="wonders."
      />

      <section className="h2-discover" data-sr="1" aria-label="Playwear and footwear">
        <article className="h2-department h2-discover__play">
          <CampaignPhoto photo={PHOTOS.play} alt="A boy in an olive textured sweater looking back with a smile while exploring coastal dunes" />
          <div className="h2-department__caption" data-h2-reveal><h2>Made to move.</h2></div>
        </article>
        <div className="h2-discover__side">
          <article id="h2-footwear" className="h2-department">
            <CampaignPhoto photo={PHOTOS.footwear} alt="Rose high-top sneakers, pink booties, lilac clogs and a butterfly bag on plum and blush display plinths" />
            <div className="h2-department__caption" data-h2-reveal><h2>Go places.</h2></div>
          </article>
          <div className="h2-discover__all" data-h2-reveal><p>Big little energy.</p></div>
        </div>
      </section>
    </div>
  )
}
