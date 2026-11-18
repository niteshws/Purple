import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import { Price } from './ui'
import { type Product, stockFor, isProductSoldOut, AGE_LABELS, productThumbnail } from '../data/products'
import { useWishlist } from '../store'
import { addToBag, toggleWish } from '../lib/commerce'

export function ProductCard({ product: p, priority, initialColor, initialImageIndex, compact }: { product: Product; priority?: boolean; initialColor?: string; initialImageIndex?: number; compact?: boolean }) {
  const [colorName, setColorName] = useState(initialColor && p.colors.some((c) => c.name === initialColor) ? initialColor : p.colors.find((c) => !c.soldOut)?.name ?? p.colors[0].name)
  const color = p.colors.find((c) => c.name === colorName)!
  const [imageIndex, setImageIndex] = useState<number | null>(initialImageIndex !== undefined && initialImageIndex >= 0 && initialImageIndex < color.images.length ? initialImageIndex : null)
  const [quick, setQuick] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const wished = useWishlist((s) => s.items.some((i) => i.handle === p.handle))
  const soldOut = isProductSoldOut(p)
  const panelRef = useRef<HTMLDivElement>(null)
  const quickRef = useRef<HTMLButtonElement>(null)
  // Closing the size panel removes the focused control, so return focus to "Quick add" (WCAG 2.4.3).
  const closeQuick = () => {
    const hadFocus = !!panelRef.current?.contains(document.activeElement)
    setQuick(false)
    if (hadFocus) setTimeout(() => quickRef.current?.focus(), 0)
  }
  const href = `/products/${p.handle}${colorName !== p.colors[0].name ? `?color=${encodeURIComponent(colorName)}` : ''}`
  const alt = color.images[1]
  const otherColor = !alt ? p.colors.find((c) => c.name !== colorName && !c.soldOut) : undefined
  const hoverImg = alt ?? otherColor?.images[0]
  const changeImage = (direction: number, button: HTMLButtonElement) => {
    // Continue from the visible hover preview until an image is explicitly selected.
    const preview = button.parentElement?.querySelector('.pcard__img--alt')
    const previewVisible = preview && Number(getComputedStyle(preview).opacity) > 0.5
    const current = imageIndex ?? (previewVisible ? 1 : 0)
    setImageIndex((current + direction + color.images.length) % color.images.length)
  }
  const lowStockSizes = p.sizes.filter((s) => {
    const n = stockFor(p, colorName, s)
    return n > 0 && n <= 2
  }).length

  useEffect(() => {
    if (!quick) return
    const onDoc = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.closest('.pcard')?.contains(e.target as Node)) setQuick(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeQuick()
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    setTimeout(() => panelRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus(), 30)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [quick])

  const quickAdd = () => {
    if (p.sizeSystem === 'one-size') {
      setBusy('One size')
      setTimeout(() => {
        addToBag(p.handle, colorName, 'One size', 1, { openDrawer: false })
        setBusy(null)
      }, 380)
      return
    }
    setQuick((q) => !q)
  }
  const pick = (size: string) => {
    setBusy(size)
    setTimeout(() => {
      const ok = addToBag(p.handle, colorName, size, 1, { openDrawer: false })
      setBusy(null)
      if (ok) closeQuick()
    }, 380)
  }

  return (
    <article className={`pcard${soldOut ? ' is-soldout' : ''}${compact ? ' pcard--compact' : ''}`}>
      <div className="pcard__media">
        <Link to={href} className="pcard__imglink" tabIndex={-1} aria-hidden="true">
          <img className="pcard__img" src={productThumbnail(color.images[imageIndex ?? 0])} alt="" loading={priority ? 'eager' : 'lazy'} decoding="async" width={840} height={840} />
          {imageIndex === null && hoverImg && <img className="pcard__img pcard__img--alt" src={productThumbnail(hoverImg)} alt="" loading="lazy" decoding="async" width={840} height={840} />}
        </Link>
        {color.images.length > 1 && (
          <>
            <button
              type="button"
              className="pcard__image-arrow pcard__image-arrow--prev"
              aria-label={`Previous image of ${p.name}`}
              onClick={(e) => changeImage(-1, e.currentTarget)}
            >
              <Icon name="chevron-left" size={28} strokeWidth={2.25} />
            </button>
            <button
              type="button"
              className="pcard__image-arrow pcard__image-arrow--next"
              aria-label={`Next image of ${p.name}`}
              onClick={(e) => changeImage(1, e.currentTarget)}
            >
              <Icon name="chevron-right" size={28} strokeWidth={2.25} />
            </button>
            <span className="sr-only" role="status">
              Image {(imageIndex ?? 0) + 1} of {color.images.length} for {p.name}, {colorName}
            </span>
          </>
        )}
        <div className="pcard__badges">
          {soldOut ? <span className="tag tag--muted">Sold out</span> : p.isNew ? <span className="tag">New</span> : null}
          {!soldOut && color.soldOut && <span className="tag tag--muted">Colour sold out</span>}
        </div>
        <button
          type="button"
          className={`pcard__wish${wished ? ' is-on' : ''}`}
          aria-pressed={wished}
          aria-label={wished ? `Remove ${p.name} from wishlist` : `Save ${p.name} to wishlist`}
          onClick={() => toggleWish(p.handle, colorName)}
        >
          <Icon name={wished ? 'heart-fill' : 'heart'} size={20} />
        </button>
        {!soldOut && !color.soldOut && (
          <button
            ref={quickRef}
            type="button"
            className={`pcard__quick${quick ? ' is-open' : ''}${busy === 'One size' ? ' is-busy' : ''}`}
            onClick={quickAdd}
            aria-expanded={p.sizeSystem === 'one-size' ? undefined : quick}
            aria-label={quick ? `Close sizes for ${p.name}` : `Quick add ${p.name}`}
          >
            <Icon name={quick ? 'close' : 'plus'} size={18} />
            <span>{quick ? 'Close' : 'Quick add'}</span>
          </button>
        )}
        {quick && (
          <div className="pcard__sizes" ref={panelRef} role="group" aria-label={`Choose a size for ${p.name}`}>
            <p className="pcard__sizes-h">Select size · {colorName}</p>
            <div className="pcard__sizes-grid">
              {p.sizes.map((s) => {
                const n = stockFor(p, colorName, s)
                return (
                  <button key={s} type="button" disabled={n === 0 || !!busy} className={`size-pill${busy === s ? ' is-busy' : ''}${n > 0 && n <= 2 ? ' is-low' : ''}`} onClick={() => pick(s)} aria-label={`${s}${n === 0 ? ', sold out' : n <= 2 ? ', only a few left' : ''}`}>
                    {s}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
      <div className="pcard__info">
        <h3 className="pcard__title">
          <Link to={href}>{p.name}</Link>
        </h3>
        <Price price={p.price} compareAt={p.compareAt} className="pcard__price" />
        {!compact && (
          <div className="pcard__meta">
            {p.colors.length > 1 ? (
              <div className="swatches" role="radiogroup" aria-label={`Colour for ${p.name}`}>
                {p.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    role="radio"
                    aria-checked={c.name === colorName}
                    aria-label={`${c.name}${c.soldOut ? ' (sold out)' : ''}`}
                    title={c.name}
                    className={`swatch${c.name === colorName ? ' is-active' : ''}${c.soldOut ? ' is-soldout' : ''}`}
                    style={{ ['--sw' as string]: c.hex }}
                    onClick={() => {
                      setColorName(c.name)
                      setImageIndex(null)
                    }}
                  />
                ))}
              </div>
            ) : (
              <span className="pcard__color">{color.name}</span>
            )}
            <span className="pcard__age">{p.sizeSystem === 'one-size' ? 'One size' : p.ageGroups.map((a) => AGE_LABELS[a].replace(' years', '')).join(', ') + ' yrs'}</span>
          </div>
        )}
        {!compact && !soldOut && lowStockSizes > 0 && <p className="pcard__low">Low stock in {lowStockSizes} size{lowStockSizes > 1 ? 's' : ''}</p>}
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="pcard pcard--skeleton" aria-hidden="true">
      <div className="pcard__media skeleton" />
      <div className="pcard__info">
        <div className="skeleton" style={{ height: 14, width: '80%' }} />
        <div className="skeleton" style={{ height: 14, width: '40%', marginTop: 10 }} />
      </div>
    </div>
  )
}
