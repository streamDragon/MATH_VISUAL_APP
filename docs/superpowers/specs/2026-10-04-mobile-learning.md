# Mobile visual mathematics: approved product direction

User authorization: 2026-10-04; proceed autonomously, no further approval stops.

## Outcome
A mobile-first Hebrew experience for grades 9–11: mediated learning builds an internal representation before calculation. Learners predict, manipulate a visual model, explain the mathematical relation, then transfer to a changed example. Runtime learning never calls generative AI. Content is authored/reviewed by Hagai with his own ChatGPT.

## First deliverable
A fast classroom entry with a standalone mobile shell and six reusable visual engines: linear functions, quadratic translation, equations/intersections, right triangles, probability, and derivatives. A reviewed bank of original parameterized activities includes free activities and protected premium/class content. Grade/topic filters and persistent mastery drive the next challenge. Points are granted once per mastered activity; hints are allowed and no speed penalty is imposed. Class assignments are shared via links. Draft sketches/prediction and graph-free transfer exercise internal representation.

## Product and infrastructure
Keep the existing function workspace available via an explicit advanced link. Replace main default entry with the new experience. Disable legacy AI provider endpoints even if old credentials exist. Request submissions use the already configured Supabase Auth and Postgres with RLS: learners see their own requests; only verified moderators review/publish. No false submission success when backend unavailable. Save an unsent draft locally. Premium access is database verified, never a localStorage flag. Payments require provider setup; never simulate a purchase. Class memberships/assignment permissions are server enforced. SQL migrations are delivered for project-owner installation when privileged database access is unavailable.

## UI
Mobile portrait first, targets >=44px, useful first screen, no horizontal overflow, legible Hebrew/math direction, keyboard access, reduced-motion support. Teen-appropriate midnight/navy with violet/lime accents, large interactive diagram, short task, progress path. No required splash video. Self-hosted assets and native SVG renderers for classroom reliability. Friendly local help is explicit authored guidance, not a chatbot.

## Audio
Native Web Audio optional short effects and lightweight celebratory particles. Playback only after user interaction; mute persists. Voices are pre-recorded MP3/WAV via Kokoro on the user's remote machine and mapped by a manifest; missing voices remain silent. A remote-agent handoff includes exact clip IDs/copy and checks.

## Validation
Playwright baseline before edits and after changes: iPhone 13 dimensions and desktop, layout/CTA, complete learning flow, persistence, premium denial, no AI traffic, drafts vs sent state, reduced motion/mute. Unit tests independently verify mathematics, normalization, access control and duplicate reward prevention. Build and existing bank validators must pass. Genuine Safari testing is reported separately from Chromium device emulation if WebKit cannot be installed.

## Authorized extensions
Hebrew/English switch covers interface and pedagogical content. Avatar mountain race supports real classroom members and solo learning cohorts with up to ten additional learners at similar grade/mastery; peer views expose only alias/avatar/score. Completing a cohort goal awards a one-time bonus. No fake peers. Private backend setup remains explicit.
