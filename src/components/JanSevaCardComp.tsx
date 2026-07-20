import React, { useState } from "react";
import { UserProfile } from "../types";
import { Award, QrCode, RefreshCw, CheckCircle, Shield, AlertCircle, Camera, Award as BadgeIcon } from "lucide-react";
import QRCode from "react-qr-code";

interface JanSevaCardCompProps {
  lang: "hi" | "en";
  profile: UserProfile;
  onRenew: () => void;
  onUploadImage?: (url: string) => void;
}

export default function JanSevaCardComp({ lang, profile, onRenew }: JanSevaCardCompProps) {
  const [success, setSuccess] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [printBlockedNotice, setPrintBlockedNotice] = useState(false);  const badgeConfig = {
    bg: "from-[#0f4c81] via-[#155e9c] to-[#0f4c81] border-[#FF9933]",
    text: "text-[#FF9933]",
    glow: "shadow-[#0f4c81]/20",
    label: lang === "hi" ? "सक्रिय नागरिक" : "Active Citizen",
  };

  const handleRenewClick = () => {
    setRenewing(true);
    setTimeout(() => {
      onRenew();
      setRenewing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1200);
  };

  // Generate dynamic verification QR link
  const verifyUrl = `https://jansevacard.therpfoundation.org/verify?id=${profile.janSevaId}`;

  return (
    <div className="space-y-6" id="jan-seva-card-section">
      {/* Visual Digital Card Wrapper */}
      <div className="flex flex-col items-center justify-center">
        <p className="text-[10px] text-slate-500 mb-2 font-mono text-center font-bold uppercase tracking-wider">
          {lang === "hi" ? "💳 आपका वर्चुअल सदस्यता कार्ड" : "💳 Your Mobile ID Card"}
        </p>
        
        {/* Card Component */}
        <div className={`relative w-full max-w-[430px] aspect-[1.62/1] rounded-md bg-gradient-to-br ${badgeConfig.bg} border-2 ${badgeConfig.glow} p-5 text-white shadow-md overflow-hidden transition-all duration-300`}>
          {/* Holograph Accent and Swirls */}
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

          {/* Saffron Top Accent */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#FF9933]"></div>

          {/* Card Top Branding */}
          <div className="flex justify-between items-start border-b border-white/20 pb-2.5 mt-1">
            <div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-5 h-5 text-white fill-white/10" />
                <h4 className="font-bold text-sm tracking-wider uppercase font-sans">RP FOUNDATION</h4>
              </div>
              <p className="text-[9px] text-[#FF9933] tracking-widest font-mono font-bold mt-0.5">
                {lang === "hi" ? "जन सेवा कार्ड • MEMBER" : "JAN SEVA CARD • MEMBER"}
              </p>
            </div>
            
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/25 px-2 py-0.5 rounded-sm">
              <span className="text-[10px] font-bold tracking-tight font-mono text-[#FF9933]">{badgeConfig.label}</span>
            </div>
          </div>

          {/* Card Body - Photo, Details, QR */}
          <div className="mt-4 flex items-stretch justify-between gap-3 h-[calc(100%-80px)]">
            {/* User details */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-[8px] text-white/60 font-mono tracking-wider uppercase">{lang === "hi" ? "नाम / Full Name" : "Member Name"}</p>
                <p className="text-sm font-bold tracking-wide truncate uppercase">{profile.name || "Satyendra Kumar"}</p>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-2 my-1">
                <div>
                  <p className="text-[8px] text-white/60 font-mono tracking-wider uppercase">{lang === "hi" ? "सदस्य आईडी" : "ID NUMBER"}</p>
                  <p className="text-[11px] font-bold font-mono text-white">{profile.janSevaId}</p>
                </div>
                <div>
                  <p className="text-[8px] text-white/60 font-mono tracking-wider uppercase">{lang === "hi" ? "मोबाइल नंबर" : "CONTACT"}</p>
                  <p className="text-[11px] font-bold font-mono">{profile.phone || "+91 XXXXX XXXXX"}</p>
                </div>
                <div>
                  <p className="text-[8px] text-white/60 font-mono tracking-wider uppercase">{lang === "hi" ? "जिला / प्रभाग" : "DIVISION"}</p>
                  <p className="text-[10px] font-semibold truncate leading-tight uppercase">{profile.division || "Bhopal, MP"}</p>
                </div>
                
              </div>
              
              <div className="flex items-center gap-1.5 text-[8px] font-bold bg-[#138808]/20 px-2 py-1 rounded-sm text-white border border-[#138808]/50 uppercase tracking-wider w-fit">
                <CheckCircle className="w-2.5 h-2.5 text-[#138808]" />
                <span>{lang === "hi" ? "आजीवन वैध" : "Valid Lifetime • Active"}</span>
              </div>
            </div>

            {/* QR Code section */}
            <div className="w-[85px] flex flex-col items-center justify-center bg-white/10 backdrop-blur-md rounded-md border border-white/20 p-1.5 shrink-0">
              <div className="w-full aspect-square bg-white rounded-sm p-1 flex items-center justify-center">
                <QRCode 
                  value={verifyUrl} 
                  size={150} 
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }} 
                  bgColor="#FFFFFF" 
                  fgColor="#000000" 
                  level="Q"
                />
              </div>
              <p className="text-[7px] text-white/80 font-mono mt-1 select-none flex items-center gap-0.5 font-bold tracking-wider">
                <QrCode className="w-2.5 h-2.5" />
                {lang === "hi" ? "सत्यापन कोड" : "SCAN VERIFY"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action bar */}
      <div className="bg-white rounded-md p-4 border border-slate-200 max-w-lg mx-auto space-y-3.5 shadow-sm">
        <h5 className="font-bold text-xs text-[#0f4c81] flex items-center gap-2 uppercase tracking-wide">
          <Shield className="w-4 h-4 text-[#0f4c81]" />
          {lang === "hi" ? "सुरक्षित एवं सत्यापित सुविधाएं" : "Secure Verification Services"}
        </h5>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleRenewClick}
            disabled={renewing}
            className="flex items-center justify-center gap-2 text-[11px] font-bold bg-[#0f4c81] hover:bg-[#0a365c] text-white py-2 px-4 rounded-sm transition duration-150 cursor-pointer disabled:opacity-60 uppercase tracking-wide"
          >
            {renewing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {lang === "hi" ? "सदस्यता नवीनीकरण" : "Renew Card"}
          </button>
          
          <button
            onClick={() => {
              try {
                window.print();
              } catch (e) {
                console.warn("Print action is blocked in this container/sandbox:", e);
                setPrintBlockedNotice(true);
                setTimeout(() => setPrintBlockedNotice(false), 5000);
              }
            }}
            className="flex items-center justify-center gap-2 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-[#0f4c81] border border-slate-300 py-2 px-4 rounded-sm transition duration-150 cursor-pointer uppercase tracking-wide"
          >
            <QrCode className="w-3.5 h-3.5" />
            {lang === "hi" ? "कार्ड प्रिंट करें (PDF)" : "Print / Export PDF"}
          </button>
        </div>

        {printBlockedNotice && (
          <div className="bg-amber-50 text-amber-900 text-[10px] px-3 py-2 rounded-sm border border-amber-200 flex items-center gap-1.5 animate-fadeIn font-bold">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {lang === "hi" 
                ? "प्रिंटर अनुमति प्रतिबंधित है। कृपया कार्ड को पूर्ण स्क्रीन या नए टैब में खोलकर प्रिंट करें!" 
                : "Print blocked by browser sandbox restriction. Please open in a new tab to print!"}
            </span>
          </div>
        )}

        {success && (
          <div className="bg-[#138808]/10 text-[#138808] text-[10px] px-3 py-2 rounded-sm border border-[#138808]/30 flex items-center gap-1.5 animate-fadeIn font-bold uppercase tracking-wide">
            <CheckCircle className="w-4 h-4 text-[#138808]" />
            <span>{lang === "hi" ? "कार्ड नवीनीकरण सफलतापूर्वक हो गया है!" : "Jan Seva Card updated successfully!"}</span>
          </div>
        )}
      </div>

          </div>
  );
}
