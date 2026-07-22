// src/pages/Community.tsx
// ──────────────────────────────────────────────────────────────────────────────
//  DYNAMIC COMMUNITY FEED
//  • Zero hardcoded dummy posts — all data from Firestore community_posts.
//  • "Rahul Sharma" and all static sample arrays permanently removed.
//  • onSnapshot real-time listener keeps feed live.
//  • Post creation uses the logged-in user's real name & phone.
//  • Giving tab shows real donation campaigns from `campaigns` collection.
// ──────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Heart,
  HandHelping,
  MapPin,
  MessageSquare,
  Plus,
  Send,
  X,
  ThumbsUp,
  Loader2,
  ImagePlus,
  MessageCircle,
  Share2,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Play,
  Globe
} from "lucide-react";
import axios from 'axios';
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

/* ═══════════════════════════════════════════════════════════════
   Types
═══════════════════════════════════════════════════════════════ */
interface CommunityPost {
  id: string;
  authorName: string;
  authorPhone?: string;
  authorRole?: string;
  textEn: string;
  textHi?: string;
  segment: "sewa" | "giving";
  location?: string;
  imageUrl?: string;
  likes: number;
  likedByMe?: boolean;
  createdAt?: any;
}

interface Campaign {
  id: string;
  titleEn: string;
  titleHi: string;
  raisedAmount: number;
  goalAmount: number;
  imageUrl?: string;
  urgent?: boolean;
}

