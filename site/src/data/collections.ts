import { products, type Product, type Department, type Occasion } from './products'

export interface Collection {
  handle: string
  title: string
  titleEm?: string
  eyebrow: string
  description: string
  image: string
  imageMobile?: string
  imagePosition?: string
  filter: (p: Product) => boolean
  related?: { label: string; to: string }[]
  note?: string
}

const inDept = (d: Department) => (p: Product) => p.departments.includes(d)
const inCollection = (c: string) => (p: Product) => p.collections.includes(c)
const forOccasion = (o: Occasion) => (p: Product) => p.occasions.includes(o)

export const collections: Collection[] = [
  {
    handle: 'all',
    title: 'Shop',
    titleEm: 'everything',
    eyebrow: 'The full wardrobe · 0–14 years',
    description: 'Clothing, footwear and the little extras, for newborns to early teens — all in one place.',
    image: '/img/campaign/wardrobe/shop-all.webp',
    imagePosition: '50% 30%',
    filter: () => true,
    related: [
      { label: 'Boys', to: '/collections/boys' },
      { label: 'Girls', to: '/collections/girls' },
      { label: 'Infants', to: '/collections/infants' },
      { label: 'Footwear & Accessories', to: '/collections/footwear-accessories' },
    ],
  },
  {
    handle: 'boys',
    title: 'Boys',
    eyebrow: 'Boys · 2–14 years',
    description: 'Hoodies, denim, cargos and jackets with an easy confidence — made to keep up.',
    image: '/img/campaign/wardrobe/shop-boys.webp',
    imagePosition: '50% 28%',
    filter: inDept('boys'),
    related: [
      { label: 'Jackets', to: '/collections/boys?type=Jackets' },
      { label: 'Jeans', to: '/collections/boys?type=Jeans' },
      { label: 'Sweatshirts & Hoodies', to: '/collections/boys?type=Sweatshirts+%26+Hoodies' },
      { label: 'Trousers', to: '/collections/boys?type=Trousers' },
    ],
  },
  {
    handle: 'girls',
    title: 'Girls',
    eyebrow: 'Girls · 2–14 years',
    description: 'Twirl-worthy dresses, everyday denim and soft layers — their personality, dressed with style.',
    image: '/img/campaign/wardrobe/shop-girls.webp',
    imagePosition: '50% 30%',
    filter: inDept('girls'),
    related: [
      { label: 'Dresses', to: '/collections/girls?type=Dresses' },
      { label: 'Jackets', to: '/collections/girls?type=Jackets' },
      { label: 'Trousers', to: '/collections/girls?type=Trousers' },
      { label: 'Tops', to: '/collections/girls?type=T-Shirts+%26+Tops' },
    ],
  },
  {
    handle: 'infants',
    title: 'Infants',
    eyebrow: 'Newborn to 24 months',
    description: 'Soft sets, first walkers and gentle layers for the very first chapters.',
    image: '/img/campaign/wardrobe/shop-infants.webp',
    imagePosition: '50% 40%',
    filter: inDept('infants'),
    related: [
      { label: 'Sets', to: '/collections/infants?type=Sets' },
      { label: 'Booties & first walkers', to: '/collections/infants?type=Booties' },
      { label: 'Jackets', to: '/collections/infants?type=Jackets' },
    ],
  },
  {
    handle: 'footwear-accessories',
    title: 'Head to toe,',
    titleEm: 'one Purple',
    eyebrow: 'Footwear & accessories',
    description: 'Sneakers, ballerinas, first walkers and the finishing touches — styled with every collection.',
    image: '/img/campaign/wardrobe/shop-footwear.webp',
    imagePosition: '50% 50%',
    filter: (p) => p.departments.includes('footwear') || p.departments.includes('accessories'),
    related: [
      { label: 'Sneakers', to: '/collections/footwear-accessories?type=Sneakers' },
      { label: 'Casual shoes', to: '/collections/footwear-accessories?type=Casual+Shoes' },
      { label: 'Booties', to: '/collections/footwear-accessories?type=Booties' },
      { label: 'Ballerinas', to: '/collections/footwear-accessories?type=Ballerinas' },
      { label: 'Soft toys', to: '/collections/footwear-accessories?type=Soft+Toys' },
    ],
    note: 'Bags, bows and sunglasses are part of the proposed relaunch range — to be confirmed with Purple United.',
  },
  {
    handle: 'new-arrivals',
    title: 'New',
    titleEm: 'in',
    eyebrow: 'Just landed',
    description: 'The latest pieces for the season ahead — warm knits, statement jackets and new-season shoes.',
    image: '/img/campaign/wardrobe/shop-new.webp',
    imagePosition: '50% 35%',
    filter: (p) => !!p.isNew || p.collections.includes('new-arrivals'),
  },
  {
    handle: 'best-sellers',
    title: 'Customer',
    titleEm: 'favourites',
    eyebrow: 'Most loved',
    description: 'The pieces families come back for, season after season.',
    image: '/img/campaign/wardrobe/shop-favourites.webp',
    imagePosition: '50% 30%',
    filter: inCollection('best-sellers'),
    note: 'Demo curation — ranking to be driven by live sales data at launch.',
  },
  {
    handle: 'winter-edit',
    title: 'The Winter',
    titleEm: 'Edit',
    eyebrow: 'New season · Winter 2026',
    description: 'Soft knits, warm fleece and jackets made for crisp mornings and festive evenings.',
    image: '/img/campaign/wardrobe/shop-winter.webp',
    imagePosition: '50% 35%',
    filter: inCollection('winter-edit'),
    related: [
      { label: 'Knits & hoodies', to: '/collections/winter-edit?type=Sweaters' },
      { label: 'Jackets', to: '/collections/winter-edit?type=Jackets' },
    ],
  },
  {
    handle: 'denim',
    title: 'The Denim',
    titleEm: 'Shop',
    eyebrow: 'Everyday denim',
    description: 'Wide-leg, straight, relaxed and cargo — denim that moves the way they do.',
    image: '/img/campaign/wardrobe/shop-denim.webp',
    imagePosition: '50% 40%',
    filter: (p) => p.collections.includes('denim') || p.material.toLowerCase().includes('denim'),
  },
  {
    handle: 'everyday-essentials',
    title: 'Everyday',
    titleEm: 'essentials',
    eyebrow: 'Shop by occasion',
    description: 'The easy, hard-wearing pieces for school runs, play dates and everything in between.',
    image: '/img/campaign/wardrobe/shop-everyday.webp',
    imagePosition: '50% 28%',
    filter: forOccasion('everyday'),
  },
  {
    handle: 'celebration-party',
    title: 'Celebration',
    titleEm: '& party',
    eyebrow: 'Shop by occasion',
    description: 'Frills, shimmer and smart layers for birthdays, parties and every reason to dress up.',
    image: '/img/campaign/wardrobe/shop-celebration.webp',
    imagePosition: '50% 12%',
    filter: forOccasion('celebration'),
  },
  {
    handle: 'festive-dressing',
    title: 'Festive',
    titleEm: 'dressing',
    eyebrow: 'Shop by occasion',
    description: 'Rich colours and warm textures for the season of lights, gatherings and family photographs.',
    image: '/img/campaign/wardrobe/shop-festive.webp',
    imagePosition: '50% 30%',
    filter: forOccasion('festive'),
  },
  {
    handle: 'weekend-adventures',
    title: 'Weekend',
    titleEm: 'adventures',
    eyebrow: 'Shop by occasion',
    description: 'Cargos, denim and sneakers made for parks, picnics and the long way home.',
    image: '/img/campaign/wardrobe/shop-weekend.webp',
    imagePosition: '50% 35%',
    filter: forOccasion('weekend'),
  },
  {
    handle: 'twinning-looks',
    title: 'Twinning',
    titleEm: 'looks',
    eyebrow: 'Shop by occasion',
    description: 'Unisex pieces made for brothers and sisters to wear together — matching, or just a little bit alike.',
    image: '/img/campaign/wardrobe/shop-twinning.webp',
    imagePosition: '50% 10%',
    filter: (p) => p.gender === 'unisex',
  },
  {
    handle: 'special-moments',
    title: 'Special',
    titleEm: 'moments',
    eyebrow: 'Shop by occasion',
    description: 'First birthdays, naming ceremonies and family portraits — dressed with care.',
    image: '/img/campaign/wardrobe/shop-special.webp',
    imagePosition: '50% 30%',
    filter: forOccasion('special'),
  },
]

export const collectionByHandle = new Map(collections.map((c) => [c.handle, c]))

export const occasionTiles = [
  { handle: 'everyday-essentials', label: 'Everyday Essentials', image: '/img/occasion/everyday-essentials.webp', pos: '50% 30%' },
  { handle: 'celebration-party', label: 'Celebration & Party', image: '/img/occasion/celebration-party.webp', pos: '50% 0%' },
  { handle: 'festive-dressing', label: 'Festive Dressing', image: '/img/occasion/festive-dressing.webp', pos: '50% 8%' },
  { handle: 'weekend-adventures', label: 'Weekend Adventures', image: '/img/occasion/weekend-adventures.webp', pos: '50% 12%' },
  { handle: 'special-moments', label: 'Special Moments', image: '/img/occasion/special-moments.webp', pos: '50% 22%' },
  { handle: 'twinning-looks', label: 'Twinning Looks', image: '/img/occasion/twinning-looks.webp', pos: '50% 14%' },
]

export const productsIn = (handle: string) => {
  const c = collectionByHandle.get(handle)
  return c ? products.filter(c.filter) : []
}
