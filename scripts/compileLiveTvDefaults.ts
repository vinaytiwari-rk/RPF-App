import fs from "fs";
import indiaChannels from "../src/data/indiaVerifiedIptv.json";
import extraChannels from "../src/data/extraCategoryChannels.json";

interface ChannelItem {
  id: string;
  name: string;
  url: string;
  videoId?: string;
  category: string;
  logo?: string;
}

const NATIONAL_GOVT_CHANNELS: ChannelItem[] = [
  { id: 'gov-dd-news', name: 'DD News HD', url: 'https://www.youtube.com/live/qD6GkaU2lD0', videoId: 'qD6GkaU2lD0', category: 'News', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/DD_News_logo.svg/512px-DD_News_logo.svg.png' },
  { id: 'gov-dd-india', name: 'DD India HD', url: 'https://www.youtube.com/live/9X37FfIrKio', videoId: '9X37FfIrKio', category: 'News', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/DD_India_logo.svg/512px-DD_India_logo.svg.png' },
  { id: 'gov-sansad-1', name: 'Sansad TV 1', url: 'https://www.youtube.com/live/JO7CTaWAmGk', videoId: 'JO7CTaWAmGk', category: 'Legislative', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Sansad_TV_logo.svg/512px-Sansad_TV_logo.svg.png' },
  { id: 'gov-sansad-2', name: 'Sansad TV 2', url: 'https://www.youtube.com/live/py0W3aPWNXY', videoId: 'py0W3aPWNXY', category: 'Legislative', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Sansad_TV_logo.svg/512px-Sansad_TV_logo.svg.png' },
  { id: 'gov-dd-kisan', name: 'DD Kisan', url: 'https://www.youtube.com/live/izXvukZFBtg', videoId: 'izXvukZFBtg', category: 'News', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/DD_Kisan_logo.svg/512px-DD_Kisan_logo.svg.png' },
  { id: 'gov-swayam-1', name: 'Swayam Prabha: CH-1 Sanskar (Humanities)', url: 'https://www.youtube.com/live/J77z6Gc9X9c', videoId: 'J77z6Gc9X9c', category: 'Education', logo: 'https://www.swayamprabha.gov.in/assets/images/logo.png' },
  { id: 'gov-swayam-2', name: 'Swayam Prabha: CH-2 Sanvahak (Social Sci)', url: 'https://www.youtube.com/live/YI7CMkNDimY', videoId: 'YI7CMkNDimY', category: 'Education', logo: 'https://www.swayamprabha.gov.in/assets/images/logo.png' },
  { id: 'gov-swayam-3', name: 'Swayam Prabha: CH-3 Kautilya (Commerce)', url: 'https://www.youtube.com/live/nMDtN1mSNZs', videoId: 'nMDtN1mSNZs', category: 'Education', logo: 'https://www.swayamprabha.gov.in/assets/images/logo.png' },
  { id: 'gov-swayam-4', name: 'Swayam Prabha: CH-4 Aryabhatt (Maths)', url: 'https://www.youtube.com/live/FlWOhwRkZHw', videoId: 'FlWOhwRkZHw', category: 'Education', logo: 'https://www.swayamprabha.gov.in/assets/images/logo.png' },
  { id: 'gov-swayam-5', name: 'Swayam Prabha: CH-5 Spandan (Science)', url: 'https://www.youtube.com/live/JPlbtkNdh5s', videoId: 'JPlbtkNdh5s', category: 'Education', logo: 'https://www.swayamprabha.gov.in/assets/images/logo.png' },
  { id: 'gov-swayam-6', name: 'Swayam Prabha: CH-7 Vyas', url: 'https://www.youtube.com/live/R2fdpixKA9Q', videoId: 'R2fdpixKA9Q', category: 'Education', logo: 'https://www.swayamprabha.gov.in/assets/images/logo.png' },
  { id: 'gov-swayam-7', name: 'Swayam Prabha: CH-8 Aatmagyan', url: 'https://www.youtube.com/live/k1HJ5vtdI4Q', videoId: 'k1HJ5vtdI4Q', category: 'Education', logo: 'https://www.swayamprabha.gov.in/assets/images/logo.png' },
  { id: 'gov-swayam-8', name: 'Swayam Prabha: CH-9 AICTE', url: 'https://www.youtube.com/live/rYtFG0edlhk', videoId: 'rYtFG0edlhk', category: 'Education', logo: 'https://www.swayamprabha.gov.in/assets/images/logo.png' },
  { id: 'gov-swayam-9', name: 'Swayam Prabha: CH-10 IGNOU', url: 'https://www.youtube.com/live/Xq-rdCDGY_U', videoId: 'Xq-rdCDGY_U', category: 'Education', logo: 'https://www.swayamprabha.gov.in/assets/images/logo.png' },
];

function normalizeCategory(cat: string): string {
  const c = (cat || "").toLowerCase();
  if (c.includes("news") || c.includes("legislative") || c.includes("business")) return "News";
  if (c.includes("sport")) return "Sports";
  if (c.includes("movie") || c.includes("film")) return "Movies";
  if (c.includes("music")) return "Music";
  if (c.includes("kid") || c.includes("animation")) return "Kids";
  if (c.includes("relig") || c.includes("devot")) return "Religious";
  if (c.includes("docu") || c.includes("science")) return "Documentary";
  if (c.includes("edu") || c.includes("learn")) return "Education";
  if (c.includes("weather")) return "Weather";
  if (c.includes("entertain") || c.includes("comedy")) return "Entertainment";
  return "General";
}

function compile() {
  const seenUrls = new Set<string>();
  const allChannels: ChannelItem[] = [];

  // 1. National Govt Channels First
  for (const ch of NATIONAL_GOVT_CHANNELS) {
    if (!seenUrls.has(ch.url)) {
      seenUrls.add(ch.url);
      allChannels.push(ch);
    }
  }

  // 2. India Verified Channels
  for (const ch of (indiaChannels as any[])) {
    if (!seenUrls.has(ch.url)) {
      seenUrls.add(ch.url);
      allChannels.push({
        id: ch.id || `in-${allChannels.length + 1}`,
        name: ch.name,
        url: ch.url,
        category: normalizeCategory(ch.category),
        logo: ch.logo
      });
    }
  }

  // 3. Extra Category Channels (Sports, Documentary, Weather)
  for (const ch of (extraChannels as any[])) {
    if (!seenUrls.has(ch.url)) {
      seenUrls.add(ch.url);
      allChannels.push({
        id: ch.id || `ext-${allChannels.length + 1}`,
        name: ch.name,
        url: ch.url,
        category: normalizeCategory(ch.category),
        logo: ch.logo
      });
    }
  }

  console.log(`Total Compiled Live TV Channels: ${allChannels.length}`);

  // Group by category counts
  const categoryCounts: Record<string, number> = {};
  allChannels.forEach(c => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });
  console.log("Category Breakdown:", JSON.stringify(categoryCounts, null, 2));

  // Generate src/data/liveTvDefaults.ts
  const tsContent = `export type LiveTvChannel = {
  id: string;
  name: string;
  url: string;
  videoId?: string;
  category: string;
  logo?: string;
  enabled?: boolean;
  order?: number;
};

export const LIVE_TV_DEFAULTS: LiveTvChannel[] = ${JSON.stringify(
    allChannels.map((c, i) => ({
      ...c,
      enabled: true,
      order: i
    })),
    null,
    2
  )};
`;

  fs.writeFileSync("src/data/liveTvDefaults.ts", tsContent, "utf8");
  console.log("Successfully wrote src/data/liveTvDefaults.ts!");
}

compile();
