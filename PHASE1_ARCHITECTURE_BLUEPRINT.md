# Phase 1 — Architecture & Foundation

Status: COMPLETE
Date: 2026-08-15

## Architectural rules

1. Device First — use Android/iOS capabilities before introducing a server dependency.
2. Local First — personal utility data stays on the user's device by default.
3. Offline First — core utilities remain useful without network access.
4. Backend Last — server APIs are reserved for genuinely centralized RPF data/workflows.
5. Capability Detection — never assume camera, GPS, sensors, notifications, files, NFC, Bluetooth or biometrics exist.
6. Platform Adapters — Android and iOS differences are isolated behind reusable capability services.
7. Feature Isolation — each utility has UI, domain logic and device/data adapters separated so it can be replaced without rewriting unrelated features.
8. External Web — government/public services use a controlled web-service layer with an in-app web experience where supported and browser fallback where required.
9. Privacy by default — no personal document/photo/audio/location data is uploaded unless a feature explicitly requires it and the user initiates it.
10. No fake success — unavailable capability, permission denial, offline state and service failure must have explicit UI states.

## Target layers

```text
Presentation / UI
        ↓
Feature Modules
        ↓
Domain Services
        ↓
Capability + Local Data Adapters
        ↓
Android / iOS / Browser
        ↓
Optional RPF Backend
```

## Phase 1 implementation boundaries

- `src/lib/deviceCapabilities.ts` — capability detection and safe device operations.
- `src/lib/capabilityAdapters.ts` — platform-neutral adapter contract and central adapter entry point.
- `src/lib/capabilityGuards.ts` — explicit capability/permission checks before device operations.
- `src/lib/platform.ts` — centralized Android/iOS/Web/unknown platform detection.
- `src/lib/permissions.ts` — normalized cross-platform permission contract.
- `src/lib/featureState.ts` — ready/loading/offline/permission-denied/unsupported/error state contract.
- `src/lib/featureModule.ts` — feature-module context and standard async state runner.
- `src/lib/localData.ts` — compatibility contract for small synchronous local settings.
- `src/lib/localStore.ts` — IndexedDB-first local record persistence with a restricted localStorage fallback.
- `src/lib/externalWeb.ts` — HTTPS-only external-service allowlist boundary.

Native Capacitor adapters can be introduced behind `CapabilityAdapter` without importing Android/iOS APIs into feature pages. The current web adapter deliberately provides the browser/WebView implementation while preserving the native replacement boundary.

## Capability groups

- Camera / microphone / media
- Geolocation / motion / orientation / sensors
- Files / Photos / Downloads
- Notifications / reminders / haptics
- Contacts / Phone / SMS / Calendar
- Share / Print / Browser / Maps
- Bluetooth / NFC where platform permits
- Biometrics / secure storage

## Data ownership

### Device-owned

Notes, tasks, expenses, scans, personal documents, fitness history, calculator history, bookmarks, local settings and other personal utility data.

### RPF-owned backend

Volunteer records, official events, grievances, campaigns, official content, administrator workflows and other genuinely shared records.

### External/public

Government portals, public web services and third-party information sources. These are not copied into RPF storage unless a feature explicitly needs a cached, legally appropriate representation.

## Phase 1 deliverables

- Capability abstraction and feature-detection contracts.
- Platform detection and safe fallbacks.
- Local storage contract for utility modules.
- Standard loading/error/offline/permission-denied states.
- Route/feature module boundaries.
- Web-service abstraction with external-domain allowlisting.
- Android/iOS readiness without building APK/IPA.
- Architecture documentation and migration rules for new features.

## Exit verification

A new utility can depend on `FeatureModuleContext` and `CapabilityAdapter` rather than Android/iOS-specific APIs. Device availability and permissions are explicit, local persistence has an IndexedDB-first boundary, standard feature states are reusable, and external services are forced through the HTTPS allowlist. APK/IPA creation and native runtime verification remain intentionally deferred to the later native/build phases.

## Phase 1 exit criteria

A new utility can be implemented without directly importing Android/iOS-specific code into its page; it can detect unavailable capabilities; it can operate locally where appropriate; and backend usage is explicit rather than accidental.

**Phase 1 status: CLOSED at architecture/source level.**
