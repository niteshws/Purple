import '../../styles/commerce.css'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { EmptyState } from '../../components/ui'
import { getProduct } from '../../data/products'
import { CONTACT } from '../../data/site'
import { useUI } from '../../store'
import { addToBag } from '../../lib/commerce'
import { useMeta } from '../../lib/hooks'
import { AccountShell, fmtDate, orderStatus, useMyOrders } from './shell'
import { OrderLines, Timeline } from '../Confirmation'

export default function OrderDetail() {
  const { id } = useParams()
  const orders = useMyOrders()
  const order = orders.find((o) => o.id === id)
  const setCart = useUI((s) => s.setCart)
  const toast = useUI((s) => s.toast)
  const [busy, setBusy] = useState(false)
  useMeta(order ? `Order ${order.id}` : 'Order', 'Order details and tracking.', { canonical: '/account/orders' })

  const reorder = () => {
    if (!order) return
    setBusy(true)
    setTimeout(() => {
      let ok = 0
      let skipped = 0
      order.lines.forEach((l) => {
        const p = getProduct(l.handle)
        if (!p) return skipped++
        if (addToBag(l.handle, l.color, l.size, l.qty, { openDrawer: false, silent: true })) ok++
        else skipped++
      })
      setBusy(false)
      if (ok) setCart(true)
      if (skipped) toast({ kind: 'info', title: `${skipped} item${skipped > 1 ? 's' : ''} couldn’t be added`, body: 'Gift cards or sold-out sizes are skipped.' })
    }, 450)
  }

  return (
    <AccountShell active="orders" title={order ? <>Order <em>{order.id}</em></> : 'Order'} crumbs={[{ label: 'Orders', to: '/account/orders' }, { label: id ?? '' }]}>
      {() =>
        !order ? (
          <div className="acct-card">
            <EmptyState
              icon="box"
              title="We couldn’t find that order"
              body="It may have been placed as a guest or in another browser."
              action={
                <Link to="/account/orders" className="btn">
                  All orders
                </Link>
              }
            />
          </div>
        ) : (
          <div className="acct-panel">
            <p className="muted">
              Placed on {fmtDate(order.createdAt)} · {order.payment}
            </p>
            <div className="od-grid">
              <div className="acct-card">
                <div className="acct-card__head">
                  <h2 className="h4">Items</h2>
                  <button type="button" className={`btn btn--sm btn--outline${busy ? ' is-loading' : ''}`} onClick={reorder}>
                    <Icon name="bag" size={16} /> Buy again
                  </button>
                </div>
                <OrderLines order={order} />
              </div>
              <div style={{ display: 'grid', gap: 20 }}>
                <div className="acct-card">
                  <h2 className="h4">Tracking</h2>
                  <Timeline status={orderStatus(order)} />
                </div>
                <div className="acct-card">
                  <h2 className="h4">Delivery</h2>
                  <p className="body-sm">
                    {order.address.name ? (
                      <>
                        {order.address.name}
                        <br />
                        {order.address.line1}
                        {order.address.line2 ? `, ${order.address.line2}` : ''}
                        <br />
                        {order.address.city}, {order.address.state} {order.address.pincode}
                      </>
                    ) : (
                      'Gift cards delivered by email.'
                    )}
                  </p>
                  <p className="body-sm muted">{order.shippingMethod}</p>
                </div>
                <div className="acct-card od-help">
                  <h2 className="h4">Need help?</h2>
                  <p className="muted">Returns and exchanges are accepted within 7 days of delivery on unused items with tags.</p>
                  <Link to="/contact">
                    <Icon name="chat" size={18} /> Contact customer care
                  </Link>
                  <Link to="/help#returns">
                    <Icon name="return" size={18} /> Start a return or exchange
                  </Link>
                  <a href={`${CONTACT.whatsappHref}?text=${encodeURIComponent(`Hi Purple United, I need help with order ${order.id}.`)}`} target="_blank" rel="noreferrer">
                    <Icon name="whatsapp" size={18} /> Ask on WhatsApp
                  </a>
                  <p className="demo-note">WhatsApp concierge is a concept — the link opens WhatsApp with a draft you can edit; nothing is sent automatically.</p>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </AccountShell>
  )
}
