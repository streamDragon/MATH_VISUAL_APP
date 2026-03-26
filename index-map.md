# index.html Section Map
Total lines: ~15,272

---

## HTML HEAD & BOOT SCRIPTS (lines 1–263)
- 1–18: `<head>`, meta tags, title
- 19–130: Inline boot scripts (build token check, asset query, UI toast queue, sound fallback)
- 131–150: CDN scripts (JSXGraph 1.10.1, canvas-confetti 1.9.3)
- 151–262: `injectCoreAssets()` — dynamic CSS/JS loader, fallback logic
- 262: `</style>` closing early style block

---

## BODY OPENS + OPENING SPLASH (lines 264–293)
- 264: `<body class="prestart-only">`
- 266–282: `#opening-splash` — loading screen, video/poster, audio hint, "נגן שיר" button, skip button
- 284–285: `#sound-toggle`, `#btn-tools-menu`
- 286–292: `#side-quick-actions` — hidden quick-action buttons (builder, questions, scan, feedback, overlay, normal)
- 295–298: `#math-gym-popup`

---

## OVERLAY MODALS (lines 300–701)
- 300–312: `#win-overlay` — victory screen (icon, title, summary, XP, next-question button)
- 314–350: `#question-overlay` — full question card (essence, goal, visual, howto, mistake sections)
- 352–395: `#mobile-feed` — mobile navigation feed (search, chips, featured card, list)
- 398–420: `#video-modal` — video player overlay
- 422–454: `#feedback-modal` — feedback form (name, text, WhatsApp/email buttons, local list)
- 456–477: `#normal-lab-modal` — perpendicular line lab explainer
- 480: `#step-toast`
- 481–482: Hidden file inputs for scan (camera + file)
- 484–528: `#start-guide-modal` — onboarding tour (hero, logo, flow list, voice button, "כניסה לאפליקציה")
- 529–548: `#quick-tour-modal` — spotlight tour (video, step index, title, next/skip buttons, spotlight overlay)
- 551–581: `#initial-builder-modal` — parameter building intro
- 583–605: `#global-help-modal` — quick help with voice toggle
- 607–672: `#scan-modal` — "יש לי שאלה" (camera/upload/text input, preview, spinner, result, visual plan)
  - 620–623: Scan action buttons: `#btn-scan-camera`, `#btn-scan-upload`, `#btn-scan-text`
  - 627–631: `#scan-text-wrap` — text input area (`#scan-question-text`)
  - 633–635: `#btn-scan-analyze`, `#btn-scan-inject`
  - 647–665: `#scan-result` — result display (problem, structured summary, visual plan, subquestions)
- 674–700: `#scan-admin-modal` — admin config (proxy endpoint `#scan-api-endpoint`, model name)

---

## MAIN APP SHELL (lines 702–967)
- 702: `<div id="graph-area-wrapper">`

### LANDING SCREEN (lines 703–773)
- 703: `<section id="home-landing">`
- 704–714: `#home-hero` — hero section (kicker, title h1, hook question, subtitle, support text)
- 716–740: `#home-paths-section` — **3 entry path buttons** rendered into `#home-paths` (via JS)
- 741–753: Home info/features section
- 753–761: Home social proof / testimonials section
- 761–773: Home footer / additional info section

### QUESTION PICKER (lines 784–817)
- 784–792: `#home-question-picker` — question selector with "פתח את התרגיל שבחרתי" button
- 793–817: `#guided-shell` — guided start shell (title, question text, action, readout)
- 818: `#btn-return-home` — back to landing button (⌂)

### TOP BAR (lines 819–960)
- 819–843: `#top-function-bar` — function formula display (fx, dx, build badge, learner progress chip)
- 844–878: `#top-bar` — main top navigation bar:
  - `#top-brief-main` — mission brief
  - `#hot-cold-bar` — hot/cold feedback bar
  - `#top-clarity-title`, `#top-clarity-tip`
  - `#ai-mode-control` — AI mode buttons (local/cloud)
  - `#top-question-select-label` + question select dropdown
  - `#btn-clean-mode-toggle` — "מצב מתחילים"
  - `#btn-replay-opening`, `#btn-feedback`
- 907–912: `#question-progress-text`, `#practice-question-bar` (question index, practice mode header)
- 913–960: `#mobile-focus-card` — mobile question focus card (status, question title, step actions)

### GRAPH AREA (lines 961–967)
- 961–964: `#home-graph-preview` → `#graph-area` (JSXGraph renders here)
- 963: `#graph-live-region` — accessibility announcements
- 965: `</section>` closing home-landing

---

