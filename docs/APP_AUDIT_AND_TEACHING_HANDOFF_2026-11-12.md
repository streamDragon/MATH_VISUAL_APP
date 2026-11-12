# MATH VISUAL / Vizy — app audit and teaching handoff

**Start here.** Date: 12 November 2026 (Israel). Application baseline: `main` at `c2cd5625e8dfbfd06e389a3dcab9aae51b89db0c`. This report and the links to it are documentation changes; the proposed product changes below have not been implemented by this audit.

**Canonical home of this report:** `streamDragon/MATH_VISUAL_APP/docs/APP_AUDIT_AND_TEACHING_HANDOFF_2026-11-12.md`.

**Current direction, in Haggai's terms:** בונים משמעות לפני פעולה; בכל רגע קשר אחד ברור, כשהתמונה המצטברת נשמרת. כרגע תלמיד יחיד לומד ויכול לשלוח צילום שאלה לחגי. חגי בוחר ומכין ממנו פעילות, והרפרטואר גדל בהדרגה. קבוצות וכיתות בהמשך. אין צורך במערכת לפתרונות אלגבריים מלאים; מחברת צדדית לכתיבת התלמיד היא אפשרות.

## 1. Decisions the next agent must preserve

The user's latest messages in this session supersede the earlier attached handoff wherever they conflict.

| Area | Current decision | Consequence for the next agent |
|---|---|---|
| Purpose | Teach Haggai's way of thinking: construct meaning, connect representations, choose a justified action | Evaluate learning interactions against this purpose; adding more exercises alone is insufficient |
| Learner | One student using a phone independently | Complete a useful individual experience before class infrastructure |
| Content | Train particular abilities relevant to school mathematics | No requirement to reproduce the full matriculation syllabus or become an official exam bank |
| Full solutions | Haggai explicitly said full algebraic solutions are not needed | Remove the previous handoff's proposed mandatory full-solution ending; a conceptual justification or selection of a useful transformation is appropriate |
| Notebook | Optional side notebook for the student's own work is acceptable | This is permission for an option, not a requirement to build a handwriting engine |
| Student photos | A student should be able to photograph/send a question to Haggai now | The individual submission and teacher inbox workflow belongs in the current phase |
| Editorial control | Haggai turns selected submissions into activities over time | Receipt is not a promise of an immediate answer, automatic publication or a complete solution |
| Contribution bonus | Haggai suggested possibly rewarding useful submissions | An idea to validate; amount, eligibility and timing are undecided |
| Classes/groups | A later phase | Do not make groups, class creation, rankings or cohort completion prerequisites for submission or learning |
| Paid plans | Not requested as the current focus | Do not bundle payments into the work needed for an individual student and teacher inbox |
| Mobile | The primary product, including Android | Preserve the original graph workspace while improving the unified experience |
| Entry point | Existing unified Vizy home is the current baseline; Haggai has not explicitly settled a replacement | Keep it for this phase and test its clarity; do not silently replace the original workspace or introduce another competing home |

The earlier recommendation to postpone **all** server functionality was too broad. The necessary distinction is **individual submissions now; class/group services later**. A small amount of server identity, private storage and moderation may be necessary for submissions without requiring a classroom product.

The supplied material mixes a META MODEL/Claude conversation with math project content. This report concerns MATH VISUAL only. The earlier location `claude/MATH-VISUAL-handoff-report.md` in a separate Claude project was reported in the attachment; it was not independently accessed or edited here. Future agents should start from this repository report.

## 2. Sources and evidence boundaries

Read in this audit:

- A fresh clone of the repository at the baseline above, including `AGENTS.md`, README, module data/controllers, tests, request services, moderation UI, database migration and Graphify generator/data.
- The live home, problem map, Graphify code/findings views, request form and teacher review entry through connected Chrome. No question, image, email or login request was submitted during the audit.
- Anonymous HTTP retrieval of the live `version.json`; Vercel project metadata.
- All three supplied TXT attachments, including the older report, teaching/build history and the subsequent correction rejecting full solutions.
- Haggai's latest direct clarifications about individual students, submissions, gradual repertoire building, and the seven-point description of his teaching.
- Relevant retrieved conversation context about Mercedes, general/particular, domain-first algebra, uncertainty, preserving layers and mobile use. Older assistant completion claims are context, not fresh verification.
- A focused Drive search and read. Search/read tools work in this conversation. The Math Visual Android Builds folder returned an empty child list. Name searches did not locate a current dedicated Vizy project report; this is not an exhaustive claim about all Drive content. An NLP Graphify document was excluded as a different project.

