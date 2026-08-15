# RPF Seva App — Phase 2 Visual & UX Enhancement

## Product identity
- Primary product name: **RPF Seva App**.
- Core identity: **Seva, Samarpan & Sankalp** / **सेवा, समर्पण एंड संकल्प**.
- Tricolour is the visual anchor, not the only palette.
- Supporting colours may include red, yellow, green, purple, black, light sky blue, pink and brown where they improve semantic clarity and visual hierarchy.

## Application-wide UX
- Apply consistent entrance/scroll-reveal, card, icon, tab and interaction motion across Home, Explore, Activity, Impact and Me.
- Use gradient icons and tasteful micro-interactions throughout the application.
- Preserve accessibility and reduced-motion compatibility.
- Avoid excessive blue dominance.

## Home requirements
- Keep the premium animated hero and RPF Seva App branding.
- Keep **Weather, AQI and Quote of the day** visible on Home; remove only the unwanted solid blue strip treatment.
- Keep a **real-visual carousel**. Use genuine photographic/real-world foundation assets where available; avoid cartoonish illustrations.
- Keep Founder visibility with a real founder image and provide a complete Founder Message route.
- Do not duplicate the same impact-number block on both Home and Impact.
- Replace generic Quick Actions with creative, emotionally connecting service pathways.
- **Join the Seva** must route to **Jan Seva Card**; it should not be an unresolved standalone destination.

## Me / Profile
- Profile must never render as a blank screen.
- Provide resilient profile identity, Jan Seva Card, activity, notifications and language controls with animated gradient iconography.

## Founder Message
- Provide a dedicated full-message screen with the founder image, complete message and Jan Seva Card CTA.

## Current implementation fixes
- Restored Home Weather/AQI/Quote section.
- Restored Home carousel using repository foundation assets.
- Restored Founder image and added dedicated full Founder Message screen.
- Replaced the blank Me/Profile implementation with a resilient animated profile surface.
- Routed Join the Seva to Jan Seva Card.

## Exit criteria
- Home, Explore, Activity, Impact and Me share one coherent visual/motion system.
- No blank primary screen or dead CTA remains.
- Home contains Weather, AQI, Quote, real-visual carousel and Founder entry.
- Founder Message is complete and reachable.
- Jan Seva Card is the canonical Join the Seva destination.
- Impact numbers are intentionally shown in one primary location only.
- Build/type checks pass before Phase 2 is closed.
