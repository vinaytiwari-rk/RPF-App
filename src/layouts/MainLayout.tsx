import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, User, Compass, Users, Bell, Activity, Globe, Search, MessageSquare, Bot, X, Send, Mic, Shield, Heart, Share2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AIAssistant from "../components/AIAssistant";
import SosModal from "../components/SosModal";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";

// Simple Helper Lucide Grid icon replacement
function GridIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, user, logout } = useAuth();

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  React.useEffect(() => {
    if (isAdmin && !location.pathname.startsWith("/admin")) {
      navigate("/admin");
    }
  }, [isAdmin, location.pathname, navigate]);

  const { notifications, settings, globalSettings } = useApp();
  const unreadCount = notifications?.filter(n => !n.read).length || 0;
  const [showGuestModal, setShowGuestModal] = useState(false);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'RP Foundation',
          text: 'Check out RP Foundation - Digital NGO Platform!',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert(language === "hi" ? "यह डिवाइस शेयरिंग सपोर्ट नहीं करता" : "Sharing not supported on this device.");
    }
  };
                <button 
                  onClick={() => setIsAiOpen(false)}
                  className="p-1.5 rounded-full bg-black/20 hover:bg-black/45 text-white transition cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
              
              <AIAssistant 
                lang={language}
                userProfile={{
                  name: user?.name ?? "Citizen",
                  phone: user?.phone ?? "",
                  email: user?.email ?? "",
                  age: user?.dob ?? "",
                  gender: user?.gender ?? "",
                  income: "",
                  occupation: "",
                  category: "",
                  division: user?.address ?? "",
                  janSevaId: user?.janSevaCardNo ?? "",
                  role: user?.isVolunteer ? "Active Volunteer" : "Citizen",
                  points: user?.points ?? 0,
                  badge: "None"
                }}
                onNavigateToTab={(tabId) => {
                  setIsAiOpen(false);
                  if (tabId === "jan_seva") navigate("/jan-seva-card");
                  else if (tabId === "blood") navigate("/blood-network");
                  else if (tabId === "volunteer") navigate("/volunteers");
                  else if (tabId === "donate") navigate("/donations");
                  else if (tabId === "complaint") navigate("/grievance");
                  else if (tabId === "education") navigate("/education");
                  else if (tabId === "schemes") navigate("/services");
                  else if (tabId === "women") navigate("/women");
                }}
              />
            </div>
          </div>
        )}

        {/* Virtual Home Indicator Pill Bar (desktop-only) */}
        <div className="w-full bg-white pb-2 flex justify-center items-center z-40 shrink-0">
          <div className="w-28 h-1 bg-slate-300 rounded-full mt-1 hidden sm:block"></div>
        </div>
      </div>

    </div>
  );
}
