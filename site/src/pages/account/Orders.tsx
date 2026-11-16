import '../../styles/commerce.css'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/ui'
import { useMeta } from '../../lib/hooks'
import { AccountShell, useMyOrders } from './shell'
import { OrderRows } from './Dashboard'

export default function Orders() {
  useMeta('Orders', 'Track and manage your Purple United orders.', { canonical: '/account/orders' })
  const orders = useMyOrders()
  return (
    <AccountShell
      active="orders"
      title={
        <>
          Your <em>orders</em>
        </>
      }
      crumbs={[{ label: 'Orders' }]}
    >
      {() => (
        <div className="acct-panel">
          {orders.length === 0 ? (
            <div className="acct-card">
              <EmptyState
                icon="box"
                title="No orders yet"
                body="When you place an order while signed in, you’ll be able to follow it here — from packing to your doorstep."
                action={
                  <Link to="/collections/new-arrivals" className="btn">
                    Start shopping
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="acct-card">
              <div className="acct-card__head">
                <h2 className="h4">
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                </h2>
                <span className="muted body-sm">Statuses advance over time in this demo</span>
              </div>
              <OrderRows orders={orders} />
            </div>
          )}
          <p className="demo-note">Demo orders are stored only in this browser. Tracking normally arrives by SMS and email once shipped.</p>
        </div>
      )}
    </AccountShell>
  )
}
