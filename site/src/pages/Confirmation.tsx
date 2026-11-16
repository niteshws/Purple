import '../styles/commerce.css'
import { Link, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Crest, EmptyState } from '../components/ui'
import { formatINR } from '../data/products'
import { useAccount, useCurrentUser, type Order } from '../store'
import { useMeta } from '../lib/hooks'

export const STATUS_STEPS: { k: Order['status']; d: string }[] = [
  { k: 'Confirmed', d: 'We’ve received your order.' },
  { k: 'Packed', d: 'Wrapped in tissue and packed with care.' },
  { k: 'Shipped', d: 'On its way — a tracking link follows by SMS and email.' },
  { k: 'Out for delivery', d: 'Arriving today.' },
  { k: 'Delivered', d: 'Handle with joy.' },
]

export function Timeline({ status }: { status: Order['status'] }) {
  const idx = STATUS_STEPS.findIndex((s) => s.k === status)
  return (
    <ol className="timeline" aria-label="Order status">
      {STATUS_STEPS.map((s, i) => (
        <li key={s.k} className={`${i <= idx ? 'is-done' : ''}${i === idx ? ' is-current' : ''}`} aria-current={i === idx ? 'step' : undefined}>
          <span className="timeline__dot">
            <Icon name="check" size={14} />
          </span>
          <span className="timeline__text">
            <strong>
              {s.k}
              <span className="sr-only">{i <= idx ? ' — complete' : ' — pending'}</span>
            </strong>
            <span>{s.d}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}

export function OrderLines({ order }: { order: Order }) {
  return (
    <>
      <ul role="list" className="olines">
        {order.lines.map((l, i) => (
          <li key={i} className="oline">
            <img src={l.image} alt="" loading="lazy" />
            <span>
              <span className="oline__name">{l.handle === 'purple-gift-card' ? l.name : <Link to={`/products/${l.handle}`}>{l.name}</Link>}</span>
              <br />
              <span className="oline__var">
                {l.gift ? `${l.size} · for ${l.gift.recipientName}` : `${l.color} · ${l.size}`} · Qty {l.qty}
              </span>
            </span>
            <span>{formatINR(l.price * l.qty)}</span>
          </li>
        ))}
      </ul>
      <dl className="totals">
        <div>
          <dt>Subtotal</dt>
          <dd>{formatINR(order.subtotal)}</dd>
        </div>
        {order.discount > 0 && (
          <div className="totals__disc">
            <dt>Discount</dt>
            <dd>−{formatINR(order.discount)}</dd>
          </div>
        )}
        <div>
          <dt>Delivery</dt>
          <dd>{order.shipping === 0 ? 'Free' : formatINR(order.shipping)}</dd>
        </div>
        <div className="totals__grand">
          <dt>Total</dt>
          <dd>{formatINR(order.total)}</dd>
        </div>
      </dl>
    </>
  )
}

export default function Confirmation() {
  const { id } = useParams()
  const order = useAccount((s) => s.orders.find((o) => o.id === id))
  const user = useCurrentUser()
  useMeta('Order confirmed', 'Thank you for your Purple United order.', { canonical: '/checkout/confirmation' })

  if (!order)
    return (
      <div className="container cm-page">
        <EmptyState
          icon="box"
          title="We couldn’t find that order"
          body="Demo orders are stored only in the browser where they were placed."
          action={
            <Link to="/" className="btn">
              Back to home
            </Link>
          }
        />
      </div>
    )

  const firstName = order.address.name?.split(' ')[0]
  const isMine = user && user.email === order.email
  return (
    <div className="conf">
      <div className="container">
        <div className="conf__hero">
          <Crest variant="mark" className="conf__crest" />
          <p className="eyebrow">Order confirmed</p>
          <h1 className="h1">
            Thank you{firstName ? `, ${firstName}` : ''}. <em>It’s on its way to being special.</em>
          </h1>
          <p className="lead" style={{ marginInline: 'auto' }}>
            We’ll pack your order with care. A confirmation would normally arrive at <strong>{order.email}</strong>.
          </p>
          <span className="conf__id">
            <Icon name="box" size={16} /> Order {order.id}
          </span>
          <p className="demo-note">Demo: no payment was taken and no email was sent.</p>
        </div>

        <div className="conf__grid">
          <div className="conf__card">
            <h2 className="h4">Order summary</h2>
            <OrderLines order={order} />
          </div>
          <div style={{ display: 'grid', gap: 20 }}>
            <div className="conf__card">
              <h2 className="h4">What happens next</h2>
              <Timeline status={order.status} />
            </div>
            <div className="conf__card">
              <h2 className="h4">Delivery details</h2>
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
                  'Gift cards are delivered by email.'
                )}
              </p>
              <p className="body-sm muted">
                {order.shippingMethod} · {order.payment}
              </p>
              <div className="conf__ctas">
                {isMine ? (
                  <Link to={`/account/orders/${order.id}`} className="btn">
                    Track this order
                  </Link>
                ) : null}
                <Link to="/collections/new-arrivals" className={`btn${isMine ? ' btn--outline' : ''}`}>
                  Continue shopping
                </Link>
              </div>
            </div>
            {!user && (
              <div className="conf__card conf__guest on-dark">
                <p className="eyebrow">Purple Circle · proposed</p>
                <h2 className="h4">Create an account to track orders and earn points.</h2>
                <p className="body-sm" style={{ opacity: 0.8 }}>
                  Join free and get early access to new collections and a birthday surprise.
                </p>
                <div>
                  <Link to="/account/register" className="btn btn--ivory">
                    Create account
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
