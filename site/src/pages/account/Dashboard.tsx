import '../../styles/commerce.css'
import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { Field, Modal } from '../../components/ui'
import { getProduct, formatINR } from '../../data/products'
import { useAccount, useUI, useWishlist, type Address, type User } from '../../store'
import { useMeta, validPhone, validPincode } from '../../lib/hooks'
import { AccountShell, fmtDate, orderStatus, useMyOrders } from './shell'

const NO_ADDRESSES: Address[] = []

const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
]
const NEXT_TIER = 5000 // illustrative points for preview only

export default function Dashboard() {
  const [params] = useSearchParams()
  const tab = params.get('tab') ?? 'overview'
  useMeta('My account', 'Your Purple United account, orders and membership.', { canonical: '/account' })
  return (
    <AccountShell
      active={tab}
      title={tab === 'profile' ? <>Profile & <em>family</em></> : tab === 'addresses' ? <>Saved <em>addresses</em></> : <WelcomeTitle />}
      crumbs={tab === 'profile' ? [{ label: 'Profile' }] : tab === 'addresses' ? [{ label: 'Addresses' }] : undefined}
    >
      {(user) => (tab === 'profile' ? <Profile user={user} /> : tab === 'addresses' ? <Addresses /> : <Overview user={user} />)}
    </AccountShell>
  )
}

