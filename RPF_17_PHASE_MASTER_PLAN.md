# Samahit — 17-Phase Master Upgrade Plan

Date: 2026-08-23
Status: REVISED MASTER PLAN

## Product Direction

Upgrade the existing **Samahit / RPF App** into a mature, India-scale service and seva platform.

The product is **not a UMANG clone**. We may closely adopt proven interaction patterns such as service discovery, search, category navigation, cards, bottom navigation, status tracking and information hierarchy, while retaining Samahit’s own identity and capabilities.

Top-level service model:

- **Government services** — official, verified, external or integrated public services.
- **RPF Foundation umbrella** — RPF initiatives plus relevant People’s Group capabilities, without presenting People’s Group as a separate top-level ecosystem.

Government-first priority remains category-specific:

- Volunteer: RPF
- Blood Donation: Government → RPF
- Health: Government → RPF
- Women & Children: Government
- Senior Citizens: Government
- Education: Government, with relevant RPF umbrella capabilities where approved
- Public Grievance: Government → RPF
- Employment: Government + approved private opportunities
- Disaster Support: Government
- Environment: Government → RPF
- Community Activities: HOLD until purpose is defined
- Jan Seva Card: RPF
- Foundation Campaigns/Initiatives: RPF

## Non-Negotiable Product Rules

1. No fake, mock or demo data presented as real.
2. No hard-coded public metrics, campaigns, drives, initiatives or success claims.
3. Every public metric must have a real source and Admin control.
4. Public content follows governance: **Draft → Review/Approval → Published → Archived/Unpublished**.
5. Deleted or disabled data must not reappear through hidden fallback values.
6. External services must be official/verified and controlled through a service registry.
7. No meaningless gamification: no points, badges, levels or leaderboard unless a future real benefit model is explicitly approved.
8. Task recognition is based on verified completion, seva history and certificates where applicable.
9. PDF, image and Excel support are core infrastructure, not one-off features.
10. Existing working functionality should be preserved and upgraded rather than randomly rebuilt.
11. Web and Android APK must remain functionally aligned.
12. Capgo and Codemagic are to be removed from the project/deployment model.

---

# Phase 0 — Baseline Audit & Truth Cleanup

- Complete Web-vs-APK parity audit.
- Identify fake/demo/mock/unused/trash features, files, services, numbers and links.
- Remove or replace fake social content, fake metrics, fake IDs and unsupported claims.
- Audit dead buttons, blank routes, broken redirects and generic placeholder pages.
- Remove obsolete Capgo/Codemagic dependencies and workflows.
- Preserve an audit matrix and classify every finding as Remove, Replace, Repair or Retain.

**Exit:** trusted baseline with known findings documented.

# Phase 1 — Data Governance & Admin Publication Control

- Dynamic campaigns, initiatives, banners, announcements and metrics.
- Add/Edit/Delete/Publish/Unpublish controls.
- Draft → Review → Publish lifecycle.
- Scheduled start/end and archival where relevant.
- Last updated, updated by and audit trail.
- Public APIs expose only approved/published records.

**Exit:** no public organizational content depends on frontend hard-coding.

# Phase 2 — Core Data Model & Migration Discipline

- PostgreSQL schema audit.
- Proper migrations instead of uncontrolled schema drift.
- Constraints, indexes, foreign keys and transaction safety.
- Authoritative IDs for volunteers, applications, certificates and governed records.
- Safe import/export and duplicate prevention.

**Exit:** database is the authoritative source for organizational workflows.

# Phase 3 — Samahit Design System

- Upgrade existing UI rather than replacing the application blindly.
- UMANG-inspired maturity: hierarchy, spacing, cards, search, category discovery and clear actions.
- Samahit-specific branding, icons, typography and assets.
- Unified responsive system for web and Android.
- Consistent empty, loading, error and unavailable states.

**Exit:** reusable design system and primary screens share one visual language.

# Phase 4 — New Dynamic Home Experience

- Search-first entry.
- Admin-published banners/notices.
- Quick Services.
- Recently Used.
- My Applications/Documents where applicable.
- Useful tools.
- Essential verified helplines.
- Government-first discovery.
- RPF services and initiatives where applicable.
- No static fake campaign or metric fallback.

**Exit:** Home is fully data-driven and useful without fabricated content.

# Phase 5 — Government + RPF Service Registry

Each service record should support:

- Name and category
- Provider
- Provider type
- Priority/order
- Coverage
- Description/eligibility
- Official/internal URL
- Contact/email/hours where verified
- Verification status
- Last verified
- Active/inactive state

- Government services use verified official sources.
- RPF services use real internal workflows or approved RPF destinations.
- Private employment entries require an approved provider policy.
- No promotion of other NGOs.

**Exit:** services are registry-driven, searchable and controllable.

# Phase 6 — Service Browser & External Link Safety

- Controlled in-app/browser experience for approved external services.
- Domain allowlists and URL validation.
- Provider/source disclosure.
- Dead-link detection and disable workflow.
- Graceful external-opening fallback where embedding is unsupported.

**Exit:** external dependency is managed rather than treated as random links.

