const fs = require('fs');
let c = fs.readFileSync('src/pages/Home.tsx', 'utf8');

c = c.replace(
  'const [loadingCMS, setLoadingCMS] = useState(true);',
  'const [loadingCMS, setLoadingCMS] = useState(true);\n  const [supremeConfig, setSupremeConfig] = useState<Record<string, string>>({});'
);

c = c.replace(
  'const [quoteError, setQuoteError] = useState(false);',
  'const [quoteError, setQuoteError] = useState(false);\n  useEffect(() => {\n    fetch("/api/supreme/configs").then(r => r.json()).then(d => { if(d.success) setSupremeConfig(d.configs); }).catch(() => {});\n  }, []);'
);

// Replace founder image
c = c.replace(
  'src={cms?.founderImgUrl || ROHIT_PANDIT_PHOTO}',
  'src={supremeConfig.founder_image_url || cms?.founderImgUrl || ROHIT_PANDIT_PHOTO}'
);
c = c.replace(
  'alt={cms?.founderName || "Rohit Pandit"}',
  'alt={supremeConfig.founder_name || cms?.founderName || "Rohit Pandit"}'
);

// Replace foundation logo in the top corner (if there)
c = c.replace(
  'src={cms?.logoImgUrl || RP_FOUNDATION_LOGO}',
  'src={supremeConfig.foundation_logo || cms?.logoImgUrl || RP_FOUNDATION_LOGO}'
);

// We need to inject Supreme configurations into the Marquee and Thought
c = c.replace(
  'const [pibResponse, mpResponse] = await Promise.all([',
  'const marqueeUrl = supremeConfig.marquee_rss_url || "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=2&Regid=3&reg=48";\n          const thoughtUrl = supremeConfig.thought_rss_url || "https://mpinfo.org/RSSFeed/RSSFeed_News.xml";\n          const [pibResponse, mpResponse] = await Promise.all(['
);

c = c.replace(
  'timedFetch("/api/public/rss-feed?url=" + encodeURIComponent("https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=2&Regid=3&reg=48")),',
  'timedFetch("/api/public/rss-feed?url=" + encodeURIComponent(marqueeUrl)),'
);

c = c.replace(
  'timedFetch("/api/public/rss-feed?url=" + encodeURIComponent("https://mpinfo.org/RSSFeed/RSSFeed_News.xml"))',
  'timedFetch("/api/public/rss-feed?url=" + encodeURIComponent(thoughtUrl))'
);

fs.writeFileSync('src/pages/Home.tsx', c, 'utf8');
console.log('Injected supremeConfig into Home.tsx');
