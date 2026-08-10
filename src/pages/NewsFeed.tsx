import React, { useState } from 'react';
import { Newspaper, TrendingUp, Globe, Activity, Search, ExternalLink } from 'lucide-react';

const MOCK_NEWS = [
  {
    id: 1,
    title: 'New Solar Initiative Promises Renewable Energy for Rural India',
    category: 'Technology',
    source: 'Tech Daily',
    time: '2 hours ago',
    image: 'https://images.unsplash.com/photo-1509391366360-120953a15443?auto=format&fit=crop&q=80&w=400',
    summary: 'A new government-backed solar initiative aims to bring reliable renewable energy to over 10,000 rural villages by the end of the year.'
  },
  {
    id: 2,
    title: 'Global Markets Rally as Tech Stocks Hit New Highs',
    category: 'Business',
    source: 'Finance Express',
    time: '4 hours ago',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=400',
    summary: 'Tech stocks led a broader market rally today, pushing major indexes to all-time highs amid strong earnings reports.'
  },
  {
    id: 3,
    title: 'Breakthrough in AI Medical Diagnostics announced',
    category: 'Health',
    source: 'Medical News Today',
    time: '5 hours ago',
    image: 'https://images.unsplash.com/photo-1576091160550-2173ff9e5eb2?auto=format&fit=crop&q=80&w=400',
    summary: 'Researchers have developed an AI model that can detect early signs of severe diseases from routine scans with 99% accuracy.'
  },
  {
    id: 4,
    title: 'Local Sports Team Wins National Championship',
    category: 'Sports',
    source: 'Sports Hub',
    time: '8 hours ago',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=400',
    summary: 'In a thrilling final match, the home team secured their first national championship title in over two decades.'
  },
  {
    id: 5,
    title: 'New Eco-Friendly Transportation System Unveiled',
    category: 'Environment',
    source: 'Green Planet',
    time: '12 hours ago',
    image: 'https://images.unsplash.com/photo-1514924013411-cce2d65fa65d?auto=format&fit=crop&q=80&w=400',
    summary: 'City officials today unveiled a comprehensive plan for a new, zero-emission public transportation network.'
  },
  {
    id: 6,
    title: 'Arts Festival Draws Record Crowds',
    category: 'Culture',
    source: 'City Times',
    time: '1 day ago',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400',
    summary: 'The annual arts and culture festival concluded this weekend, drawing record-breaking crowds and showcasing local talent.'
  }
];

export default function NewsFeed() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Technology', 'Business', 'Health', 'Sports', 'Environment', 'Culture'];

  const filteredNews = MOCK_NEWS.filter(news => {
    const matchesCategory = activeCategory === 'All' || news.category === activeCategory;
    const matchesSearch = news.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          news.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fadeIn max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Newspaper className="w-8 h-8 text-[var(--rp-primary)]" />
            Smart News Feed
          </h1>
          <p className="text-gray-600">Top stories, real-time updates, and curated categories.</p>
        </div>
      </div>

      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex overflow-x-auto w-full md:w-auto gap-2 pb-2 md:pb-0 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                activeCategory === cat 
                  ? 'bg-[var(--rp-primary)] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search news..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--rp-primary)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.map(news => (
          <div key={news.id} className="glass-card rounded-2xl overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col h-full">
            <div className="h-48 overflow-hidden relative">
              <img 
                src={news.image} 
                alt={news.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-bold rounded-lg text-[var(--rp-primary)] shadow-sm">
                {news.category}
              </div>
            </div>
            
            <div className="p-5 flex flex-col flex-grow">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-gray-500">{news.source}</span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Activity className="w-3 h-3" /> {news.time}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[var(--rp-primary)] transition-colors">
                {news.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
                {news.summary}
              </p>
              
              <button className="mt-auto w-full py-2 bg-gray-50 hover:bg-[var(--rp-primary)] text-gray-700 hover:text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                Read Full Story <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          <Globe className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No news found for your search criteria.</p>
        </div>
      )}
    </div>
  );
}