### Verification actually performed

| Check | Result in this audit | Limit |
|---|---|---|
| Repository / deployed application | Live `version.json`: app version `59`, full baseline SHA above, built `2026-11-11T17:53:26.855Z` | A documentation commit after the audit may advance `main` without changing product behavior |
| Anonymous public access | HTTP 200 for version file; application rendered in Chrome | Does not establish signed-in backend operation |
| `npm ci --ignore-scripts` | Succeeded, 149 packages installed | No dependencies or lockfile changed |
| `npm test` | **47 passed, 0 failed** | Local tests include simulated database/service checks, not a live account test |
| `npm run check:questions` | **21 questions validated** | This is the legacy question validator, not evidence that every new module is covered |
| `npm run test:import` | **4 passed** | Import tool tests |
| `npm run build` | **Passed**, Vite 7.3.1; generated `dist/index.html` about 1,003.55 kB / 199.58 kB gzip | Build success is not UI or learning validation |
| `npx playwright test --list` | **122 test cases discovered in 15 files**, across desktop and mobile projects | Discovery is not execution |
| Full E2E attempt with installed `/usr/bin/chromium` | Stopped at configured six-failure limit: **6 launch failures, 116 not run**, plus runner-level error | Chromium aborted before application assertions: `socket() failed: Operation not permitted` |
| Playwright-managed browser installation | Failed: downloaded archive was empty/truncated | WebKit was not installed or verified |
| Escalated E2E request | Automatically rejected by environment policy: `sandbox_approval: false` | No approval prompt reached the user; do not say the user declined |
| Live browser walkthrough | Home, reasoning page, Graphify, submission form and review sign-in inspected | Requested 390×844 viewport override was not honored exactly: observed inner viewport was 520×1125. This is **not** an iPhone 13 validation |
| Android / photo intake | Capacitor and submission code inspected | No APK built, physical Poco F6 walkthrough or real student-to-moderator receipt verified |

The older report's suspicion that `grade-next-mobile.spec.ts` and `student-next-step.spec.ts` contain no registered tests was incorrect. They register tests inside top-level loops and are discovered by Playwright. They contribute eight cases across the two projects.

## 3. What exists in the app

| Module | Main files / route | Verified shape and maturity |
|---|---|---|
| Unified home | `public/learn.html`, `public/learning-app.js`; `/` redirects to `learn.html` | One home exposes existing tools. This unifies navigation, not yet one shared learning model |
| Prepared activity bank | `public/learning-bank.json`, `learning-core.js`, `learning-visuals.js` | 24 activities in six families; prediction, SVG exploration, numerical answer and transfer; local progress; 12 marked free |
| Assessed layered thinking | `public/problem-map.html`, `problem-map-flow-data.js`, `problem-map-flow-core.js`, `problem-map-flow.js` | Two lessons: parameter/extremum (8 links) and shared extremum (9 links); wrong answers do not advance; earlier layers persist; hints/support needs recorded |
| Error recognition | `VizyErrorCards` in the same data file; `/problem-map.html#flowErrors` | Four cards: height/slope, derivative minus, lost zero-equation, correct-but-unfinished work. Verdict, location, diagnosis, repair and transfer |
| Additional map explorer | `problem-map-data.js`, `problem-map-core.js`, `problem-map.js`, `problem-map-visual.js` | Identification/representation/inference, x/y/derivative/parameter distinctions, draggable parabola, conceptual stopping points and optional equation/foundation labs |
| Skill lab | `public/skill-lab.html`, `skill-lab-data.js`, `skill-lab.js` | Eight categories; diagnosis → training → transfer; identify structure and select tool. Text labelled “sketch” is prose, not a drawing |
| Guided classroom practice | `public/classroom-practice.html`, `classroom-activities.js`, `classroom-flow.js`, `classroom-visuals.js` | 22 staged questions in four grade 9/11 paths; local resume, hints, visuals and transfer |
| Original graph workspace | `index.html?workspace=1&splash=0`; `public/codex_features.js` | Substantial existing graph tool. Experimental representation features depend on entry flags such as `codex_ext`; file presence does not mean every mobile learner sees them |
| Student requests | `learning-app.js` request view; `learning-service.js` | Text/image draft, sign-in, image upload, request RPC and status list exist; shared backend readiness unproven live |
| Teacher inbox | `/review.html`, `public/learning-review.js` | Moderator sign-in, private image link, queue, JSON validation/publication and response association exist |
| Graphify | `public/graphify.html`, `graphify-data.js`, `graphify-map.json` | Code dependency map plus a separate pedagogical design graph; stale snapshot, detailed below |
| Android | `capacitor.config.ts`, `android/app/build.gradle` | `com.nlpis.mathvisualapp`, versionName `1.0.6`, versionCode `7`; fresh distributable not verified |