## SIDEBAR / DRAWER (lines 968–1232)
- 968: `<aside id="sidebar">`
- 969: `#drawer-handle` — toggle button
- 970–1003: `#acc-item-steps` — steps/mission panel:
  - `#q-title` — question title
  - `#mission-expanded-box` — expanded mission view
  - `#read-answer-input` — student answer input
  - `#btn-check-answer` — submit button
  - `#read-answer-feedback` — feedback text
  - `#exam-bridge-title`, `#exam-bridge-final` — exam bridge section
- 1004–1048: `#acc-item-formulas` — formula display panel
- 1049–1060: `#acc-item-tools` — normal line toggle (`#chk-normal`, `#normal-shift` slider)
- 1061–1232: `#acc-item-params` — parameter builder panel:
  - `#builder-template-type-note`
  - `#builder-formula-preview` (fx, dx previews)
  - Parameter sliders: `#inpA`–`#inpF` with chips `#chipA`–`#chipF`
  - `#builder-equation-auto`, `#builder-notebook-system-frame`
  - `#btn-notebook-clear-history`
  - `#builder-confirm-note`

---

## MAIN JAVASCRIPT (lines 1234–14449)
- 1234–1400: Config parsing, build stamp, localStorage keys init
  - Key localStorage vars defined ~line 1406–1514
- 1401–1837: App initialization helpers (entry flow params, sanitizers, progress)
- 1838–2100: Guided entry/tour system (quick tour, start guide setup)
- 2101–2437: Start guide logic (voice, onboarding state management)
- 2438–2684: Clean mode, practice mode, param question detection
- 2685–2830: Coach system (`buildCoachPayload`, `pushCoachWrongAttempt`)
- 2831–3120: Help modal system (help content, voice playback, show-me trigger)
- 3121–3562: Modal accessibility, onboarding state, first-time flow, lobby detection
- 3563–3840: `runEntryFlow()`, AdMob, remote version check
- 3841–3989: Learner progress (create, save, init — `createDefaultProgress`, `saveLearnerProgress`, `initLearnerProgress`)
- 3990–4185: Question position/progress helpers
- 4186–4534: Question select dropdown (`refreshTopQuestionSelect`)
- 4534–5019: Mobile feed system (manifest, items, chips, featured card, ticker, toggle)
- 5019–5095: `toggleMobileFeed`, runtime script loading
- 5095–5350: Template system (get, sync, populate, confirm)
- 5350–5609: Question logic (start template, goal instructions, step hints, question steps)
- 5609–5813: AI mode system (`normalizeAiMode`, `getRuntimeAiCapabilities`, `setAiMode`)
- 5814–6033: Graph accessibility (format values, announce updates)
- 6033–6349: Builder/notebook system (constraint helpers, render equations)
- 6349–6554: Viewport detection (`applyViewportClasses`, `updateResponsiveLayoutMetrics`)
- 6554–6830: Graph focus, probe Xs, runtime mode label
- 6830–7005: UI sync helpers (build copy button, question index display, accordion focus, overlay)
- 7006–7291: Step timer, scroll helpers, graph/builder visibility, mobile focus builder
- 7291–7420: Opening splash management (`hideOpeningSplash`, `retrySplashMusic`)
- 7422–7792: `bindAuditFlowEvents()` — main event binding (keyboard, resize, touch, UI interactions)
- 7793–8065: `queueBoardResize`, `updateParams` — graph rendering & param update loop
- 8066–8326: Normal line geometry helpers
- 8327–8640: Hot/cold feedback, heat colors, read-answer heat state
- 8641–8732: Win overlay (stars, confetti)
- 8734–8829: Normal toggle, lab guide
- 8830–9117: Question overlay content (success criteria, rich overlay)
- 9118–9192: `openQuestionOverlay`, `updateSpecialPanels`
- 9193–9663: Builder/notebook logic (auto-fill, constraints, equation rendering, solve)
- 9664–9896: Notebook history list, constraint evaluation, snapshot render
- 9897–9998: `parseStudentNumericInput`, **`submitReadAnswer()`** ← CORRECT/WRONG ANSWER HANDLER
  - **Line ~9956: Correct answer branch** (`readAnswerValidated = true`, shows ✅ toast)
  - **Line ~9984: Wrong answer branch** (`readAnswerValidated = false`, shows "עדיין לא")
