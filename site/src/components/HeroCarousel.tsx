import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icon'

/* Homepage campaign hero — four editorial slides that auto-advance.
   - Crossfade + slow push-in on the image, staggered text entrance per slide.
   - Pauses on hover / keyboard focus / hidden tab; visible pause control (WCAG 2.2.2).
   - prefers-reduced-motion: no autoplay, no motion.
   - Separate desktop (2.5:1) and mobile (4:3) crops via <picture>. */

export interface HeroSlide {
  key: string
  eyebrow: string
  line1: string
  line2: string
  copy: string
  cta: { label: string; to: string }
  desktop: string
  mobile: string
  alt: string
  pos?: string
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    key: 'little-originals',
    eyebrow: 'The Little Originals',
    line1: 'Born to be',
    line2: 'their own.',
    copy: 'Considered clothes for curious minds, big imaginations and the joy of growing up.',
    cta: { label: 'Shop the collection', to: '/collections/new-arrivals' },
    desktop: '/img/campaign/hero/little-originals-desktop.webp',
    mobile: '/img/campaign/hero/little-originals-mobile.webp',
    alt: 'Three children laughing as they walk through a sunlit sandstone courtyard in corduroy, knits and a quilted jacket',
    pos: '72% 40%',
  },
  {
    key: 'boys-edit',
    eyebrow: 'The Boys Edit',
    line1: 'Wherever they',
    line2: 'wander.',
    copy: 'Easy layers and room to move when they decide to take the long way home.',
    cta: { label: 'Shop boys', to: '/collections/boys' },
    desktop: '/img/campaign/hero/boys-edit-desktop.webp',
    mobile: '/img/campaign/hero/boys-edit-mobile.webp',
    alt: 'Two brothers holding hands and balancing along an old stone wall in denim, cargos and utility jackets',
    pos: '72% 40%',
  },
  {
    key: 'girls-edit',
    eyebrow: 'The Girls Edit',
    line1: 'A little room',
    line2: 'to twirl.',
    copy: 'Party dresses and everyday favourites that move the way she does.',
    cta: { label: 'Shop girls', to: '/collections/girls' },
    desktop: '/img/campaign/hero/girls-edit-desktop.webp',
    mobile: '/img/campaign/hero/girls-edit-mobile.webp',
    alt: 'Two girls twirling in a rose-pink tulle dress and a wine velvet dress under terracotta arches',
    pos: '70% 40%',
  },
  {
    key: 'infant-edit',
    eyebrow: 'The Infant Edit',
    line1: 'Small beginnings.',
    line2: 'Big feelings.',
    copy: 'Soft layers for first discoveries, new favourite textures and little everyday joys.',
    cta: { label: 'Shop infants', to: '/collections/infants' },
    desktop: '/img/campaign/hero/infant-edit-desktop.webp',
    mobile: '/img/campaign/hero/infant-edit-mobile.webp',
    alt: 'A baby and a toddler in soft knit cardigans laughing as they share a wooden ring toy on a woven rug',
    pos: '70% 40%',
  },
]

const INTERVAL = 3000

