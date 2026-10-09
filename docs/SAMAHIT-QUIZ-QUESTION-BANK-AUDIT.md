# SAMAHIT Mock Test Question Bank Audit

Audit date: 2026-10-09

## Findings

- The original question bank is hardcoded in `src/data/quiz/quizQuestionBank.ts`; it does not fetch questions live from a government website or question API.
- The former “Daily Current Affairs 2026” label was misleading for an offline static bank. It has been renamed to “Government Programmes & Public Institutions” and explicitly says it is not a live daily-news feed.
- Four entries had unsupported or mismatched wording (BharatNet claim, “recently” current CDS office-holder, a mismatched UPI question, and PM-KISAN prompt/answer mismatch). These have been rewritten, and source URLs/review dates added.
- New source-linked questions have been added to Constitution, History, Science and Computer Literacy; additional reasoning questions are derived from explicit logic/arithmetic rules.
- Legacy questions outside the reviewed entries have not all been independently fact-checked yet. Do not describe the entire bank as fully verified until every legacy item has a source-level review.

## Question counts after this change

| Topic | Count |
|---|---:|
| Government Programmes & Public Institutions | 10 |
| Constitution & Polity | 13 |
| Indian History | 13 |
| General Science | 13 |
| Reasoning & Mental Ability | 11 |
| Computer & Cyber Literacy | 11 |
| **Total** | **71** |

## Primary source references added

- BharatNet: https://bbnl.nic.in/
- Ministry of Defence: https://www.mod.gov.in/
- PM-KISAN: https://services.india.gov.in/service/detail/pm-kisan-samman-nidhi
- NPCI — UPI: https://www.npci.org.in/what-we-do/upi/product-overview
- Constitution of India: https://www.legislative.gov.in/static/uploads/2025/07/c9fe9c9b6840524844316f74bb1c556c.pdf
- UNESCO — Sanchi: https://whc.unesco.org/en/list/524/
- Azadi Ka Amrit Mahotsav — Quit India Movement: https://amritmahotsav.nic.in/quit-india-movement.htm
- NIST — Speed of Light: https://physics.nist.gov/cgi-bin/cuu/Value?c
- NASA Climate Kids — Carbon Cycle: https://climatekids.nasa.gov/carbon/
- BIPM — SI Brochure: https://www.bipm.org/en/publications/si-brochure
- IETF — TLS 1.3: https://www.rfc-editor.org/rfc/rfc8446
- CERT-In: https://www.cert-in.org.in/
- NIST — Digital Identity Guidelines: https://pages.nist.gov/800-63-3/sp800-63b.html

## Validation still required

- Run lint, TypeScript and production build.
- Add automated checks for unique question IDs, four answer options, valid correctIndex, bilingual option parity and source metadata.
- Human review all 71 questions and confirm source pages before calling the entire bank verified.
- Offline random selection varies attempts on one device, but does not coordinate global uniqueness across devices.
