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

const proxyMethods = new Set(['GET','POST','PUT','PATCH','DELETE','OPTIONS']);

const proxyHeaders = (req: express.Request, target: URL) => {
  const headers: Record<string,string> = {
    'User-Agent': String(req.headers['user-agent'] || 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/128 Mobile Safari/537.36'),
    'Accept': String(req.headers.accept || 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'),
    'Accept-Language': String(req.headers['accept-language'] || 'en-IN,en-US,en;q=0.9,hi;q=0.8'),
    'Referer': target.origin + '/',
  };
  if(req.headers.cookie) headers.Cookie=String(req.headers.cookie);
  if(req.headers.authorization) headers.Authorization=String(req.headers.authorization);
  if(req.headers['content-type']) headers['Content-Type']=String(req.headers['content-type']);
  return headers;
};

const proxyUrl = (absolute: string) => `/api/gov/web-proxy?url=${encodeURIComponent(absolute)}&clean=1`;

const rewriteClientRequests = (html: string, target: URL) => {
  const $ = cheerio.load(html);
  const targetBase = new URL('.', target.toString()).toString();
  const shield = `<script>
(function(){
  const BASE=${JSON.stringify(targetBase)}, PREFIX='/api/gov/web-proxy?url=';
  const proxify=(value)=>{
    try{
      if(!value || /^(data:|blob:|javascript:|mailto:|tel:|#)/i.test(String(value))) return value;
      const u=new URL(String(value),BASE);
      if(!/^https?:$/i.test(u.protocol)) return value;
      return PREFIX+encodeURIComponent(u.toString())+'&clean=1';
    }catch(e){return value;}
  };
  const nativeFetch=window.fetch;
  window.fetch=function(input,init){
    try{
      const raw=input instanceof Request?input.url:input;
      const p=proxify(raw);
      if(p && p!==raw) return nativeFetch.call(this,p,init);
    }catch(e){}
    return nativeFetch.call(this,input,init);
  };
  const open=XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open=function(method,url,async,user,password){
    let next=url; try{next=proxify(url);}catch(e){}
    return open.call(this,method,next,async===undefined?true:async,user,password);
  };
})();
</script>`;
  $('head').prepend(shield);
  $('a[href]').each((_i,el)=>{const v=$(el).attr('href');if(v&&!/^#|javascript:/i.test(v)){$(el).attr('href',proxifyLink(v,target));$(el).removeAttr('target');}});
  $('form[action]').each((_i,el)=>{const v=$(el).attr('action');if(v)$(el).attr('action',proxifyLink(v,target));$(el).removeAttr('target');});
  $('iframe[src],frame[src]').each((_i,el)=>{const v=$(el).attr('src');if(v)$(el).attr('src',proxifyLink(v,target));});
  $('link[href]').each((_i,el)=>{const v=$(el).attr('href');if(v)$(el).attr('href',new URL(v,targetBase).toString());});
  $('img[src],script[src],source[src],object[data],embed[src]').each((_i,el)=>{
    const attr=$(el).attr('src')!==undefined?'src':'data',v=$(el).attr(attr);if(v&&!/^data:/i.test(v))$(el).attr(attr,new URL(v,targetBase).toString());
  });
  return $.html();
};

const proxifyLink = (value: string, base: URL) => {
  try {
    const absolute = new URL(value, base.toString()).toString();
    return isAllowedPortal(absolute) ? proxyUrl(absolute) : absolute;
  } catch { return value; }
};

const proxyResponseCookies = (res: express.Response, upstream: any) => {
  const setCookie = upstream.headers['set-cookie'];
  if(Array.isArray(setCookie) && setCookie.length){
    res.setHeader('Set-Cookie', setCookie.map((v:string)=>v.replace(/;\\s*Domain=[^;]*/ig,'').replace(/;\\s*SameSite=None/ig,'; SameSite=Lax')));
  }
};

const proxyHandler = async (req: express.Request, res: express.Response) => {
  const raw = String(req.query.url || '');
  if(!isAllowedPortal(raw)) return res.status(400).json({success:false,error:'Invalid or restricted web address'});
  const target = new URL(raw);
  if(!proxyMethods.has(req.method)) return res.status(405).set('Allow',Array.from(proxyMethods).join(', ')).end();

  try{
    const upstream = await axios({
      method:req.method as any,
      url:target.toString(),
      data:['GET','HEAD'].includes(req.method)?undefined:req.body,
      responseType:'arraybuffer',
      timeout:30000,
      maxRedirects:10,
      httpsAgent,
      headers:proxyHeaders(req,target),
      validateStatus:()=>true,
      maxContentLength:25*1024*1024,
      maxBodyLength:10*1024*1024,
    });
    const finalUrl = upstream.request?.res?.responseUrl || target.toString();
    if(!isAllowedPortal(finalUrl)) return res.status(403).json({success:false,error:'Restricted redirect'});
    proxyResponseCookies(res,upstream);
    const contentType=String(upstream.headers['content-type']||'application/octet-stream');
    res.status(upstream.status);
    res.setHeader('Content-Type',contentType);
    if(upstream.headers['content-length']) res.setHeader('Content-Length',String(upstream.headers['content-length']));
    ['cache-control','etag','last-modified','content-range','accept-ranges'].forEach(h=>{if(upstream.headers[h])res.setHeader(h,String(upstream.headers[h]));});
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Headers','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.removeHeader('X-Frame-Options'); res.removeHeader('Content-Security-Policy');
    if(req.method==='OPTIONS') return res.status(204).end();
    if(contentType.toLowerCase().includes('text/html')){
      const html=Buffer.from(upstream.data).toString('utf8');
      const clean=cheerio.load(html);
      clean('meta[http-equiv="Content-Security-Policy"],meta[http-equiv="X-Frame-Options"],meta[http-equiv="content-security-policy"],meta[http-equiv="x-frame-options"]').remove();
      const rewritten=rewriteClientRequests(clean.html(),target);
      res.setHeader('Content-Security-Policy',"default-src * data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors *; connect-src * data: blob:; img-src * data: blob:; media-src * data: blob:; font-src * data: blob:;");
      return res.type('html').send(rewritten);
    }
    return res.send(Buffer.from(upstream.data));
  }catch(err:any){
    console.error('Web proxy failed:',err?.message||err);
    return res.status(502).json({success:false,error:'Upstream website unavailable'});
  }
};

router.all('/api/gov/web-proxy', proxyHandler);

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
