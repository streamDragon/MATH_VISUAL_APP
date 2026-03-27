# Play Store Asset Checklist

Audit date: 2026-03-27

## Ready Now

### Manifest / PWA assets

- Wide screenshot:
  - `public/screenshots/functions-workplace.png`
  - mirrored runtime copy: `screenshots/functions-workplace.png`
- Narrow screenshots:
  - `public/screenshots/mobile-home.png`
  - `public/screenshots/mobile-exercise.png`
  - `public/screenshots/mobile-win.png`
  - mirrored runtime copies under `screenshots/`
- App icons:
  - `public/icons/icon-192.png`
  - `public/icons/icon-512.png`
  - `public/icons/icon-maskable-512.png`
  - plus additional sizes `72, 96, 128, 144, 152, 384`
- Shortcut icons:
  - `public/icons/shortcut-practice.png`
  - `public/icons/shortcut-scan.png`
- Apple touch icon:
  - `public/icons/apple-touch-icon.png`
  - root runtime copy: `icons/apple-touch-icon.png`
- Privacy policy page exists:
  - `privacy.html`
  - `public/privacy.html`
- Offline page exists:
  - `offline.html`
  - `public/offline.html`

## Missing Or Still Manual

### Required / effectively blocking

- Real content rating / IARC completion
  - Missing artifact: actual content rating result from Google Play Console / IARC flow.
  - Why it matters: Play submission cannot finish without completing content rating.

- Google Play Data safety disclosure
  - Missing artifact: manual Play Console answers covering:
    - local/session storage
    - Supabase auth if enabled
    - optional cloud/AI question analysis / uploads
  - Why it matters: Play submission requires the form.

- Play feature graphic
  - Missing asset: `1024x500` PNG/JPG feature graphic
  - Current repo status: not found

- Final privacy-policy hosting target
  - Missing artifact: final public production URL used in the Play listing
  - Current repo status: page file exists, but the final listing URL is still a deployment choice

- Support/contact metadata
  - Missing artifact: final support email / contact details for the listing

## Recommended But Optional

### Screenshots

- Higher-resolution Play listing screenshots
  - Current repository screenshots are real and valid for manifest use.
  - They are relatively small (`390x844`) compared with common Play marketing capture sets.
  - Recommended optional asset set:
    - 3 to 8 polished phone screenshots at higher export resolution
    - tablet screenshots if tablet merchandising matters

### Icons / branding

- Final Play listing icon review
  - `public/icons/icon-512.png` is a strong candidate.
  - Recommended manual check:
    - branding/cropping
    - alpha/background treatment
    - readability at store size

### Audio / video listing assets

- Optional promo/listing video package
  - Relevant media already in repo:
    - `public/vizy-intro.mp4`
    - `public/opening-theme.mp4`
    - `public/help-videos/*.mp4`
    - `public/opening-poster.png`
  - Missing listing-specific asset:
    - a Play/marketing-ready promo video plan or curated trailer asset set
  - This is optional, not required for packaging.

## Safe To Ignore For Now

- `scope_extensions`
  - Ignore unless the app must intentionally extend install scope beyond `/`.
- `file_handlers`
  - Ignore unless you want OS-level "open file with app" behavior for installed PWAs.

## Suggested Next Manual Steps

1. Re-run PWABuilder against the deployed site after publishing the updated root files.
2. Create the Play feature graphic (`1024x500`).
3. Complete Play Console content rating / IARC and Data safety.
4. Decide the final production privacy-policy URL and support contact.
5. Optional: replace current screenshot set with higher-resolution marketing captures before store launch.
