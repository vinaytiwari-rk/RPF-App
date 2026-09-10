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

/** GET /proxy – streams a remote IPTV URL through this server.
 *  Query param: ?url=<encoded_stream_url>
 */
router.get('/proxy', async (req: Request, res: Response) => {
  const rawUrl = req.query.url as string;
  if (!rawUrl) {
    return res.status(400).json({ error: 'Missing url query parameter' });
  }
  try {
    const parsed = new URL(rawUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'Invalid URL protocol' });
    }
    const upstream = await fetch(rawUrl);
    const contentType = upstream.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    const cacheControl = upstream.headers.get('cache-control');
    if (cacheControl) res.setHeader('Cache-Control', cacheControl);
    upstream.body?.pipe(res);
  } catch (e) {
    console.error('Proxy error', e);
    res.status(502).json({ error: 'Failed to proxy stream' });
  }
});

export default router;