Runtime generative AI remains retired. `/api/tutor` and `/api/scan-question` are compatibility endpoints returning 410. Student photography does **not** require reviving an AI solver: images can go to the human editorial inbox.

### Main product gaps

1. **Navigation is more unified than learning.** The modules have separate state/progress stores and interaction patterns. A student should experience a recognizable thinking loop across them, while each activity trains a specific relationship.
2. **The newest assessed path is narrow.** Its two lessons and four cards center on extrema/derivatives. The other modules contain broader topics, but that does not establish transfer of the assessed reasoning ability.
3. **The latest classroom lesson is missing.** The rational function, positive-versus-increasing trap and whole-sum sign reasoning below are not in the current layered/error bank.
4. **“Visual” sometimes means a written description.** In `skill-lab.js`, the `sketch` field is inserted with `textContent`. Choosing a label and reading three descriptions does not demonstrate translation between an actual graph and algebra.
5. **Multiple representation implementations can drift.** The workspace, skill lab and problem-map visual layer each express the Mercedes idea differently. First agree on shared learning semantics and evidence; a broad component rewrite is not the first task.
6. **One screen contains several teaching systems.** The problem-map page places the assessed lesson, error cards, explorer, bridge checks and optional equation/foundation tools in one long document. Preserve access, but make the next action and current relationship unambiguous on a phone.
7. **Progress is not a common proof of ability.** The skill lab saves a last report per grade, including phase totals, rather than a longitudinal per-skill mastery record. First-try recognition and new-example independence must not be confused with mathematical certainty or full algebraic completion.
8. **Photo intake has a credible scaffold, not verified service delivery.** The next agent must test the complete individual workflow, rather than merely show an upload button.
9. **README is incomplete.** It omits substantial recent reasoning/error/skill work. Existing October backend/commercial roadmap sections are historical implementation context; this report sets the newer priority.

## 4. Haggai's teaching model: working description

This is a working interpretation grounded in the examples and the user's latest synthesis, **not a claim that Haggai has completed a formal pedagogical theory**.

The core is to find the connections that turn separate details into a meaningful structure. When a student's step seems wrong, reconstruct what the student thinks a symbol means, which assumption they made and which connection is absent. The app should let the learner expose, test and repair that connection.

