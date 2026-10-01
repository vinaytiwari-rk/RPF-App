import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Newspaper,
  ExternalLink,
  Calendar,
  RefreshCw,
  Search,
  Rss,
  Share2,
  Filter,
  CheckCircle2,
  BookmarkCheck,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import BrandLoader from "../components/BrandLoader";
import { toast } from "react-hot-toast";
import { openExternalLink } from "../utils/browser";

interface NewsArticle {
  id?: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
  image_url?: string;
  description?: string;
  category?: string;
}

interface RssFeedItem {
  id: string;
  name: string;
  nameHi: string;
  url: string;
  category: string;
  enabled: boolean;
}

const NewsFeed: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [feeds, setFeeds] = useState<RssFeedItem[]>([]);
  const [selectedFeedId, setSelectedFeedId] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // 1. Fetch configured feeds list
  const fetchFeedsList = async () => {
    try {
      const res = await axios.get("/api/public/rss-feeds");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setFeeds(res.data.data.filter((f: RssFeedItem) => f.enabled !== false));
      }
    } catch (err) {
      console.warn("Could not load feed list:", err);
    }
  };

  // 2. Fetch news articles from aggregated RSS endpoint
  const fetchNews = async (feedId: string = "all", isRefresh: boolean = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      let endpoint = "/api/public/rss-feed";
      if (feedId !== "all") {
        endpoint = `/api/public/rss-feed?feedId=${encodeURIComponent(feedId)}`;
      }

      const response = await axios.get(endpoint, { timeout: 12000 });
      if (response.data?.success && Array.isArray(response.data.data)) {
        setArticles(response.data.data);
      } else {
        // Fallback to legacy/secondary endpoint if needed
        const fallbackRes = await axios.get("/api/public/news-rss", { timeout: 10000 });
        if (fallbackRes.data?.success && Array.isArray(fallbackRes.data.data)) {
          setArticles(fallbackRes.data.data);
        } else {
          setError("Failed to fetch news articles. Please try again.");
        }
      }
    } catch (err: any) {
      console.warn("News fetch attempt 1 failed, trying fallback:", err.message);
      try {
        const fallbackRes = await axios.get("/api/public/news-rss", { timeout: 8000 });
        if (fallbackRes.data?.data && Array.isArray(fallbackRes.data.data)) {
          setArticles(fallbackRes.data.data);
        } else {
          setError("Unable to connect to RSS news server.");
        }
      } catch {
        setError("Unable to connect to RSS news server. Please check your internet connection.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeedsList();
    fetchNews("all");
  }, []);

  const handleSelectFeed = (feedId: string) => {
    setSelectedFeedId(feedId);
    setSelectedCategory("all");
    fetchNews(feedId);
  };

  const handleShare = async (e: React.MouseEvent, article: NewsArticle) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description || article.title,
          url: article.link
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(`${article.title}\n${article.link}`);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleOpenArticle = (e: React.MouseEvent, article: NewsArticle) => {
    e.preventDefault();
    e.stopPropagation();
    if (!article.link) return;
    void openExternalLink(article.link, navigate, article.title);
  };

  // Filter categories dynamically
  const categories = useMemo(() => {
    const cats = new Set<string>();
    articles.forEach((a) => {
      if (a.category) cats.add(a.category);
    });
    feeds.forEach((f) => {
      if (f.category) cats.add(f.category);
    });
    return ["all", ...Array.from(cats)];
  }, [articles, feeds]);

  // Filtered articles list
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesCategory =
        selectedCategory === "all" ||
        (article.category &&
          article.category.toLowerCase() === selectedCategory.toLowerCase());

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        article.title.toLowerCase().includes(q) ||
        (article.description && article.description.toLowerCase().includes(q)) ||
        (article.source && article.source.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans text-slate-800">
      {/* Top Header - Strict Saffron/Green/Navy/White palette */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              aria-label="Go Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-orange-50 border border-orange-200 text-[#C2410C]">
                <Rss className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-[#0A192F] leading-tight">
                  Jan Seva News & RSS Hub
                </h1>
                <p className="text-[11px] font-medium text-[#166534]">
                  लाइव समाचार एवं जन-कल्याण अपडेट
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchNews(selectedFeedId, true)}
              disabled={refreshing || loading}
              className="p-2 rounded-xl text-slate-600 hover:text-[#C2410C] hover:bg-orange-50 transition border border-slate-200 disabled:opacity-50"
              title="Refresh Feeds"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-[#C2410C]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Channels / Source Pill Selector */}
        <div className="border-t border-slate-100 bg-white px-4 py-2.5 overflow-x-auto no-scrollbar">
          <div className="mx-auto max-w-4xl flex items-center gap-2 min-w-max">
            <button
              onClick={() => handleSelectFeed("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                selectedFeedId === "all"
                  ? "bg-[#0A192F] text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Newspaper className="w-3.5 h-3.5 text-orange-400" />
              <span>All News Feeds (सभी)</span>
            </button>

            {feeds.map((f) => (
              <button
                key={f.id}
                onClick={() => handleSelectFeed(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedFeedId === f.id
                    ? "bg-[#0A192F] text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Rss className="w-3.5 h-3.5 text-green-500" />
                <span>{f.nameHi || f.name}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-4xl px-4 py-4 space-y-4">
        {/* Search & Category Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news by headline, topic or source..."
              className="w-full text-xs bg-transparent border-none outline-none text-[#0A192F] placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {categories.length > 2 && (
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar shrink-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? "bg-[#166534] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat === "all" ? "All Categories" : cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* State Displays */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <BrandLoader size="lg" label="Connecting to Live RSS Feeds" />
            <p className="mt-4 text-xs font-semibold text-[#0A192F]">
              Aggregating verified news articles...
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              PIB • Google News • Government Alerts • Employment
            </p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 rounded-3xl border border-red-200 text-center space-y-3 shadow-sm">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
            <p className="text-sm font-bold text-red-700">{error}</p>
            <button
              onClick={() => fetchNews(selectedFeedId)}
              className="px-4 py-2 bg-[#C2410C] hover:bg-orange-800 text-white rounded-xl text-xs font-bold transition shadow"
            >
              Try Again
            </button>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <Newspaper className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-[#0A192F]">No Articles Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No news items match your current filter or search criteria.
            </p>
            {(searchQuery || selectedCategory !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-2 text-xs font-bold text-[#C2410C] hover:underline"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Showing {filteredArticles.length} Live Articles</span>
              <span className="text-[#166534] font-semibold">● Updated in Real-Time</span>
            </div>

            <AnimatePresence>
              {filteredArticles.map((article, index) => {
                const pubDateStr = article.pubDate
                  ? new Date(article.pubDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })
                  : "Today";

                return (
                  <motion.article
                    key={article.id || `${article.link}-${index}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.4) }}
                    className="group bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 relative overflow-hidden"
                  >
                    {/* Optional Thumbnail Image */}
                    {article.image_url && (
                      <div 
                        onClick={(e) => handleOpenArticle(e, article)}
                        className="w-full sm:w-44 h-40 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 cursor-pointer"
                      >
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.parentElement?.classList.add("hidden");
                          }}
                        />
                      </div>
                    )}

                    {/* Content Section */}
                    <div className="min-w-0 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        {/* Source, Category & Date Header */}
                        <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-orange-50 border border-orange-200 text-[#C2410C] font-bold text-[11px]">
                            <Newspaper className="w-3 h-3" />
                            <span className="truncate max-w-[180px]">{article.source || "News"}</span>
                          </span>

                          {article.category && (
                            <span className="px-2 py-0.5 rounded-lg bg-green-50 border border-green-200 text-[#166534] font-semibold text-[11px]">
                              {article.category}
                            </span>
                          )}

                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Calendar className="w-3 h-3" />
                            <span>{pubDateStr}</span>
                          </span>
                        </div>

                        {/* Title */}
                        <h2 
                          onClick={(e) => handleOpenArticle(e, article)}
                          className="text-sm sm:text-base font-bold text-[#0A192F] group-hover:text-[#C2410C] transition leading-snug line-clamp-2 cursor-pointer"
                        >
                          {article.title}
                        </h2>

                        {/* Excerpt */}
                        {article.description && (
                          <p 
                            onClick={(e) => handleOpenArticle(e, article)}
                            className="mt-1.5 text-xs text-slate-600 leading-relaxed line-clamp-2 cursor-pointer"
                          >
                            {article.description}
                          </p>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                        <button
                          type="button"
                          onClick={(e) => handleOpenArticle(e, article)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#166534] hover:text-green-800 transition cursor-pointer"
                        >
                          <span>पूरा पढ़ें (Read Full in App)</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => handleShare(e, article)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#0A192F] hover:bg-slate-100 transition"
                          title="Share Article"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default NewsFeed;
