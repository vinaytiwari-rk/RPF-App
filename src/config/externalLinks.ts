export type ExternalLinkId =
  | 'directory-contact'
  | 'directory-web'
  | 'directory-public-utilities'
  | 'directory-helpline'
  | 'epaper-free-press-journal'
  | 'epaper-peoples-samachar'
  | 'epaper-mid-day'
  | 'epaper-aaj-tak'
  | 'epaper-financial-express'
  | 'epaper-telegraph'
  | 'epaper-live-hindustan'
  | 'epaper-lokdesh-bhopal'
  | 'epaper-hitavada'
  | 'epaper-central-chronicle'
  | 'epaper-navbharat-live'
  | 'epaper-pradesh-today'
  | 'epaper-mint'
  | 'epaper-daily-guardian'
  | 'epaper-subah-savere'
  | 'epaper-dainik-navajyoti'
  | 'epaper-navarashtra'
  | 'epaper-prabhat-khabar'
  | 'factcheck-bhaskar'
  | 'factcheck-boomlive'
  | 'factcheck-altnews'
  | 'factcheck-opindia'
  | 'factcheck-snopes'
  | 'factcheck-politifact'
  | 'factcheck-factcheck-org'
  | 'factcheck-reuters'
  | 'factcheck-ap'
  | 'factcheck-bbc'
  | 'factcheck-pti'
  | 'factcheck-newschecker';

export type ExternalLinkDefinition = Readonly<{
  id: ExternalLinkId;
  label: string;
  url: string;
  category: 'directory' | 'epaper' | 'fact-check';
}>;

/**
 * Canonical registry for the current critical external-link surfaces.
 * New external destinations should be added here (or migrated to a
 * service-specific registry) instead of scattering URLs through navigation code.
 */
