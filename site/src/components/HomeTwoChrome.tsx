import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { AppearanceMenu, AppearanceSegmented } from './Appearance'
import { HomeDesignSwitch } from './HomeDesignSwitch'
import { Newsletter } from './Footer'
import { useDialog, useLockScroll } from '../lib/hooks'
import { useCart, useCurrentUser, useUI } from '../store'
import { CONTACT } from '../data/site'
import '../styles/home-two-chrome.css'

const DEPARTMENTS = [
  ['New now', '#h2-new-now'],
  ['Girls', '#h2-girls'],
  ['Boys', '#h2-boys'],
  ['Little ones', '#h2-little-ones'],
] as const

export function HomeTwoHeader() {
  const [open, setOpen] = useState(false)
  const header = useRef<HTMLElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const navigate = useNavigate()
  const { search } = useLocation()
  const navigationFrame = useRef(0)
  const setSearch = useUI((state) => state.setSearch)
  const setCart = useUI((state) => state.setCart)
  const count = useCart((state) => state.lines.reduce((total, line) => total + line.qty, 0))
  const user = useCurrentUser()
  useDialog(open, menu, () => setOpen(false))
  useLockScroll(open)

  useEffect(() => () => cancelAnimationFrame(navigationFrame.current), [])

  useEffect(() => {
    const element = header.current
    if (!element) return
    const measure = () => document.documentElement.style.setProperty('--sticky-top', element.offsetHeight + 'px')
    measure()
    if (!('ResizeObserver' in window)) return
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <header ref={header} className="h2-header">
      <div className="h2-header__bar">
        <nav className="h2-header__departments" aria-label="Option 2 departments">
          {DEPARTMENTS.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <button type="button" className="h2-header__menu-button" onClick={() => setOpen(true)} aria-label="Open campaign menu" aria-expanded={open} aria-controls={open ? menuId : undefined}>
          <Icon name="menu" size={21} />
        </button>
        <a href="#h2-new-now" className="h2-wordmark" aria-label="Purple United Kids — campaign home">
          <span>Purple United</span><small>Kids</small>
        </a>
        <div className="h2-header__utilities">
          <button type="button" onClick={() => setSearch(true)} className="h2-header__utility" aria-label="Search">
            <span>Search</span><Icon name="search" size={19} />
          </button>
          <Link to={user ? '/account' : '/account/login'} className="h2-header__account">{user ? 'Account' : 'Log in'}</Link>
          <button type="button" onClick={() => setCart(true)} className="h2-header__utility" aria-label={'Bag, ' + count + ' items'}>
            <span>Bag ({count})</span><Icon name="bag" size={20} />
          </button>
          <AppearanceMenu />
        </div>
      </div>
      {open && (
        <div className="h2-menu-shell">
          <div className="h2-menu-shell__scrim" onClick={() => setOpen(false)} aria-hidden="true" />
          <div id={menuId} ref={menu} className="h2-menu" role="dialog" aria-modal="true" aria-label="Campaign menu">
            <div className="h2-menu__head"><span>Explore</span><button type="button" aria-label="Close campaign menu" onClick={() => setOpen(false)}><Icon name="close" /></button></div>
            <nav aria-label="Mobile campaign departments">
              {DEPARTMENTS.map(([label, href]) => (
                <a key={href} href={href} onClick={(event) => {
                  event.preventDefault()
                  setOpen(false)
                  // Navigate after the menu releases its scroll lock.
                  cancelAnimationFrame(navigationFrame.current)
                  navigationFrame.current = requestAnimationFrame(() => navigate({ pathname: '/', search, hash: href }))
                }}>{label}<Icon name="arrow" size={20} /></a>
              ))}
            </nav>
            <Link to={user ? '/account' : '/account/login'} onClick={() => setOpen(false)} className="h2-menu__account">{user ? 'My account' : 'Log in'}</Link>
          </div>
        </div>
      )}
    </header>
  )
}

export function HomeTwoFooter() {
  return (
    <footer className="h2-footer">
      <nav className="h2-footer__departments" aria-label="Footer campaign departments">
        {DEPARTMENTS.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
        <a href="#h2-party">Party</a><a href="#h2-off-duty">Denim</a>
      </nav>
      <div className="h2-footer__newsletter"><p>The Purple letter</p><Newsletter tone="light" compact /></div>
      <div className="h2-footer__country"><span>India</span><span aria-hidden="true">/</span><a href={CONTACT.instagram} target="_blank" rel="noreferrer">Instagram <span className="sr-only">(opens in a new tab)</span></a></div>
      <div className="h2-footer__preferences"><AppearanceSegmented /><HomeDesignSwitch tone="light" /></div>
      <div className="h2-footer__links"><Link to="/help">Help</Link><Link to="/stores">Stores</Link><Link to="/about">Our story</Link><Link to="/help#privacy">Privacy</Link><Link to="/help#terms">Terms</Link><a href="#h2-new-now">Back to top <Icon name="arrow" size={14} /></a></div>
      <div className="h2-footer__bottom"><span>© 2026 Purple United Kids</span><span>Campaign concept</span></div>
    </footer>
  )
}
