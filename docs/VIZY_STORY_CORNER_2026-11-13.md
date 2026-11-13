# Vizy Story Corner — 13 November 2026

## Purpose
An optional mobile overlay presenting brief mathematician stories connected to a thinking action: recognize → connect to an already-known route → justify → apply. Opening it must not erase a student's current lesson or answer state.

## Entrypoints
The story appears from the Vizy learning-home header and secondary tools, and within the meaning-weave lessons, especially grade-nine difference of squares. Other activities can add a button with class story-corner-trigger and data-story="kettle" (or another story ID). The renderer delegates click handling and remains independent of the lesson engines.

## Authored stories and accuracy
1. Mathematician's kettle: an old mathematical joke about reducing a new problem to a solved case, NOT a verified quote from Robert Aumann. Haggai recalls Aumann telling a variant, but attribution was not independently confirmed. The first bridge is expansion and collecting like terms; only after that comes the shortcut A²−B²=(A−B)(A+B), with the specific expression (x+1)²−9.
2. Young Gauss and 1..100: famous legend, historically uncertain. Pairing the first/last numbers reveals identical sums of 101.
3. Sophie Germain / M. LeBlanc: historically documented correspondence with Gauss. Focus on arguments rather than authority.
4. Andrew Wiles / Fermat: historically documented proof route via modularity. A bridge to another mathematical problem does NOT imply that the remaining proof is easy.

## References
Kettle: https://hsm.stackexchange.com/questions/14189/origin-of-the-teakettle-principle-joke
Gauss: https://epubs.siam.org/doi/10.1137/1.9780898717624.appc
Germain: https://mathshistory.st-andrews.ac.uk/Biographies/Germain/
Wiles: https://abelprize.no/abel-prize-laureates/2016

## Interface design (revised 13 Nov 03:45, spec rule 2a.4)
One native dialog, closable by button/Escape with focus restoration. Each story is **three short lines**, then **one connecting question** in which the student makes the connection, then a link straight into the activity. The link appears after the best answer, or after two tries; the student is never blocked.
- No boxes explaining the method, no takeaway text, no eyebrow line.
- **A story never shows the solved path of the activity's own problem.** Connecting questions use different expressions from the activity (kettle: `(y+2)² − 16`; Germain: `(y−4)² − 16`), and the test checks that `(x+1)` and `(x−2)(x+4)` never appear in the story.
- Each option has a verdict: `best` (the connection), `works` (valid but not the connection, e.g. expanding is the physicist's way), or `no`. Feedback is one line.
- Math inside Hebrew text is wrapped in Unicode isolates (LRI…PDI) by the renderer, so expressions read left to right.
The overlay supports Hebrew and English, has touch-sized controls, and changes no session, XP or stored learning answers. It requires neither login nor AI.

## Files and validation
public/story-corner-data.js contains curated story records; public/story-corner.js is the reusable overlay engine; public/story-corner.css contains styling; tests/story-corner.spec.ts covers mobile opening, switching, closing, preserving lesson state and language behavior. The service worker precaches the assets.

## Editorial policy
Always mark folklore/legend/historical documentation accurately. Do not present a story as a real quote without a verified attribution. Each story must demonstrate a concrete way of mathematical thinking, not just motivation. Real students and a physical phone have not yet assessed instructional effectiveness.

## Verified during implementation
Local checks after integration: 54 Node tests, 21 authored questions, 4 Python import checks, Vite production build and 25 Playwright browser tests passed on the configured mobile emulation, including seven dedicated story checks. Production deployment and live-browser confirmation are tracked separately; these tests do not prove outcomes with real students.
