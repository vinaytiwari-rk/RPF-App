# RPF Seva App — Revised 17-Phase Master Plan

Date: 2026-08-16
Status: PLANNING RESET — AUDIT BEFORE NEW FEATURE EXECUTION

## Why this reset
The first three phases were closed too early at source/architecture/UI level while several real workflows remain partial, generic, backend-dependent, unverified, or visually inconsistent. This master plan resets execution around one rule:

> A feature is complete only when its user workflow, data source, loading/empty/error states, navigation, permissions, mobile behavior, build checks and relevant runtime/deployment verification are complete.

No phase may be marked complete merely because a route, card, icon or component exists.

## Phase 0 — Repository & Product Audit
- Freeze current main branch as audit baseline.
- Inventory every route, screen, CTA, form, API, external URL, upload, permission and data dependency.
- Classify every feature: WORKING / LOCAL / BACKEND / PARTIAL / PLACEHOLDER / BROKEN / REWRITE.
- Remove fake/demo claims and dead CTAs.
- Record all known bugs and regressions.
- Deliverable: master defect + feature matrix.

## Phase 1 — Architecture & Stability Foundation
- Keep capability-driven, platform-neutral architecture.
- Enforce local-first for device utilities and offline-safe state handling.
- Standardize feature states: loading, ready, empty, offline, denied, unsupported, error.
- Centralize API/error handling, navigation guards and storage boundaries.
- Add iOS dependency/config readiness without creating release builds yet.
- Establish testable service adapters and eliminate direct platform API leakage.

## Phase 2 — Design System & Application-Wide UI/UX
- Finalize RPF Seva App visual identity.
- Seva, Samarpan & Sankalp / सेवा, समर्पण एंड संकल्प.
- Tricolour as visual anchor with controlled supporting palette.
- Responsive mobile-first typography, spacing, cards, buttons, icons and gradients.
- Motion system: page transitions, scroll reveal, micro-interactions, reduced-motion support.
- Complete Home, Explore, Activity, Impact and Me without blank/dead destinations.
- Home: location/weather/AQI, quote, real photographic carousel, founder preview, social links, home-only engaging content.
- Me: profile, volunteer identity, Jan Seva Card, certificates, settings, contact, logout.

## Phase 3 — Navigation, State & UX Reliability
- Audit every route and back action.
- Remove redirects that land users in unrelated or unfinished screens.
- No clickable item without a working destination or an explicit in-place interaction.
- Persist safe navigation state without trapping users.
- Global error boundary, retry UI, offline UI and session-expiry handling.
- Deep-link and refresh behavior.

## Phase 4 — Authentication, Volunteer Identity & Profile
- Complete citizen/volunteer/admin auth flows.
- Volunteer registration number and Volunteer Since from authoritative backend data.
- Profile editing and local profile photo with clear privacy boundary.
- Jan Seva Card generation from volunteer record + Aadhaar input as required.
- Flip card, QR identity, PDF/JPEG export.
- Approval/status lifecycle and secure account/logout behavior.

## Phase 5 — Home & Public Experience
- Final production Home design.
- Real, neutral photographic carousel with verified image availability and no unrelated organization branding/uniforms.
- Quote-of-day parser/source reliability and caching.
- Location/weather/AQI resilience and graceful permission denial.
- Founder message preview + full speech.
- Home-only engagement feature that does not create dead routes.
- Social links verified against official RP Foundation destinations.

## Phase 6 — Explore / Service Catalog
- Replace generic CMS placeholders with real feature modules where required.
- Service matrix becomes implementation backlog.
- Each service gets one of: real local utility, real backend workflow, controlled external service, or explicitly unavailable state.
- Remove generic "Active Service" claims when no workflow exists.
- Search/category/filter reliability and no unnecessary external web search on every query.

## Phase 7 — Community, Seva & Participation
- Volunteer/Seva workflows.
- Community participation, events, registrations and attendance records.
- Blood Network, donations, grievances and community services end-to-end.
- Jan Seva Card integration.
- Participation history and service recognition where backed by real data.

## Phase 8 — Health, Safety & Emergency Utilities
- Health Care, medicine support, medical dictionary and private trackers.
- SOS/native device capability workflow.
- Vitals must never invent sensor/BP values.
- Child/period/medication utilities local/private where appropriate.
- Permission, privacy, emergency UX and failure-state verification.

