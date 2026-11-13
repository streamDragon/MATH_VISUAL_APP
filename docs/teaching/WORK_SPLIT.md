# Who is working on what (to avoid two agents editing the same files)

Update this file when you start or finish a piece. Pull before editing.

| Owner | Piece | Files | Status |
|---|---|---|---|
| Claude (Anthropic session) | Story corner: apply spec rule 2a.4 (short story, one connecting question, never show the solved path first, no explanation boxes) | `public/story-corner-data.js`, `public/story-corner.js`, `public/story-corner.css`, `tests/story-corner.spec.ts`, `docs/VIZY_STORY_CORNER_2026-11-13.md` | Done (commit after 03:45): 14 Playwright story tests pass, unit tests and build pass |
| GPT-6 agent | Inquiry presentation rules 2a.1–2a.3 and 2a.5: first-choice overlay, pinned given strip, one focal point, accessible desktop/mobile typography | `public/vizy-inquiry.js`, `public/vizy-inquiry-entry.js`, `public/vizy-inquiry.css`, `public/problem-map.html`, `tests/investigation-mobile.spec.ts`, `tests/investigation-entry.spec.ts` | Done; 29 Playwright checks passed |
