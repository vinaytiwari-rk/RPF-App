import { CORE_SERVICES } from '../../data/coreServices';
import { SERVICE_GOV_LINKS, type GovLink } from "../../data/serviceGovLinks";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import FileUpload from '../FileUpload';
import { useApp, CmsConfig } from '../../context/AppContext';
import { LIVE_TV_DEFAULTS, type LiveTvChannel } from '../../data/liveTvDefaults';
import rawRadioStations from '../../data/akashvaniChannels.json';
import privateFmStations from '../../data/privateFmChannels.json';
import {
  Save,
  User,
  Quote,
  FileText,
  Tv,
  Radio,
  Instagram,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  ShieldCheck,
  Check,
  RefreshCw,
  X,
} from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

type RadioStation = { name: string; url: string; image?: string; page?: string; enabled?: boolean; order?: number };
const RADIO_DEFAULTS = [...rawRadioStations, ...privateFmStations] as RadioStation[];
const normalizeRadioName = (name: string) => name.trim().toLocaleLowerCase();
const mergeRadioDefaults = (configured: unknown): RadioStation[] => {
  const merged = new Map<string, RadioStation>();
  RADIO_DEFAULTS.forEach((station, index) => {
    const key = normalizeRadioName(station.name);
    if (key && (station.url?.startsWith("http://") || station.url?.startsWith("https://"))) {
      merged.set(key, { ...station, order: station.order ?? index, enabled: station.enabled !== false });
    }
  });
  if (Array.isArray(configured)) {
    configured.forEach((value: any, index) => {
      if (!value || typeof value.name !== "string" || !value.name.trim() ||
          typeof value.url !== "string" || !(value.url.startsWith("http://") || value.url.startsWith("https://"))) return;
      const key = normalizeRadioName(value.name);
      const existing = merged.get(key);
      merged.set(key, { ...existing, ...value, order: value.order ?? existing?.order ?? RADIO_DEFAULTS.length + index, enabled: value.enabled !== false });
    });
  }
  return [...merged.values()].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

const FACT_CHECK_DEFAULTS = [
  { name: "PIB Fact Check", nameHi: "पीआईबी फैक्ट चेक", url: "https://xcancel.com/pibfactcheck", description: "Press Information Bureau fact-checks regarding government policies.", descriptionHi: "सरकारी नीतियों के संबंध में तथ्य-जांच।" },
  { name: "Vishvas News", nameHi: "विश्वास न्यूज़", url: "https://www.vishvasnews.com/", description: "Leading Indian multilingual fact-checking portal.", descriptionHi: "भारत की प्रमुख बहुभाषी तथ्य-जांच वेबसाइट।" },
  { name: "BoomLive Fact Check", nameHi: "बूमलाइव फैक्ट चेक", url: "https://www.boomlive.in/fact-check", description: "Independent digital journalism and fact-checking.", descriptionHi: "स्वतंत्र डिजिटल पत्रकारिता और तथ्य-जांच।" },
  { name: "Alt News", nameHi: "ऑल्ट न्यूज़", url: "https://www.altnews.in/", description: "Independent Indian fact-checking portal.", descriptionHi: "भारत की स्वतंत्र तथ्य-जांच वेबसाइट।" }
];

export const CmsSettings = () => {
  const { token } = useAuth();
  const { refreshData, servicesList } = useApp();
  const [cms, setCms] = useState<CmsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Visual Add Form Modal States
  const [activeTab, setActiveTab] = useState<'tv' | 'radio' | 'factcheck' | 'general' | 'links'>('general');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'tv' | 'radio' | 'factcheck'>('tv');

  // Form Inputs
  const [nameInput, setNameInput] = useState('');
  const [nameHiInput, setNameHiInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('General');
  const [descInput, setDescInput] = useState('');

  useEffect(() => {
    axios
      .get('/api/cms', { timeout: 15000, headers: { 'Cache-Control': 'no-cache' } })
      .then((res) => {
        if (res.data.success) {
          const next = res.data.cms;
          setCms(next);
        }
      })
      .catch((err) => setLoadError(err?.response?.status === 503 ? "Backend unavailable (HTTP 503). Check server deployment and Passenger logs." : "CMS could not be loaded. Check connection and login."))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: string, value: unknown) =>
    setCms((current) => (current ? ({ ...(current as any), [key]: value } as CmsConfig) : current));

  const channels: LiveTvChannel[] = Array.isArray((cms as any)?.liveTvChannels)
    ? (cms as any).liveTvChannels
    : LIVE_TV_DEFAULTS;

  const radios: RadioStation[] = mergeRadioDefaults((cms as any)?.internetRadioStations);

  const factChecks = Array.isArray((cms as any)?.factCheckSources)
    ? (cms as any).factCheckSources
    : FACT_CHECK_DEFAULTS;

  const [selectedService, setSelectedService] = useState('blood');
  const serviceOptions = Array.from(new Set([...Object.keys(SERVICE_GOV_LINKS), ...CORE_SERVICES.map(s => s.id), ...servicesList.map((s: any) => s.id).filter(Boolean)])).sort();
  const websiteOverrides = ((cms as any)?.serviceWebsiteLinks || {}) as Record<string, GovLink[]>;
  const currentWebsites = Object.prototype.hasOwnProperty.call(websiteOverrides, selectedService)
    ? websiteOverrides[selectedService] : (SERVICE_GOV_LINKS[selectedService] || []);
  const updateWebsites = (links: GovLink[]) =>
    set('serviceWebsiteLinks', { ...websiteOverrides, [selectedService]: links });
  const [websiteDraft, setWebsiteDraft] = useState<GovLink>({ title: '', titleHi: '', desc: '', descHi: '', url: '', isGov: false });
  const [editingWebsite, setEditingWebsite] = useState<number | null>(null);
  const saveWebsite = () => {
    const websiteUrl = websiteDraft.url.trim();
    let validWebsiteUrl = false;
    try { validWebsiteUrl = ['http:', 'https:'].includes(new URL(websiteUrl).protocol); } catch { validWebsiteUrl = false; }
    if (!websiteDraft.title.trim() || !validWebsiteUrl) {
      toast.error('Enter a website name and a valid http/https URL'); return;
    }
    const next = [...currentWebsites];
    const item = { ...websiteDraft, title: websiteDraft.title.trim(), url: websiteDraft.url.trim() };
    if (editingWebsite === null) next.push(item); else next[editingWebsite] = item;
    updateWebsites(next);
    setEditingWebsite(null);
    setWebsiteDraft({ title: '', titleHi: '', desc: '', descHi: '', url: '', isGov: false });
    toast('Website list changed. Click Save All System Settings to publish.');
  };

  const save = async () => {
    if (!cms) return;
    setSaving(true);
    try {
      const res = await axios.post('/api/cms', cms, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data && res.data.success !== false) {
        toast.success("System Config & CMS settings saved successfully!");
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

  // 1-Click Operations for Live TV
  const addChannel = () => {
    if (!nameInput.trim() || !urlInput.trim()) {
      toast.error("Channel name and stream URL are required.");
      return;
    }
    const newChan: LiveTvChannel = {
      id: `tv-${Date.now()}`,
      name: nameInput.trim(),
      url: urlInput.trim(),
      category: categoryInput.trim() || 'General',
    };
    set('liveTvChannels', [newChan, ...channels]);
    toast.success(`Added Live TV channel: ${newChan.name}`);
    setShowAddModal(false);
    resetModalInputs();
  };

  const deleteChannel = (index: number) => {
    const next = [...channels];
    next.splice(index, 1);
    set('liveTvChannels', next);
    toast.success("Channel removed. Tap 'Save Changes' to publish.");
  };

  const validStreamUrl = (value: string) => {
    try {
      const parsed = new URL(value.trim());
      return ['https:', 'http:'].includes(parsed.protocol) && Boolean(parsed.hostname);
    } catch { return false; }
  };
  const [radioTestUrl, setRadioTestUrl] = useState<string | null>(null);
  const [radioTestStatus, setRadioTestStatus] = useState('');
  const testRadio = async (url: string) => {
    setRadioTestUrl(url);
    setRadioTestStatus('Checking stream response…');
    try {
      // Cross-origin stations may prohibit browser probing even when native audio plays.
      const response = await fetch(url, { method: 'GET', mode: 'cors', headers: { Range: 'bytes=0-1023' }, signal: AbortSignal.timeout(8000) });
      setRadioTestStatus(response.ok ? 'Stream endpoint responded; playback must still be checked on Android.' : `Stream returned HTTP ${response.status}`);
      await response.body?.cancel();
    } catch {
      setRadioTestStatus('Browser check blocked or timed out. Verify playback in the app.');
    }
  };
  // 1-Click Operations for Radio
  const addRadio = () => {
    if (!nameInput.trim() || !validStreamUrl(urlInput)) {
      toast.error("Station name and a valid http/https stream URL are required.");
      return;
    }
    const newRadio: RadioStation = {
      name: nameInput.trim(),
      url: urlInput.trim(),
      enabled: true,
    };
    set('internetRadioStations', [newRadio, ...radios]);
    toast.success(`Added Radio Station: ${newRadio.name}`);
    setShowAddModal(false);
    resetModalInputs();
  };

  const editRadio = (index: number) => {
    const station = radios[index];
    const name = window.prompt('Station name', station.name);
    if (name === null) return;
    const url = window.prompt('Direct audio stream URL (MP3, AAC or HLS .m3u8)', station.url);
    if (url === null) return;
    let valid = false;
    valid = validStreamUrl(url);
    if (!name.trim() || !valid) { toast.error('Valid name and stream URL required'); return; }
    set('internetRadioStations', radios.map((item, i) => i === index ? { ...item, name: name.trim(), url: url.trim() } : item));
    toast('Station edited. Save All System Settings to publish.');
  };
  const toggleRadioStation = (index: number) => {
    set('internetRadioStations', radios.map((item, i) => i === index ? { ...item, enabled: item.enabled === false } : item));
  };

  const deleteRadio = (index: number) => {
    const next = [...radios];
    next.splice(index, 1);
    set('internetRadioStations', next);
    toast.success("Radio station removed.");
  };

  // 1-Click Operations for Fact Check
  const addFactCheck = () => {
    if (!nameInput.trim() || !urlInput.trim()) {
      toast.error("Source name and URL are required.");
      return;
    }
    const newFc = {
      name: nameInput.trim(),
      nameHi: nameHiInput.trim() || nameInput.trim(),
      url: urlInput.trim(),
      description: descInput.trim() || "Fact-checking source",
      descriptionHi: descInput.trim() || "तथ्य-जांच स्रोत",
    };
    set('factCheckSources', [newFc, ...factChecks]);
    toast.success(`Added Fact-Check Source: ${newFc.name}`);
    setShowAddModal(false);
    resetModalInputs();
  };

  const deleteFactCheck = (index: number) => {
    const next = [...factChecks];
    next.splice(index, 1);
    set('factCheckSources', next);
    toast.success("Fact-check source removed.");
  };

  const resetModalInputs = () => {
    setNameInput('');
    setNameHiInput('');
    setUrlInput('');
    setCategoryInput('General');
    setDescInput('');
  };

  if (loadError || (!loading && !cms)) {
    return <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
      <h3 className="font-bold">Admin CMS could not load</h3>
      <p className="mt-2 text-sm">{loadError || 'CMS response was empty.'}</p>
      <button className="mt-3 rounded-xl bg-[#167C5A] px-4 py-2 text-sm font-bold text-white" onClick={() => window.location.reload()}>Retry</button>
    </div>;
  }
  if (loading || !cms) {
    return <div className="space-y-4 p-6"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="max-w-5xl space-y-6 pb-24 font-sans text-slate-900">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[.18em] text-[#FF9933] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100">
            System Control & CMS
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">System Configuration & Media Manager</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage Instagram Reels, Live TV Channels, Internet Radio Stations, Fact-Checking Sources & Founder Profile without raw code textareas.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF9933] to-[#D97706] px-6 py-3 text-xs font-black text-white shadow-md active:scale-95 transition hover:brightness-110 shrink-0 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving Changes..." : "Save All System Settings"}
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition ${
            activeTab === 'general'
              ? 'bg-[#167C5A] text-white shadow-sm'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <User className="h-4 w-4" /> Profile & Instagram Reels
        </button>
        <button
          onClick={() => setActiveTab('tv')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition ${
            activeTab === 'tv'
              ? 'bg-[#167C5A] text-white shadow-sm'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Tv className="h-4 w-4" /> Live TV Channels ({channels.length})
        </button>
        <button
          onClick={() => setActiveTab('radio')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition ${
            activeTab === 'radio'
              ? 'bg-[#167C5A] text-white shadow-sm'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Radio className="h-4 w-4" /> Radio Stations ({radios.length})
        </button>
        <button
          onClick={() => setActiveTab('factcheck')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition ${
            activeTab === 'factcheck'
              ? 'bg-[#167C5A] text-white shadow-sm'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="h-4 w-4" /> Fact Check Sources ({factChecks.length})
        </button>
        <button onClick={() => setActiveTab('links')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition ${activeTab === 'links' ? 'bg-[#167C5A] text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600'}`}>
          <ExternalLink className="h-4 w-4" /> Service Website Links
        </button>
      </div>

      {activeTab === 'links' && (
        <section className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-4">
          <h3 className="text-lg font-extrabold text-[#243B32]">Service Website Manager</h3>
          <p className="text-xs text-slate-600">Select a service to edit, remove or add its website links. Changes appear to users after Save All System Settings.</p>
          <label className="block text-sm font-semibold">Choose Service
            <select className="mt-2 w-full rounded-xl border border-slate-200 p-3" value={selectedService}
              onChange={e => { setSelectedService(e.target.value); setEditingWebsite(null); }}>
              {serviceOptions.map(id => <option key={id} value={id}>{id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} ({(Object.prototype.hasOwnProperty.call(websiteOverrides, id) ? websiteOverrides[id] : (SERVICE_GOV_LINKS[id] || [])).length})</option>)}
            </select>
          </label>
          <div className="space-y-2">{currentWebsites.map((link, index) => (
            <div key={index} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-3">
              <div className="min-w-0"><p className="text-sm font-bold">{link.title}</p><p className="break-all text-xs text-slate-500">{link.url}</p></div>
              <div className="flex shrink-0 gap-2">
                <button type="button" aria-label={`Edit ${link.title}`} className="rounded-lg bg-emerald-50 p-2 text-emerald-800"
                  onClick={() => { setWebsiteDraft(link); setEditingWebsite(index); }}><Edit3 className="h-4 w-4"/></button>
                <button type="button" aria-label={`Remove ${link.title}`} className="rounded-lg bg-red-50 p-2 text-red-700"
                  onClick={() => { if (window.confirm(`Remove ${link.title} from ${selectedService}?`)) { updateWebsites(currentWebsites.filter((_, i) => i !== index)); if (editingWebsite === index) setEditingWebsite(null); } }}><Trash2 className="h-4 w-4"/></button>
              </div>
            </div>
          ))}</div>
          <div className="space-y-3 rounded-xl bg-emerald-50/50 p-4">
            <h4 className="font-bold">{editingWebsite === null ? 'Add Website' : 'Edit Website'}</h4>
            {(['title', 'titleHi', 'url', 'desc', 'descHi'] as const).map(field => (
              <label key={field} className="block text-xs font-semibold">{({title:'Website Name',titleHi:'Hindi Name',url:'Website URL',desc:'Description',descHi:'Hindi Description'})[field]}
                <input className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm" value={websiteDraft[field] || ''}
                  onChange={e => setWebsiteDraft(d => ({...d,[field]:e.target.value}))} />
              </label>
            ))}
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={websiteDraft.isGov === true}
              onChange={e => setWebsiteDraft(d => ({...d,isGov:e.target.checked}))}/> Official government website (only if verified)</label>
            <div className="flex gap-2">
              <button type="button" onClick={saveWebsite} className="rounded-xl bg-[#167C5A] px-4 py-2 text-sm font-bold text-white">{editingWebsite === null ? 'Add Link' : 'Update Link'}</button>
              {editingWebsite !== null && <button type="button" onClick={() => {setEditingWebsite(null);setWebsiteDraft({title:'',titleHi:'',desc:'',descHi:'',url:'',isGov:false});}} className="rounded-xl border px-4 py-2 text-sm">Cancel</button>}
            </div>
          </div>
        </section>
      )}

      {/* TAB 1: GENERAL & INSTAGRAM REELS */}
      {activeTab === 'general' && (
        <div className="space-y-5">
          {/* Instagram Reels Direct Input Card */}
          <section className="rounded-3xl border border-orange-200/80 bg-white p-6 shadow-sm space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-black text-[#FF9933]">
              <Instagram className="h-5 w-5 text-rose-600" /> Instagram Reels & Media Link Control
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Paste any Instagram Reel or Post URL below. It automatically updates and plays live inside the app's Impact Reel carousel and vertical swipe player.
            </p>
            <div>
              <label className="text-xs font-bold text-slate-700">Instagram Reel / Post URL</label>
              <input
                type="url"
                value={cms.instagramReelUrl || ''}
                onChange={(e) => set('instagramReelUrl', e.target.value)}
                placeholder="https://www.instagram.com/reel/C... or https://www.instagram.com/rpfoundationofficial/"
                className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs font-bold outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933]"
              />
            </div>
          </section>

          {/* Founder Profile */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-900">
              <User className="h-4 w-4 text-[#000080]" /> Founder Profile & Branding Settings
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-slate-700">Founder Name</label>
                <input
                  value={cms.founderName || ''}
                  onChange={(e) => set('founderName', e.target.value)}
                  placeholder="e.g. Shri Rohit Pandit Ji"
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs font-bold outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Designation</label>
                <input
                  value={cms.founderDesignation || ''}
                  onChange={(e) => set('founderDesignation', e.target.value)}
                  placeholder="e.g. Founder, RP Foundation"
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs font-bold outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <FileUpload
                  label="Founder Photo"
                  defaultUrl={cms.founderImgUrl || ''}
                  onUploadSuccess={(url) => set('founderImgUrl', url)}
                />
              </div>
              <div className="sm:col-span-2">
                <FileUpload
                  label="Foundation Logo Image"
                  defaultUrl={cms.logoImgUrl || ''}
                  onUploadSuccess={(url) => set('logoImgUrl', url)}
                />
              </div>
            </div>
          </section>

          {/* Messaging & Mottos */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-900">
              <Quote className="h-4 w-4 text-[#FF9933]" /> App Messaging & Daily Quote
            </h3>
            <div className="grid gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Quote of the Day (Motto)</label>
                <textarea
                  value={cms.quoteOfTheDayEn || ''}
                  onChange={(e) => set('quoteOfTheDayEn', e.target.value)}
                  rows={2}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-medium outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">About Foundation Text</label>
                <textarea
                  value={cms.aboutTextEn || ''}
                  onChange={(e) => set('aboutTextEn', e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-medium outline-none"
                />
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: LIVE TV CHANNELS (VISUAL TABLE) */}
      {activeTab === 'tv' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-sm font-black text-slate-900">Live TV Channels Directory</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Add, edit or remove Live TV channels displayed in the app. No APK rebuild required.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { set('liveTvChannels', LIVE_TV_DEFAULTS); toast.success("Loaded default TV channels"); }}
                className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Load Defaults ({LIVE_TV_DEFAULTS.length})
              </button>
              <button
                type="button"
                onClick={() => { setModalType('tv'); resetModalInputs(); setShowAddModal(true); }}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#FF9933] to-[#D97706] px-4 py-2 text-xs font-black text-white shadow-sm"
              >
                <Plus className="h-4 w-4" /> Add TV Channel
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Channel Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Stream URL</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {channels.map((chan, index) => (
                  <tr key={chan.id || index} className="hover:bg-orange-50/30">
                    <td className="px-5 py-3 font-bold text-slate-900">{chan.name}</td>
                    <td className="px-4 py-3">
                      <span className="bg-orange-50 text-[#FF9933] text-[10px] font-black px-2 py-0.5 rounded-full border border-orange-100">
                        {chan.category || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 break-all max-w-xs">{chan.url}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteChannel(index)}
                        className="text-rose-600 hover:text-rose-800 font-bold text-xs p-1.5 rounded-xl hover:bg-rose-50"
                        title="Delete Channel"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INTERNET RADIO STATIONS (VISUAL TABLE) */}
      {radioTestUrl && activeTab === "radio" && <p role="status" className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">{radioTestStatus} <span className="block break-all opacity-70">{radioTestUrl}</span></p>}
      {activeTab === 'radio' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-sm font-black text-slate-900">Internet Radio Stations Directory</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Manage radio stations. Save changes to publish; test streams on Android before enabling.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { set('internetRadioStations', RADIO_DEFAULTS); toast.success("Loaded default Akashvani stations"); }}
                className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Load Defaults ({RADIO_DEFAULTS.length})
              </button>
              <button
                type="button"
                onClick={() => { setModalType('radio'); resetModalInputs(); setShowAddModal(true); }}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#FF9933] to-[#D97706] px-4 py-2 text-xs font-black text-white shadow-sm"
              >
                <Plus className="h-4 w-4" /> Add Radio Station
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Station Name</th>
                  <th className="px-4 py-3">Stream URL</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {radios.map((st, index) => (
                  <tr key={index} className="hover:bg-orange-50/30">
                    <td className="px-5 py-3 font-bold text-slate-900">{st.name}</td>
                    <td className="px-4 py-3 text-slate-500 break-all max-w-sm">{st.url}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => void testRadio(st.url)}
                        className="mr-2 rounded-lg bg-sky-50 px-2 py-1.5 text-xs font-bold text-sky-800" title="Check Stream">Check</button>
                      <button type="button" onClick={() => editRadio(index)}
                        className="mr-2 rounded-lg bg-emerald-50 p-2 text-emerald-800" title="Edit Station">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => toggleRadioStation(index)}
                        className={`mr-2 rounded-lg px-2 py-1 text-xs font-bold ${st.enabled === false ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-800'}`}>
                        {st.enabled === false ? 'Disabled' : 'Enabled'}
                      </button>
                      <button
                        onClick={() => deleteRadio(index)}
                        className="text-rose-600 hover:text-rose-800 font-bold text-xs p-1.5 rounded-xl hover:bg-rose-50"
                        title="Delete Station"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: FACT CHECK SOURCES (VISUAL TABLE) */}
      {activeTab === 'factcheck' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-sm font-black text-slate-900">Fact-Check Sources Directory</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Manage verified anti-fake-news checking portals (PIB, Vishvas News, BoomLive, AltNews).
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { set('factCheckSources', FACT_CHECK_DEFAULTS); toast.success("Loaded default Fact Check sources"); }}
                className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Load Defaults ({FACT_CHECK_DEFAULTS.length})
              </button>
              <button
                type="button"
                onClick={() => { setModalType('factcheck'); resetModalInputs(); setShowAddModal(true); }}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#FF9933] to-[#D97706] px-4 py-2 text-xs font-black text-white shadow-sm"
              >
                <Plus className="h-4 w-4" /> Add Source
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {factChecks.map((fc: any, index: number) => (
              <div key={index} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900">{fc.name}</h4>
                    <button
                      onClick={() => deleteFactCheck(index)}
                      className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-xl"
                      title="Delete Source"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-2">{fc.description}</p>
                </div>
                <a
                  href={fc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF9933] hover:underline pt-2 border-t border-slate-100"
                >
                  <ExternalLink className="h-3 w-3" /> {fc.url}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD ITEM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FF9933]">System Config</span>
                <h3 className="text-base font-black text-slate-900">
                  {modalType === 'tv' ? 'Add Live TV Channel' : modalType === 'radio' ? 'Add Internet Radio Station' : 'Add Fact-Check Source'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Name *</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Name / Channel Title"
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs font-bold outline-none"
                />
              </div>

              {modalType === 'tv' && (
                <div>
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <input
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    placeholder="News, Sports, Entertainment..."
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs font-bold outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700">Target Stream / Website URL *</label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs font-medium outline-none"
                />
              </div>

              {modalType === 'factcheck' && (
                <div>
                  <label className="text-xs font-bold text-slate-700">Description</label>
                  <textarea
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    rows={2}
                    placeholder="Short description of this fact-check portal..."
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-medium outline-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={modalType === 'tv' ? addChannel : modalType === 'radio' ? addRadio : addFactCheck}
                  className="rounded-2xl bg-gradient-to-r from-[#FF9933] to-[#D97706] px-6 py-2.5 text-xs font-black text-white shadow-md active:scale-95 transition"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
