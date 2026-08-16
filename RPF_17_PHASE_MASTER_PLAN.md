# RPF Seva App — Revised 10-Phase Master Plan

Date: 2026-08-16
Status: PLANNING RESET — 10 PHASES

## Product Goal

Build **RPF Seva App** as a premium, multipurpose, daily-use application for citizens and volunteers, while keeping routine features as local-first and minimizing unnecessary admin/backend dependence.

The product must feel complete, reliable and useful even when the backend is unavailable. Backend/database remain authoritative wherever records, identity, approvals or organizational data genuinely require them.

## Non-negotiable engineering scope

Every phase may require coordinated work across:
- Frontend / React UI and UX
- Backend / Node + Express APIs
- PostgreSQL database / migrations / data integrity
- Admin panel and CMS
- Android/iOS capability adapters
- Deployment and runtime verification

A screen, route or API alone is never considered a completed feature.

## Current Audit Findings — Baseline

The existing Phase 0 matrix already identifies a substantial number of generic CMS placeholders, partial workflows and backend-dependent services. In particular, most of the service catalogue currently routes through generic `/services/:id` handling and must not be counted as implemented merely because a card/route exists. fileciteturn248file0L2-L2

The current frontend has a broad service catalogue, but Explore still performs an external web search for every non-empty search query, creating unnecessary backend/external dependency. This is explicitly identified as an architectural concern in the existing audit. fileciteturn251file0L2-L2

The backend is already substantial: authentication, volunteer, certificate, community, donation, CMS, upload, government and admin route groups exist, with PostgreSQL initialization and automatic schema alteration in `server.ts`. This makes backend/database repair a first-class workstream rather than a later add-on. fileciteturn253file0L2-L2

The Admin Hub already contains Overview, People, Content, Requests, Blood Network, Services and System areas, but it is currently a functional control surface rather than a fully polished, audited administration platform. fileciteturn255file0L2-L2

## Phase 1 — Full Audit, Bug Inventory & Stabilization

**Goal:** Stop feature drift and establish one trusted baseline.

- Audit every frontend route/screen/CTA/form/modal.
- Audit every backend route and response contract.
- Audit PostgreSQL tables, migrations, indexes, relationships and duplicate/legacy columns.
- Audit Admin workflows and permissions.
- Audit authentication/session/logout behavior.
- Audit uploads, local storage, device permissions and external URLs.
- Identify blank screens, broken routes, dead buttons, fake/demo data, placeholder services and incorrect redirects.
- Create one master defect matrix with severity and owner phase.
- Fix all P0/P1 blockers before new feature expansion.

**Exit:** no known blocking defect in the core user journey; `npm run lint` and `npm run build` pass.

## Phase 2 — Premium Design System + Core App Shell

**Goal:** Make the entire application look and behave like one premium product.

- Finalize **RPF Seva App** identity.
- Correct identity: **Seva • Samarpan • Sankalp / सेवा, समर्पण एंड संकल्प**.
- Tricolour as the visual anchor, with controlled supporting colours including saffron, green, navy, red, yellow, purple, sky blue, pink, brown and black where semantically appropriate.
- Unified typography, spacing, cards, gradients, icons and buttons.
- Application-wide animation: page transitions, scroll reveal, card entrance, icon motion, flip interactions and micro-interactions.
- Respect reduced-motion preferences.
- Complete Home, Explore, Activity, Impact and Me with no blank/dead destination.
- Responsive Android/iPhone/web layouts.

**Exit:** visual consistency audit passes across all primary screens.

## Phase 3 — Daily-Use Local-First Utility Hub

**Goal:** Make the app useful every day without requiring admin/backend for routine utilities.

Prioritize local/private features such as:
- Document Scanner + PDF/image export
- GPS/location toolkit
- Fuel tracker
- Medication/reminder tools
- Private health/vitals logging without inventing sensor values
- Period tracker
- Child/personal tracker where appropriate
- Resume Builder
- Calendar and offline-friendly tools
- Notes/bookmarks/basic personal utilities as justified by the audit

Use local storage/IndexedDB/device APIs first. Backend is optional unless synchronization is genuinely required.

**Exit:** each utility works offline/local where designed, with clear permission/error/empty states.

## Phase 4 — Identity, Volunteer, Jan Seva Card & Personal Space

**Goal:** Make Me/Profile a complete digital identity hub.

- Citizen/Volunteer authentication.
- Volunteer registration and authoritative registration number.
- Volunteer Since from real data.
- Profile editing.
- Local profile photo with explicit privacy boundary.
- Jan Seva Card generated from volunteer data + required Aadhaar input.
- Digital flip card.
- QR identity.
- PDF/JPEG export.
- My Certificates.
- Settings and preferences.
- Logout/session security.
- No unfinished options or redirects.

**Exit:** complete citizen/volunteer profile journey works end-to-end.

## Phase 5 — RPF Services & Community Platform

**Goal:** Turn the service catalogue into real useful workflows instead of generic CMS pages.

Core service groups:
- Women
- Children
- Senior Citizens
- Animal Welfare
- Health Care
- Community & Culture/Spirituality
- Youth
- Blood Donation / Blood Network
- Public Grievance
- Help to Poor
- Employment / Jobs
- Education / Scholarships
- Environment
- Disaster Management
- Farmer Support
- Government Schemes
- Skills Training
- Donations/Campaigns
- Volunteer/Seva participation

