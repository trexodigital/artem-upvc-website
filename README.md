# ARTEM uPVC Windows and Doors — Sample Website

A one-page marketing website for ARTEM uPVC Windows and Doors (Lubao, Pampanga).
Plain HTML + CSS + JavaScript, so there's no build step and nothing to install.

> **Status: SAMPLE / PREVIEW for client approval.** Not the official ARTEM website.
> All photos and video are illustrative stock and the page is set to `noindex`.

**Live preview:** https://trexodigital.github.io/artem-upvc-website/

## Run it locally

You need any static web server. Pick one of these:

```bash
# Option A: Python (built into macOS). Works in Chrome/Edge/Firefox.
python3 -m http.server 5173

# Option B: Node. Also works in Safari/iPhone, because it supports video range requests.
npx serve .
```

Run either command inside the project folder, then open http://localhost:5173 (or the address `serve` prints).
Double-clicking `index.html` also mostly works, but a local server behaves more like the real thing.

## Publishing (GitHub Pages)

The site is served straight from the `main` branch root by GitHub Pages, so every push to `main` updates the
preview within a minute or two. Everything uses relative paths, so it works under the `/artem-upvc-website/` sub-path.

## Files

| File | What it is |
|---|---|
| `index.html` | Page structure and text |
| `css/styles.css` | All styling. Colors and fonts are set once at the top (`:root`) |
| `js/data.js` | **Edit this one.** Contact details, product list, photos, FAQ, project gallery |
| `js/main.js` | Interactions: menu, video, product tabs and popup, finish picker, quote form |
| `assets/` | Favicon, hero video (`video/`) and images (`img/`) |

## Where the information came from

Everything about the business comes from ARTEM's public Facebook page (checked Nov 2026):
- Products: sliding, casement, awning, fixed and corner windows; casement/French-type doors;
  double-glazed glass; shower enclosures; glass railings and curtain wall; skylights and canopies;
  office glass partitions; kitchen cabinets; uPVC and aluminum framing (from the cover photo).
- Finishes: white, black, laminated wood finish.
- Claims: no rust, no termites (anay), no warping/bulging (lobo), no rattling (alog), no yellowing,
  "British technology", 10-year warranty on profile, free quotation.
- Contact: Purok 1 Tokyo, Sto. Niño, Lubao, Pampanga · artemupvc.alumworks@gmail.com ·
  Novie 0961 286 7889 (Viber), Abby 0915 799 1159, Christian 0961 429 5035.

Nothing else was made up. In `js/data.js`, anything that still needs checking is marked `[CONFIRM]`.

## Visuals: all illustrative stock, clearly labelled

Every photo and video on the site is free-license stock, self-hosted in `assets/`. None of it is an ARTEM
project. The page labels it "Illustrative" wherever it appears (hero, products, finishes, gallery, footer).

- **Hero reel** (`assets/video/`): one edited, looping reel built from free Pexels clips
  (IDs 39576524, 37634863, 5835694, 7578541, 39105099, 40807457). Phones get a separate vertical cut
  that also uses 40074718, 34237018 and 40807351.
  - `hero-desktop.mp4` is 1920×1080, about 22 s and 6.5 MB.
  - `hero-mobile.mp4` is 720×1280, about 19 s and 2.8 MB.
  - The scene captions in the hero ("Floor-to-ceiling windows", etc.) are timed to these cuts in `js/main.js → SCENES`.
- **Product, finish and gallery photos** (`assets/img/`): Unsplash photos plus stills taken from the Pexels clips.
  Each image comes in two sizes, `<name>-800.jpg` and `<name>-1600.jpg`.
- **Design inspiration gallery:** 12 illustrative images, listed in `js/data.js → inspiration`.
- **Verified ARTEM installations:** empty for now. Add real photos to `js/data.js → projects` and an
  "ARTEM installations" block appears above the inspiration gallery automatically.
- **Logo:** a simple window-mark wordmark, not ARTEM's actual logo file.

Pexels and Unsplash licenses allow free commercial use without attribution. Credit lines are kept anyway, for honesty.

**Testing in Safari or on an iPhone:** Python's built-in server doesn't support the "range requests" Safari needs
for video. Preview with `npx serve .` instead. Real web hosts all support range requests.

## How the quote form works

There's no server, so nothing is stored. When a customer presses:
- **Messenger:** the message is copied to their clipboard and m.me/artemupvcwindowsanddoors opens. They paste and send.
- **Viber:** same idea, opening a Viber chat with 0961 286 7889 (needs Viber installed).
- **Email:** their email app opens with the message already written, addressed to artemupvc.alumworks@gmail.com.

To get submissions in an inbox automatically (with photo uploads), connect a form service
such as Formspree, Web3Forms or Netlify Forms. Each needs an account the owner sets up.

## Before going live

1. Owner confirms the `[CONFIRM]` items: hours, service area, which phone numbers are active,
   warranty terms, what "British technology" refers to, kitchen cabinet materials, project capacity.
2. Swap in ARTEM's real photos, video and logo where available (keep the same file names).
3. Set the real domain in `<link rel="canonical">` and the `og:image`.
4. Choose a form backend if you want automatic submissions.
