# SAMAHIT Hybrid Question Bank

- Add original bilingual JSON packs under `data/question-bank/packs/<subject>/`; never reuse pack or question IDs.
- Every question needs Hindi and English text, four aligned options, one correct index, and bilingual explanations.
- Current-affairs questions require a real source URL/name, actual verification date, and fact-check URL. Never mark unchecked facts verified.
- Use PIB as a primary current-affairs fact-check source. Use secondary publishers within available licensing terms; do not bulk-copy article text.
- The build should validate pack schema, duplicates against the built-in bank, answer keys, and SHA-256 manifest generation.
- Online Test Center must load packs through the same quota-based test engine and use IndexedDB for offline caching.
- Device-level offline/cache-update tests remain required before declaring offline mode fully verified.
