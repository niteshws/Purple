# Purple United Kids: WCAG 2.2 AA Accessibility Audit

**Standard:** WCAG 2.2, Level A and AA
**Date:** 17 November 2026
**Build audited:** local dev build (`storefront-content-refresh` branch, plus two uncommitted fixes for footer icons and About videos)
**Design changes made:** none. This audit did not change any code or visual element.

---

## 1. Verdict

**The site is not WCAG 2.2 AA compliant today.** It has 17 failing success criteria. Most fixes are invisible and keep the approved design: attributes, focus handling, scroll padding and behaviour. Four groups of fixes would change what people see, so they are listed separately in **Section 4** for approval.

The site does a lot well:
- There is a skip link, and every page has a title.
- Overlays use dialogs that move focus in, trap it, close on Escape, and return focus.
- Checkout's errors move focus to the first problem and explain how to fix it.
- Pages reflow without horizontal scrolling at 320px.
- The carousel and videos have pause controls.
- Dark mode contrast is mostly good.

This audit does **not** certify compliance. Section 7 lists what was not tested, including real screen readers.

| | Count |
|---|---|
| Success criteria failing | **17** |
| Findings, total | **38** |
| Critical | 0 |
| High | 12 (9 invisible fixes, 3 needing design approval) |
| Medium | 12 (11 invisible fixes, 1 needing design approval) |
| Low | 14 (all invisible fixes) |
| Findings needing a visible design change (Section 4) | 4 (V1–V4). V5 repeats M7/M8 and affects focus rings only; V6 is optional. |

**Severity scale**
- **High:** blocks or seriously hampers a task for keyboard, screen-reader or low-vision users.
- **Medium:** a significant barrier, but there's a workaround.
- **Low:** a degraded experience, or a narrow failure.
- **Critical** would mean a complete blocker on a core path, such as checkout being impossible. None was found.

**Evidence labels:** **Live** means reproduced in the running site. **Code** means found by reading the source; confirm it before fixing.

---

## Remediation status (updated 17 Nov 2026)

The invisible fixes from Section 3 are now in the code. They are **not committed** yet. The look of the site is unchanged, apart from the standard keyboard focus ring now showing on headings that receive focus.

| Status | Items |
|---|---|
| ✅ Fixed and verified live | H1–H5, H8, H9 (Undo stays), M1, M2, M4, M9 (zoom keys), L1 (24px, same layout), L2, L3, L4, L5 |
| ✅ Fixed, checked in code and DOM | H6, H7, M5, M10, M11, L6–L14 |
| ⏸ Left on purpose | **M3**: the card fields keep `autocomplete="off"` while this is a demo that says "don't enter real card details". Switch to `cc-number`, `cc-name`, `cc-exp` and `cc-csc` when real payments are connected. |
| ✅ Fixed (approved): text on photos | **V3, extended sitewide.** Every piece of text drawn on a photo was re-measured on the real image pixels with its overlay, on 32 pages at 1440, 1280, 1024, 900 and 375px. Stronger overlays only where text sits: Login, Register and Reset caption (the eyebrow is now champagne; 1.2 → 5.4:1), home hero (tablet and narrow desktop), category and occasion tiles, "For her / For him", Gifting hero quote, Store locator hero. Every text-on-photo element now passes 4.5:1, or 3:1 for large text. |
| ✅ Fixed (approved): text colours | **V1, V2, V4.** Light-theme tokens only (dark mode keeps its own values):<br>• `--gold` `#9a7536` → `#82612b`<br>• `--ink-55` 58% → 68%<br>• new `--mauve-ink` `#8a5873` for mauve text (mauve fills unchanged)<br>• faint `--ink-40` text moved to `--ink-55` (disabled states stay faint, which WCAG exempts)<br>Also fixed: placeholders, selected-chip counts, store chip counts, Craft headings now ivory and step numbers champagne on wine, and the "For her / For him" inactive side now dims only its photos and heading. Re-scanned 22 pages in light and dark mode at 1440px, and 5 pages at 375px: no text on a solid background is under 4.5:1 (3:1 for large text), apart from disabled controls, which are exempt. |
| ⏳ Waiting for a decision | **M6 / D1**: carousel keyboard-focus pause. **M7, M8 (V5)**: focus-ring colours. |

