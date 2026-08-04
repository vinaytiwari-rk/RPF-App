import axios from 'axios';
import * as cheerio from 'cheerio';

export // Lazy-loaded Gemini AI client helper
// Unified search helper using a 4-Tier Multi-Engine Search Cluster
async function queryExternalSearch(searchQuery: string): Promise<{ title: string, link: string, url: string, snippet: string, displayLink: string }[]> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  const targetDomains = [
    "gov.in",
    "nic.in",
    "mp.gov.in",
    "bhaskar.com",
    "jagran.com",
    "ndtv.com",
    "timesofindia.indiatimes.com",
    "hindustantimes.com",
    "wikipedia.org"
  ];

  const browserHeaders = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Upgrade-Insecure-Requests": "1"
  };

  // ═══════════════════════════════════════════════════════════════
  // TIER 1: Tavily AI (Primary)
  // ═══════════════════════════════════════════════════════════════
  if (tavilyKey) {
    try {
      console.log(`[Search/Tier-1/Tavily] Querying: "${searchQuery}"`);
      const response = await axios.post(
        "https://api.tavily.com/search",
        {
          api_key: tavilyKey,
          query: searchQuery,
          include_domains: targetDomains,
          max_results: 5
        },
        {
          timeout: 4000
        }
      );

      const items = response.data.results ?? [];
      if (items.length > 0) {
        return items.slice(0, 3).map((item: any) => {
          let host = "";
          try {
            host = new URL(item.url).hostname;
          } catch {
            host = "tavily.com";
          }
          return {
            title: (item.title ?? "").slice(0, 120),
            link: item.url ?? "",
            url: item.url ?? "",
            snippet: (item.content ?? "").replace(/\n/g, " ").slice(0, 260),
            displayLink: host
          };
        });
      }
    } catch (err: any) {
      console.warn(`[Search/Tier-1/Tavily] Failed: ${err.message}. Cascading to Tier 2...`);
    }
  } else {
    console.warn(`[Search/Tier-1/Tavily] TAVILY_API_KEY is not set. Cascading to Tier 2...`);
  }

  // ═══════════════════════════════════════════════════════════════
  // TIER 2: DuckDuckGo HTML Scraper
  // ═══════════════════════════════════════════════════════════════
  try {
    const constrainedQuery = `${searchQuery} site:gov.in`;
    console.log(`[Search/Tier-2/DDG-Scraper] Querying: "${constrainedQuery}"`);
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(constrainedQuery)}`;
    
    const response = await axios.get(ddgUrl, {
      headers: browserHeaders,
      timeout: 4500
    });

    const $ = cheerio.load(response.data);
    const results: { title: string, link: string, url: string, snippet: string, displayLink: string }[] = [];

    $(".result").each((_, el) => {
      if (results.length >= 3) return;

      const title = $(el).find(".result__title").text().trim();
      const rawLink = $(el).find(".result__url").attr("href");
      const snippet = $(el).find(".result__snippet").text().trim();

      if (title && rawLink) {
        let link = rawLink;
        if (rawLink.startsWith("//")) {
          link = "https:" + rawLink;
        } else if (rawLink.startsWith("/l/?kh=")) {
          try {
            const urlObj = new URL("https://html.duckduckgo.com" + rawLink);
            const uddg = urlObj.searchParams.get("uddg");
            if (uddg) {
              link = decodeURIComponent(uddg);
            }
          } catch {
            // fallback
          }
        }

        let host = "duckduckgo.com";
        try {
          host = new URL(link).hostname;
        } catch {
          // fallback
        }

        results.push({
          title: title.slice(0, 120),
          link,
          url: link,
          snippet: snippet.replace(/\n/g, " ").slice(0, 260),
          displayLink: host
        });
      }
    });

    if (results.length > 0) {
      return results;
    }
    console.warn(`[Search/Tier-2/DDG-Scraper] No results found or blocked. Cascading to Tier 3...`);
  } catch (err: any) {
    console.warn(`[Search/Tier-2/DDG-Scraper] Failed: ${err.message}. Cascading to Tier 3...`);
  }

  // ═══════════════════════════════════════════════════════════════
  // TIER 3: SearXNG Public Instance Cluster
  // ═══════════════════════════════════════════════════════════════
  try {
    console.log(`[Search/Tier-3/SearXNG] Dynamic instance lookup...`);
    const spaceRes = await axios.get("https://searx.space/data/instances.json", {
      timeout: 3000
    });
    const instances = spaceRes.data?.instances || {};
    const healthyUrls: string[] = [];
    for (const [domain, info] of Object.entries(instances)) {
      const details = info as any;
      if (details.http?.status_code === 200 && details.uptime?.uptimeDay > 95) {
        const url = domain.startsWith("http") ? domain : `https://${domain}`;
        healthyUrls.push(url.endsWith("/") ? url : url + "/");
      }
    }

    if (healthyUrls.length > 0) {
      // Try the top 3 healthy SearXNG instances in order
      for (const instanceUrl of healthyUrls.slice(0, 3)) {
        const searchUrl = `${instanceUrl}search`;
        try {
          console.log(`[Search/Tier-3/SearXNG] Trying instance: ${searchUrl}`);
          const res = await axios.get(searchUrl, {
            params: {
              q: `${searchQuery} site:gov.in`,
              format: "json"
            },
            headers: browserHeaders,
            timeout: 3500
          });

          if (res.data && typeof res.data === "object" && Array.isArray(res.data.results)) {
            const items = res.data.results || [];
            if (items.length > 0) {
              return items.slice(0, 3).map((item: any) => {
                let host = "searxng.org";
                try {
                  host = new URL(item.url).hostname;
                } catch {
                  // fallback
                }
                return {
                  title: (item.title ?? "").slice(0, 120),
                  link: item.url ?? "",
                  url: item.url ?? "",
                  snippet: (item.content ?? "").replace(/\n/g, " ").slice(0, 260),
                  displayLink: host
                };
              });
            }
          }
        } catch (err: any) {
          console.warn(`[Search/Tier-3/SearXNG] Instance ${searchUrl} failed: ${err.message}`);
        }
      }
    }
    console.warn(`[Search/Tier-3/SearXNG] Cluster search failed or rate-limited. Cascading to Tier 4...`);
  } catch (err: any) {
    console.warn(`[Search/Tier-3/SearXNG] Dynamic discovery failed: ${err.message}. Cascading to Tier 4...`);
  }

  // ═══════════════════════════════════════════════════════════════
  // TIER 4: Wikipedia & Open Knowledge API
  // ═══════════════════════════════════════════════════════════════
  try {
    console.log(`[Search/Tier-4/Wikipedia] Querying: "${searchQuery}"`);
    const wikiUrl = "https://en.wikipedia.org/w/api.php";
    const res = await axios.get(wikiUrl, {
      params: {
        action: "query",
        list: "search",
        srsearch: searchQuery,
        format: "json",
        utf8: 1,
        origin: "*"
      },
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
      },
      timeout: 4000
    });

    const items = res.data?.query?.search || [];
    if (items.length > 0) {
      return items.slice(0, 3).map((item: any) => ({
        title: item.title,
        link: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
        snippet: (item.snippet ?? "").replace(/<span class="searchmatch">/g, "").replace(/<\/span>/g, "").slice(0, 260),
        displayLink: "en.wikipedia.org"
      }));
    }
  } catch (err: any) {
    console.error("[Search/Tier-4/Wikipedia] Failed completely:", err.message);
  }

  return [];
}
