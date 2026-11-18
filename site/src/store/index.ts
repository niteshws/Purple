import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getProduct, stockFor, type Product } from '../data/products'

/* ---------------------------------------------------------------------------
   Safe storage — falls back to memory when localStorage is unavailable
   --------------------------------------------------------------------------- */
const memory = new Map<string, string>()
const safeStorage = createJSONStorage(() => ({
  getItem: (k: string) => {
    try {
      return localStorage.getItem(k)
    } catch {
      return memory.get(k) ?? null
    }
  },
  setItem: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v)
    } catch {
      memory.set(k, v)
    }
  },
  removeItem: (k: string) => {
    try {
      localStorage.removeItem(k)
    } catch {
      memory.delete(k)
    }
  },
}))

/* ---------------------------------------------------------------------------
   Cart
   --------------------------------------------------------------------------- */
export interface GiftCardDetails {
  amount: number
  recipientName: string
  recipientEmail: string
  senderName: string
  message: string
  design: string
  deliveryDate: string
}
export interface CartLine {
  key: string
  handle: string
  color: string
  size: string
  qty: number
  gift?: GiftCardDetails
  addedAt: number
}

export const GIFT_CARD_HANDLE = 'purple-gift-card'
export const DISCOUNTS: Record<string, { label: string; pct: number }> = {
  WELCOME10: { label: 'Welcome 10% (demo code)', pct: 10 },
  CIRCLE15: { label: 'Purple Circle 15% (demo code)', pct: 15 },
}
export const FREE_SHIPPING_FROM = 499
export const STANDARD_SHIPPING_FEE = 99 // demonstration rate — confirm with Purple United

const lineKey = (handle: string, color: string, size: string) => `${handle}::${color}::${size}`

interface CartState {
  lines: CartLine[]
  discount: string | null
  add: (handle: string, color: string, size: string, qty?: number) => { ok: boolean; message?: string }
  addGiftCard: (gift: GiftCardDetails) => void
  setQty: (key: string, qty: number) => void
  changeVariant: (key: string, color: string, size: string) => void
  remove: (key: string) => CartLine | undefined
  restore: (line: CartLine) => void
  applyDiscount: (code: string) => { ok: boolean; message: string }
  clearDiscount: () => void
  clear: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      discount: null,
      add: (handle, color, size, qty = 1) => {
        const p = getProduct(handle)
        if (!p) return { ok: false, message: 'Product not found' }
        const stock = stockFor(p, color, size)
        const key = lineKey(handle, color, size)
        const existing = get().lines.find((l) => l.key === key)
        const want = (existing?.qty ?? 0) + qty
        if (stock <= 0) return { ok: false, message: 'This size is sold out.' }
        if (want > stock) return { ok: false, message: `Only ${stock} left in this size.` }
        set((s) => ({
          lines: existing
            ? s.lines.map((l) => (l.key === key ? { ...l, qty: want } : l))
            : [{ key, handle, color, size, qty, addedAt: Date.now() }, ...s.lines],
        }))
        return { ok: true }
      },
      addGiftCard: (gift) =>
        set((s) => ({
          lines: [
            { key: `${GIFT_CARD_HANDLE}::${Date.now()}`, handle: GIFT_CARD_HANDLE, color: gift.design, size: `₹${gift.amount}`, qty: 1, gift, addedAt: Date.now() },
            ...s.lines,
          ],
        })),
      setQty: (key, qty) =>
        set((s) => ({
          lines: s.lines
            .map((l) => {
              if (l.key !== key) return l
              const p = getProduct(l.handle)
              const max = p ? stockFor(p, l.color, l.size) : 10
              return { ...l, qty: Math.max(1, Math.min(qty, max || 1, 10)) }
            })
            .filter((l) => l.qty > 0),
        })),
      changeVariant: (key, color, size) =>
        set((s) => {
          const line = s.lines.find((l) => l.key === key)
          if (!line) return s
          const nk = lineKey(line.handle, color, size)
          const others = s.lines.filter((l) => l.key !== key)
          const merge = others.find((l) => l.key === nk)
          if (merge) return { lines: others.map((l) => (l.key === nk ? { ...l, qty: l.qty + line.qty } : l)) }
          return { lines: s.lines.map((l) => (l.key === key ? { ...l, key: nk, color, size } : l)) }
        }),
      remove: (key) => {
        const line = get().lines.find((l) => l.key === key)
        set((s) => ({ lines: s.lines.filter((l) => l.key !== key) }))
        return line
      },
      restore: (line) => set((s) => ({ lines: [line, ...s.lines.filter((l) => l.key !== line.key)] })),
      applyDiscount: (code) => {
        const c = code.trim().toUpperCase()
        if (!c) return { ok: false, message: 'Enter a code.' }
        if (!DISCOUNTS[c]) return { ok: false, message: 'That code isn’t valid. Try WELCOME10 for this demo.' }
        set({ discount: c })
        return { ok: true, message: `${DISCOUNTS[c].label} applied.` }
      },
      clearDiscount: () => set({ discount: null }),
      clear: () => set({ lines: [], discount: null }),
    }),
    { name: 'pu-cart', storage: safeStorage },
  ),
)

