/* ==========================================================================
   Ask Purple — shared stylist logic used by the /ask-purple page and the
   floating Ask Purple chat. Transparent, rule-based matching over the demo
   catalogue: every suggestion comes from the scoring rules below.
   ========================================================================== */
import {
  products,
  stockFor,
  formatINR,
  isProductSoldOut,
  allColorFamilies,
  colorFamiliesOf,
  type Product,
  type AgeGroup,
  type Occasion,
  type Style,
} from '../data/products'

export type Prefs = {
  age: string // '0-6m' | '6-12m' | '12-24m' | '2'..'14'
  gender: 'girl' | 'boy' | 'any'
  occasion: Occasion | ''
  styles: Style[]
  budget: number // per piece, 0 = no limit
  apparelSize: string // '' = auto
  shoeSize: string // '' = auto
  colors: string[]
}

export const DEFAULT_PREFS: Prefs = { age: '6', gender: 'any', occasion: '', styles: [], budget: 0, apparelSize: '', shoeSize: '', colors: [] }
export const PREFS_KEY = 'pu-ask-purple'

export const AGES = [
  { v: '0-6m', l: '0–6 months' },
  { v: '6-12m', l: '6–12 months' },
  { v: '12-24m', l: '12–24 months' },
  ...Array.from({ length: 13 }, (_, i) => ({ v: String(i + 2), l: `${i + 2} years` })),
]
export const OCCASIONS: { v: Occasion; l: string }[] = [
  { v: 'everyday', l: 'Everyday' },
  { v: 'celebration', l: 'Celebration & party' },
  { v: 'festive', l: 'Festive' },
  { v: 'weekend', l: 'Weekend adventures' },
  { v: 'special', l: 'Special moments' },
]
export const STYLES: { v: Style; l: string }[] = [
  { v: 'classic', l: 'Classic' },
  { v: 'sporty', l: 'Sporty' },
  { v: 'playful', l: 'Playful' },
  { v: 'smart', l: 'Smart' },
  { v: 'cosy', l: 'Cosy' },
]
export const BUDGETS = [
  { v: 1000, l: 'Up to ₹1,000' },
  { v: 2000, l: 'Up to ₹2,000' },
  { v: 3000, l: 'Up to ₹3,000' },
  { v: 5000, l: 'Up to ₹5,000' },
  { v: 0, l: 'No limit' },
]
export const KID_SIZES = ['2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y', '8-9Y', '9-10Y', '10-11Y', '11-12Y', '12-13Y', '13-14Y']
export const INFANT_SIZES = ['0-3M', '3-6M', '6-9M', '9-12M', '12-18M', '18-24M']
export const SHOE_SIZES = ['UK 5K', 'UK 6K', 'UK 7K', 'UK 8K', 'UK 9K', 'UK 10K', 'UK 11K', 'UK 12K', 'UK 13K', 'UK 1', 'UK 2', 'UK 3', 'UK 4', 'UK 5']
export const INFANT_SHOE_SIZES = ['0-6M', '6-12M', '12-18M']

export const isInfant = (age: string) => age.endsWith('m')
export function ageGroup(age: string): AgeGroup {
  if (isInfant(age)) return '0-2'
  const y = Number(age)
  return y <= 5 ? '2-5' : y <= 9 ? '6-9' : '10-14'
}
export function suggestApparel(age: string) {
  if (age === '0-6m') return '3-6M'
  if (age === '6-12m') return '9-12M'
  if (age === '12-24m') return '18-24M'
  const y = Math.min(13, Math.max(2, Number(age)))
  return `${y}-${y + 1}Y`
}
export function suggestShoe(age: string) {
  if (isInfant(age)) return age === '0-6m' ? '0-6M' : age === '6-12m' ? '6-12M' : '12-18M'
  const y = Number(age)
  const map: Record<number, string> = { 2: 'UK 7K', 3: 'UK 8K', 4: 'UK 10K', 5: 'UK 11K', 6: 'UK 12K', 7: 'UK 13K', 8: 'UK 1', 9: 'UK 2', 10: 'UK 3', 11: 'UK 4', 12: 'UK 5', 13: 'UK 5', 14: 'UK 5' }
  return map[y] ?? 'UK 1'
}