function WelcomeTitle() {
  const name = useAccount((s) => (s.current ? s.users[s.current]?.user.name.split(' ')[0] : ''))
  const h = new Date().getHours()
  return (
    <>
      {h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'}, <em>{name}.</em>
    </>
  )
}

function Overview({ user }: { user: User }) {
  const orders = useMyOrders()
  const wish = useWishlist((s) => s.items)
  const pct = Math.min(100, (user.points / NEXT_TIER) * 100)
  return (
    <div className="acct-panel">
      <div className="acct-overview">
        <div className="mcard">
          <div className="mcard__top">
            <div>
              <p className="eyebrow">Membership · proposed programme</p>
              <p className="mcard__tier">{user.tier}</p>
            </div>
            <img src="/img/brand/crest-mark-reversed.png" alt="" className="mcard__mark" />
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            <div className="mcard__points">
              <div>
                <strong>{user.points.toLocaleString('en-IN')}</strong>
                <span>Points</span>
              </div>
              <Link to="/purple-circle" className="link">
                Benefits <Icon name="arrow" size={16} className="icon-arrow" />
              </Link>
            </div>
            <div className="mcard__bar" aria-hidden="true">
              <span style={{ width: `${pct}%` }} />
            </div>
            <span className="body-sm" style={{ opacity: 0.75 }}>
              Member since {fmtDate(user.joinedAt)} · tiers & thresholds illustrative
            </span>
          </div>
        </div>
        <div className="acct-card">
          <div className="acct-card__head">
            <h2 className="h4">Your wishlist</h2>
            <Link to="/wishlist" className="link">
              View all
            </Link>
          </div>
          {wish.length === 0 ? (
            <p className="muted body-sm">
              Nothing saved yet — tap the heart on any piece. <Link to="/collections/new-arrivals" className="text-link">Browse new arrivals</Link>
            </p>
          ) : (
            <div className="wl-preview">
              {wish.slice(0, 4).map((w) => {
                const p = getProduct(w.handle)
                if (!p) return null
                const img = (p.colors.find((c) => c.name === w.color) ?? p.colors[0]).images[0]
                return (
                  <Link key={w.handle} to={`/products/${p.handle}`} aria-label={p.name}>
                    <img src={img} alt="" loading="lazy" />
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="acct-card">
        <div className="acct-card__head">
          <h2 className="h4">Recent orders</h2>
          {orders.length > 0 && (
            <Link to="/account/orders" className="link">
              All orders
            </Link>
          )}
        </div>
        {orders.length === 0 ? (
          <p className="muted body-sm">
            No orders yet. When you shop, you’ll be able to track deliveries here. <Link to="/collections/new-arrivals" className="text-link">Start shopping</Link>
          </p>
        ) : (
          <OrderRows orders={orders.slice(0, 3)} />
        )}
      </div>

      <div className="acct-overview">
        <Link to="/account?tab=profile" className="acct-card" style={{ textDecoration: 'none' }}>
          <Icon name="user" />
          <h2 className="h4">Profile & family</h2>
          <p className="muted body-sm">{user.children.length ? `${user.children.length} child profile${user.children.length > 1 ? 's' : ''} saved — we’ll suggest the right sizes.` : 'Add your children’s ages for size suggestions and birthday surprises.'}</p>
        </Link>
        <Link to="/account?tab=addresses" className="acct-card" style={{ textDecoration: 'none' }}>
          <Icon name="pin" />
          <h2 className="h4">Addresses</h2>
          <p className="muted body-sm">Manage where we deliver for faster checkout.</p>
        </Link>
      </div>
      <p className="demo-note">Demo account — data is stored only in this browser.</p>
    </div>
  )
}

export function OrderRows({ orders }: { orders: ReturnType<typeof useMyOrders> }) {
  return (
    <ul role="list" className="order-rows">
      {orders.map((o) => {
        const st = orderStatus(o)
        const n = o.lines.reduce((s, l) => s + l.qty, 0)
        return (
          <li key={o.id} className="order-row">
            <div className="order-row__thumbs" aria-hidden="true">
              {o.lines.slice(0, 3).map((l, i) => (
                <img key={i} src={l.image} alt="" loading="lazy" />
              ))}
            </div>
            <div className="order-row__meta">
              <Link to={`/account/orders/${o.id}`}>
                <strong>Order {o.id}</strong>
              </Link>
              <span className="muted">
                {fmtDate(o.createdAt)} · {n} {n === 1 ? 'item' : 'items'}
              </span>
            </div>
            <span className={`status-pill status-pill--${st.split(' ')[0]}`}>{st}</span>
            <span className="order-row__total">{formatINR(o.total)}</span>
            <Link to={`/account/orders/${o.id}`} className="icon-btn" aria-label={`View order ${o.id}`}>
              <Icon name="chevron-right" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function Profile({ user }: { user: User }) {
  const update = useAccount((s) => s.updateProfile)
  const toast = useUI((s) => s.toast)
  const [f, setF] = useState({ name: user.name, phone: user.phone ?? '', marketing: user.marketing })
  const [kids, setKids] = useState(user.children.length ? user.children : [])
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (f.name.trim().length < 2) er.name = 'Enter your full name.'
    if (f.phone && !validPhone(f.phone)) er.phone = 'Enter a valid 10-digit mobile number.'
    kids.forEach((k, i) => {
      if (!k.name.trim()) er[`kid${i}`] = 'Add a name or remove this row.'
    })
    setErrs(er)
    const first = Object.keys(er)[0]
    if (first) return document.getElementById(`pf-${first}`)?.focus()
    setBusy(true)
    setTimeout(() => {
      update({ name: f.name.trim(), phone: f.phone.trim(), marketing: f.marketing, children: kids.map((k) => ({ name: k.name.trim(), age: k.age })) })
      setBusy(false)
      toast({ title: 'Profile saved' })
    }, 450)
  }
  return (
    <form className="acct-panel" onSubmit={submit} noValidate>
      <div className="acct-card">
        <h2 className="h4">Your details</h2>
        <div className="form-grid">
          <Field id="pf-name" label="Full name" error={errs.name}>
            <input id="pf-name" className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-invalid={!!errs.name || undefined} aria-describedby={errs.name ? 'pf-name-err' : undefined} autoComplete="name" />
          </Field>
          <Field id="pf-email" label="Email" hint="Contact us to change your sign-in email.">
            <input id="pf-email" className="input" value={user.email} disabled aria-describedby="pf-email-hint" />
          </Field>
          <Field id="pf-phone" label="Mobile number" optional error={errs.phone}>
            <input id="pf-phone" type="tel" className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} aria-invalid={!!errs.phone || undefined} aria-describedby={errs.phone ? 'pf-phone-err' : undefined} autoComplete="tel" />
          </Field>
          <label className="checkbox span-2" style={{ alignSelf: 'end' }}>
            <input type="checkbox" checked={f.marketing} onChange={(e) => setF({ ...f, marketing: e.target.checked })} />
            <span>Email me new collections and member previews</span>
          </label>
        </div>
      </div>
      <div className="acct-card">
        <div className="acct-card__head">
          <h2 className="h4">Your little ones</h2>
          <span className="muted body-sm">For size suggestions & birthday surprises</span>
        </div>
        <div className="kids-list">
          {kids.map((k, i) => (
            <div key={i} className="kid-row">
              <Field id={`pf-kid${i}`} label="Name" error={errs[`kid${i}`]}>
                <input id={`pf-kid${i}`} className="input" value={k.name} onChange={(e) => setKids(kids.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} aria-invalid={!!errs[`kid${i}`] || undefined} />
              </Field>
              <Field id={`pf-age${i}`} label="Age">
                <select id={`pf-age${i}`} className="select" value={k.age} onChange={(e) => setKids(kids.map((x, j) => (j === i ? { ...x, age: e.target.value } : x)))}>
                  {['0–6 months', '6–12 months', '1 year', ...Array.from({ length: 13 }, (_, n) => `${n + 2} years`)].map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </Field>
              <button type="button" className="icon-btn" aria-label={`Remove ${k.name || 'child'}`} onClick={() => setKids(kids.filter((_, j) => j !== i))} style={{ marginBottom: 3 }}>
                <Icon name="trash" size={18} />
              </button>
            </div>
          ))}
          {kids.length < 6 && (
            <button type="button" className="link" style={{ justifySelf: 'start' }} onClick={() => setKids([...kids, { name: '', age: '4 years' }])}>
              <Icon name="plus" size={16} /> Add a child
            </button>
          )}
        </div>
      </div>
      <div>
        <button type="submit" className={`btn${busy ? ' is-loading' : ''}`}>
          Save changes
        </button>
      </div>
    </form>
  )
}

const EMPTY: Address = { id: '', label: 'Home', name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' }

function Addresses() {
  const list = useAccount((s) => (s.current ? s.addresses[s.current] : undefined)) ?? NO_ADDRESSES
  const save = useAccount((s) => s.saveAddress)
  const remove = useAccount((s) => s.removeAddress)
  const toast = useUI((s) => s.toast)
  const [editing, setEditing] = useState<Address | null>(null)
  const [errs, setErrs] = useState<Record<string, string>>({})

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!editing) return
    const a = editing
    const er: Record<string, string> = {}
    if (!a.label.trim()) er.label = 'Give this address a name, like Home.'
    if (a.name.trim().length < 2) er.name = 'Enter the recipient’s full name.'
    if (!validPhone(a.phone)) er.phone = 'Enter a valid 10-digit mobile number.'
    if (a.line1.trim().length < 5) er.line1 = 'Enter the house number, building and street.'
    if (a.city.trim().length < 2) er.city = 'Enter the city.'
    if (!a.state) er.state = 'Choose a state.'
    if (!validPincode(a.pincode)) er.pincode = 'Enter a valid 6-digit pincode.'
    setErrs(er)
    const first = Object.keys(er)[0]
    if (first) return document.getElementById(`ad-${first}`)?.focus()
    save({ ...a, id: a.id || `a${Date.now()}` })
    toast({ title: a.id ? 'Address updated' : 'Address saved' })
    setEditing(null)
  }
  const set = (k: keyof Address, v: string | boolean) => editing && setEditing({ ...editing, [k]: v })
  const inv = (k: string) => ({ 'aria-invalid': !!errs[k] || undefined, 'aria-describedby': errs[k] ? `ad-${k}-err` : undefined })

  return (
    <div className="acct-panel">
      <div className="addr-grid">
        {list.map((a) => (
          <div key={a.id} className={`addr-card${a.isDefault ? ' is-default' : ''}`}>
            <span className="addr-card__label">
              <Icon name="pin" size={16} /> {a.label} {a.isDefault && <span className="tag tag--muted">Default</span>}
            </span>
            <span>{a.name}</span>
            <span className="muted">
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ''}
              <br />
              {a.city}, {a.state} {a.pincode}
              <br />
              {a.phone}
            </span>
            <div className="addr-card__actions">
              <button type="button" onClick={() => (setErrs({}), setEditing(a))}>
                Edit
              </button>
              {!a.isDefault && (
                <button type="button" onClick={() => save({ ...a, isDefault: true })}>
                  Make default
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  remove(a.id)
                  toast({ kind: 'info', title: 'Address removed' })
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button type="button" className="addr-add" onClick={() => (setErrs({}), setEditing({ ...EMPTY, isDefault: list.length === 0 }))}>
          <Icon name="plus" size={22} />
          Add a new address
        </button>
      </div>
      {list.length === 0 && <p className="muted body-sm">No saved addresses yet. Addresses you save at checkout appear here too.</p>}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit address' : 'New address'}>
        {editing && (
          <form onSubmit={submit} noValidate className="form-grid">
            <Field id="ad-label" label="Address name" error={errs.label}>
              <input id="ad-label" className="input" value={editing.label} onChange={(e) => set('label', e.target.value)} {...inv('label')} />
            </Field>
            <Field id="ad-name" label="Full name" error={errs.name}>
              <input id="ad-name" className="input" autoComplete="name" value={editing.name} onChange={(e) => set('name', e.target.value)} {...inv('name')} />
            </Field>
            <div className="span-2">
              <Field id="ad-line1" label="House no., building, street" error={errs.line1}>
                <input id="ad-line1" className="input" autoComplete="address-line1" value={editing.line1} onChange={(e) => set('line1', e.target.value)} {...inv('line1')} />
              </Field>
            </div>
            <div className="span-2">
              <Field id="ad-line2" label="Area, landmark" optional>
                <input id="ad-line2" className="input" autoComplete="address-line2" value={editing.line2 ?? ''} onChange={(e) => set('line2', e.target.value)} />
              </Field>
            </div>
            <Field id="ad-pincode" label="Pincode" error={errs.pincode}>
              <input id="ad-pincode" className="input" inputMode="numeric" autoComplete="postal-code" maxLength={6} value={editing.pincode} onChange={(e) => set('pincode', e.target.value.replace(/\D/g, ''))} {...inv('pincode')} />
            </Field>
            <Field id="ad-city" label="City" error={errs.city}>
              <input id="ad-city" className="input" autoComplete="address-level2" value={editing.city} onChange={(e) => set('city', e.target.value)} {...inv('city')} />
            </Field>
            <Field id="ad-state" label="State" error={errs.state}>
              <select id="ad-state" className="select" autoComplete="address-level1" value={editing.state} onChange={(e) => set('state', e.target.value)} {...inv('state')}>
                <option value="">Select state</option>
                {STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field id="ad-phone" label="Mobile number" error={errs.phone}>
              <input id="ad-phone" type="tel" className="input" autoComplete="tel" value={editing.phone} onChange={(e) => set('phone', e.target.value)} {...inv('phone')} />
            </Field>
            <label className="checkbox span-2">
              <input type="checkbox" checked={!!editing.isDefault} onChange={(e) => set('isDefault', e.target.checked)} />
              <span>Use as my default address</span>
            </label>
            <div className="span-2" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button type="submit" className="btn">
                Save address
              </button>
              <button type="button" className="btn btn--outline" onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
