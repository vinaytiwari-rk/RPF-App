const PIB = 'https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1&reg=1';
const SACHET = 'https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml';

const decode = (value = '') => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();

function parseFeed(xml) {
  const items = xml.match(/<(?:item|entry)\b[\s\S]*?<\/(?:item|entry)>/gi) || [];
  return items.slice(0, 12).map((item) => {
    const match = item.match(/<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i);
    return decode(match?.[1] || '');
  }).filter(Boolean);
}

async function load(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'RP-Foundation-App/1.0 RSS Reader', accept: 'application/rss+xml, application/xml, text/xml, */*' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`RSS ${response.status}`);
  return parseFeed(await response.text());
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    const [pibResult, sachetResult] = await Promise.allSettled([load(PIB), load(SACHET)]);
    const pib = pibResult.status === 'fulfilled' ? pibResult.value : [];
    const sachet = sachetResult.status === 'fulfilled' ? sachetResult.value : [];
    res.status(200).json({ success: true, data: { pib, sachet }, updatedAt: new Date().toISOString() });
  } catch (error) {
    res.status(502).json({ success: false, data: { pib: [], sachet: [] }, error: 'Unable to refresh official feeds' });
  }
}
