const fs = require('fs');
const path = require('path');

const PRIORITY_CHANNELS_DATA = [
  { name: "DD News", url: "https://www.youtube.com/live/qD6GkaU2lD0", category: "News" },
  { name: "DD India", url: "https://www.youtube.com/live/9X37FfIrKio", category: "News" },
  { name: "NASA", url: "https://www.youtube.com/live/M3HKLzjvKPc", category: "Documentary" },
  { name: "United Nation", url: "https://www.youtube.com/live/vYRfQo6JMxc", category: "News" },
  { name: "Sansad 1", url: "https://www.youtube.com/live/JO7CTaWAmGk", category: "News" },
  { name: "Swayam Prabha: Language, Literature, History, Culture & Philosophy", url: "https://www.youtube.com/live/gFHiva4w7zU", category: "Education" },
  { name: "Education, Home Science, Information & Management Studies", url: "https://www.youtube.com/live/dCnCJ4g96HA", category: "Education" },
  { name: "Economics, Commerce and Finance", url: "https://www.youtube.com/live/-xHUL9Qtdqo", category: "Education" },
  { name: "Physical Sciences, Mathematics, Physics & Chemistry", url: "https://www.youtube.com/live/xrBzYPH5xyY", category: "Education" },
  { name: "Life Sciences, Botany, Zoology & Bio-Science", url: "https://www.youtube.com/live/AQn627K1WL0", category: "Education" },
  { name: "Applied Sciences & Allied Physical and Chemical Sciences", url: "https://www.youtube.com/live/bboEr8Xsujg", category: "Education" },
  { name: "Social & Behavioural Sciences, Law & Human Rights", url: "https://www.youtube.com/live/dVj9AMYKQj8", category: "Education" },
  { name: "Technology and Innovation", url: "https://www.youtube.com/live/eI5jfKFwCyk", category: "Education" },
  { name: "Indian and Foreign Languages", url: "https://www.youtube.com/live/xsnd2UeR8sE", category: "Education" },
  { name: "Social Sciences and Humanities", url: "https://www.youtube.com/live/cMGdvs6Y42k", category: "Education" },
  { name: "Basic and Applied Sciences", url: "https://www.youtube.com/live/YOKsWfGFBTo", category: "Education" },
  { name: "Professional Education", url: "https://www.youtube.com/live/JvLnbpOdEWg", category: "Education" },
  { name: "Capacity Building and Teacher Education", url: "https://www.youtube.com/live/HwerScCSY54", category: "Education" },
  { name: "Skill and Vocational Education", url: "https://www.youtube.com/live/mc87pn4MizM", category: "Education" },
  { name: "Biotechnology and Biochemical Engineering", url: "https://www.youtube.com/live/QGbT-R5Yghk", category: "Education" },
  { name: "Electronics and Communication Engineering", url: "https://www.youtube.com/live/K0nBC65e_Dc", category: "Education" },
  { name: "Electrical Engineering", url: "https://www.youtube.com/live/m0hIkld8UsE", category: "Education" },
  { name: "Physics", url: "https://www.youtube.com/live/Yf7DJvAPaBs", category: "Education" },
  { name: "Textile Engineering", url: "https://www.youtube.com/live/PnYOgDdeWPI", category: "Education" },
  { name: "Civil Engineering", url: "https://www.youtube.com/live/QcXp4RaOrRM", category: "Education" },
  { name: "Aeronautical Engineering", url: "https://www.youtube.com/live/QWvODUxBDMQ", category: "Education" },
  { name: "Humanities and Social Sciences", url: "https://www.youtube.com/live/zlO9Xt1qgno", category: "Education" },
  { name: "Management, Law, Economics & Business Analytics", url: "https://www.youtube.com/live/FpwpJ-q6W0I", category: "Education" },
  { name: "Mechanical Engineering and Manufacturing", url: "https://www.youtube.com/live/PriApwtX0g0", category: "Education" },
  { name: "Visual Communications, Graphic Design & Media Technology", url: "https://www.youtube.com/live/1Pb9hz1TqGo", category: "Education" },
  { name: "Architecture and Interior Design", url: "https://www.youtube.com/live/mFSfDJJo6Mg", category: "Education" },
  { name: "Computer Science Engineering / IT", url: "https://www.youtube.com/live/mFSfDJJo6Mg", category: "Education" },
  { name: "Instrumentation Control, Biomedical and Engineering", url: "https://www.youtube.com/live/SgGWOXHeErM", category: "Education" },
  { name: "Bridge Courses and Impact Series", url: "https://www.youtube.com/live/oXCdp4PHIPE", category: "Education" },
  { name: "Chemical Engineering, Nanotechnology & Environmental Sciences", url: "https://www.youtube.com/live/6IkM4xJzDZQ", category: "Education" },
  { name: "Health Sciences", url: "https://www.youtube.com/live/_aelcmNSYBo", category: "Education" },
  { name: "Metallurgical, Material Science, Mining and Ocean Engineering", url: "https://www.youtube.com/live/ONnJq2xBZaQ", category: "Education" },
  { name: "Chemistry, Biochemistry and Food Processing Engineering", url: "https://www.youtube.com/live/uFY8aWjAwLs", category: "Education" },
  { name: "Mathematics", url: "https://www.youtube.com/live/VJYuwoSV910", category: "Education" },
  { name: "Performing Arts: Classical Dances, Theatre & Painting", url: "https://www.youtube.com/live/GC8DcaZXShM", category: "Education" },
  { name: "Performing Arts: Indian Classical Music", url: "https://www.youtube.com/live/8JsyhcIoeuI", category: "Education" }
];

