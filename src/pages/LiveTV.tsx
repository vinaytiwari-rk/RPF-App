import React from "react";
import { useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Tv, Play, Search, Youtube } from "lucide-react";
import SortableList from "../components/SortableList";
import { openExternalLink } from "../utils/browser";

type Channel = { id: string; name: string; url: string; videoId?: string; category: string };

const CHANNELS: Channel[] = [
  { id: "yt-1", name: "Live Channel 01", url: "https://www.youtube.com/live/qD6GkaU2lD0", videoId: "qD6GkaU2lD0", category: "Live" },
  { id: "yt-2", name: "Live Channel 02", url: "https://www.youtube.com/live/9X37FfIrKio", videoId: "9X37FfIrKio", category: "Live" },
  { id: "yt-3", name: "Live Channel 03", url: "https://www.youtube.com/live/M3HKLzjvKPc", videoId: "M3HKLzjvKPc", category: "Live" },
  { id: "yt-4", name: "Live Channel 04", url: "https://www.youtube.com/live/vYRfQo6JMxc", videoId: "vYRfQo6JMxc", category: "Live" },
  { id: "empci-ignou", name: "EMPC IGNOU", url: "https://youtube.com/@empcignou", category: "Channel" },
  { id: "yt-5", name: "Live Channel 05", url: "https://www.youtube.com/live/JO7CTaWAmGk", videoId: "JO7CTaWAmGk", category: "Live" },
  { id: "yt-6", name: "Live Channel 06", url: "https://www.youtube.com/live/py0W3aPWNXY", videoId: "py0W3aPWNXY", category: "Live" },
  { id: "yt-7", name: "Live Channel 07", url: "https://www.youtube.com/live/Zvt1YGykp7U", videoId: "Zvt1YGykp7U", category: "Live" },
  { id: "yt-8", name: "Live Channel 08", url: "https://www.youtube.com/live/pQ03HQfZM2g", videoId: "pQ03HQfZM2g", category: "Live" },
  { id: "yt-9", name: "Live Channel 09", url: "https://www.youtube.com/live/Gupg41GJlpo", videoId: "Gupg41GJlpo", category: "Live" },
  { id: "yt-10", name: "Live Channel 10", url: "https://www.youtube.com/live/48XByVquIy4", videoId: "48XByVquIy4", category: "Live" },
  { id: "yt-11", name: "Live Channel 11", url: "https://www.youtube.com/live/IX0A1uMcDGw", videoId: "IX0A1uMcDGw", category: "Live" },
  { id: "yt-12", name: "Live Channel 12", url: "https://www.youtube.com/live/pYezVpR8ESs", videoId: "pYezVpR8ESs", category: "Live" },
  { id: "yt-13", name: "Live Channel 13", url: "https://www.youtube.com/live/Al_FduE8iEU", videoId: "Al_FduE8iEU", category: "Live" },
  { id: "yt-14", name: "Live Channel 14", url: "https://www.youtube.com/live/lof21k_6AHA", videoId: "lof21k_6AHA", category: "Live" },
  { id: "yt-15", name: "Live Channel 15", url: "https://www.youtube.com/live/cnLOKLjhvys", videoId: "cnLOKLjhvys", category: "Live" },
  { id: "yt-16", name: "Live Channel 16", url: "https://www.youtube.com/live/jpjjQgK78lM", videoId: "jpjjQgK78lM", category: "Live" },
  { id: "yt-17", name: "Live Channel 17", url: "https://www.youtube.com/live/BrfqgiM5-_U", videoId: "BrfqgiM5-_U", category: "Live" },
  { id: "yt-18", name: "Live Channel 18", url: "https://www.youtube.com/live/CFBLkYjfmdA", videoId: "CFBLkYjfmdA", category: "Live" },
  { id: "yt-19", name: "Live Channel 19", url: "https://www.youtube.com/live/qOhUjFvKhNc", videoId: "qOhUjFvKhNc", category: "Live" },
  { id: "yt-20", name: "Live Channel 20", url: "https://www.youtube.com/live/8xsfZc2ayPY", videoId: "8xsfZc2ayPY", category: "Live" },
  { id: "yt-21", name: "Live Channel 21", url: "https://www.youtube.com/live/gKVtGYbb3Uo", videoId: "gKVtGYbb3Uo", category: "Live" },
  { id: "yt-22", name: "Live Channel 22", url: "https://www.youtube.com/live/-C8XMkwaWVY", videoId: "-C8XMkwaWVY", category: "Live" },
  { id: "yt-23", name: "Live Channel 23", url: "https://www.youtube.com/live/mBfMzEgIFR4", videoId: "mBfMzEgIFR4", category: "Live" },
];

export default function LiveTV() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const hi = lang === "hi";
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? CHANNELS.filter(c => c.name.toLowerCase().includes(q)) : CHANNELS;
  }, [search]);

  const renderChannel = (channel: Channel) => (
    <button type="button" onClick={() => openExternalLink(channel.url, navigate)} className="w-full rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-sm active:scale-[.99]">
      <div className="flex items-center gap-3">
        {channel.videoId ? <img loading="lazy" src={`https://i.ytimg.com/vi/${channel.videoId}/mqdefault.jpg`} alt="" className="h-16 w-24 shrink-0 rounded-xl object-cover bg-slate-100" /> : <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600"><Youtube className="h-7 w-7" /></div>}
        <div className="min-w-0 flex-1"><p className="text-sm font-black text-slate-800">{channel.name}</p><p className="mt-1 text-[11px] font-medium text-slate-500">{channel.category === "Channel" ? "YouTube channel" : "YouTube Live"}</p></div>
        <Play className="h-5 w-5 shrink-0 text-red-600" />
      </div>
    </button>
  );

  return (
    <div className="min-h-full bg-slate-50 pb-10">
      <div className="mx-auto max-w-3xl space-y-4 px-3.5 py-5 sm:px-6">
        <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600"><Tv className="h-6 w-6" /></div><div><h1 className="text-lg font-black text-[#000080]">{hi ? "लाइव टीवी" : "Live TV"}</h1><p className="text-[11px] font-medium text-slate-500">{hi ? "आपके दिए YouTube Live channels" : "Your selected YouTube Live channels"}</p></div></div>
        <div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={hi ? "चैनल खोजें..." : "Search channels..."} className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none" /></div>
        <SortableList items={filtered} storageKey="youtube-live-channels" renderItem={renderChannel} className="space-y-2" />
      </div>
    </div>
  );
}
