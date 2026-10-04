import express from 'express';
import { pool } from '../db/dbPool.js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';
import { CORE_SERVICES } from '../data/coreServices.js';

const router = express.Router();
const httpsAgent = new https.Agent({ rejectUnauthorized: true });

const isAllowedPortal = (raw: string) => {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    const h = u.hostname.toLowerCase();
    // Prevent SSRF: block loopback and internal private IP address ranges
    if (h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0' || h === '::1') return false;
    if (/^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h) || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(h) || /^169\.254\./.test(h)) {
      return false;
    }
    if (h.endsWith('.internal') || h.endsWith('.local') || h.endsWith('.lan')) return false;
    return true;
  } catch { return false; }
};

const proxiedAsset = (value: string, base: string) => {
  try {
    return new URL(value, base).toString();
  } catch { return value; }
};

const proxiedLink = (value: string, base: string) => {
  try {
    const absolute = new URL(value, base).toString();
    return isAllowedPortal(absolute) ? `/api/gov/web-proxy?url=${encodeURIComponent(absolute)}&clean=1` : absolute;
  } catch { return value; }
};

router.get('/api/gov/web-proxy', async (req, res) => {
  const raw = String(req.query.url || '');
  if (!isAllowedPortal(raw)) {
    return res.status(400).send(`<html><body style="font-family:sans-serif;padding:30px;text-align:center"><h3 style="color:#C2410C">Invalid Web Address</h3><p style="color:#64748B">The requested address is invalid or restricted.</p></body></html>`);
  }

  try {
    const target = new URL(raw);
    const upstream = await axios.get(target.toString(), {
      responseType: 'text',
      timeout: 20000,
      maxRedirects: 10,
      httpsAgent,
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-IN,en-US,en;q=0.9,hi;q=0.8',
        'Referer': target.origin + '/'
      },
      validateStatus: () => true, // Accept 2xx, 3xx, 4xx without throwing immediately
    });

    const finalUrl = upstream.request?.res?.responseUrl || upstream.config?.url || target.toString();
    if (!isAllowedPortal(finalUrl)) {
      return res.status(403).send(`<html><body style="font-family:sans-serif;padding:30px;text-align:center"><h3 style="color:#C2410C">Restricted Redirect</h3><p style="color:#64748B">The website redirected to a restricted internal address.</p></body></html>`);
    }

    const contentType = String(upstream.headers['content-type'] || 'text/html');
    
    // Strip upstream security headers that would block iframe embedding
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('x-frame-options');
    res.removeHeader('content-security-policy');

    if (!contentType.includes('text/html')) {
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.send(upstream.data);
    }

    const $ = cheerio.load(String(upstream.data));
    $('meta[http-equiv="Content-Security-Policy"], meta[http-equiv="X-Frame-Options"], meta[http-equiv="content-security-policy"], meta[http-equiv="x-frame-options"]').remove();

    // Preserve the upstream application path for SPAs. Using target.origin here
    // breaks portals mounted below a sub-path (for example /eraktkoshPortal/),
    // because Angular/React then requests its JS chunks from the domain root.
    const upstreamBase = new URL('.', target.toString()).toString();
    if ($('base').length === 0) {
      $('head').prepend(`<base href="${upstreamBase}" />`);
    } else {
      $('base').attr('href', upstreamBase);
    }

    // Comprehensive Anti-Framebusting and In-App Navigation Lock script
    const IN_APP_SHIELD = `<script>
(function(){
  // 1. Defeat frame-busting scripts that check window.top or window.parent
  try {
    Object.defineProperty(window, 'top', { get: function(){ return window; }, configurable: true });
    Object.defineProperty(window, 'parent', { get: function(){ return window; }, configurable: true });
    Object.defineProperty(window, 'frameElement', { get: function(){ return null; }, configurable: true });
  } catch(e) {
    try {
      window.__defineGetter__('top', function(){ return window; });
      window.__defineGetter__('parent', function(){ return window; });
    } catch(e2) {}
  }

  // 2. Prevent window.open from escaping to external tabs
  var _origOpen = window.open;
  window.open = function(url, target, features) {
    if (!url) return null;
    var targetStr = String(target || '').toLowerCase();
    if (targetStr === '_top' || targetStr === '_parent' || targetStr === '_blank') {
      target = '_self';
    }
    var fullUrl = url.startsWith('http') ? url : (url.startsWith('/') ? "${target.origin}" + url : url);
    window.location.href = '/api/gov/web-proxy?url=' + encodeURIComponent(fullUrl) + '&clean=1';
    return window;
  };

  // 3. Ensure clicked links stay inside the in-app browser proxy
  document.addEventListener('click', function(e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (a && a.href && !a.href.startsWith('javascript:') && !a.href.startsWith('#')) {
      if (a.target === '_top' || a.target === '_parent' || a.target === '_blank') {
        a.target = '_self';
      }
    }
  }, true);
})();
</script>`;
    $('head').prepend(IN_APP_SHIELD);

    // Convert link hrefs and form actions to stay inside our proxy
    $('a[href]').each((_i, el) => {
      const value = $(el).attr('href');
      if (value && !value.startsWith('#') && !/^javascript:/i.test(value)) {
        $(el).attr('href', proxiedLink(value, target.toString()));
        $(el).removeAttr('target');
      }
    });

    $('form[action]').each((_i, el) => {
      const value = $(el).attr('action');
      if (value) {
        $(el).attr('action', proxiedLink(value, target.toString()));
        $(el).removeAttr('target');
      }
    });

    // Proxy nested iframes and frames so they bypass X-Frame-Options
    $('iframe[src], frame[src]').each((_i, el) => {
      const value = $(el).attr('src');
      if (value && !value.startsWith('#') && !/^javascript:/i.test(value)) {
        $(el).attr('src', proxiedLink(value, target.toString()));
      }
    });

    // Assets (CSS, JS, Images) load directly from the original server
    $('link[href]').each((_i, el) => {
      const value = $(el).attr('href');
      if (value && !value.startsWith('#') && !/^javascript:/i.test(value)) {
        $(el).attr('href', proxiedAsset(value, target.toString()));
      }
    });

    $('img[src], script[src], source[src]').each((_i, el) => {
      const value = $(el).attr('src');
      if (value && !/^data:/i.test(value)) {
        $(el).attr('src', proxiedAsset(value, target.toString()));
      }
    });

    $('object[data]').each((_i, el) => {
      const value = $(el).attr('data');
      if (value && !/^data:/i.test(value)) {
        $(el).attr('data', proxiedAsset(value, target.toString()));
      }
    });

    $('embed[src]').each((_i, el) => {
      const value = $(el).attr('src');
      if (value && !/^data:/i.test(value)) {
        $(el).attr('src', proxiedAsset(value, target.toString()));
      }
    });

    // Explicitly remove any X-Frame-Options and set permissive frame-ancestors
    res.removeHeader('X-Frame-Options');
    res.removeHeader('x-frame-options');
    res.setHeader('Content-Security-Policy', "default-src * data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors *; connect-src * data: blob:; img-src * data: blob:; media-src * data: blob:; font-src * data: blob:;");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.type('html').send($.html());
  } catch (err: any) {
    const msg = err?.message || 'Network request failed';
    return res.status(502).send(`<html><body style="font-family:system-ui,-apple-system,sans-serif;padding:32px;max-width:480px;margin:40px auto;text-align:center"><div style="display:inline-block;padding:12px;background:#FFF7ED;border-radius:16px;margin-bottom:16px"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C2410C" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg></div><h2 style="color:#0A192F;margin:0 0 8px 0;font-size:18px">Website Temporarily Unavailable</h2><p style="color:#64748B;font-size:13px;line-height:1.5;margin:0 0 20px 0">The requested site did not respond in time or rejected the embedded connection.</p><button onclick="history.back()" style="padding:10px 24px;background:#0A192F;color:#fff;border:none;border-radius:12px;font-weight:bold;font-size:13px;cursor:pointer">← Go Back</button></body></html>`);
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
    
    let data: any = result.rows.length > 0 ? result.rows[0] : null;

    if (id === "animals") {
      const animalResources = [
        { title: { en: "PETA India Actions", hi: "पेटा इंडिया एक्शन्स" }, url: "https://www.petaindia.com/action/" },
        { title: { en: "AWBI Colony Animal Caretaker", hi: "AWBI कॉलोनी पशु केयरटेकर" }, url: "https://awbi.gov.in/colony-animal-care-taker" },
        { title: { en: "Bharat Pashudhan Portal", hi: "भारत पशुधन पोर्टल" }, url: "https://bharatpashudhan.ndlm.co.in/" },
        { title: { en: "DAHD Schemes & Programmes", hi: "DAHD योजनाएं और कार्यक्रम" }, url: "https://dahd.gov.in/hi/schemes-programmes" },
        { title: { en: "MPDAH Animal Breeding Farm", hi: "MPDAH पशु प्रजनन फार्म" }, url: "https://mpdah.gov.in/animal-breeding-farm" },
        { title: { en: "MPDAH Welfare Schemes", hi: "MPDAH कल्याणकारी योजनाएं" }, url: "https://mpdah.gov.in/schemes" },
        { title: { en: "NDVSU Grievance Portal", hi: "NDVSU शिकायत पोर्टल" }, url: "https://ndvsu.org/grievance" }
      ];

      if (!data || !data.content || Object.keys(data.content).length === 0) {
        const defaultContent = {
          en: {
            body: "<h3>Animal Welfare Support</h3><p>Access official animal welfare portals, central/state dairy and animal husbandry schemes, breeding directories, and grievance resources below.</p>",
            actionLabel: "Report Stray Emergency"
          },
          hi: {
            body: "<h3>पशु कल्याण सहयोग</h3><p>आधिकारिक पशु कल्याण पोर्टल, केंद्र/राज्य डेयरी और पशुपालन योजनाएं, प्रजनन निर्देशिका और शिकायत निवारण संसाधनों तक नीचे पहुंचें।</p>",
            actionLabel: "आवारा पशु आपातकाल दर्ज करें"
          }
        };
        if (!data) {
          data = {
            service_id: "animals",
            content: defaultContent,
            action_url: "/grievance",
            updated_at: new Date().toISOString()
          };
        } else {
          data.content = defaultContent;
          if (!data.action_url) data.action_url = "/grievance";
        }
      }

      data.resources = animalResources;
    } else if (data) {
      data.resources = data.content?.resources || [];
    }

    res.json({ success: true, data });
  } catch (error: any) { 
    console.error("Service content fetch error:", error); 
    res.status(500).json({ success: false, error: error.message }); 
  }
});

export default router;
