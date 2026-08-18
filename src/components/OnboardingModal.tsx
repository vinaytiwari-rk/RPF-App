import React, { useState, useEffect } from "react";
import { ShieldCheck, MapPin, Bell, ChevronRight, Check } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

interface OnboardingModalProps {
  onComplete: () => void;
}

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [locGranted, setLocGranted] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);
  const [requestingLoc, setRequestingLoc] = useState(false);
  const [requestingNotif, setRequestingNotif] = useState(false);

  // Auto-detect existing browser/native permission state on mount
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.checkPermissions().then((result) => {
        if (result.display === "granted") setNotifGranted(true);
      }).catch(() => {});
      
      // Native geolocation permission status check is handled via Geolocation API natively, coarse/fine defaults.
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => setLocGranted(true),
          () => setLocGranted(false),
          { enableHighAccuracy: false, timeout: 2000 }
        );
      }
    } else {
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: "geolocation" as any }).then((res) => {
          if (res.state === "granted") setLocGranted(true);
        }).catch(() => {});

        navigator.permissions.query({ name: "notifications" as any }).then((res) => {
          if (res.state === "granted") setNotifGranted(true);
        }).catch(() => {});
      }
    }
  }, []);

  const handleRequestLocation = () => {
    setRequestingLoc(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocGranted(true);
        setRequestingLoc(false);
      },
      () => {
        setLocGranted(false);
        setRequestingLoc(false);
        alert("Location access was not granted. You can still proceed, but location-dependent services like automatic grievance tagging will be inactive.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleRequestNotifications = () => {
    setRequestingNotif(true);
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.requestPermissions().then((result) => {
        if (result.display === "granted") {
          setNotifGranted(true);
        } else {
          alert("Notification permission was denied. You will not receive real-time push alerts.");
        }
        setRequestingNotif(false);
      }).catch((err) => {
        console.error("Native notification permission request failed:", err);
        setRequestingNotif(false);
      });
    } else {
      if (!("Notification" in window)) {
        alert("This browser does not support notifications.");
        setRequestingNotif(false);
        return;
      }
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setNotifGranted(true);
        } else {
          alert("Notification permission was denied. You will not receive real-time push alerts.");
        }
        setRequestingNotif(false);
      });
    }
  };

  const handleFinish = () => {
    localStorage.setItem("onboarding_completed", "true");
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-scaleUp">
        {/* Header Saffron / Navy Blue Indian styling */}
        <div className="bg-gradient-to-r from-[#000080] via-indigo-900 to-slate-950 p-6 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF9933]/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1 border border-[#D4AF37]">
              <img src="/assets/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="font-display font-black text-sm tracking-widest text-[#FF9933] uppercase leading-none">RP FOUNDATION</h2>
              <p className="text-[10px] text-slate-350 font-black uppercase tracking-widest mt-1">Welcome to Jan Seva Portal</p>
            </div>
          </div>
          
          <h3 className="font-display font-black text-lg mt-6 leading-tight uppercase tracking-wide">
            Setup Your Device Permissions
          </h3>
          <p className="text-[11px] text-slate-300 font-medium leading-relaxed mt-2">
            Activate Location and Notifications to enable automated local welfare support and emergency citizen alerts.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Geolocation Card */}
          <div className="flex gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 transition hover:border-[#000080]/30">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              locGranted ? "bg-green-50 border-green-200 text-green-600" : "bg-indigo-50 border-indigo-150 text-[#000080]"
            }`}>
              {locGranted ? <Check className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
            </div>
            <div className="flex-1 space-y-1 text-left">
              <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">Device Location (जीपीएस लोकेशन)</h4>
              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                Required to locate nearby Jan Seva camps, map regional citizen grievances, and auto-verify your constituency.
              </p>
              {!locGranted ? (
                <button
                  type="button"
                  onClick={handleRequestLocation}
                  disabled={requestingLoc}
                  className="mt-2 text-[9px] font-black uppercase text-indigo-700 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition tracking-wider flex items-center gap-1"
                >
                  {requestingLoc ? "Requesting..." : "Enable GPS Access"}
                  <ChevronRight className="w-3 h-3" />
                </button>
              ) : (
                <span className="inline-block mt-2 text-[9px] font-black uppercase text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-md">
                  Location Connected
                </span>
              )}
            </div>
          </div>

          {/* Notifications Card */}
          <div className="flex gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 transition hover:border-[#000080]/30">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              notifGranted ? "bg-green-50 border-green-200 text-green-600" : "bg-indigo-50 border-indigo-150 text-[#000080]"
            }`}>
              {notifGranted ? <Check className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div className="flex-1 space-y-1 text-left">
              <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">Push Notifications (अलर्ट सूचनाएं)</h4>
              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                Get instant notifications on Jan Seva Card approval status, emergency helpline briefs, and volunteer awards.
              </p>
              {!notifGranted ? (
                <button
                  type="button"
                  onClick={handleRequestNotifications}
                  disabled={requestingNotif}
                  className="mt-2 text-[9px] font-black uppercase text-indigo-700 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition tracking-wider flex items-center gap-1"
                >
                  {requestingNotif ? "Requesting..." : "Allow Notifications"}
                  <ChevronRight className="w-3 h-3" />
                </button>
              ) : (
                <span className="inline-block mt-2 text-[9px] font-black uppercase text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-md">
                  Notifications Enabled
                </span>
              )}
            </div>
          </div>

          {/* Finish Button */}
          <button
            type="button"
            onClick={handleFinish}
            className="w-full mt-4 bg-gradient-to-r from-[#FF9933] to-[#000080] hover:from-[#e08528] hover:to-indigo-900 text-white font-black uppercase text-xs tracking-widest py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer border-t border-[#FF9933]/25"
          >
            <ShieldCheck className="w-4.5 h-4.5" />
            Proceed to Portal / आगे बढ़ें
          </button>
        </div>
      </div>
    </div>
  );
}
