import React, { useEffect, useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { Sparkles, BookOpen, Plus, X, Send, Loader2, Calendar, User, MessageCircle, Activity, ChevronRight, AlertTriangle, Users, Target } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { io, Socket } from "socket.io-client";

interface SuccessStory {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt?: string;
  time?: string;
}

interface Volunteer {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  city?: string;
  area_locality?: string;
  skills?: string[] | string;
  availability?: string;
  constituency_allocation?: string;
}

type TabType = "impact" | "stories" | "volunteers" | "chat";

export default function Community() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user, token } = useAuth();
  const { announcements, globalSettings, cmsConfig } = useApp();
  const isHi = lang === "hi";

  const [activeTab, setActiveTab] = useState<TabType>("impact");
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [volunteerCityFilter, setVolunteerCityFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    beneficiaries: 0,
    volunteers: 0,
    healthCamps: 0,
    campaigns: 0
  });

  // Socket chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchSuccessStories = async () => {
    try {
      const res = await axios.get("/api/success-stories");
      if (res.data.success) {
        setStories(res.data.data || []);
      }
    } catch (err) {}
  };

  const fetchVolunteers = async (city?: string) => {
    try {
      const res = await axios.get("/api/public/volunteers", {
        params: city ? { city } : {},
      });
      if (res.data.success) {
        setVolunteers(res.data.data || []);
      }
    } catch (err) {}
  };

  const fetchChatHistory = async () => {
    try {
      const res = await axios.get("/api/community/chat/messages");
      if (res.data.success) {
        setChatMessages(res.data.data || []);
      }
    } catch (err) {}
  };

  const fetchStats = async () => {
    try {
      const statsRes = await fetch("/api/stats");
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats({
          beneficiaries: data.beneficiaries || 0,
          volunteers: data.volunteers || 0,
          healthCamps: data.healthCamps || 0,
          campaigns: data.campaigns || 0
        });
      }
    } catch (err) {}
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchSuccessStories(), fetchVolunteers(), fetchChatHistory(), fetchStats()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    if (!token) return;
    const socketURL = window.location.origin;
    socketRef.current = io(socketURL, { auth: { token } });

    socketRef.current.on("chat_message", (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socketRef.current.on("connect_error", (err) => {
      console.warn("Chat connection failed:", err.message);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token]);

  useEffect(() => {
    if (activeTab === "chat" && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab]);

  const sendChatMessage = () => {
    if (!chatInput.trim() || !user) return;
    socketRef.current?.emit("chat_message", {
      text: chatInput.trim(),
      authorAvatar: (user as any).avatar || null,
    });
    setChatInput("");
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(isHi ? "hi-IN" : "en-IN", {
        day: "numeric", month: "short", year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative animate-fadeIn min-h-screen pb-24">
      {/* ── Header ── */}
      <div className="pt-6 pb-3 space-y-4 shrink-0 relative z-10 bg-white shadow-sm border-b border-slate-100">
        <div className="px-4">
           <h3 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
             <Target className="w-6 h-6 text-[#000080]" />
             {isHi ? "प्रभाव और समुदाय" : "Impact"}
           </h3>
           <p className="text-sm text-slate-500 font-medium mt-1">
             {isHi ? "हमारे फाउंडेशन की सफलता और वॉलंटियर्स" : "Global stats, success stories, and our volunteers"}
           </p>
        </div>

        {/* Tab Selection pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-2">
          <button
            onClick={() => setActiveTab("impact")}
            className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-full transition-all duration-200 ${
              activeTab === "impact"
                ? "bg-[#000080] text-white shadow-md scale-100"
                : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-50 active:scale-95"
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${activeTab === "impact" ? "text-[#FF9933]" : "text-slate-400"}`} />
            {isHi ? "फ़ाउंडेशन प्रभाव" : "Foundation Impact"}
          </button>
          <button
            onClick={() => setActiveTab("stories")}
            className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-full transition-all duration-200 ${
              activeTab === "stories"
                ? "bg-[#000080] text-white shadow-md scale-100"
                : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-50 active:scale-95"
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeTab === "stories" ? "text-yellow-400" : "text-slate-400"}`} />
            {isHi ? "सफलता गाथा" : "Success Stories"}
          </button>
          <button
            onClick={() => setActiveTab("volunteers")}
            className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-full transition-all duration-200 ${
              activeTab === "volunteers"
                ? "bg-[#000080] text-white shadow-md scale-100"
                : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-50 active:scale-95"
            }`}
          >
            <Users className={`w-3.5 h-3.5 ${activeTab === "volunteers" ? "text-green-400" : "text-slate-400"}`} />
            {isHi ? "शीर्ष वॉलंटियर" : "Top Volunteers"}
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-full transition-all duration-200 ${
              activeTab === "chat"
                ? "bg-[#000080] text-white shadow-md scale-100"
                : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-50 active:scale-95"
            }`}
          >
            <MessageCircle className={`w-3.5 h-3.5 ${activeTab === "chat" ? "text-purple-300" : "text-slate-400"}`} />
            {isHi ? "लाइव चैट" : "Live Chat"}
          </button>
        </div>
      </div>

      {/* ── Content Feed ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 relative z-10">
        {loading && activeTab !== "chat" ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#000080] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* FOUNDATION IMPACT SECTION */}
            {activeTab === "impact" && (
              <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Stats */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 grid grid-cols-2 gap-4">
                  <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50 text-center flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-[#000080] block mb-1">
                      {stats.beneficiaries === 0 ? "0" : stats.beneficiaries >= 1000 ? `${(stats.beneficiaries / 1000).toFixed(1)}K+` : stats.beneficiaries}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {isHi ? "लाभार्थी" : "Beneficiaries"}
                    </span>
                  </div>
                  <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100/50 text-center flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-[#FF9933] block mb-1">
                      {stats.volunteers === 0 ? "0" : stats.volunteers >= 1000 ? `${(stats.volunteers / 1000).toFixed(1)}K+` : stats.volunteers}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {isHi ? "वॉलंटियर" : "Volunteers"}
                    </span>
                  </div>
                  <div className="bg-green-50/50 rounded-2xl p-4 border border-green-100/50 text-center flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-[#138808] block mb-1">
                      {stats.healthCamps === 0 ? "0" : stats.healthCamps >= 1000 ? `${(stats.healthCamps / 1000).toFixed(1)}K+` : stats.healthCamps}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {isHi ? "स्वास्थ्य शिविर" : "Health Camps"}
                    </span>
                  </div>
                  <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100/50 text-center flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-purple-600 block mb-1">
                      {stats.campaigns === 0 ? "0" : stats.campaigns >= 1000 ? `${(stats.campaigns / 1000).toFixed(1)}K+` : stats.campaigns}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {isHi ? "अभियान" : "Campaigns"}
                    </span>
                  </div>
                </div>

                {/* Announcements */}
                {(globalSettings?.show_notices !== false && announcements && announcements.length > 0) && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="bg-[#000080]/5 px-5 py-4 flex items-center justify-between border-b border-[#000080]/10">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-[#000080]" /> 
                        <h3 className="font-extrabold text-[#000080] text-sm tracking-wide">
                          {isHi ? "समुदाय अपडेट" : "Community Updates"}
                        </h3>
                      </div>
                    </div>
                    <div className="p-5 space-y-5 max-h-[300px] overflow-y-auto">
                      {announcements.map((ann: any, i: number) => (
                        <div key={i} className="flex gap-4 items-start group">
                          <div className="w-2 h-2 rounded-full bg-[#FF9933] mt-1.5 shrink-0 group-hover:scale-150 transition-transform" />
                          <div>
                            <h4 className="font-bold text-slate-800 text-[13px] mb-1.5">{ann.title}</h4>
                            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{ann.content}</p>
                            {ann.link_url && (
                              <a href={ann.link_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#000080] font-bold mt-2 inline-flex items-center hover:underline uppercase tracking-wide">
                                {isHi ? "अधिक पढ़ें" : "Read More"} <ChevronRight className="w-3 h-3 ml-0.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUCCESS STORIES SECTION */}
            {activeTab === "stories" && (
              <div className="space-y-5 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {stories.length === 0 ? (
                  <div className="text-center py-16 bg-white shadow-sm border border-slate-100 rounded-2xl space-y-3">
                     <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-2 border border-slate-100">
                       <Sparkles className="w-7 h-7 text-slate-300" />
                     </div>
                    <p className="text-sm font-bold text-slate-700">
                      {isHi ? "जल्द ही और कहानियाँ आ रही हैं!" : "Check back soon!"}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {isHi ? "अभी कोई सफलता गाथा उपलब्ध नहीं है।" : "No success stories posted yet."}
                    </p>
                  </div>
                ) : (
                  stories.map((story) => (
                    <div key={story.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col group">
                      {story.imageUrl && (
                        <div className="relative h-56 bg-slate-100 overflow-hidden">
                          <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-[9px] font-bold text-white uppercase tracking-widest bg-black/30 backdrop-blur-md px-2 py-1 rounded-full">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(story.createdAt)}</span>
                          </div>
                        </div>
                      )}
                      <div className="p-5 space-y-3 relative">
                        {!story.imageUrl && (
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(story.createdAt)}</span>
                          </div>
                        )}
                        <h4 className="font-extrabold text-slate-900 text-[15px] leading-tight">{story.title}</h4>
                        <p className="text-[12px] text-slate-600 leading-relaxed whitespace-pre-line font-medium">{story.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* VOLUNTEER NETWORK SECTION */}
            {activeTab === "volunteers" && (
              <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <p className="text-[10px] font-extrabold text-[#000080] mb-3 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#FF9933]" />
                    {isHi
                      ? "शहर के नाम से वॉलंटियर खोजें"
                      : "Search Top Volunteers"}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={volunteerCityFilter}
                      onChange={(e) => setVolunteerCityFilter(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && fetchVolunteers(volunteerCityFilter.trim() || undefined)}
                      placeholder={isHi ? "जैसे: सीहोर" : "e.g. Sehore"}
                      className="flex-1 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#000080]/30 focus:ring-2 focus:ring-[#000080]/10 font-medium"
                    />
                    <button
                      onClick={() => fetchVolunteers(volunteerCityFilter.trim() || undefined)}
                      className="px-5 py-3 bg-[#000080] text-white text-xs font-bold rounded-xl shrink-0 shadow-sm active:scale-95 transition-transform"
                    >
                      {isHi ? "खोजें" : "Search"}
                    </button>
                    {volunteerCityFilter && (
                      <button
                         onClick={() => { setVolunteerCityFilter(""); fetchVolunteers(); }}
                        className="px-5 py-3 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl shrink-0 hover:bg-slate-200"
                      >
                         <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {volunteers.length === 0 ? (
                  <div className="text-center py-16 bg-white shadow-sm border border-slate-100 rounded-2xl space-y-3">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-2 border border-slate-100">
                       <Users className="w-7 h-7 text-slate-300" />
                     </div>
                    <p className="text-sm font-bold text-slate-700">
                      {isHi ? "कोई वॉलंटियर नहीं मिला।" : "Check back soon!"}
                    </p>
                     <p className="text-xs text-slate-500 font-medium">
                      {isHi ? "इस क्षेत्र में अभी कोई रिकॉर्ड नहीं है।" : "No volunteers found for this criteria."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {volunteers.map((vol, index) => {
                      const skillsList = Array.isArray(vol.skills)
                        ? vol.skills
                        : typeof vol.skills === "string"
                        ? (() => { try { return JSON.parse(vol.skills as string); } catch { return []; } })()
                        : [];
                      
                      return (
                        <div key={vol.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col relative overflow-hidden group hover:shadow-md hover:border-[#000080]/20 transition-all duration-300">
                           {/* Rank Badge */}
                           {index < 3 && !volunteerCityFilter && (
                              <div className="absolute top-0 right-0 bg-gradient-to-bl from-[#FF9933] to-[#FF9933]/80 text-white text-[9px] font-black px-2 py-1 rounded-bl-lg shadow-sm">
                                 #{index + 1}
                              </div>
                           )}
                           
                          <div className="flex flex-col items-center gap-3 text-center mb-3">
                            <div className={`w-16 h-16 rounded-full border-2 p-0.5 ${index < 3 && !volunteerCityFilter ? 'border-[#FF9933]' : 'border-slate-100'}`}>
                              <div className="w-full h-full rounded-full bg-slate-50 flex items-center justify-center overflow-hidden">
                                {vol.avatar ? (
                                  <img src={vol.avatar} alt={vol.name} className="w-full h-full object-cover" />
                                ) : (
                                  <User className="w-6 h-6 text-slate-300" />
                                )}
                              </div>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-extrabold text-slate-900 truncate">{vol.name}</p>
                              {(vol.city || vol.area_locality) && (
                                <p className="text-[10px] font-medium text-slate-500 truncate mt-0.5">
                                  {[vol.area_locality, vol.city].filter(Boolean).join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center gap-2 mt-auto">
                             {vol.role && (
                               <span className="inline-block text-[9px] font-black text-[#000080] bg-[#000080]/5 rounded-md px-2 py-1 w-full text-center truncate">
                                 {vol.role}
                               </span>
                             )}
                             {skillsList.length > 0 && (
                               <div className="flex flex-wrap justify-center gap-1 w-full">
                                 {skillsList.slice(0, 2).map((s: string, i: number) => (
                                   <span key={i} className="text-[8.5px] font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 truncate max-w-[80px]">
                                     {s}
                                   </span>
                                 ))}
                               </div>
                             )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* LIVE CHAT SECTION */}
            {activeTab === "chat" && (
              <div className="flex flex-col h-[calc(100vh-220px)] pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col relative">
                  <div className="bg-[#000080] px-4 py-3.5 flex items-center gap-2 z-10 shadow-sm">
                    <MessageCircle className="w-4 h-4 text-white" />
                    <h4 className="text-[13px] font-bold text-white uppercase tracking-wider">{isHi ? "सार्वजनिक चैट" : "Live Chat"}</h4>
                    <div className="ml-auto flex items-center gap-1.5">
                       <span className="relative flex h-2 w-2">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                       </span>
                       <span className="text-[9px] font-bold text-white/80 uppercase">Live</span>
                    </div>
                  </div>
                  
                  {/* Volunteers List */}
                  {volunteers.length > 0 && (
                    <div className="bg-slate-50 p-3 shadow-inner z-0">
                      <p className="text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-widest">{isHi ? "हमारे स्वयंसेवक" : "Active Members"}</p>
                      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                        {volunteers.map(vol => (
                          <div key={vol.id} className="flex flex-col items-center gap-1.5 min-w-[50px]">
                            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                              {vol.avatar ? (
                                <img src={vol.avatar} alt={vol.name} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 text-slate-300" />
                              )}
                            </div>
                            <span className="text-[9px] font-bold text-slate-600 text-center leading-tight line-clamp-1 w-full px-1">{vol.name.split(' ')[0]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                    {chatMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-60">
                         <MessageCircle className="w-8 h-8 text-slate-300" />
                        <span className="text-xs font-bold text-slate-400">
                          {isHi ? "बातचीत शुरू करें..." : "Start the conversation..."}
                        </span>
                      </div>
                    ) : (
                      chatMessages.map((msg, idx) => {
                         const isMe = msg.authorName === user?.name;
                         return (
                            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                              <span className="text-[9px] font-bold text-slate-400 mb-1 px-1 uppercase tracking-wide">{msg.authorName}</span>
                              <div className={`px-4 py-2.5 rounded-2xl text-xs max-w-[85%] shadow-sm leading-relaxed ${isMe ? 'bg-[#000080] text-white rounded-tr-sm' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'}`}>
                                {msg.text}
                              </div>
                              <span className="text-[9px] font-bold text-slate-400 mt-1.5 px-1">
                                {msg.createdAt
                                  ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : msg.time}
                              </span>
                            </div>
                         );
                      })
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                      disabled={!user}
                      placeholder={user ? (isHi ? "संदेश लिखें..." : "Type a message...") : (isHi ? "चैट करने के लिए लॉगिन करें" : "Login to chat")}
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#000080]/20 focus:border-[#000080]/30 outline-none disabled:bg-slate-100 font-medium transition-all"
                    />
                    <button 
                      onClick={sendChatMessage}
                      disabled={!user || !chatInput.trim()}
                      className="w-12 h-12 flex items-center justify-center bg-[#000080] text-white rounded-xl disabled:opacity-50 transition-all active:scale-95 shadow-sm"
                    >
                      <Send className="w-5 h-5 -ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
