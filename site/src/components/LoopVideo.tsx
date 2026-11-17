import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

/* Muted, looping inline video for editorial cards.
   - Source attaches only when the card nears the viewport.
   - Pauses off-screen and supports opting out of autoplay.
   - prefers-reduced-motion: shows the poster until the visitor presses play.
   - Visible pause/play control (WCAG 2.2.2). */
export function LoopVideo({ src, poster, label, className, autoPlay = true }: { src: string; poster: string; label: string; className?: string; autoPlay?: boolean }) {
  const wrap = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [attached, setAttached] = useState(false)
  const [visible, setVisible] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [userPaused, setUserPaused] = useState(() => {
    if (!autoPlay) return true
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {
      return false
    }
  })

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setAttached(true)
      setVisible(true)
      return
    }
    const near = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setAttached(true)
          near.disconnect()
        }
      },
      { rootMargin: '60% 60%' },
    )
    const seen = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 })
    near.observe(el)
    seen.observe(el)
    return () => {
      near.disconnect()
      seen.disconnect()
    }
  }, [])

  useEffect(() => {
    const v = video.current
    if (!v || !attached) return
    if (visible && !userPaused) v.play().catch(() => setPlaying(false))
    else v.pause()
  }, [visible, userPaused, attached])

  return (
    <div ref={wrap} className={`loopv ${className ?? ''}`}>
      <video
        ref={video}
        className="loopv__el"
        src={attached ? src : undefined}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        className="loopv__btn"
        onClick={() => {
          const v = video.current
          if (!v) return
          if (v.paused) {
            setUserPaused(false)
            v.play().catch(() => setPlaying(false))
          } else {
            setUserPaused(true)
            v.pause()
          }
        }}
        aria-label={playing ? 'Pause video' : 'Play video'}
      >
        <Icon name={playing ? 'pause' : 'play'} size={16} strokeWidth={2} />
      </button>
    </div>
  )
}
