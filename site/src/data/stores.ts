/* Store network from Purple United's locator and published store list (Nov 2026).
   Address, hours and phone fields may be empty when details are unavailable. */
import raw from './stores.json'

export interface Store {
  id: string
  name: string
  address: string
  city: string
  state: string
  pincode: string
  hours: string
  phone: string
  isMall: boolean
}

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Gujarat', 'Haryana',
  'Jharkhand', 'Karnataka', 'Madhya Pradesh', 'Maharashtra', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]
const OVERRIDES: Record<string, { city: string; state: string }> = {
  Anantnag: { city: 'Anantnag', state: 'Jammu & Kashmir' },
  'Nanak Nagar Jammu': { city: 'Jammu', state: 'Jammu & Kashmir' },
  Jammu: { city: 'Jammu', state: 'Jammu & Kashmir' },
  Itanagar: { city: 'Itanagar', state: 'Arunachal Pradesh' },
  Malda: { city: 'Malda', state: 'West Bengal' },
  'Inorbit Mall, Mumbai': { city: 'Navi Mumbai', state: 'Maharashtra' },
  'Belapur, Mumbai': { city: 'Navi Mumbai', state: 'Maharashtra' },
  'Hoskote, Banglore': { city: 'Bengaluru', state: 'Karnataka' },
  'GAUR CITY MALL': { city: 'Greater Noida', state: 'Uttar Pradesh' },
  'Dhakoli Panchkula': { city: 'Zirakpur', state: 'Punjab' },
  Yamunanagar: { city: 'Yamunanagar', state: 'Haryana' },
  'BHUCHO MANDI': { city: 'Bathinda', state: 'Punjab' },
  'Amritsar Walk Sq.': { city: 'Amritsar', state: 'Punjab' },
  'Westwood Amritsar': { city: 'Amritsar', state: 'Punjab' },
  'Jalandhar': { city: 'Jalandhar', state: 'Punjab' },
  'Jaggi City Centre, Ambala': { city: 'Ambala', state: 'Haryana' },
  'Saguna (Patna)': { city: 'Patna', state: 'Bihar' },
  'Kankarbagh, Bihar': { city: 'Patna', state: 'Bihar' },
  'Muktsar, Punjab': { city: 'Sri Muktsar Sahib', state: 'Punjab' },
  'Sri Ganganagar , Ridhi Sidhi': { city: 'Sri Ganganagar', state: 'Rajasthan' },
  Patiala: { city: 'Patiala', state: 'Punjab' },
}
const CITY_FIX: Record<string, string> = {
  'Sahibzada Ajit Singh Nagar': 'Mohali',
  'New Delhi': 'New Delhi',
  Raurkela: 'Rourkela',
  'Vasai-Virar': 'Vasai',
  'Jaipur Nagar Nigam Area': 'Jaipur',
  Goniana: 'Bathinda',
  Handiaya: 'Barnala',
  Satyewala: 'Firozpur',
  'Ambala Cantt': 'Ambala',
  'Bhai Randhir Singh Nagar': 'Ludhiana',
  'Kolar Rd': 'Bhopal',
}

const titleCase = (s: string) =>
  s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\bMod\b/, 'MOD')
    .replace(/\bGms\b/, 'GMS')
    .replace(/\bGt\b/, 'GT')
    .replace(/\bTgip\b/, 'TGIP')
    .replace(/\bGs\b/, 'GS')
    .replace(/\bHsr\b/, 'HSR')
    .replace(/\bVrc\b/, 'VRC')
    .replace(/\bSc-140\b/i, 'SC-140')
    .replace(/\bNh-9\b/i, 'NH-9')
    .replace(/Intiriorz/, 'Interiorz')

function parse(r: { name: string; address: string; hours: string; phone: string; city?: string; state?: string }, i: number): Store {
  const pin = r.address.match(/\b(\d{6})\b/)?.[1] ?? ''
  let state = STATES.find((s) => r.address.includes(`${s} ${pin}`) || r.address.includes(`${s},`)) ?? ''
  let city = ''
  if (state) {
    const parts = r.address.split(',').map((x) => x.trim())
    const si = parts.findIndex((p) => p.startsWith(state))
    city = si > 0 ? parts[si - 1] : ''
    if (state === 'Delhi') city = 'New Delhi'
  }
  if (OVERRIDES[r.name]) ({ city, state } = OVERRIDES[r.name])
  city = r.city ?? CITY_FIX[city] ?? city
  state = r.state ?? state
  const name = titleCase(r.name)
  return {
    id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${i}`,
    name,
    address: r.address.replace(/, India$/, ''),
    city: city || 'Other',
    state: state || '',
    pincode: pin,
    hours: r.hours,
    phone: r.phone,
    isMall: /mall|plaza|square|centre|center|outlet|emporio|hub/i.test(r.address + r.name),
  }
}

export const stores = raw.map(parse)
export const storeById = new Map(stores.map((s) => [s.id, s]))
export const storeStates = Array.from(new Set(stores.map((s) => s.state).filter(Boolean))).sort()
export const storeCities = Array.from(new Set(stores.map((s) => s.city))).sort()
export const directionsUrl = (s: Store) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Purple United Kids ${s.address}`)}`
export const telHref = (phone: string) => `tel:+91${phone.replace(/\D/g, '').replace(/^0/, '')}`
