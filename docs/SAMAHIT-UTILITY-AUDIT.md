# SAMAHIT Utility Functional Audit

Date: 2026-10-09
Scope: `UTILITY_TOOLS` catalog, `UtilityToolRunnerModal.tsx`, and `EverydayToolPage.tsx`.

## Static checks

- 50 catalog tool definitions found.
- All 50 IDs map to dispatcher cases; no duplicate catalog IDs or orphan dispatcher cases found.
- The main utility runner and Everyday Tools both use the Android `NativeDownloads` plugin for native saves.
- Everyday Tools file exports route through the shared save helper; no direct `jsPDF.save()` bypass found.
- No direct `fetch()` or Axios network request found in the main utility engine source.
- Photo Metadata Cleaner now waits for blob creation and the shared save call before finishing; its duplicate premature success toast was removed.
- Customer Khata Book now validates saved local data and catches localStorage write failures.

## Functional risks / limitations found

1. **Reminders:** records are stored locally, but background notifications/alarms are explicitly not enabled. The current tool is a local reminder list, not a dependable alarm.
2. **Fertilizer & seed calculator:** uses hard-coded illustrative crop rates and an approximate bigha conversion. A warning now tells users to confirm rates with local agricultural guidance and soil tests.
3. **Land converter:** assumes 1 bigha = 27,225 sq ft. A visible warning now explains that local bigha definitions vary by state/district.
4. **CGPA converter:** uses common CBSE/AICTE/general formulas, which are not universal. Input is now validated to 0–10 and the output is labelled as an estimate with a board/university rules disclaimer.
5. **Emergency directory:** replaced the 1090 entry with 181 for the Women Helpline and 108 with 102 for the National Ambulance Service. The integrated 112 emergency number remains listed.
6. **Scam Alert Checklist:** currently provides a fixed awareness checklist; it does not inspect a pasted message or automatically classify scams. The current “detector” wording overstates its capability and should be renamed or upgraded in a later pass.
7. **On-device validation:** CI/static checks cannot prove that every tool behaves correctly on every Android device. Native download success still needs a physical-device test with PDF, image and QR outputs. Large files, corrupt PDFs, camera behavior and Android storage exhaustion also need device-level coverage.

## Validation boundary

The automated script is intentionally a static consistency audit. It does not claim that all 50 tools have been fully functionally tested or that all Android device conditions are covered.
