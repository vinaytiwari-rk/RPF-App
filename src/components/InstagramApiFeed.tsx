import React from 'react';
import { Instagram, ExternalLink } from 'lucide-react';
import { openExternalLink } from '../utils/browser';
import { useNavigate } from 'react-router-dom';

const OFFICIAL_INSTAGRAM_URL = 'https://www.instagram.com/rpfoundationofficial/';

export default function InstagramApiFeed() {
  const navigate = useNavigate();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white">
          <Instagram className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-900">RP Foundation on Instagram</h3>
          <p className="mt-1 text-sm text-slate-600">
            Follow official updates and reels from RP Foundation.
          </p>
          <button
            type="button"
            onClick={() => openExternalLink(OFFICIAL_INSTAGRAM_URL, navigate, 'RP Foundation Instagram')}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Open Official Instagram
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
        Live reels will appear here only after a verified dynamic source is configured. No demo reels or fabricated engagement data are shown.
      </p>
    </section>
  );
}