/** Pick the product size closest to the target, preferring in-stock sizes. */
function pickSize(p: Product, color: string, target: string): { size: string; exact: boolean } | null {
  if (p.sizeSystem === 'one-size') return stockFor(p, color, 'One size') > 0 ? { size: 'One size', exact: true } : null
  if (p.sizes.includes(target) && stockFor(p, color, target) > 0) return { size: target, exact: true }
  const ref = [...KID_SIZES, ...INFANT_SIZES, ...SHOE_SIZES, ...INFANT_SHOE_SIZES]
  const order = (s: string) => {
    const a = SHOE_SIZES.indexOf(s)
    if (a >= 0) return a
    const k = KID_SIZES.indexOf(s)
    if (k >= 0) return k
    const i = INFANT_SIZES.indexOf(s)
    if (i >= 0) return i
    return INFANT_SHOE_SIZES.indexOf(s) * 2
  }
  const t = order(target)
  const candidates = p.sizes.filter((s) => stockFor(p, color, s) > 0 && ref.includes(s))
  if (!candidates.length) return null
  candidates.sort((a, b) => Math.abs(order(a) - t) - Math.abs(order(b) - t))
  const best = candidates[0]
  if (Math.abs(order(best) - t) > 2) return null
  return { size: best, exact: false }
}

export type Slot = 'outfit' | 'top' | 'bottom' | 'layer' | 'shoes' | 'extra'
export type Pick = { p: Product; color: string; size: string; exact: boolean; score: number; reasons: string[]; slot: Slot }
export type Look = { title: string; items: Pick[] }
export type Recommendation = { looks: Look[]; ranked: Pick[]; all: Pick[]; apparelTarget: string; shoeTarget: string; total: number }

function slotOf(p: Product): Slot {
  if (p.departments.includes('footwear')) return 'shoes'
  if (p.type === 'Soft Toys') return 'extra'
  if (p.type === 'Dresses' || p.type === 'Sets') return 'outfit'
  if (p.type === 'Jackets') return 'layer'
  if (['Jeans', 'Trousers', 'Shorts & Skirts'].includes(p.type)) return 'bottom'
  return 'top'
}

export function recommend(prefs: Prefs): Recommendation {
  const group = ageGroup(prefs.age)
  const apparelTarget = prefs.apparelSize || suggestApparel(prefs.age)
  const shoeTarget = prefs.shoeSize || suggestShoe(prefs.age)
  const out: Pick[] = []
  for (const p of products) {
    if (isProductSoldOut(p)) continue
    if (!p.ageGroups.includes(group)) continue
    if (group === '0-2' && !p.departments.includes('infants')) continue
    if (group !== '0-2' && p.departments.includes('infants') && !p.departments.includes('accessories')) continue
    if (prefs.gender === 'girl' && p.gender === 'boys') continue
    if (prefs.gender === 'boy' && p.gender === 'girls') continue
    if (prefs.budget && p.price > prefs.budget) continue
    const reasons: string[] = []
    let score = p.popularity / 40
    // colour
    const fams = colorFamiliesOf(p)
    let color = p.colors.find((c) => !c.soldOut)!.name
    if (prefs.colors.length) {
      const hit = p.colors.find((c) => !c.soldOut && allColorFamilies.some((f) => prefs.colors.includes(f.name) && f.match.test(c.name)))
      if (hit) {
        color = hit.name
        score += 2
        reasons.push(`Comes in ${hit.name.toLowerCase()}`)
      } else if (!fams.some((f) => prefs.colors.includes(f))) score -= 1
    }
    const isShoe = p.departments.includes('footwear')
    const sz = pickSize(p, color, isShoe ? shoeTarget : apparelTarget)
    if (!sz) continue
    if (prefs.occasion) {
      if (p.occasions.includes(prefs.occasion)) {
        score += 3
        reasons.push(`Made for ${OCCASIONS.find((o) => o.v === prefs.occasion)!.l.toLowerCase()}`)
      } else score -= 2
    }
    const styleHits = prefs.styles.filter((s) => p.styles.includes(s))
    if (styleHits.length) {
      score += styleHits.length * 2
      reasons.push(`${styleHits.map((s) => STYLES.find((x) => x.v === s)!.l).join(' & ')} feel`)
    }
    if (prefs.budget) reasons.push(`${formatINR(p.price)} — within your budget`)
    reasons.push(sz.exact ? `In stock in ${sz.size}` : `Nearest available size: ${sz.size}`)
    if (p.isNew) {
      score += 0.5
      reasons.push('New this season')
    }
    out.push({ p, color, size: sz.size, exact: sz.exact, score, reasons, slot: slotOf(p) })
  }
  out.sort((a, b) => b.score - a.score)
  // Build up to two looks — each look stays coherent (one gender + unisex pieces)
  const used = new Set<string>()
  let lookGender: string | null = null
  const fits = (o: Pick) => !lookGender || o.p.gender === 'unisex' || o.p.gender === lookGender
  const claim = (o: Pick) => {
    used.add(o.p.handle)
    if (!lookGender && o.p.gender !== 'unisex') lookGender = o.p.gender
  }
  const take = (slot: Slot) => {
    const x = out.find((o) => o.slot === slot && !used.has(o.p.handle) && fits(o))
    if (x) claim(x)
    return x
  }
  const looks: Look[] = []
  for (let i = 0; i < 2; i++) {
    lookGender = null
    const items: Pick[] = []
    const outfit = out.find((o) => o.slot === 'outfit' && !used.has(o.p.handle))
    const top = out.find((o) => o.slot === 'top' && !used.has(o.p.handle))
    const bottom = out.find((o) => o.slot === 'bottom' && !used.has(o.p.handle) && (!top || top.p.gender === 'unisex' || o.p.gender === 'unisex' || o.p.gender === top.p.gender))
    const useOutfit = outfit && (!top || !bottom || outfit.score >= (top.score + bottom.score) / 2)
    if (useOutfit && outfit) {
      claim(outfit)
      items.push(outfit)
    } else {
      const t = take('top')
      const b = take('bottom')
      if (t) items.push(t)
      if (b) items.push(b)
    }
    const layer = take('layer')
    if (layer && items.length) items.push(layer)
    const shoes = take('shoes')
    if (shoes) items.push(shoes)
    if (!items.length) {
      const extra = take('extra')
      if (extra) items.push(extra)
    }
    if (items.length >= 2) looks.push({ title: i === 0 ? 'Look one' : 'Look two', items })
    else items.forEach((x) => used.delete(x.p.handle))
  }
  return { looks, ranked: out.slice(0, 8), all: out, apparelTarget, shoeTarget, total: out.length }
}