| Principle | Observable learner action | Product acceptance criterion |
|---|---|---|
| Meaning before action | Says or selects what the `2` represents before choosing where to substitute | Choosing `f(2)` versus `f′(2)` requires distinguishing height from slope |
| Mercedes: words / picture / algebra | Translates one claim between representations | At least one transfer requires interpreting a real visual or constructing/selecting one; displaying three headings is insufficient |
| General / particular | Names the general condition, then instantiates it in this problem | Keep `f′(x₀)=0`, `f′(2)=0` and `2·2+a=0` distinguishable |
| Build from certainty | States the domain and valid operations; leaves unknown fields open | Do not invent `y=0` from `x=2`; do not fill a whole graph before the learner has information for it |
| Preserve layers | Revisits a datum, condition or earlier equation after deriving a new one | New rows accumulate with their reasons; a new result updates the existing picture |
| Diagnose thinking | Distinguishes wrong, true-but-insufficient and sufficient-for-this-task statements | Each verdict leads to appropriate feedback; a missing final calculation is not automatically an error |
| Understanding in action | Chooses, links, explains, repairs and succeeds on a changed example | A watched animation or correct click after hints is not recorded as independent transfer |
| One clear connection now | Focuses on the next relationship while retaining prior evidence | Keep the current question prominent; let accumulated layers remain reachable without crowding the decision |

The method grows bottom-up from actual student encounters; the learner organizes a particular problem through an emerging overall picture. Do not freeze this into a rigid sequence every student must repeat. An advanced student may demonstrate the relationship without drawing; support can be revealed when needed.

### Keep three different things separate

- **Mathematical determination:** what the supplied conditions uniquely determine, even before anyone calculates it.
- **Learner-established knowledge:** what this student has actually recognized or justified so far.
- **Calculation completed:** which particular numerical/algebraic values have been obtained.

A parameter may be uniquely determined but not yet calculated. A correct condition may be established without a full solution. A subjective confidence percentage is none of these. Preserve the existing distinction between “הנתונים קובעים” and “הסקנו עד כה”; do not replace it with one vague certainty bar.

## 5. Classroom examples to turn into activities

### 5.1 Increasing, positive, slope and whole-expression sign

The supplied lesson used:

$$
f(x)=\frac{2x}{x^2+1}+x-2.
$$

The domain is all real numbers, because `x²+1 > 0`. The verified derivative identity is:

$$
f'(x)=\frac{-2x^2+2}{(x^2+1)^2}+1
=\frac{x^4+3}{(x^2+1)^2}>0.
$$

At `x=10`, the fractional term is `−198/10201`, while the **whole derivative** is `10003/10201 > 0`. This is a useful window into confusing a sum with a product, and judging a whole expression by one part.

Use this identity as an authoring/QA oracle. Its presence in this report is not a requirement to reveal a complete worked solution in the student app.

| Proposed activity | What to ask the learner to do | Evidence / trap |
|---|---|---|
| Sign versus direction | Choose a graph segment below the axis that rises; identify height sign and direction separately | `f(x)<0` does not mean decreasing |
| Meaning of increasing | Compare two input positions and their heights, then connect words and graph | On an interval, strict increase means `x₁<x₂ ⇒ f(x₁)<f(x₂)` |
| General sufficient condition | Choose a condition sufficient to prove increase on the interval | `f′>0` is sufficient under the appropriate differentiability/interval assumptions |
| General → particular | Connect the desired sign condition to this specific derivative | Give the derivative if differentiation is not the ability being trained |
| Whole sum | Inspect the fractional term and `+1` separately, then judge the whole expression | A negative term does not determine a sum's sign |
| Useful transformation | Choose what would make the sign visible and explain why | Common denominator exposes positive numerator and denominator; stop at the relevant reasoning goal |
| Changed example | Judge `1+A` with `A=−0.02`, then `A=−2`, before another functional example | Being negative alone says too little; magnitude and whole expression matter |

Do not require all these relationships in one long compulsory lesson. Start with a small coherent activity and branch to support for the specific missing link. The earlier eight-step proposed lesson is a source of material, not a mandatory full-solution staircase.

**Mathematical guardrails:**

- `f′>0` everywhere on an interval is sufficient for strict increase; its converse is false. `x³` is strictly increasing on the real line and has derivative zero at zero.
- `f′≥0` establishes nondecrease under the usual interval/differentiability assumptions; it does not alone establish strict increase. A constant function is a counterexample.
- A positive derivative on disconnected domain components does not by itself establish increase across the entire disconnected domain. Keep interval assumptions visible in authoring validation.
- An interior differentiable extremum has zero derivative. Zero derivative alone does not guarantee an extremum. Endpoint or nondifferentiable extrema require different reasoning.
- An arbitrary plotted/sample graph is evidence rather than a universal proof. Precisely labelled visual reasoning can justify a mathematical claim; avoid teaching that every picture is inherently nonmathematical.

