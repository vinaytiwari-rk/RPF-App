import express from "express";
import axios from "axios";
import Parser from "rss-parser";
import https from "https";
import * as cheerio from "cheerio";
import { pool } from "../db/dbPool.js";
import { authenticateToken, requireAdmin } from "../db/middleware.js";

const router = express.Router();

const rssParser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: false }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: false }],
      ["enclosure", "enclosure"],
      ["content:encoded", "contentEncoded"]
    ]
  }
});

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const customHeaders = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
};

export interface RssFeedConfig {
  id: string;
  name: string;
  nameHi: string;
  url: string;
  category: string;
  enabled: boolean;
}

export const DEFAULT_RSS_FEEDS: RssFeedConfig[] = [
  {
    id: "pib-hindi",
    name: "PIB National (प्रेस सूचना ब्यूरो)",
    nameHi: "प्रेस सूचना ब्यूरो (भारत सरकार)",
    url: "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=2&Regid=3&reg=48",
    category: "Government",
    enabled: true
  },
  {
    id: "google-news-hindi",
    name: "Google News India (Hindi)",
    nameHi: "गूगल समाचार भारत (हिंदी)",
    url: "https://news.google.com/rss?hl=hi&gl=IN&ceid=IN:hi",
    category: "National",
    enabled: true
  },
  {
    id: "sarkari-jobs",
    name: "Sarkari Naukri & Employment Alerts",
    nameHi: "सरकारी नौकरी एवं रोजगार अलर्ट",
    url: "https://news.google.com/rss/search?q=Sarkari+Naukri+India+Jobs&hl=hi&gl=IN&ceid=IN:hi",
    category: "Employment",
    enabled: true
  },
  {
    id: "mp-news",
    name: "Madhya Pradesh Regional News",
    nameHi: "मध्य प्रदेश प्रादेशिक समाचार",
    url: "https://news.google.com/rss/search?q=Madhya+Pradesh+Bhopal+News&hl=hi&gl=IN&ceid=IN:hi",
    category: "State (MP)",
    enabled: true
  },
  {
    id: "kisan-agriculture",
    name: "Kisan & Agriculture Welfare Feed",
    nameHi: "किसान एवं कृषि कल्याण समाचार",
    url: "https://news.google.com/rss/search?q=PM+Kisan+Krishi+Agriculture+Yojana&hl=hi&gl=IN&ceid=IN:hi",
    category: "Agriculture",
    enabled: true
  },
  {
    id: "national-english",
    name: "National Headline News (English)",
    nameHi: "राष्ट्रीय मुख्य समाचार (अंग्रेज़ी)",
    url: "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en",
    category: "National",
    enabled: true
  }
];

// In-memory feed cache: url/key -> { data, timestamp }
const feedMemoryCache = new Map<string, { data: any[]; timestamp: number }>();
const CACHE_TTL_MS = 8 * 60 * 1000; // 8 minutes

function cleanSnippet(raw: string = ""): string {
  if (!raw) return "";
  return raw
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractImageUrl(item: any): string | undefined {
  if (item.enclosure?.url && typeof item.enclosure.url === "string") {
    return item.enclosure.url;
  }
  if (item.mediaContent?.$?.url) {
    return item.mediaContent.$.url;
  }
  if (item.mediaThumbnail?.$?.url) {
    return item.mediaThumbnail.$.url;
  }
  // Try extracting first <img> src from content or description
  const htmlToScan = item.contentEncoded || item.content || item.description || "";
  if (typeof htmlToScan === "string" && htmlToScan.includes("<img")) {
    try {
      const $ = cheerio.load(htmlToScan);
      const src = $("img").first().attr("src");
      if (src && /^https?:\/\//i.test(src)) {
        return src;
      }
    } catch {}
  }
  return undefined;
}

// Robust single feed fetcher with fallback
async function fetchAndParseFeed(feedUrl: string, feedName: string, category: string): Promise<any[]> {
  const cached = feedMemoryCache.get(feedUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const response = await axios.get(feedUrl, {
      headers: customHeaders,
      httpsAgent,
      timeout: 9000,
      responseType: "text"
    });

    const parsed = await rssParser.parseString(response.data);
    const channelTitle = cleanSnippet(parsed.title || feedName);

    const items = (parsed.items || []).slice(0, 25).map((item, idx) => {
      const cleanTitle = cleanSnippet(item.title || "News Update");
      const cleanDesc = cleanSnippet(item.contentSnippet || item.content || (item as any).description || "");
      const link = item.link || (item as any).guid || feedUrl;
      const pubDate = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();
      const imageUrl = extractImageUrl(item);

      return {
        id: `${feedName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${idx}-${Date.now()}`,
        title: cleanTitle,
        link,
        pubDate,
        source: channelTitle,
        description: cleanDesc.length > 280 ? `${cleanDesc.substring(0, 277)}...` : cleanDesc,
        image_url: imageUrl,
        category: category || "News"
      };
    });

    feedMemoryCache.set(feedUrl, { data: items, timestamp: Date.now() });
    return items;
  } catch (error: any) {
    // If cache exists even if stale, return stale data rather than failing
    if (cached?.data?.length) {
      return cached.data;
    }
    console.warn(`[RSS Parser] Could not fetch ${feedUrl}:`, error.message);
    return [];
  }
}

// Read active RSS feeds from CMS settings or default
async function getActiveRssFeeds(): Promise<RssFeedConfig[]> {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      const cms = JSON.parse(result.rows[0].founderMessageEn);
      if (Array.isArray(cms.rssFeeds) && cms.rssFeeds.length > 0) {
        return cms.rssFeeds;
      }
    }
  } catch (e) {
    console.warn("Could not load rssFeeds from cms_data:", e);
  }
  return DEFAULT_RSS_FEEDS;
}

