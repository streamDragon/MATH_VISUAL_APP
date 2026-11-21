# Concept lenses integrated into Vizy: QA and handoff
Date: 2026-11-21. Local branch: main. **No remote push or Vercel deployment without explicit approval.**

## What changed
- Added a reusable `lens` inquiry stage to `VizyInvestigationCore`.
- Added one `עדשות על אותו דבר` link under the **existing** `כלים ועוד` drawer; no new home, no homepage promotion, no navigation changes.
- Added `vizy-concept-lens.js` + CSS, using the existing inquiry host, pinned/reopenable given, opening overlay styling, shared navigation and `VizyLtr`.
- Scene definitions register descriptions with `holds(state)`, `evidence`, `why`, `whyNot`, lens choices and their own drawing functions. The shared evidence/prediction/reflection engine is not specific to a third scene.
- Triangle starts at A=(0,6), B=(-5,0), C=(5,0), D=(0,0); height, median and angle bisector all valid. Evidence for median and bisector requires two independent hits. Drag mode A: preserve perpendicular foot; mode B: pin D to midpoint. Supporting-line lens does not change the geometry. The role `side` is false because AD is internal.
- Function scene starts at a=2 with f(a)=2/3, f′(a)=3. Shows a tangent step and signed rise/run, `Δy=0` at ±1, and a derivative-height lens at the same a. Both equality crossings near -1.261802 and 0.660123 are reachable through slider/drag snaps; there is **no answer-jump button**.
- The student must collect two distinct valid claims before making an ungraded multi-select prediction, then manipulate, then match a surviving description with the evidence that makes it true. Historical discoveries record their original labels, location, time and whether evidence was assisted; they persist across page reload. Current mathematical truth is recomputed live and can dim a formerly true discovery.
- First wrong evidence tap provides a cue; the second reveals evidence with `גילינו יחד`. Repeats show a direct line. No lost points, no native reset dialog.

## What was checked
- Playwright WebKit `mobile-iphone13`, Vite isolated local port 4217, screenshots at 320/390/430: **8/8 new activity tests passed**, including paired evidence, multiple predictions, both drag modes, lens preserving state, two equality crossings, ±1 zero-rise marker, reset, persistence and stage registration.
- `npm test`: **70/70 passed**.
- `npm run check:questions`: **21 validated**.
- `npm run build`: **passed**.
- Existing inquiry/home/visual browser regression: first concurrent run 19/23, with three stale 8-link expectations (now updated for 9) and an intermittent Escape failure. **Serial rerun of home and inquiry entry: 10/10 passed.** The visual tests passed in the first run. Initial Escape failure did not reproduce in isolation.
- Screen QA files: `qa/concept-lens/inquiry-{320,390,430}.png`, `qa/concept-lens/triangle-{320,390,430}.png`, and `qa/concept-lens/function-{320,390,430}.png`. The visible choices fit the first screen after removing inherited grid spacing; point coordinates use isolated LTR math.
- A real Android phone, live photo backend, and post-deployment service-worker refresh **were not checked for this integration**. Vizy was previously accessible by ADB in a different session, but that is not evidence for this new stage.

## Classroom observation
Observe whether a learner (1) finds a second true name for AD, (2) points to both required pieces of evidence, and (3) can explain why a claim survives one drag mode but not the other. Record the student's words and what was missed rather than merely counting right/wrong taps. Do not promote this to the home's primary action until after trial and explicit approval.

## Release status
Local main only. No push or deployment. Run all passing browser and Android checks again before authorizing a production push.

## Local trial link
While the local Vite server is running on the development PC, open `http://192.168.1.104:4198/problem-map.html?lesson=concept-lenses` on a phone on the same Wi-Fi. The PC LAN URL was tested as HTTP 200. This is **not** a public URL or a deployed version and may stop when the development server stops.