After these fixes, the criteria still failing are:
- 1.4.3 Contrast (V1–V4)
- 2.4.7 and 1.4.11 focus rings (V5)
- 2.4.3 for the carousel only (D1)
- 1.3.5 for the demo card fields only (M3)

---

## 2. Method and coverage

### Pages tested live
- Home
- Collection (Girls)
- Product (Tee)
- Bag drawer and `/cart`
- Checkout steps 1–4: Contact, Delivery, Shipping, Payment
- Search results
- Sign in and Register
- Contact, Store locator, Store detail, Help, About
- Journal, Ask Purple, Gifting, Purple Circle, Craft, 404

### Viewports
- Desktop: 1440×900 and 1280×800
- Mobile: 375×812
- Reflow: 320×700
- Text at 200% (root font doubled, at 1280px)
- WCAG text-spacing override
- Light and dark themes

### Tools
- **Automated checks:** an in-browser script covering text contrast (including translucent layers), accessible names, label association, headings, landmarks, ID references, target sizes (24px rule with spacing exception) and reflow overflow. The axe-core CDN could not be loaded in this environment, so these checks were custom-written. They are not an axe or WAVE run.
- **Contrast on photos:** pixel sampling of the actual image behind each label, composited with the CSS gradient overlay. The tables report median and worst-10% contrast.
- **Keyboard:** real Tab, Shift+Tab, Enter and Escape key presses through the header, mega menu, product grid, bag drawer and checkout.
- **Source review:** a read-only pass of `site/src`, covering components, pages, hooks and CSS.

---

## 3. Findings that can be fixed without changing the design

These fixes change markup, attributes, focus behaviour or invisible spacing only. The approved look stays exactly the same.

### High

| # | Component | WCAG SC | Evidence | Issue | Recommended fix (invisible) |
|---|---|---|---|---|---|
| H1 | Sticky header, all pages (desktop) | 2.4.11 Focus Not Obscured (Minimum) | Live | Tabbing backwards through the product grid, the "Quick add" button was **fully hidden** behind the 148px sticky header. "Layered Frill Dress" was partly hidden. | Add `scroll-padding-top` to `html`, at least the sticky header height, so the browser scrolls focused items clear of it. |
| H2 | Mobile product page sticky "Select size" bar and the Concierge button | 2.4.11 Focus Not Obscured (Minimum) | Live, 320px | When the last size button gets focus, the sticky bottom bar covers it **completely**. The floating Concierge button also sits over the size grid. | Add `scroll-padding-bottom` equal to the sticky bar height on product pages, and apply the same to the floating button area. |
| H3 | Checkout step change (`Checkout.tsx`) | 2.4.3 Focus Order | Live | After "Continue to delivery / shipping / payment", focus falls to `<body>`. Keyboard and screen-reader users lose their place, and the new step is never announced. | After each step change, move focus to the new step's heading (`tabIndex={-1}`), and do the same for "Edit". |
| H4 | Desktop mega menu (`Header.tsx`) | 2.4.3 Focus Order, 2.1.1 Keyboard | Live | Opening a menu with Enter on its toggle, then pressing Tab, skips the menu links and goes to the next top-level item. The panel stays open while focus moves on. Only ArrowDown, which nothing tells users about, reaches the links. | Move focus into the panel when it opens from the keyboard, or place the panel right after its own toggle in the DOM. Close the panel when focus leaves the nav. |
| H5 | Bag drawer and `/cart` line image (`Overlays.tsx`) | 2.4.4 Link Purpose, 4.1.2, 1.1.1 | Live | The product image link contains only `<img alt="">`, so screen readers announce an unnamed link. | Give the image `alt` the product name, or remove the link from the tab order (`tabIndex={-1}`, `aria-hidden`), as `ProductCard` already does. |
| H6 | Home "Complete the look" thumbnails (`Home.tsx`) | 2.4.4, 4.1.2, 1.1.1 | Live | Three thumbnail links have no accessible name. | Same fix as H5. |
| H7 | Ask Purple result images (`AskPurple.tsx`) | 2.4.4, 4.1.2 | Code | The image link's only name is the rank digit ("1"). | Same fix as H5. |
| H8 | Mobile filter panel (`Collection.tsx`) | 2.4.3, 4.1.2 | Code | The panel is marked `role="dialog" aria-modal="true"`, but focus is not moved into it, trapped or returned. Tab can go behind the "modal". | Use the existing `useDialog` hook, which the bag drawer already uses successfully. |
| H9 | Toasts with actions such as "Undo remove" and "View bag" (`store/index.ts`) | 2.2.1 Timing Adjustable | Code | Toasts disappear after 4.8s, including the Undo action, and do not pause on hover or focus. They are also last in the DOM, so they are hard to reach by keyboard in time. | Keep action toasts open until dismissed, or pause the timer while hovered or focused. |

