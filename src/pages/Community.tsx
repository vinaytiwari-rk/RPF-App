import React, { useEffect, useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { Sparkles, BookOpen, Plus, X, Send, Loader2, Calendar, User, MessageCircle } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { io, Socket } from "socket.io-client";

interface SuccessStory {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

interface Blog {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorId: string;
  approved: boolean;
  createdAt: string;
  publishedAt?: string;
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

type TabType = "stories" | "blogs" | "volunteers" | "chat";

export default function Community() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user, token } = useAuth();
  const isHi = lang === "hi";

  const [activeTab, setActiveTab] = useState<TabType>("stories");
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [volunteerCityFilter, setVolunteerCityFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Write Blog Modal states
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [isSubmittingBlog, setIsSubmittingBlog] = useState(false);

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

  const fetchBlogs = async () => {
    try {
      const res = await axios.get("/api/blogs");
      if (res.data.success) {
        setBlogs(res.data.data || []);
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

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchSuccessStories(), fetchBlogs(), fetchVolunteers(), fetchChatHistory()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Chat requires being logged in now — the server verifies the
    // connection's token and derives the sender's name from it, so nobody
    // can impersonate another volunteer/citizen in the chat anymore.
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

  const handleWriteBlogSubmit = async () => {
    if (!blogTitle.trim() || !blogContent.trim()) return;
    setIsSubmittingBlog(true);
    try {
      const token = localStorage.getItem("@rpf_token");
      const res = await axios.post("/api/blogs", {
        title: blogTitle.trim(),
        content: blogContent.trim(),
      }, {
        headers: { 'Authorization': `Bearer ${token || ""}` }
      });
      if (res.data.success) {
        alert(isHi ? "आपका ब्लॉग समीक्षा के लिए जमा कर दिया गया है।" : "Your blog has been submitted for review.");
        setBlogTitle("");
        setBlogContent("");
        setShowBlogModal(false);
        fetchBlogs();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "Error");
    } finally {
      setIsSubmittingBlog(false);
    }
  };

  const sendChatMessage = () => {
    if (!chatInput.trim() || !user) return;

    // authorName/authorId are no longer sent from the client — the server
    // verifies the connection's login token and fills in the real sender
    // identity itself, so messages can no longer be sent under someone
    // else's name.
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
    <div className="flex flex-col h-full relative animate-fadeIn">
      {/* ── Header ── */}
      <div className="p-5 pb-3 space-y-3 shrink-0 relative z-10 bg-white shadow-sm border-b border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-display font-extrabold text-base text-slate-900">
              {isHi ? "जन सेवा संगम" : "Jan Seva Sangam"}
            </h3>
            <p className="text-xs text-slate-500">
              {isHi ? "सफलता की कहानियाँ एवं नागरिकों के विचार" : "Success stories & citizen insights"}
            </p>
          </div>
          <div className="flex gap-2">
            {activeTab === "blogs" && user && (
              <button
                onClick={() => setShowBlogModal(true)}
                className="flex items-center gap-1 bg-blue-600 text-white text-[10px] font-bold px-3 py-2 rounded-xl shadow-md hover:bg-blue-700 transition shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                {isHi ? "ब्लॉग लिखें" : "Write Blog"}
              </button>
            )}
          </div>
        </div>

        {/* Tab Selection pills */}
        <div className="flex gap-2 pb-2">
          <button
            onClick={() => setActiveTab("stories")}
            className={`flex items-center gap-2 px-3 py-2 text-[11px] font-bold rounded-lg border transition-all duration-200 ${
              activeTab === "stories"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-slate-500 border-slate-200 hover:text-slate-800"
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeTab === "stories" ? "text-white" : "text-orange-500"}`} />
            {isHi ? "सफलता गाथा" : "Stories"}
          </button>
          <button
            onClick={() => setActiveTab("blogs")}
            className={`flex items-center gap-2 px-3 py-2 text-[11px] font-bold rounded-lg border transition-all duration-200 ${
              activeTab === "blogs"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-slate-500 border-slate-200 hover:text-slate-800"
            }`}
          >
            <BookOpen className={`w-3.5 h-3.5 ${activeTab === "blogs" ? "text-white" : "text-green-600"}`} />
            {isHi ? "ब्लॉग" : "Blogs"}
          </button>
          <button
            onClick={() => setActiveTab("volunteers")}
            className={`flex items-center gap-2 px-3 py-2 text-[11px] font-bold rounded-lg border transition-all duration-200 ${
              activeTab === "volunteers"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-slate-500 border-slate-200 hover:text-slate-800"
            }`}
          >
            <User className={`w-3.5 h-3.5 ${activeTab === "volunteers" ? "text-white" : "text-indigo-500"}`} />
            {isHi ? "वॉलंटियर नेटवर्क" : "Volunteer Network"}
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-3 py-2 text-[11px] font-bold rounded-lg border transition-all duration-200 ${
              activeTab === "chat"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-slate-500 border-slate-200 hover:text-slate-800"
            }`}
          >
            <MessageCircle className={`w-3.5 h-3.5 ${activeTab === "chat" ? "text-white" : "text-purple-500"}`} />
            {isHi ? "लाइव चैट" : "Live Chat"}
          </button>
        </div>
      </div>

      {/* ── Content Feed ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-24 relative z-10">
        {loading && activeTab !== "chat" ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* SUCCESS STORIES SECTION */}
            {activeTab === "stories" && (
              <div className="space-y-4 pt-4">
                {stories.length === 0 ? (
                  <div className="text-center py-14 bg-white border border-slate-200 rounded-xl space-y-2">
                    <p className="text-xs font-bold text-slate-400">
                      {isHi ? "अभी कोई सफलता गाथा उपलब्ध नहीं है।" : "No success stories posted yet."}
                    </p>
                  </div>
                ) : (
                  stories.map((story) => (
                    <div key={story.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                      {story.imageUrl && (
                        <div className="relative h-48 bg-slate-100 overflow-hidden">
                          <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-4 space-y-2">
                        <h4 className="font-bold text-slate-900 text-sm">{story.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{story.content}</p>
                        <div className="flex items-center gap-1.5 pt-2 text-[9px] font-bold text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(story.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* CITIZEN BLOGS SECTION */}
            {activeTab === "blogs" && (
              <div className="space-y-4 pt-4">
                {blogs.length === 0 ? (
                  <div className="text-center py-14 bg-white border border-slate-200 rounded-xl space-y-2">
                    <p className="text-xs font-bold text-slate-400">
                      {isHi ? "अभी कोई ब्लॉग उपलब्ध नहीं है।" : "No blogs published yet."}
                    </p>
                  </div>
                ) : (
                  blogs.map((blog) => (
                    <div key={blog.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><User className="w-3.5 h-3.5" /></div>
                          <div>
                            <h5 className="text-[11px] font-bold text-slate-800">{blog.authorName}</h5>
                          </div>
                        </div>
                        <div className="text-[9px] font-medium text-slate-400">{formatDate(blog.publishedAt || blog.createdAt)}</div>
                      </div>
                      <div className="space-y-1.5 border-t border-slate-100 pt-2.5">
                        <h4 className="font-bold text-slate-900 text-xs">{blog.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{blog.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* VOLUNTEER NETWORK SECTION */}
            {activeTab === "volunteers" && (
              <div className="space-y-4 pt-4">
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-500 mb-2">
                    {isHi
                      ? "शहर के नाम से वॉलंटियर खोजें"
                      : "Search volunteers by city"}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={volunteerCityFilter}
                      onChange={(e) => setVolunteerCityFilter(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && fetchVolunteers(volunteerCityFilter.trim() || undefined)}
                      placeholder={isHi ? "जैसे: सीहोर" : "e.g. Sehore"}
                      className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400"
                    />
                    <button
                      onClick={() => fetchVolunteers(volunteerCityFilter.trim() || undefined)}
                      className="px-3 py-2 bg-blue-600 text-white text-[10px] font-bold rounded-lg shrink-0"
                    >
                      {isHi ? "खोजें" : "Search"}
                    </button>
                    {volunteerCityFilter && (
                      <button
                        onClick={() => { setVolunteerCityFilter(""); fetchVolunteers(); }}
                        className="px-3 py-2 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg shrink-0"
                      >
                        {isHi ? "हटाएं" : "Clear"}
                      </button>
                    )}
                  </div>
                </div>

                {volunteers.length === 0 ? (
                  <div className="text-center py-14 bg-white border border-slate-200 rounded-xl space-y-2">
                    <p className="text-xs font-bold text-slate-400">
                      {isHi ? "कोई वॉलंटियर नहीं मिला।" : "No volunteers found."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {volunteers.map((vol) => {
                      const skillsList = Array.isArray(vol.skills)
                        ? vol.skills
                        : typeof vol.skills === "string"
                        ? (() => { try { return JSON.parse(vol.skills as string); } catch { return []; } })()
                        : [];
                      return (
                        <div key={vol.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center overflow-hidden shrink-0">
                              {vol.avatar ? (
                                <img src={vol.avatar} alt={vol.name} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{vol.name}</p>
                              {(vol.city || vol.area_locality) && (
                                <p className="text-[9px] text-slate-400 truncate">
                                  {[vol.area_locality, vol.city].filter(Boolean).join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                          {vol.role && (
                            <span className="inline-block text-[8px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5">
                              {vol.role}
                            </span>
                          )}
                          {skillsList.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {skillsList.slice(0, 3).map((s: string, i: number) => (
                                <span key={i} className="text-[8px] font-medium text-slate-500 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* LIVE CHAT SECTION */}
            {activeTab === "chat" && (
              <div className="flex flex-col h-full pt-4">
                <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="bg-blue-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-blue-900">{isHi ? "सार्वजनिक चैट" : "Public Chat"}</h4>
                  </div>
                  
                  {/* Volunteers List */}
                  {volunteers.length > 0 && (
                    <div className="border-b border-slate-100 bg-slate-50/50 p-3">
                      <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase">{isHi ? "हमारे स्वयंसेवक" : "Our Volunteers"}</p>
                      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                        {volunteers.map(vol => (
                          <div key={vol.id} className="flex flex-col items-center gap-1 min-w-[50px]">
                            <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {vol.avatar ? (
                                <img src={vol.avatar} alt={vol.name} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <span className="text-[9px] font-medium text-slate-700 text-center leading-tight line-clamp-1 w-full px-1">{vol.name.split(' ')[0]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-xs text-slate-400 py-10">
                        {isHi ? "बातचीत शुरू करें..." : "Start the conversation..."}
                      </div>
                    ) : (
                      chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.authorName === user?.name ? 'items-end' : 'items-start'}`}>
                          <span className="text-[9px] text-slate-500 font-medium mb-1 px-1">{msg.authorName}</span>
                          <div className={`px-3 py-2 rounded-lg text-xs max-w-[85%] shadow-sm ${msg.authorName === user?.name ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                            {msg.text}
                          </div>
                          <span className="text-[8px] text-slate-400 mt-1 px-1">
                            {msg.createdAt
                              ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : msg.time}
                          </span>
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                      disabled={!user}
                      placeholder={user ? (isHi ? "संदेश लिखें..." : "Type a message...") : (isHi ? "चैट करने के लिए लॉगिन करें" : "Login to chat")}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-100"
                    />
                    <button 
                      onClick={sendChatMessage}
                      disabled={!user || !chatInput.trim()}
                      className="w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-lg disabled:opacity-50 transition"
                    >
                      <Send className="w-4 h-4 -ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── WRITE BLOG MODAL ── */}
      {showBlogModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full rounded-t-2xl p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-base text-slate-900">{isHi ? "नया ब्लॉग लिखें" : "Write a Blog Post"}</h4>
              </div>
              <button onClick={() => setShowBlogModal(false)} className="p-2 bg-slate-100 rounded-full"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Title</label>
                <input type="text" className="w-full p-2 border border-slate-300 rounded-lg text-sm" value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Content</label>
                <textarea className="w-full border border-slate-300 rounded-lg p-2 text-sm h-32" value={blogContent} onChange={(e) => setBlogContent(e.target.value)} />
              </div>
            </div>

            <button onClick={handleWriteBlogSubmit} disabled={isSubmittingBlog || !blogTitle.trim() || !blogContent.trim()} className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg text-sm">
              {isSubmittingBlog ? "Submitting..." : "Submit for Review"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
