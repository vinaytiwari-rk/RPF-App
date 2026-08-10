import React, { useState, useEffect, useRef } from "react";
import { Heart, Share2, MessageCircle, X, ExternalLink } from "lucide-react";

interface ReelItem {
  id: string;
  title: string;
  content: string;
  authorName: string;
  imageUrl?: string;
  likes: number;
}

interface ReelsFeedProps {
  items: ReelItem[];
  onClose: () => void;
  lang: "hi" | "en";
}

export default function ReelsFeed({ items, onClose, lang }: ReelsFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const isHi = lang === "hi";

  const handleScroll = () => {
    if (containerRef.current) {
      const index = Math.round(containerRef.current.scrollTop / containerRef.current.clientHeight);
      if (index !== currentIndex) {
        setCurrentIndex(index);
      }
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <h2 className="text-white font-bold text-lg drop-shadow-md">
          {isHi ? "जन सेवा फीड" : "Jan Seva Feed"}
        </h2>
        <button onClick={onClose} className="p-2 bg-black/40 rounded-full text-white backdrop-blur-md">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Snap Scrolling Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto snap-y snap-mandatory hide-scrollbar relative"
        style={{ scrollBehavior: 'smooth' }}
      >
        {items.map((item, idx) => (
          <div key={item.id} className="h-full w-full snap-start relative bg-slate-900 flex items-center justify-center">
            {/* Background Image or Solid Color */}
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-60" />
            ) : (
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#000080]/90 to-black"></div>
            )}
            
            {/* Content Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-5 pb-16">
              <div className="flex justify-between items-end">
                <div className="flex-1 pr-12 text-white space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-white shadow-lg backdrop-blur-md">
                      {item.authorName.charAt(0)}
                    </div>
                    <span className="font-bold text-sm drop-shadow-md">@{item.authorName.replace(/\s+/g, '')}</span>
                  </div>
                  <h3 className="font-extrabold text-lg drop-shadow-lg leading-tight">{item.title}</h3>
                  <p className="text-sm text-slate-200 line-clamp-4 leading-snug drop-shadow-md">
                    {item.content}
                  </p>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-col items-center gap-6 pb-4">
                  <button className="flex flex-col items-center gap-1 group">
                    <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white group-hover:text-red-500 transition">
                      <Heart className="w-5 h-5" />
                    </div>
                    <span className="text-white text-xs font-bold">{item.likes + (idx * 3)}</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 group">
                    <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white transition">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <span className="text-white text-xs font-bold">12</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 group">
                    <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white transition">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <span className="text-white text-xs font-bold">Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
