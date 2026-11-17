/* Verified facts — sourced from purpleunited.com (pages/contact, pages/refund-policy,
   pages/faqs, pages/about-us) in November 2026. Anything not verified is labelled. */

import storeDirectory from './stores.json'

export const CONTACT = {
  company: 'Purple United Sales Limited',
  companyNote: 'Formerly known as Purple United Sales Private Limited',
  address: 'Tower 2, Ground Floor, Candor TechSpace, Plot No. 20 & 21, Sector 135, Noida, Uttar Pradesh 201304',
  phone: '+91 93193 91444',
  phoneHref: 'tel:+919319391444',
  email: 'connect@purpleunited.com',
  /* +91 93193 91444 is the number Purple United publishes for WhatsApp cancellations */
  whatsapp: '+91 93193 91444',
  whatsappHref: 'https://wa.me/919319391444',
  supportHours: 'Monday to Saturday, 9:30 AM – 6:30 PM',
  returnsAddress: 'Kh. No. 55/14 & 55/15, Mundka, Near Rani Khera Road, New Delhi – 110041',
  instagram: 'https://www.instagram.com/purpleunitedkidsofficial',
  facebook: 'https://www.facebook.com/purpleunitedkids',
  linkedin: 'https://www.linkedin.com/company/purple-united-sales-limited/',
}

export const STORE_COUNT = storeDirectory.length

export const POLICY = {
  returnWindowDays: 7,
  shipsWithin: '24–48 hours',
  deliveryTime: '3–7 business days, depending on location',
  smallOrderThreshold: 499,
  prepaidRefund: 'within 7 working days of the return being approved, to the original payment method',
  codRefund: 'by bank transfer, which may take 2–3 weeks (excluding weekends and bank holidays)',
}

export const FAQS: { cat: string; q: string; a: string }[] = [
  { cat: 'Sizing & products', q: 'What age range do you design for?', a: 'Purple United designs for newborns to 14-year-olds — infants, boys and girls — from everyday basics to partywear.' },
  { cat: 'Sizing & products', q: 'How do I choose the right size?', a: 'Every product page has a size guide with age, height and chest references. Sizes can vary slightly by style, so check the guide for each piece. If they are between sizes, choose the larger one for room to grow.' },
  { cat: 'Sizing & products', q: 'Is the infant range gentle on sensitive skin?', a: 'Our baby range uses soft, breathable fabrics chosen to be gentle on delicate skin. Always check the care and composition label on each garment.' },
  { cat: 'Sizing & products', q: 'What makes Purple United different?', a: 'Premium quality, thoughtful design and everyday comfort under one roof — clothing, footwear and accessories for every stage from newborn to 14.' },
  { cat: 'Orders & delivery', q: 'How long does delivery take?', a: 'Orders usually ship within 24–48 hours. Delivery typically takes 3–7 business days, depending on your location.' },
  { cat: 'Orders & delivery', q: 'How can I track my order?', a: 'Once your order ships, a tracking link is sent to you by SMS or email. Signed-in customers can also follow the order from My Account.' },
  { cat: 'Orders & delivery', q: 'Can I cancel my order?', a: 'Yes. Email connect@purpleunited.com or WhatsApp +91 93193 91444 with your order ID and reason. Orders cancelled before shipping receive a full refund; once shipped, a cancellation is treated as a return.' },
  { cat: 'Returns & exchanges', q: 'What is your return and exchange policy?', a: 'You can return or exchange unused items with tags intact within 7 days of receiving them. Size mismatches and defective items are eligible for a free replacement (conditions apply).' },
  { cat: 'Returns & exchanges', q: 'How do I start a return?', a: 'Raise a return from My Account or email connect@purpleunited.com with your order ID and the reason. Pickup is arranged where available; otherwise you can self-ship to our returns address.' },
  { cat: 'Returns & exchanges', q: 'When will I receive my refund?', a: 'Prepaid orders are refunded to the original payment method within 7 working days of the return being approved. Cash-on-delivery orders are refunded by bank transfer, which may take 2–3 weeks.' },
  { cat: 'Stores & gifting', q: 'Where can I shop Purple United?', a: `Shop online or visit one of our ${STORE_COUNT} stores across India. Use the store locator to find your nearest one.` },
  { cat: 'Stores & gifting', q: 'Do you offer gift cards?', a: 'Yes — gift cards are available for birthdays, baby showers and every celebration in between.' },
  { cat: 'Stores & gifting', q: 'Do you run sales or offers?', a: 'We run occasional promotions and early-access events, announced on our Instagram. Purple Circle members (proposed programme) would hear first.' },
]

