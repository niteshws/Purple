# Purple United Kids — Redesign Demonstration

A working, multi-page e-commerce prototype prepared by PixelCrayons to show Purple United's leadership the proposed brand relaunch as a complete digital shopping experience.

> **Prototype.** No real orders, payments, emails or WhatsApp messages are processed. Simulated features are labelled in the interface with a small champagne dot ("demo-note").

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

Requires Node 20+. The app is a client-side SPA (React Router); when deploying, serve `index.html` for all routes.

## Homepage options

- **Option 1**: the original homepage, available at `/?home=1`.
- **Option 2**: the new editorial campaign homepage, available at `/?home=2`.
- Use **Homepage design** beside **Appearance** in the footer to switch. The selection is saved in this browser; existing navigation returns to the selected homepage.
- Option 2 is isolated in `src/pages/HomeOptionTwo.tsx` and `src/styles/home-option-two.css`. The original homepage and all inner page implementations are unchanged.
- Nine original campaign compositions (including three dedicated mobile photographs) and their responsive WebP sizes live in `public/img/home-option-two/`. Full desktop campaigns are 1920 × 1080, editorial portraits 1280 × 1600, and mobile campaigns 1080 × 1440. These are generated concept images, not photographs of actual inventory. Prompts and provenance are recorded in `docs/home-option-two-campaigns.json`.
- Motion respects reduced-motion preferences; campaign content and links remain visible without IntersectionObserver. Only the hero image loads eagerly; other photographs load on demand.

## Stack

- React 19 + TypeScript + Vite
- React Router 7 (client-side routing, lazy-loaded routes)
- Zustand (cart, wishlist, account, recently viewed, UI) persisted to `localStorage` with an in-memory fallback
- Plain CSS with design tokens (`src/styles/tokens.css`) — no UI framework

```
src/
  App.tsx              routes, layout, scroll restoration
  components/          Header + mega menu, mobile nav, search, cart drawer, size guide,
                       product card, footer, WhatsApp concierge, shared UI primitives
  data/                products, collections, stores (real), journal, verified site facts
  lib/                 hooks (meta/SEO, focus trap, reveal, validation) and commerce helpers
  pages/               every route (account/ for the customer area)
  store/               Zustand stores
  styles/              tokens, base, components, pages + per-area sheets
public/img/            all imagery, organised by campaign / editorial / lifestyle / brand / retail / products
```

## Where the content comes from

| Content | Source | Status |
|---|---|---|
| Products: names, prices, compare-at prices, photography | Purple United Kids storefront and product CDN | **Real** (colour variants grouped by style, with separate gallery and card WebPs) |
| Sizes, per-size stock, popularity, "added" dates | Generated deterministically | **Demo data** |
| Store locator: 130 stores, with addresses, hours and phones where published | Purple United's store locator and its published store list (Nov 2026) | **Real** — re-sync before launch |
| Contact, returns, refunds, FAQ, delivery times | purpleunited.com contact / refund-policy / faqs pages | **Real** (paraphrased) |
| Exact shipping fee below ₹499, express rate | Not published | **Demo rates**, flagged |
| Crest logo | PixelCrayons proposal p.16 (concept crest) | **Concept** — replace with master artwork |
| Campaign & editorial photography | PixelCrayons proposal art direction and generated photography based on supplied fashion references | **Concept imagery** |
| Flagship store walkthrough video (homepage "Visit us") | Supplied walkthrough film, re-encoded to 720p (5.0 MB) and 480p (2.6 MB) in `public/video/` | **Concept** store identity |
| Lifestyle photography | Purple United Kids banners and tiles, plus selected refreshed campaign and editorial images | Brand photography and concept imagery |
| Purple Circle tiers & benefits | Proposal p.26 | **Proposed / illustrative** |
| Ask Purple stylist | Rule-based scoring over the catalogue | **Simulated — not live AI** |
| WhatsApp concierge | Purple United's published number (+91 93193 91444) via wa.me links | Opens WhatsApp; nothing is sent automatically |

## Appearance (light / dark / auto)

- Switcher in the header (desktop), the mobile menu and the footer. Default is **Light**; **Auto** follows the device and updates live.
- The choice is saved in `localStorage` (`pu-theme`) and applied by an inline script in `index.html` before first paint, so there is no flash.
- Dark styling lives in `src/styles/theme.css`; components use semantic tokens (`--canvas`, `--accent`, `--accent-deep`, `--surface-hi`, `--glass`) defined in `tokens.css`.

## Motion

- Every route fades in; sections without hand-authored reveals rise in as they enter view; product, category, occasion and journal grids stagger in (`src/lib/hooks.ts` → `autoTag`). All of it is disabled under `prefers-reduced-motion`.

## Simulated flows

- **Checkout**: 5 steps + confirmation, full validation, mock payment (no card data is collected or stored).
- **Accounts**: registration, login and password reset are stored only in this browser.
- **Reviews**: no reviews are shown or invented; a customer's draft review is kept locally.
- **Newsletter / contact / try-on booking**: validated and confirmed on screen; nothing is sent.

## Not connected

Shopify (or any commerce backend), payments, inventory, email/SMS, WhatsApp Business API, maps API and analytics are intentionally not connected. The product data model (`src/data/products.ts`) mirrors what a Shopify Storefront API integration would return, so the UI can be wired to live data later.
