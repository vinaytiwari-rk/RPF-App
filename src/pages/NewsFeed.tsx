import React, { useState, useEffect } from "react";
import { ArrowLeft, Newspaper, ExternalLink, Calendar, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "motion/react";

interface NewsArticle {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  image_url?: string;
  description?: string;
}

const NewsFeed: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get("/api/public/news");
        if (response.data.success) {
          setArticles(response.data.data);
        } else {
          setError("Failed to fetch news.");
        }
      } catch (err) {
        setError("Error connecting to news server.");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Premium Glassmorphic Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="flex items-center px-4 h-16 max-w-3xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </button>
          <div className="flex items-center space-x-2 ml-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Newspaper className="w-4 h-4 text-blue-600" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
              News & Updates
            </h1>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto space-y-4 mt-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader className="w-8 h-8 animate-spin mb-4 text-blue-500" />
            <p>Fetching latest updates...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-center">
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article, index) => (
              <motion.a
                key={index}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="block bg-white rounded-3xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group overflow-hidden"
              >
                <div className="flex gap-4">
                  {article.image_url && (
                    <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-slate-100 hidden sm:block">
                      <img 
                        src={article.image_url} 
                        alt="News" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg inline-flex items-center">
                        <Newspaper className="w-3 h-3 mr-1" />
                        {article.source}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(article.pubDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                      {article.title}
                    </h3>
                    
                    {article.description && (
                      <p className="text-sm text-slate-500 line-clamp-2">
                        {article.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="shrink-0 flex items-center justify-center pl-2">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;