### Medium

| # | Component | WCAG SC | Evidence | Issue | Recommended fix (invisible) |
|---|---|---|---|---|---|
| M1 | Home page `<h1>` (`HeroCarousel.tsx`) | 1.3.1 Info and Relationships (best practice) | Live | The only `h1` is in slide 1. While other slides show (about 75% of the time), it is `inert` or hidden, so the page has **no h1**. | Add one permanent visually hidden (`sr-only`) `h1`, and make all slide headings `h2`. |
| M2 | Checkout delivery step | 3.3.7 Redundant Entry | Live | The delivery "Mobile number" is blank, even though the same number was entered one step earlier. | Pre-fill it from the contact step. The user can still edit it. |
| M3 | Checkout card fields (`Checkout.tsx`) | 1.3.5 Identify Input Purpose | Code | Card number, name, expiry and CVC use `autocomplete="off"`. | Use `cc-number`, `cc-name`, `cc-exp` and `cc-csc`. |
| M4 | Product review form (`Product.tsx`) | 3.3.1 Error Identification, 4.1.3 Status Messages | Code | Errors set `aria-invalid` but are not linked to the field, announced or focused. | Link each error with `aria-describedby`, and focus the first invalid field on submit, as checkout already does. |
| M5 | Quick-add panel, bag "Remove", review form open/close, newsletter success (`ProductCard`, `Overlays`, `Product`, `Footer`) | 2.4.3 Focus Order | Code | After these actions the focused control disappears and focus is lost. | Return focus to the trigger, or to a sensible next element. |
| M6 | Carousel and focus | 2.4.3 Focus Order | Code | If keyboard focus is on a slide's CTA when the slide changes, that slide becomes `inert` and focus drops to `<body>`. | **Needs your decision; see D1 in Section 5.** |
| M7 | Top announcement bar links | 2.4.7 Focus Visible, 1.4.11 Non-text Contrast | Live | The plum focus ring on the dark wine bar measures **1.28:1**, which is effectively invisible. | Use the champagne focus colour the footer already uses (8.89:1). This changes the focus ring only; listed again under V5. |
| M8 | Search overlay input | 2.4.7 Focus Visible | Code | `outline: none` with no replacement, so the text cursor is the only focus cue. | Add a focus ring. Focus-state only; listed again under V5. |
| M9 | Gallery zoom dialog (`Product.tsx`) | 2.1.1 Keyboard | Code | Zoom in the zoom view works by click only. | Add keyboard zoom: buttons, or +/- keys. |
| M10 | Account address book (`Dashboard.tsx`) | 1.3.5 | Code | Pincode, city, state and phone have no `autocomplete`. | Add `postal-code`, `address-level2`, `address-level1` and `tel`. |
| M11 | Newsletter form (footer) | 3.3.1, 4.1.3 | Code | The error is linked to the field but is not announced or focused after submit. | Focus the field on error, or put the error in a live region. |

### Low

