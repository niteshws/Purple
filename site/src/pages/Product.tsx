import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Accordion, Breadcrumbs, Price, QtyStepper, Field } from '../components/ui'
import { ProductCard } from '../components/ProductCard'
import { getProduct, products, productThumbnail, stockFor, isProductSoldOut, formatINR, AGE_LABELS, type Product as P } from '../data/products'
import { POLICY } from '../data/site'
import { useRecent, useUI, useWishlist } from '../store'
import { addToBag, toggleWish } from '../lib/commerce'
import { useLockScroll, useMeta, useDialog } from '../lib/hooks'
import NotFound from './NotFound'

const HEIGHT: Record<string, string> = {
  '2-3Y': '92–98 cm', '3-4Y': '98–104 cm', '4-5Y': '104–110 cm', '5-6Y': '110–116 cm', '6-7Y': '116–122 cm', '7-8Y': '122–128 cm',
  '8-9Y': '128–134 cm', '9-10Y': '134–140 cm', '10-11Y': '140–146 cm', '11-12Y': '146–152 cm', '12-13Y': '152–158 cm', '13-14Y': '158–164 cm',
  '0-3M': '50–62 cm', '3-6M': '62–68 cm', '6-9M': '68–74 cm', '9-12M': '74–80 cm', '12-18M': '80–86 cm', '18-24M': '86–92 cm',
  'UK 5K': '12.5 cm foot', 'UK 6K': '13.3 cm foot', 'UK 7K': '14.2 cm foot', 'UK 8K': '15 cm foot', 'UK 9K': '15.9 cm foot', 'UK 10K': '16.7 cm foot',
  'UK 11K': '17.6 cm foot', 'UK 12K': '18.4 cm foot', 'UK 13K': '19.3 cm foot', 'UK 1': '20.1 cm foot', 'UK 2': '21 cm foot', 'UK 3': '21.8 cm foot',
  'UK 4': '22.6 cm foot', 'UK 5': '23.5 cm foot',
}

type Slide = { src: string; alt: string }

export default function Product() {
  const { handle = '' } = useParams()
  const p = getProduct(handle)
  if (!p) return <NotFound />
  return <ProductView key={p.handle} p={p} />
}