export const NAV = [
  {
    label: 'New In',
    to: '/collections/new-arrivals',
    columns: [
      { title: 'New season', links: [
        { label: 'All new arrivals', to: '/collections/new-arrivals' },
        { label: 'The Winter Edit', to: '/collections/winter-edit' },
        { label: 'Customer favourites', to: '/collections/best-sellers' },
        { label: 'The Denim Shop', to: '/collections/denim' },
      ] },
      { title: 'By department', links: [
        { label: 'New for boys', to: '/collections/new-arrivals?dept=boys' },
        { label: 'New for girls', to: '/collections/new-arrivals?dept=girls' },
        { label: 'New for infants', to: '/collections/new-arrivals?dept=infants' },
        { label: 'New footwear', to: '/collections/new-arrivals?dept=footwear' },
      ] },
    ],
    feature: { image: '/img/editorial/sisters-pink.webp', eyebrow: 'Winter 2026', title: 'The Winter Edit', to: '/collections/winter-edit' },
  },
  {
    label: 'Boys',
    to: '/collections/boys',
    columns: [
      { title: 'Clothing', links: [
        { label: 'Shop all boys', to: '/collections/boys' },
        { label: 'Jackets', to: '/collections/boys?type=Jackets' },
        { label: 'Sweatshirts & hoodies', to: '/collections/boys?type=Sweatshirts+%26+Hoodies' },
        { label: 'Sweaters', to: '/collections/boys?type=Sweaters' },
        { label: 'Jeans', to: '/collections/boys?type=Jeans' },
        { label: 'Trousers & cargos', to: '/collections/boys?type=Trousers' },
        { label: 'T-shirts', to: '/collections/boys?type=T-Shirts+%26+Tops' },
      ] },
      { title: 'By age', links: [
        { label: 'Toddler · 2–5 years', to: '/collections/boys?age=2-5' },
        { label: 'Kids · 6–9 years', to: '/collections/boys?age=6-9' },
        { label: 'Juniors · 10–14 years', to: '/collections/boys?age=10-14' },
      ] },
    ],
    feature: { image: '/img/lifestyle/boy-street.webp', eyebrow: 'Boys', title: 'Made to keep up', to: '/collections/boys' },
  },
  {
    label: 'Girls',
    to: '/collections/girls',
    columns: [
      { title: 'Clothing', links: [
        { label: 'Shop all girls', to: '/collections/girls' },
        { label: 'Dresses', to: '/collections/girls?type=Dresses' },
        { label: 'Jackets', to: '/collections/girls?type=Jackets' },
        { label: 'Sweaters', to: '/collections/girls?type=Sweaters' },
        { label: 'Jeans', to: '/collections/girls?type=Jeans' },
        { label: 'Trousers & joggers', to: '/collections/girls?type=Trousers' },
        { label: 'Tops & tees', to: '/collections/girls?type=T-Shirts+%26+Tops' },
      ] },
      { title: 'By age', links: [
        { label: 'Toddler · 2–5 years', to: '/collections/girls?age=2-5' },
        { label: 'Kids · 6–9 years', to: '/collections/girls?age=6-9' },
        { label: 'Juniors · 10–14 years', to: '/collections/girls?age=10-14' },
      ] },
    ],
    feature: { image: '/img/editorial/two-girls-lilac.webp', eyebrow: 'Girls', title: 'Their own kind of style', to: '/collections/girls' },
  },
  {
    label: 'Infants',
    to: '/collections/infants',
    columns: [
      { title: 'Newborn to 24 months', links: [
        { label: 'Shop all infants', to: '/collections/infants' },
        { label: 'Sets & co-ords', to: '/collections/infants?type=Sets' },
        { label: 'Jackets', to: '/collections/infants?type=Jackets' },
        { label: 'Booties & first walkers', to: '/collections/infants?type=Booties' },
        { label: 'Soft toys', to: '/collections/infants?type=Soft+Toys' },
      ] },
      { title: 'Gifting', links: [
        { label: 'Gifts for new arrivals', to: '/gifting' },
        { label: 'Gift cards', to: '/gifting#gift-card' },
      ] },
    ],
    feature: { image: '/img/editorial/baby-knit.webp', eyebrow: 'Infants', title: 'Their very first chapters', to: '/collections/infants' },
  },
  {
    label: 'Footwear & Accessories',
    to: '/collections/footwear-accessories',
    columns: [
      { title: 'Footwear', links: [
        { label: 'Shop all footwear', to: '/collections/footwear-accessories' },
        { label: 'Sneakers', to: '/collections/footwear-accessories?type=Sneakers' },
        { label: 'Casual shoes', to: '/collections/footwear-accessories?type=Casual+Shoes' },
        { label: 'Ballerinas', to: '/collections/footwear-accessories?type=Ballerinas' },
        { label: 'Sandals & clogs', to: '/collections/footwear-accessories?type=Sandals+%26+Clogs' },
        { label: 'Booties & first walkers', to: '/collections/footwear-accessories?type=Booties' },
      ] },
      { title: 'Accessories', links: [
        { label: 'Soft toys', to: '/collections/footwear-accessories?type=Soft+Toys' },
        { label: 'Gift cards', to: '/gifting#gift-card' },
      ] },
    ],
    feature: { image: '/img/campaign/footwear-unboxing.webp', eyebrow: 'Head to toe', title: 'One Purple', to: '/collections/footwear-accessories' },
  },
  {
    label: 'Occasions',
    to: '/collections/festive-dressing',
    columns: [
      { title: 'Shop by occasion', links: [
        { label: 'Everyday essentials', to: '/collections/everyday-essentials' },
        { label: 'Celebration & party', to: '/collections/celebration-party' },
        { label: 'Festive dressing', to: '/collections/festive-dressing' },
        { label: 'Weekend adventures', to: '/collections/weekend-adventures' },
        { label: 'Special moments', to: '/collections/special-moments' },
        { label: 'Twinning looks', to: '/collections/twinning-looks' },
      ] },
      { title: 'Need a hand?', links: [
        { label: 'Ask Purple stylist', to: '/ask-purple' },
        { label: 'Gifting', to: '/gifting' },
        { label: 'Find a store', to: '/stores' },
      ] },
    ],
    feature: { image: '/img/editorial/a-little-extraordinary.webp', eyebrow: 'Festive', title: 'A little extraordinary', to: '/collections/festive-dressing' },
  },
  {
    label: 'Our Story',
    to: '/about',
    columns: [
      { title: 'Purple United', links: [
        { label: 'About us', to: '/about' },
        { label: 'Our craft', to: '/craft' },
        { label: 'The Journal', to: '/journal' },
        { label: 'Purple Circle', to: '/purple-circle' },
      ] },
      { title: 'Visit', links: [
        { label: 'Store locator', to: '/stores' },
        { label: 'Contact us', to: '/contact' },
      ] },
    ],
    feature: { image: '/img/retail/store-facade.webp', eyebrow: 'Our stores', title: 'A store that feels unmistakably Purple', to: '/stores' },
  },
]
