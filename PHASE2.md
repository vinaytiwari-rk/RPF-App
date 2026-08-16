# RPF Seva App — Phase 2 Visual & UX Enhancement

## Status
**COMPLETE — source and CI/deployment baseline verified.**

## Product identity
- Primary product name: **RPF Seva App**.
- Core identity: **Seva, Samarpan & Sankalp** / **सेवा, समर्पण एंड संकल्प**.
- Tricolour is the visual anchor, not the only palette.
- Supporting colours may include red, yellow, green, purple, black, light sky blue, pink and brown where they improve semantic clarity and visual hierarchy.

## Application-wide UX
- Consistent entrance/scroll-reveal, card, icon, tab and interaction motion across Home, Explore, Activity, Impact and Me.
- Gradient icons and tasteful micro-interactions throughout the primary navigation and profile actions.
- Accessibility and reduced-motion compatibility preserved by using motion as progressive enhancement.
- Avoid excessive blue dominance; semantic supporting colours are used where appropriate.

## Home requirements
- Premium animated hero and **RPF Seva App** branding.
- **Weather, AQI and Location** remain visible, with Quote of the Day below them.
- Quote source integration supports BrainyQuote first and AZQuotes fallback.
- Real-visual automatic carousel retained with photographic/community imagery; founder portrait is not used as a carousel slide.
- Founder preview remains visible with a direct full Founder Message/Speech route.
- Impact numbers are not duplicated between Home and Impact.
- Generic Quick Actions replaced with emotionally connecting service pathways.
- **Join the Seva** routes to **Jan Seva Card** as the canonical destination.
- Official RP Foundation social/website links are visible as gradient icons.

## Me / Profile
- Me never intentionally renders as a blank screen.
- Profile photo upload is local-only and does not alter backend profile data.
- Header avatar synchronizes through the `rpf-avatar-changed` event.
- Volunteer No. and Volunteer Since are loaded from the authenticated volunteer record when available, with explicit pending/loading states rather than blank placeholders.
- Jan Seva Card, My Certificates, Settings and Logout are implemented routes/actions.
- My Digital Forms, My Activity and My Notifications are intentionally not duplicated in Me.
- Contact options are rendered only when a real configured destination exists; no empty `href`/dead contact CTA is shown.
- Settings provides usable language, notifications, Daily Quote and haptic controls, with a roadmap for future personalization.
- Logout is always available.

## Founder Message
- Dedicated full-message screen with founder image, complete message and Jan Seva Card CTA.

## Exit criteria
- Home, Explore, Activity, Impact and Me share one coherent visual/motion system.
- No blank primary screen or intentionally dead CTA remains.
- Home contains Location, Weather, AQI, Quote, real-visual carousel and Founder entry.
- Founder Message is complete and reachable.
- Jan Seva Card is the canonical Join the Seva destination.
- Impact numbers are intentionally shown in one primary location only.
- Me/Profile contains only actionable/implemented destinations and graceful loading/empty states.
- Build/type checks pass before release/deployment.
