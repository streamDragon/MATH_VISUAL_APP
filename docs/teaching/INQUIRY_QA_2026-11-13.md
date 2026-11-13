# Vizy in-app journey QA — 13 November 2026

Scope: verify the application as an actual student in a browser, not only its mathematical state machine.

## Production baseline tested

The public origin `https://math-visual-app-pi.vercel.app` responded HTTP 200 with the current Vizy inquiry overlay at the beginning of the audit. The alternate Vercel team-protected hostname redirected to Vercel sign-in, so the public site was used. Production baseline was commit `4ebb556`.

Playwright/Edge with iPhone 13 device emulation and viewport variations:
- An initial wrong graph criterion, attempted confirmation before moving the graph, vertical shift, reflection, and progression to moving-point prediction all worked.
- A student entering the fast lane but incorrectly treating an above-axis parabola as increasing on the whole line was returned to the investigation lane.
- The map rejected mistaken pattern identification and B=9, accepted B=-3, required A and B substitutions, and preserved progress across reload.
- First-screen answer controls stayed reachable without horizontal overflow at 320×568, 390×844, 904×407 landscape, and 1366×768.
- **Discovered and reproduced live production bug:** the difference-of-squares expert shortcut existed in the underlying prompt, but the first-decision overlay did not expose it. An experienced learner could not select the short proof path.

## Repair

`public/vizy-inquiry-entry.js` now exposes the existing `data-iq-shortcut` handler in the first-decision overlay. This is a shortcut to **show evidence**, not a shortcut to unearned mastery. Added a separate, clearly distinguished shortcut button style and invalidated the service-worker cache.

Regression test: `tests/vizy-real-journeys.spec.ts` contains five real-browser journeys, including the former failure, negative examples, persistence, and mobile landscape sizing.

After repair, **13/13 targeted tests** passed locally (the five journeys plus eight existing entry/investigation tests) using Chromium/Edge with iPhone device settings. `npm test`, `npm run check:questions`, and `npm run build` were rerun after the repair. Production behavior of the **new commit** must be checked separately after Vercel reports READY.

This is automated browser validation, not evidence of a supervised classroom trial or test on a physical Poco F6.
