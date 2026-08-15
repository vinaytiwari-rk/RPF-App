# Phase 0 Functional Audit Status

Date: 2026-08-15
Status: IN PROGRESS

This document records confirmed findings. A feature is not marked WORKING merely because its route or UI exists.

## Status rules

- **WORKING** — real user workflow completes and result is handled correctly.
- **LOCAL** — intentionally device-only/local-first.
- **PARTIAL** — meaningful implementation exists but production paths remain incomplete.
- **PLACEHOLDER** — route/UI exists without the intended real workflow.
- **BROKEN** — workflow currently fails or has a known blocking defect.
- **BACKEND** — backend is legitimately required; API/auth/data flow must be verified.
- **REWRITE** — existing implementation is better replaced by a local/native implementation.

## Confirmed findings

### 1. Build / CI baseline — PASS

The latest scanner-fix commit passed the repository Deploy Application workflow. The workflow runs `npm ci`, `npm run lint`, and `npm run build` before deployment. No APK was built.

### 2. Document Scanner — FIXED AT SOURCE LEVEL; RUNTIME VERIFICATION PENDING

The scanner now attaches the camera stream after the `<video>` element is rendered, explicitly calls `video.play()`, handles `canplay`, and reports common camera errors. It generates PDFs with jsPDF and keeps a local scan library. Remaining Phase 0 work: native Android/iOS camera lifecycle/permission verification, large-image memory limits, and packaged-app persistence behavior.

### 3. Service catalog — GAP CONFIRMED

`src/data/coreServices.ts` contains a large catalog, but `src/pages/Services.tsx` only maps a subset to dedicated routes. Most IDs fall through to `/services/:id`.

`src/pages/ServiceDetails.tsx` is a generic CMS-backed details page. A service card therefore does not prove that the service is implemented. The complete service/implementation matrix is recorded in `PHASE0_SERVICE_MATRIX.md`.

### 4. Local-first candidates — IDENTIFIED

Fuel Tracker, GPS Toolkit, Vitals, Medication Reminder, Medical Dictionary, SOS, Period Tracker, Child Tracker and similar personal utilities should not depend on generic backend service content. They are rewrite candidates for local/device-first implementation.

### 5. Resume Builder — PARTIAL

Local form/templates/PDF generation exist. AI generation uses `/api/ai/resume`, so the AI path is backend/API dependent. The non-AI resume workflow should remain independently usable.

### 6. Community — NOT YET VERIFIED END-TO-END

The Community page loads chat history through `/api/community/chat/messages` and sends Socket.IO `chat_message` events. Server-side socket handler, persistence, authorization, reconnect behavior and delivery still require verification before WORKING status.

Volunteer search, impact statistics and success stories also require backend/data verification before being marked WORKING.

### 7. Generic service content security — AUDIT REQUIRED

`ServiceDetails.tsx` renders CMS body HTML through `dangerouslySetInnerHTML`. The source of CMS content must be sanitized/allowlisted before production. This is a Phase 0 release blocker if untrusted CMS content can reach the page.

### 8. Backend load — OPTIMIZATION REQUIRED

`AppContext` refreshes general backend data every 10 minutes and notifications every minute. This is not a functional blocker, but it conflicts with the long-term local-first/low-backend-load strategy. It will be optimized after functional correctness is established.

### 9. Mobile readiness — NOT RELEASE READY

Capacitor configuration contains Android/iOS sections, but the inspected `package.json` does not include `@capacitor/ios`. Android/iOS native capability adapters and permission/lifecycle behavior still need to be implemented and verified.

### 10. External web services — ARCHITECTURE CHANGE REQUIRED

`Services.tsx` currently calls `/api/search/external` for generic web search. This will later be separated into the planned RPF Web & Government Services Hub with in-app web handling and browser fallback. It should not become a dependency for local utilities.

### 11. Tracked credential / obsolete-source cleanup — FIXED

Phase 0 repository audit found an obsolete `init_db.ts` containing a hardcoded SMTP password fallback and an obsolete `list_ftp.cjs` containing an FTP password. Both unused helper sources have been removed. A duplicate unused `server_new.ts` was also removed to prevent stale server code from becoming a future deployment/security hazard.

### 12. External API-key dependency — FOUND; REWRITE REQUIRED

`src/routes/publicExternalRoutes.ts` contains hard-coded third-party API credentials for news and astrology services. This conflicts with the approved API-key-minimization strategy. These routes must be replaced with keyless/public-feed or direct user web workflows, or credentials must be moved to server-only environment configuration where an external API is genuinely required. The keys must be considered compromised and rotated outside the repository.

## Phase 0 acceptance checklist

- [x] Build/lint baseline verified through GitHub Actions
- [x] Initial complete service catalog captured
- [x] Service-to-route/implementation matrix created
- [x] Generic/placeholder service pattern identified
- [x] Backend-dependent vs local-first candidates classified
- [x] Obsolete tracked credential helpers removed
- [ ] Android permission/native capability matrix verified
- [ ] iOS native capability matrix verified
- [ ] Persistence strategy verified for each utility
- [ ] API failure/offline behavior verified for critical workflows
- [ ] 503/error-prone endpoints identified and verified
- [ ] Fake/demo activity/data search completed
- [ ] CMS HTML sanitization verified
- [ ] Hard-coded third-party API credentials removed/replaced and rotated
- [ ] No feature marked WORKING without end-to-end verification

## Current execution order

1. Verify/fix Community chat server event, persistence and authorization.
2. Verify/fix volunteer search privacy and availability semantics.
3. Search for fabricated testimonials/demo activity and remove/gate them.
4. Replace high-value generic utility routes with real local-first utilities.
5. Replace hard-coded external API-key routes with keyless/public-feed or direct web workflows.
6. Add the reusable device capability layer for Camera, Filesystem, Notifications, Geolocation and Sensors.
7. Verify Android/iOS permission and lifecycle behavior.
8. Run final Phase 0 build/lint and update this report to COMPLETE only when all acceptance items are resolved or explicitly deferred to a later phase.

## Important constraint

Do not rewrite the entire app wholesale. Preserve verified working functionality and make incremental, testable changes. APK/IPA creation is explicitly deferred until all planned phases are complete.
