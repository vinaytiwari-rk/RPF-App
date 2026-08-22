import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertTriangle, MessageCircle, Repeat2, Heart, Share } from 'lucide-react';

export default function TwitterTimelineView() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const [tweets, setTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!handle) return;
    
    const fetchTweets = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://rpf-app-dusky.vercel.app/api/social?action=twitter&username=${handle}`);
        const data = await res.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        if (data.data) {
          setTweets(data.data);
        } else {
          setTweets([]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load timeline");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTweets();
  }, [handle]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 shadow-sm">
        <button 
          onClick={() => navigate(-1)} 
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 active:scale-95 transition"
        >
          <ArrowLeft className="h-5 w-5 text-slate-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-slate-900 leading-tight">@{handle}</h1>
          <p className="text-[11px] font-medium text-slate-500">Official Updates</p>
        </div>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-slate-900"><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.96H5.078z"></path></g></svg>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto w-full max-w-lg space-y-4">
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <RefreshCw className="h-6 w-6 animate-spin mb-3" />
              <p className="text-sm">Loading tweets from X...</p>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
              <AlertTriangle className="mx-auto h-8 w-8 text-rose-500 mb-2" />
              <h3 className="text-sm font-bold text-rose-800">Connection Failed</h3>
              <p className="text-xs text-rose-600 mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && tweets.length === 0 && (
            <div className="text-center py-20 text-slate-500 text-sm">
              No recent tweets found for @{handle}
            </div>
          )}

          {!loading && !error && tweets.map((tweet) => (
            <div key={tweet.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-lg uppercase">
                  {handle?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm text-slate-900 truncate">{handle}</span>
                    <span className="text-xs text-slate-500">@{handle}</span>
                    <span className="text-xs text-slate-500 mx-1">·</span>
                    <span className="text-xs text-slate-500 hover:underline">
                      {new Date(tweet.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] text-slate-800 whitespace-pre-wrap leading-snug">
                    {tweet.text}
                  </p>
                  
                  {/* Mock Twitter Actions */}
                  <div className="mt-4 flex items-center justify-between text-slate-500 max-w-xs">
                    <button className="flex items-center gap-1.5 hover:text-sky-500 transition group"><div className="p-1.5 rounded-full group-hover:bg-sky-50"><MessageCircle className="h-4 w-4" /></div></button>
                    <button className="flex items-center gap-1.5 hover:text-emerald-500 transition group"><div className="p-1.5 rounded-full group-hover:bg-emerald-50"><Repeat2 className="h-4 w-4" /></div></button>
                    <button className="flex items-center gap-1.5 hover:text-rose-500 transition group"><div className="p-1.5 rounded-full group-hover:bg-rose-50"><Heart className="h-4 w-4" /></div></button>
                    <button className="flex items-center gap-1.5 hover:text-sky-500 transition group"><div className="p-1.5 rounded-full group-hover:bg-sky-50"><Share className="h-4 w-4" /></div></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
        </div>
      </div>
    </div>
  );
}
