# MATH_VISUAL_APP

Canonical app URL (Vercel, auto-deploys from `main`):
`https://math-visual-app-pi.vercel.app/`

GitHub Pages (`https://streamdragon.github.io/MATH_VISUAL_APP/`) is no longer a
full deployment — it cannot serve the `/api` serverless functions. It now hosts
only a redirect page to the Vercel URL (see `.github/workflows/deploy-pages.yml`).

## Open This Folder In VS Code / Studio

Open the local working copy directly (for example
`C:\Users\nlpis\wkspaces\MATH_VISUAL_APP`).

Do not work from a `\\wsl.localhost\...` UNC path — UNC paths can break npm,
Gradle, and Android Studio tooling on Windows.

## Clean Project Structure

- `index.html` - main app page
- `public/` - static files copied as-is to build output
- `api/` - Vercel serverless functions (cloud tutor, question scan)
- `scripts/` - build/sync helper scripts
- `dist/` - generated web build (Vite output, do not edit manually)
- `android/` - native Android project (Capacitor) for Android Studio

## Single Flow (Vite -> Capacitor -> Android Studio)

1. Build web app:
   `npm run build:web`
2. Sync web build into Android project:
   `npm run cap:sync`
3. Open Android Studio with the synced project:
   `npm run cap:open:android`

For local web development:
`npm run dev`

## Google Play Release Flow

1. Run:
   `npm run cap:sync`
2. Open Android Studio (`android/` project).
3. Build signed `.aab`:
   `Build -> Generate Signed Bundle / APK -> Android App Bundle`
4. Upload the `.aab` to Google Play Console.

## Web Deployment

Vercel builds and deploys automatically on every push to `main`
(`npm run build:web` -> `dist/`, plus the `api/` functions).
`BUILD_ID` and `BUILD_TIME` are stamped during the build.

Cloud AI features require environment variables on Vercel:

- `GEMINI_API_KEY` (or `GOOGLE_API_KEY`) — enables `/api/tutor`
- `ENABLE_CLOUD_SCAN_PROXY=1` — enables `/api/scan-question`
- `CLOUD_AI_DISABLED=1` — emergency kill switch for all cloud AI
- `CLOUD_AI_DAILY_REQUEST_CAP` — optional per-instance daily request cap
