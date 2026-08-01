// src/pages/Community.tsx
import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Sparkles,
  BookOpen,
  Plus,
  X,
  Send,
  Loader2,
  Calendar,
  User,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Globe,
  ExternalLink,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

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

type TabType = "stories" | "blogs";

export default function Community() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user } = useAuth();
  const isHi = lang === "hi";

  const [activeTab, setActiveTab] = useState<TabType>("stories");
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  // Write Blog Modal states
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [isSubmittingBlog, setIsSubmittingBlog] = useState(false);

  const fetchSuccessStories = async () => {
    try {
      const res = await axios.get("/api/success-stories");
      if (res.data.success) {
        setStories(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching success stories:", err);
    }
  };

  const fetchBlogs = async () => {
    try {
      const res = await axios.get("/api/blogs");
      if (res.data.success) {
        setBlogs(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchSuccessStories(), fetchBlogs()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWriteBlogSubmit = async () => {
    if (!blogTitle.trim() || !blogContent.trim()) return;
    setIsSubmittingBlog(true);
    try {
      const token = localStorage.getItem("@rpf_token");
      const res = await axios.post("/api/blogs", {
        title: blogTitle.trim(),
        content: blogContent.trim(),
      }, {
        headers: {
          'Authorization': `Bearer ${token || ""}`
        }
      });
      if (res.data.success) {
        alert(
          isHi
            ? "आपका ब्लॉग समीक्षा के लिए जमा कर दिया गया है। एडमिन द्वारा स्वीकृत होने पर यह प्रकाशित होगा।"
            : "Your blog has been submitted for review. It will be published once approved by the admin."
        );
        setBlogTitle("");
        setBlogContent("");
        setShowBlogModal(false);
        fetchBlogs();
      }
    } catch (err: any) {
      console.error("Error submitting blog:", err);
      alert(err.response?.data?.error || "Error submitting blog.");
    } finally {
      setIsSubmittingBlog(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(isHi ? "hi-IN" : "en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col h-full relative animate-fadeIn">
      {/* ── Mandala backdrop ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] h-[340px] opacity-[0.03] pointer-events-none z-0">
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#D4AF37]" fill="currentColor">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M50 5l2 15 15-15-5 25 15-5-25 5 15 15-25-2 5 25-15-15-5 15-15-15-5 15-5-25-25 2 15-15-25-5 15-5-15-25 15 15z" />
        </svg>
      </div>

      {/* ── Header ── */}
      <div className="p-5 pb-3 space-y-3 shrink-0 relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-display font-extrabold text-base text-slate-900">
              {isHi ? "जन सेवा संगम" : "Jan Seva Sangam"}
            </h3>
            <p className="text-xs text-slate-500">
              {isHi ? "सफलता की कहानियाँ एवं नागरिकों के विचार" : "Success stories & citizen insights"}
            </p>
          </div>
          {activeTab === "blogs" && user && (
            <button
              onClick={() => setShowBlogModal(true)}
              className="flex items-center gap-1 bg-[#000080] text-white text-[10px] font-bold px-3 py-2 rounded-xl shadow-md hover:bg-indigo-900 transition shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              {isHi ? "ब्लॉग लिखें" : "Write Blog"}
            </button>
          )}
        </div>

        {/* Tab Selection pills */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("stories")}
            className={`flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold rounded-xl border transition-all duration-200 ${
              activeTab === "stories"
                ? "bg-[#000080] text-white border-[#000080] shadow-sm"
                : "bg-white text-slate-500 border-slate-200 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
            {isHi ? "सफलता गाथा" : "Success Stories"}
          </button>
          <button
            onClick={() => setActiveTab("blogs")}
            className={`flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold rounded-xl border transition-all duration-200 ${
              activeTab === "blogs"
                ? "bg-[#000080] text-white border-[#000080] shadow-sm"
                : "bg-white text-slate-500 border-slate-200 hover:text-slate-800"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#138808]" />
            {isHi ? "नागरिक ब्लॉग" : "Citizen Blogs"}
          </button>
        </div>

        <p className="text-[10px] text-slate-400 font-semibold px-0.5 leading-snug">
          {activeTab === "stories"
            ? isHi
              ? "फाउंडेशन के माध्यम से आए बदलाव और जनहित कार्यों की प्रेरक कहानियाँ।"
              : "Inspiring stories of change and welfare accomplishments driven by the foundation."
            : isHi
              ? "नागरिकों और स्वयंसेवकों द्वारा साझा किए गए विचार और ब्लॉग (एडमिन द्वारा स्वीकृत)।"
              : "Thoughtful articles and blogs shared by citizens & volunteers (approved by admin)."}
        </p>
      </div>

      {/* ── Content Feed ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-24 relative z-10">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* SUCCESS STORIES SECTION */}
            {activeTab === "stories" && (
              <div className="space-y-4 pt-2">
                {stories.length === 0 ? (
                  <div className="text-center py-14 bg-white border border-slate-200 rounded-2xl space-y-2">
                    <Sparkles className="w-10 h-10 text-slate-300 mx-auto animate-pulse" />
                    <p className="text-xs font-bold text-slate-400">
                      {isHi ? "अभी कोई सफलता गाथा उपलब्ध नहीं है।" : "No success stories posted yet."}
                    </p>
                  </div>
                ) : (
                  stories.map((story) => (
                    <div
                      key={story.id}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition duration-200 flex flex-col"
                    >
                      {story.imageUrl && (
                        <div className="relative h-48 bg-slate-100 overflow-hidden">
                          <img
                            src={story.imageUrl}
                            alt={story.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3 bg-[#FF9933] text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-sm">
                            {isHi ? "सफलता गाथा" : "Success Story"}
                          </div>
                        </div>
                      )}
                      <div className="p-4 space-y-2">
                        {!story.imageUrl && (
                          <div className="flex items-center gap-1.5">
                            <span className="bg-amber-50 text-[#FF9933] border border-amber-200/50 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                              {isHi ? "सफलता गाथा" : "Success Story"}
                            </span>
                          </div>
                        )}
                        <h4 className="font-display font-extrabold text-slate-900 text-sm leading-snug">
                          {story.title}
                        </h4>
                        <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-line font-medium">
                          {story.content}
                        </p>
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
              <div className="space-y-4 pt-2">
                {blogs.length === 0 ? (
                  <div className="text-center py-14 bg-white border border-slate-200 rounded-2xl space-y-2">
                    <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-400">
                      {isHi ? "अभी कोई ब्लॉग उपलब्ध नहीं है।" : "No blogs published yet."}
                    </p>
                  </div>
                ) : (
                  blogs.map((blog) => (
                    <div
                      key={blog.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm hover:border-slate-300 transition duration-200 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#138808]/10 text-[#138808] flex items-center justify-center text-xs font-black shadow-xs">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h5 className="text-[11px] font-extrabold text-slate-800">{blog.authorName}</h5>
                            <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                              {isHi ? "स्वयंसेवक / नागरिक" : "Volunteer / Citizen"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-[8.5px] font-bold text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-350" />
                          <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5 border-t border-slate-50 pt-2.5">
                        <h4 className="font-display font-extrabold text-slate-900 text-xs">
                          {blog.title}
                        </h4>
                        <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-line font-medium">
                          {blog.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}


          </>
        )}
      </div>

      {/* ── WRITE BLOG MODAL ── */}
      {showBlogModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 space-y-4.5 shadow-2xl animate-slideUp">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-base text-slate-900">
                  {isHi ? "नया ब्लॉग लिखें" : "Write a Blog Post"}
                </h4>
                <p className="text-[10px] text-slate-450 mt-0.5">
                  {isHi
                    ? "आपका ब्लॉग केवल एडमिन द्वारा स्वीकृत होने के बाद ही प्रकाशित किया जाएगा।"
                    : "Your post will be publicly visible after admin review and approval."}
                </p>
              </div>
              <button
                onClick={() => setShowBlogModal(false)}
                className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  {isHi ? "ब्लॉग शीर्षक" : "Blog Title"}
                </label>
                <input
                  type="text"
                  placeholder={isHi ? "शीर्षक यहाँ दर्ज करें..." : "Enter blog title..."}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:border-[#000080] outline-none"
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  {isHi ? "ब्लॉग सामग्री" : "Blog Content"}
                </label>
                <textarea
                  className="w-full border border-slate-200 rounded-2xl p-3 text-xs font-semibold resize-none h-32 focus:border-[#000080] outline-none"
                  placeholder={isHi ? "अपनी कहानी या विचार यहाँ लिखें..." : "Share your thoughts, experiences, or success details..."}
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={handleWriteBlogSubmit}
              disabled={isSubmittingBlog || !blogTitle.trim() || !blogContent.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#000080] text-white font-bold rounded-xl text-sm shadow-md hover:bg-indigo-900 transition disabled:opacity-50"
            >
              {isSubmittingBlog ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isSubmittingBlog
                ? isHi
                  ? "ब्लॉग जमा हो रहा है..."
                  : "Submitting..."
                : isHi
                ? "समीक्षा के लिए जमा करें"
                : "Submit for Review"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
