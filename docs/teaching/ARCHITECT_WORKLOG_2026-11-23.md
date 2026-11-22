# Architect work log, 23 November 2026 (Claude)

Haggai asked: critique Vizy and suggest improvements, look for easy add-ons (animated characters and similar), check that the live site is the newest version (on a computer it "looks old and starts in the middle"), and join the versions into one if needed.

## 1. One version again (pushed)

- GitHub `main` and the live site were at 644c08a (21 Nov phone-stage fix).
- Haggai's computer had three commits never pushed: the concept lenses (`ab55edc`, `f8a71ac`) and a merge with 644c08a (`a0fbbcb`, "Android 1.0.7"). The merge already contained everything on GitHub.
- Checked here before release: unit tests 70/70, question check 21/21, build, and the **full phone browser suite 151/151**.
- `main` fast-forwarded to `a0fbbcb`; Vercel production deployed it. The temporary transfer branch was removed. GitHub has one branch again.
- The lens handoff note said "no push without explicit approval"; Haggai gave it on 23 Nov ("if need to integrate the version into one current version do it").

## 2. Computer layout (pushed)

What Haggai saw at 2560 px: a 710 px phone column in the middle, a 1120 px header that did not line up with it, and the bottom bar stretched across the whole screen with a third-width lime "בית" block.

Fix in `public/vizy-unified-shell.css`, from 900 px wide:
- the header spans the screen, but its content lines up with one 880 px page column;
- the home cards use that 880 px column;
- the navigation is a centred 520 px bar floating above the bottom edge.

Phones are unchanged. New `tests/desktop-frame.spec.ts` checks 1440 and 2560 px. The shell-related phone tests (31) pass.

## 3. Critique and add-ons

Written as a Claude doc for Haggai: "Vizy — critique and improvement plan (23 Nov 2026)". Summary in `CRITIQUE_2026-11-23.md` next to this file.
