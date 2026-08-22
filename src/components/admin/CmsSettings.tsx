import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import FileUpload from '../FileUpload';
import { useApp, CmsConfig } from '../../context/AppContext';
import { LIVE_TV_DEFAULTS, type LiveTvChannel } from '../../data/liveTvDefaults';
import rawRadioStations from '../../data/akashvaniChannels.json';
import { Save, User, Quote, FileText, Tv, Radio, Instagram } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

type RadioStation = { name: string; url: string; image: string; page: string; enabled?: boolean; order?: number };
const RADIO_DEFAULTS = rawRadioStations as RadioStation[];
const validRadio = (value: unknown): value is RadioStation[] => Array.isArray(value) && value.every((s: any) => s && typeof s.name === 'string' && typeof s.url === 'string');

const FACT_CHECK_DEFAULTS = [
  { name: "PIB Fact Check", nameHi: "पीआईबी फैक्ट चेक", url: "https://xcancel.com/pibfactcheck", description: "Press Information Bureau fact-checks regarding government policies and schemes.", descriptionHi: "सरकारी नीतियों और योजनाओं के संबंध में प्रेस सूचना ब्यूरो द्वारा तथ्य-जांच।" },
  { name: "Vishvas News", nameHi: "विश्वास न्यूज़", url: "https://www.vishvasnews.com/", description: "A leading Indian multilingual fact-checking website.", descriptionHi: "भारत की एक प्रमुख बहुभाषी तथ्य-जांच वेबसाइट।" },
  { name: "India Today Anti Fake News War", nameHi: "इंडिया टुडे एंटी फेक न्यूज़ वॉर", url: "https://xcancel.com/IndiaTodayFacts", description: "India Today fact-checks addressing viral misinformation.", descriptionHi: "इंडिया टुडे द्वारा वायरल भ्रामक जानकारियों की तथ्य-जांच।" },
  { name: "PTI Fact Check (X)", nameHi: "पीटीआई फैक्ट चेक (X)", url: "https://xcancel.com/ptifactcheck", description: "PTI's official fact-check handle on X/Twitter.", descriptionHi: "प्रेस ट्रस्ट ऑफ इंडिया (PTI) का आधिकारिक तथ्य-जांच हैंडल।" },
  { name: "MEA Fact Check", nameHi: "विदेश मंत्रालय फैक्ट चेक", url: "https://xcancel.com/MEAFactCheck", description: "Ministry of External Affairs official fact-checking handle.", descriptionHi: "विदेश मंत्रालय का आधिकारिक तथ्य-जांच हैंडल।" },
  { name: "Jansampark MP Fact Check", nameHi: "जनसंपर्क मध्य प्रदेश फैक्ट चेक", url: "https://xcancel.com/jansamparkFC", description: "Madhya Pradesh Government's official public relations fact-checker.", descriptionHi: "मध्य प्रदेश सरकार का आधिकारिक जनसंपर्क तथ्य-जांच हैंडल।" },
  { name: "NewsMeter Fact Check", nameHi: "न्यूज़मीटर फैक्ट चेक", url: "https://xcancel.com/newsmeterfacts", description: "Independent digital fact-checking and investigative journalism.", descriptionHi: "स्वतंत्र डिजिटल तथ्य-जांच और खोजी पत्रकारिता।" },
  { name: "UP Police Viral Check", nameHi: "यूपी पुलिस वायरल चेक", url: "https://xcancel.com/UPPViralCheck", description: "Uttar Pradesh Police official handle for checking viral rumors.", descriptionHi: "उत्तर प्रदेश पुलिस का वायरल अफवाहों की जांच का आधिकारिक हैंडल।" },
  { name: "Info UP Fact Check", nameHi: "इन्फो यूपी फैक्ट चेक", url: "https://xcancel.com/InfoUPFactcheck", description: "Information & Public Relations Department of UP fact-checking handle.", descriptionHi: "सूचना एवं जनसंपर्क विभाग (उत्तर प्रदेश) का आधिकारिक तथ्य-जांच हैंडल।" },
  { name: "Dainik Bhaskar No Fake News", nameHi: "दैनिक भास्कर - नो फेक न्यूज़", url: "https://www.bhaskar.com/no-fake-news/", description: "Fact-checks by Dainik Bhaskar.", descriptionHi: "दैनिक भास्कर द्वारा तथ्य-जांच।" },
  { name: "BoomLive Fact Check", nameHi: "बूमलाइव फैक्ट चेक", url: "https://www.boomlive.in/fact-check", description: "Independent digital journalism and fact-checking.", descriptionHi: "स्वतंत्र डिजिटल पत्रकारिता और तथ्य-जांच।" },
  { name: "Alt News", nameHi: "ऑल्ट न्यूज़", url: "https://www.altnews.in/", description: "A leading Indian fact-checking website.", descriptionHi: "भारत की एक प्रमुख तथ्य-जांच वेबसाइट।" }
];

