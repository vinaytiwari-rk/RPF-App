# SAMAHIT 50,000+ Hybrid Question Bank

## Goal

Build a 50,000+ question bank with a hybrid delivery model: versioned, subject-wise packs downloaded once and cached locally. Android and web share the same pack schema.

**Important:** 50,000 is a target, not the current verified count. Do not pad the bank with generated duplicates or mark unverified content as verified.

## Current pack inventory

The branch contains 100 questions across 9 packs:
- Current Affairs: 10
- Constitution & Polity: 20
- General Science: 15
- Indian Geography: 15
- Modern Indian History: 8
- Mathematics / Arithmetic: 8
- English Grammar & Vocabulary: 8
- Economics & Civics: 8
- Biology & Human Body: 8

The 40-question second batch adds original bilingual questions across History, Mathematics, English, Economics/Civics, and Biology. The remaining gap to 50,000 is 49,900. These are pilot packs and still require full editorial/source review; do not call the whole bank 50,000+ or fully verified yet.

## Using Lucent / Arihant as study references

Lucent and Arihant are useful guides for deciding topic coverage—such as history, geography, polity, general science, mathematics, English, economy, and general awareness. This repository's new questions are independently worded practice questions based on standard syllabus concepts. They are **not copied** from their question banks, explanations, or distinctive text. If a specific edition or table of contents is provided, use it as a topic checklist, then author original questions and independently verify facts.

## Current state found on `main`

- The original Online Test Center imports `QUIZ_TOPICS` from `src/data/quiz/quizQuestionBank.ts`.
- `src/routes/educationRoutes.ts` contains a separate three-question demo array.
- This branch adds versioned packs, a source registry, validation tooling, manifest generation, metadata-only source candidate collection, and portal integration for manifest-listed packs.
- The legacy bundled bank remains separate from the 100-pack-question count and must be migrated/deduplicated before counting it in the canonical total.

## Pack format

Store UTF-8 JSON packs under `data/question-bank/packs/<subject>/<pack-id>.json`. Each pack has `packId`, `version`, `subject`, optional `category`, `questionCount`, and `questions`.

Each question must have a stable globally unique `id`, English and Hindi question/option/explanation strings, four options per language, and a zero-based `correctIndex`. Current-affairs questions additionally require `type: "current_affairs"`, `source.sourceId`, `source.articleUrl`, and `source.verifiedAt`. Prefer publication date, fact-check URL, and reviewer metadata.

Questions must use original wording. Store factual metadata and source links, not copied article paragraphs, publisher summaries, or scraped article text.

## Current-affairs source policy

1. **PIB:** Primary official source for government announcements; verify facts from the official release.
2. **SarkariTel:** Manual discovery/cross-check only until a supported feed/API and reuse terms are confirmed.
3. **Drishti IAS:** Feeds may be used for discovery; independently verify facts and write original questions.
4. **The Hindu:** Reference source only until current feed/content terms are confirmed; retain links, not article text.
5. **Times of India:** Automated ingestion/storage/republishing remains disabled until permission/licensing is confirmed. Use independently verified facts and source links only.

A source mention is not proof of accuracy. Cross-check changeable facts with a primary source and record the verification date. Current-affairs packs should be date-labelled and reviewed periodically.

## Hybrid delivery plan

1. Generate a manifest with pack IDs, versions, compressed sizes, SHA-256 hashes, language coverage, and question counts.
2. Host packs as static files on existing hosting/CDN; no new API server is required.
3. Fetch the manifest with conditional caching. Download only missing or changed packs.
4. Validate SHA-256 before caching; keep the last known-good pack if an update fails.
5. Use persistent IndexedDB or a compatible Capacitor store, not in-memory state/sessionStorage, for offline persistence.
6. Randomize question and option order locally with correct-answer mapping preserved.
7. Local scoring is suitable for practice. Official/high-stakes scores and certificates require server-side validation.
8. Editorial review is separate from source discovery; only reviewed questions become published packs.

## Source registry and validation

See `data/question-bank/sources.json`. Run:

```sh
npm run quiz:bank:validate
```

The validator checks pack structure, bilingual fields, four options, correct-answer bounds, duplicate IDs, possible duplicate wording, current-affairs source metadata, and the measured count. The candidate collector stores metadata only and does not create questions.

## Rollout acceptance criteria

- 50,000+ distinct question IDs; duplicate IDs absent and duplicate-text warnings reviewed.
- Every current-affairs question has a source URL and verification date; facts are cross-checked.
- Answers/explanations pass editorial review.
- Hindi and English options preserve equivalent meaning and order.
- Integrity hashes pass; corrupt downloads do not overwrite valid cache.
- Offline startup, cache updates, low storage, and restart are tested on Android and Chrome.
- Server transfer volume is measured from actual compressed pack sizes before capacity claims.
