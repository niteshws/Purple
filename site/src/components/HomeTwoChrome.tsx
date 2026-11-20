import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { Crest } from './ui'
import { AppearanceMenu, AppearanceSegmented } from './Appearance'
import { HomeDesignSwitch } from './HomeDesignSwitch'
import { Newsletter } from './Footer'
import { useDialog, useLockScroll } from '../lib/hooks'
import { useCart, useCurrentUser, useUI } from '../store'
import { CONTACT, STORE_COUNT } from '../data/site'
import '../styles/home-two-chrome.css'

const DEPARTMENTS = [
  ['New now', '#h2-new-now'],
  ['Girls', '#h2-girls'],
  ['Boys', '#h2-boys'],
  ['Little ones', '#h2-little-ones'],
] as const

const FOOTER_COLUMNS = [
  { title: 'Shop', links: [['New arrivals', '/collections/new-arrivals'], ['Boys', '/collections/boys'], ['Girls', '/collections/girls'], ['Infants', '/collections/infants'], ['Footwear & accessories', '/collections/footwear-accessories'], ['The Winter Edit', '/collections/winter-edit'], ['Gift cards', '/gifting']] },
  { title: 'Help', links: [['Contact us', '/contact'], ['Shipping & delivery', '/help#shipping'], ['Returns & exchanges', '/help#returns'], ['FAQs', '/help#faq'], ['Track an order', '/account/orders'], ['Size guide', '/help#sizing']] },
  { title: 'Purple United', links: [['Our story', '/about'], ['Our craft', '/craft'], ['The Journal', '/journal'], ['Purple Circle', '/purple-circle'], ['Ask Purple stylist', '/ask-purple'], ['Store locator', '/stores']] },
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
          <Crest variant="lockup" className="h2-wordmark__lockup" />
          <Crest variant="mark" className="h2-wordmark__mark" />
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
      <div className="h2-footer__masthead">
        <div className="h2-footer__brand"><Crest variant="lockup" className="h2-footer__crest" /><p>Fashion for their next chapter.</p></div>
        <div className="h2-footer__newsletter"><p>The Purple letter</p><Newsletter tone="light" /></div>
      </div>
      <div className="h2-footer__content">
        {FOOTER_COLUMNS.map((column) => (
          <nav key={column.title} className="h2-footer__column" aria-label={column.title}>
            <p>{column.title}</p>
            <ul role="list">{column.links.map(([label, to]) => <li key={label}><Link to={to}>{label}</Link></li>)}</ul>
          </nav>
        ))}
        <section className="h2-footer__contact" aria-label="Talk to us">
          <p>Talk to us</p>
          <a href={CONTACT.phoneHref}><Icon name="phone" size={16} />{CONTACT.phone}</a>
          <a href={`mailto:${CONTACT.email}`}><Icon name="mail" size={16} />{CONTACT.email}</a>
          <Link to="/stores"><Icon name="store" size={16} />{STORE_COUNT} stores across India</Link>
          <div className="h2-footer__social">
            <a href={CONTACT.instagram} target="_blank" rel="noreferrer" aria-label="Purple United on Instagram (opens in a new tab)"><Icon name="instagram" size={17} /></a>
            <a href={CONTACT.facebook} target="_blank" rel="noreferrer" aria-label="Purple United on Facebook (opens in a new tab)"><Icon name="facebook" size={17} /></a>
            <a href={CONTACT.linkedin} target="_blank" rel="noreferrer" aria-label="Purple United on LinkedIn (opens in a new tab)"><Icon name="linkedin" size={17} /></a>
          </div>
        </section>
      </div>
      <div className="h2-footer__pay" aria-label="Shopping assurances">
        <span><Icon name="lock" size={16} />Secure checkout</span><span><Icon name="upi" size={16} />UPI</span><span><Icon name="card" size={16} />Cards & net banking</span><span><Icon name="return" size={16} />7-day returns & exchanges</span>
      </div>
      <div className="h2-footer__preferences"><AppearanceSegmented /><HomeDesignSwitch tone="light" /></div>
      <div className="h2-footer__legal">
        <p>© 2026 {CONTACT.company}. {CONTACT.address}.</p>
        <p>Redesign concept by PixelCrayons for Purple United · Demonstration prototype — no real orders or payments are processed.</p>
        <nav className="h2-footer__links" aria-label="Legal"><Link to="/help#returns">Returns policy</Link><Link to="/help#privacy">Privacy</Link><Link to="/help#terms">Terms</Link><a href="#h2-new-now">Back to top <Icon name="arrow" size={14} /></a></nav>
      </div>
    </footer>
  )
}
