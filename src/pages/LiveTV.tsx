import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Tv, Play, ExternalLink, ListVideo } from "lucide-react";
import SortableList from "../components/SortableList";
import { openExternalLink } from "../utils/browser";

type Channel = { id: string; name: string; category: string; description: string };

const CHANNELS: Channel[] = [
  { id: "dd-national", name: "DD National", category: "Doordarshan", description: "Official Doordarshan live channel" },
  { id: "dd-news", name: "DD News", category: "News", description: "Official public service news channel" },
  { id: "dd-india", name: "DD India", category: "News", description: "Official international news channel" },
  { id: "waves-catalogue", name: "More Live TV Channels", category: "All", description: "Browse the live channel catalogue on Waves PB" },
];

const WAVES_TV = "https://www.wavespb.com/tv-radio?type=channels&from=player";

export default function LiveTV() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const hi = lang === "hi";
  const navigate = useNavigate();

  const renderChannel = (channel: Channel) => {
    const open = () => {
      openExternalLink(WAVES_TV, navigate);
    };
    return (
      <button
        type="button"
        onClick={open}
        className="w-full rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition active:scale-[.99] hover:shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <Tv className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-slate-800">{channel.name}</p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">{channel.description}</p>
          </div>
          <Play className="h-5 w-5 shrink-0 text-red-600" />
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-full bg-[#f8f7f4] pb-10">
      <div className="mx-auto max-w-3xl space-y-4 px-3.5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Tv className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-[#000080]">{hi ? "लाइव टीवी" : "Live TV"}</h1>
            <p className="text-[11px] font-medium text-slate-500">{hi ? "लाइव टीवी चैनल और आधिकारिक स्ट्रीम" : "Live TV channels and official streams"}</p>
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-[#000080] to-[#001a55] p-5 text-white shadow-xl">
          <div className="flex items-start gap-3">
            <ListVideo className="mt-0.5 h-5 w-5 text-[#FF9933]" />
            <div className="flex-1">
              <p className="text-sm font-black">{hi ? "Waves PB Live TV" : "Waves PB Live TV"}</p>
              <p className="mt-1 text-[11px] leading-5 text-white/70">
                {hi ? "जहाँ चैनल की direct stream उपलब्ध होगी वहाँ उसे app में जोड़ा जाएगा। अभी official catalogue उपलब्ध है।" : "Where a direct stream is available, it can be added to the in-app player. The official catalogue is available now."}
              </p>
              <button type="button" onClick={() => openExternalLink(WAVES_TV, navigate)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FF9933] px-4 py-2 text-xs font-black text-white">
                <ExternalLink className="h-3.5 w-3.5" />
                {hi ? "सभी चैनल देखें" : "Browse all channels"}
              </button>
            </div>
          </div>
        </div>

        <SortableList items={CHANNELS} storageKey="live-tv-channels" renderItem={renderChannel} className="space-y-2" />
      </div>
    </div>
  );
}
