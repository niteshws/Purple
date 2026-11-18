import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom'
import { AnnouncementBar, Header, MobileNav } from './components/Header'
import { Footer, Concierge } from './components/Footer'
import { AskPurpleChat } from './components/AskPurpleChat'
import { CartDrawer, SearchOverlay, SizeGuideModal } from './components/Overlays'
import { Toasts } from './components/ui'
import { useRevealAll } from './lib/hooks'
import { useThemeSync } from './lib/theme'
import Home from './pages/Home'
import { setHomeDesign, useHomeDesign } from './lib/home-design'
import { HomeTwoHeader, HomeTwoFooter } from './components/HomeTwoChrome'

const HomeOptionTwo = lazy(() => import('./pages/HomeOptionTwo'))

function Homepage() {
  const saved = useHomeDesign()
  const { search } = useLocation()
  const requested = new URLSearchParams(search).get('home')
  const design = requested === '1' || requested === '2' ? requested : saved
  useEffect(() => {
    // Persist explicit links once; other open tabs may keep a different preview.
    if (requested === '1' || requested === '2') setHomeDesign(requested)
  }, [requested])
  return design === '2' ? <HomeOptionTwo /> : <Home />
}

const Collection = lazy(() => import('./pages/Collection'))
const Product = lazy(() => import('./pages/Product'))
const Search = lazy(() => import('./pages/Search'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Confirmation = lazy(() => import('./pages/Confirmation'))
const Login = lazy(() => import('./pages/account/Login'))
const Register = lazy(() => import('./pages/account/Register'))
const Reset = lazy(() => import('./pages/account/Reset'))
const Dashboard = lazy(() => import('./pages/account/Dashboard'))
const Orders = lazy(() => import('./pages/account/Orders'))
const OrderDetail = lazy(() => import('./pages/account/OrderDetail'))
const About = lazy(() => import('./pages/About'))
const Craft = lazy(() => import('./pages/Craft'))
const Gifting = lazy(() => import('./pages/Gifting'))
const PurpleCircle = lazy(() => import('./pages/PurpleCircle'))
const Stores = lazy(() => import('./pages/Stores'))
const StoreDetail = lazy(() => import('./pages/StoreDetail'))
const Contact = lazy(() => import('./pages/Contact'))
const Help = lazy(() => import('./pages/Help'))
const Journal = lazy(() => import('./pages/Journal'))
const Article = lazy(() => import('./pages/Article'))
const AskPurple = lazy(() => import('./pages/AskPurple'))
const NotFound = lazy(() => import('./pages/NotFound'))

/* Scroll handling: restore position on back/forward (collection → product → back keeps place),
   scroll to top on new navigations, honour #hash anchors. */
const positions = new Map<string, number>()
function ScrollManager() {
  const loc = useLocation()
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    const key = loc.key
    const saved = positions.get(key)
    const tryHash = () => {
      if (!loc.hash) return false
      const el = document.getElementById(decodeURIComponent(loc.hash.slice(1)))
      if (el) {
        el.scrollIntoView({ block: 'start' })
        return true
      }
      return false
    }
    let raf = 0
    let tries = 0
    const restore = () => {
      if (saved !== undefined) {
        window.scrollTo(0, saved)
        if (Math.abs(window.scrollY - saved) > 4 && tries++ < 30) raf = requestAnimationFrame(restore)
      } else if (!tryHash()) {
        window.scrollTo(0, 0)
      } else if (tries++ < 30) raf = requestAnimationFrame(() => tryHash())
    }
    restore()
    const onScroll = () => positions.set(key, window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [loc.key])
  return null
}

function RevealOnRoute() {
  const loc = useLocation()
  useRevealAll(loc.pathname + loc.search)
  useEffect(() => {
    // Late content (lazy routes / async sections): re-scan shortly after paint.
    const t = setTimeout(() => window.dispatchEvent(new Event('pu:reveal')), 120)
    return () => clearTimeout(t)
  }, [loc.pathname])
  return null
}

function PageFallback() {
  return (
    <div className="page-loading container" aria-busy="true" aria-label="Loading page">
      <div className="skeleton" style={{ height: 220 }} />
      <div className="page-loading__grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ aspectRatio: '4/5' }} />
        ))}
      </div>
    </div>
  )
}

function Layout() {
  useThemeSync()
  const { pathname, search } = useLocation()
  const savedHome = useHomeDesign()
  const requestedHome = new URLSearchParams(search).get('home')
  const selectedHome = requestedHome === '1' || requestedHome === '2' ? requestedHome : savedHome
  const optionTwo = pathname === '/' && selectedHome === '2'
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {optionTwo ? <HomeTwoHeader /> : <><AnnouncementBar /><Header /></>}
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<PageFallback />}>
          <div className="page-enter" key={pathname}>
            <Outlet />
          </div>
        </Suspense>
      </main>
      {optionTwo ? <HomeTwoFooter /> : <Footer />}
      <MobileNav />
      <SearchOverlay />
      <CartDrawer />
      <SizeGuideModal />
      <AskPurpleChat />
      <Concierge />
      <Toasts />
      <ScrollManager />
      <RevealOnRoute />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Homepage />} />
          <Route path="shop" element={<Navigate to="/collections/all" replace />} />
          <Route path="collections" element={<Navigate to="/collections/all" replace />} />
          <Route path="collections/:handle" element={<Collection />} />
          <Route path="products/:handle" element={<Product />} />
          <Route path="search" element={<Search />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="checkout/confirmation/:id" element={<Confirmation />} />
          <Route path="account/login" element={<Login />} />
          <Route path="account/register" element={<Register />} />
          <Route path="account/reset" element={<Reset />} />
          <Route path="account" element={<Dashboard />} />
          <Route path="account/orders" element={<Orders />} />
          <Route path="account/orders/:id" element={<OrderDetail />} />
          <Route path="about" element={<About />} />
          <Route path="craft" element={<Craft />} />
          <Route path="gifting" element={<Gifting />} />
          <Route path="purple-circle" element={<PurpleCircle />} />
          <Route path="stores" element={<Stores />} />
          <Route path="stores/:id" element={<StoreDetail />} />
          <Route path="contact" element={<Contact />} />
          <Route path="help" element={<Help />} />
          <Route path="journal" element={<Journal />} />
          <Route path="journal/:slug" element={<Article />} />
          <Route path="ask-purple" element={<AskPurple />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
