export interface Article {
  slug: string
  category: 'Styling' | 'Milestones' | 'Seasonal' | 'Care' | 'Gift guides' | 'Our world'
  title: string
  dek: string
  image: string
  imagePos?: string
  readMins: number
  date: string
  body: { h?: string; p: string }[]
  shop?: { label: string; to: string }
}

/* Editorial copy written for the redesign demonstration in the proposed brand voice.
   Article titles are illustrative (see proposal p.29). */
export const articles: Article[] = [
  {
    slug: 'the-art-of-winter-layering',
    category: 'Styling',
    title: 'The art of winter layering',
    dek: 'Three easy layers that keep up from the school gate to the evening walk.',
    image: '/img/campaign/wardrobe/journal-winter.webp',
    imagePos: '50% 30%',
    readMins: 4,
    date: '2026-11-10',
    body: [
      { p: 'Winter dressing for children is really about one thing: being able to add and take away warmth without a fuss. Start light, finish with something that feels special, and let them choose the colour.' },
      { h: 'Start soft', p: 'A cotton tee or long-sleeve top sits next to the skin. Look for breathable fabrics and smooth seams, and keep it simple — the layers above will do the talking.' },
      { h: 'Add warmth', p: 'A knitted crew sweater or a fleece hoodie is the workhorse of the season. Crew necks layer neatly under jackets; hoodies are the weekend favourite.' },
      { h: 'Finish with a jacket', p: 'Denim for crisp mornings, a varsity for the playground, a quilted puffer when the temperature really drops. Choose one they can open and close on their own.' },
      { p: 'Room to move matters more than anything. If they are between sizes, go up — sleeves can be rolled, and there is always a growth spurt around the corner.' },
    ],
    shop: { label: 'Shop the Winter Edit', to: '/collections/winter-edit' },
  },
  {
    slug: 'dressing-for-the-first-birthday',
    category: 'Milestones',
    title: 'Dressing for the first birthday',
    dek: 'Soft fabrics, easy fastenings and one little detail worth photographing.',
    image: '/img/campaign/wardrobe/journal-birthday.webp',
    imagePos: '50% 35%',
    readMins: 3,
    date: '2026-10-28',
    body: [
      { p: 'A first birthday is a day for the album — and for a very busy one-year-old. The best outfit is the one they forget they are wearing.' },
      { h: 'Comfort first', p: 'Choose soft, breathable fabrics and easy openings for quick changes. Co-ord sets look polished and are simple to put on.' },
      { h: 'One special detail', p: 'A floral collar, a little bow, a pair of occasion booties. One detail is enough to make the photographs feel like an occasion.' },
      { h: 'Plan for the cake', p: 'Pack a second outfit. Trust us.' },
    ],
    shop: { label: 'Shop special moments', to: '/collections/special-moments' },
  },
  {
    slug: 'the-winter-edit-is-here',
    category: 'Seasonal',
    title: 'The Winter Edit is here',
    dek: 'Warm knits, rich wine tones and jackets made for festive evenings.',
    image: '/img/campaign/wardrobe/journal-party.webp',
    imagePos: '50% 30%',
    readMins: 3,
    date: '2026-11-05',
    body: [
      { p: 'This season is about warmth you can see: soft knits in lavender and red, fleece with bold colourblocking, and jackets that make an entrance.' },
      { h: 'Colours of the season', p: 'Wine, plum, lavender and ivory lead the edit, with navy and black for the everyday.' },
      { h: 'Made to be passed down', p: 'Choose pieces that work across occasions — a knit that goes to school on Monday and to dinner with grandparents on Sunday.' },
    ],
    shop: { label: 'Explore new arrivals', to: '/collections/new-arrivals' },
  },
  {
    slug: 'caring-for-knitwear',
    category: 'Care',
    title: 'Caring for knitwear, the gentle way',
    dek: 'Simple habits that keep sweaters soft through every growth spurt.',
    image: '/img/campaign/wardrobe/journal-knit.webp',
    readMins: 3,
    date: '2026-10-15',
    body: [
      { p: 'Knitwear rewards a little care. These habits keep it soft, shapely and ready to hand down.' },
      { h: 'Wash cool, inside out', p: 'A cold, gentle wash with similar colours protects the fibres and the finish.' },
      { h: 'Dry flat', p: 'Hanging a wet sweater stretches it. Lay it flat in the shade and reshape while damp.' },
      { h: 'Always check the label', p: 'Every garment carries its own care label — it is the final word on how to look after that piece.' },
    ],
    shop: { label: 'Shop knitwear', to: '/collections/winter-edit?type=Sweaters' },
  },
  {
    slug: 'the-new-arrival-gift-guide',
    category: 'Gift guides',
    title: 'The new-arrival gift guide',
    dek: 'Thoughtful gifts for baby showers, naming ceremonies and first visits.',
    image: '/img/brand/packaging-suite.webp',
    readMins: 4,
    date: '2026-10-02',
    body: [
      { p: 'A gift for a new baby should be soft, useful and a little bit beautiful. Here is how we would choose.' },
      { h: 'Soft sets', p: 'A co-ord set in a size or two ahead gives parents something to look forward to.' },
      { h: 'First walkers', p: 'Little shoes are always a joy to unwrap — and they arrive just when they are needed.' },
      { h: 'When in doubt', p: 'A gift card lets families choose the right size at the right time, online or in store.' },
    ],
    shop: { label: 'Explore gifting', to: '/gifting' },
  },
  {
    slug: 'from-a-label-to-life',
    category: 'Our world',
    title: 'From a label to life',
    dek: 'Our hang tags are made of seed paper. Plant one and watch it bloom.',
    image: '/img/brand/seed-tag.webp',
    readMins: 2,
    date: '2026-09-20',
    body: [
      { p: 'Purple United hang tags are already made of seed paper: plant the tag, water it, and it grows into flowers.' },
      { h: 'A ritual for children', p: 'Plant, water, watch it bloom — a small story children can be part of, long after the outfit is worn.' },
      { h: 'Share your bloom', p: 'Show us your planting moments with #gopurple.' },
    ],
    shop: { label: 'Read about our craft', to: '/craft' },
  },
]
export const articleBySlug = new Map(articles.map((a) => [a.slug, a]))