For every service choose exactly one implementation model:
1. Local-first feature
2. Real RPF backend workflow
3. Controlled official external service
4. Explicitly unavailable/graceful state

No generic “Active Service” claim when no real workflow exists.

## Phase 6 — Home, Explore, Activity & Impact Experience

**Goal:** Create the premium public-facing experience and meaningful engagement loop.

### Home
- Location + Weather + AQI
- Quote of the Day with reliable source/parser/cache
- Real photographic carousel with neutral/authorized imagery only
- Founder message preview + full speech
- Home-only engaging daily feature
- Official RPF social links
- Jan Seva Card access where appropriate

### Explore
- Real service discovery
- Categories/search/filter
- No unnecessary external web search on every query
- Clear availability state

### Activity
- Real user activity/events/notifications only
- No empty-looking placeholder sections

### Impact
- Real organization/community metrics only
- Avoid duplicate impact-number presentation across Home and Impact unless each has a distinct purpose.

## Phase 7 — Backend + PostgreSQL + Admin Repair

**Goal:** Make the backend, database and admin panel dependable and easier to operate.

### Backend
- API contract normalization
- Authentication/authorization
- Validation
- Rate limiting
- Error handling
- Pagination/filtering
- Upload restrictions
- Audit logging
- Idempotency/duplicate prevention where required

### PostgreSQL
- Schema audit
- Normalize duplicate/legacy fields where safe
- Proper indexes and constraints
- Foreign keys/relationships
- Migration discipline
- Transaction safety
- Data consistency between users/volunteers/cards/certificates/community records

### Admin
- Repair all existing Admin Hub modules
- Dashboard/overview
- Users
- Volunteers
- Jan Seva Card approvals/data
- Certificates
- Grievances
- Blood Network
- Donations/campaigns
- Services/CMS
- Announcements
- Settings/system health
- Search/filter/export where useful
- Role-based access
- Safe destructive actions and audit trail

**Exit:** normal operations can be performed by admin without developer/database manual intervention for routine tasks.

## Phase 8 — Integrations, Notifications, Privacy & Security

**Goal:** Connect the app safely without making every feature dependent on external systems.

- Weather/AQI/location adapters
- Quote feed
- News/social feeds
- Email/SMS/push strategy according to approved requirements
- Notification state and deep links
- External URL allowlists
- CMS sanitization
- Secret/credential rotation checklist
- Secure session/token handling
- Privacy controls
- Local-only profile media boundary
- Accessibility and permission explanations

External services must fail gracefully and must never make the whole app appear broken.

## Phase 9 — Native Android/iOS + Performance + QA

**Goal:** Convert the strong web/PWA foundation into a reliable mobile application.

- Capacitor Android/iOS readiness
- Camera/microphone/location/files/share/vibration adapters
- Native permission flows
- Safe areas and lifecycle handling
- Offline behavior
- Image/media optimization
- Lazy loading
- Request cancellation/caching
- Animation/memory checks
- Accessibility audit
- Real Android device verification
- Real iPhone verification
- Regression tests for all major workflows

## Phase 10 — Release Certification & Final Product Audit

**Goal:** Ship only after the entire product passes one final audit.

Full journey:

**Splash → Onboarding → Login/Guest → Home → Explore → Service → Activity → Impact → Me → Settings → Jan Seva Card → Logout**

Verify:
- No blank screen
- No dead button
- No unfinished route
- No fake/demo data presented as real
- No unexpected redirect
- No unauthorized external organization imagery
- All core APIs work
- Database integrity passes
- Admin workflows work
- Local utilities work offline where promised
- Permissions behave correctly
- Android/iOS behavior is verified
- `npm run lint` passes
- `npm run build` passes
- Production deployment succeeds
- Post-deployment smoke test passes

Create a final known-issues register and post-launch backlog.

## Product Principles

1. **Multipurpose, not cluttered.** Every feature must earn its place through daily usefulness or clear RPF mission value.
2. **Local-first by default.** Do not create a backend endpoint when the device can safely handle the task locally.
3. **Backend authoritative for organizational data.** Volunteer identity, approvals, cards, certificates, donations, grievances and community records remain server/database-backed.
4. **Admin-light operation.** Routine user actions should not require admin intervention.
5. **No fake completeness.** A card/route/API does not equal a feature.
6. **No dead destinations.** Every interaction either completes in place or opens a real, complete destination.
7. **Premium but practical.** Animation and visual effects must improve comprehension, not slow the app.
8. **Real data only.** Never invent health readings, impact numbers, volunteer status or organizational metrics.
9. **Privacy by design.** Local-only data stays local unless the user explicitly needs synchronization.
10. **Reopen freely.** A later audit may send work back to an earlier phase; phase numbering is not the goal.

## Execution Order

**Audit → Stabilize → Design System → Daily Utilities → Identity → Services → Experience → Backend/DB/Admin → Integrations/Security → Native/QA → Release.**

No new feature sprint should begin while a P0/P1 blocker from the current phase remains unresolved.
