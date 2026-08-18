import React from "react";
import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ArrowLeft, Play, Search, Tv } from "lucide-react";
import SortableList from "../components/SortableList";

type Channel = { id: string; name: string; url: string; videoId: string; category: string };

const CHANNELS: Channel[] = [
  { id: "channel-1", name: "DD News", url: "https://www.youtube.com/live/qD6GkaU2lD0", videoId: "qD6GkaU2lD0", category: "Live" },
  { id: "channel-2", name: "DD India", url: "https://www.youtube.com/live/9X37FfIrKio", videoId: "9X37FfIrKio", category: "Live" },
  { id: "channel-3", name: "NASA", url: "https://www.youtube.com/live/M3HKLzjvKPc", videoId: "M3HKLzjvKPc", category: "Live" },
  { id: "channel-4", name: "United Nation", url: "https://www.youtube.com/live/vYRfQo6JMxc", videoId: "vYRfQo6JMxc", category: "Live" },
  { id: "channel-5", name: "Sansad 1", url: "https://www.youtube.com/live/JO7CTaWAmGk", videoId: "JO7CTaWAmGk", category: "Live" },
  { id: "channel-6", name: "Sansad 2", url: "https://www.youtube.com/live/py0W3aPWNXY", videoId: "py0W3aPWNXY", category: "Live" },
  { id: "uploaded-1", name: "Swayam Prabha-Language and Literature; History, Culture & Philosophy", url: "https://www.youtube.com/live/gFHiva4w7zU", videoId: "gFHiva4w7zU", category: "Education" },
  { id: "uploaded-2", name: "Education and Home Science; Information, Communication and Management Studies", url: "https://www.youtube.com/live/dCnCJ4g96HA", videoId: "dCnCJ4g96HA", category: "Education" },
  { id: "uploaded-3", name: "Economics, Commerce and Finance", url: "https://www.youtube.com/live/-xHUL9Qtdqo", videoId: "-xHUL9Qtdqo", category: "Education" },
  { id: "uploaded-4", name: "Physical sciences, Mathematics, Physics, Chemistry", url: "https://www.youtube.com/live/xrBzYPH5xyY", videoId: "xrBzYPH5xyY", category: "Education" },
  { id: "uploaded-5", name: "Life Sciences, Botany, Zoology, Bio-Science", url: "https://www.youtube.com/live/AQn627K1WL0", videoId: "AQn627K1WL0", category: "Education" },
  { id: "uploaded-6", name: "Applied Sciences, Allied Physical and Chemical sciences and related subjects", url: "https://www.youtube.com/live/bboEr8Xsujg", videoId: "bboEr8Xsujg", category: "Education" },
  { id: "uploaded-7", name: "Social & Behavioural Sciences, Law, Legal Studies, Human Rights", url: "https://www.youtube.com/live/dVj9AMYKQj8", videoId: "dVj9AMYKQj8", category: "Education" },
  { id: "uploaded-8", name: "Technology and Innovation", url: "https://www.youtube.com/live/eI5jfKFwCyk", videoId: "eI5jfKFwCyk", category: "Education" },
  { id: "uploaded-9", name: "Indian and Foreign Languages", url: "https://www.youtube.com/live/xsnd2UeR8sE", videoId: "xsnd2UeR8sE", category: "Education" },
  { id: "uploaded-10", name: "Social Sciences and Humanities", url: "https://www.youtube.com/live/cMGdvs6Y42k", videoId: "cMGdvs6Y42k", category: "Education" },
  { id: "uploaded-11", name: "Basic and Applied Sciences", url: "https://www.youtube.com/live/YOKsWfGFBTo", videoId: "YOKsWfGFBTo", category: "Education" },
  { id: "uploaded-12", name: "Professional Education", url: "https://www.youtube.com/live/JvLnbpOdEWg", videoId: "JvLnbpOdEWg", category: "Education" },
  { id: "uploaded-13", name: "State Open Universities and Gyandarshan", url: "https://www.youtube.com/live/Ex9oWbx3oE8", videoId: "Ex9oWbx3oE8", category: "Education" },
  { id: "uploaded-14", name: "Capacity Building and Teacher Education", url: "https://www.youtube.com/live/HwerScCSY54", videoId: "HwerScCSY54", category: "Education" },
  { id: "uploaded-15", name: "Skill and Vocational Education", url: "https://www.youtube.com/live/mc87pn4MizM", videoId: "mc87pn4MizM", category: "Education" },
  { id: "uploaded-16", name: "Biotechnology and Biochemical Engineering", url: "https://www.youtube.com/live/QGbT-R5Yghk", videoId: "QGbT-R5Yghk", category: "Education" },
  { id: "uploaded-17", name: "Electronics and Communication Engineering", url: "https://www.youtube.com/live/K0nBC65e_Dc", videoId: "K0nBC65e_Dc", category: "Education" },
  { id: "uploaded-18", name: "Electrical Engineering", url: "https://www.youtube.com/live/m0hIkld8UsE", videoId: "m0hIkld8UsE", category: "Education" },
  { id: "uploaded-19", name: "Physics", url: "https://www.youtube.com/live/Yf7DJvAPaBs", videoId: "Yf7DJvAPaBs", category: "Education" },
  { id: "uploaded-20", name: "Textile Engineering", url: "https://www.youtube.com/live/PnYOgDdeWPI", videoId: "PnYOgDdeWPI", category: "Education" },
  { id: "uploaded-21", name: "Civil Engineering", url: "https://www.youtube.com/live/QcXp4RaOrRM", videoId: "QcXp4RaOrRM", category: "Education" },
  { id: "uploaded-22", name: "Aeronautical Engineering", url: "https://www.youtube.com/live/QWvODUxBDMQ", videoId: "QWvODUxBDMQ", category: "Education" },
  { id: "uploaded-23", name: "Humanities and Social Sciences", url: "https://www.youtube.com/live/zlO9Xt1qgno", videoId: "zlO9Xt1qgno", category: "Education" },
  { id: "uploaded-24", name: "Management, Law, Economics; Business Analytics, Communication, Cooperative Management", url: "https://www.youtube.com/live/FpwpJ-q6W0I", videoId: "FpwpJ-q6W0I", category: "Education" },
  { id: "uploaded-25", name: "Mechanical Engineering, Engineering Design, Manufacturing E & T and allied subjects", url: "https://www.youtube.com/live/PriApwtX0g0", videoId: "PriApwtX0g0", category: "Education" },
  { id: "uploaded-26", name: "Visual communications, Graphic design & Media technology", url: "https://www.youtube.com/live/1Pb9hz1TqGo", videoId: "1Pb9hz1TqGo", category: "Education" },
  { id: "uploaded-27", name: "Architecture and Interior Design", url: "https://www.youtube.com/live/mFSfDJJo6Mg", videoId: "mFSfDJJo6Mg", category: "Education" },
  { id: "uploaded-28", name: "Computer Sciences Engineering / IT & Related Branches", url: "https://www.youtube.com/live/mFSfDJJo6Mg", videoId: "mFSfDJJo6Mg", category: "Education" },
  { id: "uploaded-29", name: "Instrumentation Control, Biomedical and Engineering", url: "https://www.youtube.com/live/SgGWOXHeErM", videoId: "SgGWOXHeErM", category: "Education" },
  { id: "uploaded-30", name: "Bridge Courses and Impact Series", url: "https://www.youtube.com/live/oXCdp4PHIPE", videoId: "oXCdp4PHIPE", category: "Education" },
  { id: "uploaded-31", name: "Chemical Engineering, Nanotechnology, Environmental and Atmospheric Sciences", url: "https://www.youtube.com/live/6IkM4xJzDZQ", videoId: "6IkM4xJzDZQ", category: "Education" },
  { id: "uploaded-32", name: "Health Sciences", url: "https://www.youtube.com/live/_aelcmNSYBo", videoId: "_aelcmNSYBo", category: "Education" },
  { id: "uploaded-33", name: "Metallurgical and Material Science Engineering, Mining and Ocean Engineering", url: "https://www.youtube.com/live/ONnJq2xBZaQ", videoId: "ONnJq2xBZaQ", category: "Education" },
  { id: "uploaded-34", name: "Skills and Logistics (IT - Enabled Sector, Banking, Financial and Insurance sector Skills Logistics, Supply Chain Management and Transportation, Life skills)", url: "https://www.youtube.com/live/i-wCZD4lqbE", videoId: "i-wCZD4lqbE", category: "Education" },
  { id: "uploaded-35", name: "Chemistry, Biochemistry and Food Processing Engineering", url: "https://www.youtube.com/live/uFY8aWjAwLs", videoId: "uFY8aWjAwLs", category: "Education" },
  { id: "uploaded-36", name: "Mathematics", url: "https://www.youtube.com/live/VJYuwoSV910", videoId: "VJYuwoSV910", category: "Education" },
  { id: "uploaded-37", name: "Performing Arts:Classical Dances, Theatrical Arts & Painting", url: "https://www.youtube.com/live/GC8DcaZXShM", videoId: "GC8DcaZXShM", category: "Education" },
  { id: "uploaded-38", name: "Performing Arts: Indian Classical Music", url: "https://www.youtube.com/live/8JsyhcIoeuI", videoId: "8JsyhcIoeuI", category: "Education" },
  { id: "uploaded-39", name: "BBC Hindi", url: "https://www.youtube.com/live/Zvt1YGykp7U", videoId: "Zvt1YGykp7U", category: "News" },
  { id: "uploaded-40", name: "ANI", url: "https://www.youtube.com/live/mWx_W0QT9Ew", videoId: "mWx_W0QT9Ew", category: "News" },
  { id: "uploaded-41", name: "IANS", url: "https://www.youtube.com/live/NL60Fj7pwyo", videoId: "NL60Fj7pwyo", category: "News" },
  { id: "uploaded-42", name: "NDTV", url: "https://www.youtube.com/live/D0tkl7pib1M", videoId: "D0tkl7pib1M", category: "News" },
  { id: "uploaded-43", name: "Republic World", url: "https://www.youtube.com/live/yDbj24l2KDU", videoId: "yDbj24l2KDU", category: "News" },
  { id: "uploaded-44", name: "WION", url: "https://www.youtube.com/live/nM_fotGPv7A", videoId: "nM_fotGPv7A", category: "News" },
  { id: "uploaded-45", name: "Times Now", url: "https://www.youtube.com/live/JOe3Qsun7-Q", videoId: "JOe3Qsun7-Q", category: "News" },
  { id: "uploaded-46", name: "India Today", url: "https://www.youtube.com/live/n_42NG8DYr0", videoId: "n_42NG8DYr0", category: "News" },
  { id: "uploaded-47", name: "CNN News 18", url: "https://www.youtube.com/live/s1Xt-VpTxUI", videoId: "s1Xt-VpTxUI", category: "News" },
  { id: "uploaded-48", name: "Aajtak", url: "https://www.youtube.com/live/ZqqUl7edIoY", videoId: "ZqqUl7edIoY", category: "News" },
  { id: "uploaded-49", name: "ABP News", url: "https://www.youtube.com/live/luiOzlA3FtQ", videoId: "luiOzlA3FtQ", category: "News" },
  { id: "uploaded-50", name: "News 18 India", url: "https://www.youtube.com/live/LoOgsZT7CaQ", videoId: "LoOgsZT7CaQ", category: "News" },
  { id: "uploaded-51", name: "Times Now Hindi", url: "https://www.youtube.com/live/y0_DFBrg5MQ", videoId: "y0_DFBrg5MQ", category: "News" },
  { id: "uploaded-52", name: "Zee News", url: "https://www.youtube.com/live/TXT13ihA7Wk", videoId: "TXT13ihA7Wk", category: "News" },
  { id: "uploaded-53", name: "Republic Bharat", url: "https://www.youtube.com/live/mil4veH8x7E", videoId: "mil4veH8x7E", category: "News" },
  { id: "uploaded-54", name: "India TV", url: "https://www.youtube.com/live/A5L98KneBnQ", videoId: "A5L98KneBnQ", category: "News" },
  { id: "uploaded-55", name: "TV9 Bharatvarsh", url: "https://www.youtube.com/live/qwQEUg7ocXQ", videoId: "qwQEUg7ocXQ", category: "News" },
  { id: "uploaded-56", name: "NDTV India", url: "https://www.youtube.com/live/xTifOp8Vmj4", videoId: "xTifOp8Vmj4", category: "News" },
  { id: "uploaded-57", name: "News Nation", url: "https://www.youtube.com/live/cOOKOjGCqgQ", videoId: "cOOKOjGCqgQ", category: "News" },
  { id: "uploaded-58", name: "Good News Today", url: "https://www.youtube.com/live/48XByVquIy4", videoId: "48XByVquIy4", category: "News" },
];