function ProductView({ p }: { p: P }) {
  const [sp, setSp] = useSearchParams()
  const navigate = useNavigate()
  const qColor = sp.get('color')
  const initial = p.colors.find((c) => c.name === qColor) ?? p.colors.find((c) => !c.soldOut) ?? p.colors[0]
  const [colorName, setColorName] = useState(initial.name)
  const color = p.colors.find((c) => c.name === colorName)!
  const [size, setSize] = useState<string>(p.sizeSystem === 'one-size' ? 'One size' : '')
  const [qty, setQty] = useState(1)
  const [sizeErr, setSizeErr] = useState(false)
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [slide, setSlide] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [sticky, setSticky] = useState(false)
  const wished = useWishlist((s) => s.items.some((i) => i.handle === p.handle))
  const pushRecent = useRecent((s) => s.push)
  const recent = useRecent((s) => s.handles)
  const openGuide = useUI((s) => s.openSizeGuide)
  const actionsRef = useRef<HTMLDivElement>(null)
  const sizesRef = useRef<HTMLDivElement>(null)
  const soldOut = isProductSoldOut(p) || !!color.soldOut
  const stock = size ? stockFor(p, colorName, size) : null

  const slides: Slide[] = color.images.map((src, i) => ({ src, alt: `${p.name} in ${color.name}${i ? ` — view ${i + 1}` : ''}` }))

  useEffect(() => {
    pushRecent(p.handle)
  }, [p.handle])
  useEffect(() => {
    if (size && p.sizeSystem !== 'one-size' && stockFor(p, colorName, size) === 0) setSize('')
    const next = new URLSearchParams(sp)
    if (colorName === p.colors[0].name) next.delete('color')
    else next.set('color', colorName)
    setSp(next, { replace: true, preventScrollReset: true })
  }, [colorName])
  useEffect(() => {
    const el = actionsRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setSticky(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const offerAvailability = soldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock'
  useMeta(`${p.name}${p.colors.length === 1 ? ` — ${p.colors[0].name}` : ''}`, `${p.description} ${formatINR(p.price)} at Purple United Kids.`, {
    canonical: `/products/${p.handle}`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      sku: p.id,
      image: p.colors.flatMap((c) => c.images.map((i) => `https://purpleunited.com${i}`)),
      description: p.description,
      brand: { '@type': 'Brand', name: 'Purple United Kids' },
      color: p.colors.map((c) => c.name).join(', '),
      offers: { '@type': 'Offer', priceCurrency: 'INR', price: p.price, availability: offerAvailability, url: `https://purpleunited.com/products/${p.handle}` },
    },
  })

  const add = (buyNow = false) => {
    if (!size) {
      setSizeErr(true)
      sizesRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()
      sizesRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      return
    }
    setState('loading')
    setTimeout(() => {
      const ok = addToBag(p.handle, colorName, size, qty, { openDrawer: !buyNow })
      if (!ok) return setState('idle')
      if (buyNow) return navigate('/checkout')
      setState('done')
      setTimeout(() => setState('idle'), 1800)
    }, 450)
  }

  const completeLook = useMemo(() => {
    const comp: Record<string, string[]> = {
      'Sweatshirts & Hoodies': ['Jeans', 'Trousers', 'Sneakers'],
      Sweaters: ['Jeans', 'Trousers', 'Casual Shoes'],
      Jackets: ['T-Shirts & Tops', 'Jeans', 'Sneakers'],
      Jeans: ['Sweatshirts & Hoodies', 'T-Shirts & Tops', 'Sneakers'],
      Trousers: ['T-Shirts & Tops', 'Sweaters', 'Sneakers'],
      'T-Shirts & Tops': ['Jeans', 'Trousers', 'Jackets'],
      Dresses: ['Ballerinas', 'Jackets', 'Sweaters'],
      'Shorts & Skirts': ['T-Shirts & Tops', 'Sneakers'],
      Sets: ['Booties', 'Jackets', 'Soft Toys'],
      Sneakers: ['Jeans', 'Sweatshirts & Hoodies', 'Trousers'],
      'Casual Shoes': ['Jeans', 'T-Shirts & Tops', 'Trousers'],
      Ballerinas: ['Dresses', 'T-Shirts & Tops'],
      Booties: ['Sets', 'Jackets', 'Soft Toys'],
      'Sandals & Clogs': ['Shorts & Skirts', 'T-Shirts & Tops'],
      'Soft Toys': ['Sets', 'Booties'],
    }
    const want = comp[p.type] ?? []
    const out: P[] = []
    for (const t of want) {
      const m = products
        .filter((x) => x.handle !== p.handle && x.type === t && !isProductSoldOut(x) && (x.gender === p.gender || x.gender === 'unisex' || p.gender === 'unisex') && x.ageGroups.some((a) => p.ageGroups.includes(a)))
        .sort((a, b) => b.popularity - a.popularity)[0]
      if (m && !out.includes(m)) out.push(m)
    }
    return out.slice(0, 3)
  }, [p])
  const similar = useMemo(
    () =>
      products
        .filter((x) => x.handle !== p.handle && !completeLook.includes(x) && (x.type === p.type || x.departments.some((d) => p.departments.includes(d))))
        .sort((a, b) => Number(b.type === p.type) - Number(a.type === p.type) || b.popularity - a.popularity)
        .slice(0, 8),
    [p, completeLook],
  )
  const recentProducts = recent.filter((h) => h !== p.handle).map((h) => getProduct(h)).filter(Boolean).slice(0, 6) as P[]
  const dept = p.departments[0]
  const deptLabel = { boys: 'Boys', girls: 'Girls', infants: 'Infants', footwear: 'Footwear & Accessories', accessories: 'Footwear & Accessories' }[dept]
  const deptTo = dept === 'footwear' || dept === 'accessories' ? '/collections/footwear-accessories' : `/collections/${dept}`

  return (
    <div className="pdp">
      <div className="container">
        <div className="pdp__crumbs">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: deptLabel, to: deptTo }, { label: p.type, to: `${deptTo}?type=${encodeURIComponent(p.type)}` }, { label: p.name }]} />
        </div>
        <div className="pdp__grid">
          <Gallery slides={slides} index={slide} onIndex={setSlide} onZoom={() => setZoom(true)} badge={soldOut ? 'Sold out' : p.isNew ? 'New' : undefined} />

          <div className="pdp__info">
            <div className="pdp__title-row">
              <p className="eyebrow">
                {p.type} · {p.ageGroups.map((a) => AGE_LABELS[a]).join(', ').replace(/ years(?=,)/g, '')}
              </p>
              <h1 className="pdp__title">{p.name}</h1>
              <div>
                <Price price={p.price} compareAt={p.compareAt} className="pdp__price" />
                <p className="pdp__tax">Inclusive of all taxes</p>
              </div>
            </div>

            <div>
              <div className="pdp__label">
                <strong>Colour</strong>
                <span>{color.name}{color.soldOut ? ' — sold out' : ''}</span>
              </div>
              <div className="pdp__colors" role="radiogroup" aria-label="Colour">
                {p.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    role="radio"
                    aria-checked={c.name === colorName}
                    aria-label={`${c.name}${c.soldOut ? ', sold out' : ''}`}
                    className={`color-opt${c.soldOut ? ' is-soldout' : ''}`}
                    onClick={() => {
                      if (c.name === colorName) return
                      setColorName(c.name)
                      setSlide(0)
                    }}
                  >
                    <img src={productThumbnail(c.images[0])} alt="" />
                  </button>
                ))}
              </div>
            </div>

            {p.sizeSystem !== 'one-size' && (
              <div>
                <div className="pdp__label">
                  <strong id="size-label">Size</strong>
                  <button type="button" className="pdp__guide-link" onClick={() => openGuide(p.sizeSystem)}>
                    <Icon name="ruler" size={16} /> Size guide
                  </button>
                </div>
                <div
                  ref={sizesRef}
                  className={`pdp__sizes${sizeErr ? ' has-error' : ''}`}
                  role="radiogroup"
                  aria-labelledby="size-label"
                  aria-describedby={sizeErr ? 'size-err' : undefined}
                >
                  {p.sizes.map((s) => {
                    const n = stockFor(p, colorName, s)
                    return (
                      <button
                        key={s}
                        type="button"
                        role="radio"
                        aria-checked={size === s}
                        disabled={n === 0}
                        className={`size-btn${n > 0 && n <= 2 ? ' is-low' : ''}`}
                        onClick={() => {
                          setSize(s)
                          setSizeErr(false)
                          setQty(1)
                        }}
                        aria-label={`${s}${HEIGHT[s] ? `, ${HEIGHT[s]}` : ''}${n === 0 ? ', sold out' : n <= 2 ? ', low stock' : ''}`}
                      >
                        {s}
                        {HEIGHT[s] && <small>{HEIGHT[s]}</small>}
                      </button>
                    )
                  })}
                </div>
                {sizeErr && (
                  <p className="field__error pdp__size-error" id="size-err" role="alert">
                    <Icon name="alert" size={15} /> Please choose a size to continue.
                  </p>
                )}
                <p className={`pdp__stock${soldOut ? ' is-out' : stock === null ? ' is-idle' : stock === 0 ? ' is-out' : stock <= 2 ? ' is-low' : ''}`} aria-live="polite">
                  {soldOut ? 'This colour is currently sold out' : stock === null ? 'Select a size to see availability' : stock === 0 ? 'Sold out in this size' : stock <= 2 ? `Only ${stock} left in ${size} — order soon` : `In stock in ${size} · ships in ${POLICY.shipsWithin}`}
                </p>
                <div className="pdp__fit">
                  <Icon name="sparkle" size={18} />
                  <span>
                    <strong>Between sizes?</strong> Choose the larger one — sleeves roll, and there’s always a growth spurt around the corner.
                  </span>
                </div>
              </div>
            )}

            <div className="pdp__actions" ref={actionsRef}>
              <QtyStepper value={qty} onChange={setQty} max={Math.max(1, Math.min(10, stock ?? 10))} />
              <button
                type="button"
                className={`btn${state === 'loading' ? ' is-loading' : ''}${state === 'done' ? ' is-success' : ''}`}
                onClick={() => add(false)}
                disabled={soldOut}
                aria-live="polite"
              >
                {soldOut ? 'Sold out' : state === 'done' ? (
                  <>
                    <Icon name="check" size={18} /> Added to bag
                  </>
                ) : (
                  <>
                    <Icon name="bag" size={18} /> Add to bag
                  </>
                )}
              </button>
              <button
                type="button"
                className={`icon-btn pdp__wish${wished ? ' is-on' : ''}`}
                aria-pressed={wished}
                aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
                onClick={() => toggleWish(p.handle, colorName)}
              >
                <Icon name={wished ? 'heart-fill' : 'heart'} />
              </button>
              {!soldOut && (
                <button type="button" className="btn btn--outline pdp__buy" onClick={() => add(true)}>
                  Buy now
                </button>
              )}
            </div>

            <ul role="list" className="pdp__assure">
              <li>
                <Icon name="delivery" size={20} /> Ships in {POLICY.shipsWithin}; delivered in {POLICY.deliveryTime}
              </li>
              <li>
                <Icon name="return" size={20} /> {POLICY.returnWindowDays}-day returns · free replacement for size mismatch (conditions apply)
              </li>
              <li>
                <Icon name="store" size={20} />
                <span>
                  See it in person — <Link to="/stores">find a Purple United store</Link>
                </span>
              </li>
              <li>
                <Icon name="leaf" size={20} /> Seed-paper hang tag — plant it and watch it bloom
              </li>
            </ul>

            <p className="pdp__desc">{p.description}</p>

            <Accordion
              defaultOpen={0}
              items={[
                {
                  title: 'Product details',
                  body: (
                    <ul>
                      {p.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                      <li>Style code {p.id}</li>
                    </ul>
                  ),
                },
                {
                  title: 'Fabric & care',
                  body: (
                    <>
                      <p>
                        <strong>Material:</strong> {p.material}
                      </p>
                      <ul style={{ marginTop: 10 }}>
                        {p.care.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    </>
                  ),
                },
                {
                  title: 'Delivery, returns & exchanges',
                  body: (
                    <>
                      <p>
                        Orders usually ship within {POLICY.shipsWithin} and arrive in {POLICY.deliveryTime}. A tracking link is sent by SMS or email.
                      </p>
                      <p style={{ marginTop: 10 }}>
                        Return or exchange unused items with tags intact within {POLICY.returnWindowDays} days. <Link to="/help#returns" className="text-link">Read the full policy</Link>.
                      </p>
                    </>
                  ),
                },
              ]}
            />
            <p className="demo-note pdp__note">Sizes and stock levels shown are demonstration data.</p>
          </div>
        </div>

        {completeLook.length > 0 && (
          <section className="pdp-section" aria-labelledby="ctl-h">
            <div className="section-head">
              <div className="section-head__text">
                <p className="eyebrow">Styled with</p>
                <h2 id="ctl-h" className="h3">
                  Complete <em>the look</em>
                </h2>
              </div>
            </div>
            <div className="pgrid">
              {[p, ...completeLook].slice(0, 4).map((x) => (
                <ProductCard key={x.handle} product={x} initialColor={x.handle === p.handle ? colorName : undefined} />
              ))}
            </div>
          </section>
        )}

        <div className="pdp-quality">
          <div>
            <Icon name="sparkle" />
            <h3 className="h4">Fabric you can feel</h3>
            <p>Chosen for softness and wear — {p.material.toLowerCase()} in this piece.</p>
          </div>
          <div>
            <Icon name="size" />
            <h3 className="h4">Room to grow</h3>
            <p>Comfortable fits that move with them, sized by age and height.</p>
          </div>
          <div>
            <Icon name="return" />
            <h3 className="h4">Easy exchanges</h3>
            <p>Wrong size? Exchange within {POLICY.returnWindowDays} days — conditions apply.</p>
          </div>
          <div>
            <Icon name="leaf" />
            <h3 className="h4">From a label to life</h3>
            <p>Every hang tag is seed paper. Plant it with them.</p>
          </div>
        </div>

        <Reviews p={p} />

        <section className="pdp-section" aria-labelledby="ymal-h">
          <div className="section-head">
            <div className="section-head__text">
              <p className="eyebrow">More to love</p>
              <h2 id="ymal-h" className="h3">
                You may <em>also like</em>
              </h2>
            </div>
          </div>
          <div className="rail rail--products" tabIndex={0} aria-label="You may also like — scroll horizontally">
            {similar.map((x) => (
              <ProductCard key={x.handle} product={x} />
            ))}
          </div>
        </section>

        {recentProducts.length > 0 && (
          <section className="pdp-section section--sm" aria-labelledby="rv-h" style={{ paddingBottom: 'var(--section)' }}>
            <div className="section-head">
              <div className="section-head__text">
                <h2 id="rv-h" className="h3">
                  Recently <em>viewed</em>
                </h2>
              </div>
            </div>
            <div className="rail rail--products" tabIndex={0} aria-label="Recently viewed — scroll horizontally">
              {recentProducts.map((x) => (
                <ProductCard key={x.handle} product={x} compact />
              ))}
            </div>
          </section>
        )}
        {recentProducts.length === 0 && <div style={{ height: 'var(--section)' }} />}
      </div>

      <div className={`pdp-sticky${sticky && !soldOut ? ' is-on' : ''}`} aria-hidden={!sticky}>
        <img src={productThumbnail(color.images[0])} alt="" width={44} height={55} style={{ objectFit: 'cover', width: 44, height: 55 }} />
        <div className="pdp-sticky__info">
          <strong>{p.name}</strong>
          <span className="muted">
            {formatINR(p.price)} · {size ? `${colorName}, ${size}` : 'Choose a size'}
          </span>
        </div>
        <button type="button" className={`btn btn--sm${state === 'loading' ? ' is-loading' : ''}`} onClick={() => add(false)} tabIndex={sticky ? 0 : -1}>
          {size ? 'Add to bag' : 'Select size'}
        </button>
      </div>

      {zoom && <Zoom slides={slides} index={slide} onIndex={setSlide} onClose={() => setZoom(false)} />}
    </div>
  )
}

