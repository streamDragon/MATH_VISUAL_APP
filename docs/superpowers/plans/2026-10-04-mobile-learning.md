# Mobile Visual Learning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Ship an engaging local-only mobile learning bank with honest human requests and protected tiers.

**Architecture:** Standalone vanilla JS/SVG shell, pure learning core, reviewed content bank. Supabase provides Auth, RLS content entitlement and a moderator request queue. Existing function workspace remains available.

**Tech Stack:** HTML/CSS/JavaScript, SVG, Web Audio, Vite, Supabase REST/Auth, Node test, Playwright.

**Spec:** docs/superpowers/specs/2026-10-04-mobile-learning.md

## Global Constraints
- Runtime learning never calls generative AI.
- Mobile portrait first; touch targets >=44px; Hebrew/math direction; reduced motion.
- Premium access is database verified, never a localStorage flag.
- No false submission success when backend unavailable.
- Voice audio is pre-recorded; no live synthesis.

## Review Focus
- Repeated completion/reload cannot farm XP.
- Untrusted question content must render as text, never execute HTML.
- Storage/network failures keep learning available and do not claim request delivery.
- Paid content and moderator actions cannot be unlocked with client parameters.
- Zero/negative/edge parameters must produce correct math and meaningful visuals.

### Task 1: Local learning core and original content
Files: public/learning-core.js, public/learning-bank.json, content/learning-bank.json, tests/learning-core.test.mjs.
Interfaces: evaluateModel(kind, params), checkAnswer(expected,input,tolerance), awardMastery(progress,id), filterBank(bank, filters).
- [x] Write/run failing behavior tests for numerical math, answer formats, invalid inputs, filters and duplicate rewards.
- [x] Implement pure functions and original reviewed activities with mediation/prediction/transfer fields.
- [x] Run node --test tests/learning-core.test.mjs; validate every bank answer; commit.

### Task 2: Mobile shell, visual engines and sensory feedback
Files: public/learn.html, public/learning.css, public/learning-app.js, public/learning-visuals.js, public/learning-audio.js, index.html, tests/learning-flow.spec.ts.
Interfaces: core consumed by app; renderVisual(container, activity, params, onChange); playEffect(name), playVoice(id).
- [x] Run Playwright baseline then failing end-to-end tests for mobile entry and full prediction/visual/transfer flow.
- [x] Implement mobile home, filters, local progress, six visuals, hint/answer/transfer, effects/mute and classroom assignment links.
- [x] Verify on desktop + iPhone13, inspect screenshots; commit.

### Task 3: Human workflow and protected content
Files: public/learning-service.js, public/review.html, public/learning-review.js, supabase/migrations/202610040001_learning.sql, scripts/seed-learning-bank.mjs, api/runtime-config.js, api/tutor.js, api/scan-question.js.
Interfaces: service auth/session, fetch protected activity, submit/list own requests, moderator review, published content import.
- [x] Write/run failing endpoint tests ensuring no AI call despite provider credentials and request failure doesn't claim sent.
- [x] Implement auth/RLS schema for plans/classes/requests/content, backend readiness errors, local unsent drafts, moderated workflow and import validation.
- [x] Run service tests + browser failure/success boundary tests + existing validators; commit.

### Task 4: Integration, verification and handoff
Files: public/service-worker.js, public/manifest.json, README.md, docs/UPGRADE_REPORT_HE.md, docs/KOKORO_REMOTE_HANDOFF.md.
- [x] Cache new learning assets for offline use and test revisiting/assignment URLs.
- [x] Build; run full suite/validators; fresh whole-branch review; fix important defects with regression tests.
- [x] Document configuration gaps, content scope, business rollout and verified optional tools.
- [ ] Push isolated branch/open PR or merge if authorized and verified; report exact deployed state.

Authorized additions to Tasks 2–3: bilingual UI/content, avatar selector, mountain progress map, class/solo cohort enrollment, server-verified race completion and one-time summit bonus. Exercise real behavior in browser tests and RPC integration tests where a configured DB is available.
