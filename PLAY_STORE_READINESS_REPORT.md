# Play Store Readiness Report

Audit date: 2026-03-27

## What Exists Now

- Web entry point: `index.html`
- Manifest linked from the app shell: `/manifest.json`
- Service worker registered from the app shell: `/service-worker.js`
- Source-of-truth PWA files for builds:
  - `public/manifest.json`
  - `public/service-worker.js`
- Runtime-facing PWA files at repository root:
  - `manifest.json`
  - `service-worker.js`
  - `offline.html`
  - `privacy.html`
- Offline fallback page exists and is publicly routable.
- Privacy policy page exists and is publicly routable.
- Icons exist in multiple sizes, including 192, 512, and maskable 512.
- Real screenshots exist:
  - `public/screenshots/functions-workplace.png` (`1200x801`, wide)
  - `public/screenshots/mobile-home.png` (`390x844`, narrow)
  - `public/screenshots/mobile-exercise.png` (`390x844`, narrow)
  - `public/screenshots/mobile-win.png` (`390x844`, narrow)
- The Android wrapper already exists under `android/`, and Capacitor points to `dist/` as `webDir`.
- Native Android release artifacts exist:
  - `android/app/build/outputs/bundle/release/app-release.aab`
  - `android/app/build/outputs/apk/release/app-release.apk`
- Premium UI, age gating, and Google Play Billing bridge now exist in the native Android app.

## What Was Fixed

- Added `display_override` to the manifest.
- Added a real wide screenshot to the manifest in addition to the existing narrow screenshots.
- Synced the root manifest with the build/source manifest so PWABuilder sees the same data that the build uses.
- Synced the root service worker with the better `public/` service worker implementation.
- Improved the service worker conservatively:
  - bumped the cache version
  - enabled navigation preload when available
  - ensured offline fallback stays explicit
  - ensured screenshots/icons referenced by the manifest are part of the app shell cache
- Synced runtime root assets so manifest references resolve from the repository root as well:
  - screenshots
  - icon sizes
  - shortcut icons
- Linked a dedicated Apple touch icon from `index.html` and added the asset to the build-facing `public/icons/` folder.
- Verified that all manifest icon/screenshot paths now resolve to real files.
- Rebuilt the app successfully with `npm run build`.
- Added a native Google Play Billing bridge for Android:
  - product catalog loading
  - purchase launch
  - purchase restore/sync
  - listener-based entitlement updates back into the web UI
- Registered the billing bridge in the Capacitor Android activity and added the official Billing library dependency.
- Switched the premium modal from "UI only" to a real Google Play purchase/restore flow inside the Android app.
- Standardized the initial product IDs expected by the app:
  - `premium_monthly`
  - `premium_lifetime`
- Tightened the monetization rules for mixed audience handling:
  - under 13 stays local-only
  - under 13 sees no ads
  - under 13 does not get purchase prompts
  - free 13+ can see ads later once real AdMob IDs are added
- Set AdMob initialization to request only `General` content rating when ads are eventually enabled.
- Rebuilt Android successfully with:
  - `assembleDebug`
  - `assembleRelease`
  - `bundleRelease`

## PWABuilder Items Resolved

- `Add screenshots to the manifest`
  - Resolved. Real screenshots now exist in both the build-facing assets path and the root runtime path, and the manifest declares them.
- `Add display_override to the manifest`
  - Resolved. Added a safe fallback chain: `window-controls-overlay`, `standalone`, `minimal-ui`.

## PWABuilder Items Intentionally Not Implemented

- `Add IARC rating to the manifest`
  - Not implemented automatically.
  - Reason: `iarc_rating_id` must contain a real rating/certificate value obtained through the actual content-rating flow. A placeholder would be incorrect.
  - Manual action:
    1. Complete the Google Play Console content rating questionnaire / IARC flow.
    2. If you receive a web-manifest-compatible IARC ID you want to expose, add it as `iarc_rating_id` in the manifest.

- `Add scope_extensions to the manifest`
  - Intentionally skipped.
  - Reason: the app currently uses a single-origin root scope (`scope: "/"`) and there is no evidence that install scope must be extended to additional origins or out-of-scope paths.

- `Add file_handlers to the manifest`
  - Intentionally skipped.
  - Reason: the app supports in-app upload/selection flows, but it does not currently define a stable OS-level "open this file type with the installed app" contract. Adding handlers now would overclaim capability and create review risk.

## What Still Blocks Packaging or Play Submission

- Manual content rating / IARC completion is still required.
- Google Play product setup is still required.
  - The code now expects Play Console products with these IDs:
    - `premium_monthly`
    - `premium_lifetime`
  - Until at least one of them exists in Play Console, the purchase button will open the modal correctly but cannot sell anything.
- Real AdMob production setup is still required.
  - `ADMOB_PRODUCTION_APP_ID` and `ADMOB_PRODUCTION_BANNER_ID` are still blank in `index.html`.
  - Android manifest metadata for the final AdMob app ID was intentionally not faked.
  - Result: the free tier is ready for ads in code flow, but ads remain effectively disabled until real IDs are provided.
- Google Play Data safety form still needs to be completed manually.
  - This app uses local storage/session storage, optional auth, and optional cloud/AI question-analysis flows, so the Play disclosure must be reviewed carefully against real production behavior.
- Google Play upload / publishing is still manual from this environment.
  - The release artifacts are built locally, but no authenticated Play Console / Android Publisher connection exists in this session.
- A final public privacy-policy URL on the production domain must be chosen and used in the Play listing.
  - The page exists in-repo, but Play submission needs the final hosted URL.
- Store listing graphics are still incomplete for Play listing readiness.
  - A `1024x500` feature graphic is not present in the repository.
- Listing/support metadata is still manual.
  - Support email
  - Store short description / full description
  - Final category / contact details in Play Console

## PWABuilder Warnings That Can Safely Be Ignored For Now

- `scope_extensions`
  - Safe to ignore unless the app must span additional origins/scopes outside `/`.
- `file_handlers`
  - Safe to ignore unless you explicitly want desktop-installed PWA file-open integration.

## Notes On Additional Opportunities

- The explicit "Additional Service Worker opportunity" should improve after rescanning because the runtime/root service worker is now aligned with the stronger `public/` version and includes preload + broader shell coverage.
- The explicit "Additional App Capabilities opportunity" may still remain, because no new app capability such as `file_handlers` was added intentionally.

## Exact File Paths Touched

- `index.html`
- `android/app/build.gradle`
- `android/app/src/main/java/com/nlpis/mathvisualapp/MainActivity.java`
- `android/app/src/main/java/com/nlpis/mathvisualapp/MathVisualBillingPlugin.java`
- `public/manifest.json`
- `manifest.json`
- `public/service-worker.js`
- `service-worker.js`
- `offline.html`
- `privacy.html`
- `public/icons/apple-touch-icon.png`
- `icons/icon-72.png`
- `icons/icon-96.png`
- `icons/icon-128.png`
- `icons/icon-144.png`
- `icons/icon-152.png`
- `icons/icon-192.png`
- `icons/icon-384.png`
- `icons/icon-512.png`
- `icons/icon-maskable-512.png`
- `icons/shortcut-practice.png`
- `icons/shortcut-scan.png`
- `screenshots/functions-workplace.png`
- `screenshots/mobile-home.png`
- `screenshots/mobile-exercise.png`
- `screenshots/mobile-win.png`
- `PLAY_STORE_READINESS_REPORT.md`
- `PLAY_STORE_ASSET_CHECKLIST.md`
