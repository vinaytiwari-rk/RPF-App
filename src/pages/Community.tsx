import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Sparkles, Send, Activity, Search } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

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
  text: string;
  time?: string;
}

interface Volunteer {
  id: string;
  name: string;
  role?: string;
  city?: string;
  skills?: string[] | string;
}

type TabType = "stories" | "volunteers" | "chat";

export default function Community() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user } = useAuth();
  const isHi = lang === "hi";

  const [activeTab, setActiveTab] = useState<TabType>("stories");
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [volunteerCityFilter, setVolunteerCityFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "c1", authorName: "Rohit Pandit", text: "Welcome to Samahit Community! Together we serve.", time: "10:30 AM" },
    { id: "c2", authorName: "Sunita Verma", text: "Bhopal Pink E-Rickshaw drive was a great success today!", time: "11:15 AM" }
  ]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    fetchSuccessStories();
    fetchVolunteers();
  }, []);

  const fetchSuccessStories = async () => {
    try {
      const res = await axios.get("/api/success-stories");
      if (res.data.success && Array.isArray(res.data.data)) {
        setStories(res.data.data);
      }
    } catch {
      setStories([
        {
          id: "s1",
          title: isHi ? "पिंक ई-रिक्शा योजना: महिलाओं को रोजगार" : "Pink E-Rickshaw Empowerment Drive",
          content: isHi ? "भोपाल में कई महिलाओं को आत्मनिर्भर जीवन और ग्रीन मोबिलिटी से जोड़ा गया।" : "Empowering women with economic independence and eco-friendly urban mobility ownership.",
          imageUrl: "/assets/water_pump_camp.png",
          createdAt: new Date().toISOString()
        },
        {
          id: "s2",
          title: isHi ? "निःशुल्क स्वास्थ्य एवं ब्लड डोनेशन कैंप" : "Mega Health Camp & Blood Donation",
          content: isHi ? "1200 से अधिक नागरिकों को निःशुल्क दवाइयां एवं विशेषज्ञ चिकित्सा परामर्श दिया गया।" : "Over 1,200 citizens benefitted from specialized health checkups and free medicines.",
          imageUrl: "/assets/mega_camp_banner.png",
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteers = async (city?: string) => {
    try {
      const res = await axios.get("/api/public/volunteers", { params: city ? { city } : {} });
      if (res.data.success && Array.isArray(res.data.data)) {
        setVolunteers(res.data.data);
      }
    } catch {
      setVolunteers([
        { id: "v1", name: "Ramesh Sharma", role: "Healthcare Coordinator", city: "Bhopal", skills: "First Aid, Logistics" },
        { id: "v2", name: "Pooja Verma", role: "Women Empowerment Lead", city: "Bhopal", skills: "Counseling, Training" },
        { id: "v3", name: "Amit Kumar", role: "Emergency Relief Volunteer", city: "Indore", skills: "Disaster Relief, Transport" }
      ]);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      authorName: user?.name || (isHi ? "नागरिक स्वयंसेवक" : "Citizen Volunteer"),
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput("");
  };

  return (
    <main className="min-h-full bg-transparent pb-16 text-[#14213D]">
      <div className="mx-auto max-w-3xl px-4 py-4 space-y-5 sm:px-6">
        
        {/* Page Header */}
        <section className="rounded-[28px] border border-amber-200/80 bg-gradient-to-br from-amber-500/15 via-white to-emerald-500/10 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center gap-2 text-[#D97706]">
            <Activity className="h-5 w-5" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest">
              RP Foundation Community Hub
            </span>
          </div>

          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#14213D] tracking-tight leading-snug">
            {isHi ? "सेवा गतिविधियां एवं जन सहभागिता" : "Ground Activities & Community Stories"}
          </h1>

          <p className="mt-2.5 text-xs sm:text-[13.5px] leading-relaxed text-slate-600 font-medium">
            {isHi
              ? "ज़मीनी स्तर पर आयोजित स्वास्थ्य शिविरों, सामाजिक अभियानों की कहानियाँ देखें और स्वयंसेवकों से जुड़ें।"
              : "Discover verified impact stories, ground health camps, and connect with volunteers across Madhya Pradesh."}
          </p>
        </section>

        {/* Clean Segmented Tab Bar */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/60 border border-slate-200/80 text-xs font-bold">
          <button
            onClick={() => setActiveTab("stories")}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              activeTab === "stories"
                ? "bg-[#14213D] text-white shadow-xs"
                : "text-slate-600 hover:text-[#14213D]"
            }`}
          >
            {isHi ? "सफलता की गाथाएं" : "Impact Stories"}
          </button>
          <button
            onClick={() => setActiveTab("volunteers")}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              activeTab === "volunteers"
                ? "bg-[#14213D] text-white shadow-xs"
                : "text-slate-600 hover:text-[#14213D]"
            }`}
          >
            {isHi ? "स्वयंसेवक नेटवर्क" : "Volunteer Network"}
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              activeTab === "chat"
                ? "bg-[#14213D] text-white shadow-xs"
                : "text-slate-600 hover:text-[#14213D]"
            }`}
          >
            {isHi ? "जन संवाद" : "Community Chat"}
          </button>
        </div>

        {/* Tab 1: Impact Stories */}
        {activeTab === "stories" && (
          <div className="space-y-4">
            {stories.map((story) => (
              <article
                key={story.id}
                className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-2xs space-y-3"
              >
                {story.imageUrl && (
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    className="h-44 sm:h-52 w-full object-cover rounded-2xl bg-slate-100"
                  />
                )}
                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-[#D97706]">
                    <Sparkles className="h-3 w-3" /> Ground Seva
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#14213D]">
                    {story.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] leading-relaxed text-slate-600 font-medium">
                    {story.content}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Tab 2: Volunteers Directory */}
        {activeTab === "volunteers" && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={isHi ? "शहर या क्षेत्र से खोजें..." : "Filter by city or area..."}
                value={volunteerCityFilter}
                onChange={(e) => {
                  setVolunteerCityFilter(e.target.value);
                  fetchVolunteers(e.target.value);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-bold text-[#14213D] focus:border-[#D97706] focus:outline-none shadow-2xs"
              />
            </div>

            <div className="space-y-2.5">
              {volunteers.map((vol) => (
                <div
                  key={vol.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#14213D] text-amber-400 font-bold text-sm">
                      {vol.name[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#14213D]">{vol.name}</h4>
                      <p className="text-[10.5px] text-slate-500 font-medium mt-0.5">
                        {vol.role} • {vol.city || "Madhya Pradesh"}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#167C5A] border border-emerald-200 text-[10px] font-bold">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Community Live Discussions */}
        {activeTab === "chat" && (
          <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="rounded-2xl bg-slate-50 p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="font-extrabold text-[#14213D]">{msg.authorName}</span>
                    <span className="text-slate-400 font-medium">{msg.time}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 pt-2 border-t border-slate-100"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={isHi ? "अपनी बात या संदेश लिखें..." : "Share a thought or message..."}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-[#14213D] focus:border-[#D97706] focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#D97706] hover:bg-[#C2410C] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all flex items-center gap-1.5"
              >
                <Send className="h-4 w-4" />
                {isHi ? "भेजें" : "Send"}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