## Phase 9 — Local-First Utility Suite
- Document Scanner.
- GPS Toolkit.
- Fuel Tracker.
- Resume Builder.
- Calendar and offline-friendly tools.
- Local storage, export/import, device permissions and recovery.
- Native Android/iOS adapters for camera/files/share where required.

## Phase 10 — Backend Contracts & Data Integrity
- Formal API contract audit.
- Authentication/authorization checks.
- Volunteer/profile/Jan Seva Card/certificates/community data consistency.
- Validation, duplicate prevention, audit fields and transaction safety.
- Error codes and controlled empty states.
- End-to-end production workflow verification.

## Phase 11 — Content, CMS & External Integrations
- CMS content governance.
- Sanitization and allowlists.
- Official social links and feeds.
- Quote/weather/AQI/news/external data adapters.
- External URLs, attribution and failure handling.
- No third-party organization imagery in RPF visual surfaces unless explicitly authorized.

## Phase 12 — Notifications, Activity & Communication
- Activity feed backed by real events.
- Notification read/unread state and deep links.
- Email/SMS/push strategy according to approved product requirements.
- Avoid empty notification screens.
- Retry, pagination and efficient refresh.

## Phase 13 — Settings, Accessibility, Privacy & Security
- Expand Settings as a real persistent preference system.
- Language, notifications, haptics, appearance, text size/accessibility, privacy/data controls and permissions.
- Secure token/session handling.
- Input sanitization, rate limits, upload restrictions, secure headers and secret rotation checklist.
- Privacy boundaries for local-only profile data.

## Phase 14 — Native Android & iOS Readiness
- Add/verify Android and iOS native projects/dependencies.
- Camera, microphone, location, notification, files, sharing, vibration and lifecycle adapters.
- Native permission flows and denial/retry behavior.
- Device-specific UI/safe areas/background lifecycle.
- Real device verification on Android and iPhone.

## Phase 15 — Performance, Reliability & Quality Engineering
- Bundle and asset optimization.
- Image lazy loading and resilient fallbacks.
- API caching, request cancellation and polling optimization.
- Memory/leak checks for camera/media/animation.
- Accessibility audit.
- Automated lint/type/build tests plus targeted component/workflow tests.
- Regression checklist for all 17 phases.

## Phase 16 — Release Build & Deployment Certification
- Production environment validation.
- Final Android APK/AAB and iOS archive/IPA process.
- Release signing/configuration.
- cPanel/server deployment verification.
- FTP/SSH deployment reliability and rollback plan.
- Smoke test after deployment.

## Phase 17 — Final Product Audit, Launch & Continuous Improvement
- Full user journey audit from splash → onboarding → auth → Home → Explore → service → Me → logout.
- Verify every CTA, route, form, API, upload, permission and external link.
- Verify no blank screen, placeholder, fake number, dead button or unexpected redirect.
- Verify visual consistency and motion across all primary screens.
- Verify Android/iOS/web where applicable.
- Security, privacy, performance and accessibility sign-off.
- Create production launch checklist, known-issues register and post-launch improvement backlog.
- Phase 17 is the only final release gate; earlier phases may be reopened when audit findings require it.

## Non-negotiable quality gates for every phase
1. No fake/demo data presented as real.
2. No blank screen for an intended user state.
3. No dead CTA or route without an explicit graceful state.
4. No feature marked complete from UI alone.
5. Every feature has loading/empty/error/offline/permission states where applicable.
6. Real data sources are authoritative and validated.
7. External imagery must be neutral/authorized; never accidentally show another organization's branding/uniforms.
8. Mobile-first and Android/iOS-safe behavior.
9. `npm run lint` and `npm run build` must pass before phase closure.
10. Phase closure requires a written verification record.

## Current reset decision
- Phase 0: reopen for a fresh audit pass.
- Phase 1: reopen for verification against the revised architecture gate.
- Phase 2: reopen; previous visual work becomes an input, not a final closure.
- Phase 3–17: planning baseline only until the new audit identifies actual dependencies and defects.

## Execution rule
Work in order. Fix blockers before adding cosmetic features. Reopen earlier phases whenever a later audit exposes a foundational defect. Never move forward simply to increase the phase count.
