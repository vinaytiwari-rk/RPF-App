import type { IncomingMessage, ServerResponse } from 'http';

type CacheEntry = { items: string[]; etag?: string; updatedAt: string };
const cache: Record<string, CacheEntry> = {};

async function load(key: string, url: string): Promise<string[]> {
  const previous = cache[key];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const headers: Record<string, string> = {
      Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
      'User-Agent': 'Samahit-RPFoundation/1.0 RSS Consumer',
    };
    if (previous?.etag) headers['If-None-Match'] = previous.etag;
    const response = await fetch(url, { headers, signal: controller.signal, redirect: 'follow' });
    if (response.status === 304) return previous?.items || [];
    if (!response.ok) return previous?.items || [];
    const xml = await response.text();
    const titles = [...xml.matchAll(/<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/gi)]
      .map((match) => match[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim())
      .filter(Boolean)
      .slice(1, 13);
    if (titles.length) {
      cache[key] = { items: titles, etag: response.headers.get('etag') || undefined, updatedAt: new Date().toISOString() };
      return titles;
    }
    return previous?.items || [];
  } catch {
    return previous?.items || [];
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  const [pib, sachet] = await Promise.all([
    load('pib', 'https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1&reg=1'),
    load('sachet', 'https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml'),
  ]);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.end(JSON.stringify({ success: true, data: { pib, sachet }, updatedAt: new Date().toISOString() }));
}