export const EXTERNAL_LINK_REGISTRY: Readonly<Record<ExternalLinkId, ExternalLinkDefinition>> = {
  'directory-contact': { id: 'directory-contact', label: 'Contact Directory', url: 'https://www.india.gov.in/directory/contact-directory', category: 'directory' },
  'directory-web': { id: 'directory-web', label: 'Web Directory', url: 'https://www.india.gov.in/directory/web-directory', category: 'directory' },
  'directory-public-utilities': { id: 'directory-public-utilities', label: 'Public Utilities', url: 'https://www.india.gov.in/directory/public-utilities', category: 'directory' },
  'directory-helpline': { id: 'directory-helpline', label: 'Helpline', url: 'https://www.india.gov.in/directory/helpline', category: 'directory' },

  'epaper-free-press-journal': { id: 'epaper-free-press-journal', label: 'Free Press Journal', url: 'https://epaper.freepressjournal.in/', category: 'epaper' },
  'epaper-peoples-samachar': { id: 'epaper-peoples-samachar', label: "People's Samachar", url: 'https://epapers.peoplessamachar.in/', category: 'epaper' },
  'epaper-mid-day': { id: 'epaper-mid-day', label: 'Mid-Day', url: 'https://epaper.mid-day.com/', category: 'epaper' },
  'epaper-aaj-tak': { id: 'epaper-aaj-tak', label: 'Aaj Tak', url: 'https://epaper.aajtak.in/', category: 'epaper' },
  'epaper-financial-express': { id: 'epaper-financial-express', label: 'Financial Express', url: 'https://epaper.financialexpress.com/', category: 'epaper' },
  'epaper-telegraph': { id: 'epaper-telegraph', label: 'The Telegraph', url: 'https://epaper.telegraphindia.com/', category: 'epaper' },
  'epaper-live-hindustan': { id: 'epaper-live-hindustan', label: 'Live Hindustan', url: 'https://epaper.livehindustan.com/', category: 'epaper' },
  'epaper-lokdesh-bhopal': { id: 'epaper-lokdesh-bhopal', label: 'Lokdesh Bhopal', url: 'https://lokdesh.com/bhopal-e-papers/', category: 'epaper' },
  'epaper-hitavada': { id: 'epaper-hitavada', label: 'Hitavada', url: 'https://www.ehitavada.com/index.php?edition=BMpage&date={{DATE}}&page=1', category: 'epaper' },
  'epaper-central-chronicle': { id: 'epaper-central-chronicle', label: 'Central Chronicle', url: 'https://www.centralchronicle.com/epaper/', category: 'epaper' },
  'epaper-navbharat-live': { id: 'epaper-navbharat-live', label: 'Navbharat Live', url: 'https://epaper.navbharatlive.com/', category: 'epaper' },
  'epaper-pradesh-today': { id: 'epaper-pradesh-today', label: 'Pradesh Today', url: 'https://epaper.pradeshtoday.com/', category: 'epaper' },
  'epaper-mint': { id: 'epaper-mint', label: 'Mint', url: 'https://epaper.livemint.com/', category: 'epaper' },
  'epaper-daily-guardian': { id: 'epaper-daily-guardian', label: 'The Daily Guardian', url: 'https://epaper.thedailyguardian.com/', category: 'epaper' },
  'epaper-subah-savere': { id: 'epaper-subah-savere', label: 'Subah Savere Bhopal', url: 'https://epaper.subahsavere.news/view/2912/bhopal', category: 'epaper' },
  'epaper-dainik-navajyoti': { id: 'epaper-dainik-navajyoti', label: 'Dainik Navajyoti', url: 'https://epaper.dainiknavajyoti.com/', category: 'epaper' },
  'epaper-navarashtra': { id: 'epaper-navarashtra', label: 'Navarashtra', url: 'https://epaper.navarashtra.com/', category: 'epaper' },
  'epaper-prabhat-khabar': { id: 'epaper-prabhat-khabar', label: 'Prabhat Khabar', url: 'https://epaper.prabhatkhabar.com/', category: 'epaper' },

  'factcheck-bhaskar': { id: 'factcheck-bhaskar', label: 'Dainik Bhaskar No Fake News', url: 'https://www.bhaskar.com/no-fake-news/', category: 'fact-check' },
  'factcheck-boomlive': { id: 'factcheck-boomlive', label: 'BoomLive Fact Check', url: 'https://www.boomlive.in/fact-check', category: 'fact-check' },
  'factcheck-altnews': { id: 'factcheck-altnews', label: 'Alt News', url: 'https://www.altnews.in/', category: 'fact-check' },
  'factcheck-opindia': { id: 'factcheck-opindia', label: 'OpIndia Fact Check', url: 'https://www.opindia.com/category/fact-check/', category: 'fact-check' },
  'factcheck-snopes': { id: 'factcheck-snopes', label: 'Snopes', url: 'https://www.snopes.com/fact-check/', category: 'fact-check' },
  'factcheck-politifact': { id: 'factcheck-politifact', label: 'PolitiFact', url: 'https://politifact.com/', category: 'fact-check' },
  'factcheck-factcheck-org': { id: 'factcheck-factcheck-org', label: 'FactCheck.org', url: 'https://www.factcheck.org/', category: 'fact-check' },
  'factcheck-reuters': { id: 'factcheck-reuters', label: 'Reuters Fact Check', url: 'https://www.reuters.com/fact-check/', category: 'fact-check' },
  'factcheck-ap': { id: 'factcheck-ap', label: 'AP News Fact Check', url: 'https://apnews.com/ap-fact-check', category: 'fact-check' },
  'factcheck-bbc': { id: 'factcheck-bbc', label: 'BBC Verify', url: 'https://www.bbc.com/news/bbcverify', category: 'fact-check' },
  'factcheck-pti': { id: 'factcheck-pti', label: 'PTI Fact Check', url: 'https://www.ptinews.com/fact-check', category: 'fact-check' },
  'factcheck-newschecker': { id: 'factcheck-newschecker', label: 'NewsChecker', url: 'https://newschecker.in/', category: 'fact-check' },
};

export function getExternalLink(id: ExternalLinkId): ExternalLinkDefinition {
  return EXTERNAL_LINK_REGISTRY[id];
}