/* ═══════════════════════════════════════════════════════════════
   Helpers
═══════════════════════════════════════════════════════════════ */
function timeAgo(ts: any): string {
  if (!ts) return "Just now";
  const date: Date =
    typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

/* ═══════════════════════════════════════════════════════════════
   Component
═══════════════════════════════════════════════════════════════ */
export default function Community() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user } = useAuth();
  const isHi = lang === "hi";

  const { socialPosts, likePost, settings, cmsConfig } = useApp();

  /* ── State ── */
  const [segment, setSegment] = useState<"sewa" | "giving" | "official">("sewa");
  const [activePlatform, setActivePlatform] = useState<"instagram" | "x" | "youtube" | "facebook">("instagram");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  /* ── Create post modal ── */
  const [showModal, setShowModal] = useState(false);
  const [postText, setPostText] = useState("");
  const [postLocation, setPostLocation] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  /* ─────────────────────────────────────
     Firestore — community_posts listener
  ───────────────────────────────────── */
  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/community_posts');
      const data = response.data.data;
      const error = null;
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error("community_posts fetch:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get('/api/campaigns');
      const data = response.data.campaigns || response.data.data;
      const error = null;
      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      console.error("campaigns fetch:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCampaigns();
    const interval = setInterval(() => {
      fetchPosts();
      fetchCampaigns();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  /* ─────────────────────────────────────
     Submit new post
  ───────────────────────────────────── */
  const submitPost = async () => {
    if (!postText.trim()) return;
    setIsPosting(true);
    try {
      await axios.post('/api/community_posts', {
          authorName: user?.displayName ?? user?.name ?? "Anonymous Citizen",
          authorPhone: user?.phone ?? "",
          authorRole: user?.role ?? "citizen",
          textEn: postText.trim(),
          textHi: postText.trim(),
          segment,
          location: postLocation.trim() || "Bhopal, MP",
          imageUrl: uploadedImageUrl,
          likes: 0,
          likedByMe: false,
          createdAt: new Date().toISOString()
        }); const error = null;
      if (error) throw error;
      setPostText("");
      setPostLocation("");
      setUploadedImageUrl("");
      setShowModal(false);
      fetchPosts();
    } catch (err) {
      console.error("Post creation error:", err);
    } finally {
      setIsPosting(false);
    }
  };

  /* ─────────────────────────────────────
     Like toggle
  ───────────────────────────────────── */
  const toggleLike = async (post: CommunityPost) => {
    if (!user) return;
    try {
      const nextLiked = !post.likedByMe;
      const nextLikes = post.likes + (post.likedByMe ? -1 : 1);
      
      // Update local state first for instant response
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likedByMe: nextLiked, likes: nextLikes } : p));
      
      await axios.put('/api/community_posts/' + post.id, { likes: nextLikes,
          likedByMe: nextLiked }); const error = null;
      if (error) throw error;
    } catch (err) {
      console.error("Like error:", err);
      // Revert local state on error
      fetchPosts();
    }
  };

  /* ─────────────────────────────────────
     Filter posts by segment
  ───────────────────────────────────── */
  const segmentPosts = posts.filter((p) => p.segment === segment);

  /* ═══════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="p-5 space-y-4 flex-1 flex flex-col animate-fadeIn pb-24 h-full relative">

      {/* ── Mandala backdrop ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] h-[340px] opacity-[0.03] pointer-events-none z-0">
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#D4AF37]" fill="currentColor">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M50 5l2 15 15-15-5 25 15-5-25 5 15 15-25-2 5 25-15-15-5 15-15-15-5 15-5-25-25 2 15-15-25-5 15-5-15-25 15 15z" />
        </svg>
      </div>

      {/* ── Header ── */}
      <div className="space-y-3 shrink-0 relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-display font-extrabold text-base text-slate-900">
              {isHi ? "सेवा संगम एवं सहयोग मंच" : "Sewa Sangam & Social Hub"}
            </h3>
            <p className="text-xs text-slate-500">
              {isHi
                ? "परस्पर सहायता — जनभागीदारी मंच"
                : "Peer-to-peer mutual aid & crowdfunding"}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 bg-[#000080] text-white text-[10px] font-bold px-3 py-2 rounded-xl shadow-md hover:bg-indigo-900 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            {isHi ? "पोस्ट करें" : "Post"}
          </button>
        </div>

        {/* Segment toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          {(["sewa", "giving", "official"] as const).map((seg) => (
            <button
              key={seg}
              onClick={() => setSegment(seg)}
              className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all duration-200 ${
                segment === seg
                  ? "bg-white text-[#000080] shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {seg === "sewa"
                ? (isHi ? "सहायता (Sewa)" : "P2P Help")
                : seg === "giving"
                ? (isHi ? "अभियान (Giving)" : "Social Giving")
                : (isHi ? "आधिकारिक (Official)" : "Official Updates")}
            </button>
          ))}
        </div>
      </div>

      {/* ── Feed ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20 relative z-10 space-y-3">

        {/* Loading spinner */}
        {loadingPosts && (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loadingPosts && segment === "sewa" && segmentPosts.length === 0 && (
          <div className="text-center py-10 space-y-2">
            <HandHelping className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-400">
              {isHi ? "अभी कोई पोस्ट नहीं। पहले आप पोस्ट करें!" : "No posts yet. Be the first to post!"}
            </p>
          </div>
        )}

        {/* SEWA posts from Firestore */}
        {segment === "sewa" &&
          segmentPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex justify-between items-start">
                <p className="font-bold text-slate-800 text-xs leading-snug flex-1 pr-2">
                  {isHi && post.textHi ? post.textHi : post.textEn}
                </p>
                <span className="text-[9px] text-slate-400 shrink-0">
                  {timeAgo(post.createdAt)}
                </span>
              </div>

              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="post"
                  className="w-full h-28 object-cover rounded-xl"
                />
              )}

              <div className="flex justify-between items-end border-t border-slate-50 pt-2">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-800 block">
                    {post.authorName}
                  </span>
                  <div className="flex items-center gap-1 text-[9px] text-slate-400">
                    <MapPin className="w-2.5 h-2.5" />
                    <span>{post.location ?? "Bhopal"}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleLike(post)}
                    className={`flex items-center gap-1 text-[9px] font-bold px-2.5 py-1.5 rounded-lg border transition ${
                      post.likedByMe
                        ? "bg-[#FF9933] text-white border-[#FF9933]"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    {post.likes ?? 0}
                  </button>
                  <button className="flex items-center gap-1 text-[9px] font-bold text-[#000080] bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition">
                    <MessageSquare className="w-3 h-3" />
                    {isHi ? "सहायता" : "Help"}
                  </button>
                </div>
              </div>
            </div>
          ))}

        {/* GIVING — real campaigns from Firestore */}
        {segment === "giving" && (
          <div className="space-y-4 animate-fadeIn">
            {campaigns.length === 0 && !loadingPosts && (
              <div className="text-center py-10 text-slate-400 text-sm">
                {isHi ? "अभी कोई अभियान नहीं है।" : "No active campaigns yet."}
              </div>
            )}
            {campaigns.map((camp) => {
              const pct = Math.min(
                100,
                Math.round((camp.raisedAmount / camp.goalAmount) * 100)
              );
              return (
                <div key={camp.id} className="rounded-2xl overflow-hidden shadow-md border border-slate-200">
                  {camp.imageUrl ? (
                    <img
                      src={camp.imageUrl}
                      alt={camp.titleEn}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-slate-800 flex items-center justify-center">
                      <Heart className="w-10 h-10 text-white/20" />
                    </div>
                  )}

                  <div className="p-4 bg-white space-y-2">
                    {camp.urgent && (
                      <span className="bg-red-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                        {isHi ? "अति आवश्यक" : "Urgent"}
                      </span>
                    )}
                    <h4 className="font-display font-extrabold text-slate-900 text-sm">
                      {isHi ? camp.titleHi : camp.titleEn}
                    </h4>
                    <div className="space-y-1">
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FF9933] rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                        <span>₹{camp.raisedAmount.toLocaleString("en-IN")} raised</span>
                        <span>Goal: ₹{camp.goalAmount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                    <button className="w-full bg-[#000080] text-white font-black py-3 rounded-xl text-xs flex justify-center items-center gap-2 hover:bg-indigo-900 transition uppercase tracking-wider">
                      <Heart className="w-4 h-4 text-[#FF9933] fill-[#FF9933]" />
                      {isHi ? "अभी सहयोग करें" : "Donate Now"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* OFFICIAL — official social posts from useApp() */}
        {segment === "official" && (
          <div className="space-y-5 animate-fadeIn">
            {/* Official Accounts Directory */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <span className="w-1.5 h-3.5 bg-[#000080] rounded-xs"></span>
                {isHi ? "आधिकारिक सोशल मीडिया चैनल्स" : "Official Social Media Channels"}
              </h4>

              {/* 5 Grid Cards for RP Foundation accounts */}
              <div className="grid grid-cols-1 gap-2.5">
                {((cmsConfig?.socialDirectory && cmsConfig.socialDirectory.length > 0)
                  ? cmsConfig.socialDirectory
                  : [
                      {
                        name: "RP Foundation (Official)",
                        platform: "instagram",
                        handle: "@rpfoundationofficial",
                        url: settings?.foundation_instagram || "https://www.instagram.com/rpfoundationofficial/",
                        descEn: "Latest photos, videos & daily campaign highlights.",
                        descHi: "नवीनतम फोटो, वीडियो & दैनिक अभियान की झलकियाँ।"
                      },
                      {
                        name: "Rohit Pandit (Founder)",
                        platform: "instagram",
                        handle: "@therohitpandit",
                        url: settings?.founder_instagram || "https://www.instagram.com/therohitpandit/",
                        descEn: "Founder Rohit Pandit's personal social updates.",
                        descHi: "संस्थापक रोहित पंडित का व्यक्तिगत जनसेवा ब्लॉग।"
                      },
                      {
                        name: "RP Foundation Facebook",
                        platform: "facebook",
                        handle: "@rpfofficial",
                        url: settings?.facebook || "https://www.facebook.com/rpfofficial",
                        descEn: "Facebook community feeds and welfare program updates.",
                        descHi: "फेसबुक समुदाय और जन कल्याणकारी कार्यक्रमों की जानकारी।"
                      },
                      {
                        name: "RP Foundation on X",
                        platform: "x",
                        handle: "@rpfoundation15",
                        url: settings?.twitter || "https://x.com/rpfoundation15",
                        descEn: "Real-time updates, announcements & relief requests.",
                        descHi: "महत्वपूर्ण घोषणाएं और त्वरित राहत अलर्ट ट्विटर पर।"
                      },
                      {
                        name: "RP Foundation YouTube",
                        platform: "youtube",
                        handle: "RP Foundation Official",
                        url: settings?.youtube || "https://www.youtube.com/@rpfoundationofficial",
                        descEn: "Public awareness tutorials & campaign video reports.",
                        descHi: "जन जागरूकता ट्यूटोरियल और अभियान की वीडियो रिपोर्ट्स।"
                      }
                    ]
                ).map((item, idx) => {
                  const getPlatformIcon = (platform: string) => {
                    switch (platform.toLowerCase()) {
                      case "instagram": return Instagram;
                      case "facebook": return Facebook;
                      case "x": return Twitter;
                      case "youtube": return Youtube;
                      default: return Globe;
                    }
                  };
                  const getPlatformColor = (platform: string) => {
                    switch (platform.toLowerCase()) {
                      case "instagram": return "text-pink-650 bg-pink-50 border-pink-100";
                      case "facebook": return "text-blue-650 bg-blue-50 border-blue-100";
                      case "x": return "text-slate-850 bg-slate-50 border-slate-150";
                      case "youtube": return "text-red-650 bg-red-50 border-red-100";
                      default: return "text-indigo-650 bg-indigo-50 border-indigo-100";
                    }
                  };
                  const Icon = getPlatformIcon(item.platform);
                  const color = getPlatformColor(item.platform);
                  const descText = isHi ? item.descHi : item.descEn;

                  return (
                    <a
                      key={idx}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 border border-slate-200/80 hover:border-slate-350 bg-white p-3 rounded-2xl shadow-xs hover:shadow-md transition group text-left cursor-pointer"
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${color} shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                           <h5 className="text-xs font-black text-slate-800 leading-none">{item.name}</h5>
                           <span className="text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md leading-none bg-blue-50 text-blue-650">Official</span>
                        </div>
                        <p className="text-[9px] font-black text-[#FF9933] mt-1">{item.handle}</p>
                        <p className="text-[9px] text-slate-500 font-semibold mt-1 leading-snug line-clamp-1">{descText}</p>
                      </div>
                      <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#000080] shrink-0 transform group-hover:translate-x-0.5 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Custom updates uploaded by Admin */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-650 uppercase tracking-wider text-left pl-1">
                {isHi ? "ताज़ा अपडेट्स और सफलता की कहानियां" : "Recent Updates & Success Stories"}
              </h4>
              {socialPosts.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-450 text-xs font-semibold">
                  {isHi ? "अभी तक कोई आधिकारिक पोस्ट अपलोड नहीं किया गया है।" : "No official updates uploaded yet."}
                </div>
              ) : (
                socialPosts.map((post) => (
                  <div 
                    key={post.id}
                    onClick={() => post.link && window.open(post.link, "_blank")}
                    className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-350 hover:shadow-md transition-all duration-200 cursor-pointer text-left"
                    title={isHi ? "मूल पोस्ट देखने के लिए क्लिक करें" : "Click to view original post"}
                  >
                    {/* Author Info */}
                    <div className="p-3.5 flex items-center gap-3 border-b border-slate-100 bg-slate-50/50">
                      <img 
                        src={post.avatar || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80"} 
                        alt={post.author} 
                        className="w-9 h-9 rounded-full object-cover border border-[#D4AF37]/30 shadow-xs" 
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-black text-slate-800 leading-none">{post.author}</h4>
                          {post.platform && (
                            <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md leading-none ${
                              post.platform === "instagram" ? "bg-pink-100 text-pink-700" :
                              post.platform === "facebook" ? "bg-blue-100 text-blue-700" :
                              post.platform === "youtube" ? "bg-red-100 text-red-700" :
                              "bg-slate-900 text-white"
                            }`}>
                              {post.platform}
                            </span>
                          )}
                        </div>
                        <span className="text-[8.5px] font-bold text-[#FF9933] uppercase tracking-wider block mt-1">{post.role}</span>
                      </div>
                      <span className="text-[9px] font-semibold text-slate-400">{post.time || "Recently"}</span>
                    </div>

                    {/* Body Text */}
                    <div className="px-4 py-3 text-xs text-slate-700 leading-relaxed font-semibold">
                      <p>{isHi ? post.textHi : post.textEn}</p>
                    </div>

                    {/* Photo Post */}
                    {post.image && (
                      <div className="relative h-48 bg-slate-100 overflow-hidden">
                        <img 
                          src={post.image} 
                          alt="Official update" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div 
                      className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-650 bg-slate-50/10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button 
                        onClick={() => likePost(post.id)}
                        className={`flex items-center gap-1.5 transition active:scale-90 cursor-pointer ${
                          post.liked ? "text-red-650" : "hover:text-slate-900"
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${post.liked ? "fill-red-500 text-red-650" : ""}`} />
                        <span>{post.likes}</span>
                      </button>
                      
                      <div className="flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.commentsCount}</span>
                      </div>

                      <button 
                        onClick={() => {
                          if (post.link) {
                            navigator.clipboard.writeText(post.link);
                            alert(isHi ? "लिंक कॉपी हो गया!" : "Link copied!");
                          } else {
                            alert(isHi ? "कोई लिंक उपलब्ध नहीं है।" : "No link available.");
                          }
                        }}
                        className="flex items-center gap-1 hover:text-slate-900 transition cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CREATE POST MODAL
      ═══════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 space-y-4 shadow-2xl animate-slideUp">
            {/* Modal header */}
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-base text-slate-900">
                {isHi ? "नई पोस्ट बनाएं" : "Create New Post"}
              </h4>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Author tag */}
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
              <div className="w-7 h-7 rounded-full bg-[#000080] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                {(user?.name ?? "?")[0].toUpperCase()}
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-800">
                  {user?.displayName ?? user?.name ?? "Anonymous"}
                </p>
                <p className="text-[8px] text-slate-500 capitalize">
                  {user?.role ?? "citizen"} • {isHi ? "जन सेवा" : "Jan Seva"}
                </p>
              </div>
            </div>

            {/* Segment picker inside modal */}
            <div className="flex gap-2">
              {(["sewa", "giving"] as const).map((seg) => (
                <button
                  key={seg}
                  onClick={() => setSegment(seg)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-xl border transition ${
                    segment === seg
                      ? "bg-[#000080] text-white border-[#000080]"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  {seg === "sewa"
                    ? isHi ? "सेवा अनुरोध" : "Help Request"
                    : isHi ? "सहयोग अभियान" : "Giving Drive"}
                </button>
              ))}
            </div>

            {/* Post text */}
            <textarea
              ref={textRef}
              className="w-full border border-slate-200 rounded-2xl p-3 text-xs resize-none h-24 focus:border-[#000080] outline-none"
              placeholder={
                isHi
                  ? "अपनी बात यहाँ लिखें... (हिंदी या अंग्रेजी)"
                  : "What do you need help with? Describe clearly..."
              }
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              maxLength={500}
            />

            {/* Location field */}
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={isHi ? "स्थान (वैकल्पिक)" : "Location (optional)"}
                className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-[#000080] outline-none"
                value={postLocation}
                onChange={(e) => setPostLocation(e.target.value)}
              />
            </div>

            {/* Attachment Upload Field */}
            <div className="space-y-1.5 bg-slate-50/50 p-2 rounded-xl border border-slate-200/60">
              <span className="text-[9px] font-black text-slate-500 uppercase block">Attached Photo / फोटो संलग्न करें</span>
              <div className="flex items-center gap-2">
                {uploadedImageUrl && (
                  <img src={uploadedImageUrl} alt="Attachment" className="w-9 h-9 rounded-lg object-cover" />
                )}
                <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-350 rounded-lg p-2 bg-white hover:bg-slate-50 cursor-pointer">
                  <span className="text-[9px] font-bold text-[#000080] flex items-center gap-1.5">
                    <ImagePlus className="w-3.5 h-3.5" />
                    {isUploading ? `Uploading ${uploadPct || 0}%` : (isHi ? "गैलरी से फोटो चुनें" : "Choose Photo")}
                  </span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    disabled={isUploading} 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploading(true);
                      setUploadPct(15);
                      try {
                        const formData = new FormData();
                        formData.append("file", file);
                        const response = await axios.post("/api/upload/image", formData, {
                          onUploadProgress: (progressEvent) => {
                            if (progressEvent.total) {
                              const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                              setUploadPct(pct);
                            }
                          }
                        });
                        
                        const data = response.data;
                        setUploadPct(100);
                        setUploadedImageUrl(data.url);
                      } catch (err) {
                        console.error("Upload failed:", err);
                        alert("Image upload failed.");
                      } finally {
                        setIsUploading(false);
                      }
                    }} 
                  />
                </label>
              </div>
            </div>

            {/* Char count */}
            <p className="text-[9px] text-slate-400 text-right">
              {postText.length}/500
            </p>

            {/* Submit */}
            <button
              onClick={submitPost}
              disabled={isPosting || !postText.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#000080] text-white font-bold rounded-xl text-sm shadow-lg hover:bg-indigo-900 transition disabled:opacity-50"
            >
              {isPosting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isPosting
                ? isHi ? "पोस्ट हो रही है..." : "Publishing…"
                : isHi ? "पोस्ट प्रकाशित करें" : "Publish Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
