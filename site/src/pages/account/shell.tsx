import type { ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Icon, type IconName } from '../../components/Icon'
import { Breadcrumbs } from '../../components/ui'
import { useAccount, useCurrentUser, useUI, type Order, type User } from '../../store'

/** Demo: derive a plausible status from the order's age. */
export function orderStatus(o: Order): Order['status'] {
  const days = (Date.now() - new Date(o.createdAt).getTime()) / 86400000
  if (days < 1) return 'Confirmed'
  if (days < 2) return 'Packed'
  if (days < 4) return 'Shipped'
  if (days < 5) return 'Out for delivery'
  return 'Delivered'
}

export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export function useMyOrders() {
  const user = useCurrentUser()
  const orders = useAccount((s) => s.orders)
  return user ? orders.filter((o) => o.email === user.email) : []
}

const NAV: { k: string; label: string; icon: IconName; to: string }[] = [
  { k: 'overview', label: 'Overview', icon: 'user', to: '/account' },
  { k: 'orders', label: 'Orders', icon: 'box', to: '/account/orders' },
  { k: 'profile', label: 'Profile & family', icon: 'edit', to: '/account?tab=profile' },
  { k: 'addresses', label: 'Addresses', icon: 'pin', to: '/account?tab=addresses' },
  { k: 'wishlist', label: 'Wishlist', icon: 'heart', to: '/wishlist' },
  { k: 'circle', label: 'Purple Circle', icon: 'crown', to: '/purple-circle' },
]

export function AccountShell({ active, title, crumbs, children }: { active: string; title: ReactNode; crumbs?: { label: string; to?: string }[]; children: (user: User) => ReactNode }) {
  const user = useCurrentUser()
  const logout = useAccount((s) => s.logout)
  const toast = useUI((s) => s.toast)
  const loc = useLocation()
  const navigate = useNavigate()
  if (!user) return <Navigate to={`/account/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />
  return (
    <div className="acct">
      <div className="container">
        <header className="acct-hero">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Account', to: '/account' }, ...(crumbs ?? [])]} />
          <div className="acct-hero__row" style={{ marginTop: 20 }}>
            <div className="cm-head__title">
              <p className="eyebrow">{user.tier} member</p>
              <h1 className="h1">{title}</h1>
            </div>
            <button
              type="button"
              className="link"
              onClick={() => {
                logout()
                toast({ kind: 'info', title: 'Signed out', body: 'See you soon.' })
                navigate('/')
              }}
            >
              <Icon name="logout" size={16} /> Sign out
            </button>
          </div>
        </header>
        <div className="acct-layout">
          <nav className="acct-nav" aria-label="Account">
            {NAV.map((n) => (
              <Link key={n.k} to={n.to} className={active === n.k ? 'is-active' : ''} aria-current={active === n.k ? 'page' : undefined}>
                <Icon name={n.icon} size={18} /> {n.label}
              </Link>
            ))}
          </nav>
          <div>{children(user)}</div>
        </div>
      </div>
    </div>
  )
}