- 9999–10091: `evalLegacyGoal`
- 10092–10183: `renderMissionExpandedHelp`
- 10184–10296: HTML escape, question short desc
- 10297–10444: `renderMobileFocusCard`
- 10445–10515: `goToNextQuestionFromWin` — **QUESTION COMPLETION HANDLER**
- 10516–10578: `evaluateCurrentStep` — step evaluation
- 10579–10638: UI feature flags (`isUiEnabled`)
- 10639–11017: Video modal system (normalize URL, show shell, open, close)
- 11018–11252: Feedback system (save, build text, share, delete, clear)
- 11253–11614: Scan question helpers (get manual text, secondary mode, toggle more options, admin config, proxy endpoint)
- 11615–11837: Scan config load, resolve input mode, trigger image input
- 11838–13207: Scan analysis logic:
  - 11839–11965: Number parsing, typed scan preferred params
  - 11966–12232: `inferTypedScanCategories`
  - 12233–12457: `buildTypedVisionPayloadFromText`
  - 12458–12680: Step building, visual skill registry
  - 12681–12935: `buildRawSubQuestionsFromVisualPlan`
  - 12936–13004: Recommended questions, skill completion
  - 13005–13207: **`renderScanVisualActionPlan`** — renders decomposed steps in scan result
- 13208–13375: **`callScanVisionApi`** — actual API call to `/api/scan-question`
- 13376–13525: Scan summary helpers
- 13526–13716: **`analyzeScannedQuestion()`** ← MAIN SCAN ANALYSIS ENTRY POINT
  - **~Line 13526–13600: Where question text becomes available after scan**
- 13717–13886: Easing, demo question helpers
- 13887–14113: Start guide modal open (`openStartGuideModal`), `startAppFromSplash`, initial builder
- 14114–14259: Session start (`markSessionStarted`), clean mode check
- 14260–14449: **`loadQ(idx, options)`** — load question by index (main question loader)
  - **~Line 14400+: Where question fully loads and app enters exercise mode**

---

## SECONDARY SCRIPT BLOCK (lines 14450–14499)
- 14450: `<script>` — loads external runtime scripts with fallback
- 14497–14499: Comment separator

---

## TUTOR / MASCOT SYSTEM (lines 14500–14560)
- 14497: `<!-- ========== TUTOR SECTION ========== -->`
- 14505–14508: `#tutor-container` wrapper (dir=rtl)
- 14509–14537: `#tutor-btn` — SVG mascot button:
  - Teacher hat (path)
  - `#tutor-eyes-normal`, `#tutor-eyes-happy`
  - `#tutor-blink-left` — blink animation path
  - `#tutor-mouth` — mouth path
  - `#tutor-bubble` — speech bubble div
- 14538–14555: `#tutor-panel` — chat panel (head, mode note, messages, input, send button)

---

## TUTOR CSS (lines 14561–14906)
- 14561: `<style>` — all tutor-specific styles
- 14561–14660: Tutor container, button, SVG, panel, message styles
- 14660–14695: Tutor state classes (.open, .bounce, .bob) + keyframes:
  - `@keyframes tutorBounce`
  - `@keyframes tutorBob`
  - `@keyframes tutorBreathe`
  - `@keyframes tutorDotBounce`
- 14695–14906: Tutor panel layout, messages, input, bubble styles

---

## TUTOR JAVASCRIPT (lines 14907–15272)
- 14907–14980: Version badge init, copy stamp
- 14981–15006: `loadHistory()` — load chat from sessionStorage
- 15007–15086: `buildLocalTutorReply(text)` — local (offline) tutor responses
- 15087–15200: `initChat()` — chat initialization, runtime config fetch
- 15201–15236: Input event handlers (keydown, auto-resize)
- 15237–15272: `scheduleBlink()`, `showBubble()`, and final init calls

---

## KEY TARGET LOCATIONS FOR PROMPTS

| Prompt | Target | Lines |
|--------|--------|-------|
| P1 Landing redesign | `#home-landing`, `#home-hero`, `#home-paths-section` | 703–773 |
| P2 New mascot HTML | After `#tutor-container` or new fixed div | ~14505 area or new |
| P3 Correct answer | Inside `submitReadAnswer()` success branch | ~9956–9983 |
| P3 Wrong answer | Inside `submitReadAnswer()` failure branch | ~9984–9990 |
| P3 Question complete | Inside `goToNextQuestionFromWin()` | ~10445–10515 |
| P3 App entry | Opening splash hidden, landing shown | ~7293–7340 |
| P3 Scan opens | `openScanModal()` or `beginScanQuestionFromLanding()` | ~4884–4914 |
| P4 Graph mobile | `#graph-area`, `#home-graph-preview` | ~961–964 (CSS) |
| P4 Answer input | `#read-answer-input`, `#btn-check-answer` | ~995–1000 |
| P5 Gamification init | After `initLearnerProgress()` call | ~3925 area |
| P5 Award points | `submitReadAnswer()` correct + `goToNextQuestionFromWin()` | ~9956 + ~10445 |
| P6 Scan decompose | After `analyzeScannedQuestion()` text available | ~13526–13600 |
| P6 Display result | `#scan-result`, `#scan-visual-plan-layers` | ~647–665 |
| P7 Research modal | New modal HTML + button in `#home-paths-section` | After 773 |