function Gallery({ slides, index, onIndex, onZoom, badge }: { slides: Slide[]; index: number; onIndex: (i: number) => void; onZoom: () => void; badge?: string }) {
  const start = useRef<{ x: number; y: number; t: number } | null>(null)
  const [drag, setDrag] = useState(0)
  const go = (i: number) => onIndex(Math.max(0, Math.min(slides.length - 1, i)))
  return (
    <div className="gallery" aria-roledescription="carousel" aria-label="Product images">
      <div className="gallery__thumbs" role="tablist" aria-label="Choose image">
        {slides.map((s, i) => (
          <button key={i} type="button" role="tab" className="gallery__thumb" aria-current={i === index} aria-selected={i === index} aria-label={`Image ${i + 1}`} onClick={() => onIndex(i)}>
            <img src={productThumbnail(s.src)} alt="" />
          </button>
        ))}
      </div>
      <div
        className="gallery__main"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(index + 1)
          if (e.key === 'ArrowLeft') go(index - 1)
          if (e.key === 'Enter') onZoom()
        }}
        onPointerDown={(e) => {
          start.current = { x: e.clientX, y: e.clientY, t: Date.now() }
        }}
        onPointerMove={(e) => {
          if (!start.current || e.pointerType === 'mouse') return
          const dx = e.clientX - start.current.x
          if (Math.abs(dx) > Math.abs(e.clientY - start.current.y)) setDrag(dx)
        }}
        onPointerUp={(e) => {
          if (!start.current) return
          const dx = e.clientX - start.current.x
          const quick = Date.now() - start.current.t < 300
          start.current = null
          setDrag(0)
          if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1))
          else if (Math.abs(dx) < 6 && quick) onZoom()
        }}
        onPointerCancel={() => {
          start.current = null
          setDrag(0)
        }}
        aria-label={`Image ${index + 1} of ${slides.length}. Use arrow keys to browse, Enter to zoom.`}
      >
        <div className="gallery__track" style={{ transform: `translateX(calc(${-index * 100}% + ${drag}px))`, transition: drag ? 'none' : undefined }}>
          {slides.map((s, i) => (
            <div key={i} className="gallery__slide" aria-hidden={i !== index}>
              <img src={s.src} alt={s.alt} loading={i === 0 ? 'eager' : 'lazy'} draggable={false} />
            </div>
          ))}
        </div>
        {badge && <span className={`tag ${badge === 'New' ? '' : 'tag--muted'} gallery__badge`}>{badge}</span>}
        <button type="button" className="icon-btn gallery__nav gallery__nav--prev" onClick={(e) => (e.stopPropagation(), go(index - 1))} onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()} disabled={index === 0} aria-label="Previous image">
          <Icon name="chevron-left" />
        </button>
        <button type="button" className="icon-btn gallery__nav gallery__nav--next" onClick={(e) => (e.stopPropagation(), go(index + 1))} onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()} disabled={index === slides.length - 1} aria-label="Next image">
          <Icon name="chevron-right" />
        </button>
        <button type="button" className="icon-btn gallery__zoom" onClick={(e) => (e.stopPropagation(), onZoom())} onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()} aria-label="Open full-screen zoom">
          <Icon name="zoom" />
        </button>
        <div className="gallery__dots" aria-hidden="true">
          {slides.map((_, i) => (
            <span key={i} className={i === index ? 'is-active' : ''} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Zoom({ slides, index, onIndex, onClose }: { slides: Slide[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [z, setZ] = useState(false)
  const [origin, setOrigin] = useState('50% 50%')
  useLockScroll(true)
  useDialog(true, ref, onClose)
  useEffect(() => setZ(false), [index])
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onIndex(Math.min(slides.length - 1, index + 1))
      if (e.key === 'ArrowLeft') onIndex(Math.max(0, index - 1))
    }
    document.addEventListener('keydown', k)
    return () => document.removeEventListener('keydown', k)
  }, [index])
  const s = slides[index]
  return (
    <div className="zoom" ref={ref} role="dialog" aria-modal="true" aria-label="Image zoom">
      <div className="zoom__head">
        <span className="muted body-sm">
          {index + 1} / {slides.length} · {z ? 'Click to zoom out' : 'Click the image to zoom in'}
        </span>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close zoom">
          <Icon name="close" />
        </button>
      </div>
      <div
        className={`zoom__stage${z ? ' is-zoomed' : ''}`}
        onClick={(e) => {
          const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
          setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`)
          setZ(!z)
        }}
        onMouseMove={(e) => {
          if (!z) return
          const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
          setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`)
        }}
      >
        <img src={s.src} alt={s.alt} style={z ? { transform: 'scale(2.2)', transformOrigin: origin } : undefined} />
      </div>
      <div className="zoom__thumbs">
        {slides.map((x, i) => (
          <button key={i} type="button" aria-current={i === index} onClick={() => onIndex(i)} aria-label={`Image ${i + 1}`}>
            <img src={productThumbnail(x.src)} alt="" />
          </button>
        ))}
      </div>
    </div>
  )
}

/* Reviews — no fabricated reviews. Customers can draft one; in this demo it is kept in this browser only. */
function Reviews({ p }: { p: P }) {
  const key = `pu-review-${p.handle}`
  const [mine, setMine] = useState<{ rating: number; title: string; body: string; name: string } | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(key) ?? 'null')
    } catch {
      return null
    }
  })
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [name, setName] = useState('')
  const [err, setErr] = useState<Record<string, string>>({})
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (!rating) er.rating = 'Choose a star rating.'
    if (title.trim().length < 3) er.title = 'Add a short title.'
    if (body.trim().length < 20) er.body = 'Tell us a little more (at least 20 characters).'
    if (!name.trim()) er.name = 'Add your first name.'
    setErr(er)
    if (Object.keys(er).length) return
    const r = { rating, title: title.trim(), body: body.trim(), name: name.trim() }
    try {
      localStorage.setItem(key, JSON.stringify(r))
    } catch {
      /* ignore */
    }
    setMine(r)
    setOpen(false)
  }
  return (
    <section className="pdp-section" aria-labelledby="rev-h">
      <div className="reviews">
        <div className="reviews__empty">
          <p className="eyebrow">Reviews</p>
          <h2 id="rev-h" className="h3">
            What families <em>say</em>
          </h2>
          <p className="muted">No published reviews for this piece yet. Verified-purchase reviews will appear here once connected to Purple United’s review platform.</p>
          {!mine && !open && (
            <button type="button" className="btn btn--outline" onClick={() => setOpen(true)}>
              Write a review
            </button>
          )}
        </div>
        <div>
          {mine && (
            <div className="reviews__mine">
              <p className="eyebrow">Your review · saved in this browser (demo)</p>
              <div className="reviews__stars" aria-label={`${mine.rating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className={i <= mine.rating ? 'is-on' : ''} style={{ color: i <= mine.rating ? 'var(--gold)' : 'var(--ink-40)' }}>
                    <Icon name="star" size={18} fill={i <= mine.rating ? 'currentColor' : 'none'} />
                  </span>
                ))}
              </div>
              <p className="h4">{mine.title}</p>
              <p className="muted">{mine.body}</p>
              <p className="body-sm">— {mine.name}</p>
              <button
                type="button"
                className="text-link body-sm"
                style={{ justifySelf: 'start' }}
                onClick={() => {
                  try {
                    localStorage.removeItem(key)
                  } catch {
                    /* ignore */
                  }
                  setMine(null)
                }}
              >
                Delete my review
              </button>
            </div>
          )}
          {open && (
            <form className="reviews__form" onSubmit={submit} noValidate>
              <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className="field__label">Your rating</legend>
                <div className="reviews__stars" role="radiogroup" aria-label="Rating" style={{ marginTop: 8 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button key={i} type="button" role="radio" aria-checked={rating === i} className={i <= rating ? 'is-on' : ''} onClick={() => setRating(i)} aria-label={`${i} star${i > 1 ? 's' : ''}`}>
                      <Icon name="star" size={26} fill={i <= rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
                {err.rating && <p className="field__error">{err.rating}</p>}
              </fieldset>
              <Field id="rv-title" label="Title" error={err.title}>
                <input id="rv-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} aria-invalid={!!err.title} />
              </Field>
              <Field id="rv-body" label="Review" error={err.body}>
                <textarea id="rv-body" className="textarea" value={body} onChange={(e) => setBody(e.target.value)} aria-invalid={!!err.body} />
              </Field>
              <Field id="rv-name" label="First name" error={err.name}>
                <input id="rv-name" className="input" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!err.name} autoComplete="given-name" />
              </Field>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button type="submit" className="btn">
                  Save review
                </button>
                <button type="button" className="btn btn--outline" onClick={() => setOpen(false)}>
                  Cancel
                </button>
              </div>
              <p className="demo-note">Demo: reviews are not published or sent anywhere.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