export function linePrice(l: CartLine) {
  if (l.gift) return l.gift.amount
  return getProduct(l.handle)?.price ?? 0
}
export function cartTotals(lines: CartLine[], discount: string | null, shippingFee?: number) {
  const subtotal = lines.reduce((s, l) => s + linePrice(l) * l.qty, 0)
  const merchandise = lines.filter((l) => !l.gift).reduce((s, l) => s + linePrice(l) * l.qty, 0)
  const pct = discount ? DISCOUNTS[discount]?.pct ?? 0 : 0
  const discountAmt = Math.round((merchandise * pct) / 100)
  const shipping = shippingFee ?? (subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : STANDARD_SHIPPING_FEE)
  const count = lines.reduce((s, l) => s + l.qty, 0)
  return { subtotal, discountAmt, shipping, total: Math.max(0, subtotal - discountAmt + shipping), count }
}

/* ---------------------------------------------------------------------------
   Wishlist
   --------------------------------------------------------------------------- */
interface WishState {
  items: { handle: string; color?: string; addedAt: number }[]
  toggle: (handle: string, color?: string) => boolean
  has: (handle: string) => boolean
  remove: (handle: string) => void
}
export const useWishlist = create<WishState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (handle, color) => {
        const on = get().items.some((i) => i.handle === handle)
        set((s) => ({
          items: on ? s.items.filter((i) => i.handle !== handle) : [{ handle, color, addedAt: Date.now() }, ...s.items],
        }))
        return !on
      },
      has: (handle) => get().items.some((i) => i.handle === handle),
      remove: (handle) => set((s) => ({ items: s.items.filter((i) => i.handle !== handle) })),
    }),
    { name: 'pu-wishlist', storage: safeStorage },
  ),
)

/* ---------------------------------------------------------------------------
   Recently viewed
   --------------------------------------------------------------------------- */
interface RecentState {
  handles: string[]
  push: (h: string) => void
}
export const useRecent = create<RecentState>()(
  persist(
    (set) => ({
      handles: [],
      push: (h) => set((s) => ({ handles: [h, ...s.handles.filter((x) => x !== h)].slice(0, 12) })),
    }),
    { name: 'pu-recent', storage: safeStorage },
  ),
)

/* ---------------------------------------------------------------------------
   Account (mock authentication — demonstration only, never use real passwords)
   --------------------------------------------------------------------------- */
export interface Address {
  id: string
  label: string
  name: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  isDefault?: boolean
}
export interface OrderLine {
  handle: string
  name: string
  color: string
  size: string
  qty: number
  price: number
  image: string
  gift?: GiftCardDetails
}
export interface Order {
  id: string
  email: string
  createdAt: string
  lines: OrderLine[]
  subtotal: number
  discount: number
  shipping: number
  total: number
  shippingMethod: string
  payment: string
  address: Omit<Address, 'id' | 'label'>
  status: 'Confirmed' | 'Packed' | 'Shipped' | 'Out for delivery' | 'Delivered'
}
export interface User {
  name: string
  email: string
  phone?: string
  birthday?: string
  children: { name: string; age: string }[]
  joinedAt: string
  tier: 'Purple Circle' | 'Circle Plus' | 'Circle Privé'
  points: number
  marketing: boolean
}

interface AccountState {
  users: Record<string, { user: User; pass: string }>
  current: string | null
  addresses: Record<string, Address[]>
  orders: Order[]
  register: (u: { name: string; email: string; password: string; marketing: boolean }) => { ok: boolean; message?: string }
  login: (email: string, password: string) => { ok: boolean; message?: string }
  logout: () => void
  updateProfile: (patch: Partial<User>) => void
  saveAddress: (a: Address) => void
  removeAddress: (id: string) => void
  placeOrder: (o: Order) => void
}

/* Not a security mechanism — this is a client-only demo store. */
const scramble = (s: string) => btoa(unescape(encodeURIComponent(`pu:${s}`)))