export default function LiveTV() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const hi = lang === "hi";
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Channel | null>(null);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? CHANNELS.filter(c => `${c.name} ${c.category}`.toLowerCase().includes(q)) : CHANNELS;
  }, [search]);

  const renderChannel = (channel: Channel) => (
    <button type="button" onClick={() => setActive(channel)} className="w-full rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-sm active:scale-[.99]">
      <div className="flex items-center gap-3">
        <img loading="lazy" src={`https://i.ytimg.com/vi/${channel.videoId}/mqdefault.jpg`} alt="" className="h-16 w-24 shrink-0 rounded-xl object-cover bg-slate-100" />
        <div className="min-w-0 flex-1"><p className="text-sm font-black text-slate-800">{channel.name}</p><p className="mt-1 text-[11px] font-medium text-slate-500">{channel.category === "Live" ? "YouTube Live" : channel.category}</p></div>
        <Play className="h-5 w-5 shrink-0 text-red-600" />
      </div>
    </button>
  );

  if (active) {
    return <div className="min-h-full bg-black">
      <div className="sticky top-0 z-20 flex items-center gap-2 bg-black/85 px-3 py-2 text-white backdrop-blur-sm">
        <button type="button" onClick={() => setActive(null)} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white active:scale-95"><ArrowLeft className="h-5 w-5" /></button>
        <p className="truncate text-sm font-bold">{active.name}</p>
      </div>
      <div className="aspect-video w-full bg-black"><iframe className="h-full w-full border-0" src={`https://www.youtube-nocookie.com/embed/${active.videoId}?autoplay=1&playsinline=1&rel=0`} title={active.name} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
    </div>;
  }

  return <div className="min-h-full bg-slate-50 pb-10"><div className="mx-auto max-w-3xl space-y-4 px-3.5 py-5 sm:px-6">
    <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600"><Tv className="h-6 w-6" /></div><div><h1 className="text-lg font-black text-[#000080]">{hi ? "लाइव टीवी" : "Live TV"}</h1><p className="text-[11px] font-medium text-slate-500">{hi ? "लाइव समाचार और शैक्षणिक चैनल" : "Live news and educational channels"}</p></div></div>
    <div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={hi ? "चैनल खोजें..." : "Search channels..."} className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none" /></div>
    <SortableList items={filtered} storageKey="youtube-live-channels" renderItem={renderChannel} className="space-y-2" />
  </div></div>;
}