| # | Component | WCAG SC | Evidence | Issue | Recommended fix (invisible) |
|---|---|---|---|---|---|
| L1 | Desktop nav chevron toggles | 2.5.8 Target Size (Minimum) | Live | 20×28px, overlapping the link by 2px, so they fail even with the spacing exception. | Enlarge the hit area to 24px with padding or a transparent pseudo-element. The icon looks the same. |
| L2 | Checkout | 1.3.1 (best practice) | Live | No `h1` on the checkout flow. | Add a visually hidden "Checkout" `h1`. |
| L3 | Heading jumps (PDP accordion, collection grid) | 1.3.1 | Live | `h1` jumps straight to `h3`. | Change the levels only; the CSS classes keep the same look. |
| L4 | Filter checkbox groups (Category, Type, Age, Colour) | 1.3.1 | Code | Groups have no group name. | Add `role="group"` with `aria-labelledby` pointing to the group's heading. |
| L5 | Field hints (phone, UPI, bank) and some error messages | 1.3.1 | Code | Hint text is not linked to its field. | Add the hint `id` to `aria-describedby`. |
| L6 | `aria-label` on plain `<div>`s (gallery, stars, chip wrappers) | 4.1.2 | Code | Assistive tech ignores an `aria-label` on an element with no role. | Add `role="group"`, or `role="img"` for the stars. |
| L7 | "For her / For him", Gifting budget, Size guide, gallery thumbnails | 4.1.2 | Code | They use the tab pattern without its keyboard support or `aria-controls`. | Use `aria-pressed` toggle buttons, or complete the full tab pattern. |
| L8 | Search overlay results, Gifting grid, Add-to-bag button | 4.1.3 Status Messages | Live and Code | Whole regions are live, so a screen reader re-reads entire result lists as the user types. | Announce only a short status, such as "12 results". |
| L9 | Quick-add button, "Complete the look" card | 2.5.3 Label in Name | Live and Code | The visible text ("Close", "Top …") isn't in the accessible name. | Make the `aria-label` start with the visible text. |
| L10 | Hero pause button, password show/hide | 4.1.2 | Code | Both the label and `aria-pressed` change, so it's announced as "Play slideshow, pressed". | Keep a fixed label with `aria-pressed`, or drop `aria-pressed`. |
| L11 | Concierge panel | 4.1.2 | Code | It isn't marked modal but traps Tab. | Either mark it modal or remove the trap. |
| L12 | Broken `aria-controls` (Appearance menu, store "Use my location" note) | 4.1.2 | Live | They reference elements that aren't rendered yet. | Only set `aria-controls` while the target exists. |
| L13 | Checkout review `<dl>` | 1.3.1 | Code | A `<button>` sits directly inside the `<dl>` grouping. | Move the Edit button outside the `<dl>` item. |
| L14 | Generic "Edit", "Remove" and quantity buttons in the bag | 2.4.6 / 2.4.4 (advisory) | Live | Several identical labels in a list. | Add the product name in visually hidden text ("Remove *Varsity Jacket*"). |

---

## 4. Fixes that need a visible design change: approval required

These failures can't be fixed without a visible change. Each one proposes the **smallest** change that passes. **None has been applied.**

### V1: Text colour tokens for small text (1.4.3 Contrast Minimum), High, Live

Normal-size text needs 4.5:1. These colour tokens fall short wherever they're used for text under 24px:

| Token | Used for | On Ivory `#f8f3eb` | On Paper `#fcfaf6` | On Oat-2 `#f1e9dc` | On Rose-2 `#f3e5e2` | Proposed value | New ratio range |
|---|---|---|---|---|---|---|---|
| `--gold` `#9a7536` | Eyebrows ("SHOP BY CATEGORY"), low-stock text, store names | 3.82 ❌ | 4.05 ❌ | 3.51 ❌ | 3.44 ❌ | `#82612b` (slightly deeper gold) | 4.63–5.45 ✅ |
| `--ink-55` (58% ink) | Was-prices, colour and age labels, header "Search" label, hints, breadcrumbs, muted copy | 3.61 ❌ | 3.68 ❌ | 3.50 ❌ | 3.48 ❌ | 68% ink | 4.57–4.93 ✅ |
| `--ink-40` (42% ink) | Filter option counts | 2.38 ❌ | 2.41 ❌ | 2.34 ❌ | 2.33 ❌ | 68% ink, as above | 4.57–4.93 ✅ |
| `--mauve` `#a8758f` | Signature lines ("Everyday moments, made special"), "Free to join" | 3.39 ❌ | 3.59 ❌ | 3.11 ❌ | 3.05 ❌ | `#8a5873` | 4.60–5.41 ✅ |
| Gold numbers on Wine (Craft page "01–04") | Step numbers | 3.99 ❌ (20px) | | | | Champagne `#d9b87a` (already in the palette) | 8.89 ✅ |
| Active search chip count `(n)` | Muted count inside the selected plum chip | **1.05** ❌ | | | | Ivory at 70% | ≈ 8 ✅ |

