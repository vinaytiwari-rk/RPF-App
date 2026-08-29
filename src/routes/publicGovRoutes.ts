import express from 'express';
import { pool } from '../db/dbPool.js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';
import { CORE_SERVICES } from '../data/coreServices.js';

const router = express.Router();
const httpsAgent = new https.Agent({ rejectUnauthorized: true });

const APPROVED_GOV_DOMAINS = [
  "gov.in",
  "nic.in",
  "mp.gov.in",
  "india.gov.in",
  "pib.gov.in",
  "eraktkosh.in",
  "mponline.gov.in",
  "digitalindia.gov.in",
  "rpfoundation.org"
];

const isAllowedPortal = (raw: string) => {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    const h = u.hostname.toLowerCase();
    if (h === 'localhost' || h.startsWith('127.') || h.startsWith('10.') || h.startsWith('192.168.') || h.startsWith('172.16.')) {
      return false;
    }
    return APPROVED_GOV_DOMAINS.some(domain => h === domain || h.endsWith('.' + domain));
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
  if (!isAllowedPortal(raw)) return res.status(400).send('Unsupported government portal');

  try {
    const target = new URL(raw);
    const upstream = await axios.get(target.toString(), {
      responseType: 'text', timeout: 15000, maxRedirects: 5, httpsAgent,
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      validateStatus: () => true, // always get the body, handle errors ourselves
    });

    const finalUrl = upstream.request?.res?.responseUrl || upstream.config?.url || target.toString();
    if (!isAllowedPortal(finalUrl)) {
      return res.status(403).send('Redirected domain is not on the approved government portal allowlist.');
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
    $('meta[http-equiv="Content-Security-Policy"], meta[http-equiv="X-Frame-Options"]').remove();
    $('base').remove();

    // Inject FIRST script to neutralize frame-busting JS (sites like india.gov.in, eraktkosh that do window.top.location=...) 
    const FRAME_BUST_NEUTRALIZER = `<script>
(function(){
  // Override frame-busting: make window.top and window.parent appear to be the same as window itself
  // so that checks like "if (window.top !== window)" pass, preventing redirect to login page
  try {
    Object.defineProperty(window, 'top', { get: function(){ return window; }, configurable: true });
    Object.defineProperty(window, 'parent', { get: function(){ return window; }, configurable: true });
    Object.defineProperty(window, 'frameElement', { get: function(){ return null; }, configurable: true });
  } catch(e) {}
})();
</script>`;
    $('head').prepend(FRAME_BUST_NEUTRALIZER);

    const BROWSER_INTERCEPTOR = `
<script>
(function(){
  var urlParam = new URL(location.href).searchParams.get('url');
  if(!urlParam) return;
  var origin = new URL(urlParam).origin;
  var prox = function(u){ return '/api/gov/web-proxy?url=' + encodeURIComponent(u) + '&clean=1'; };
  
  // 1. Proxy all AJAX requests (for SPAs like Next.js, Google Fact Check)
  var ofetch = window.fetch;
  window.fetch = function(){
    var a = arguments[0];
    if(typeof a === 'string'){
      if(a.startsWith('/')) a = origin + a;
      if(a.startsWith(origin)) arguments[0] = prox(a);
    } else if(a && a.url){
      var u = a.url;
      if(u.startsWith('/')) u = origin + u;
      if(u.startsWith(origin)) {
        try {
          arguments[0] = new Request(prox(u), a);
        } catch(e) {
          console.warn('Proxy Request bypass:', e);
        }
      }
    }
    return ofetch.apply(this, arguments);
  };
  
  var oxhr = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(m, u, a, usr, p){
    if(typeof u === 'string'){
      if(u.startsWith('/')) u = origin + u;
      if(u.startsWith(origin)) u = prox(u);
    }
    return oxhr.call(this, m, u, a, usr, p);
  };

  // 2. Direct-load dynamic UI assets (SVGs, Icons) to avoid proxy WAF blocking (XML Parsing Errors)
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(n) {
        if (n.nodeType !== 1) return;
        var fixAsset = function(el, attr) {
          var v = el.getAttribute(attr);
          if (v && v.startsWith('/') && !v.startsWith('//')) el.setAttribute(attr, origin + v);
        };
        if (n.tagName === 'OBJECT') fixAsset(n, 'data');
        else if (n.querySelectorAll) n.querySelectorAll('object[data^="/"]').forEach(function(o){ fixAsset(o, 'data'); });

        if (n.tagName === 'IMG') fixAsset(n, 'src');
        else if (n.querySelectorAll) n.querySelectorAll('img[src^="/"]').forEach(function(i){ fixAsset(i, 'src'); });
      });
    });
  });
  if (document.documentElement) observer.observe(document.documentElement, { childList: true, subtree: true });
})();
</script>
`;

    const isSPA = target.hostname.includes('google.com') || 
                  target.hostname.includes('originality.ai') || 
                  target.hostname.includes('eraktkosh.mohfw.gov.in');
    if (isSPA) {
      $('iframe, frame, frameset, object, embed').remove();
      $('head').prepend(BROWSER_INTERCEPTOR);
    }
    
    // Convert links and forms to use OUR proxy so navigation stays in-app
    $('a[href]').each((_i, el) => {
      const value = $(el).attr('href');
      if (value && !value.startsWith('#') && !/^javascript:/i.test(value)) {
        $(el).attr('href', proxiedLink(value, target.toString()));
        $(el).removeAttr('target'); // Prevent escaping the iframe (target="_top", target="_blank")
      }
    });

    $('form[action]').each((_i, el) => {
      const value = $(el).attr('action');
      if (value) {
        $(el).attr('action', proxiedLink(value, target.toString()));
        $(el).removeAttr('target'); // Prevent escaping the iframe
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
    res.setHeader('Content-Security-Policy', "default-src * data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors *; connect-src * data: blob:; img-src * data: blob:; media-src * data: blob:;");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.type('html').send($.html());
  } catch (err: any) {
    const msg = err?.message || 'Unknown error';
    return res.status(502).send(`<html><body style="font-family:system-ui;padding:32px;max-width:480px;margin:0 auto"><h2 style="color:#000080">RPF Browser</h2><p>This portal could not be loaded right now.</p><p style="color:#888;font-size:13px">Technical reason: ${msg}</p><button onclick="history.back()" style="margin-top:16px;padding:10px 24px;background:#000080;color:#fff;border:none;border-radius:8px;cursor:pointer">← Go Back</button></body></html>`);
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
