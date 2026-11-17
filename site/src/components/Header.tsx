import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Icon } from './Icon'
import { Crest } from './ui'
import { NAV, STORE_COUNT } from '../data/site'
import { useCart, useUI, useWishlist, useCurrentUser } from '../store'
import { useDialog, useLockScroll, useScrolled } from '../lib/hooks'
import { AppearanceMenu, AppearanceSegmented } from './Appearance'

export function AnnouncementBar() {
  return (
    <div className="announce">
      <div className="container announce__inner">
        <p>
          <span className="announce__lead">The Winter Edit has arrived.</span>{' '}
          <Link to="/collections/winter-edit" className="announce__link">
            Discover the collection
          </Link>
        </p>
        <div className="announce__aside">
          <Link to="/stores">
            <Icon name="store" size={15} /> Find one of our {STORE_COUNT} stores
          </Link>
          <Link to="/help">
            <Icon name="return" size={15} /> 7-day easy returns
          </Link>
        </div>
      </div>
    </div>
  )
}

function CountBadge({ n, bump }: { n: number; bump?: number }) {
  const [k, setK] = useState(0)
  useEffect(() => {
    if (bump) setK((x) => x + 1)
  }, [bump])
  if (!n) return null
  return (
    <span className="badge pop" key={k} aria-hidden="true">
      {n}
    </span>
  )
}