# Phase 7 — Identity, Volunteer & Jan Seva Card

- Real volunteer registration persistence.
- Authoritative Volunteer Registration ID.
- Application status and verification workflow.
- Profile and document management.
- Jan Seva Card as an RPF service.
- QR/verification where approved.
- Session persistence until explicit logout, subject to security rules.

**Exit:** volunteer identity works end-to-end from registration to verified profile/card.

# Phase 8 — Volunteer Task Management & Seva History

Lifecycle:

Create → Assign → Accept/Decline → In Progress → Update → Submit → Review → Complete/Returned/Cancelled.

- Task description, due date, location and coordinator.
- Evidence/photos/documents where required.
- Volunteer progress updates.
- Admin/coordinator review.
- Real task history and service history.
- No points, badges, levels or leaderboard.

**Exit:** task tracking is operational, auditable and useful.

# Phase 9 — Certificates & Verification

- Task/campaign/service certificates where appropriate.
- Admin-approved issue workflow.
- Certificate number and authoritative database record.
- Volunteer/task/date details.
- PDF generation and download.
- Image rendition where needed.
- QR/verification status where approved.
- My Certificates.

**Exit:** certificates are real records, not decorative frontend downloads.

# Phase 10 — Universal File & Document Infrastructure

Support common governed workflows for:

- PDF upload/view/download/share
- Image upload/preview/compression/storage
- Secure document attachments
- File type/size validation
- Ownership/access control
- Audit records

Use one consistent file-management layer rather than separate ad-hoc upload logic.

**Exit:** file handling is reusable across volunteers, tasks, campaigns, grievances and reports.

# Phase 11 — Excel Import & Export Operations

Excel upload flow:

Upload → Template/Column Validation → Preview → Duplicate/Error Detection → Confirm → Import → Audit.

- Downloadable templates.
- Row-level validation.
- Partial/error reporting without silent corruption.
- Error workbook download where useful.
- Controlled bulk import for approved master data and operational records.

Exports may include volunteers, tasks, certificates, campaigns, services, metrics and other approved reports.

**Exit:** admins can perform routine bulk operations without direct database editing.

# Phase 12 — RPF Campaigns, Initiatives & Real Impact

- Campaign/initiative draft, review and publish workflow.
- Real dates, locations, descriptions and media.
- Real metrics with editable source-backed records.
- Add/Edit/Delete controls.
- Archive completed campaigns.
- No fictional Blood Donation Drive or other campaign placeholders.

**Exit:** public RPF activity is administratively controlled and truthful.

# Phase 13 — RPF Social & Media Experience

- Official RPF Instagram account integration, with emphasis on Reels.
- Official RPF YouTube channel/videos.
- Verified social links.
- Safe embed/API/feed strategy with graceful failure states.
- No fake/static social posts masquerading as live content.
- Admin control over featured media where appropriate.

**Exit:** social content is real, current and optional rather than a point of failure.

# Phase 14 — Admin Command Centre & Auditability

Admin controls for:

- Content and publication
- Metrics
- Services/service registry
- Volunteers and applications
- Tasks and certificates
- Campaigns and initiatives
- Files/documents
- Excel import/export
- Helplines and directories
- Social/media settings
- Roles/permissions

Maintain meaningful audit history for sensitive actions.

**Exit:** routine operations do not require developer intervention.

# Phase 15 — Search, Discovery, Documents & Notifications

- Unified service/content search.
- Category and location-aware discovery where real data supports it.
- Recently used services based on real activity.
- My Applications.
- My Documents/Certificates.
- Real notifications and status updates only.
- No fabricated recommendation or activity feed.

**Exit:** users can reliably find, revisit and track what matters.

# Phase 16 — Security, Web/APK Parity & Production Hardening

- Authentication and authorization audit.
- Session persistence/logout correctness.
- Input validation and rate limiting.
- Secure file access.
- Secret/configuration review.
- External URL allowlists.
- Android lifecycle, permissions, files, camera/location where applicable.
- Web-vs-APK regression matrix.
- Performance and accessibility checks.

**Exit:** core workflows behave consistently across supported platforms.

# Phase 17 — Release Certification & Continuous Audit

Before release verify:

- No blank screen or dead CTA in core journeys.
- No fake/demo data presented as real.
- No hard-coded public metric/campaign fallback.
- Publication controls work.
- Volunteer registration ID is authoritative.
- Task lifecycle works end-to-end.
- Certificates/PDF/image workflows work.
- Excel import/export works.
- External links and service browser work safely.
- Instagram/YouTube integrations degrade gracefully.
- Admin controls and audit trails work.
- Web and APK parity passes.
- Build/deployment succeeds without Capgo/Codemagic.
- Production smoke test passes.

Maintain a post-release issue register and continue audit-driven upgrades.

## Execution Rule

**Audit → Govern Data → Stabilize Data Model → Upgrade Design → Build Dynamic Home → Registry/Services → Identity → Volunteer Operations → Documents/Excel → Campaigns/Social → Admin → Discovery → Hardening → Release.**

A phase is not complete merely because a screen exists. Completion requires database/API/admin/UI integration, error states and appropriate verification.
