# RPF App — Phase 2 Production Hardening

## Objective
Move the Phase 1 Administrator/data-flow remediation from code-complete to production-verifiable and remove remaining API/database contract drift.

## Phase 2 scope

1. **API contract unification**
   - One canonical `service_content` contract for public reads and Administrator writes.
   - Align HTTP methods, payloads, and response shapes between frontend and backend.
   - Remove legacy `service_cms_content` references.

2. **Database readiness**
   - Verify required Phase 1 tables, columns, indexes, and constraints.
   - Ensure `service_content.service_id` is unique for upsert safety.
   - Verify audit/session tables required by Administrator authentication.

3. **Administrator security**
   - Verify every mutation route requires the Administrator role.
   - Keep administrator setup/reset endpoint retired.
   - Audit successful and failed sensitive mutations.
   - Ensure no credentials or API keys are hard-coded in source.

4. **Frontend/backend verification**
   - Verify every Administrator save operation uses the actual backend contract.
   - Verify public service pages render persisted content in English and Hindi.
   - Verify failed API calls show useful errors without fabricated/mock data.

5. **Build and deployment verification**
   - Run frontend/backend build and type checks.
   - Resolve compile/type errors introduced by Phase 1.
   - Confirm the application can be deployed as the existing single-port architecture.

## Exit criteria

Phase 2 is complete only when:

- build/type checks pass;
- no known public/admin service-content contract mismatch remains;
- required database schema is verified;
- Administrator mutation routes are authenticated and audited;
- no production credential/API-key fallback is hard-coded;
- live smoke tests for login, service content save, public service read, volunteer administration, and Blood Network administration pass.
