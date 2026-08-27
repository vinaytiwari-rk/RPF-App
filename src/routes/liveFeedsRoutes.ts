import express from 'express';
import axios from 'axios';
import Parser from 'rss-parser';

const router = express.Router();
const parser = new Parser();

type CacheEntry = { etag?: string; items: string[]; fetchedAt: number };
const cache: Record<'pib' | 'sachet', CacheEntry> = {
  pib: { items: [], fetchedAt: 0 },
  sachet: { items: [], fetchedAt: 0 },
};

const sources = {
  pib: 'https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1&reg=1',
  sachet: 'https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml',
} as const;

async function loadFeed(kind: 'pib' | 'sachet'): Promise<string[]> {
  const previous = cache[kind];
  const headers: Record<string, string> = {
    'User-Agent': 'Samahit-RPFoundation/1.0',
    Accept: 'application/rss+xml, application/xml, text/xml, */*',
  };
  if (previous.etag) headers['If-None-Match'] = previous.etag;

  try {
    const response = await axios.get<string>(sources[kind], {
      headers,
      timeout: 8000,
      responseType: 'text',
      validateStatus: status => status === 200 || status === 304,
    });

    if (response.status === 304 && previous.items.length) {
      previous.fetchedAt = Date.now();
      return previous.items;
    }

    const feed = await parser.parseString(response.data);
    const items = (feed.items || [])
      .map(item => String(item.title || item.contentSnippet || item.content || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .slice(0, 12);

    cache[kind] = {
      etag: typeof response.headers.etag === 'string' ? response.headers.etag : previous.etag,
      items,
      fetchedAt: Date.now(),
    };
    return items;
  } catch {
    return previous.items;
  }
}

router.get('/api/public/live-feeds', async (_req, res) => {
  const [pib, sachet] = await Promise.all([loadFeed('pib'), loadFeed('sachet')]);
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  return res.json({
    success: true,
    data: { pib, sachet },
    updatedAt: new Date().toISOString(),
  });
});

export default router;
