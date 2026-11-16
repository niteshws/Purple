import { useEffect, useSyncExternalStore } from 'react'

/* Appearance: 'light' | 'dark' | 'auto' (follows the device). The preference is kept
   in localStorage; <html data-theme> always holds the RESOLVED theme ('light' | 'dark').
   index.html applies it before first paint to avoid a flash. */
export type ThemePref = 'light' | 'dark' | 'auto'
const KEY = 'pu-theme'
const DEFAULT: ThemePref = 'light'

const listeners = new Set<() => void>()
const mq = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null

function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' || v === 'auto' ? v : DEFAULT
  } catch {
    return (document.documentElement.dataset.themePref as ThemePref) || DEFAULT
  }
}

export const resolve = (p: ThemePref): 'light' | 'dark' => (p === 'auto' ? (mq?.matches ? 'dark' : 'light') : p)

function apply(p: ThemePref, animate: boolean) {
  const root = document.documentElement
  const next = resolve(p)
  if (animate && root.dataset.theme !== next) {
    root.classList.add('theme-switching')
    window.setTimeout(() => root.classList.remove('theme-switching'), 480)
  }
  root.dataset.theme = next
  root.dataset.themePref = p
  const meta = document.querySelector('meta[name="theme-color"]')
  meta?.setAttribute('content', next === 'dark' ? '#1B1318' : '#F8F3EB')
}

export function setThemePref(p: ThemePref) {
  try {
    localStorage.setItem(KEY, p)
  } catch {
    /* storage unavailable — still apply for this visit */
  }
  document.documentElement.dataset.themePref = p
  apply(p, true)
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** Current preference + resolved theme; re-renders on change. */
export function useTheme() {
  const pref = useSyncExternalStore(subscribe, readPref, () => DEFAULT)
  const resolved = useSyncExternalStore(
    subscribe,
    () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'),
    () => 'light' as const,
  )
  return { pref, resolved }
}

/** Mount once: keeps Auto in sync with the device setting. */
export function useThemeSync() {
  useEffect(() => {
    apply(readPref(), false)
    if (!mq) return
    const on = () => {
      if (readPref() === 'auto') {
        apply('auto', true)
        listeners.forEach((l) => l())
      }
    }
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
}
