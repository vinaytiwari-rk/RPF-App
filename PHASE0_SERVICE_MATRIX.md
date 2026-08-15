# Phase 0 — Service / Implementation Matrix

Date: 2026-08-15

This matrix is conservative. A route or card is not considered a working feature unless the intended user workflow is implemented.

## Status legend

- WORKING — real workflow is implemented and build-safe; device/runtime verification may still be required.
- LOCAL — device-only/local-first by design.
- BACKEND — requires RPF backend and must be verified end-to-end.
- PARTIAL — meaningful implementation exists but production paths remain incomplete.
- PLACEHOLDER — catalog/route exists but real workflow is missing or depends on generic CMS content.
- BROKEN — known blocking defect.
- REWRITE — existing implementation should be replaced with a better local/native implementation.

## Confirmed matrix

| Service | Current route | Current implementation | Phase 0 disposition |
|---|---|---|---|
| Jan Seva Card | /jan-seva-card | Dedicated page + backend application flow | BACKEND |
| Blood Network | /blood-network | Dedicated page + backend data | BACKEND |
| Donations | /donations | Dedicated page + backend | BACKEND |
| Grievances | /grievance | Dedicated page + backend | BACKEND |
| Volunteering | /services/volunteers | Generic service route unless dedicated route exists | PARTIAL / BACKEND |
| Health Care | /health-care | Dedicated page | PARTIAL / BACKEND |
| Jobs Portal | /services/jobs | Generic service route | PLACEHOLDER until content/workflow verified |
| Scholarships | /services/scholarships | Generic service route | PLACEHOLDER until content/workflow verified |
| Food Support | /services/food | Generic service route | PLACEHOLDER |
| Medicine Support | /services/medicine | Redirects to Health Care clinical tab | PARTIAL |
| Education Aid | /services/education | Generic service route | PLACEHOLDER |
| Women Safety | /services/women-safety | Generic service route | PLACEHOLDER |
| Senior Citizens | /services/seniors | Generic service route | PLACEHOLDER |
| Animal Welfare | /services/animals | Generic service route | PLACEHOLDER |
| Environment | /services/environment | Generic service route | PLACEHOLDER |
| Crowdfunding | /services/crowdfunding | Generic service route | PLACEHOLDER / BACKEND |
| Culture | /culture | Dedicated page | PARTIAL / BACKEND |
| Disaster Management | /services/disaster | Generic service route | PLACEHOLDER |
| Farmer Support | /services/farmer | Generic service route | PLACEHOLDER / EXTERNAL DATA |
| Government Schemes | /services/schemes | Generic service route | PLACEHOLDER |
| Skills Training | /services/skills | Generic service route | PLACEHOLDER |
| Global Guide | /services/countries | Generic service route | PLACEHOLDER |
| Earthquakes | /services/earthquakes | Generic service route; catalog claims live USGS | BACKEND / EXTERNAL DATA |
| Fuel Tracker | /services/fuel-tracker | Generic service route | REWRITE as local-first utility |
| GPS Toolkit | /services/gps-toolkit | Generic service route | REWRITE as native/device-first utility |
| Vitals Dashboard | /services/vitals | Generic service route | REWRITE as local/private utility; never invent sensor/BP values |
| Med Reminder | /services/medications | Generic service route | REWRITE as local/private utility |
| Medical Dictionary | /services/medical-dict | Generic service route | LOCAL candidate |
| SOS System | /services/sos | Generic service route | REWRITE as native device capability utility |
| Period Tracker | /services/period-tracker | Generic service route | REWRITE as local/private utility |
| Child Tracker | /services/child-tracker | Generic service route | REWRITE as local/private utility |
| Resume Builder | /resume-builder | Dedicated page + local PDF; AI path uses backend | PARTIAL; local-first base should remain usable |
| Document Scanner | /doc-scanner | Camera + filters + PDF + local scan library | PARTIAL; native Android/iOS camera adapter still required |
| AI Assistant | /services/ai-chat | Generic service route | BACKEND / paid API dependency |
| Audiobooks | /services/story-library | Generic service route | PLACEHOLDER |
| Hindu Calendar | /hindu-calendar | Dedicated page | PARTIAL / LOCAL candidate |
| News Feed | /news | Dedicated page | BACKEND / external feeds |
| Internet Radio | /internet-radio | Dedicated page | EXTERNAL STREAMS |
| Transit Planner | /services/transit-planner | Generic service route | EXTERNAL / BACKEND candidate |
| Youth Empowerment | /services/youth | Generic service route | PLACEHOLDER |
| Nation Building | /services/nation | Generic service route | PLACEHOLDER |

## Architecture findings

1. `Services.tsx` routes most catalog entries to `/services/:id`, which renders a generic CMS-backed details page. This must not be treated as implementation.
2. `ServiceDetails.tsx` renders CMS HTML using `dangerouslySetInnerHTML`; CMS sanitization/allowlisting must be verified before production.
3. `Services.tsx` performs external search through `/api/search/external` on search input. This adds backend/external-search traffic and should later become a dedicated Web Services/Browser Hub workflow rather than a default service search dependency.
4. `AppContext` polls several backend endpoints every 10 minutes and notifications every minute. This is functional but should be optimized later to event-driven or longer-interval refresh where appropriate.
5. `DocScanner` is now build-verified after the WebView stream attachment fix, but native Capacitor camera lifecycle/permission adapters are still required before Android/iOS production certification.
6. `capacitor.config.ts` supports Android/iOS configuration, but the inspected package manifest does not include `@capacitor/ios`; iOS packaging is therefore not yet release-ready.

## Phase 0 rule

Do not label generic CMS pages as completed utilities. Replace eligible generic utilities with local-first implementations instead of creating unnecessary backend endpoints.
