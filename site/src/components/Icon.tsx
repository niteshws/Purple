/* Thin-line icon set — rounded ends, drawn on one 24 px grid (proposal p.19). */
import type { SVGProps, ReactElement } from 'react'

export type IconName =
  | 'bag' | 'gift' | 'size' | 'delivery' | 'heart' | 'heart-fill' | 'crown' | 'sparkle' | 'store'
  | 'search' | 'user' | 'menu' | 'close' | 'arrow' | 'arrow-left' | 'chevron-down' | 'chevron-right' | 'chevron-left'
  | 'plus' | 'minus' | 'check' | 'filter' | 'pin' | 'phone' | 'clock' | 'mail' | 'whatsapp' | 'zoom'
  | 'return' | 'leaf' | 'shield' | 'info' | 'alert' | 'trash' | 'edit' | 'instagram' | 'facebook' | 'linkedin'
  | 'chat' | 'star' | 'ruler' | 'grid' | 'list' | 'lock' | 'card' | 'cash' | 'upi' | 'logout' | 'box' | 'map' | 'direction'
  | 'play' | 'pause' | 'volume' | 'mute' | 'sun' | 'moon' | 'auto'

const paths: Record<IconName, ReactElement> = {
  sun: (<><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></>),
  moon: <path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10z" />,
  auto: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17z" fill="currentColor" stroke="none" /></>),
  play: <path d="M8 5.5v13l10.5-6.5z" />,
  pause: <path d="M8.5 5.5v13M15.5 5.5v13" />,
  volume: (<><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /></>),
  mute: (<><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path d="m15.5 9.5 5 5M20.5 9.5l-5 5" /></>),
  bag: (<><path d="M5.5 8h13l-1 12.5h-11z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></>),
  gift: (<><rect x="3.5" y="8.5" width="17" height="4" rx=".5" /><path d="M5 12.5v8h14v-8M12 8.5v12" /><path d="M12 8.5c-1.5-3-5-3.5-5-1.2C7 9 12 8.5 12 8.5zM12 8.5c1.5-3 5-3.5 5-1.2 0 1.7-5 1.2-5 1.2z" /></>),
  size: (<><rect x="2.5" y="8" width="19" height="8" rx="1" /><path d="M6.5 8v3M10 8v4M13.5 8v3M17 8v4" /></>),
  ruler: (<><rect x="2.5" y="8" width="19" height="8" rx="1" /><path d="M6.5 8v3M10 8v4M13.5 8v3M17 8v4" /></>),
  delivery: (<><path d="M2.5 6.5h11v10h-11zM13.5 10h4l3 3v3.5h-7" /><circle cx="6.5" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></>),
  heart: <path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z" />,
  'heart-fill': <path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z" fill="currentColor" />,
  crown: (<><path d="M4 17.5 3 8l5 4 4-6.5 4 6.5 5-4-1 9.5z" /><path d="M4.5 20.5h15" /></>),
  sparkle: <path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z" />,
  star: <path d="m12 4 2.4 5 5.4.7-4 3.7 1 5.4L12 16.3 7.2 18.8l1-5.4-4-3.7 5.4-.7z" />,
  store: (<><path d="M3.5 9.5 5 4.5h14l1.5 5" /><path d="M3.5 9.5a2.8 2.8 0 0 0 5.6 0 2.8 2.8 0 0 0 5.8 0 2.8 2.8 0 0 0 5.6 0" /><path d="M5 12v8h14v-8M10 20v-4.5h4V20" /></>),
  search: (<><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>),
  user: (<><circle cx="12" cy="8" r="3.8" /><path d="M4.5 20c.8-3.8 3.8-6 7.5-6s6.7 2.2 7.5 6" /></>),
  menu: <path d="M3.5 7h17M3.5 12h17M3.5 17h11" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  arrow: <path d="M4 12h15.5M14 6.5l5.5 5.5-5.5 5.5" />,
  'arrow-left': <path d="M20 12H4.5M10 6.5 4.5 12l5.5 5.5" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'chevron-right': <path d="m9 6 6 6-6 6" />,
  'chevron-left': <path d="m15 6-6 6 6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  filter: (<><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></>),
  pin: (<><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></>),
  map: (<><path d="m3.5 6.5 5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2z" /><path d="M9 4.5v13M15 6.5v13" /></>),
  direction: (<><path d="m12 3 9 9-9 9-9-9z" /><path d="M9.5 13.5V11h5M12.5 9l2 2-2 2" /></>),
  phone: <path d="M6.5 3.5h3l1.5 4-2 1.3a10 10 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" />,
  clock: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>),
  mail: (<><rect x="3" y="5.5" width="18" height="13" rx="1.5" /><path d="m3.5 6.5 8.5 6.5 8.5-6.5" /></>),
  whatsapp: (<><path d="M4 20l1.2-4A8.2 8.2 0 1 1 8 18.8z" /><path d="M9 8.5c0 3.5 2.8 6.5 6.5 6.5l1-1.5-2-1-1 .8c-1-.4-2.2-1.6-2.6-2.6l.8-1-1-2z" /></>),
  chat: (<><path d="M4 18.5V6a1.5 1.5 0 0 1 1.5-1.5h13A1.5 1.5 0 0 1 20 6v9a1.5 1.5 0 0 1-1.5 1.5H8z" /><path d="M8.5 9.5h7M8.5 12.5h4" /></>),
  zoom: (<><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2M11 8.5v5M8.5 11h5" /></>),
  return: (<><path d="M8.5 5 4.5 9l4 4" /><path d="M4.5 9h10a5 5 0 0 1 0 10h-6" /></>),
  leaf: (<><path d="M5 19c0-9 5-14 15-14 0 10-5 14-12 14" /><path d="M5 19c3-5 6-7.5 9.5-9" /></>),
  shield: (<><path d="M12 3.5 5 6v5.5c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6z" /><path d="m9 12 2 2 4-4" /></>),
  info: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8v.01" /></>),
  alert: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5v5.5M12 16v.01" /></>),
  trash: (<><path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" /></>),
  edit: (<><path d="M4.5 19.5h4l10-10-4-4-10 10z" /><path d="m13 7 4 4" /></>),
  instagram: (<><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><circle cx="12" cy="12" r="3.8" /><path d="M17 7v.01" /></>),
  facebook: <path d="M14 20.5v-7h2.5l.5-3h-3V8.6c0-.9.4-1.6 1.7-1.6H17V4.4a17 17 0 0 0-2.4-.2c-2.4 0-3.8 1.4-3.8 4v2.3H8.5v3h2.3v7" />,
  linkedin: (<><rect x="3.5" y="3.5" width="17" height="17" rx="2" /><path d="M8 10.5v6M8 7.5v.01M11.5 16.5v-6M11.5 13c0-1.6 1-2.6 2.4-2.6s2.1.9 2.1 2.6v3.5" /></>),
  grid: (<><rect x="4" y="4" width="6.5" height="6.5" /><rect x="13.5" y="4" width="6.5" height="6.5" /><rect x="4" y="13.5" width="6.5" height="6.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" /></>),
  list: <path d="M4 6.5h16M4 12h16M4 17.5h16" />,
  lock: (<><rect x="5" y="10.5" width="14" height="10" rx="1.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></>),
  card: (<><rect x="3" y="5.5" width="18" height="13" rx="1.5" /><path d="M3 9.5h18M6.5 15h4" /></>),
  cash: (<><rect x="2.5" y="6.5" width="19" height="11" rx="1" /><circle cx="12" cy="12" r="2.5" /><path d="M5.5 9.5v.01M18.5 14.5v.01" /></>),
  upi: (<><path d="M7 5.5 4 18.5M12 5.5 9 18.5" /><path d="m14.5 5.5 5 6.5-5 6.5" /></>),
  logout: (<><path d="M14 4.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 19.5h8" /><path d="M10.5 12h10M16.5 8l4 4-4 4" /></>),
  box: (<><path d="m12 3 8.5 4.5v9L12 21l-8.5-4.5v-9z" /><path d="m3.5 7.5 8.5 4.5 8.5-4.5M12 12v9" /></>),
}

export function Icon({ name, size = 22, className, strokeWidth = 1.5, ...rest }: { name: IconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`icon icon-${name}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {paths[name]}
    </svg>
  )
}
