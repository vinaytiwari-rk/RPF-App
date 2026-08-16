# Phase 1 Defect Register

**Status:** IN PROGRESS
**Scope:** Frontend + Backend + PostgreSQL + Admin + Deployment

## P1 — Data integrity / trust

| ID | Area | Finding | Action | Status |
|---|---|---|---|---|
| P1-001 | Health API | Legacy `healthRoutes` returned fabricated health-vitals defaults when no user record existed. | Route boundary now returns `null` instead of invented values through the earlier-mounted guard router. | FIXED AT ROUTE BOUNDARY |
| P1-002 | Pediatric API | Legacy route returned fabricated child age/weight when no record existed. | Earlier-mounted guard now returns `profile: null` when no record exists. | FIXED AT ROUTE BOUNDARY |
| P1-003 | Blood donor registration | Legacy POST endpoint accepted unauthenticated submissions and allowed request-body verification flags. | Earlier-mounted guard now requires authentication, validates required fields and forces `verified=false`. | FIXED AT ROUTE BOUNDARY |

## P1 — Foundation / architecture

| ID | Area | Finding | Action | Status |
|---|---|---|---|---|
| P1-004 | Route generations | Multiple generations of UI/audit files exist. | Consolidate active routes and retire obsolete generations during Phase 1/2. | OPEN |
| P1-005 | Service catalog | Multiple services are placeholders, generic CMS routes or backend-only. | Build a real feature/dependency matrix and eliminate dead routes. | OPEN |
| P1-006 | Admin | Admin UI exists but API/database workflow completeness is not yet verified. | Audit each critical admin workflow against authorization and DB contract. | OPEN |
| P1-007 | Database | Multiple migration/schema files and legacy helpers exist. | Establish authoritative migration order and remove unsafe/obsolete operational scripts. | OPEN |
| P1-008 | Deployment | CI/deployment must be verified on the current repaired baseline. | Require lint, build, deployment and post-deploy smoke checks. | OPEN |

## P2 — Security / quality hardening

- Review global CORS policy; current server configuration allows the requesting origin.
- Review public endpoints exposing personal contact information.
- Remove hard-coded/default external API credentials and move all secrets to environment configuration.
- Replace simulated device-health values with native capability data or explicit unavailable states.
- Audit all error responses for information leakage.
- Add request validation and consistent API error envelopes.

## Phase 1 exit gate

- P0 = 0
- P1 = 0, or documented external blocker with safe fallback
- TypeScript passes
- Production build passes
- Backend starts
- DB migration path is known/repeatable
- Admin critical workflows verified
- No known blank/dead primary route
- Current defect register converted into Phase 2–10 execution order
