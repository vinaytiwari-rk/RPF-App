# Bulk Question Authoring and Import

The question bank is expanded in reviewed batches, not by copying Lucent/Arihant or fabricating filler questions.

## JSONL input

Create one JSON object per line in an UTF-8 .jsonl file. Every record must be editorially approved and confirm original wording before import.

Example record:

~~~json
{"id":"polity-000001","subject":"Constitution & Polity","subjectHi":"संविधान एवं राजव्यवस्था","topic":"Fundamental Rights","questionEn":"Which part of the Constitution of India contains Fundamental Rights?","questionHi":"भारतीय संविधान के किस भाग में मौलिक अधिकार दिए गए हैं?","optionsEn":["Part I","Part II","Part III","Part IV"],"optionsHi":["भाग I","भाग II","भाग III","भाग IV"],"correctIndex":2,"explanationEn":"Part III (Articles 12–35) contains Fundamental Rights.","explanationHi":"भाग III (अनुच्छेद 12–35) में मौलिक अधिकार दिए गए हैं।","reviewStatus":"approved","originalityConfirmed":true,"reviewer":"editorial-review","type":"static_gk"}
~~~

For Current Affairs, also provide:

~~~json
"source":{"sourceId":"pib","articleUrl":"https://pib.gov.in/REAL-RELEASE-URL","verifiedAt":"2026-10-09","publishedAt":"2026-10-08","factCheckUrl":"https://pib.gov.in/REAL-RELEASE-URL"}
~~~

Do not use placeholder URLs. Current-affairs records without a real HTTPS source and verification date are rejected.

## Import

~~~sh
npm run quiz:bank:import -- ./data/question-bank/batches/approved-batch.jsonl
npm run quiz:bank:validate
npm run quiz:bank:manifest
~~~

Optional pack size (1–1000):

~~~sh
QUIZ_PACK_SIZE=500 npm run quiz:bank:import -- ./data/question-bank/batches/approved-batch.jsonl
~~~

The importer:
- rejects records not marked reviewStatus=approved;
- requires originalityConfirmed=true;
- rejects duplicate IDs and duplicate English question wording within the batch;
- requires four bilingual options and a valid correct-answer index;
- requires source metadata for Current Affairs;
- never overwrites an existing pack.

## Quality and volume policy

50,000 is a target, not a generated-count claim. A question is counted only when it passes structural validation and editorial/fact review. Templates can help draft questions but must not be used to multiply one fact into meaningless variants. Maintain an audit trail for source, verification date, reviewer, and corrections.