// ─────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────

// GET /api/public/rss-feeds: Get all configured feeds
router.get("/api/public/rss-feeds", async (_req, res) => {
  try {
    const feeds = await getActiveRssFeeds();
    return res.json({ success: true, data: feeds });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/public/rss-feed: Fetch articles from a specific feed or all enabled feeds
router.get("/api/public/rss-feed", async (req, res) => {
  try {
    const { feedId, url, category } = req.query;
    const allFeeds = await getActiveRssFeeds();
    const activeFeeds = allFeeds.filter((f) => f.enabled !== false);

    if (typeof url === "string" && url.trim()) {
      const items = await fetchAndParseFeed(url.trim(), "Custom RSS Feed", String(category || "News"));
      return res.json({ success: true, data: items });
    }

    if (typeof feedId === "string" && feedId.trim()) {
      const target = allFeeds.find((f) => f.id === feedId.trim());
      if (target) {
        const items = await fetchAndParseFeed(target.url, target.name, target.category);
        return res.json({ success: true, data: items, feed: target });
      }
    }

    // Aggregate from all enabled feeds in parallel
    const feedPromises = activeFeeds.map((feed) =>
      fetchAndParseFeed(feed.url, feed.name, feed.category)
    );

    const results = await Promise.allSettled(feedPromises);
    const aggregated: any[] = [];

    results.forEach((r) => {
      if (r.status === "fulfilled" && Array.isArray(r.value)) {
        aggregated.push(...r.value);
      }
    });

    // Sort by publication date descending
    aggregated.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    // Deduplicate by title similarity
    const seenTitles = new Set<string>();
    const deduplicated = aggregated.filter((item) => {
      const key = item.title.toLowerCase().substring(0, 40);
      if (seenTitles.has(key)) return false;
      seenTitles.add(key);
      return true;
    });

    return res.json({
      success: true,
      data: deduplicated.slice(0, 50),
      feedsCount: activeFeeds.length
    });
  } catch (err: any) {
    console.error("RSS Feed Aggregation error:", err);
    return res.status(500).json({ success: false, error: "Failed to load RSS feeds" });
  }
});

// GET /api/public/news (Enhanced backward compatibility for NewsFeed.tsx)
router.get("/api/public/news-rss", async (_req, res) => {
  try {
    const allFeeds = await getActiveRssFeeds();
    const activeFeeds = allFeeds.filter((f) => f.enabled !== false);

    const feedPromises = activeFeeds.map((feed) =>
      fetchAndParseFeed(feed.url, feed.name, feed.category)
    );

    const results = await Promise.allSettled(feedPromises);
    const aggregated: any[] = [];

    results.forEach((r) => {
      if (r.status === "fulfilled" && Array.isArray(r.value)) {
        aggregated.push(...r.value);
      }
    });

    aggregated.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    return res.json({
      success: true,
      data: aggregated.slice(0, 50)
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/rss/test: Live test an RSS URL before adding
router.post("/api/admin/rss/test", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string" || !/^https?:\/\//i.test(url.trim())) {
      return res.status(400).json({ success: false, error: "Please enter a valid HTTP/HTTPS RSS feed URL." });
    }

    const testUrl = url.trim();
    const response = await axios.get(testUrl, {
      headers: customHeaders,
      httpsAgent,
      timeout: 10000,
      responseType: "text"
    });

    const parsed = await rssParser.parseString(response.data);
    const items = parsed.items || [];

    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Valid XML was found, but no news/article items (<item> or <entry>) were discovered."
      });
    }

    const firstItem = items[0];
    return res.json({
      success: true,
      feedTitle: parsed.title || "Untitled Feed",
      feedDescription: parsed.description || "",
      itemCount: items.length,
      sample: {
        title: cleanSnippet(firstItem.title || "No Title"),
        link: firstItem.link || testUrl,
        pubDate: firstItem.pubDate || new Date().toISOString(),
        description: cleanSnippet(firstItem.contentSnippet || (firstItem as any).description || ""),
        imageUrl: extractImageUrl(firstItem)
      }
    });
  } catch (error: any) {
    console.error("RSS Feed Test Error:", error.message);
    return res.status(400).json({
      success: false,
      error: `Could not connect or parse feed: ${error.message}`
    });
  }
});

export default router;
