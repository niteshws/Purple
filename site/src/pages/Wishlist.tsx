import '../styles/commerce.css'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Breadcrumbs, EmptyState } from '../components/ui'
import { ProductCard } from '../components/ProductCard'
import { getProduct, stockFor, isProductSoldOut, type Product } from '../data/products'
import { useCurrentUser, useWishlist, useUI } from '../store'
import { addToBag } from '../lib/commerce'
import { useMeta } from '../lib/hooks'

export default function Wishlist() {
  useMeta('Wishlist', 'Your saved Purple United pieces.', { canonical: '/wishlist' })
  const items = useWishlist((s) => s.items)
  const user = useCurrentUser()
  const list = items.map((i) => ({ ...i, p: getProduct(i.handle) })).filter((i): i is typeof i & { p: Product } => !!i.p)

  return (
    <div className="cm-page">
      <div className="container">
        <header className="cm-head">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, ...(user ? [{ label: 'Account', to: '/account' }] : []), { label: 'Wishlist' }]} />
          <div className="cm-head__row">
            <div className="cm-head__title">
              <p className="eyebrow">Saved for later</p>
              <h1 className="h1">
                Your <em>wishlist</em>
              </h1>
            </div>
            {list.length > 0 && (
              <p className="cm-count">
                {list.length} {list.length === 1 ? 'piece' : 'pieces'} saved
              </p>
            )}
          </div>
        </header>

        {!user && list.length > 0 && (
          <div className="cm-note cm-note--oat wl-signin">
            <Icon name="heart" size={20} />
            <span>
              Your wishlist is saved in this browser. <Link to="/account/login?next=/wishlist">Sign in</Link> or <Link to="/account/register">create an account</Link> to keep it with you
              across devices <span className="muted">(demo — stored locally)</span>.
            </span>
          </div>
        )}

        {list.length === 0 ? (
          <EmptyState
            icon="heart"
            title="Nothing saved yet"
            body="Tap the heart on any piece to keep it here — perfect for birthday lists and gift ideas."
            action={
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link to="/collections/new-arrivals" className="btn">
                  Shop new arrivals
                </Link>
                <Link to="/collections/best-sellers" className="btn btn--outline">
                  Customer favourites
                </Link>
              </div>
            }
          />
        ) : (
          <div className="pgrid wl-grid">
            {list.map((i) => (
              <WishItem key={i.handle} product={i.p} color={i.color} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function WishItem({ product: p, color }: { product: Product; color?: string }) {
  const remove = useWishlist((s) => s.remove)
  const toast = useUI((s) => s.toast)
  const c = (color && p.colors.find((x) => x.name === color && !x.soldOut)?.name) || p.colors.find((x) => !x.soldOut)?.name || p.colors[0].name
  const [size, setSize] = useState(p.sizeSystem === 'one-size' ? 'One size' : '')
  const [err, setErr] = useState(false)
  const soldOut = isProductSoldOut(p)
  const move = () => {
    if (!size) {
      setErr(true)
      document.getElementById(`wl-size-${p.handle}`)?.focus()
      return
    }
    if (addToBag(p.handle, c, size, 1)) remove(p.handle)
  }
  return (
    <div className="wl-item">
      <ProductCard product={p} initialColor={c} />
      {soldOut ? (
        <p className="body-sm muted">Sold out — we’ll keep it here in case it returns.</p>
      ) : (
        <div className="wl-move">
          {p.sizeSystem !== 'one-size' && (
            <>
              <label htmlFor={`wl-size-${p.handle}`} className="sr-only">
                Size for {p.name}
              </label>
              <select
                id={`wl-size-${p.handle}`}
                className="select select--sm"
                value={size}
                aria-invalid={err}
                onChange={(e) => {
                  setSize(e.target.value)
                  setErr(false)
                }}
              >
                <option value="">Select size</option>
                {p.sizes.map((s) => {
                  const n = stockFor(p, c, s)
                  return (
                    <option key={s} value={s} disabled={n === 0}>
                      {s}
                      {n === 0 ? ' — sold out' : ''}
                    </option>
                  )
                })}
              </select>
            </>
          )}
          <button type="button" className="btn btn--sm" onClick={move} style={p.sizeSystem === 'one-size' ? { gridColumn: '1 / -1' } : undefined}>
            Move to bag
          </button>
        </div>
      )}
      {err && <span className="field__error">Choose a size first</span>}
      <button
        type="button"
        className="wl-remove"
        onClick={() => {
          remove(p.handle)
          toast({ kind: 'info', title: 'Removed from your wishlist', body: p.name })
        }}
      >
        Remove
      </button>
    </div>
  )
}
