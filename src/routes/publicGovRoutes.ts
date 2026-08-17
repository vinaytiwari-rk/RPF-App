import express from 'express';
import { pool } from '../db/dbPool.js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { CORE_SERVICES } from '../data/coreServices.js';

const router = express.Router();

const PROXY_HOSTS = new Set([
  'www.india.gov.in', 'india.gov.in',
  'www.myscheme.gov.in', 'myscheme.gov.in',
  'www.calculator.net', 'calculator.net'
]);

const isAllowedPortal = (raw: string) => {
  try {
    const u = new URL(raw);
    return (u.protocol === 'https:' || u.protocol === 'http:') && PROXY_HOSTS.has(u.hostname.toLowerCase());
  } catch { return false; }
};

const proxied = (value: string, base: string) => {
  try {
    const absolute = new URL(value, base).toString();
    return isAllowedPortal(absolute) ? `/api/gov/web-proxy?url=${encodeURIComponent(absolute)}` : value;
  } catch { return value; }
};

router.get('/api/gov/web-proxy', async (req, res) => {
  const raw = String(req.query.url || '');
  if (!isAllowedPortal(raw)) return res.status(400).send('Unsupported government portal');

  try {
    const target = new URL(raw);
    const upstream = await axios.get(target.toString(), {
      responseType: 'text', timeout: 15000, maxRedirects: 5,
      headers: { 'User-Agent': 'Mozilla/5.0 (RPF Seva App)' },
      validateStatus: status => status >= 200 && status < 400,
    });

    const contentType = String(upstream.headers['content-type'] || 'text/html');
    if (!contentType.includes('text/html')) {
      res.setHeader('Content-Type', contentType);
      return res.send(upstream.data);
    }

    const $ = cheerio.load(String(upstream.data));
    $('meta[http-equiv="Content-Security-Policy"], meta[http-equiv="X-Frame-Options"]').remove();
    $('base').remove();

    // Do not allow nested frames/documents to render inside RPF. These can load
    // XML/SVG/error documents and produce the visible browser parsing error.
    $('iframe, frame, frameset, object, embed').remove();

    $('a[href], link[href]').each((_i, el) => {
      const value = $(el).attr('href');
      if (value && !value.startsWith('#') && !/^javascript:/i.test(value)) {
        $(el).attr('href', proxied(value, target.toString()));
      }
    });

    $('img[src], script[src], source[src]').each((_i, el) => {
      const value = $(el).attr('src');
      if (value && !/^data:/i.test(value)) {
        $(el).attr('src', proxied(value, target.toString()));
      }
    });

    $('form[action]').each((_i, el) => {
      const value = $(el).attr('action');
      if (value) $(el).attr('action', proxied(value, target.toString()));
    });

    res.setHeader('Content-Security-Policy', "default-src * data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'self'; connect-src * data: blob:; img-src * data: blob:; media-src * data: blob:;");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.type('html').send($.html());
  } catch {
    return res.status(502).send('<html><body style="font-family:system-ui;padding:32px"><h2>RPF Browser</h2><p>This government portal is temporarily unavailable.</p></body></html>');
  }
});

router.get("/api/gov/mandi-prices", async (req, res) => {
  const { state, commodity } = req.query;
  const apiKey = process.env.DATAGOV_API_KEY;
  const resourceId = "9ef84268-d588-465a-a308-a864a43d0070";
  if (!apiKey) return res.status(503).json({ success: false, error: "Mandi price service is not configured." });
  try {
    let url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=10`;
    if (state) url += `&filters[state]=${encodeURIComponent(state as string)}`;
    if (commodity) url += `&filters[commodity]=${encodeURIComponent(commodity as string)}`;
    const response = await axios.get(url, { timeout: 5000 });
    return res.json(response.data);
  } catch (error) { console.error("Mandi Prices API failed:", error); return res.status(503).json({ success: false, error: "Mandi price service is temporarily unavailable." }); }
});

router.get("/api/gov/hospitals", async (req, res) => {
  const { state, district } = req.query;
  const apiKey = process.env.DATAGOV_API_KEY;
  const resourceId = "7924619d-71b5-4b47-b861-12c823055428";
  if (!apiKey) return res.status(503).json({ success: false, error: "Government hospital directory is not configured." });
  try {
    let url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=10`;
    if (state) url += `&filters[state]=${encodeURIComponent(state as string)}`;
    if (district) url += `&filters[district]=${encodeURIComponent(district as string)}`;
    const response = await axios.get(url, { timeout: 5000 });
    return res.json(response.data);
  } catch (error) { console.error("Government hospitals API failed:", error); return res.status(503).json({ success: false, error: "Government hospital directory is temporarily unavailable." }); }
});

router.get("/api/public/services", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    let hiddenServiceIds: string[] = [];
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      try { const parsed = JSON.parse(result.rows[0].founderMessageEn); if (Array.isArray(parsed.hiddenServiceIds)) hiddenServiceIds = parsed.hiddenServiceIds; } catch {}
    }
    const visible = CORE_SERVICES.filter((service) => !hiddenServiceIds.includes(service.id));
    res.json({ success: true, data: visible });
  } catch { res.json({ success: true, data: CORE_SERVICES }); }
});

router.get("/api/public/services/:id/content", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`SELECT service_id, content, action_url, updated_at FROM service_content WHERE service_id = $1`, [id]);
    if (result.rows.length === 0) return res.json({ success: true, data: null });
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) { console.error("Service content fetch error:", error); res.status(500).json({ success: false, error: error.message }); }
});

export default router;
