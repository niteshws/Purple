import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

/* Flagship walkthrough — muted, looping ambient video for the "Visit us" band.
   - Source is only attached when the band nears the viewport (no cost on first load).
   - Plays only while visible; pauses off-screen.
   - Respects prefers-reduced-motion (stays on the poster until the visitor presses play).
   - Visible pause / sound controls (WCAG 2.2.2). */
const SRC_DESKTOP = '/video/flagship-walkthrough-720.mp4'
const SRC_MOBILE = '/video/flagship-walkthrough-480.mp4'
const POSTER = '/video/flagship-poster.webp'
const pickSrc = () => (window.matchMedia('(max-width: 767px)').matches ? SRC_MOBILE : SRC_DESKTOP)

export function StoreVideo() {
  const wrap = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [src, setSrc] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [userPaused, setUserPaused] = useState(() => {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {
      return false
    }
  })
  const [muted, setMuted] = useState(true)
  const [failed, setFailed] = useState(false)

  // Attach the source when the band is ~one screen away; track visibility for play/pause.
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setSrc(pickSrc())
      setVisible(true)
      return
    }
    const near = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSrc(pickSrc())
          near.disconnect()
        }
      },
      { rootMargin: '100% 0px' },
    )
    const seen = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 })
    near.observe(el)
    seen.observe(el)
    return () => {
      near.disconnect()
      seen.disconnect()
    }
  }, [])

  useEffect(() => {
    const v = video.current
    if (!v || !src) return
    if (visible && !userPaused) {
      v.play().catch(() => setPlaying(false))
    } else {
      v.pause()
    }
  }, [visible, userPaused, src])

  useEffect(() => {
    if (video.current) video.current.muted = muted
  }, [muted])

  const togglePlay = () => {
    const v = video.current
    if (!v) return
    if (v.paused) {
      setUserPaused(false)
      v.play().catch(() => setPlaying(false))
    } else {
      setUserPaused(true)
      v.pause()
    }
  }

  return (
    <div ref={wrap} className={`store-video${playing ? ' is-playing' : ''}`}>
      {!failed ? (
        <video
          ref={video}
          className="store-video__el"
          src={src ?? undefined}
          poster={POSTER}
          muted={muted}
          loop
          playsInline
          preload="none"
          aria-label="Walkthrough of the proposed Purple United flagship store: arched windows, the girls’ and boys’ floors, footwear wall, fitting rooms and the cash desk"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setFailed(true)}
        />
      ) : (
        <img className="store-video__el" src={POSTER} alt="The proposed Purple United flagship store façade" />
      )}
      {!failed && (
        <div className="store-video__controls">
          <button type="button" className="store-video__btn" onClick={togglePlay} aria-label={playing ? 'Pause store walkthrough' : 'Play store walkthrough'}>
            <Icon name={playing ? 'pause' : 'play'} size={18} />
          </button>
          <button
            type="button"
            className="store-video__btn"
            onClick={() => {
              setMuted((m) => !m)
              if (video.current?.paused) togglePlay()
            }}
            aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
            aria-pressed={!muted}
          >
            <Icon name={muted ? 'mute' : 'volume'} size={18} />
          </button>
        </div>
      )}
      <span className="store-video__label">
        <Icon name="store" size={15} /> Flagship walkthrough · concept
      </span>
    </div>
  )
}