Passing for reference: `--ink-70` 5.12–5.58, Plum 10.7–12.6, Champagne on Wine 8.89, Ivory on Wine 15.25.

### V2: Craft page step headings are invisible (1.4.3), High, Live

"Tag", "Planted", "Blooming" and "Nurtured" render in Plum on the Wine section background at **1.28:1**, so they can't be seen at all. This looks like a missing on-dark style rather than an intended look. **Proposal:** use Ivory, like the section's other headings.

### V3: Text on photos, category and occasion tiles (1.4.3), High, Live

These were measured on the real image pixels with the existing gradient applied:

| Tile | Text size | Median | Worst 10% | Required |
|---|---|---|---|---|
| Category "Footwear" | 23px | **3.01** | 2.25 | 4.5 |
| Category "Accessories" | 23px | 6.94 | **2.60** | 4.5 |
| "Soft toys & finishing touches" | 13px | **3.54** | 2.74 | 4.5 |
| "Sneakers to first walkers" | 13px | **4.30** | 3.23 | 4.5 |
| Occasion "Celebration & Party" | 22px | **3.92** | 3.05 | 4.5 |
| Occasion "Special Moments" | 22px | **3.70** | 2.51 | 4.5 |
| Occasion "Everyday Essentials" | 22px | **4.25** | 3.27 | 4.5 |

**Proposal:** strengthen the existing bottom gradient on these tiles from about 62–66% to about 80% opacity at the base, or add a soft text shadow. Either changes the photo appearance slightly.

Passes: the hero on desktop is 8.5:1 or better (median) on all four slides. On mobile, the hero text sits on a solid plum panel.

### V4: "For her / For him" dimmed column (1.4.3), Medium, Live

The inactive column fades its product names, prices and types to **2.03–3.87:1** in light mode and 3.13:1 in dark mode. The text is still readable and its links can still be clicked, so it isn't exempt as "inactive". **Proposal:** dim only the image, and keep the text at full colour.

### V5: Focus-ring-only changes (2.4.7, 1.4.11), Medium, Live and Code

These only change how keyboard focus looks; nothing changes for mouse or touch users. Approval is recommended.
- Announcement bar links: switch the focus ring from plum (1.28:1) to champagne (8.89:1).
- Search overlay input: add the standard 2px focus ring.

### V6 (optional, not a failure): Colour swatches

Swatches are 22×22px. They pass 2.5.8 only through the spacing exception, which is borderline. A 24px size would remove the risk.

---

## 5. Decisions for you (not visual changes)

**D1: Hero carousel vs keyboard focus.** Earlier you asked for the hero to change slides automatically under every condition. That stays compliant with 2.2.2 because a pause button exists. However, if a keyboard user tabs onto a slide's "Shop" button and the slide changes, focus is lost (2.4.3).

The smallest compliant option is to pause **only while keyboard focus is inside the carousel**. Mouse hover would still never pause it, so it keeps the behaviour you asked for. Please confirm before this is changed.

**D2: 3-second slide interval.** This is not a failure, because a pause control exists. It is short for reading three lines of text, though. Consider 5–6s.

---

## 6. Success criterion results: WCAG 2.2 A and AA

✅ Pass · ❌ Fail · ➖ Not applicable · ⚠️ Pass with advisory / needs manual check

