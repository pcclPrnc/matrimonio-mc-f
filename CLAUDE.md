# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Wedding website for Maria Cristina & Flavio (2 October 2026). React + Vite SPA deployed on GitHub Pages via GitHub Actions.

## Commands

```bash
npm run dev      # dev server (Vite HMR)
npm run build    # production build → dist/
npm run preview  # serve dist/ locally
```

**Deploy**: push to `main` → GitHub Actions builds with `VITE_BASE_PATH=/<repo>/` and publishes to `gh-pages` branch. No manual deploy step.

**Preview server** (Claude Code): defined in `.claude/launch.json` as `npm run dev --port 5747`.

## Architecture

### Data flow

All editable site content lives in `src/context/SiteContext.jsx` (`SITE_DEFAULTS` object). On load it merges: Firebase Realtime DB → localStorage cache → defaults. Writes go to both Firebase and localStorage via `updateSite(key, value)`.

**Key context helpers:**
- `updateSite(key, value)` — saves a top-level field
- `updateGraphic(page, key, patch)` — toggles SVG/photo visibility at `siteData.graphics.[page].[key].vis`
- `updateMedia(storageKey, url)` — saves a media URL at `siteData.media.[storageKey]`

### Design system (`src/designSystem.jsx`)

Single source of truth for all visual tokens. Always import from here — never hardcode colors or fonts.

- `COLORS` — `{ cream, olive, gold, rose, dark, card }` (can be overridden per-session via Admin palette)
- `FONTS` — `{ serif: Playfair Display, body: Cormorant Garamond, script: Dancing Script }`
- SVG components — `OliveB`, `Grape`, `BotDiv`, `Wine`, `Cake`, `Rings`, `Moon`, `Cocktail`, `Church`, `HeartSVG`

In pages, always merge palette overrides: `const C = { ...COLORS, ...(siteData.palette ?? {}) }`.

### SVG/image visibility pattern

Every decorative SVG on every page is controlled by `siteData.graphics.[page].[key].vis`. Pages read it as:

```jsx
const g = siteData.graphics?.home ?? {};
// render conditionally:
{g.rings?.vis !== false && <Rings color={C.gold} />}
```

Admin's `SecGrafici` section renders `SvgVisRow` for each, with a toggle + optional custom image upload (stored in `siteData.media["graphic_[page]_[key]"]`).

### Media upload

`src/services/githubApi.js` uploads to `public/media/{storageKey}.{ext}` in the GitHub repo via GitHub API, returning a `raw.githubusercontent.com` URL (no deploy needed for images). Credentials (PAT, owner, repo, branch) are stored in localStorage, admin-device only.

Fallback when GitHub not configured: base64 in localStorage (limited to small images).

`PhotoSlot` component (`src/components/PhotoSlot.jsx`) renders either a custom uploaded image or an SVG fallback, given `{ up: {url}, vis, edit, size, svg }` props.

### Pages & routing

`src/App.jsx` declares all routes. `src/components/Navbar.jsx` reads `siteData.ordineMenu` (array of labels) and `siteData.menuVisibility` for data-driven nav. To add a new page:
1. Add label→path to `ROUTE_MAP` in `Navbar.jsx`
2. Add label to `ordineMenu` and `menuVisibility` in `SITE_DEFAULTS` in `SiteContext.jsx`
3. Add `<Route>` in `App.jsx`
4. Add admin section + `SECTIONS` entry in `Admin.jsx`

### Admin panel (`src/pages/Admin.jsx`)

Self-contained dashboard at `/admin` (login: `admin` / `matrimonio2026`, overrideable via localStorage `admin_pwd`). Uses its own design tokens (object `A`) — no wedding fonts/colors inside.

Pattern for adding an editable section:
```jsx
function SecMySection({ siteData, updateSite }) {
  const [local, setLocal] = useState(siteData.myField ?? "");
  const save = () => updateSite("myField", local);
  return (
    <AdminSectionCard title="…">
      <AField label="…"><AInput value={local} onChange={e => setLocal(e.target.value)} /></AField>
      <button onClick={save} style={btn("primary")}>Salva</button>
    </AdminSectionCard>
  );
}
// then add to SECTIONS[] and content{} in Dashboard
```

### RSVP form

3-step wizard in `src/pages/RSVP.jsx`. Step 2 (menu/allergie) is skipped when `presenza === false`. On submit, sends JSON to `siteData.webhookUrl` (Google Apps Script) via `fetch` with `mode: "no-cors"`, then writes to Firebase `rsvpResponses` + localStorage.

**Known gotcha**: all `<button>` elements in the form must have `type="button"` to prevent accidental form submission.

### Firebase

`src/firebase.js` — initialises only when all `VITE_FIREBASE_*` env vars are present (`CONFIGURED` boolean export). When not configured, the site falls back to localStorage silently. Firebase credentials are injected as GitHub Actions secrets at build time.

### CSS classes

`src/index.css` defines a small set of utility classes used across pages:
- `.wc-dn` / `.wc-hb` — desktop nav / hamburger (toggled at 700px breakpoint)
- `.wc-card` — hover lift effect on info cards
- `.wc-nl` — animated underline on links
- `.wc-cta` — CTA button hover fill
- `.a0`–`.a3` — staggered fade-in animations

### SPA routing on GitHub Pages

`public/404.html` redirects unknown paths back to `index.html` with encoded query. `index.html` has the decoder script. Both must stay in sync for direct-URL navigation to work.

## Adding a new editable text field

1. Add default value to `SITE_DEFAULTS` in `SiteContext.jsx`
2. Read it in the page via `siteData.myField`
3. Add `AField` + `AInput` in the relevant `SecXxx` admin section, save with `updateSite("myField", value)`

## Adding a new SVG visibility toggle in Admin

1. Add entry under the correct page key in `DEFAULT_GRAPHICS` in `SiteContext.jsx`
2. Gate the SVG render with `g.[key]?.vis !== false` in the page
3. Add a `SvgVisRow` entry inside the correct `AccordionBlock` in `SecGrafici`