export function loadPrefs(): Prefs {
  try {
    const s = sessionStorage.getItem(PREFS_KEY)
    return s ? { ...DEFAULT_PREFS, ...JSON.parse(s) } : DEFAULT_PREFS
  } catch {
    return DEFAULT_PREFS
  }
}
export function hasSavedPrefs() {
  try {
    return !!sessionStorage.getItem(PREFS_KEY)
  } catch {
    return false
  }
}
export function savePrefs(p: Prefs) {
  try {
    sessionStorage.setItem(PREFS_KEY, JSON.stringify(p))
  } catch {
    /* storage unavailable — preferences stay in memory */
  }
}
export function clearPrefs() {
  try {
    sessionStorage.removeItem(PREFS_KEY)
  } catch {
    /* ignore */
  }
}

export const ageLabel = (age: string) => AGES.find((a) => a.v === age)?.l ?? age
export const occasionLabel = (o: Occasion | '') => (o ? OCCASIONS.find((x) => x.v === o)?.l ?? o : '')

/** One-line summary of the brief, e.g. "6 years · girl · festive · up to ₹2,000 a piece". */
export function summarize(p: Prefs) {
  return [
    ageLabel(p.age),
    p.gender === 'any' ? null : p.gender,
    p.occasion ? occasionLabel(p.occasion).toLowerCase() : null,
    p.styles.length ? p.styles.join(', ') : null,
    p.budget ? `up to ${formatINR(p.budget)} a piece` : null,
    p.colors.length ? p.colors.join(', ').toLowerCase() : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

/* --------------------------------------------------------------------------
   Free-text understanding for the chat. Plain keyword rules — it reads what
   it can (age, who, occasion, style, budget, colours, sizes) and asks for the
   rest. Returns only the fields it found.
   -------------------------------------------------------------------------- */
const WORD_NUM: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14 }
const OCCASION_WORDS: [RegExp, Occasion][] = [
  [/\b(birthday|party|parties|celebrat\w*)\b/, 'celebration'],
  [/\b(festive|festival|diwali|eid|christmas|xmas|holi|rakhi|puja|pooja|navratri|durga)\b/, 'festive'],
  [/\b(wedding|shaadi|sangeet|mehendi|mehndi|photo ?shoot|special|ceremony|formal|event)\b/, 'special'],
  [/\b(weekend|holiday|vacation|trip|travel|outing|park|picnic|adventure\w*)\b/, 'weekend'],
  [/\b(everyday|daily|school|play ?date|casual|day[- ]to[- ]day|home)\b/, 'everyday'],
]
const STYLE_WORDS: [RegExp, Style][] = [
  [/\b(classic|timeless|traditional|elegant)\b/, 'classic'],
  [/\b(sport\w*|active|athletic)\b/, 'sporty'],
  [/\b(playful|fun|bright|quirky|colourful|colorful)\b/, 'playful'],
  [/\b(smart|sharp|dressy|polished|preppy)\b/, 'smart'],
  [/\b(cos[yi]|cozy|comfy|comfortable|soft|relaxed|warm)\b/, 'cosy'],
]
const COLOR_WORDS: [RegExp, string][] = [
  [/\b(white|beige|cream|ivory|neutral\w*|pearl|peach|tan|off[- ]white)\b/, 'Neutrals'],
  [/\b(pink\w*|purple\w*|lavender|lilac|rose|violet|mauve)\b/, 'Pinks & Purples'],
  [/\b(blue\w*|navy|denim)\b/, 'Blues & Denim'],
  [/\b(red\w*|maroon|wine|rust|orange|burgundy)\b/, 'Reds & Wine'],
  [/\b(green\w*|olive|khaki|sage)\b/, 'Greens & Olive'],
  [/\b(black|grey|gray|charcoal)\b/, 'Black & Grey'],
  [/\b(gold\w*|yellow\w*|mustard)\b/, 'Golds & Yellows'],
]

export function parseMessage(raw: string): Partial<Prefs> {
  const t = ' ' + raw.toLowerCase().replace(/[’']/g, '').replace(/,(?=\d{3}\b)/g, '') + ' '
  const out: Partial<Prefs> = {}

  // Budget first, so its numbers aren't read as an age.
  let rest = t
  const money = t.match(/(?:₹|rs\.?|inr|under|below|upto|up to|less than|max(?:imum)?|budget(?: of| is)?)\s*(\d{3,6})(\s*k)?/) ?? t.match(/\b(\d{1,2})\s*k\b/) ?? t.match(/\b(\d{4,6})\s*(?:₹|rs|rupees|inr)?\b/)
  if (money) {
    let n = Number(money[1])
    if (money[2] || (/\bk\b/.test(money[0]) && n < 100)) n *= 1000
    if (n >= 300) {
      out.budget = BUDGETS.filter((b) => b.v).map((b) => b.v).find((v) => n <= v) ?? 0
      rest = t.replace(money[0], ' ')
    }
  }
  if (/\b(no (budget|limit)|any budget|money.{0,6}no object|doesnt matter)\b/.test(t)) out.budget = 0

  // Age
  const toNum = (s: string) => (/^\d+$/.test(s) ? Number(s) : WORD_NUM[s])
  const months = rest.match(/\b(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s*(?:-|to)?\s*(?:months?|mo|mths?)\b/)
  const yrs = rest.match(/\b(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen)\s*(?:-|\s)?\s*(?:years?|yrs?|y\.?o|year[- ]old)\b/) ?? rest.match(/\b(?:aged?|age is|turning|is)\s+(\d{1,2})\b/) ?? rest.match(/^\s*(\d{1,2})\s*$/)
  if (months) {
    const m = toNum(months[1])
    if (m !== undefined) out.age = m < 6 ? '0-6m' : m < 12 ? '6-12m' : m < 24 ? '12-24m' : String(Math.min(14, Math.floor(m / 12)))
  } else if (yrs) {
    const y = toNum(yrs[1])
    if (y !== undefined) out.age = y < 1 ? '6-12m' : y < 2 ? '12-24m' : String(Math.min(14, y))
  } else if (/\b(newborn|new born|new baby)\b/.test(t)) out.age = '0-6m'
  else if (/\b(baby|infant)\b/.test(t)) out.age = '6-12m'
  else if (/\btoddler\b/.test(t)) out.age = '2'
  else if (/\b(tween|preteen|pre-teen)\b/.test(t)) out.age = '11'
  else if (/\bteen(ager)?\b/.test(t)) out.age = '13'

  // Who
  const girl = /\b(girl|girls|daughter|niece|granddaughter|her|she|princess)\b/.test(t)
  const boy = /\b(boy|boys|son|nephew|grandson|him|he|his)\b/.test(t)
  if (girl && !boy) out.gender = 'girl'
  else if (boy && !girl) out.gender = 'boy'
  else if (/\b(either|both|any(one)?|everything|unisex|twins|doesnt matter)\b/.test(t) && !girl && !boy) out.gender = 'any'

  // Occasion
  for (const [re, o] of OCCASION_WORDS) if (re.test(t)) { out.occasion = o; break }

  // Style
  const styles = STYLE_WORDS.filter(([re]) => re.test(t)).map(([, s]) => s)
  if (styles.length) out.styles = Array.from(new Set(styles))

  // Colours
  const colors = COLOR_WORDS.filter(([re]) => re.test(t)).map(([, c]) => c)
  if (colors.length) out.colors = Array.from(new Set(colors))

  // Explicit sizes
  const kid = raw.toUpperCase().match(/\b(\d{1,2})\s*-\s*(\d{1,2})\s*Y\b/)
  if (kid && KID_SIZES.includes(`${kid[1]}-${kid[2]}Y`)) out.apparelSize = `${kid[1]}-${kid[2]}Y`
  const shoe = raw.toUpperCase().match(/\bUK\s*(\d{1,2})\s*(K?)\b/)
  if (shoe && SHOE_SIZES.includes(`UK ${shoe[1]}${shoe[2]}`)) out.shoeSize = `UK ${shoe[1]}${shoe[2]}`

  return out
}
