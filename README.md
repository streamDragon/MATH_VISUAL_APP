# MATH_VISUAL_APP

## Current teaching direction and agent handoff

Read [the 12 November 2026 app audit and teaching handoff](docs/APP_AUDIT_AND_TEACHING_HANDOFF_2026-11-12.md) before continuing product work. Current focus: an individual mobile learner, Haggai's meaning-first teaching, and student photo submissions to his editorial inbox so the repertoire grows gradually. Full algebraic solutions are not required; an optional student notebook is acceptable. Classes/groups are a later phase. The report records current code, Graphify gaps, test evidence and concrete continuation criteria; it supersedes older roadmap priorities where they conflict.

## One mobile home and navigation (13 November 2026)

The agreed 13 November specification is the source of truth in [docs/teaching/AGREED_SPEC_2026-11-13.md](docs/teaching/AGREED_SPEC_2026-11-13.md). The 13 November consolidation keeps one visible next meaning activity per grade and one three-action navigation, with optional earlier tools in a single drawer. The guided-practice parabola for `f(x)=x²−4` is fixed to the actual given function instead of a draggable, misleading different function. See [implementation and verification](docs/teaching/CONSOLIDATION_IMPLEMENTATION_2026-11-13.md). The new single-stage interactive increasing lesson and general–particular U map are implemented on one inquiry engine. See [implementation and verification](docs/teaching/INQUIRY_IMPLEMENTATION_2026-11-13.md); the separate knowledge triangle remains a later design task.

## Meaning-first activities (12 November 2026)

The main mobile CTA chooses grade-appropriate meaning-first lessons in the **existing** problem-map flow: grade 11 increasing versus positive and tangent slope -4, grade 9 whole-expression difference of squares. Each supports multiple correct examples, explicit relationship sorting and unseen transfer; the grade-9 activity additionally builds factors without typed algebra. The original graph lab remains accessible at `/?workspace=1&splash=0`. Detailed state, testing scope and remaining photo/teacher backend verification: [implementation handoff](docs/VIZY_MEANING_IMPLEMENTATION_2026-11-12.md).

## Story Corner (13 November 2026)

An optional in-app story overlay about mathematical thinking: the traditional mathematician's kettle joke (explicitly not a verified Robert Aumann quotation), Gauss's sum legend, Sophie Germain's correspondence with Gauss, and Andrew Wiles's path to Fermat. The first bridge links the **familiar path** of expanding parentheses and collecting like terms to the general difference-of-squares identity and back to the specific expression. Students can read it without losing their place. Details and historical sources: [Story Corner implementation and editorial policy](docs/VIZY_STORY_CORNER_2026-11-13.md).

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

## Classroom practice: grades 9 and 11

The student entry is [Guided Classroom Practice](https://math-visual-app-pi.vercel.app/classroom-practice.html). From `learn.html` there is also a direct button. Four original lesson paths contain 22 staged questions: grade 9 functions/circles and grade 11 algebraic fractions/inequalities. Each route includes interactive SVG exploration, progressive hints without time pressure, step-by-step mastery, a final transfer problem initially hiding the diagram, local resume and a shareable deep link (`?topic=g11-fractions`, etc.). The content is not an official matriculation question bank and still requires teacher curriculum review.

The four paths share one small flow controller (`public/classroom-flow.js`) and one visual adapter (`public/classroom-visuals.js`). Author lesson content only in `public/classroom-activities.js`. Practice works without signing in; progress stays in the device's browser and the service worker caches the assets for return visits. No runtime generative AI, paid access checks or remote answer submission are involved.

Run `npm run test:classroom` for complete desktop/mobile student journeys, `npm test` for content/math checks and `npm run build` before deployment. The new `tests/classroom-flow.spec.ts` is also discovered by the existing GitHub Playwright CI workflow; no workflow permissions are needed.

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
