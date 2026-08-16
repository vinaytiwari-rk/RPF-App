# RPF Seva App — 10 Phase Master Plan

**Status:** ACTIVE — reset after full project review

## Product goal

Build a premium, multipurpose RPF Seva App that is useful every day, works local-first wherever practical, minimizes administrative/backend dependency, and remains maintainable across Frontend, Backend, PostgreSQL, Admin, Android and iOS.

## Non-negotiable product rules

1. A route, card, icon or button is not a feature unless its destination and state are complete.
2. No blank screens, dead CTAs, fake metrics, placeholder success states or unexplained redirects.
3. Prefer local/device capability before backend when the feature does not require organizational data.
4. Backend and PostgreSQL are used where persistence, identity, organizational workflow or shared data genuinely requires them.
5. Admin must be able to manage operational content without developer/database intervention.
6. External services must fail gracefully and never take down the app.
7. Every feature needs loading, empty, error, offline/unsupported and permission states where applicable.
8. Android and iOS readiness is part of architecture, not a late rewrite.
9. Visual identity: **RPF Seva App — सेवा, समर्पण एंड संकल्प** with Indian tricolour identity plus a controlled supporting palette.
10. A phase is complete only after source review, build/type verification and functional acceptance for its scope.

## Phase 1 — Full Audit, Stabilization & Bug Elimination

Audit and repair the complete stack: frontend, routes, state, backend, PostgreSQL, migrations, admin, uploads, authentication, permissions, external integrations and deployment. Remove dead/duplicate code and identify every placeholder/partial feature. Establish a P0/P1/P2 defect register.

**Exit:** no known P0 defects; P1 defects have owners/resolution; baseline build passes.

## Phase 2 — Premium Design System & App Shell

Create one consistent premium design system across Home, Explore, Activity, Impact and Me: typography, spacing, cards, gradients, icons, motion, scroll reveal, transitions, accessibility, responsive behavior, dark/light strategy and Indian visual identity.

**Exit:** all primary screens use the same design language and have no unfinished visual states.

## Phase 3 — Daily-Use Local-First Utility Suite

Prioritize useful features that can work without admin/backend: document scanner, QR/barcode tools, GPS/location tools, reminders, notes, calendar, health/personal logs, resume builder and other practical utilities already planned in the repository. Use local persistence and graceful device capability fallbacks.

**Exit:** utilities work independently of organizational backend wherever their data is personal/local.

## Phase 4 — Identity, Volunteer & Jan Seva Card

Repair authentication, volunteer registration, volunteer number, volunteer-since, profile/avatar, Jan Seva Card generation, Aadhaar input flow, flip card, QR, PDF/JPEG export, certificates, settings and logout. Keep personal avatar local unless a backend upload is explicitly required.

**Exit:** a volunteer can complete the identity journey without blank/dead states.

## Phase 5 — Real RPF Services & Workflows

Turn service categories into real features or clearly classified external services. Prioritize women, children, senior citizens, animal welfare, healthcare, youth, blood, grievance, poor support, employment, education, environment, disaster, community/culture, donations and volunteer/seva workflows.

**Exit:** every visible service has a real destination, complete state handling and an explicit dependency classification.

## Phase 6 — Premium Public Experience

Finalize Home, Explore, Activity and Impact. Home includes location, weather, AQI, quote, real photographic carousel, founder message, home-native engagement and official social links. Impact uses only verified/traceable metrics. No duplicated metrics or irrelevant CTAs.

**Exit:** primary user journey is coherent, attractive and useful without unnecessary redirects.

## Phase 7 — Backend, PostgreSQL & Admin Repair

Repair API contracts, validation, authorization, error handling, transactions, pagination, uploads, audit logs, duplicate prevention and data integrity. Review PostgreSQL schema, constraints, indexes and migrations. Rebuild Admin around operational tasks so routine work does not require code/database access.

**Exit:** frontend, API, database and admin agree on the same contracts and operational workflows.

## Phase 8 — Integrations, Notifications, Security & Privacy

Harden weather/AQI/quote/news/social integrations, email/SMS/notification flows, external URL allowlists, privacy controls, session security, upload security, rate limits, secrets and graceful degradation.

**Exit:** integration failures are isolated; sensitive data and privileged actions are protected.

## Phase 9 — Android/iOS, Performance & QA

Verify Capacitor architecture and native capability adapters, permissions, camera, location, files, share, notifications, lifecycle, offline behavior, performance and accessibility on Android and iOS. Run systematic regression testing.

**Exit:** supported capabilities have native-ready implementations and no critical platform-specific regression remains.

## Phase 10 — Release Certification & Continuous Product Baseline

Run the complete journey from splash/onboarding/auth through Home, Explore, Activity, Impact, Me, services, Jan Seva Card, utilities, admin workflows and logout. Verify lint, build, deployment, smoke tests, data integrity and release configuration. Freeze a clean production baseline and maintain a post-release defect/feature backlog.

**Exit:** release candidate is production-ready and the final review is performed only here.
