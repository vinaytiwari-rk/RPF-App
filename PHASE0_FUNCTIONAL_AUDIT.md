# Phase 0 — Functional Audit

Date: 2026-08-15
Status: IN PROGRESS

## Objective
Establish the real functional state of the existing app before adding new utility features. A visible service card, route, or icon is **not** considered a working feature.

## Current repository observations

### 1. Service catalog
`src/data/coreServices.ts` currently contains a large catalog including Blood Network, Health Care, Earthquakes, Fuel Tracker, GPS Toolkit, Vitals, Med Reminder, Medical Dictionary, SOS, Period Tracker, Resume Builder, Doc Scanner and other utilities.

### 2. Routing gap
`src/pages/Services.tsx` has dedicated routes for only a subset of services. Many other service IDs fall through to `/services/:id`.

`src/pages/ServiceDetails.tsx` is a generic content page and fetches `/api/public/services/:id/content`. If backend content is missing/unavailable, it only reports that detailed content is unavailable. Therefore a catalog entry can look like a feature while not having a real functional implementation.

### 3. Document Scanner — NOT production complete
`src/pages/DocScanner.tsx` currently uses browser `getUserMedia()` and canvas processing. The current save action downloads a PNG data URL even though the UI says “Save PDF/Image”; there is no real PDF generation in this page, no document-edge detection/cropping workflow, and no persistent local document library. This must be treated as incomplete rather than marked working.

### 4. Resume Builder — partially functional
`src/pages/ResumeBuilder.tsx` has local form state, templates and PDF generation. Its AI generation calls `/api/ai/resume`, so AI functionality depends on the backend/API. Local resume creation should remain usable if AI is unavailable.

### 5. Server architecture
`server.ts` currently combines Express APIs, PostgreSQL, authentication, AI, external search, uploads, social/external integrations and many route modules. This creates a strong reason to keep new utility features local-first and avoid adding unnecessary server/database traffic.

### 6. Mobile readiness
`capacitor.config.ts` contains both iOS and Android configuration, while `package.json` currently declares `@capacitor/android` and `@capacitor/core`; `@capacitor/ios` is not present in the inspected dependency list. iOS packaging must therefore be explicitly verified before claiming iOS readiness.

### 7. CI/deployment gate
`.github/workflows/deploy.yml` runs `npm ci`, `npm run lint`, `npm run build`, and then deploys to cPanel on pushes to `main`. Therefore every Phase 0/feature change must preserve TypeScript and production build success before being considered complete.

### 8. Existing CI workflow
`.github/workflows/main.yml` is currently the Gemini Issue Triage workflow for newly opened issues. It is not the application build/deployment workflow.

## Phase 0 acceptance checklist

- [ ] Build/lint baseline verified
- [ ] Complete service-to-route matrix created
- [ ] Complete service-to-implementation matrix created
- [ ] Broken/placeholder/fake features classified
- [ ] Backend-dependent features classified
- [ ] Local-first candidates classified
- [ ] Android permission/native capability matrix created
- [ ] iOS native capability matrix created
- [ ] Persistence strategy identified for each utility
- [ ] API failure/offline behavior identified
- [ ] 503/error-prone endpoints identified
- [ ] Fake/demo activity/data identified
- [ ] Brown/hard-coded theme remnants tracked separately from functional work
- [ ] No feature marked “done” without actual functional verification

## Initial priority after audit

1. Fix features that already have dedicated UI but are broken.
2. Replace generic service placeholders with real local-first utility implementations where appropriate.
3. Add native capability adapters for Camera, Filesystem, Notifications, Geolocation and Sensors instead of relying only on browser APIs.
4. Keep sensitive utilities (health, medicine, period, private documents, finance) local/private by default.
5. Run lint/build after every coherent change set.

## Important constraint
Do not rewrite the existing app wholesale. Preserve working functionality and make incremental, testable changes. If a required file or production configuration cannot be verified from the repository, stop short of guessing and request the exact cPanel file/configuration when needed.
