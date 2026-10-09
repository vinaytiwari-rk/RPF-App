#!/usr/bin/env node
/**
 * Collect metadata-only current-affairs candidates from approved discovery feeds.
 * Never stores article body, full text, or publisher summaries as questions.
 * Run manually: node scripts/collectQuestionSourceCandidates.mjs
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import Parser from "rss-parser";

const root = process.cwd();
const registryPath = path.join(root, "data", "question-bank", "sources.json");
const queuePath = path.join(root, "data", "question-bank", "review-queue", "current-affairs-candidates.json");
const parser = new Parser({ timeout: 15000, headers: { "User-Agent": "SAMAHIT-QuestionBank-Research/1.0 (metadata-only; contact RP Foundation)" } });

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const permittedFeeds = (registry.sources ?? []).filter((source) =>
  source.currentAffairs === true &&
  source.automatedMetadataFetch === true &&
  typeof source.feedUrl === "string" &&
  source.feedUrl.startsWith("https://")
);

const existing = fs.existsSync(queuePath)
  ? JSON.parse(fs.readFileSync(queuePath, "utf8"))
  : { schemaVersion: 1, updatedAt: null, policy: "Metadata only; each candidate requires human fact-check and original question wording.", candidates: [] };

const byUrl = new Map((existing.candidates ?? []).map((item) => [item.articleUrl, item]));
const errors = [];

for (const source of permittedFeeds) {
  const feedUrls = [source.feedUrl, source.hindiFeedUrl].filter(Boolean);
  for (const feedUrl of feedUrls) {
    try {
      const feed = await parser.parseURL(feedUrl);
      for (const item of feed.items ?? []) {
        const articleUrl = typeof item.link === "string" ? item.link : "";
        if (!articleUrl.startsWith("https://")) continue;
        const candidate = {
          sourceId: source.id,
          sourceName: source.name,
          articleUrl,
          publishedAt: item.isoDate ?? item.pubDate ?? null,
          feedUrl,
          titleForReviewOnly: item.title ?? "",
          status: "needs_human_fact_check",
          collectedAt: new Date().toISOString()
        };
        // Store only short feed metadata for editor review. Never treat this as a question.
        byUrl.set(articleUrl, { ...(byUrl.get(articleUrl) ?? {}), ...candidate });
      }
    } catch (error) {
      errors.push(`${source.id} (${feedUrl}): ${error.message}`);
    }
  }
}

const output = {
  schemaVersion: 1,
  updatedAt: new Date().toISOString(),
  policy: "Metadata-only candidate queue. Titles are for editorial review, not question content. Write original questions, verify facts against primary sources, and check publisher reuse terms before redistribution.",
  automatedSources: permittedFeeds.map((source) => source.id),
  manualReviewSources: (registry.sources ?? []).filter((source) => source.currentAffairs && !source.automatedMetadataFetch).map((source) => source.id),
  candidates: [...byUrl.values()].sort((a, b) => String(b.publishedAt ?? "").localeCompare(String(a.publishedAt ?? "")))
};

fs.mkdirSync(path.dirname(queuePath), { recursive: true });
fs.writeFileSync(queuePath, JSON.stringify(output, null, 2) + "\n", "utf8");
console.log(`Question-source candidates saved: ${output.candidates.length}`);
console.log(`Automated metadata sources: ${output.automatedSources.join(", ") || "none"}`);
console.log(`Manual review only: ${output.manualReviewSources.join(", ") || "none"}`);
if (errors.length) {
  for (const error of errors) console.error("FEED ERROR:", error);
  process.exitCode = 1;
}
