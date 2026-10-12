import { Router, Request, Response } from 'express';
import fetch from 'node-fetch';
import https from 'https';
import { URL } from 'url';
import { LIVE_TV_DEFAULTS } from '../data/liveTvDefaults';

const router = Router();

// Insecure HTTPS agent for regional/broadcast upstream endpoints with self-signed or legacy SSL certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  keepAlive: true,
});

/** GET /channels – returns the list of IPTV channels with optional category and search filters */
router.get('/channels', (req: Request, res: Response) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category.trim().toLowerCase() : '';
    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';

    let channels = LIVE_TV_DEFAULTS.filter(c => c.enabled !== false);

    if (category && category !== 'all') {
      channels = channels.filter(c => c.category.toLowerCase() === category);
    }

    if (search) {
      channels = channels.filter(c =>
        c.name.toLowerCase().includes(search) || c.category.toLowerCase().includes(search)
      );
    }

    res.json({
      success: true,
      total: channels.length,
      channels,
    });
  } catch (err: any) {
    console.error('Failed to retrieve IPTV channels', err);
    res.status(500).json({ success: false, error: 'Unable to retrieve IPTV channels' });
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

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  try {
    // Auto-map wavespb live streams directly to fast CloudFront endpoint
    let fetchUrl = rawUrl;
    if (fetchUrl.includes('radio.wavespb.com/live/')) {
      fetchUrl = fetchUrl.replace(/https?:\/\/radio\.wavespb\.com\/live\//, 'https://d1tmej9eu7kw5c.cloudfront.net/');
    }

    const parsed = new URL(fetchUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'Invalid URL protocol' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const isHttps = parsed.protocol === 'https:';
    let upstream: any;
    try {
      upstream = await fetch(fetchUrl, {
        agent: (isHttps ? httpsAgent : undefined) as any,
        signal: controller.signal as any,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': `${parsed.protocol}//${parsed.host}/`,
        },
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!upstream.ok && upstream.status >= 400) {
      return res.status(upstream.status).json({ error: `Upstream HTTP ${upstream.status}` });
    }

    const contentType = upstream.headers.get('content-type') || '';
    const isM3U8 =
      contentType.includes('mpegurl') ||
      contentType.includes('application/x-mpegURL') ||
      parsed.pathname.endsWith('.m3u8') ||
      parsed.pathname.endsWith('.m3u');

    if (isM3U8) {
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      const text = await upstream.text();
      const host = req.headers['x-forwarded-host'] || req.get('host') || 'appapi.therpfoundation.org';
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const proxyBase = `${protocol}://${host}/api/iptv/proxy`;
      const targetBaseUrl = upstream.url || fetchUrl;

      // Rewrite URIs so that nested playlists, audio tracks, keys, and ts segments go through proxyBase
      const rewritten = text
        .split(/\r?\n/)
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return line;

          // If line is a tag containing URI="..." (e.g. #EXT-X-STREAM-INF, #EXT-X-MEDIA, #EXT-X-KEY)
          if (trimmed.startsWith('#')) {
            return line.replace(/URI="([^"]+)"/g, (_, uri) => {
              try {
                const full = new URL(uri, targetBaseUrl).href;
                return `URI="${proxyBase}?url=${encodeURIComponent(full)}"`;
              } catch {
                return `URI="${uri}"`;
              }
            });
          }

          // If line is a segment or sub-playlist URL
          try {
            const full = new URL(trimmed, targetBaseUrl).href;
            return `${proxyBase}?url=${encodeURIComponent(full)}`;
          } catch {
            return line;
          }
        })
        .join('\n');

      return res.send(rewritten);
    }

    // Direct TS chunk, MP4, or live audio/video stream
    if (contentType) res.setHeader('Content-Type', contentType);
    if (
      contentType.startsWith('audio/') ||
      contentType.startsWith('video/') ||
      contentType.includes('mpeg') ||
      contentType.includes('aac') ||
      contentType.includes('mp2t')
    ) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Connection', 'keep-alive');
    } else {
      const cacheControl = upstream.headers.get('cache-control');
      if (cacheControl) res.setHeader('Cache-Control', cacheControl);
      else res.setHeader('Cache-Control', 'public, max-age=3600');
    }

    req.on('close', () => {
      try {
        if (upstream.body && typeof (upstream.body as any).destroy === 'function') {
          (upstream.body as any).destroy();
        }
      } catch {}
    });

    upstream.body?.pipe(res);
  } catch (e: any) {
    console.error('IPTV proxy error:', e?.message || e);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Failed to proxy stream' });
    }
  }
});

export default router;
