import React, { useEffect, useState } from 'react';
import { Instagram, Play, Sparkles, Heart, Eye, ChevronRight } from 'lucide-react';
import { openExternalLink } from '../utils/browser';
import { useNavigate } from 'react-router-dom';
import ReelsVerticalViewer, { ReelItem } from './ReelsVerticalViewer';

interface InstagramApiFeedProps {
  sourceUrl?: string;
}

const FEATURED_IMPACT_REELS: ReelItem[] = [
  {
    id: "reel-1",
    url: "https://www.instagram.com/rpfoundationofficial/",
    thumbnailUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80",
    title: "Rojgar Mela Employment Drive",
    caption: "Shri Rohit Pandit Ji inaugurating the mega employment fair connecting 1000+ youth with jobs.",
    likes: "2.4k",
    author: "Shri Rohit Pandit Ji"
  },
  {
    id: "reel-2",
    url: "https://www.instagram.com/rpfoundationofficial/",
    thumbnailUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
    title: "Free Health Checkup & Medicine Distribution",
    caption: "RP Foundation free medical camp providing consultations, diagnostics & medicine to 500+ families.",
    likes: "1.8k",
    author: "RP Foundation Health Cell"
  },
  {
    id: "reel-3",
    url: "https://www.instagram.com/rpfoundationofficial/",
    thumbnailUrl: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=600&auto=format&fit=crop&q=80",
    title: "Pink E-Rickshaw Women Empowerment",
    caption: "Empowering women with sustainable green mobility and independent livelihood opportunities.",
    likes: "3.1k",
    author: "Women Welfare Division"
  },
  {
    id: "reel-4",
    url: "https://www.instagram.com/rpfoundationofficial/",
    thumbnailUrl: "https://images.unsplash.com/photo-1517649763962-0c623266200a?w=600&auto=format&fit=crop&q=80",
    title: "Youth Sports Championship & Award Ceremony",
    caption: "Fostering athletic talent and supporting local sports tournaments across Sansad Kshetra.",
    likes: "1.5k",
    author: "Youth & Sports Cell"
  },
  {
    id: "reel-5",
    url: "https://www.instagram.com/rpfoundationofficial/",
    thumbnailUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&auto=format&fit=crop&q=80",
    title: "Jan Seva Card Digital Launch",
    caption: "Connecting citizens to direct digital benefits, emergency healthcare & foundation support.",
    likes: "4.2k",
    author: "Digital Governance Cell"
  },
  {
    id: "reel-6",
    url: "https://www.instagram.com/rpfoundationofficial/",
    thumbnailUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80",
    title: "Community Relief & Public Grievance Resolution",
    caption: "Ground updates on grievance resolutions, relief distribution and constituency outreach.",
    likes: "2.9k",
    author: "RP Foundation Office"
  }
];

export default function InstagramApiFeed({ sourceUrl = "https://rpf-app-dusky.vercel.app/api/social?action=instagram" }: InstagramApiFeedProps) {
  const navigate = useNavigate();
  const [media, setMedia] = useState<ReelItem[]>(FEATURED_IMPACT_REELS);
  const [loading, setLoading] = useState(false);
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4 font-sans">
      {/* Horizontal Swipeable Reel Showcase */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
        {media.map((item, idx) => (
          <div
            key={item.id || idx}
            onClick={() => setActiveReelIndex(idx)}
            className="group relative h-64 w-44 shrink-0 cursor-pointer overflow-hidden rounded-3xl bg-slate-900 border border-slate-200 shadow-sm snap-start active:scale-95 transition-all hover:shadow-xl hover:border-[#FF9933]"
          >
            {/* Real Media Background */}
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent" />

            {/* Top Reel Badge */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-md px-2 py-0.5 text-[8px] font-black text-white uppercase tracking-wider border border-white/20">
                <Play className="h-2 w-2 fill-white" /> Reel
              </span>
              <span className="flex items-center gap-1 text-[9px] font-bold text-white/90 bg-black/30 backdrop-blur-md px-1.5 py-0.5 rounded-full">
                <Heart className="h-2.5 w-2.5 text-rose-400 fill-rose-400" /> {item.likes}
              </span>
            </div>

            {/* Play Circle Icon */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white border border-white/40 group-hover:scale-110 transition-transform">
                <Play className="h-5 w-5 fill-white ml-0.5" />
              </div>
            </div>

            {/* Bottom Caption Overlay */}
            <div className="absolute bottom-3 inset-x-3 z-10 space-y-1 text-left">
              <p className="text-[11px] font-black text-white font-serif leading-snug line-clamp-1">
                {item.title}
              </p>
              <p className="text-[9.5px] font-medium text-slate-300 line-clamp-2 leading-tight">
                {item.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Official Handle Banner */}
      <div className="flex items-center justify-between rounded-2xl bg-orange-50/60 border border-orange-100 px-4 py-2.5">
        <a
          href="https://www.instagram.com/rpfoundationofficial/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs font-black text-[#FF9933] hover:underline"
        >
          <Instagram className="h-4 w-4" />
          @rpfoundationofficial
        </a>
        <button
          onClick={() => setActiveReelIndex(0)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#000080] hover:underline"
        >
          Tap to Swipe Reels <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Full Screen Vertical Reels Swipe Viewer Modal */}
      {activeReelIndex !== null && (
        <ReelsVerticalViewer
          reels={media}
          initialIndex={activeReelIndex}
          onClose={() => setActiveReelIndex(null)}
        />
      )}
    </div>
  );
}
