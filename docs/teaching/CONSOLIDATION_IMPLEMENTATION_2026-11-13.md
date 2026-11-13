# Vizy mobile consolidation implementation — 13 November 2026

Source of truth: [AGREED_SPEC_2026-11-13.md](AGREED_SPEC_2026-11-13.md), [PHONE_REVIEW_2026-11-13.md](PHONE_REVIEW_2026-11-13.md), and [GENERAL_PARTICULAR_MAP.md](GENERAL_PARTICULAR_MAP.md).

## Completed in this change
- One visible meaning-first next step on `learn.html`: grade 9 → difference of squares; grade 11 → increasing versus positive. Switching grade changes one action rather than showing multiple competing activity buttons.
- One `כלים ועוד` drawer contains the existing graph lab, skill lab, guided practice, original extremum / shared-point activities, challenge bank, and optional Story Corner. They are retained rather than deleted; the old practice is not presented as the primary route.
- One shared bottom navigation for the learner pages (`learn.html`, `problem-map.html`, `classroom-practice.html`, `skill-lab.html`) with Home, Photo question and Tools. The old dock systems are hidden. One shared dark app chrome and consistent interactive controls preserve each mathematical board's legibility.
- `problem-map.html` now shows one active lesson by default: old material below it is hidden behind an explicit advanced-tools toggle. Error-card practice remains directly accessible by `#flowErrors`. Hidden modules continue to exist.
- Fixed the misleading guided-practice visualization: the graph for `f(x)=x²−4` is now a **fixed plot of the exact stated function**, vertex `(0,−4)`, and the learner moves a point along it. No drag-to-a-different-parabola while answering about the original function. The graph path is unchanged while x moves.
- The service-worker cache namespace is bumped to ensure new home/navigation assets update on mobile.

## Tests and scope
- Before changes: baseline Playwright on ability picker, mobile smoke and layered map passed (9 tests).
- After changes: new tests in `tests/unified-home.spec.ts` and `tests/classroom-exact-graph.spec.ts` check mobile viewports, a single CTA, menu continuity, exact graph, point slider, and secondary tools. Existing tests adapted where UI intentionally changed.
- Run `npm test`, `npm run check:questions`, `py -3 tests/question_import_test.py`, `npm run build`, and selected Playwright suites; record actual outcomes rather than assuming.

## Explicitly NOT implemented here
- The full agreed **new single-environment** increasing vs positive interactive stage, two learning lanes, criterion recording, reflect/vertical sliders and picture-free transfer are **next** after consolidation.
- The full general–particular map activity with all five stops is **next**. The earlier weave lesson remains available; its redesign has not yet been implemented.
- Existing older lesson engines are retained as secondary content. They are not yet merged into one new engine.
- Photo submission to real Supabase users and a physical Poco F6 still requires live end-to-end verification.
- The original desktop graph laboratory is preserved as an advanced tool.

## Quality guardrails
One student, mobile first; do not give the answer criterion away before the initial decision. Keep the student-facing experience actionable and short. Future work must read `AGENTS.md` and the 13 November agreed spec first, stay on `main`, and run browser tests before and after UI edits.
