import type { Product } from './products'

// Original styling concepts with generated photography. Prices, fabric
// specifications and inventory are demo data, not live Purple United SKUs.
// Keep this edit separate from the existing catalogue and homepage selections.
type TrendingLook = {
  handle: string
  name: string
  gender: 'boys' | 'girls'
  type: string
  price: number
  color: string
  hex: string
  description: string
  details: string[]
}

const looks: TrendingLook[] = [
  {
    handle: 'trending-denim-bow-cargo-set',
    name: 'Pearl Bow & Cargo Co-ord',
    gender: 'girls',
    type: 'Sets',
    price: 1999,
    color: 'Dusty Blue',
    hex: '#7895b0',
    description: 'A new styling concept: a pearl-detailed bow tee paired with flowing cargo trousers. A little polish, plenty of personality.',
    details: ['Two-piece set: short-sleeve tee and trousers', 'Bow appliqué with pearl-effect detailing', 'Wide-leg cargo trousers with flap pockets', 'Footwear and accessories shown are styling suggestions'],
  },
  {
    handle: 'trending-lilac-butterfly-cargo-set',
    name: 'Butterfly Embroidered Cargo Set',
    gender: 'girls',
    type: 'Sets',
    price: 1899,
    color: 'Lilac',
    hex: '#b9a0d1',
    description: 'A new styling concept: delicate butterfly and floral embroidery meets relaxed lilac cargos. Made for a wardrobe full of little discoveries.',
    details: ['Two-piece set: embroidered tee and cargo joggers', 'Butterfly and floral chest detailing', 'Elasticated trouser waist and cuffs', 'Footwear and accessories shown are styling suggestions'],
  },
  {
    handle: 'trending-daisy-ruffle-dress',
    name: 'Daisy Garden Ruffle Dress',
    gender: 'girls',
    type: 'Dresses',
    price: 2299,
    color: 'Lavender',
    hex: '#b8a0c6',
    description: 'A new styling concept: tiny daisies, soft ruffles and a beautifully gathered skirt. An occasion dress with all the ease of childhood.',
    details: ['Daisy print with ivory petals and yellow centres', 'Square neckline with ruffled bodice', 'Long puff sleeves and a tiered skirt', 'Tights, shoes and handbag shown are styling suggestions'],
  },
  {
    handle: 'trending-red-pocket-short-set',
    name: 'Pocket Tee & Cargo Shorts Set',
    gender: 'boys',
    type: 'Sets',
    price: 1699,
    color: 'Red & Navy',
    hex: '#b82729',
    description: 'A new styling concept: a rich red pocket tee and crisp navy cargo shorts. Confident colour for bright days and weekend adventures.',
    details: ['Two-piece set: short-sleeve tee and cargo shorts', 'Crew neck and chest patch pocket', 'Navy shorts with side flap pockets', 'Cap, socks and footwear shown are styling suggestions'],
  },
  {
    handle: 'trending-navy-zip-tracksuit',
    name: 'Signature Navy Zip Tracksuit',
    gender: 'boys',
    type: 'Sets',
    price: 2499,
    color: 'Navy',
    hex: '#242e47',
    description: 'A new styling concept: an understated navy tracksuit with a neat silver zip and a softly tapered fit. Easy layers with a refined finish.',
    details: ['Two-piece set: hooded zip jacket and joggers', 'Ribbed cuffs and jacket hem', 'Drawstring joggers with cuffed ankles', 'White tee and footwear shown are styling suggestions'],
  },
]

export const trendingProducts: Product[] = looks.map(({ color, hex, ...look }, i) => ({
  ...look,
  id: `PU-T${String(i + 1).padStart(3, '0')}`,
  departments: [look.gender],
  ageGroups: ['2-5', '6-9', '10-14'],
  colors: [{ name: color, hex, source: look.handle, imageCount: 3, images: [1, 2, 3].map((view) => `/img/products/${look.handle}-${view}.webp`) }],
  sizes: ['3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y', '8-9Y', '9-10Y', '10-11Y', '11-12Y', '12-13Y', '13-14Y'],
  sizeSystem: 'apparel',
  material: 'Cotton — concept specification for this demo',
  care: ['Wash cold with similar colours', 'Wash inside out to protect detailing', 'Do not bleach; dry in shade', 'Follow the garment care label'],
  collections: ['most-trending'],
  occasions: look.type === 'Dresses' ? ['celebration', 'special'] : ['everyday', 'weekend'],
  styles: look.type === 'Dresses' ? ['classic', 'playful'] : ['smart', 'playful'],
  popularity: 0,
  addedAt: '2026-11-18',
}))