export function HeroCarousel({ slides = HERO_SLIDES }: { slides?: HeroSlide[] }) {
  const [index, setIndex] = useState(0)
  const [userPaused, setUserPaused] = useState(false)
  const [hoverPaused, setHoverPaused] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0]))
  const root = useRef<HTMLElement>(null)
  const touch = useRef<{ x: number; y: number } | null>(null)
  const n = slides.length

  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      setReduced(mq.matches)
      const on = () => setReduced(mq.matches)
      mq.addEventListener('change', on)
      return () => mq.removeEventListener('change', on)
    } catch {
      /* no matchMedia */
    }
  }, [])

  // Warm the next slides once the first image is on screen.
  useEffect(() => {
    const t = setTimeout(() => setLoaded(new Set(slides.map((_, i) => i))), 1200)
    return () => clearTimeout(t)
  }, [slides])

  const go = useCallback(
    (i: number) => {
      const next = (i + n) % n
      setLoaded((l) => (l.has(next) ? l : new Set(l).add(next)))
      setIndex(next)
    },
    [n],
  )

  const paused = userPaused || hoverPaused || reduced

  // Advance every INTERVAL. If the tab is in the background when the timer fires,
  // hold the slide and restart the countdown once the page is visible again.
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (paused) return
    const t = setTimeout(() => {
      if (document.visibilityState === 'visible') go(index + 1)
      else {
        const onVis = () => {
          if (document.visibilityState === 'visible') {
            document.removeEventListener('visibilitychange', onVis)
            setTick((x) => x + 1)
          }
        }
        document.addEventListener('visibilitychange', onVis)
      }
    }, INTERVAL)
    return () => clearTimeout(t)
  }, [index, paused, go, tick])

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(index + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(index - 1)
    }
  }

  return (
    <section
      ref={root}
      className={`hero-c${paused ? ' is-paused' : ''}`}
      aria-roledescription="carousel"
      aria-label="New season campaigns"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocus={(e) => {
        if (root.current?.contains(e.target as Node) && (e.target as HTMLElement).matches(':focus-visible')) setHoverPaused(true)
      }}
      onBlur={(e) => {
        if (!root.current?.contains(e.relatedTarget as Node)) setHoverPaused(false)
      }}
      onKeyDown={onKey}
      onTouchStart={(e) => {
        touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }}
      onTouchEnd={(e) => {
        if (!touch.current) return
        const dx = e.changedTouches[0].clientX - touch.current.x
        const dy = e.changedTouches[0].clientY - touch.current.y
        touch.current = null
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1))
      }}
    >
      <div className="hero-c__slides" aria-live={paused ? 'polite' : 'off'}>
        {slides.map((s, i) => {
          const active = i === index
          const HeadingTag = i === 0 ? 'h1' : 'h2'
          return (
            <div
              key={s.key}
              className={`hero-c__slide${active ? ' is-active' : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}: ${s.eyebrow}`}
              aria-hidden={!active}
              inert={!active ? true : undefined}
            >
              <picture className="hero-c__media">
                {loaded.has(i) && <source media="(max-width: 767px)" srcSet={s.mobile} />}
                {loaded.has(i) ? (
                  <img
                    src={s.desktop}
                    alt={s.alt}
                    width={1983}
                    height={793}
                    decoding="async"
                    fetchPriority={i === 0 ? 'high' : 'low'}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    style={{ objectPosition: s.pos }}
                  />
                ) : null}
              </picture>
              <div className="hero-c__shade" aria-hidden="true" />
              <div className="container hero-c__content on-dark">
                <p className="eyebrow hero-c__in" style={{ ['--i' as string]: 0 }}>
                  {s.eyebrow}
                </p>
                <HeadingTag className="display hero-c__title hero-c__in" style={{ ['--i' as string]: 1 }}>
                  {s.line1} <em>{s.line2}</em>
                </HeadingTag>
                <p className="hero-c__copy hero-c__in" style={{ ['--i' as string]: 2 }}>
                  {s.copy}
                </p>
                <div className="hero-c__in" style={{ ['--i' as string]: 3 }}>
                  <Link to={s.cta.to} className="hero-c__cta" tabIndex={active ? 0 : -1}>
                    {s.cta.label} <Icon name="arrow" size={18} className="icon-arrow" />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="hero-c__controls container">
        <div className="hero-c__dots" role="group" aria-label="Choose slide">
          <button
            type="button"
            className="hero-c__pause"
            onClick={() => setUserPaused((p) => !p)}
            aria-label={userPaused || reduced ? 'Play slideshow' : 'Pause slideshow'}
            aria-pressed={userPaused}
          >
            <Icon name={userPaused || reduced ? 'play' : 'pause'} size={14} strokeWidth={2} />
          </button>
          {slides.map((s, i) => (
            <button
              key={s.key}
              type="button"
              className={`hero-c__dot${i === index ? ' is-active' : ''}`}
              onClick={() => go(i)}
              aria-label={`Show slide ${i + 1}: ${s.eyebrow}`}
              aria-current={i === index}
            >
              <span className="hero-c__dot-fill" key={`${i}-${index}`} style={{ animationDuration: `${INTERVAL}ms` }} />
            </button>
          ))}
        </div>
        <button type="button" className="hero-c__arrow" onClick={() => go(index - 1)} aria-label="Previous slide">
          <Icon name="arrow-left" size={18} />
        </button>
        <button type="button" className="hero-c__arrow" onClick={() => go(index + 1)} aria-label="Next slide">
          <Icon name="arrow" size={18} />
        </button>
      </div>
    </section>
  )
}
