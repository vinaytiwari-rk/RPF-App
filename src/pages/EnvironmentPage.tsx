import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Compass, Flame, Leaf, CheckCircle, Gift } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function EnvironmentPage() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user } = useAuth();
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    setSubmitting(true);
    try {
      const data = {
        campaignName: "Green Sehore Afforestation 2026",
        joinedAsVolunteer: true
      };
      const submission = {
        userId: user?.id || "guest",
        citizenName: user?.name || "Citizen",
        citizenPhone: user?.phone || "",
        serviceName: "Environment Support",
        submissionData: data,
        status: "pending",
        timestamp: new Date().toISOString(),
      };
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission)
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Environment registration error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-5 space-y-5 animate-fadeIn pb-24">
      {/* Overview */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl p-5 shadow-sm space-y-2">
        <h3 className="font-display font-extrabold text-base text-green-900 flex items-center gap-1.5">
          <Leaf className="w-5 h-5 text-green-600 fill-green-600" />
          {lang === "hi" ? "पर्यावरण एवं जल संरक्षण" : "Environment & Water Conservation"}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          {lang === "hi" 
            ? "स्वच्छ जल और हरित भारत के लिए सामूहिक प्रयास। हमारे वृक्षारोपण और तालाब पुनरुद्धार अभियानों से जुड़कर स्वयंसेवक के रूप में कार्य करें।" 
            : "Collective action for clean water and green communities. Participate in our afforestation, lake cleanups, and waste recycling campaigns."}
        </p>
      </div>

      {/* Campaign Details Card */}
      <div className="glass-card bg-white/95 p-5 border-gold-soft shadow-gold-premium space-y-4">
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div>
            <h4 className="font-display font-bold text-sm text-[#0B1E3F]">{lang === "hi" ? "हरित सीहोर वृक्षारोपण २०२६" : "Green Sehore Afforestation 2026"}</h4>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Active Campaign</p>
          </div>
          <span className="text-[9px] font-bold text-green-700 bg-green-100/50 border border-green-200 px-2 py-0.5 rounded-full">+50 Points</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {lang === "hi"
            ? "सीहोर जिले के १० विभिन्न ग्रामों में ५००० छायादार वृक्ष लगाने का लक्ष्य। हम जल संचयन के लिए छोटे गड्ढे भी बना रहे हैं।"
            : "Targeting 5,000 shade-giving local saplings across 10 rural wards of Sehore. We are also building rain-water harvesting structures."}
        </p>

        <div className="space-y-2 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
          <p>📍 Location: Sehore Block A & B</p>
          <p>📅 Schedule: Every Sunday, 7:00 AM</p>
        </div>

        {success ? (
          <div className="bg-green-50 text-green-700 border border-green-150 p-3 rounded-lg text-xs font-bold flex items-center gap-1.5">
            <CheckCircle className="w-4.5 h-4.5" />
            <span>{lang === "hi" ? "सफलतापूर्वक शामिल हुए!" : "Successfully Joined Campaign!"}</span>
          </div>
        ) : (
          <button 
            onClick={handleRegister}
            disabled={submitting}
            className="w-full bg-[#138808] hover:bg-green-700 text-white font-bold py-3 rounded-lg text-xs shadow-md transition disabled:opacity-50"
          >
            {submitting ? "Joining..." : (lang === "hi" ? "अभियान में शामिल हों" : "Join Campaign as Volunteer")}
          </button>
        )}
      </div>

    </div>
  );
}
