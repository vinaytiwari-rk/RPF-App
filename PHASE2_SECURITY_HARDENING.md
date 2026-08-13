# Phase 2 — Security Hardening

Phase 2 continues from the authentication/session foundation delivered in Phase 1.

## Completed in this phase so far

- Hardened RBAC role normalization and fail-closed authorization policy checks.
- Added a centralized `auditEvent()` writer for security-sensitive operations.
- Added a database schema for one-time password-reset tokens.
- Password-reset tokens are represented by SHA-256 hashes in the database; raw tokens must never be stored.
- Added expiry and one-time-use fields/indexing for reset tokens.

## Remaining Phase 2 work

1. Wire password reset endpoints to the hashed-token table and invalidate tokens after use.
2. Add audit events to login, logout, password reset, admin credential changes, and privileged mutations.
3. Remove duplicate authentication middleware from the legacy server bootstrap and use the hardened middleware consistently.
4. Replace broad CORS with an explicit production allow-list.
5. Reduce JSON/urlencoded request limits while keeping multipart upload limits independent.
6. Replace the current string-based payload detector with route-level schema validation and parameterized-query review.
7. Review every admin endpoint for explicit authentication + RBAC enforcement.
8. Review secrets/configuration so production credentials are never committed to source control.
9. Run lint/build and security regression checks before declaring Phase 2 complete.

## Safety rule

Phase 2 changes must preserve existing working public service APIs and must not expose passwords, reset tokens, JWT secrets, or other credentials in responses or logs.
