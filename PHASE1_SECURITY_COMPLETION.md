# Phase 1 Security Completion Checklist

## Scope
Phase 1 establishes the authentication/session/database contract used by the RPF Foundation application.

## Database foundation
- `db-schema-phase1.sql` creates the `sessions` table when absent.
- Session expiry is enforced with `expires_at`.
- Indexes are created for user, token and expiry lookups.
- `audit_logs` is created for security/audit events.
- The migration is idempotent and removes already-expired sessions.

## Required production configuration
`JWT_SECRET` must be supplied by the production environment and must contain at least 32 characters. Never commit a real secret to Git.

## Authentication contract
- Passwords must be stored as bcrypt hashes.
- JWTs must have an expiry.
- Non-guest authenticated sessions must exist in PostgreSQL.
- Logout deletes the token session.
- Expired sessions must not authenticate.
- Database/session-store failures must fail closed rather than granting access.
- Admin access is restricted to `admin`, `super_admin` or the legacy `superadmin` role until the remaining role names are normalized.

## Route contract
The repository currently contains legacy and canonical admin route files. The canonical implementations use the same PostgreSQL naming conventions (`full_name`, `approval_status`, `created_at`, JSONB service content). Legacy duplicate handlers must not be allowed to supersede canonical handlers during the final route consolidation.

## Important deployment note
The existing GitHub Contents integration in this session is currently rejecting replacement writes to already-existing files with a stale/mismatched blob SHA, even though the fetched blob SHA matches GitHub. New files can be committed successfully. Therefore this Phase 1 branch contains the database migration and completion contract, while replacement of the existing middleware file must be applied as the next repository write once the GitHub connector accepts existing-file updates.

## Verification commands after integration
```bash
npm run lint
npm run build
```

Then verify:
- successful citizen login creates a session;
- successful admin login creates a session;
- authenticated API works with the token;
- logout removes the session;
- the same token is rejected after logout;
- expired sessions are rejected;
- invalid/unknown tokens are rejected;
- PostgreSQL outage during authentication does not fail open.
