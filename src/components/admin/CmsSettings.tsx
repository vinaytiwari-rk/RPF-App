import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import FileUpload from '../FileUpload';
import { CmsConfig } from '../../context/AppContext';
import { Save, User, Quote, FileText } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

export const CmsSettings = () => {
  const { token } = useAuth();
  const [cms, setCms] = useState<CmsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get('/api/cms').then((res) => {
      if (res.data.success) setCms(res.data.cms);
    }).catch(() => undefined).finally(() => setLoading(false));
  }, []);

  const set = (key: string, value: unknown) => setCms((current) => current ? { ...current, [key]: value } : current);

  const save = async () => {
    if (!cms) return;
    setSaving(true);
    try {
      await axios.post('/api/cms', cms, { headers: { Authorization: `Bearer ${token}` } });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !cms) return <div className="space-y-4"><Skeleton className="h-10" /><Skeleton className="h-[220px]" /></div>;

  return <div className="max-w-4xl space-y-5 pb-20">
    <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400">Content only</p><h2 className="mt-1 text-xl font-black">Foundation content</h2><p className="mt-1 text-xs text-slate-500">Only published CMS content belongs here. Impact numbers are read from real database records.</p></div><button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white disabled:opacity-50"><Save className="h-4 w-4"/>{saving ? 'Saving…' : 'Save changes'}</button></div>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="flex items-center gap-2 text-sm font-black"><FileText className="h-4 w-4"/> General information</h3><div className="mt-4 grid gap-4"><FileUpload label="Site logo" defaultUrl={cms.logoImgUrl || ''} onUploadSuccess={(url) => set('logoImgUrl', url)}/><div><label className="text-xs font-bold text-slate-600">About content</label><textarea value={cms.aboutTextEn || ''} onChange={(e) => set('aboutTextEn', e.target.value)} rows={4} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-950" placeholder="Publish the official foundation description."/></div></div></section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="flex items-center gap-2 text-sm font-black"><User className="h-4 w-4"/> Founder profile</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><input value={cms.founderName || ''} onChange={(e) => set('founderName', e.target.value)} placeholder="Founder name" className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-950"/><input value={cms.founderDesignation || ''} onChange={(e) => set('founderDesignation', e.target.value)} placeholder="Designation" className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-950"/><div className="sm:col-span-2"><FileUpload label="Founder image" defaultUrl={cms.founderImgUrl || ''} onUploadSuccess={(url) => set('founderImgUrl', url)}/></div></div></section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="flex items-center gap-2 text-sm font-black"><Quote className="h-4 w-4"/> Optional messaging</h3><div className="mt-4 grid gap-4"><textarea value={cms.quoteOfTheDayEn || ''} onChange={(e) => set('quoteOfTheDayEn', e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-950" placeholder="Publish an official quote only when one exists."/><textarea value={cms.impactBottomTextEn || ''} onChange={(e) => set('impactBottomTextEn', e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-950" placeholder="Optional official impact message."/></div></section>
  </div>;
};