| SC | Name | Level | Result | Notes |
|---|---|---|---|---|
| 1.1.1 | Non-text Content | A | ❌ | Unnamed image links (H5–H7). Descriptive alt text elsewhere; decorative icons hidden. |
| 1.2.1 | Audio-only & Video-only | A | ⚠️ | Silent loop videos have descriptive `aria-label`s. Confirm they fully describe the content. |
| 1.2.2 | Captions (Prerecorded) | A | ➖ | No audio in any video. |
| 1.2.3 / 1.2.5 | Audio Description | A/AA | ➖ | No audio. Video-only is covered by 1.2.1. |
| 1.2.4 | Captions (Live) | AA | ➖ | |
| 1.3.1 | Info and Relationships | A | ❌ | Missing h1s, heading jumps, unnamed filter groups, unlinked hints (M1, L2–L5, L13). |
| 1.3.2 | Meaningful Sequence | A | ✅ | |
| 1.3.3 | Sensory Characteristics | A | ✅ | No shape- or position-only instructions found. |
| 1.3.4 | Orientation | AA | ✅ | No orientation lock in CSS or meta. Not tested on a physical device. |
| 1.3.5 | Identify Input Purpose | AA | ❌ | Card fields and account address book (M3, M10). Contact, address, login and register pass. |
| 1.4.1 | Use of Color | A | ✅ | Sold-out sizes use strike-through plus text label. Spot-checked. |
| 1.4.2 | Audio Control | A | ➖ | All video is muted. |
| 1.4.3 | Contrast (Minimum) | AA | ❌ | V1–V4. Needs design approval. |
| 1.4.4 | Resize Text | AA | ⚠️ | Pass via browser zoom: no clipping or overflow at 200%. Advisory: 146 text elements on Home use `px` sizes and ignore a user's browser font-size setting. |
| 1.4.5 | Images of Text | AA | ⚠️ | The Craft "From a label to life" artwork contains text. Confirm its alt text includes it, or that it counts as essential concept artwork. |
| 1.4.10 | Reflow | AA | ✅ | No horizontal scroll at 320px on Home, Collection, Product, Checkout, Stores and About. |
| 1.4.11 | Non-text Contrast | AA | ❌ | Announcement-bar focus ring 1.28:1 (M7). Global focus ring passes at 11.9:1 (plum) and 8.89:1 (champagne). |
| 1.4.12 | Text Spacing | AA | ✅ | No clipped text with WCAG spacing applied on Home, Product and Collection. |
| 1.4.13 | Content on Hover or Focus | AA | ✅ | Mega menu can be dismissed (Esc), hovered and stays open. |
| 2.1.1 | Keyboard | A | ❌ | Zoom is click-only (M9). Mega menu reachable only via ArrowDown (H4). |
| 2.1.2 | No Keyboard Trap | A | ✅ | Bag drawer traps Tab correctly and releases on Escape. |
| 2.1.4 | Character Key Shortcuts | A | ✅ | None found. |
| 2.2.1 | Timing Adjustable | A | ❌ | Action toasts (H9). |
| 2.2.2 | Pause, Stop, Hide | A | ✅ | Carousel and videos have pause controls. Videos pause off-screen. |
| 2.3.1 | Three Flashes | A | ✅ | No flashing content. |
| 2.4.1 | Bypass Blocks | A | ✅ | Skip link to `#main` works and becomes visible on focus. |
| 2.4.2 | Page Titled | A | ✅ | Unique, descriptive titles on all 20+ routes checked. |
| 2.4.3 | Focus Order | A | ❌ | H3, H4, H8, M5, M6. |
| 2.4.4 | Link Purpose (In Context) | A | ❌ | H5–H7. |
| 2.4.5 | Multiple Ways | AA | ✅ | Navigation, search, footer links, store locator. |
| 2.4.6 | Headings and Labels | AA | ⚠️ | Pass. Advisory on repeated "Edit/Remove" labels (L14). |
| 2.4.7 | Focus Visible | AA | ❌ | M7, M8. Everywhere else the global 2px ring is strong. |
| 2.4.11 | Focus Not Obscured (Minimum) | AA | ❌ | H1, H2: reproduced on desktop and mobile. |
| 2.5.1 | Pointer Gestures | A | ✅ | Swipe has button alternatives. |
| 2.5.2 | Pointer Cancellation | A | ✅ | Native click activation. |
| 2.5.3 | Label in Name | A | ❌ | L9. |
| 2.5.4 | Motion Actuation | A | ➖ | |
| 2.5.7 | Dragging Movements | AA | ✅ | Price filter is a native range input (click and keyboard work). |
| 2.5.8 | Target Size (Minimum) | AA | ❌ | Nav chevrons (L1). Swatches pass by the spacing exception (V6). |
| 3.1.1 | Language of Page | A | ✅ | `lang="en-IN"`. |
| 3.1.2 | Language of Parts | AA | ➖ | English only. |
| 3.2.1 | On Focus | A | ✅ | |
| 3.2.2 | On Input | A | ✅ | No auto-navigation on select or filter change. |
| 3.2.3 | Consistent Navigation | AA | ✅ | |
| 3.2.4 | Consistent Identification | AA | ✅ | |
| 3.2.6 | Consistent Help | A | ✅ | Concierge and footer contact appear in the same place on every page. |
| 3.3.1 | Error Identification | A | ❌ | Review form and newsletter (M4, M11). Checkout, login, register and contact pass well. |
| 3.3.2 | Labels or Instructions | A | ✅ | Advisory: required fields aren't marked; only optional ones are. |
| 3.3.3 | Error Suggestion | AA | ✅ | For example, "Enter a valid email address, like name@example.com." |
| 3.3.4 | Error Prevention (Legal, Financial, Data) | AA | ✅ | Checkout has a review step before placing the order. |
| 3.3.7 | Redundant Entry | A | ❌ | Delivery phone (M2). |
| 3.3.8 | Accessible Authentication (Minimum) | AA | ✅ | No CAPTCHA, paste allowed, show-password toggle, autocomplete set. |
| 4.1.2 | Name, Role, Value | A | ❌ | H5–H8, L6, L7, L10–L12. |
| 4.1.3 | Status Messages | AA | ❌ | M4, M11, L8. Bag count, results counts and toasts use `role=status` correctly. |

