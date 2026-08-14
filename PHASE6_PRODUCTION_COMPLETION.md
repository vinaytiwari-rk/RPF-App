# RPF Foundation — Phase 6 Production Completion

## Purpose

Phase 6 begins from the verified Phase 5 production-completion branch. The goal is to move from a secured foundation to a maintainable, data-driven administrator and service platform without introducing fabricated data or weakening the existing security model.

## Phase 6 workstreams

1. **Administrator control-plane consolidation**
   - One canonical administrator contract.
   - Remove/retire legacy bootstrap and God-admin paths.
   - Keep all administrator mutations authenticated, authorized and audited.

2. **Real-data service contracts**
   - Align administrator tables, API response shapes and frontend consumers.
   - Remove stale column names and duplicate route contracts.
   - Empty database states remain explicitly empty; no demo/fabricated records.

3. **Service operations**
   - Blood Network, grievances, Jan Seva Card, health camps, donations and volunteer workflows.
   - Pagination, filtering, status transitions and audit trails where supported by the schema.

4. **Frontend administrator experience**
   - Responsive administrator hub.
   - Live data tables and actionable states.
   - Clear loading, empty and error states.
   - Avoid exposing privileged controls to non-administrators.

5. **Production security and reliability**
   - Rate limits on sensitive administrator/authentication operations.
   - Strict input validation and allowlists for dynamic database updates.
   - No runtime schema mutation endpoints.
   - Fail-closed authentication and session validation.

6. **Verification and release discipline**
   - TypeScript/lint validation.
   - Production build validation.
   - Migration/static checks.
   - API contract checks for critical administrator routes.
   - CI must be green before Phase 6 is called complete.

## Phase 6 completion rule

Phase 6 is **not complete** merely because code has been committed. It is complete only after the critical routes, database contracts, administrator UI and production build have been verified against the real repository state.
