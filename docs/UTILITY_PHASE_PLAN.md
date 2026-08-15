# RPF App — Personal Utility Roadmap

## Product direction

Transform the existing service-heavy app into a **Community + Personal Utility + Social Impact** platform while keeping personal utilities local-first, privacy-friendly, and low-load.

## Engineering rules

- Do not ship fake/sample/live-looking data when no real source exists.
- Prefer device capabilities and local persistence for personal utilities.
- Do not send private health, period, medicine, notes, documents, or finance data to the backend unless the user explicitly opts into a future sync feature.
- Keep existing Volunteer, Blood Network, Login, Grievance, Jan Seva Card and other working services intact.
- Every utility must have: loading state, empty state, permission-denied state where applicable, error state, persistence, and a usable mobile layout.
- Android and iOS behavior must be considered separately for native permissions and background work.
- A feature is not considered complete merely because its route/icon exists.

## Phase 0 — Stabilization and audit

- Map every service ID to its actual route and implementation.
- Identify placeholder/demo/fake data.
- Identify routes that fall through to generic ServiceDetails without functional implementation.
- Check persistence, permissions, API dependencies, and mobile compatibility.
- Record CI/build status after each meaningful change.

## Phase 1 — Local utility foundation

Build and validate the reusable local-first foundation, then functionalize the first utilities:

1. Local storage abstraction and versioned data models.
2. Notes + To-do.
3. Calculator Suite.
4. Offline Dictionary / Glossary.
5. Offline Quiz.
6. Compass.
7. Torch.
8. PDF Library.

No server or admin dependency for these utilities.

## Phase 2 — Camera, documents and career

1. Document Scanner.
2. QR / Barcode Scanner + local history.
3. Prescription Scanner.
4. Document Vault.
5. Resume Builder improvements and reliable PDF export.
6. Voice Notes.

Sensitive documents remain local by default.

## Phase 3 — Health and personal tracking

1. Medicine Reminder.
2. Period Tracker.
3. My Health Card.
4. First-Aid / Health reference library.
5. Vitals and step tracking improvements.

Health/period/medicine records remain local-first and private.

## Phase 4 — Mobility and environment

1. GPS Toolkit.
2. Saved Places.
3. Distance / speed / trip tools.
4. Fuel Tracker.
5. Weather + AQI resilient data flow.
6. Earthquake alerts with a real source and explicit unavailable state.
7. Green Impact Tracker.

## Phase 5 — Safety and emergency

1. Emergency Toolkit.
2. SOS workflow.
3. Emergency contacts.
4. Emergency SMS where platform permissions allow it.
5. Digital First-Aid.
6. Digital Safety Toolkit.

Background behavior must respect Android/iOS restrictions and user permission.

## Phase 6 — Personal productivity

1. Personal Planner.
2. Smart Notes with voice/scan attachments.
3. Expense Tracker.
4. Budget / savings / EMI tools.
5. Household toolkit.
6. Local reports and exports.

## Phase 7 — Community and impact polish

1. Volunteer Passport.
2. Impact score and badges.
3. Challenges.
4. Certificates.
5. Recommendations / opportunities.
6. Strong offline mode and smart synchronization.

## Definition of Done

A utility is complete only when:

- The UI is responsive on small and large Android/iOS screens.
- It has no fabricated data.
- It persists the intended data.
- Permissions are handled gracefully.
- Offline behavior is defined.
- Errors are recoverable.
- The feature does not unnecessarily increase backend/admin load.
- Typecheck/build/CI passes.
