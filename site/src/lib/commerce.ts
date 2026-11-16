import { getProduct } from '../data/products'
import { useCart, useUI, useWishlist } from '../store'

/** Add to bag with consistent feedback: toast + cart drawer + badge bump. */
export function addToBag(handle: string, color: string, size: string, qty = 1, opts?: { openDrawer?: boolean; silent?: boolean }) {
  const res = useCart.getState().add(handle, color, size, qty)
  const ui = useUI.getState()
  const p = getProduct(handle)
  if (!res.ok) {
    ui.toast({ kind: 'error', title: 'Couldn’t add to bag', body: res.message })
    return false
  }
  ui.bumpAdded()
  if (opts?.openDrawer !== false) ui.setCart(true)
  else if (!opts?.silent)
    ui.toast({
      title: 'Added to your bag',
      body: `${p?.name ?? ''} · ${color} · ${size}`,
      image: p?.colors.find((c) => c.name === color)?.images[0],
      action: { label: 'View bag', onClick: () => useUI.getState().setCart(true) },
    })
  return true
}

export function toggleWish(handle: string, color?: string) {
  const on = useWishlist.getState().toggle(handle, color)
  const p = getProduct(handle)
  useUI.getState().toast({
    kind: on ? 'success' : 'info',
    title: on ? 'Saved to your wishlist' : 'Removed from your wishlist',
    body: p?.name,
    action: on ? { label: 'View', to: '/wishlist' } : undefined,
  })
  return on
}
