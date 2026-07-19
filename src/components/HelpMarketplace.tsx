import React, { useState } from "react";
import { HelpPost } from "../types";
import { PlusCircle, Search, MessageCircle, MapPin, Phone, Info, Check, Sparkles, Filter } from "lucide-react";

interface HelpMarketplaceProps {
  lang: "hi" | "en";
  posts: HelpPost[];
  onAddPost: (post: Omit<HelpPost, "id" | "date" | "status">) => void;
  onFulfillPost: (postId: string) => void;
}

export default function HelpMarketplace({ lang, posts, onAddPost, onFulfillPost }: HelpMarketplaceProps) {
  const [activeTab, setActiveTab] = useState<"need" | "offer">("need");
  const [categoryFilter, setCategoryFilter] = useState("All");
  
  // Form States
  const [showForm, setShowForm] = useState(false);
  const [formCategory, setFormCategory] = useState<any>("Food");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formLocation, setFormLocation] = useState("");

  const categories = ["All", "Food", "Books & Study", "Blood Required", "Medical Consultation", "Career Guidance", "Financial Help", "Others"];

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim() || !formName.trim() || !formPhone.trim() || !formLocation.trim()) return;

    onAddPost({
      type: activeTab,
      category: formCategory,
      title: formTitle,
      description: formDesc,
      postedBy: formName,
      contact: formPhone,
      location: formLocation,
    });

    // Clear form
    setFormTitle("");
    setFormDesc("");
    setFormName("");
    setFormPhone("");
    setFormLocation("");
    setShowForm(false);
  };

  const filteredPosts = posts.filter(post => {
    const matchesType = post.type === activeTab;
    const matchesCat = categoryFilter === "All" || post.category === categoryFilter;
    return matchesType && matchesCat;
  });

  return (
    <div className="space-y-6" id="marketplace-section">
      {/* Intro Description banner */}
      <div className="bg-slate-950 text-white rounded-md p-5 border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-[#FF9933]/10 rounded-full blur-2xl"></div>
        <div className="relative space-y-2">
          <div className="flex items-center gap-1.5 text-[#FF9933] font-bold text-xs uppercase tracking-widest">
            <Sparkles className="w-4 h-4 animate-spin" />
            People Helping People Mutual-Aid
          </div>
          <h3 className="font-extrabold text-lg tracking-tight">
            {lang === "hi" ? "🌐 जन सहायता केंद्र (Mutual Help Board)" : "🌐 Neighborhood Mutual Help Board"}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            {lang === "hi" 
              ? "यह समाज में आपसी सहयोग बढ़ाने का एक मंच है। यदि आपको दवाइयाँ, अध्ययन की पुस्तकें, आपातकालीन भोजन या चिकित्सा परामर्श जैसी चीज़ों की आवश्यकता है, तो यहाँ कहें। अथवा यदि आप ये चीज़ें दान कर समाज की मदद करना चाहते हैं, तो 'मदद की पेशकश' करें।" 
              : "A crowd-sourced bulletin linking neighbors holding materials (extra textbooks, cooked food packages, basic clothing) directly with families seeking timely support on the ground."}
          </p>
        </div>
      </div>

      {/* Main Tabs (Need vs Offer) */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-xl max-w-md mx-auto">
        <button
          onClick={() => { setActiveTab("need"); setCategoryFilter("All"); }}
          className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs transition duration-150 cursor-pointer ${
            activeTab === "need" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-800"
          }`}
        >
          {lang === "hi" ? "🙋 मुझे सहायता चाहिए (Need Help)" : "🙋 I Seek Help"}
        </button>
        <button
          onClick={() => { setActiveTab("offer"); setCategoryFilter("All"); }}
          className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs transition duration-150 cursor-pointer ${
            activeTab === "offer" ? "bg-white text-[#0f4c81] shadow-sm" : "text-slate-600 hover:text-slate-800"
          }`}
        >
          {lang === "hi" ? "🤝 मैं सहायता देना चाहता हूँ (Offers)" : "🤝 I Want to Help"}
        </button>
      </div>

      {/* Category Selectors & Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Category filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-1">
          {categories.slice(0, 7).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`flex-shrink-0 text-[11px] font-semibold px-3.5 py-1.5 rounded-full border transition duration-150 cursor-pointer ${
                categoryFilter === cat 
                  ? "bg-slate-900 border-slate-900 text-white" 
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {lang === "hi" && cat === "All" ? "सभी श्रेणियां" : cat}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#0f4c81] hover:bg-[#0f4c81] text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          {lang === "hi" ? "नया पोस्ट जोड़ें" : "Create Help Post"}
        </button>
      </div>

      {/* Post creation form */}
      {showForm && (
        <form onSubmit={handleCreatePost} className="bg-white border border-slate-200 rounded-md p-5 space-y-4 max-w-lg mx-auto shadow-sm animate-fadeIn">
          <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1">
            <PlusCircle className="w-4 h-4 text-[#0f4c81]" />
            {lang === "hi" ? `नया ${activeTab === "need" ? "सहायता अनुरोध" : "सहायता प्रस्ताव"} दर्ज करें` : `New ${activeTab === "need" ? "Help Request" : "Help Offer"}`}
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">{lang === "hi" ? "श्रेणी" : "Topic Category"}</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#FF9933] outline-none"
              >
                {categories.slice(1).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">{lang === "hi" ? "शीर्षक" : "Post Title"}</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder={lang === "hi" ? "उदा. पुरानी किताबें चाहिए" : "e.g. Extra secondary study guides"}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#FF9933] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">{lang === "hi" ? "विवरण" : "Elaborated Content"}</label>
            <textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder={lang === "hi" ? "कृपया अपनी ज़रूरत या सामान का विवरण लिखें ताकि सही लोग संपर्क कर सकें..." : "Describe details, quantities, condition, etc..."}
              rows={3}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#FF9933] outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">{lang === "hi" ? "आपका नाम" : "Your Name"}</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#FF9933] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">{lang === "hi" ? "संपर्क फोन" : "Phone"}</label>
              <input
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#FF9933] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">{lang === "hi" ? "वार्ड / जिला" : "Ward / District"}</label>
              <input
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#FF9933] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0f4c81] hover:bg-[#0f4c81] text-white font-bold text-xs py-2 rounded-lg transition cursor-pointer"
          >
            {lang === "hi" ? "सफलतापूर्वक बोर्ड पर भेजें" : "Submit to Mutual Aid Board"}
          </button>
        </form>
      )}

      {/* Grid List of Posts */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-md p-8 text-center text-slate-500 max-w-md mx-auto space-y-2">
          <Info className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="font-bold text-sm text-slate-700">{lang === "hi" ? "अभी कोई सक्रिय अनुरोध नहीं है" : "No Active Posts Found"}</h4>
          <p className="text-xs text-slate-500">{lang === "hi" ? "नया पोस्ट जोड़ने हेतु ऊपर 'नया पोस्ट जोड़ें' बटन का उपयोग करें।" : "Be the first to request help or offer resources in this category!"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map((post) => (
            <div 
              key={post.id} 
              className={`bg-white border rounded-md p-4 flex flex-col justify-between transition-all duration-150 shadow-sm hover:shadow-md ${
                post.status === "Fulfilled" ? "border-slate-100 opacity-60" : "border-slate-100/80"
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex justify-between items-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-700 uppercase">{post.category}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{post.date}</span>
                </div>

                <div className="space-y-1">
                  <h4 className={`text-sm font-bold text-slate-800 ${post.status === "Fulfilled" ? "line-through" : ""}`}>
                    {post.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{post.description}</p>
                </div>
              </div>

              {/* Action and contact footer */}
              <div className="border-t border-slate-50 pt-3 mt-4 space-y-3">
                <div className="flex justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-700 text-[10px]">
                      {post.postedBy[0]}
                    </div>
                    <span className="font-medium text-slate-700 truncate max-w-[120px]">{post.postedBy}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-slate-600 text-[11px] leading-tight select-all">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{post.location}</span>
                  </div>
                </div>

                <div className="flex gap-2 items-center pt-1.5 justify-between">
                  {post.status === "Fulfilled" ? (
                    <span className="text-xs font-semibold text-[#0f4c81] flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-full">
                      ✓ {lang === "hi" ? "मदद पूरी हो चुकी है" : "Fulfilled"}
                    </span>
                  ) : (
                    <>
                      <a
                        href={`tel:${post.contact}`}
                        className="flex items-center gap-1 text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-200 cursor-pointer text-[11px] font-bold"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {lang === "hi" ? "संपर्क करें" : "Contact"}
                      </a>

                      <button
                        onClick={() => onFulfillPost(post.id)}
                        className="flex items-center gap-1 bg-slate-50 text-[#0f4c81] border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-full text-[11px] font-bold cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {lang === "hi" ? "मदद पूरी की" : "Mark Fulfilled"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