Proposed cards for `VizyErrorCards`:

| ID | Verdict | Student claim | Repair target |
|---|---|---|---|
| `positive-vs-increasing` | wrong | Below the axis, therefore decreasing | Separate value sign from change in value |
| `part-of-sum` | wrong | The fraction is negative, therefore the derivative is negative | Include `+1` and compare magnitudes |
| `sufficient-not-necessary` | wrong | Strictly increasing, therefore derivative strictly positive at every point | Check the reversed implication with `x³` |
| `understood-not-proved` | incomplete | This sampled graph goes up, so that proves the claim for every real input | Identify the missing universal justification for this task |

Mix these with true and true-but-incomplete work so students do not learn that every card contains an error.

### 5.2 Algebra: domain first, sums and products

Retrieved teaching context describes a stable habit: start with what is forbidden, build a vertical two-sided skeleton, fill only what is certain, and distinguish the “world of additions” from the “world of multiplications.” Factoring is a bridge that makes valid cancellation available.

Use small original examples, marked as illustrative rather than verbatim classroom transcripts:

- `(a²−25)/(a−5)`: retain `a≠5` before and after factoring/cancelling. The simplified formula does not restore the forbidden input.
- `(x+2)/x`: identify why crossing out the `x` inside a sum is invalid; compare with `x(x+2)/x`, subject to `x≠0`.
- Two simultaneous conditions `A=0` and `B=0`: `A=B` follows but cannot replace both conditions. This generalizes the existing lost-equation card.
- Distinguish an expression from an equation: cancelling a nonzero common factor in a fraction differs from dividing an equation by a possibly zero expression and losing solutions.

These are targeted reasoning activities. Do not expand them into a full algebra solver or broad syllabus project.

## 6. Individual photo → editorial repertoire loop

This is **in scope now**, alongside the teaching experience. Reuse the existing scaffold; a new class platform is unnecessary.

### Existing path and exact gaps

| Stage | Already present | What must still be verified or improved |
|---|---|---|
| Choose image | `#request-image`, JPEG/PNG/WebP, 5 MB limit | No explicit `capture` attribute. Whether the chooser offers the camera depends on the device; test on Poco F6. Add clear photo/choose, preview and retake/cancel behavior if needed |
| Draft | `vizy_request_draft` saves text, source, grade and request ID | Selected image bytes are not in this draft. Do not imply that a saved text draft preserves its photo across reload/offline |
| Identity | Supabase session required for upload/submit | Keep learning available without sign-in; use the least intrusive reliable identity for private request tracking |
| Private upload | `LearningService.uploadImage`, private `learning-requests` bucket | Live storage policies and actual image retrieval by Haggai unverified |
| Receipt | `learning_submit_request`; success only after `result.id` | Good existing rule: preserve it. Upload success alone is not a received question; handle retries and abandoned uploads |
| Student tracking | `ownRequests`, status and linked activity | Current states: `pending`, `reviewing`, `answered`, `rejected`. Separate “received” from “selected for authoring” and “published activity” in wording |
| Teacher destination | `/review.html`, moderator queue and signed image access | Activate/verify Haggai's moderator access and a clear route to the inbox. No email notification delivery was verified; inbox presence is not email delivery |
| Authoring | Copy preparation task, validate JSON, publish, link response | Current publisher expects numerical six-family bank activities and English fields. It cannot automatically publish arbitrary new layered/error schemas |
| Photo-to-authoring handoff | A private image can be opened | The copied task includes question text but not image content; an image-only submission can produce an empty textual prompt. Ensure Haggai can inspect/transcribe the image during preparation |
| Content growth | Haggai moderates before publication | One reusable ability activity per selected need; keep source request and authoring provenance separate from public learner content |
| Bonus | Existing XP/cohort summit bonuses | These are **not** submission-contribution rewards. No verified contribution-bonus implementation exists |

