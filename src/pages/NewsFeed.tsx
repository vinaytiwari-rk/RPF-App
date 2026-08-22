import React, { useState, useEffect } from "react";
import { ArrowLeft, Newspaper, ExternalLink, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "motion/react";
import BrandLoader from "../components/BrandLoader";

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
        if (response.data.success) setArticles(response.data.data);
        else setError("Failed to fetch news.");
      } catch { setError("Error connecting to news server."); }
      finally { setLoading(false); }
    };
    fetchNews();
  }, []);

  return <div className="min-h-screen bg-[#FAF0E6] pb-28 font-sans text-[#2D241E]">
    <div className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 shadow-sm backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-3xl items-center px-4"><button onClick={()=>navigate(-1)} className="-ml-2 rounded-full p-2 transition-colors hover:bg-slate-100"><ArrowLeft className="h-6 w-6 text-slate-700"/></button><div className="ml-2 flex items-center space-x-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100"><Newspaper className="h-4 w-4 text-blue-600"/></div><h1 className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-xl font-bold text-transparent">News & Updates</h1></div></div></div>
    <div className="mx-auto mt-2 max-w-3xl space-y-4 p-4">{loading?<div className="flex flex-col items-center justify-center py-20 text-slate-500"><BrandLoader size="lg" label="Fetching latest updates"/><p className="mt-4">Fetching latest updates...</p></div>:error?<div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-red-600">{error}</div>:<div className="space-y-4">{articles.map((article,index)=><motion.a key={index} href={article.link} target="_blank" rel="noopener noreferrer" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:index*.05}} className="group block overflow-hidden rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"><div className="flex gap-4">{article.image_url&&<div className="hidden h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:block"><img src={article.image_url} alt="News" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" onError={e=>{e.currentTarget.style.display='none'}}/></div>}<div className="min-w-0 flex-1"><div className="mb-2 flex items-center space-x-2"><span className="inline-flex items-center rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700"><Newspaper className="mr-1 h-3 w-3"/>{article.source}</span><span className="flex items-center text-xs text-slate-400"><Calendar className="mr-1 h-3 w-3"/>{new Date(article.pubDate).toLocaleDateString()}</span></div><h3 className="mb-2 line-clamp-2 text-base font-bold leading-snug text-slate-800 transition-colors group-hover:text-blue-600">{article.title}</h3>{article.description&&<p className="line-clamp-2 text-sm text-slate-500">{article.description}</p>}</div><div className="flex shrink-0 items-center justify-center pl-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 transition-colors group-hover:bg-blue-50"><ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-500"/></div></div></div></motion.a>)}</div>}</div>
  </div>;
};
export default NewsFeed;
