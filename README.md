# MATH_VISUAL_APP

## Vizy mobile learning

The default entry opens `learn.html`: a Hebrew/English, mobile-first prepared learning bank. Students predict, manipulate a local SVG model, answer, then transfer the idea to a changed question without a diagram. No runtime generative AI or external visualization SDK is needed.

The pilot includes 24 original activities in six families (12 free), local progress, optional sound/fireworks, avatars and a mountain trail. It is a starting bank, not a complete grades 9–11 curriculum. The advanced function workspace remains at `index.html?workspace=1`.

Shared services use Supabase Auth + RLS: private question requests, moderation, server-controlled content access, teacher-selected class assignments and real solo cohorts of up to eleven learners. **The new DB migration must be applied before these shared features work.** Payment checkout and prerecorded voices are not activated by this code alone.

- [Upgrade report and next improvements (Hebrew)](docs/UPGRADE_REPORT_HE.md)
- [Backend setup for the remote agent](docs/REMOTE_BACKEND_SETUP.md)
- [Kokoro voice handoff](docs/KOKORO_REMOTE_HANDOFF.md)

```bash
npm ci
npm run dev
npm test
npm run test:import
npx playwright install chromium webkit
npm run test:e2e -- --workers=1
npm run check:questions
npm run build
```

`npm run bank:build` regenerates the original pilot data and SQL seed. `scripts/import-question-candidates.py` extracts review drafts from supplied TXT/HTML/DOCX/PDF files with provenance; it does not publish or invent visual solutions. See the backend handoff for dependencies and use.

Personal progress is device-local; signed-in group completions are stored separately on the server. The server verifies numerical answers and duplicate awards; this is a learning game, not a secure examination system. Pilot premium source material is visible in this public repository: keep future exclusive commercial content in a private editorial store.

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

- `index.html` - default learning redirect and advanced function workspace
- `public/learn.html` - Vizy learning entry
- `public/` - static files copied as-is to build output
- `api/` - compatibility endpoints; old AI tutor/scan endpoints return HTTP 410
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

Runtime AI has been retired: `/api/tutor` and `/api/scan-question` return 410 even if old provider credentials remain configured. They do not contact a model. Content creation and review happen before publication, in Hagai's editorial workflow.