The current request copy says “target: 24 hours,” connects sign-in with groups, and inherited request quotas are free=2 / extended=10 monthly. These are older product defaults, not decisions Haggai made for the current gradual editorial process. Review them before launch; do not promise a turnaround he has not committed to.

Suggested current copy:

> יש שאלה שהיית רוצה להבין אחרת? צלם אותה ושלח לחגי. השאלה תיכנס לבדיקה, ומתוך השאלות נבנה בהדרגה פעילויות חדשות.

Receipt copy must reflect actual delivery. If only a draft exists: “הטיוטה שמורה במכשיר; השאלה עדיין לא נשלחה.” After real server acknowledgement: show a receipt/reference and a way to return to its status. Do not imply every submission will become a lesson.

### Minimum acceptance test for this phase

1. A student on a phone can learn without joining any class.
2. The student chooses/takes a legible test photo and confirms the intended attachment.
3. A failed/offline send preserves recoverable work and never reports receipt. If the image cannot survive a reload, say so or implement persistence.
4. A successful submission produces a real request ID and remains visible after reload.
5. Haggai signs into `/review.html`, sees the same request ID, opens its private image, and marks the review state.
6. An ordinary different account cannot read that request/image or moderate it. Use test accounts and synthetic photos for this check.
7. Haggai creates one original activity in a supported format, checks its mathematics and teaching sequence, publishes it and links it back. The student opens the new activity.
8. No class, cohort, competition or purchase is needed for any of the above.

Applying necessary schema is not the same as launching every interface supported by it. The existing migration includes requests and groups together; an implementation agent can reuse that schema while keeping later-phase routes out of the individual flow. Do not revive AI endpoints to solve photography.

### Contribution bonus: small optional experiment

User-approved direction: **possibly** reward someone who contributes a useful question. Proposed default for discussion, not a settled rule: reward after Haggai accepts a useful contribution, once per request, rather than rewarding every upload. Keep contribution recognition separate from demonstrated mathematical ability. Avoid rewarding spam, duplicates or exposure of personal data. Points amount and whether acceptance or publication triggers the reward remain open. Do not block intake while inventing a reward economy.

## 7. Adoption: help people try the method honestly

Habits, fear and prior conceptions can create resistance, as Haggai emphasized. The product should earn trust through a small understandable experience. Some objections will expose real product problems; do not label all friction “resistance to innovation.”

| Likely objection / underlying concern | Honest response and product action | Evidence to observe |
|---|---|---|
| “Just tell me which formula” / unfamiliar effort | Ask for one meaningful choice, give targeted support, then let the student show the relationship without repetitive scaffolding | Can they choose the right tool in a changed example? |
| “I know this already” / loss of autonomy | Offer a short independent check; reveal support only where needed | First-attempt transfer, not completion by guessing |
| “It feels slower” / limited study time | Acknowledge the extra initial effort; show exactly which confusion the activity targets | Time, frustration and retention measured separately |
| “Will this help my schoolwork?” / relevance | Use familiar school problems and identify the particular ability being trained | Return to a changed school-style prompt without requiring a full written solution |
| “I am bad at math” / embarrassment | Frame a wrong answer as a specific connection to inspect; preserve valid partial knowledge; no public ranking | Willingness to retry, explain and return |
| Parent: “How many questions were solved?” | Show one concrete before/after distinction and a new-example attempt | Independent response, not XP as a proxy for learning |
| Teacher: “I cannot replace my teaching” | Position Vizy as short focused practice beside teacher/book; Haggai chooses content from real needs | Setup effort and usefulness of the targeted activity |
| “I do not know what to press” / poor interface | Fix labels, current focus and first-screen choices | Can the learner start unaided? This is a usability issue, not evidence they reject the pedagogy |

### Real tradeoffs to disclose and test

