import '../styles/experience.css'
import { useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Breadcrumbs, EmptyState, Field } from '../components/ui'
import { stores, storeById, directionsUrl, telHref } from '../data/stores'
import { CONTACT } from '../data/site'
import { useMeta } from '../lib/hooks'
import { StoreCard } from './Stores'

const SLOTS = ['11:00 AM', '12:30 PM', '2:00 PM', '3:30 PM', '5:00 PM', '6:30 PM']

function TryOnForm({ storeName }: { storeName: string }) {
  const today = new Date().toISOString().slice(0, 10)
  const [v, setV] = useState({ name: '', date: '', time: '', ages: '', notes: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const set = (k: keyof typeof v, val: string) => {
    setV((x) => ({ ...x, [k]: val }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }))
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (!v.name.trim()) er.name = 'Please tell us your name.'
    if (!v.date) er.date = 'Choose a date.'
    else if (v.date < today) er.date = 'Choose today or a future date.'
    if (!v.time) er.time = 'Choose a time slot.'
    if (!v.ages.trim()) er.ages = 'Add your child’s age so we can prepare sizes.'
    setErrors(er)
    if (Object.keys(er).length) {
      document.getElementById(`try-${Object.keys(er)[0]}`)?.focus()
      return
    }
    setState('loading')
    setTimeout(() => setState('done'), 800)
  }
  if (state === 'done')
    return (
      <div className="tryon-done" role="status">
        <span className="tryon-done__icon">
          <Icon name="check" size={26} />
        </span>
        <h3 className="h3">Your try-on is pencilled in.</h3>
        <p>
          {v.name.split(' ')[0]}, we’d see you at <strong>{storeName}</strong> on{' '}
          <strong>{new Date(v.date + 'T00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</strong> at <strong>{v.time}</strong>, with sizes ready for {v.ages}.
        </p>
        <p className="demo-note">Demo only — no booking was made and nothing was sent to the store.</p>
        <button type="button" className="link" onClick={() => setState('idle')}>
          Change details
        </button>
      </div>
    )
  return (
    <form className="tryon" onSubmit={submit} noValidate>
      <div className="tryon__grid">
        <Field id="try-name" label="Your name" error={errors.name}>
          <input id="try-name" className="input" value={v.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'try-name-err' : undefined} />
        </Field>
        <Field id="try-date" label="Date" error={errors.date}>
          <input id="try-date" type="date" min={today} className="input" value={v.date} onChange={(e) => set('date', e.target.value)} aria-invalid={!!errors.date} aria-describedby={errors.date ? 'try-date-err' : undefined} />
        </Field>
      </div>
      <fieldset className="tryon__slots">
        <legend className="field__label">Preferred time</legend>
        <div className="tryon__slot-grid">
          {SLOTS.map((s, i) => (
            <label key={s} className={`tryon__slot${v.time === s ? ' is-on' : ''}`}>
              <input type="radio" name="slot" id={i === 0 ? 'try-time' : undefined} value={s} checked={v.time === s} onChange={() => set('time', s)} />
              {s}
            </label>
          ))}
        </div>
        {errors.time && (
          <p className="field__error">
            <Icon name="alert" size={15} /> {errors.time}
          </p>
        )}
      </fieldset>
      <Field id="try-ages" label="Children’s ages" hint="For example: 4 years and 18 months" error={errors.ages}>
        <input id="try-ages" className="input" value={v.ages} onChange={(e) => set('ages', e.target.value)} aria-invalid={!!errors.ages} aria-describedby={errors.ages ? 'try-ages-err' : 'try-ages-hint'} />
      </Field>
      <Field id="try-notes" label="Anything we should prepare?" optional>
        <textarea id="try-notes" className="textarea" rows={3} value={v.notes} onChange={(e) => set('notes', e.target.value)} placeholder="An occasion, a colour they love, a piece you’ve seen online…" />
      </Field>
      <button type="submit" className={`btn${state === 'loading' ? ' is-loading' : ''}`}>
        Request try-on appointment
      </button>
      <p className="demo-note">Concept · appointment booking is a proposed service. Nothing is sent in this demo.</p>
    </form>
  )
}

export default function StoreDetail() {
  const { id = '' } = useParams()
  const s = storeById.get(id)
  const location = s ? [s.city, s.state].filter(Boolean).join(', ') : ''
  useMeta(s ? `${s.name} store, ${s.city}` : 'Store not found', s ? `Purple United Kids ${s.name}: ${s.address || location}. ${s.hours ? `Open ${s.hours}.` : 'Contact customer care for visit details.'}` : undefined, {
    jsonLd: s
      ? {
          '@context': 'https://schema.org',
          '@type': 'ClothingStore',
          name: `Purple United Kids — ${s.name}`,
          address: { '@type': 'PostalAddress', streetAddress: s.address || undefined, addressLocality: s.city, addressRegion: s.state, postalCode: s.pincode || undefined, addressCountry: 'IN' },
          telephone: s.phone || undefined,
        }
      : undefined,
  })
  const nearby = useMemo(() => {
    if (!s) return []
    const sameCity = stores.filter((x) => x.id !== s.id && x.city === s.city)
    const sameState = stores.filter((x) => x.id !== s.id && x.city !== s.city && x.state === s.state)
    return [...sameCity, ...sameState].slice(0, 3)
  }, [s])

  if (!s)
    return (
      <div className="container section">
        <EmptyState
          icon="store"
          title="We couldn’t find that store"
          body="It may have moved or the link may be out of date. Browse all our stores to find the nearest one."
          action={
            <Link to="/stores" className="btn">
              Find a store
            </Link>
          }
        />
      </div>
    )

  return (
    <div className="store-detail">
      <div className="container store-detail__top">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Stores', to: '/stores' }, { label: s.name }]} />
      </div>
      <section className="container store-detail__grid">
        <div className="store-detail__info">
          <p className="eyebrow">{location}</p>
          <h1 className="h1">
            Purple United <em>{s.name}</em>
          </h1>
          <dl className="store-detail__dl">
            <div>
              <dt>
                <Icon name="pin" size={18} /> Address
              </dt>
              <dd>{s.address || 'Street address not listed'}</dd>
            </div>
            <div>
              <dt>
                <Icon name="clock" size={18} /> Opening hours
              </dt>
              <dd>{s.hours ? `Every day, ${s.hours}` : 'Hours not listed. Contact customer care before visiting.'}</dd>
            </div>
            <div>
              <dt>
                <Icon name="phone" size={18} /> Phone
              </dt>
              <dd>
                {s.phone ? (
                  <a className="text-link" href={telHref(s.phone)}>
                    {s.phone}
                  </a>
                ) : (
                  <>
                    Store number not listed. Customer care:{' '}
                    <a className="text-link" href={CONTACT.phoneHref}>
                      {CONTACT.phone}
                    </a>
                  </>
                )}
              </dd>
            </div>
          </dl>
          <div className="store-detail__actions">
            {s.address ? (
              <a href={directionsUrl(s)} target="_blank" rel="noreferrer" className="btn">
                <Icon name="direction" size={18} /> Get directions
                <span className="sr-only"> (opens Google Maps in a new tab)</span>
              </a>
            ) : (
              <Link to="/contact" className="btn">Contact customer care</Link>
            )}
            {s.phone && (
              <a href={telHref(s.phone)} className="btn btn--outline">
                <Icon name="phone" size={18} /> Call store
              </a>
            )}
          </div>
          <p className="demo-note">Store information from Purple United’s published locator and store list.</p>
        </div>
        {s.address && (
          <div className="store-detail__map">
            <iframe
              title={`Map showing Purple United ${s.name}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(`Purple United Kids ${s.address}`)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
      </section>

      <section className="section store-detail__services bg-oat">
        <div className="container store-detail__svc-grid">
          <div>
            <p className="eyebrow">
              In store <span className="tag tag--gold">Proposed experience</span>
            </p>
            <h2 className="h2">
              Come in, <em>try it on.</em>
            </h2>
            <ul role="list" className="store-svc">
              {[
                ['ruler', 'Fitting help', 'Our team will help you find the right size for every age.'],
                ['return', 'Size exchanges', 'Exchange unused items with tags intact within 7 days of delivery (conditions apply). Free in-store exchanges for Circle Plus members are proposed.'],
                ['crown', 'Personal styling', 'Appointments for Circle Privé members — proposed.'],
                ['gift', 'Gifting', 'Gift cards and wrapping help for every celebration.'],
              ].map(([icon, t, d]) => (
                <li key={t}>
                  <Icon name={icon as 'ruler'} size={22} />
                  <div>
                    <h3 className="h4">{t}</h3>
                    <p className="muted">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {s.address && (
            <div className="store-detail__book">
              <p className="eyebrow">Book a try-on</p>
              <h2 className="h3">Have sizes ready when you arrive</h2>
              <TryOnForm storeName={s.name} />
            </div>
          )}
        </div>
      </section>

      {nearby.length > 0 && (
        <section className="section container">
          <div className="section-head">
            <div className="section-head__text">
              <p className="eyebrow">Nearby</p>
              <h2 className="h3">More stores in {nearby[0].city === s.city ? s.city : s.state}</h2>
            </div>
            <Link to={`/stores?state=${encodeURIComponent(s.state)}`} className="link">
              All stores in {s.state} <Icon name="arrow" size={14} className="icon-arrow" />
            </Link>
          </div>
          <div className="stores-grid">
            {nearby.map((n) => (
              <StoreCard key={n.id} s={n} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
