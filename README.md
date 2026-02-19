# MATH_VISUAL_APP

Canonical app URL:
`https://streamdragon.github.io/MATH_VISUAL_APP/`

## Open This Folder In VS Code / Studio

Open:
`C:\code\MATH_VISUAL_APP`

Do not work from:
`\\wsl.localhost\Ubuntu\home\nlpis\code\MATH_VISUAL_APP`

UNC paths can break npm, Gradle, and Android Studio tooling on Windows.

## Clean Project Structure

- `index.html` - main app page
- `public/` - static files copied as-is to build output
- `scripts/` - build/sync helper scripts
- `dist/` - generated web build (Vite output, do not edit manually)
- `android/` - native Android project for Android Studio

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

## GitHub Pages Deployment

GitHub Actions workflow `.github/workflows/deploy-pages.yml` now:
1. installs dependencies
2. runs `npm run build:web`
3. deploys `dist/` to GitHub Pages

`BUILD_ID` and `BUILD_TIME` are stamped during CI build.
