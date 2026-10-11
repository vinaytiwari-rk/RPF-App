import { Router, Request, Response } from 'express';
import fetch from 'node-fetch';
import { URL } from 'url';

const router = Router();
const PLAYLIST_URL = 'https://iptv-org.github.io/iptv/index.m3u';

interface Channel {
  id: string;
  name: string;
  url: string;
  group?: string;
}

/** Parse the M3U content into an array of Channel objects */
function parseM3U(content: string): Channel[] {
  const lines = content.split(/\r?\n/);
  const channels: Channel[] = [];
  let current: Partial<Channel> = {};
  for (const line of lines) {
    if (line.startsWith('#EXTINF:')) {
      const nameMatch = line.match(/,(.*)$/);
      const groupMatch = line.match(/group-title="([^"]+)"/);
      current.name = nameMatch ? nameMatch[1].trim() : 'Unnamed';
      if (groupMatch) current.group = groupMatch[1];
    } else if (line && !line.startsWith('#')) {
      const url = line.trim();
      current.url = url;
      current.id = Buffer.from(url).toString('base64');
      channels.push(current as Channel);
      current = {};
    }
  }
  return channels;
}

/** GET /channels – returns the list of IPTV channels */
router.get('/channels', async (_req: Request, res: Response) => {
  try {
    const response = await fetch(PLAYLIST_URL);
    const text = await response.text();
    const channels = parseM3U(text);
    res.json({ channels });
  } catch (err) {
    console.error('Failed to fetch IPTV playlist', err);
    res.status(500).json({ error: 'Unable to retrieve IPTV channels' });
  }
});

/** GET /proxy – streams a remote IPTV URL through this server with full CORS and m3u8 rewriting.
 *  Query param: ?url=<encoded_stream_url>
 */
router.get('/proxy', async (req: Request, res: Response) => {
  const rawUrl = req.query.url as string;
  if (!rawUrl) {
    return res.status(400).json({ error: 'Missing url query parameter' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  try {
    const parsed = new URL(rawUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'Invalid URL protocol' });
    }

    const upstream = await fetch(rawUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': `${parsed.protocol}//${parsed.host}/`,
      },
    });

    if (!upstream.ok && upstream.status >= 400) {
      return res.status(upstream.status).json({ error: `Upstream HTTP ${upstream.status}` });
    }

    const contentType = upstream.headers.get('content-type') || '';
    const isM3U8 = contentType.includes('mpegurl') || contentType.includes('application/x-mpegURL') || parsed.pathname.endsWith('.m3u8') || parsed.pathname.endsWith('.m3u');

    if (isM3U8) {
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      const text = await upstream.text();
      // Rewrite URIs so that nested playlists, audio tracks, keys, and ts segments go through /api/iptv/proxy
      const rewritten = text.split(/\r?\n/).map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return line;

        // If line is a tag containing URI="..." (e.g. #EXT-X-STREAM-INF, #EXT-X-MEDIA, #EXT-X-KEY)
        if (trimmed.startsWith('#')) {
          return line.replace(/URI="([^"]+)"/g, (_, uri) => {
            try {
              const full = new URL(uri, rawUrl).href;
              return `URI="/api/iptv/proxy?url=${encodeURIComponent(full)}"`;
            } catch {
              return `URI="${uri}"`;
            }
          });
        }

        // If line is a segment or sub-playlist URL
        try {
          const full = new URL(trimmed, rawUrl).href;
          return `/api/iptv/proxy?url=${encodeURIComponent(full)}`;
        } catch {
          return line;
        }
      }).join('\n');

      return res.send(rewritten);
    }

    // Direct TS chunk, MP4, or audio
    if (contentType) res.setHeader('Content-Type', contentType);
    const cacheControl = upstream.headers.get('cache-control');
    if (cacheControl) res.setHeader('Cache-Control', cacheControl);
    else res.setHeader('Cache-Control', 'public, max-age=3600');
    upstream.body?.pipe(res);
  } catch (e: any) {
    console.error('IPTV proxy error:', e?.message || e);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Failed to proxy stream' });
    }
  }
});

export default router;
