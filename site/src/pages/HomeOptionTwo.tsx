import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Icon } from '../components/Icon'
import { useMeta } from '../lib/hooks'
import '../styles/home-option-two.css'

const ASSETS = '/img/home-option-two/mango-edit/'
const CHAPTERS = [
  ['new-now', 'New now'],
  ['party', 'Party'],
  ['editorial', 'The edits'],
  ['off-duty', 'Off duty'],
  ['little-ones', 'Little ones'],
] as const

function moveDetail(event: PointerEvent<HTMLElement>) {
  if (event.pointerType !== 'mouse') return
  const bounds = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--pointer-x', Math.max(0, Math.min(bounds.width - 150, event.clientX - bounds.left)) + 'px')
  event.currentTarget.style.setProperty('--pointer-y', Math.max(0, Math.min(bounds.height - 60, event.clientY - bounds.top)) + 'px')
}

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
    <section id={'h2-' + name} className={'h2-frame h2-campaign h2-campaign--' + name + (ink ? ' h2-campaign--ink' : '')} data-chapter={name} data-sr="1" aria-labelledby={'h2-title-' + name} onPointerMove={moveDetail}>
      <CampaignPhoto name={name} alt={alt} mobile eager={hero} />
      <div className="h2-campaign__title">
        <Heading id={'h2-title-' + name}>{title}</Heading>
        <nav aria-label={title + ' departments'}>
          <a href="#h2-girls">Girls</a><a href="#h2-boys">Boys</a><a href="#h2-little-ones">Little ones</a>
        </nav>
      </div>
      <span className="h2-hover-detail" aria-hidden="true"><span />Winter 26</span>
      {hero && <a href="#h2-party" className="h2-scroll-hint">Scroll to explore <Icon name="arrow" size={15} /></a>}
    </section>
  )
}

const EDITS = [
  { name: 'co-ords', id: 'h2-girls', title: 'Co-ords', detail: 'Soft days', alt: 'An Indian girl wearing a pale blue striped co-ord with ribbon bows in a softly lit room' },
  { name: 'street', id: 'h2-street', title: 'Streetwear', detail: 'Their own way', alt: 'An Indian girl in an olive cap, oversized ivory tee and dark wide-leg jeans on a stone city street' },
  { name: 'playwear', id: 'h2-boys', title: 'Playwear', detail: 'Ready for anything', alt: 'An Indian boy in a wine-red cap, ivory tee and relaxed jeans sitting in a small boucle chair' },
  { name: 'denim', id: 'h2-denim', title: 'Denim', detail: 'A new rhythm', alt: 'An Indian girl in charcoal wide-leg denim dungarees, an ivory shirt and cream headphones in a light studio' },
] as const

export default function HomeOptionTwo() {
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<string>('new-now')
  useMeta('New Now — Purple United Kids', 'The new Purple United campaign: partywear, co-ords, denim and little originals.', { canonical: '/' })

  useEffect(() => {
    const element = root.current
    if (!element) return
    const photos = Array.from(element.querySelectorAll<HTMLElement>('.h2-photo'))
    photos.forEach((photo) => {
      const img = photo.querySelector('img')
      if (img?.complete && img.naturalWidth > 0) photo.classList.add('is-loaded')
    })
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
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
      <FullCampaign name="party" title="Party" alt="Blush partywear, natural smiles and a deep wine studio backdrop" />
      <section id="h2-editorial" className="h2-editorial-grid" data-chapter="editorial" data-sr="1" aria-label="Four new perspectives">
        {EDITS.map((edit, index) => (
          <article key={edit.name} id={edit.id} className="h2-frame h2-editorial" onPointerMove={moveDetail}>
            <CampaignPhoto name={edit.name} alt={edit.alt} portrait />
            <div className="h2-editorial__caption"><div><h2>{edit.title}</h2><span className="h2-editorial__detail">{edit.detail}</span></div><span className="h2-editorial__number" aria-hidden="true">0{index + 1} / 04</span></div>
            <span className="h2-hover-detail" aria-hidden="true"><span />The new edit</span>
          </article>
        ))}
      </section>
      <FullCampaign name="off-duty" title="Off duty" ink alt="An Indian girl in a relaxed washed denim co-ord lounging beside a charcoal sofa" />
      <FullCampaign name="little-ones" title="Little ones" ink alt="Indian babywear in ivory and pale blue, photographed in soft natural nursery light" />
    </div>
  )
}