export const useAccount = create<AccountState>()(
  persist(
    (set, get) => ({
      users: {},
      current: null,
      addresses: {},
      orders: [],
      register: ({ name, email, password, marketing }) => {
        const key = email.trim().toLowerCase()
        if (get().users[key]) return { ok: false, message: 'An account with this email already exists. Sign in instead.' }
        const user: User = {
          name: name.trim(),
          email: key,
          children: [],
          joinedAt: new Date().toISOString(),
          tier: 'Purple Circle',
          points: 250,
          marketing,
        }
        set((s) => ({ users: { ...s.users, [key]: { user, pass: scramble(password) } }, current: key }))
        return { ok: true }
      },
      login: (email, password) => {
        const key = email.trim().toLowerCase()
        const rec = get().users[key]
        if (!rec || rec.pass !== scramble(password)) return { ok: false, message: 'That email and password don’t match. Please try again.' }
        set({ current: key })
        return { ok: true }
      },
      logout: () => set({ current: null }),
      updateProfile: (patch) =>
        set((s) => {
          const key = s.current
          if (!key || !s.users[key]) return s
          return { users: { ...s.users, [key]: { ...s.users[key], user: { ...s.users[key].user, ...patch } } } }
        }),
      saveAddress: (a) =>
        set((s) => {
          const key = s.current ?? 'guest'
          const list = s.addresses[key] ?? []
          let next = list.some((x) => x.id === a.id) ? list.map((x) => (x.id === a.id ? a : x)) : [...list, a]
          if (a.isDefault || next.length === 1) next = next.map((x) => ({ ...x, isDefault: x.id === (a.isDefault ? a.id : next[0].id) }))
          return { addresses: { ...s.addresses, [key]: next } }
        }),
      removeAddress: (id) =>
        set((s) => {
          const key = s.current ?? 'guest'
          return { addresses: { ...s.addresses, [key]: (s.addresses[key] ?? []).filter((x) => x.id !== id) } }
        }),
      placeOrder: (o) =>
        set((s) => {
          const key = s.current
          const users =
            key && s.users[key]
              ? { ...s.users, [key]: { ...s.users[key], user: { ...s.users[key].user, points: s.users[key].user.points + Math.floor(o.total / 100) } } }
              : s.users
          return { orders: [o, ...s.orders], users }
        }),
    }),
    { name: 'pu-account', storage: safeStorage },
  ),
)
export const useCurrentUser = () => useAccount((s) => (s.current ? s.users[s.current]?.user ?? null : null))

/* ---------------------------------------------------------------------------
   UI — drawers, overlays, toasts, quick add
   --------------------------------------------------------------------------- */
export interface Toast {
  id: number
  title: string
  body?: string
  image?: string
  kind?: 'success' | 'info' | 'error'
  duration?: number
  group?: string
  action?: { label: string; to?: string; onClick?: () => void }
}
interface UIState {
  cartOpen: boolean
  searchOpen: boolean
  navOpen: boolean
  quickAdd: string | null
  sizeGuide: Product['sizeSystem'] | null
  toasts: Toast[]
  lastAdded: number
  setCart: (v: boolean) => void
  setSearch: (v: boolean) => void
  setNav: (v: boolean) => void
  openQuickAdd: (h: string | null) => void
  openSizeGuide: (s: Product['sizeSystem'] | null) => void
  toast: (t: Omit<Toast, 'id'>) => void
  dismiss: (id: number) => void
  /** Pause / resume a toast's auto-dismiss while it is hovered or focused (WCAG 2.2.1). */
  holdToast: (id: number) => void
  releaseToast: (id: number) => void
  bumpAdded: () => void
}
let tid = 1
const TOAST_MS = 4800
const toastTimers = new Map<number, ReturnType<typeof setTimeout>>()
export const useUI = create<UIState>()((set, get) => ({
  cartOpen: false,
  searchOpen: false,
  navOpen: false,
  quickAdd: null,
  sizeGuide: null,
  toasts: [],
  lastAdded: 0,
  setCart: (v) => set({ cartOpen: v }),
  setSearch: (v) => set({ searchOpen: v }),
  setNav: (v) => set({ navOpen: v }),
  openQuickAdd: (h) => set({ quickAdd: h }),
  openSizeGuide: (s) => set({ sizeGuide: s }),
  toast: (t) => {
    const id = tid++
    const remaining = get().toasts.filter((x) => !t.group || x.group !== t.group).slice(-2)
    get().toasts.filter((x) => !remaining.includes(x)).forEach((x) => {
      clearTimeout(toastTimers.get(x.id))
      toastTimers.delete(x.id)
    })
    set({ toasts: [...remaining, { ...t, id }] })
    // A toast whose button is the only way to do something (e.g. "Undo") stays until dismissed,
    // so nobody runs out of time to reach it. Everything else auto-dismisses (WCAG 2.2.1).
    if (t.duration === undefined && t.action?.onClick && !t.action.to) return
    toastTimers.set(id, setTimeout(() => get().dismiss(id), t.duration ?? TOAST_MS))
  },
  dismiss: (id) => {
    clearTimeout(toastTimers.get(id))
    toastTimers.delete(id)
    set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }))
  },
  holdToast: (id) => {
    if (get().toasts.find((t) => t.id === id)?.duration !== undefined) return
    clearTimeout(toastTimers.get(id))
  },
  releaseToast: (id) => {
    if (get().toasts.find((t) => t.id === id)?.duration !== undefined) return
    if (!toastTimers.has(id)) return
    clearTimeout(toastTimers.get(id))
    toastTimers.set(id, setTimeout(() => get().dismiss(id), TOAST_MS))
  },
  bumpAdded: () => set({ lastAdded: Date.now() }),
}))
