import { useEffect, useRef, useState, type RefObject } from 'react'

/* Automatic entrance motion for every page:
   - any <section> in <main> that has no hand-authored reveals rises in as it enters view (.sr)
   - items in product / category / occasion / journal grids stagger in (.sr-item inside .sr, else .reveal) */
const GRID_ITEMS = '.pgrid > *, .cats__grid > *, .occasions__grid > *, .jt__list > *, .craft__list > li, .rail--products > *, .shoes__rail > *, [data-stagger] > *'
function autoTag() {
  const main = document.getElementById('main')
  if (!main) return
  main.querySelectorAll<HTMLElement>('section:not([data-sr])').forEach((s) => {
    s.dataset.sr = '1'
    if (s.classList.contains('hero-c') || s.closest('[data-sr-on]') || s.querySelector('.reveal, .reveal-img')) return
    s.dataset.srOn = '1'
    s.classList.add('sr')
  })
  main.querySelectorAll<HTMLElement>(GRID_ITEMS).forEach((el) => {
    if (el.dataset.sri || el.classList.contains('reveal') || el.classList.contains('reveal-img')) return
    const i = Array.prototype.indexOf.call(el.parentElement?.children ?? [], el) as number
    el.dataset.sri = '1'
    if (el.closest('.sr')) {
      el.classList.add('sr-item')
      el.style.setProperty('--sr-i', String(Math.min(i, 7)))
    } else {
      el.classList.add('reveal')
      el.style.setProperty('--d', `${(i % 4) * 70}ms`)
    }
  })
}

/** Adds .is-in to elements with .reveal / .reveal-img / .sr when they enter the viewport. */
export function useRevealAll(dep?: unknown) {
  useEffect(() => {
    const pick = () => Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.is-in):not([data-obs]), .reveal-img:not(.is-in):not([data-obs]), .sr:not(.is-in):not([data-obs])'))
    if (!('IntersectionObserver' in window)) {
      pick().forEach((e) => e.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('is-in')
            io.unobserve(en.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    const scan = () => {
      autoTag()
      pick().forEach((e) => {
        e.dataset.obs = '1'
        io.observe(e)
      })
    }
    scan()
    // Tag synchronously (microtask, before paint) so new content never flashes visible first.
    const mo = new MutationObserver(scan)
    const t = 0
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      clearTimeout(t)
      mo.disconnect()
      io.disconnect()
      document.querySelectorAll<HTMLElement>('[data-obs]:not(.is-in)').forEach((e) => delete e.dataset.obs)
    }
  }, [dep])
}

/** Page-level metadata: title, description, canonical, optional JSON-LD. */
export function useMeta(title: string, description?: string, opts?: { canonical?: string; jsonLd?: object | object[] }) {
  useEffect(() => {
    document.title = title.includes('Purple United') ? title : `${title} — Purple United Kids`
    const set = (sel: string, attr: string, val: string, create: () => HTMLElement) => {
      let el = document.head.querySelector<HTMLElement>(sel)
      if (!el) {
        el = create()
        document.head.appendChild(el)
      }
      el.setAttribute(attr, val)
    }
    if (description)
      set('meta[name="description"]', 'content', description, () => {
        const m = document.createElement('meta')
        m.setAttribute('name', 'description')
        return m
      })
    const path = opts?.canonical ?? window.location.pathname
    set('link[rel="canonical"]', 'href', `https://purpleunited.com${path}`, () => {
      const l = document.createElement('link')
      l.setAttribute('rel', 'canonical')
      return l
    })
    document.head.querySelectorAll('script[data-pu-ld]').forEach((s) => s.remove())
    if (opts?.jsonLd) {
      const s = document.createElement('script')
      s.type = 'application/ld+json'
      s.dataset.puLd = '1'
      s.textContent = JSON.stringify(opts.jsonLd)
      document.head.appendChild(s)
    }
  }, [title, description, opts?.canonical, JSON.stringify(opts?.jsonLd ?? null)])
}

export function useLockScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const y = window.scrollY
    const sbw = window.innerWidth - document.documentElement.clientWidth
    document.body.classList.add('scroll-locked')
    document.body.style.paddingRight = `${sbw}px`
    return () => {
      document.body.classList.remove('scroll-locked')
      document.body.style.paddingRight = ''
      window.scrollTo({ top: y })
    }
  }, [locked])
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Traps focus inside a dialog, closes on Escape, restores focus on close. */
export function useDialog(open: boolean, ref: RefObject<HTMLElement | null>, onClose: () => void, initial?: RefObject<HTMLElement | null>) {
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const t = setTimeout(() => {
      const target = initial?.current ?? ref.current?.querySelector<HTMLElement>(FOCUSABLE)
      target?.focus()
    }, 40)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        closeRef.current()
      }
      if (e.key === 'Tab' && ref.current) {
        const f = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null)
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [open])
}

export function useMedia(q: string) {
  const [m, setM] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(q).matches : false))
  useEffect(() => {
    const mq = window.matchMedia(q)
    const on = () => setM(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [q])
  return m
}

export function useScrolled(threshold = 24) {
  const [s, setS] = useState(false)
  useEffect(() => {
    const on = () => setS(window.scrollY > threshold)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [threshold])
  return s
}

export function useDebounced<T>(v: T, ms = 160) {
  const [d, setD] = useState(v)
  useEffect(() => {
    const t = setTimeout(() => setD(v), ms)
    return () => clearTimeout(t)
  }, [v, ms])
  return d
}

export const validEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim())
export const validPhone = (s: string) => /^(\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/.test(s.trim())
export const validPincode = (s: string) => /^[1-9]\d{5}$/.test(s.trim())