export function Header() {
  const scrolled = useScrolled(80)
  const { pathname } = useLocation()
  const [open, setOpen] = useState<number | null>(null)
  const openT = useRef<number>(0)
  const closeT = useRef<number>(0)
  const count = useCart((s) => s.lines.reduce((a, l) => a + l.qty, 0))
  const wishCount = useWishlist((s) => s.items.length)
  const lastAdded = useUI((s) => s.lastAdded)
  const setCart = useUI((s) => s.setCart)
  const setSearch = useUI((s) => s.setSearch)
  const setNav = useUI((s) => s.setNav)
  const user = useCurrentUser()
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => setOpen(null), [pathname])

  // Publish the sticky header's height so `scroll-padding-top` keeps focused items out from under it.
  const headerRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const set = () => document.documentElement.style.setProperty('--sticky-top', `${Math.round(el.getBoundingClientRect().height)}px`)
    set()
    if (!('ResizeObserver' in window)) return
    const ro = new ResizeObserver(set)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Only move focus back to the menu's trigger if focus is in the nav (not for a hover-opened menu).
        const inNav = navRef.current?.contains(document.activeElement)
        const btn = navRef.current?.querySelector<HTMLElement>(`[data-nav="${open}"] + .main-nav__toggle`)
        setOpen(null)
        if (inNav) btn?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const enter = (i: number) => {
    clearTimeout(closeT.current)
    clearTimeout(openT.current)
    openT.current = window.setTimeout(() => setOpen(i), open === null ? 110 : 0)
  }
  const leave = () => {
    clearTimeout(openT.current)
    closeT.current = window.setTimeout(() => setOpen(null), 180)
  }

  const item = open !== null ? NAV[open] : null

  const focusMega = () => setTimeout(() => document.querySelector<HTMLElement>('#mega a')?.focus(), 30)

  // The panel sits after all top-level items in the DOM, so wire Tab at its edges back into the nav order.
  const onMegaKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || open === null) return
    const links = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('a[href]'))
    if (!links.length) return
    if (!e.shiftKey && document.activeElement === links[links.length - 1]) {
      const next = navRef.current?.querySelector<HTMLElement>(`[data-nav="${open + 1}"]`)
      if (next) {
        e.preventDefault()
        setOpen(null)
        next.focus()
      }
    } else if (e.shiftKey && document.activeElement === links[0]) {
      e.preventDefault()
      navRef.current?.querySelector<HTMLElement>(`[data-nav="${open}"] + .main-nav__toggle`)?.focus()
    }
  }

  return (
    <header ref={headerRef} className={`site-header${scrolled ? ' is-scrolled' : ''}${open !== null ? ' is-menu-open' : ''}`}>
      <div className="site-header__bar container">
        <div className="site-header__left">
          <button type="button" className="icon-btn only-mobile" onClick={() => setNav(true)} aria-label="Open menu">
            <Icon name="menu" />
          </button>
          <button type="button" className="icon-btn only-mobile" onClick={() => setSearch(true)} aria-label="Search">
            <Icon name="search" />
          </button>
          <div className="site-header__utility only-desktop">
            <button type="button" className="header-search" onClick={() => setSearch(true)}>
              <Icon name="search" size={18} />
              <span>Search</span>
            </button>
            <Link to="/stores" className="header-util-link">
              Stores
            </Link>
            <Link to="/ask-purple" className="header-util-link">
              Ask Purple
            </Link>
          </div>
        </div>
        <Link to="/" className="site-header__logo" aria-label="Purple United Kids — home">
          <Crest variant="lockup" className="logo-lockup" />
          <Crest variant="mark" className="logo-mark" />
        </Link>
        <div className="site-header__right">
          <div className="only-desktop-flex">
            <AppearanceMenu />
          </div>
          <Link to={user ? '/account' : '/account/login'} className="icon-btn" aria-label={user ? `Account — ${user.name}` : 'Sign in'}>
            <Icon name="user" />
          </Link>
          <Link to="/wishlist" className="icon-btn hide-xs" aria-label={`Wishlist, ${wishCount} items`}>
            <Icon name="heart" />
            <CountBadge n={wishCount} />
          </Link>
          <button type="button" className="icon-btn" onClick={() => setCart(true)} aria-label={`Bag, ${count} items`}>
            <Icon name="bag" />
            <CountBadge n={count} bump={lastAdded} />
          </button>
        </div>
      </div>

      <nav
        className="main-nav only-desktop"
        aria-label="Main"
        ref={navRef}
        onMouseLeave={leave}
        onBlur={(e) => {
          // Close the panel once keyboard focus leaves the main nav entirely.
          if (open !== null && !navRef.current?.contains(e.relatedTarget as Node | null)) setOpen(null)
        }}
      >
        <ul role="list" className="main-nav__list container">
          {NAV.map((n, i) => (
            <li key={n.label} onMouseEnter={() => enter(i)}>
              <NavLink to={n.to} className={({ isActive }) => `main-nav__link${isActive ? ' is-current' : ''}${open === i ? ' is-open' : ''}`} onFocus={() => {}} data-nav={i}>
                {n.label}
              </NavLink>
              <button
                type="button"
                className="main-nav__toggle"
                aria-expanded={open === i}
                aria-controls="mega"
                aria-label={`${n.label} menu`}
                onClick={(e) => {
                  const next = open === i ? null : i
                  setOpen(next)
                  // Keyboard activation (Enter/Space report detail 0): move focus into the panel.
                  if (next !== null && e.detail === 0) focusMega()
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setOpen(i)
                    focusMega()
                  }
                }}
              >
                <Icon name="chevron-down" size={14} />
              </button>
            </li>
          ))}
        </ul>
        <div id="mega" className={`mega${item ? ' is-open' : ''}`} onMouseEnter={() => clearTimeout(closeT.current)} onKeyDown={onMegaKey} hidden={!item}>
          {item && (
            <div className="container mega__inner" key={item.label}>
              <div className="mega__cols">
                {item.columns.map((col) => (
                  <div key={col.title} className="mega__col">
                    <p className="eyebrow">{col.title}</p>
                    <ul role="list">
                      {col.links.map((l) => (
                        <li key={l.label}>
                          <Link to={l.to} onClick={() => setOpen(null)}>
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <Link to={item.feature.to} className="mega__feature" onClick={() => setOpen(null)}>
                <div className="media">
                  <img src={item.feature.image} alt="" loading="lazy" />
                </div>
                <div className="mega__feature-text">
                  <span className="eyebrow">{item.feature.eyebrow}</span>
                  <span className="h4">{item.feature.title}</span>
                  <span className="link">
                    Explore <Icon name="arrow" size={16} className="icon-arrow" />
                  </span>
                </div>
              </Link>
            </div>
          )}
        </div>
      </nav>
      <div className={`mega-scrim${item ? ' is-on' : ''}`} onClick={() => setOpen(null)} aria-hidden="true" />
    </header>
  )
}

export function MobileNav() {
  const open = useUI((s) => s.navOpen)
  const setNav = useUI((s) => s.setNav)
  const setSearch = useUI((s) => s.setSearch)
  const [expanded, setExpanded] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const user = useCurrentUser()
  useLockScroll(open)
  useDialog(open, ref, () => setNav(false))
  useEffect(() => setNav(false), [pathname])
  return (
    <div className={`drawer drawer--left${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <div className="drawer__scrim" onClick={() => setNav(false)} />
      <div className="drawer__panel mnav" ref={ref} role="dialog" aria-modal="true" aria-label="Menu">
        <div className="drawer__head">
          <Crest variant="mark" className="mnav__mark" />
          <button type="button" className="icon-btn" onClick={() => setNav(false)} aria-label="Close menu">
            <Icon name="close" />
          </button>
        </div>
        <button
          type="button"
          className="mnav__search"
          onClick={() => {
            setNav(false)
            setSearch(true)
          }}
        >
          <Icon name="search" size={18} /> Search for products, sizes, occasions
        </button>
        <ul role="list" className="mnav__list">
          {NAV.map((n, i) => (
            <li key={n.label} className={expanded === i ? 'is-open' : ''}>
              <button type="button" className="mnav__top" aria-expanded={expanded === i} onClick={() => setExpanded(expanded === i ? null : i)}>
                {n.label}
                <Icon name="chevron-down" size={18} />
              </button>
              <div className="mnav__sub" hidden={expanded !== i}>
                {n.columns.map((c) => (
                  <div key={c.title}>
                    <p className="eyebrow">{c.title}</p>
                    <ul role="list">
                      {c.links.map((l) => (
                        <li key={l.label}>
                          <Link to={l.to}>{l.label}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <div className="mnav__appearance">
          <AppearanceSegmented />
        </div>
        <div className="mnav__foot">
          <Link to={user ? '/account' : '/account/login'}>
            <Icon name="user" size={20} /> {user ? `Hi, ${user.name.split(' ')[0]}` : 'Sign in / Register'}
          </Link>
          <Link to="/wishlist">
            <Icon name="heart" size={20} /> Wishlist
          </Link>
          <Link to="/stores">
            <Icon name="store" size={20} /> Store locator
          </Link>
          <Link to="/ask-purple">
            <Icon name="sparkle" size={20} /> Ask Purple stylist
          </Link>
          <Link to="/contact">
            <Icon name="chat" size={20} /> Help & contact
          </Link>
        </div>
      </div>
    </div>
  )
}
