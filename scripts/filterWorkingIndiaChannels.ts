import fs from "fs";

interface RawChannel {
  name: string;
  url: string;
  logo: string;
  category: string;
  tvgId: string;
}

async function fetchM3U(url: string): Promise<RawChannel[]> {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const text = await res.text();
  const lines = text.split(/\r?\n/);
  const list: RawChannel[] = [];
  let cur: Partial<RawChannel> = {};

  for (const l of lines) {
    const line = l.trim();
    if (line.startsWith("#EXTINF:")) {
      const commaIdx = line.indexOf(",");
      const name = commaIdx !== -1 ? line.slice(commaIdx + 1).trim() : "Unnamed";
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      const groupMatch = line.match(/group-title="([^"]+)"/);
      const idMatch = line.match(/tvg-id="([^"]+)"/);
      cur = {
        name,
        logo: logoMatch ? logoMatch[1] : "",
        category: groupMatch ? groupMatch[1] : "General",
        tvgId: idMatch ? idMatch[1] : ""
      };
    } else if (line && !line.startsWith("#")) {
      cur.url = line;
      if (cur.name && cur.url) {
        list.push(cur as RawChannel);
      }
      cur = {};
    }
  }
  return list;
}

async function testStream(url: string): Promise<{ ok: boolean; status?: number; contentType?: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "*/*"
      }
    });
    clearTimeout(timeout);
    const ct = res.headers.get("content-type") || "";
    // Check if ok and not an HTML error block
    if (res.ok && (ct.includes("mpegurl") || ct.includes("octet-stream") || ct.includes("video") || url.endsWith(".m3u8") || url.endsWith(".m3u"))) {
      return { ok: true, status: res.status, contentType: ct };
    }
    return { ok: res.ok && res.status < 400, status: res.status, contentType: ct };
  } catch {
    clearTimeout(timeout);
    return { ok: false };
  }
}

async function main() {
  console.log("Fetching India channels from iptv-org/in.m3u...");
  const rawList = await fetchM3U("https://iptv-org.github.io/iptv/countries/in.m3u");
  console.log(`Fetched ${rawList.length} total channels from in.m3u`);

  const verified: any[] = [];
  const batchSize = 30;

  for (let i = 0; i < rawList.length; i += batchSize) {
    const batch = rawList.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (c) => {
        const res = await testStream(c.url);
        return { c, res };
      })
    );

    for (const { c, res } of results) {
      if (res.ok) {
        verified.push({
          id: `in-${c.tvgId || verified.length + 1}`.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase(),
          name: c.name,
          url: c.url,
          category: c.category.split(";")[0] || "General",
          logo: c.logo || undefined
        });
      }
    }
    process.stdout.write(`\rProgress: ${Math.min(i + batchSize, rawList.length)} / ${rawList.length} (Verified Active: ${verified.length})`);
  }

  console.log(`\n\nTotal Verified Active India Channels: ${verified.length}`);
  fs.writeFileSync("src/data/indiaVerifiedIptv.json", JSON.stringify(verified, null, 2), "utf8");
  console.log("Saved to src/data/indiaVerifiedIptv.json");
}

main().catch(console.error);
