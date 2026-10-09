# SAMAHIT 50,000+ Hybrid Question Bank

## Goal

Build a 50,000+ question bank with a hybrid delivery model: bundled starter questions plus versioned, compressed, subject-wise packs downloaded once and cached locally. The Android app and web portal should share the same question schema and pack format.

**Important:** 50,000 is a target, not the current verified count. The validator reports the actual number of questions found in pack files and warns until the target is reached. Do not pad the bank with generated duplicates or mark unverified content as verified.

## Current state found on `main`

- The main Online Test Center imports `QUIZ_TOPICS` from `src/data/quiz/quizQuestionBank.ts`.
- `src/routes/educationRoutes.ts` contains a separate three-question demo array; it is not the same question bank.
- The existing `QuizQuestion` model has no source URL, publication date, verification date, subject metadata per question, or source attribution.
- This branch adds the scalable pack contract, source registry, validation tooling, build scripts, metadata-only source candidate collection, and portal integration for manifest-listed packs. It does not claim that 50,000 questions have already been authored or verified.

## Pack format

Store UTF-8 JSON packs under `data/question-bank/packs/<subject>/<pack-id>.json`. A pack has `packId`, `version`, `subject`, optional `category`, `questionCount`, and `questions`.

Each question must have a stable globally unique `id`, English and Hindi question/option/explanation strings, four options per language, and a zero-based `correctIndex`. Current-affairs questions must additionally contain:

- `type: "current_affairs"`
- `source.sourceId` from `sources.json`
- `source.articleUrl` linking to the reference
- `source.verifiedAt` in `YYYY-MM-DD` format
- Preferably `source.publishedAt`, `source.factCheckUrl`, and a reviewer identifier

The content of every question must be written in original wording. Store factual metadata and a link, not copied article paragraphs, publisher summaries, or scraped article text.

## Current-affairs source policy

1. **PIB:** Primary official source for government announcements. Use the official RSS endpoint for discovery and open the linked release to verify facts.
2. **SarkariTel:** Use for discovery/cross-check only until a supported feed/API and reuse terms are confirmed.
3. **Drishti IAS:** English and Hindi RSS endpoints are registered for discovery. Independently verify factual claims and write original questions.
4. **The Hindu:** Registered as a reference source. Check the current feed/content terms before automated ingestion; retain source links, not article text.
5. **Times of India:** Its published RSS terms restrict redistribution and commercial use. Automated feed ingestion, storage, or republishing must remain disabled until written permission/licensing is confirmed. Use independently verified facts and article URLs only.

A source mention is not proof that a fact is correct. For changeable facts, cross-check with an official primary source where possible and record the verification date. Current-affairs packs should be date-labelled and periodically reviewed/retired.

## Hybrid delivery plan

1. Generate a small manifest containing pack IDs, versions, compressed sizes, SHA-256 hashes, language coverage, and question counts.
2. Bundle only a small starter pack; host other packs as static files on the existing hosting/CDN, not a new API server.
3. On app start, fetch the manifest using conditional caching (ETag/Last-Modified). Download only missing or changed packs.
4. Validate SHA-256 before saving to IndexedDB. Keep the last known-good pack if an update fails.
5. Use IndexedDB in the web app and a compatible persistent local store for Capacitor Android; do not rely on in-memory state or sessionStorage for offline persistence.
6. Randomize question and option order locally, with a stable attempt seed so an attempt can be resumed.
7. For practice mode, local scoring is acceptable. For official/high-stakes results or certificates, validate submissions server-side because client-side answer keys can be inspected.
8. Keep publisher article ingestion separate from question-pack publishing. Reviewers approve each question before it enters a published pack.

## Current pilot packs

The branch currently contains 60 pack questions: 10 source-attributed current-affairs pilot questions, 20 Constitution & Polity questions, 15 General Science questions, and 15 Indian Geography questions. This is a small working pilot, not the 50,000-question target. The legacy bundled bank is separate and should not be added to the published-pack count unless migrated and deduplicated.

The Online Test Center now reads pack descriptors from the generated manifest and can open any listed pack, rather than hardcoding only the Current Affairs pack ID. The manifest is cached locally for offline catalog display; each question pack must be downloaded once before it can be used offline.

## Source registry

See `data/question-bank/sources.json`. The registry deliberately marks some feeds as metadata-only/manual until their usage terms are confirmed. Run `node scripts/collectQuestionSourceCandidates.mjs` to collect candidate metadata from feeds explicitly marked for automated metadata discovery. The script does not create questions or copy article body text; each candidate still requires human fact-checking and original question wording.

## Validation and source discovery

Run:

```sh
npm run quiz:bank:validate
```

The validator checks pack structure, required bilingual fields, four options, correct-answer bounds, globally duplicate IDs, possible duplicate question wording, and source metadata on current-affairs questions. It reports the actual count and how many questions remain before the 50,000 target.

## Rollout acceptance criteria

- 50,000+ distinct question IDs; no duplicate IDs and duplicate-text warnings reviewed.
- Every current-affairs question has source URL and verification date; source facts are cross-checked.
- All correct answers and explanations pass editorial review.
- Hindi and English options preserve the same option order and meaning.
- Pack integrity hashes pass; corrupt downloads do not overwrite cached valid packs.
- Test offline startup, cache updates, low storage, and app restart on Android and Chrome.
- Verify server request/transfer volume using actual compressed pack sizes before claiming a capacity number.
