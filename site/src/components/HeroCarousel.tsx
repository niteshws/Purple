import { useCallback, useEffect, useEffectEvent, useRef, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icon'

/* Video-only homepage campaign hero — each slide advances after playback ends.
   - Crossfade between videos, staggered text entrance per slide.
   - Always auto-advances (hover and focus do not pause it); only the visible pause
     control stops it (WCAG 2.2.2). A background tab holds the slide until it is visible.
   - No image posters or image fallbacks, including during loading and playback errors. */

export interface HeroSlide {
  key: string
  eyebrow: string
  line1: string
  line2: string
  copy: string
  cta: { label: string; to: string }
  video: string
  videoPos?: string
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    key: 'little-originals',
    eyebrow: 'The Little Originals',
    line1: 'Born to be',
    line2: 'their own.',
    copy: 'Considered clothes for curious minds, big imaginations and the joy of growing up.',
    cta: { label: 'Shop the collection', to: '/collections/new-arrivals' },
    video: '/video/hero/little-originals.mp4',
  },
  {
    key: 'boys-edit',
    eyebrow: 'Made for Play',
    line1: 'Little moments.',
    line2: 'Big smiles.',
    copy: 'Cosy knits and easy layers for every giggle, playful pause and day together.',
    cta: { label: 'Shop everyday favourites', to: '/collections/everyday-essentials' },
    video: '/video/hero/children-playing-photo-studio-1080p.mp4',
  },
  {
    key: 'infant-edit',
    eyebrow: 'The Joy of Gifting',
    line1: 'Little gifts.',
    line2: 'Lots of love.',
    copy: 'Thoughtful little treasures for birthdays, new arrivals and every just-because moment.',
    cta: { label: 'Explore gifting', to: '/gifting' },
    video: '/video/hero/luxury-gifting.mp4',
    videoPos: 'right center',
  },
]

const INTERVAL = 3000

function HeroVideo({ slide, active, paused, onEnded, onError, onProgress }: {
  slide: HeroSlide
  active: boolean
  paused: boolean
  onEnded: () => void
  onError: () => void
  onProgress: (progress: number) => void
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const playbackError = useEffectEvent(onError)

  useEffect(() => {
    if (active && ref.current) ref.current.currentTime = 0
  }, [active])

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const syncPlayback = () => {
      if (active && !paused && document.visibilityState === 'visible') {
        video.play().catch((error: DOMException) => {
          if (error.name !== 'AbortError') playbackError()
        })
      } else video.pause()
    }
    syncPlayback()
    document.addEventListener('visibilitychange', syncPlayback)
    return () => {
      video.pause()
      document.removeEventListener('visibilitychange', syncPlayback)
    }
  }, [active, paused])

  return (
    <video
      ref={ref}
      src={slide.video}
      style={{ objectPosition: slide.videoPos }}
      muted
      playsInline
      preload={active ? 'auto' : 'metadata'}
      aria-hidden="true"
      onEnded={() => active && !paused && onEnded()}
      onError={onError}
      onTimeUpdate={(e) => {
        const video = e.currentTarget
        if (active && Number.isFinite(video.duration) && video.duration > 0) onProgress(video.currentTime / video.duration)
      }}
    />
  )
}

export function HeroCarousel({ slides = HERO_SLIDES }: { slides?: HeroSlide[] }) {
  const [index, setIndex] = useState(0)
  const [userPaused, setUserPaused] = useState(false)
  const [failedVideos, setFailedVideos] = useState<Set<string>>(() => new Set())
  const [videoProgress, setVideoProgress] = useState(0)
  const touch = useRef<{ x: number; y: number } | null>(null)
  const n = slides.length

  const go = useCallback(
    (i: number) => {
      const next = (i + n) % n
      setVideoProgress(0)
      setIndex(next)
    },
    [n],
  )

  const paused = userPaused

  // Skip failed videos after a short delay without displaying an image fallback.
  const currentVideo = !failedVideos.has(slides[index]?.key)
  useEffect(() => {
    if (paused || currentVideo || n < 2) return
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      clearTimeout(timer)
      if (document.visibilityState === 'visible') timer = setTimeout(() => go(index + 1), INTERVAL)
    }
    schedule()
    document.addEventListener('visibilitychange', schedule)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', schedule)
    }
  }, [index, paused, go, currentVideo, n])

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
      className={`hero-c${paused ? ' is-paused' : ''}`}
      aria-roledescription="carousel"
      aria-label="New season campaigns"
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
          const HeadingTag = 'h2' // the page h1 is permanent and lives outside the rotating slides (Home)
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
              <div className="hero-c__media">
                <HeroVideo
                  slide={s}
                  active={active}
                  paused={paused}
                  onEnded={() => go(i + 1)}
                  onError={() => setFailedVideos((failed) => new Set(failed).add(s.key))}
                  onProgress={setVideoProgress}
                />
              </div>
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
            aria-label="Pause slideshow" // fixed label; aria-pressed carries the state
            aria-pressed={userPaused}
          >
            <Icon name={userPaused ? 'play' : 'pause'} size={14} strokeWidth={2} />
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
              <span
                className="hero-c__dot-fill"
                key={`${i}-${index}`}
                style={i === index && currentVideo
                  ? { animation: 'none', transform: `scaleX(${videoProgress})` }
                  : { animationDuration: `${INTERVAL}ms` }}
              />
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