- More initial decisions may mean fewer exercises in one sitting. This can help attention to meaning, but can also impose unnecessary cognitive load.
- The current repertoire covers limited contexts; improvement on one lesson does not establish broad mathematical transfer.
- Multiple-choice reasoning is accessible on a phone but can be guessed or cue the right answer. Include changed representations and counterexamples.
- Small screens can make mathematical relationships harder to see. Less text and one active relationship are functional requirements.
- Human editorial intake grows at Haggai's pace. It cannot honestly promise instant answers or a fixed response time without capacity evidence.
- Local progress can be lost or differ across devices. Submission receipts and local learning progress are distinct services.

Lack of full algebraic solutions is a deliberate product boundary, not a missing promise the next agent should “repair.” The app may train justification or selection of a transformation without writing the whole solution for the learner.

Suggested positioning, to test rather than present as proven copy:

> לפני הצעד הבא, בונים תמונה: מה ידוע, מה זה אומר, ואיזו פעולה מתאימה עכשיו.

> נתרגל קשר אחד בכל פעם — בין המילים, הציור והסימנים — כדי לבחור את הצעד הבא בעצמנו.

Avoid a compulsory long onboarding explanation. Give one recognizable task and a brief reason for the unfamiliar action at the moment it helps. Do not promise better grades, universal speed gains or a scientifically validated Vizy method.

### Research support and limits

[Deslauriers et al., PNAS (2019)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6765278/) found, in randomized introductory college physics instruction, that active-learning students learned more while feeling they learned less; cognitive effort contributed to the discrepancy. This supports testing a brief explanation of effort and measuring feeling separately from performance. It does **not** validate Vizy or establish the same effect for Hebrew secondary mathematics.

The [IES/What Works Clearinghouse practice guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/1) supports combining graphics and verbal descriptions, connecting abstract and concrete representations, and explanatory questioning. These are relevant design principles, not proof that placing three panels on a screen teaches translation. The guide also includes other approaches; it does not require this app to become a worked-solution system.

Proposed first evaluation: observe the individual learner starting unaided, record a baseline misconception/relationship check, a guided attempt, a changed-example attempt and a later return. Record assistance and reported effort separately. A tiny pilot can establish feasibility and reveal confusion; it cannot establish general efficacy. Do not interpret every difficult experience as productive struggle.

## 8. Graphify audit and required follow-up

The live map and checked-in data agree with each other, but describe an older application snapshot:

- Generated `2026-11-10T17:22:42.193Z`; recorded source `c1242490fcfa3918f864819a898361919006728b`.
- 132 nodes, 136 edges; metadata: 251 tracked files, 112 scanned files, historical `feature/vizy-graphify-20261110` branch.
- No mapped file paths were missing on disk in this audit; this does not mean all current files are mapped.
- At least six current reasoning files are omitted: `public/problem-map-flow-core.js`, `public/problem-map-flow-data.js`, `public/problem-map-flow.js`, `public/problem-map-visual.js`, `tests/problem-map-flow.spec.ts`, `tests/problem-map-flow.test.mjs`.
- `learn.html → problem-map.html` is still labelled `planned` although the live link exists.
- The findings text still discusses the earlier single-example state; it misses the newer assessed layered/error flows.

**Important:** `scripts/generate-graphify.mjs` hard-codes the old `mainSha`, historical branch and some findings/planned relations. Merely rerunning it updates the timestamp/file scan but leaves misleading provenance and descriptions. The conceptual design nodes are deliberately marked `design`; keep that separation from implemented code.

Next agent should:

1. Derive source SHA/branch from the actual checked-out source and record dirty-tree status when relevant; distinguish source commit from the later generated-artifact commit.
2. Scan current tracked files and represent the actual new flow/visual/test dependencies.
3. Remove obsolete planned labels where implementation is verified; keep genuinely planned relationships distinct.
4. Review findings against present code, rather than regenerate old conclusions as if fresh.
5. Extend the pedagogical map to include the single-learner loop, source/meaning/justification/transfer, and the separate intake/editorial loop. Keep photo contribution recognition distinct from learning evidence.
6. Add a focused check for valid edge endpoints, existing mapped paths, inclusion of current critical flow files and accurate provenance. Keep the map an aid to inspection, not evidence that a behavior passed runtime tests.

