# Phase 1 — Fresh Full Stack Audit

**Status:** IN PROGRESS
**Baseline:** current `main` branch
**Scope:** Frontend + Backend + PostgreSQL + Admin + Deployment

## Audit objectives

- Identify every broken, partial, placeholder, duplicate or misleading feature.
- Verify that every visible route has a real destination and complete states.
- Verify frontend/backend/database contracts instead of assuming source presence means functionality.
- Reduce backend/admin dependency for personal daily-use features.
- Establish the defect register that drives the remaining nine phases.

## Initial findings from source inspection

### Critical product-quality risks

- The repository contains multiple generations of phase/audit documents and feature implementations. These must be consolidated so old completion claims cannot override current code reality.
- The service matrix contains placeholder/partial/backend-only classifications; these need to be reconciled with actual routes and API behavior before services are considered complete.
- The repository contains a large number of operational helper scripts (`fix_*`, `add*`, cleanup/reset scripts, temporary search files). These need classification and cleanup so production behavior is not dependent on ad-hoc scripts.
- Frontend has both `Home.tsx` and `HomeV3.tsx`; the active route must remain the single source of truth and obsolete generations should be retired after verification.
- Backend has a broad route surface covering authentication, volunteers, certificates, uploads, Jan Seva, grievances, community, health, jobs, education, environment, culture, campaigns, AI and public-government integrations. Each route needs contract and authorization verification rather than being treated as complete merely because the route exists.
- PostgreSQL has a connection pool plus multiple schema/migration files. The actual migration order, constraints and current production compatibility must be verified before adding more tables.
- Admin already has a substantial UI and dedicated admin controller/data-table/CMS components, but operational completeness and authorization must be verified against the real APIs.

## Defect classification

- **P0:** data loss, security bypass, app cannot start, critical route/build failure.
- **P1:** major user journey broken, blank page, incorrect identity/data, broken API workflow, unusable admin workflow.
- **P2:** important UX/functional defect with workaround.
- **P3:** polish, optimization or non-blocking enhancement.

## Audit tracks

### A. Frontend

- App bootstrap and authentication
- Route table and redirects
- Main layout/navigation
- Home / Explore / Activity / Impact / Me
- Every feature page
- Loading / empty / error / offline states
- Local storage and local-first behavior
- Camera/location/files/share/notification capability boundaries
- Accessibility and responsive behavior

### B. Backend

- Server startup and health
- Auth/session/token behavior
- Authorization and role checks
- Volunteer and profile APIs
- Jan Seva APIs
- Certificate APIs
- Upload APIs
- Service/community/health/grievance APIs
- External integrations
- Validation/error contracts
- Rate limiting and security headers
- Logs and error leakage

### C. PostgreSQL

- Current schema inventory
- Migration order and idempotency
- Foreign keys and constraints
- Unique identity fields
- Nullability/defaults
- Indexes
- Transactions
- Legacy/duplicate tables and columns
- Seed/demo data
- Production compatibility

### D. Admin

- Authentication and authorization
- Dashboard metrics
- People/volunteers
- Services/content/CMS
- Requests/grievances
- Blood/community workflows
- System settings
- Uploads/media
- Audit visibility
- Failure and empty states

### E. Deployment

- TypeScript/lint
- Production build
- Environment variables/secrets
- Deployment script
- FTP/network failure handling
- Database migration step
- Smoke test after deployment

## Current implementation evidence

- Frontend route definitions are centralized in `src/App.tsx`.
- `MainLayout.tsx` owns the primary five-tab navigation and global shell.
- `Profile.tsx` contains local avatar handling and authenticated volunteer metadata retrieval.
- `server.ts` is the backend entry point.
- PostgreSQL access is centralized through `src/db/dbPool.ts`.
- The repository contains dedicated route modules for volunteer, Jan Seva, certificate, upload, grievance, community, health, job, education, environment, culture and other workflows.

## Phase 1 working rule

No new feature will be marked complete during this phase merely because its UI exists. First repair the foundation and record the real dependency/quality state. New feature work will proceed only when it does not increase known P0/P1 instability.

## Exit criteria

- P0 defects = 0.
- P1 defects are resolved or explicitly blocked by an external dependency with a documented fallback.
- Frontend type-check/build passes.
- Backend starts and health endpoint passes.
- Database migration path is known and repeatable.
- Admin critical workflows have verified API/database contracts.
- No known blank/dead primary route.
- Defect register is converted into the execution order for Phase 2–10.