export const CmsSettings = () => {
  const { token } = useAuth();
  const [cms, setCms] = useState<CmsConfig | null>(null);
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false);
  const [channelError, setChannelError] = useState(''), [channelText, setChannelText] = useState('[]');
  const [radioError, setRadioError] = useState(''), [radioText, setRadioText] = useState('[]');
  const [factCheckError, setFactCheckError] = useState(''), [factCheckText, setFactCheckText] = useState('[]');
  useEffect(() => { axios.get('/api/cms').then(res => { if (res.data.success) { const next=res.data.cms; setCms(next); setChannelText(JSON.stringify(Array.isArray(next.liveTvChannels)?next.liveTvChannels:[],null,2)); setRadioText(JSON.stringify(validRadio(next.internetRadioStations)?next.internetRadioStations:[],null,2)); setFactCheckText(JSON.stringify(Array.isArray(next.factCheckSources)?next.factCheckSources:[],null,2)); } }).catch(()=>undefined).finally(()=>setLoading(false)); }, []);
  const set = (key:string,value:unknown) => setCms(current => current ? { ...(current as any), [key]:value } : current);
  const channels = Array.isArray((cms as any)?.liveTvChannels) ? (cms as any).liveTvChannels as LiveTvChannel[] : [];
  const radios = validRadio((cms as any)?.internetRadioStations) ? (cms as any).internetRadioStations as RadioStation[] : [];
  const factChecks = Array.isArray((cms as any)?.factCheckSources) ? (cms as any).factCheckSources : [];
  const { refreshData } = useApp();
  const save = async () => {
    if (!cms || channelError || radioError || factCheckError) return;
    setSaving(true);
    try {
      const res = await axios.post('/api/cms', cms, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data && res.data.success !== false) {
        toast.success("CMS settings saved successfully!");
        await refreshData();
      } else {
        toast.error("Failed to save CMS settings.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err.message || "Unable to save CMS settings.");
    } finally {
      setSaving(false);
    }
  };
  const updateChannels=(raw:string)=>{setChannelText(raw);try{const parsed=JSON.parse(raw);if(!Array.isArray(parsed))throw new Error();set('liveTvChannels',parsed);setChannelError('')}catch{setChannelError('Channel list must be a valid JSON array before saving.')}};
  const updateRadio=(raw:string)=>{setRadioText(raw);try{const parsed=JSON.parse(raw);if(!validRadio(parsed))throw new Error();set('internetRadioStations',parsed);setRadioError('')}catch{setRadioError('Radio list must be a valid JSON array and every station needs at least name and url.')}};
  const updateFactCheck=(raw:string)=>{setFactCheckText(raw);try{const parsed=JSON.parse(raw);if(!Array.isArray(parsed))throw new Error();set('factCheckSources',parsed);setFactCheckError('')}catch{setFactCheckError('Fact check list must be a valid JSON array.')}};
  const loadDefaults=()=>{set('liveTvChannels',LIVE_TV_DEFAULTS);setChannelText(JSON.stringify(LIVE_TV_DEFAULTS,null,2));setChannelError('')};
  const clearChannels=()=>{set('liveTvChannels',[]);setChannelText('[]');setChannelError('')};
  const loadRadioDefaults=()=>{set('internetRadioStations',RADIO_DEFAULTS);setRadioText(JSON.stringify(RADIO_DEFAULTS,null,2));setRadioError('')};
  const clearRadio=()=>{set('internetRadioStations',[]);setRadioText('[]');setRadioError('')};
  const loadFactCheckDefaults=()=>{set('factCheckSources',FACT_CHECK_DEFAULTS);setFactCheckText(JSON.stringify(FACT_CHECK_DEFAULTS,null,2));setFactCheckError('')};
  const clearFactCheck=()=>{set('factCheckSources',[]);setFactCheckText('[]');setFactCheckError('')};
  if(loading||!cms)return <div className="space-y-4"><Skeleton className="h-10"/><Skeleton className="h-[220px]"/></div>;
  return <div className="max-w-4xl space-y-5 pb-20">
    <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400">Content only</p><h2 className="mt-1 text-xl font-black">Foundation content</h2><p className="mt-1 text-xs text-slate-500">Content changes are served from the CMS. Native Android changes still require a new APK.</p></div><button onClick={save} disabled={saving||!!channelError||!!radioError||!!factCheckError} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white disabled:opacity-50"><Save className="h-4 w-4"/>{saving?'Saving…':'Save changes'}</button></div>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="flex items-center gap-2 text-sm font-black text-[#FF9933]">
        <Instagram className="h-4 w-4 text-rose-600" /> Instagram Reels & Social Feed Link Control
      </h3>
      <p className="mt-1 text-xs text-slate-500">
        Paste any Instagram Reel or Post link below. It will automatically update and play live inside the app's Impact Reel carousel and vertical player.
      </p>
      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs font-bold text-slate-700">Instagram Reel / Post URL</label>
          <input
            type="url"
            value={cms.instagramReelUrl || ''}
            onChange={(e) => set('instagramReelUrl', e.target.value)}
            placeholder="https://www.instagram.com/reel/C... or https://www.instagram.com/rpfoundationofficial/"
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933]"
          />
        </div>
      </div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="flex items-center gap-2 text-sm font-black"><FileText className="h-4 w-4"/>General information</h3><div className="mt-4 grid gap-4"><FileUpload label="Site logo" defaultUrl={cms.logoImgUrl||''} onUploadSuccess={url=>set('logoImgUrl',url)}/><div><label className="text-xs font-bold text-slate-600">About content</label><textarea value={cms.aboutTextEn||''} onChange={e=>set('aboutTextEn',e.target.value)} rows={4} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none"/></div></div></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="flex items-center gap-2 text-sm font-black"><Tv className="h-4 w-4"/>Live TV remote control</h3><p className="mt-1 text-xs text-slate-500">Add, remove, disable, rename, recategorize or reorder channels. No APK rebuild is needed for channel changes.</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={loadDefaults} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold">Load current default channels ({LIVE_TV_DEFAULTS.length})</button><button type="button" onClick={clearChannels} className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">Clear all</button><span className="self-center text-[11px] text-slate-400">Configured: {channels.length}</span></div><label className="mt-4 block text-xs font-bold text-slate-600">Channel JSON</label><textarea value={channelText} onChange={e=>updateChannels(e.target.value)} rows={14} spellCheck={false} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-950 px-3 py-3 font-mono text-xs text-slate-100 outline-none"/>{channelError&&<p className="mt-2 text-xs font-semibold text-rose-600">{channelError}</p>}</section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="flex items-center gap-2 text-sm font-black"><Radio className="h-4 w-4"/>Internet Radio remote control</h3><p className="mt-1 text-xs text-slate-500">The complete bundled station list is preserved as a safe fallback. Load the current list once, save it to the CMS, then add, remove, disable, edit or reorder stations without an APK rebuild.</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={loadRadioDefaults} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold">Load current bundled stations ({RADIO_DEFAULTS.length})</button><button type="button" onClick={clearRadio} className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">Clear all</button><span className="self-center text-[11px] text-slate-400">Configured: {radios.length}</span></div><label className="mt-4 block text-xs font-bold text-slate-600">Station JSON</label><textarea value={radioText} onChange={e=>updateRadio(e.target.value)} rows={18} spellCheck={false} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-950 px-3 py-3 font-mono text-xs text-slate-100 outline-none"/>{radioError&&<p className="mt-2 text-xs font-semibold text-rose-600">{radioError}</p>}<p className="mt-2 text-[11px] text-slate-500">Each station needs name and url. Optional: image, page, enabled and order. Set enabled:false to hide without deleting.</p></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="flex items-center gap-2 text-sm font-black"><FileText className="h-4 w-4"/>Fact Check Sources remote control</h3><p className="mt-1 text-xs text-slate-500">Add, remove, disable, edit or reorder fact-checking sources. Changes will instantly update on all users' screens without needing an APK update.</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={loadFactCheckDefaults} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold">Load current default sources ({FACT_CHECK_DEFAULTS.length})</button><button type="button" onClick={clearFactCheck} className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">Clear all</button><span className="self-center text-[11px] text-slate-400">Configured: {factChecks.length}</span></div><label className="mt-4 block text-xs font-bold text-slate-600">Sources JSON</label><textarea value={factCheckText} onChange={e=>updateFactCheck(e.target.value)} rows={14} spellCheck={false} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-950 px-3 py-3 font-mono text-xs text-slate-100 outline-none"/>{factCheckError&&<p className="mt-2 text-xs font-semibold text-rose-600">{factCheckError}</p>}<p className="mt-2 text-[11px] text-slate-500">Each source needs name, nameHi, url, description, and descriptionHi.</p></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="flex items-center gap-2 text-sm font-black"><User className="h-4 w-4"/>Founder profile</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><input value={cms.founderName||''} onChange={e=>set('founderName',e.target.value)} placeholder="Founder name" className="rounded-xl border border-slate-200 px-3 py-3 text-sm"/><input value={cms.founderDesignation||''} onChange={e=>set('founderDesignation',e.target.value)} placeholder="Designation" className="rounded-xl border border-slate-200 px-3 py-3 text-sm"/><div className="sm:col-span-2"><FileUpload label="Founder image" defaultUrl={cms.founderImgUrl||''} onUploadSuccess={url=>set('founderImgUrl',url)}/></div></div></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="flex items-center gap-2 text-sm font-black"><Quote className="h-4 w-4"/>Optional messaging</h3><div className="mt-4 grid gap-4"><textarea value={cms.quoteOfTheDayEn||''} onChange={e=>set('quoteOfTheDayEn',e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"/><textarea value={cms.impactBottomTextEn||''} onChange={e=>set('impactBottomTextEn',e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"/></div></section>
  </div>;
};