4.1.1 Parsing is obsolete in WCAG 2.2 and was not scored.

---

## 7. What was NOT tested, so compliance can't be claimed

- **Real screen readers:** NVDA, JAWS, VoiceOver (macOS and iOS) and TalkBack were not used. The names and roles above come from the DOM, not from listening to the output.
- **`prefers-reduced-motion`:** checked by code review only, because the test browser couldn't emulate it. Reveal, page-enter and hero zoom have overrides. Advisory:
  - Some hover-zoom transitions and JavaScript smooth-scrolling ignore the setting.
  - The hero still auto-advances, by your earlier decision.
- **Physical devices:** tablets and phones were simulated by viewport size (375, 320); 768px was not separately scanned. Windows High Contrast / forced-colours mode, speech input and switch access were not tested.
- **Pages not visited:** Account dashboard, orders and order detail, Wishlist, Journal article, Order confirmation (no order was placed), and the Size guide dialog. These were covered by code review only.
- **Automated rule coverage:** axe-core could not be loaded in this environment. The checks used were custom-written, so run axe DevTools or WAVE as a second opinion before sign-off.

---

## 8. Recommended priority

**1. This sprint (invisible, no approval needed)**
- H1 and H2: `scroll-padding-top` / `scroll-padding-bottom`.
- H3: focus the new checkout step.
- H4: mega menu focus.
- H5–H7: name the image links.
- H8: `useDialog` for the mobile filters.
- H9: action toasts.
- M1, M2, M3.
- Together these remove most of the High-severity barriers on the shopping path.

**2. Approval round (visible)**
- V1: colour tokens. One token change each; it affects text sitewide and is the single biggest contrast win.
- V2: Craft headings, which look like a bug.
- V3 and V4: photo text and the dimmed column.
- V5: focus rings only.

**3. Next sprint (invisible)**
- The remaining Medium and Low items.
- D1: carousel focus pause, once you confirm.

**4. Before claiming compliance**
- Screen-reader passes on NVDA + Chrome and VoiceOver + Safari (iOS) over browse → product → bag → checkout.
- An axe or WAVE scan.
- Retest every item above.
