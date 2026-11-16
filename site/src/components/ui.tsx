import { useEffect, useId, useRef, useState, type ReactNode, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import { formatINR } from '../data/products'
import { useDialog, useLockScroll } from '../lib/hooks'
import { useUI } from '../store'

/* ---------- Brand crest (concept artwork from the PixelCrayons proposal p.16) ---------- */
export function Crest({ variant = 'lockup', tone = 'auto', className, style }: { variant?: 'lockup' | 'mark'; tone?: 'light' | 'dark' | 'auto'; className?: string; style?: CSSProperties }) {
  const w = variant === 'lockup' ? 962 : 322
  const h = variant === 'lockup' ? 610 : 434
  const src = (t: 'light' | 'dark') => `/img/brand/crest-${variant}${t === 'dark' ? '-reversed' : ''}.png`
  if (tone !== 'auto') return <img src={src(tone)} alt="Purple United Kids" className={className} style={style} width={w} height={h} decoding="async" />
  // Auto: follows the Appearance setting (reversed artwork on the dark theme)
  return (
    <>
      <img src={src('light')} alt="Purple United Kids" className={`${className ?? ''} crest-l`} style={style} width={w} height={h} decoding="async" />
      <img src={src('dark')} alt="" aria-hidden="true" className={`${className ?? ''} crest-d`} style={style} width={w} height={h} decoding="async" loading="lazy" />
    </>
  )
}

/* ---------- Image with fade-in + stable aspect ---------- */
export function Img({
  src,
  alt,
  ratio,
  className,
  pos,
  eager,
  sizes,
  style,
}: {
  src: string
  alt: string
  ratio?: string
  className?: string
  pos?: string
  eager?: boolean
  sizes?: string
  style?: CSSProperties
}) {
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLImageElement>(null)
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true)
  }, [src])
  return (
    <div className={`media ${className ?? ''}`} style={{ aspectRatio: ratio, ...style }}>
      <img
        ref={ref}
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        sizes={sizes}
        fetchPriority={eager ? 'high' : undefined}
        onLoad={() => setLoaded(true)}
        className={loaded ? '' : 'is-loading'}
        style={{ objectPosition: pos }}
      />
    </div>
  )
}

export function Price({ price, compareAt, className }: { price: number; compareAt?: number; className?: string }) {
  return (
    <span className={`price ${className ?? ''}`}>
      <span className="price__now">
        <span className="sr-only">Price </span>
        {formatINR(price)}
      </span>
      {compareAt && compareAt > price && (
        <span className="price__was">
          <span className="sr-only">Was </span>
          {formatINR(compareAt)}
        </span>
      )}
    </span>
  )
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.label, item: it.to ? `https://purpleunited.com${it.to}` : undefined })),
  }
  return (
    <nav aria-label="Breadcrumb" className="crumbs">
      <ol role="list">
        {items.map((it, i) => (
          <li key={i}>
            {it.to && i < items.length - 1 ? <Link to={it.to}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
            {i < items.length - 1 && <Icon name="chevron-right" size={12} />}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </nav>
  )
}

export function Accordion({ items, defaultOpen = -1, className }: { items: { title: ReactNode; body: ReactNode; id?: string }[]; defaultOpen?: number; className?: string }) {
  const [open, setOpen] = useState<number>(defaultOpen)
  const uid = useId()
  return (
    <div className={`accordion ${className ?? ''}`}>
      {items.map((it, i) => {
        const isOpen = open === i
        return (
          <div className={`accordion__item${isOpen ? ' is-open' : ''}`} key={i} id={it.id}>
            <h3 className="accordion__h">
              <button
                type="button"
                className="accordion__btn"
                aria-expanded={isOpen}
                aria-controls={`${uid}-p-${i}`}
                id={`${uid}-b-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{it.title}</span>
                <span className="accordion__icon" aria-hidden="true" />
              </button>
            </h3>
            <div className="accordion__panel" id={`${uid}-p-${i}`} role="region" aria-labelledby={`${uid}-b-${i}`} hidden={!isOpen}>
              <div className="accordion__inner">{it.body}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
  className,
  labelledBy,
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  wide?: boolean
  className?: string
  labelledBy?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()
  useLockScroll(open)
  useDialog(open, ref, onClose)
  if (!open) return null
  return (
    <div className="modal" role="presentation">
      <div className="modal__scrim" onClick={onClose} />
      <div
        ref={ref}
        className={`modal__panel${wide ? ' modal__panel--wide' : ''} ${className ?? ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy ?? (title ? id : undefined)}
      >
        <div className="modal__head">
          {title && (
            <h2 className="h4" id={id}>
              {title}
            </h2>
          )}
          <button type="button" className="icon-btn modal__close" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  )
}

export function Toasts() {
  const toasts = useUI((s) => s.toasts)
  const dismiss = useUI((s) => s.dismiss)
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.kind ?? 'success'}`}>
          {t.image ? <img src={t.image} alt="" className="toast__img" /> : <Icon name={t.kind === 'error' ? 'alert' : t.kind === 'info' ? 'info' : 'check'} className="toast__icon" />}
          <div className="toast__text">
            <strong>{t.title}</strong>
            {t.body && <span>{t.body}</span>}
          </div>
          {t.action &&
            (t.action.to ? (
              <Link className="toast__action" to={t.action.to} onClick={() => dismiss(t.id)}>
                {t.action.label}
              </Link>
            ) : (
              <button
                type="button"
                className="toast__action"
                onClick={() => {
                  t.action?.onClick?.()
                  dismiss(t.id)
                }}
              >
                {t.action.label}
              </button>
            ))}
          <button className="toast__close" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
            <Icon name="close" size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}

export function QtyStepper({ value, onChange, max = 10, label = 'Quantity', size }: { value: number; onChange: (n: number) => void; max?: number; label?: string; size?: 'sm' }) {
  return (
    <div className={`qty${size === 'sm' ? ' qty--sm' : ''}`} role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <Icon name="minus" size={16} />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Icon name="plus" size={16} />
      </button>
    </div>
  )
}

export function EmptyState({ icon, title, body, action, headingLevel = 2 }: { icon: Parameters<typeof Icon>[0]['name']; title: string; body?: string; action?: ReactNode; headingLevel?: 1 | 2 }) {
  const H = headingLevel === 1 ? 'h1' : 'h2'
  return (
    <div className="empty">
      <span className="empty__icon">
        <Icon name={icon} size={30} strokeWidth={1.2} />
      </span>
      <H className="h3">{title}</H>
      {body && <p className="muted">{body}</p>}
      {action}
    </div>
  )
}

export function Field({
  label,
  error,
  hint,
  optional,
  children,
  id,
}: {
  label: string
  error?: string
  hint?: string
  optional?: boolean
  children: ReactNode
  id: string
}) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label} {optional && <span className="opt">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p className="field__error" id={`${id}-err`}>
          <Icon name="alert" size={15} />
          {error}
        </p>
      ) : hint ? (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null
  return (
    <nav className="pager" aria-label="Pagination">
      <button type="button" className="icon-btn" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
        <Icon name="chevron-left" />
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button key={p} type="button" className={`pager__n${p === page ? ' is-active' : ''}`} aria-current={p === page ? 'page' : undefined} onClick={() => onPage(p)}>
          {p}
        </button>
      ))}
      <button type="button" className="icon-btn" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page">
        <Icon name="chevron-right" />
      </button>
    </nav>
  )
}