This audit did not modify the generator or regenerate the graph: its stale status is explicitly documented for continuation.

## 9. Concrete continuation order

These are recommendations for the next implementation pass, not claims of completed changes.

| Priority | Small deliverable | Files to start from | Done when |
|---|---|---|---|
| P0 | Preserve the latest product contract | This report, `AGENTS.md`, README | Agent does not reopen full solutions/classes as prerequisites |
| P1a | One coherent sign-versus-increasing activity and its error/transfer check | `problem-map-flow-data.js`, existing visual adapters/core/tests | Actual visual discrimination, supported reasoning and a changed example work on a phone; no full-solution requirement |
| P1b | Working individual submission → Haggai inbox → one published activity | `learning-app.js`, `learning-service.js`, `learning-review.js`, existing migration/setup guide | The complete eight-point intake acceptance test above passes with test accounts and a phone |
| P2 | Make the current connection and next action obvious | Existing unified home/problem map | Learner starts without explanation; previous evidence remains available; later-phase services do not dominate |
| P2 | Correct and refresh Graphify | Generator and two data outputs | Current source/critical files represented, implemented versus planned accurate |
| P3 | Shared evidence vocabulary across modules | Current controllers/data/state models | Given/principle/inference/computed and independent/assisted/transfer mean the same thing; avoid a broad rewrite first |
| P3 | Optional side notebook, if observation supports it | Existing retained-layer UI | Student can write alongside thinking without a forced solution checklist |
| Later | Contribution reward after a small trial; broader repertoire; then class/group services | Reuse current editorial and service structure | Added because observed need warrants them, with separate verification |

P1a and P1b are both current scope: teaching quality and a real channel for new questions. Do not spend this phase activating billing, cohorts or a complete curriculum. Do not create another standalone learning page when the existing assessed flow can host the activity.

## 10. Next-agent operating checklist

1. Read this report first, then the code at the **current** `main`; confirm whether another agent has advanced the application since the audited SHA.
2. Preserve the existing unified entry and original workspace. State a justified entry change explicitly before replacing behavior the user asked to retain.
3. Read `AGENTS.md`. For UI work, inspect before/after, check 320/390/412-pixel layouts, meaningful labels, math directionality, keyboard/touch access, visible next action and overflow. Run iPhone/WebKit checks where available; a narrow desktop window is not an iPhone test. Include Poco F6 photography for intake.
4. Author assessed lessons in `problem-map-flow-data.js` and existing schemas. Its validator/tests currently assume two lessons/four cards in places: update expectations when extending the bank. A new lesson may require generalizing visual logic; do not attach an unrelated picture.
5. Give every new activity a precise target ability, input facts, representation task, justified relationship, misconception diagnosis, support behavior, stopping point and changed-example evidence. Record what is proposal versus observed classroom material.
6. For submissions, consult `docs/REMOTE_BACKEND_SETUP.md` as technical context, filtered through the current scope. Never put service keys or student photographs into repository docs. A real receipt and working moderator access are release criteria.
7. Run appropriate checks: `npm test`, `npm run check:questions`, `npm run test:import`, relevant/full `npm run test:e2e -- --workers=1`, `npm run build`. Record actual outcomes and environment failures separately. The current runtime did not permit Chromium launch; do not claim all E2E passed based on the older transcript.
8. After a product deployment, confirm the live version and route behavior. A Vercel READY build is not proof of mobile usability, backend receipt or learning transfer.
9. Update Graphify accurately and leave a short continuation note with changed paths, verified outcomes and remaining uncertainty.

### Open decisions that do not block current work

- Exact contribution bonus and its trigger, after observing useful submissions.
- Whether optional student writing needs an in-app notebook or an ordinary physical notebook is enough.
- A future entry redesign, if first-use observation shows the current home obscures the reasoning activity.
- Operator response capacity and whether any response-time target is realistic.

Do not ask again whether full solutions are needed or whether classes are the current focus. The user has answered both. The immediate task is to make the individual experience express his teaching and connect incoming questions to a growing, human-reviewed repertoire.
