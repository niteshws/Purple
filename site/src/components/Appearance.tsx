import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Icon, type IconName } from './Icon'
import { setThemePref, useTheme, type ThemePref } from '../lib/theme'

const OPTIONS: { v: ThemePref; label: string; icon: IconName; hint: string }[] = [
  { v: 'light', label: 'Light', icon: 'sun', hint: 'Ivory and plum' },
  { v: 'dark', label: 'Dark', icon: 'moon', hint: 'Easy on the eyes at night' },
  { v: 'auto', label: 'Auto', icon: 'auto', hint: 'Follows your device' },
]

/** Header control: icon button + menu of radio items. */
export function AppearanceMenu() {
  const { pref, resolved } = useTheme()
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const btn = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    const first = wrap.current?.querySelector<HTMLElement>('[aria-checked="true"]') ?? wrap.current?.querySelector<HTMLElement>('[role="menuitemradio"]')
    first?.focus()
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const onKey = (e: KeyboardEvent) => {
    const items = Array.from(wrap.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? [])
    const i = items.indexOf(document.activeElement as HTMLElement)
    if (e.key === 'Escape') {
      setOpen(false)
      btn.current?.focus()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      items[(i + 1) % items.length]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      items[(i - 1 + items.length) % items.length]?.focus()
    } else if (e.key === 'Tab') setOpen(false)
  }

  const current = OPTIONS.find((o) => o.v === pref)!
  return (
    <div className="appearance" ref={wrap} onKeyDown={onKey}>
      <button
        ref={btn}
        type="button"
        className="icon-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Appearance: ${current.label}${pref === 'auto' ? ` (${resolved})` : ''}`}
        title="Appearance"
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name={pref === 'auto' ? 'auto' : resolved === 'dark' ? 'moon' : 'sun'} />
      </button>
      {open && (
        <div className="appearance__menu" role="menu" id={menuId} aria-label="Appearance">
          <p className="appearance__title">Appearance</p>
          {OPTIONS.map((o) => (
            <button
              key={o.v}
              type="button"
              role="menuitemradio"
              aria-checked={pref === o.v}
              className="appearance__item"
              onClick={() => {
                setThemePref(o.v)
                setOpen(false)
                btn.current?.focus()
              }}
            >
              <Icon name={o.icon} size={18} />
              <span>
                <span className="appearance__label">{o.label}</span>
                <span className="appearance__hint">{o.hint}</span>
              </span>
              {pref === o.v && <Icon name="check" size={16} className="appearance__check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Inline segmented control (mobile menu, footer). */
export function AppearanceSegmented({ label = 'Appearance', tone = 'light' }: { label?: string; tone?: 'light' | 'dark' }) {
  const { pref } = useTheme()
  const id = useId()
  const onKey = (e: KeyboardEvent) => {
    const i = OPTIONS.findIndex((o) => o.v === pref)
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      setThemePref(OPTIONS[(i + 1) % 3].v)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      setThemePref(OPTIONS[(i + 2) % 3].v)
    }
  }
  useEffect(() => {
    // keep roving focus on the checked radio after arrow-key changes
    const el = document.getElementById(`${id}-${pref}`)
    if (el && el.parentElement?.contains(document.activeElement)) el.focus()
  }, [pref, id])
  return (
    <div className={`seg seg--${tone}`}>
      <span className="seg__label" id={`${id}-l`}>
        {label}
      </span>
      <div className="seg__track" role="radiogroup" aria-labelledby={`${id}-l`} onKeyDown={onKey}>
        {OPTIONS.map((o) => (
          <button
            key={o.v}
            id={`${id}-${o.v}`}
            type="button"
            role="radio"
            aria-checked={pref === o.v}
            tabIndex={pref === o.v ? 0 : -1}
            className={`seg__opt${pref === o.v ? ' is-active' : ''}`}
            onClick={() => setThemePref(o.v)}
          >
            <Icon name={o.icon} size={15} /> {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
