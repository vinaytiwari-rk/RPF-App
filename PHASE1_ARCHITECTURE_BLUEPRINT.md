# Phase 1 — Architecture & Foundation

Status: STARTED
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

## Capability groups

- Camera / microphone / media
- Geolocation / motion / orientation / sensors
- Files / Photos / Downloads
- Notifications / reminders / haptics
- Contacts / Phone / SMS / Calendar
- Share / Print / Browser / Maps
- Bluetooth / NFC where platform permits
- Biometrics / secure storage

The existing `src/lib/deviceCapabilities.ts` is the first implementation of this boundary. Future Capacitor-native adapters should implement the same user-facing contracts rather than leaking platform-specific code into pages.

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

## Phase 1 exit criteria

A new utility can be implemented without directly importing Android/iOS-specific code into its page; it can detect unavailable capabilities; it can operate locally where appropriate; and backend usage is explicit rather than accidental.
