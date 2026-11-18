import { useEffect, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { useMeta } from '../lib/hooks'
import '../styles/home-option-two.css'

const ASSETS = '/img/home-option-two/mango-edit/'
const COLLAGE_ASSETS = '/img/home-option-two/collage-edit/'
const CHAPTERS = [
  ['new-now', 'New now'],
  ['editorial', 'Everyday originals'],
  ['coast', 'On the coast'],
  ['city', 'Own your way'],
  ['party', 'Party'],
  ['little-ones', 'Little ones'],
  ['off-duty', 'Soft season'],
  ['gifting', 'Gifting'],
  ['flagship', 'Flagship film'],
] as const

function CampaignPhoto({ name, alt, mobile = false, portrait = false, eager = false }: {
  name: string; alt: string; mobile?: boolean; portrait?: boolean; eager?: boolean
}) {
  return (
    <picture className="h2-photo">
      {mobile && <source media="(max-width: 767px)" srcSet={ASSETS + name + '-mobile-640.webp 640w, ' + ASSETS + name + '-mobile.webp 1080w'} sizes="100vw" width="1080" height="1440" />}
      <img
        src={ASSETS + name + '.webp'}
        srcSet={portrait ? ASSETS + name + '-640.webp 640w, ' + ASSETS + name + '.webp 1280w' : ASSETS + name + '-1280.webp 1280w, ' + ASSETS + name + '.webp 1920w'}
        sizes={portrait ? '(max-width: 600px) 100vw, 50vw' : '100vw'}
        width={portrait ? 1280 : 1920}
        height={portrait ? 1600 : 1080}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        decoding="async"
        onLoad={(event) => event.currentTarget.parentElement?.classList.add('is-loaded')}
      />
    </picture>
  )
}

function FullCampaign({ name, title, alt, hero = false, ink = false }: {
  name: string; title: string; alt: string; hero?: boolean; ink?: boolean
}) {
  const Heading = hero ? 'h1' : 'h2'
  return (
    <section id={'h2-' + name} className={'h2-frame h2-campaign h2-campaign--' + name + (ink ? ' h2-campaign--ink' : '')} data-chapter={name} data-sr="1" aria-labelledby={'h2-title-' + name}>
      <CampaignPhoto name={name} alt={alt} mobile eager={hero} />
      <div className="h2-campaign__title">
        <Heading id={'h2-title-' + name}>{title}</Heading>
        <nav aria-label={title + ' departments'}>
          <a href="#h2-girls">Girls</a><a href="#h2-boys">Boys</a><a href="#h2-little-ones">Little ones</a>
        </nav>
      </div>
      {hero && <a href="#h2-party" className="h2-scroll-hint">Scroll to explore <Icon name="arrow" size={15} /></a>}
    </section>
  )
}

const PHOTOS = {
  studio: { name: 'studio-boy', width: 1122, height: 1402, small: 640, alt: 'A boy in a navy cable-knit jumper and oat trousers, sitting in a sunlit artist’s studio' },
  layers: { name: 'soft-layers', width: 1086, height: 1448, small: 640, alt: 'A girl wearing an ivory cable cardigan, grey skirt and lace-up boots in a leafy courtyard' },
  outside: { name: 'coastal-boy', width: 1086, height: 1448, small: 640, alt: 'A boy in an olive knit and cream trousers looking back as he walks through coastal dunes' },
  coast: { name: 'coastal-friends', width: 1672, height: 941, small: 960, alt: 'Three children in textured winter layers walking together on a sandy beach' },
  crew: { name: 'own-your-way', width: 1280, height: 1792, small: 640, alt: 'A child in a rust knitted beanie, shearling-lined denim jacket and mustard jumper sitting outdoors beside a bicycle' },
  colour: { name: 'colour-play', width: 1920, height: 1280, small: 960, alt: 'A child in a colourful jacket, grey hoodie and mustard shorts against a bright painted wall' },
  together: { name: 'together', width: 1920, height: 1280, small: 960, alt: 'Three girls in sunglasses, denim and a gold jacket walking together outside a shop' },
  baby: { name: 'baby-knit', width: 1122, height: 1402, small: 640, alt: 'A smiling baby in an ivory knitted romper sitting beside a sunny window' },
  wonders: { name: 'small-wonders', width: 1280, height: 1920, small: 640, alt: 'A little girl in a black beret, leather jacket, striped shirt and patterned tights outdoors' },
  courtyard: { name: 'courtyard', width: 1672, height: 941, small: 960, alt: 'Two children in ivory and plum winter layers walking through a sunlit stone courtyard' },
  velvet: { name: 'velvet-evening', width: 1672, height: 941, small: 960, alt: 'Two smiling children in a velvet dress and an ivory blazer dancing before wine-red curtains' },
  denim: { name: 'denim-days', width: 1920, height: 1280, small: 960, alt: 'A girl in a denim jacket holding the brim of a black hat in an autumn landscape' },
} as const
type CollageImage = typeof PHOTOS[keyof typeof PHOTOS]

const ratio = (photo: CollageImage) => photo.width / photo.height
const stackRatio = (...photos: CollageImage[]) => 1 / photos.reduce((sum, photo) => sum + 1 / ratio(photo), 0)

function CollagePhoto({ photo, title, id, position = 'top-left', sizes = '100vw', heading = false }: {
  photo: CollageImage; title: string; id?: string; position?: string; sizes?: string; heading?: boolean
}) {
  const Heading = heading ? 'h2' : 'h3'
  return (
    <article id={id} className="h2-frame h2-collage__tile">
      <picture className="h2-photo">
        <img src={COLLAGE_ASSETS + photo.name + '.webp'}
          srcSet={COLLAGE_ASSETS + photo.name + '-small.webp ' + photo.small + 'w, ' + COLLAGE_ASSETS + photo.name + '.webp ' + photo.width + 'w'}
          sizes={sizes} width={photo.width} height={photo.height} alt={photo.alt} loading="lazy" decoding="async"
          onLoad={(event) => event.currentTarget.parentElement?.classList.add('is-loaded')} />
      </picture>
      <div className={'h2-collage__label h2-collage__label--' + position}><Heading>{title}</Heading></div>
    </article>
  )
}

function GiftingPhoto({ src, width, height, alt, title, lead = false }: {
  src: string; width: number; height: number; alt: string; title: string; lead?: boolean
}) {
  const Heading = lead ? 'h2' : 'h3'
  return (
    <article className="h2-frame h2-collage__tile">
      <picture className="h2-photo">
        <img src={src} width={width} height={height} alt={alt} loading="lazy" decoding="async"
          onLoad={(event) => event.currentTarget.parentElement?.classList.add('is-loaded')} />
      </picture>
      <div className="h2-collage__label"><Heading id={lead ? 'h2-title-gifting' : undefined}>{title}</Heading></div>
    </article>
  )
}

export default function HomeOptionTwo() {
  const root = useRef<HTMLDivElement>(null)
  const film = useRef<HTMLVideoElement>(null)
  const [filmPlaying, setFilmPlaying] = useState(false)
  const [active, setActive] = useState<string>('new-now')
  useMeta('New Now — Purple United Kids', 'The new Purple United campaign: winter layers, coastal days, partywear and little originals.', { canonical: '/' })

  useEffect(() => {
    const element = root.current
    if (!element) return
    const photos = Array.from(element.querySelectorAll<HTMLElement>('.h2-photo'))
    const sections = Array.from(element.querySelectorAll<HTMLElement>(':scope > section'))
    sections.forEach((section) => {
      section.querySelectorAll<HTMLElement>('.h2-collage__tile').forEach((tile, index) => {
        tile.style.setProperty('--h2-reveal-delay', Math.min(index, 2) * 80 + 'ms')
      })
    })
    photos.forEach((photo, index) => {
      photo.dataset.revealDirection = ['left', 'up', 'right'][index % 3]
      const img = photo.querySelector('img')
      if (img?.complete && img.naturalWidth > 0) photo.classList.add('is-loaded')
    })
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const parallax = window.matchMedia('(min-width: 901px) and (pointer: fine)')
    let reveals: IntersectionObserver | undefined
    let chapters: IntersectionObserver | undefined
    if ('IntersectionObserver' in window) {
      if (!reduced.matches) element.classList.add('h2-animate')
      reveals = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            reveals?.unobserve(entry.target)
          }
        })
      }, { threshold: 0.05 })
      photos.forEach((photo) => reveals?.observe(photo))
      sections.forEach((section) => reveals?.observe(section))
      chapters = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive((entry.target as HTMLElement).dataset.chapter || 'new-now')
        })
      }, { rootMargin: '-35% 0px -35% 0px', threshold: 0 })
      element.querySelectorAll('[data-chapter]').forEach((section) => chapters?.observe(section))
    }
    let frame = 0
    const update = () => {
      frame = 0
      const bounds = element.getBoundingClientRect()
      const distance = Math.max(1, element.offsetHeight - window.innerHeight)
      element.style.setProperty('--h2-progress', String(Math.max(0, Math.min(1, -bounds.top / distance))))
      if (!reduced.matches && parallax.matches) {
        const positions = photos.map((photo) => ({ photo, bounds: photo.getBoundingClientRect() }))
        positions.forEach(({ photo, bounds: photoBounds }) => {
          if (photoBounds.bottom < 0 || photoBounds.top > window.innerHeight) return
          const progress = (window.innerHeight / 2 - photoBounds.top - photoBounds.height / 2) / window.innerHeight
          const limit = Math.min(10, photoBounds.height * .012)
          photo.style.setProperty('--h2-parallax', Math.max(-limit, Math.min(limit, progress * 16)) + 'px')
        })
      } else photos.forEach((photo) => photo.style.removeProperty('--h2-parallax'))
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    update()
    return () => {
      reveals?.disconnect()
      chapters?.disconnect()
      cancelAnimationFrame(frame)
      element.classList.remove('h2-animate')
      photos.forEach((photo) => { delete photo.dataset.revealDirection; photo.style.removeProperty('--h2-parallax') })
      element.querySelectorAll<HTMLElement>('[style*="--h2-reveal-delay"]').forEach((tile) => tile.style.removeProperty('--h2-reveal-delay'))
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div ref={root} className="home-two home-two--mango" data-sr-on="1">
      <div className="h2-reading-progress" aria-hidden="true" />
      <nav className="h2-chapters" aria-label="Campaign chapters">
        {CHAPTERS.map(([name, label]) => <a key={name} href={'#h2-' + name} aria-label={label} aria-current={active === name ? 'location' : undefined}><span className="h2-chapters__name">{label}</span><span className="h2-chapters__dot" /></a>)}
      </nav>
      <FullCampaign name="new-now" title="New now" hero alt="Indian children’s winter knitwear campaign in a warm walnut-panelled studio" />
      <section id="h2-editorial" className="h2-collage h2-collage--portraits" data-chapter="editorial" data-sr="1" aria-label="Everyday originals" style={{ gridTemplateColumns: `${ratio(PHOTOS.studio)}fr ${ratio(PHOTOS.layers)}fr ${ratio(PHOTOS.outside)}fr` }}>
        <CollagePhoto photo={PHOTOS.studio} title="Everyday originals" id="h2-boys" position="top-right" sizes="(max-width: 600px) 100vw, 35vw" heading />
        <CollagePhoto photo={PHOTOS.layers} title="Soft layers" id="h2-girls" position="bottom-left" sizes="(max-width: 600px) 100vw, 33vw" />
        <CollagePhoto photo={PHOTOS.outside} title="Outside" sizes="(max-width: 600px) 100vw, 33vw" />
      </section>
      <section id="h2-coast" className="h2-collage h2-collage--coast" data-chapter="coast" data-sr="1" aria-label="On the coast">
        <CollagePhoto photo={PHOTOS.coast} title="On the coast" position="bottom-right" heading />
      </section>
      <section id="h2-city" className="h2-collage h2-collage--city" data-chapter="city" data-sr="1" aria-label="Own your way" style={{ gridTemplateColumns: `${ratio(PHOTOS.crew)}fr ${stackRatio(PHOTOS.colour, PHOTOS.together)}fr` }}>
        <CollagePhoto photo={PHOTOS.crew} title="Own your way" sizes="(max-width: 600px) 100vw, 49vw" heading />
        <div className="h2-collage__stack">
          <CollagePhoto photo={PHOTOS.colour} title="Colour play" sizes="(max-width: 600px) 100vw, 52vw" />
          <CollagePhoto photo={PHOTOS.together} title="Together" sizes="(max-width: 600px) 100vw, 52vw" />
        </div>
      </section>
      <FullCampaign name="party" title="Party" alt="Blush partywear, natural smiles and a deep wine studio backdrop" />
      <section id="h2-little-ones" className="h2-collage h2-collage--little" data-chapter="little-ones" data-sr="1" aria-label="Little ones" style={{ gridTemplateColumns: `${ratio(PHOTOS.baby)}fr ${ratio(PHOTOS.wonders)}fr` }}>
        <CollagePhoto photo={PHOTOS.baby} title="Little ones" position="top-right" sizes="(max-width: 600px) 100vw, 55vw" heading />
        <CollagePhoto photo={PHOTOS.wonders} title="Small wonders" position="bottom-right" sizes="(max-width: 600px) 100vw, 46vw" />
      </section>
      <section id="h2-off-duty" className="h2-collage h2-collage--winter" data-chapter="off-duty" data-sr="1" aria-label="Soft season" style={{ gridTemplateColumns: `${stackRatio(PHOTOS.courtyard, PHOTOS.velvet)}fr ${ratio(PHOTOS.denim)}fr` }}>
        <div className="h2-collage__stack">
          <CollagePhoto photo={PHOTOS.courtyard} title="Soft season" sizes="(max-width: 600px) 100vw, 38vw" heading />
          <CollagePhoto photo={PHOTOS.velvet} title="After hours" position="bottom-left" sizes="(max-width: 600px) 100vw, 38vw" />
        </div>
        <CollagePhoto photo={PHOTOS.denim} title="Off duty" id="h2-denim" sizes="(max-width: 600px) 100vw, 63vw" />
      </section>
      <section id="h2-gifting" className="h2-collage h2-collage--gifting" data-chapter="gifting" data-sr="1" aria-labelledby="h2-title-gifting"
        style={{ gridTemplateColumns: `${1600 / 1064}fr ${1 / (585 / 796 + 1038 / 1400)}fr` }}>
        <GiftingPhoto src="/img/brand/packaging-hero.webp" width={1600} height={1064}
          alt="Purple United plum and ivory gift boxes, shopping bags, tissue and gift cards with a folded ivory knit" title="Gifting" lead />
        <div className="h2-collage__stack">
          <GiftingPhoto src="/img/brand/gift-box.webp" width={796} height={585}
            alt="A plum Purple United gift box finished with an ivory satin ribbon" title="Made special" />
          <GiftingPhoto src="/img/brand/gift-card.webp" width={1400} height={1038}
            alt="Purple United gift card and presentation packaging" title="Their choice" />
        </div>
      </section>
      <section id="h2-flagship" className="h2-frame h2-film" data-chapter="flagship" data-sr="1" aria-label="Purple United flagship walkthrough">
        <video ref={film} autoPlay muted loop playsInline preload="metadata" poster="/video/flagship-poster.webp"
          onPlay={() => setFilmPlaying(true)} onPause={() => setFilmPlaying(false)}
          aria-label="Purple United Kids flagship store walkthrough with music">
          <source src="/video/home-option-two-flagship.mp4" type="video/mp4" />
          Your browser does not support video playback.
        </video>
        <button type="button" className="h2-film__toggle" aria-label={filmPlaying ? 'Pause video' : 'Play video'} onClick={() => {
          const video = film.current
          if (!video) return
          if (video.paused) void video.play().catch(() => setFilmPlaying(false))
          else video.pause()
        }}><Icon name={filmPlaying ? 'pause' : 'play'} size={21} /></button>
      </section>
    </div>
  )
}