function extractVideoId(url) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:live\/|embed\/|shorts\/|watch\?v=))([^?&/]+)/);
  return m ? m[1] : undefined;
}

function getLogo(name, url, category, videoId) {
  const n = name.toLowerCase();
  if (n.includes('dd news')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/DD_News_logo.svg/512px-DD_News_logo.svg.png';
  if (n.includes('dd india')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/DD_India_logo.svg/512px-DD_India_logo.svg.png';
  if (n.includes('nasa')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/512px-NASA_logo.svg.png';
  if (n.includes('united nation')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Flag_of_the_United_Nations.svg/512px-Flag_of_the_United_Nations.svg.png';
  if (n.includes('sansad')) return 'https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Sansad_TV_logo.svg/512px-Sansad_TV_logo.svg.png';
  if (category === 'Education') {
    if (videoId) return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    return 'https://www.swayamprabha.gov.in/assets/images/logo.png';
  }
  if (videoId) return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  return undefined;
}

const targetPath = path.resolve(__dirname, '../src/data/liveTvDefaults.ts');
const content = fs.readFileSync(targetPath, 'utf8');

// Extract existing LIVE_TV_DEFAULTS
const jsonMatch = content.match(/export const LIVE_TV_DEFAULTS: LiveTvChannel\[\] = (\[[\s\S]*?\]);\s*$/);
if (!jsonMatch) {
  console.error("Could not find LIVE_TV_DEFAULTS array in liveTvDefaults.ts");
  process.exit(1);
}

const existingChannels = JSON.parse(jsonMatch[1]);
console.log(`Read ${existingChannels.length} existing channels.`);

const priorityChannels = PRIORITY_CHANNELS_DATA.map((ch, idx) => {
  const videoId = extractVideoId(ch.url);
  const slug = ch.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return {
    id: `top-${idx + 1}-${slug.slice(0, 30)}`,
    name: ch.name,
    url: ch.url,
    videoId,
    category: ch.category,
    logo: getLogo(ch.name, ch.url, ch.category, videoId),
    enabled: true,
    order: idx
  };
});

// Priority URL set for deduplication
const priorityUrlSet = new Set(priorityChannels.map(c => c.url.trim().toLowerCase()));
const priorityNameSet = new Set(priorityChannels.map(c => c.name.trim().toLowerCase()));

// Filter out duplicates from existing list
const remainingChannels = existingChannels.filter(c => {
  const u = (c.url || '').trim().toLowerCase();
  const n = (c.name || '').trim().toLowerCase();
  return !priorityUrlSet.has(u) && !priorityNameSet.has(n);
});

console.log(`Remaining existing channels after deduplication: ${remainingChannels.length}`);

// Combine priority channels first, then remaining
const combinedList = [
  ...priorityChannels,
  ...remainingChannels
].map((c, idx) => ({
  ...c,
  order: idx
}));

console.log(`Total combined channels: ${combinedList.length}`);

const newFileContent = `export type LiveTvChannel = {
  id: string;
  name: string;
  url: string;
  videoId?: string;
  category: string;
  logo?: string;
  enabled?: boolean;
  order?: number;
};

export const normalizeTvChannelName = (name: string) => name.trim().toLowerCase();

export const PRIORITY_LIVE_TV_CHANNELS: LiveTvChannel[] = ${JSON.stringify(priorityChannels, null, 2)};

export const LIVE_TV_DEFAULTS: LiveTvChannel[] = ${JSON.stringify(combinedList, null, 2)};

/**
 * A saved catalogue is merged such that the user-demanded Priority Channels
 * (DD News, DD India, NASA, UN, Sansad, Swayam Prabha educational streams)
 * ALWAYS remain at the very top (orders 0 to 40), while all other channels
 * follow directly after them.
 */
export const mergeTvCatalogue = (configured: unknown): LiveTvChannel[] => {
  const priorityList = PRIORITY_LIVE_TV_CHANNELS.map((ch, idx) => ({
    ...ch,
    order: idx,
    enabled: true
  }));

  const seenUrls = new Set(priorityList.map(c => c.url.trim().toLowerCase()));
  const seenNames = new Set(priorityList.map(c => c.name.trim().toLowerCase()));

  const sourceList = Array.isArray(configured) ? configured : LIVE_TV_DEFAULTS;

  const remaining = sourceList
    .filter((item: any) =>
      item &&
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      item.name.trim() &&
      typeof item.url === "string" &&
      item.url.trim()
    )
    .filter((item: LiveTvChannel) => {
      const u = item.url.trim().toLowerCase();
      const n = item.name.trim().toLowerCase();
      if (seenUrls.has(u) || seenNames.has(n)) return false;
      seenUrls.add(u);
      return true;
    })
    .map((item: LiveTvChannel) => ({
      ...item,
      enabled: item.enabled !== false,
    }));

  return [
    ...priorityList,
    ...remaining
  ].map((c, idx) => ({ ...c, order: idx }));
};
`;

fs.writeFileSync(targetPath, newFileContent, 'utf8');
console.log("Successfully updated src/data/liveTvDefaults.ts with priority channels at the top!");

