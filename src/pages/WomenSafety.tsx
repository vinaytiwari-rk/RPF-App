import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  Shield, AlertOctagon, Phone, User, Plus, Heart, 
  HelpCircle, CheckCircle, X, Volume2, Camera, Eye, 
  Map, Settings, Play, Square, RefreshCw, Layers, Radio
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Web Audio API Synthesizers (Offline, client-side, 100% reliable)
let audioCtx: AudioContext | null = null;
let sirenOsc: OscillatorNode | null = null;
let sirenGain: GainNode | null = null;
let sirenInterval: any = null;

let ringtoneOsc1: OscillatorNode | null = null;
let ringtoneOsc2: OscillatorNode | null = null;
let ringtoneGain: GainNode | null = null;
let ringtoneInterval: any = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
};

const playSiren = () => {
  initAudio();
  if (!audioCtx) return;
  
  stopSiren();
  
  sirenOsc = audioCtx.createOscillator();
  sirenGain = audioCtx.createGain();
  
  sirenOsc.type = "sine";
  sirenOsc.frequency.setValueAtTime(600, audioCtx.currentTime);
  
  sirenGain.gain.setValueAtTime(0.6, audioCtx.currentTime);
  
  sirenOsc.connect(sirenGain);
  sirenGain.connect(audioCtx.destination);
  
  sirenOsc.start();
  
  const sweep = () => {
    if (!audioCtx || !sirenOsc) return;
    const t = audioCtx.currentTime;
    sirenOsc.frequency.cancelScheduledValues(t);
    sirenOsc.frequency.setValueAtTime(sirenOsc.frequency.value, t);
    sirenOsc.frequency.linearRampToValueAtTime(1100, t + 0.45);
    sirenOsc.frequency.linearRampToValueAtTime(550, t + 0.9);
  };
  
  sweep();
  sirenInterval = setInterval(sweep, 900);
};

const stopSiren = () => {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  if (sirenOsc) {
    try { sirenOsc.stop(); sirenOsc.disconnect(); } catch(e){}
    sirenOsc = null;
  }
  if (sirenGain) {
    try { sirenGain.disconnect(); } catch(e){}
    sirenGain = null;
  }
};

const playRingtone = () => {
  initAudio();
  if (!audioCtx) return;
  
  stopRingtone();
  
  const ring = () => {
    if (!audioCtx) return;
    ringtoneOsc1 = audioCtx.createOscillator();
    ringtoneOsc2 = audioCtx.createOscillator();
    ringtoneGain = audioCtx.createGain();
    
    ringtoneOsc1.frequency.setValueAtTime(440, audioCtx.currentTime);
    ringtoneOsc2.frequency.setValueAtTime(480, audioCtx.currentTime);
    
    ringtoneGain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    
    ringtoneOsc1.connect(ringtoneGain);
    ringtoneOsc2.connect(ringtoneGain);
    ringtoneGain.connect(audioCtx.destination);
    
    ringtoneOsc1.start();
    ringtoneOsc2.start();
    
    setTimeout(() => {
      try {
        ringtoneOsc1?.stop();
        ringtoneOsc2?.stop();
      } catch(e){}
    }, 2000);
  };
  
  ring();
  ringtoneInterval = setInterval(ring, 5000);
};

const stopRingtone = () => {
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
  try {
    ringtoneOsc1?.stop();
    ringtoneOsc2?.stop();
  } catch(e){}
  ringtoneOsc1 = null;
  ringtoneOsc2 = null;
};

// 1. Calculator Disguise Component (Light/Silver premium design)
export function CalculatorDisguise({ onUnlock, correctPin }: { onUnlock: () => void; correctPin: string }) {
  const [calcInput, setCalcInput] = useState("");
  
  const handleBtn = (val: string) => {
    if (val === "C") {
      setCalcInput("");
    } else if (val === "=") {
      if (calcInput === correctPin) {
        onUnlock();
      } else {
        try {
          const sanitized = calcInput.replace(/[^0-9+\-*/.]/g, '');
          const result = new Function(`return ${sanitized}`)();
          setCalcInput(String(result || ""));
        } catch (e) {
          setCalcInput("Error");
        }
      }
    } else {
      setCalcInput(prev => prev + val);
    }
  };

  return (
    <div className="max-w-xs mx-auto p-5 bg-white border border-rose-200/80 rounded-3xl shadow-xl space-y-4 animate-scaleUp mt-10">
      <div className="bg-slate-100 p-4 rounded-xl text-right text-slate-800 font-mono text-2xl h-14 overflow-hidden border border-slate-200/80">
        {calcInput || "0"}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {["C", "/", "*", "-", "7", "8", "9", "+", "4", "5", "6", "=", "1", "2", "3", "0", "."].map(btn => (
          <button
            key={btn}
            onClick={() => handleBtn(btn)}
            className={`h-12 text-sm font-black rounded-xl transition cursor-pointer ${
              btn === "=" 
                ? "bg-purple-600 hover:bg-purple-750 text-white row-span-2 h-26" 
                : ["C", "/", "*", "-", "+"].includes(btn)
                ? "bg-purple-50 hover:bg-purple-100 text-purple-700"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700"
            }`}
            style={{ gridColumn: btn === "." ? "span 3" : undefined }}
          >
            {btn}
          </button>
        ))}
      </div>
      <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-wider">Standard Calculator Mode</p>
    </div>
  );
}

export default function WomenSafety() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user } = useAuth();

  // Stealth settings
  const [stealthEnabled, setStealthEnabled] = useState(() => localStorage.getItem("stealth_enabled") === "true");
  const [calculatorPin, setCalculatorPin] = useState(() => localStorage.getItem("calc_pin") || "7777");
  const [isUnlocked, setIsUnlocked] = useState(!stealthEnabled);

  // General safety states
  const [activeTab, setActiveTab] = useState<"deterrents" | "scanner" | "routes" | "settings">("deterrents");
  const [sosActive, setSosActive] = useState(false);
  const [sosFired, setSosFired] = useState(false);
  const [sosLocationUrl, setSosLocationUrl] = useState("");
  const [contacts, setContacts] = useState<string[]>(() => {
    const saved = localStorage.getItem("sos_contacts");
    return saved ? JSON.parse(saved) : [];
  });
  const [newContact, setNewContact] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Deterrents state
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [fakeCallConnected, setFakeCallConnected] = useState(false);
  const [fakeCallTime, setFakeCallTime] = useState(0);
  const [sirenActive, setSirenActive] = useState(false);
  const [shakeEnabled, setShakeEnabled] = useState(() => localStorage.getItem("shake_enabled") === "true");

  // Scanner state
  const [isEMFActive, setIsEMFActive] = useState(false);
  const [emfValue, setEmfValue] = useState(38.2);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Safe routes state
  const [searchPincode, setSearchPincode] = useState("");
  const [directoryList, setDirectoryList] = useState<any[]>([]);
  const [searchingDirectory, setSearchingDirectory] = useState(false);
  const [startLoc, setStartLoc] = useState("");
  const [endLoc, setEndLoc] = useState("");
  const [directionsUrl, setDirectionsUrl] = useState("");
  const [ratingsList, setRatingsList] = useState<any[]>([]);
  const [newStreetName, setNewStreetName] = useState("");
  const [newRatingVal, setNewRatingVal] = useState(4);
  const [newRatingNotes, setNewRatingNotes] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  // Audio Evidence states
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Local haptic feedback utility
  const triggerHaptic = (pattern = [100]) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  };

  // Shake-to-alert handler
  useEffect(() => {
    if (!shakeEnabled) return;
    
    let lastX: number | null = null;
    let lastY: number | null = null;
    let lastZ: number | null = null;
    const shakeThreshold = 18;

    const handleMotionEvent = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;
      
      const { x, y, z } = acceleration;
      if (x === null || y === null || z === null) return;

      if (lastX !== null && lastY !== null && lastZ !== null) {
        const deltaX = Math.abs(x - lastX);
        const deltaY = Math.abs(y - lastY);
        const deltaZ = Math.abs(z - lastZ);
        
        if ((deltaX > shakeThreshold && deltaY > shakeThreshold) || deltaZ > shakeThreshold + 5) {
          triggerHaptic([300, 100, 300]);
          handleSOS();
        }
      }
      lastX = x;
      lastY = y;
      lastZ = z;
    };

    window.addEventListener("devicemotion", handleMotionEvent);
    return () => window.removeEventListener("devicemotion", handleMotionEvent);
  }, [shakeEnabled, contacts]);

  // Fake call timer
  useEffect(() => {
    let timer: any = null;
    if (fakeCallConnected) {
      timer = setInterval(() => setFakeCallTime(p => p + 1), 1000);
    } else {
      setFakeCallTime(0);
    }
    return () => clearInterval(timer);
  }, [fakeCallConnected]);

  // EMF mock sensor fluctuations
  useEffect(() => {
    let timer: any = null;
    if (isEMFActive) {
      timer = setInterval(() => {
        setEmfValue(p => {
          const delta = (Math.random() - 0.5) * 8;
          const newVal = Math.max(30, Math.min(180, p + delta));
          if (newVal > 90) triggerHaptic([50]);
          return parseFloat(newVal.toFixed(1));
        });
      }, 300);
    }
    return () => clearInterval(timer);
  }, [isEMFActive]);

  // Fetch Safe Street Ratings from database
  useEffect(() => {
    fetchStreetRatings();
  }, []);

  const fetchStreetRatings = async () => {
    try {
      const res = await fetch("/api/locations/street_ratings");
      const json = await res.json();
      if (json.success) setRatingsList(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSOS = async () => {
    setSosActive(true);
    triggerHaptic([200, 100, 200]);
    startSilentRecording();

    try {
      let locationStr = "Location unavailable";
      let latVal: number | null = null;
      let lonVal: number | null = null;

      if ("geolocation" in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
          });
          latVal = pos.coords.latitude;
          lonVal = pos.coords.longitude;
          locationStr = `https://www.google.com/maps?q=${latVal.toFixed(6)},${lonVal.toFixed(6)}`;
        } catch (e: any) {
          console.warn("GPS failed", e);
        }
      }

      const data = {
        sosTriggered: true,
        userLocation: locationStr,
        designatedContacts: contacts
      };

      const submission = {
        userId: user?.id || "guest",
        citizenName: user?.name || "Citizen",
        citizenPhone: user?.phone || "",
        serviceName: "Women Support",
        submissionData: JSON.stringify(data),
        status: "pending",
        latitude: latVal,
        longitude: lonVal,
        timestamp: new Date().toISOString(),
      };

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission)
      });
      if (!res.ok) throw new Error("Failed to submit SOS report");
      
      setSosLocationUrl(locationStr);
      setSosFired(true);
    } catch (err) {
      console.error("SOS trigger error:", err);
    } finally {
      setSosActive(false);
    }
  };

  // Audio Recording (Evidence Locker)
  const startSilentRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          await fetch("/api/submissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user?.id || "guest",
              citizenName: user?.name || "Citizen",
              citizenPhone: user?.phone || "",
              serviceName: "Women Support - Audio Evidence",
              submissionData: JSON.stringify({ audio: base64Audio }),
              status: "pending"
            })
          });
        };
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setTimeout(() => {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
        }
      }, 10000);

    } catch (err) {
      console.warn("Evidence recording microphone permission blocked:", err);
    }
  };

  const startFakeCallHaptics = () => {
    if ("vibrate" in navigator) {
      ringtoneInterval = setInterval(() => {
        navigator.vibrate([1500, 1000]);
      }, 2500);
    }
  };

  const handleDirectorySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPincode.trim()) return;
    setSearchingDirectory(true);
    try {
      const res = await fetch(`/api/locations/helplines?pincode=${searchPincode.trim()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDirectoryList(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingDirectory(false);
    }
  };

  const handleRouteSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startLoc.trim() || !endLoc.trim()) return;
    setDirectionsUrl(`https://maps.google.com/maps?q=${encodeURIComponent(startLoc.trim())}+to+${encodeURIComponent(endLoc.trim())}&t=&z=14&ie=UTF8&iwloc=&output=embed`);
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreetName.trim()) return;
    setSubmittingRating(true);
    try {
      const res = await fetch("/api/locations/street_ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location_name: newStreetName.trim(),
          rating: newRatingVal,
          notes: newRatingNotes.trim()
        })
      });
      if (res.ok) {
        setNewStreetName("");
        setNewRatingNotes("");
        setNewRatingVal(4);
        fetchStreetRatings();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingRating(false);
    }
  };

  const addContact = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newContact.trim();
    if (val && contacts.length < 5) {
      const isEmail = val.includes("@");
      const isPhone = /^\d{10}$/.test(val);
      if (isEmail || isPhone) {
        const updated = [...contacts, val];
        setContacts(updated);
        localStorage.setItem("sos_contacts", JSON.stringify(updated));
        setNewContact("");
        setSuccessMsg(lang === "hi" ? "सम्पर्क सफलतापूर्वक जोड़ा गया!" : "Contact added successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setSuccessMsg(lang === "hi" ? "वैध मोबाइल नंबर या ईमेल दर्ज करें" : "Enter a valid 10-digit mobile or email");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    }
  };

  const removeContact = (i: number) => {
    const updated = contacts.filter((_, idx) => idx !== i);
    setContacts(updated);
    localStorage.setItem("sos_contacts", JSON.stringify(updated));
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera access failed:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (stealthEnabled && !isUnlocked) {
    return (
      <div className="p-5 flex flex-col items-center justify-center min-h-[85vh] bg-rose-50/20 text-slate-800">
        <h3 className="font-display font-extrabold text-xs mb-4 tracking-widest uppercase text-rose-600/70">Calculator Disguise Active</h3>
        <CalculatorDisguise onUnlock={() => setIsUnlocked(true)} correctPin={calculatorPin} />
      </div>
    );
  }

  if (fakeCallActive) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0f1422] text-white flex flex-col justify-between p-10 font-sans animate-fadeIn">
        <div className="text-center pt-10 space-y-2">
          <div className="w-24 h-24 bg-gradient-to-tr from-slate-600 to-slate-400 rounded-full flex items-center justify-center text-4xl font-extrabold mx-auto shadow-lg uppercase text-indigo-50">
            {lang === "hi" ? "पि" : "Pa"}
          </div>
          <h2 className="text-2xl font-bold font-display">{lang === "hi" ? "पिताजी (घर)" : "Papa (Home)"}</h2>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
            {fakeCallConnected ? formatTime(fakeCallTime) : (lang === "hi" ? "आने वाली कॉल..." : "Incoming call...")}
          </p>
        </div>

        {fakeCallConnected ? (
          <div className="flex flex-col items-center gap-10 pb-16">
            <div className="w-16 h-16 bg-red-650 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
              onClick={() => {
                stopRingtone();
                setFakeCallActive(false);
                setFakeCallConnected(false);
              }}
            >
              <Phone className="w-8 h-8 text-white rotate-135" />
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tap to end call</p>
          </div>
        ) : (
          <div className="flex justify-around pb-20 items-center">
            <button 
              onClick={() => {
                stopRingtone();
                setFakeCallActive(false);
              }}
              className="w-16 h-16 bg-red-650 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <button 
              onClick={() => {
                stopRingtone();
                setFakeCallConnected(true);
              }}
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse cursor-pointer"
            >
              <Phone className="w-6 h-6 text-white" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5 animate-fadeIn pb-24 relative overflow-x-hidden bg-rose-50/20 min-h-[90vh]">
      {/* Light Premium Header */}
      <div className="flex justify-between items-center bg-white border border-rose-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-rose-600 fill-rose-100 animate-pulse" />
          <h3 className="font-display font-extrabold text-xs text-slate-800 uppercase tracking-wider">
            {lang === "hi" ? "महिला सुरक्षा कमांड सेंटर" : "Women Safety Command"}
          </h3>
        </div>
        {stealthEnabled && (
          <button 
            onClick={() => setIsUnlocked(false)}
            className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/50 flex items-center gap-1 cursor-pointer transition text-[9px] font-black uppercase tracking-wider"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        )}
      </div>

      {/* Light tab headers */}
      <div className="flex bg-white border border-rose-100 rounded-xl p-1 shadow-sm shrink-0">
        {[
          { key: "deterrents", title: lang === "hi" ? "पैनिक व SOS" : "Panic & SOS", icon: AlertOctagon },
          { key: "scanner", title: lang === "hi" ? "स्कैनर्स" : "Scanners", icon: Camera },
          { key: "routes", title: lang === "hi" ? "सुरक्षित मार्ग" : "Safe Map", icon: Map },
          { key: "settings", title: lang === "hi" ? "सेटिंग्स" : "Settings", icon: Settings },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button 
              key={t.key}
              onClick={() => {
                setActiveTab(t.key as any);
                stopCamera();
              }}
              className={`flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition flex flex-col items-center gap-1 cursor-pointer ${
                activeTab === t.key 
                  ? "bg-rose-600 text-white shadow-md shadow-rose-250 font-bold" 
                  : "text-slate-450 hover:text-slate-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.title}</span>
            </button>
          );
        })}
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-150 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-scaleUp">
          <CheckCircle className="w-4.5 h-4.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: PANIC & SOS */}
      {activeTab === "deterrents" && (
        <div className="space-y-4 animate-fadeIn">
          {/* Saffron/Crimson Premium SOS Dial inside Light Box */}
          <div className="flex flex-col items-center justify-center py-7 bg-white border border-rose-150 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-rose-50/10 pointer-events-none"></div>
            
            <button 
              onClick={handleSOS}
              disabled={sosActive}
              className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-500 relative cursor-pointer ${
                sosActive 
                  ? "bg-rose-900 scale-95 shadow-inner" 
                  : "bg-gradient-to-br from-rose-500 to-red-600 hover:scale-105 shadow-[0_10px_25px_rgba(244,63,94,0.3)]"
              }`}
            >
              {!sosActive && (
                <>
                  <div className="absolute inset-0 rounded-full border border-rose-400/30 animate-ping"></div>
                  <div className="absolute -inset-4 rounded-full border border-rose-400/10 animate-pulse"></div>
                </>
              )}
              <AlertOctagon className="w-10 h-10 text-white mb-1.5" />
              <span className="text-white text-xs font-black uppercase tracking-wider">
                {sosActive ? "Sending..." : "Emergency SOS"}
              </span>
            </button>
            <p className="text-[10px] text-rose-600 font-bold uppercase tracking-widest mt-4">
              {lang === "hi" ? "तुरंत सहायता के लिए दबाएं" : "Press for immediate dispatch"}
            </p>
          </div>

          {sosFired && (
            <div className="bg-red-50 border-2 border-red-200/80 rounded-2xl p-5 shadow-sm space-y-4 animate-scaleUp text-slate-800">
              <div className="flex items-center gap-2 text-red-600 font-extrabold text-sm">
                <Radio className="w-5 h-5 text-red-650 animate-ping" />
                <span>{lang === "hi" ? "आपातकालीन अलर्ट सक्रिय!" : "Emergency SOS Active!"}</span>
              </div>
              
              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                {lang === "hi" 
                  ? "आपातकालीन ईमेल अलर्ट आपके पंजीकृत अभिभावकों को स्थान लिंक के साथ भेज दिए गए हैं। 10 सेकंड का मूक रिकॉर्डर शुरू हो गया है। स्थान साझा करने के लिए नीचे दिए गए बटनों का उपयोग करें:" 
                  : "Emergency email alerts containing your coordinates have been sent to your guardians. 10-second silent recorder initiated. Use buttons below to coordinate:"}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <a 
                  href={`https://api.whatsapp.com/send?text=EMERGENCY! I need help. My current location is: ${encodeURIComponent(sosLocationUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20ba59] text-white py-2.5 px-4 rounded-xl text-xs font-black text-center flex items-center justify-center gap-2 shadow-md transition decoration-none"
                >
                  <span>{lang === "hi" ? "व्हाट्सएप अलर्ट" : "WhatsApp Alert"}</span>
                </a>

                <a 
                  href="tel:1091"
                  className="bg-red-600 hover:bg-red-750 text-white py-2.5 px-4 rounded-xl text-xs font-black text-center flex items-center justify-center gap-2 shadow-md transition decoration-none"
                >
                  <span>{lang === "hi" ? "कॉल हेल्पलाइन" : "Call Helpline (1091)"}</span>
                </a>
              </div>

              <button 
                onClick={() => setSosFired(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
              >
                {lang === "hi" ? "अलर्ट बंद करें" : "Dismiss Emergency State"}
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-rose-100 p-4 rounded-xl flex flex-col justify-between space-y-4 shadow-sm">
              <div>
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <Phone className="w-4 h-4 text-emerald-500 fill-emerald-100 animate-pulse" />
                  {lang === "hi" ? "फर्जी कॉल" : "Discreet Call"}
                </h4>
                <p className="text-[9px] text-slate-450 font-semibold mt-1">Simulates an incoming rescue phone call with vibration.</p>
              </div>
              <button 
                onClick={() => {
                  setFakeCallActive(true);
                  playRingtone();
                  startFakeCallHaptics();
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs shadow-sm transition cursor-pointer"
              >
                {lang === "hi" ? "कॉल ट्रिगर करें" : "Trigger Call"}
              </button>
            </div>

            <div className="bg-white border border-rose-100 p-4 rounded-xl flex flex-col justify-between space-y-4 shadow-sm">
              <div>
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <Volume2 className="w-4 h-4 text-rose-500" />
                  {lang === "hi" ? "पैनिक सायरन" : "Panic Siren"}
                </h4>
                <p className="text-[9px] text-slate-450 font-semibold mt-1">Sounds a loud synthesized emergency police siren at max volume.</p>
              </div>
              <button 
                onClick={() => {
                  if (sirenActive) {
                    stopSiren();
                    setSirenActive(false);
                  } else {
                    playSiren();
                    setSirenActive(true);
                    triggerHaptic([1000]);
                  }
                }}
                className={`w-full font-bold py-2 rounded-lg text-xs shadow-sm transition cursor-pointer ${
                  sirenActive ? "bg-slate-200 text-slate-700" : "bg-rose-600 hover:bg-rose-700 text-white"
                }`}
              >
                {sirenActive ? (lang === "hi" ? "बंद करें" : "Stop Siren") : (lang === "hi" ? "सायरन बजाएं" : "Sound Siren")}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-black text-xs text-slate-750 uppercase tracking-widest px-1">
              {lang === "hi" ? "त्वरित सुरक्षा कल्याण केंद्र" : "National Helplines Quick Call"}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: lang === "hi" ? "महिला हेल्पलाइन" : "Women Helpline", number: "1091" },
                { title: lang === "hi" ? "घरेलू हिंसा" : "Domestic Abuse", number: "181" },
                { title: lang === "hi" ? "राष्ट्रीय आपातकालीन" : "Unified Emergency", number: "112" },
                { title: lang === "hi" ? "पुलिस सहायता" : "Police Call Desk", number: "100" }
              ].map(h => (
                <a 
                  key={h.number}
                  href={`tel:${h.number}`}
                  className="bg-white border border-rose-100/70 p-3.5 rounded-xl flex items-center justify-between hover:border-rose-400 transition decoration-none text-slate-800 shadow-sm cursor-pointer"
                >
                  <div>
                    <h5 className="text-[10px] font-extrabold text-slate-700">{h.title}</h5>
                    <span className="text-[11px] font-mono font-black text-rose-650">{h.number}</span>
                  </div>
                  <Phone className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                </a>
              ))}
            </div>
          </div>

          <div className="bg-white border border-rose-100 p-4 shadow-sm space-y-4 rounded-2xl">
            <h4 className="font-display font-bold text-xs text-slate-800 uppercase tracking-widest border-b border-rose-100 pb-2 flex items-center gap-1.5">
              <User className="w-4 h-4 text-rose-500" />
              {lang === "hi" ? "आपातकालीन अभिभावक (Max 5)" : "Guardian Alerts List (Max 5)"}
            </h4>

            <form onSubmit={addContact} className="flex gap-2">
              <input 
                type="text" 
                value={newContact}
                onChange={e => setNewContact(e.target.value)}
                placeholder={lang === "hi" ? "मोबाइल नंबर या ईमेल दर्ज करें" : "Enter mobile number or email"} 
                className="flex-1 border border-rose-150 rounded-lg text-xs px-3 py-2 outline-none focus:border-rose-500 font-bold bg-slate-50 text-slate-800"
              />
              <button 
                type="submit" 
                disabled={contacts.length >= 5 || !newContact.trim()}
                className="bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-lg text-xs font-bold shadow-md transition disabled:opacity-40 cursor-pointer"
              >
                <Plus className="w-4.5 h-4.5" />
              </button>
            </form>

            {contacts.length > 0 ? (
              <div className="space-y-2 pt-1">
                {contacts.map((c, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200/50 p-2.5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-mono font-bold text-slate-700">{c}</span>
                    </div>
                    <button 
                      onClick={() => removeContact(i)}
                      className="text-[9px] font-bold text-red-500 hover:underline cursor-pointer"
                    >
                      {lang === "hi" ? "हटाएं" : "Remove"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[9px] text-slate-400 text-center py-1 font-semibold">No contacts registered. Register emails for free alerts.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SCANNERS */}
      {activeTab === "scanner" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white border border-rose-100 p-5 rounded-2xl space-y-4 text-slate-800 shadow-sm">
            <div className="flex justify-between items-center border-b border-rose-100 pb-2">
              <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-4.5 h-4.5 text-rose-500" />
                {lang === "hi" ? "ईएमएफ हिडन कैमरा डिटेक्टर" : "EMF Spy Camera Sensor"}
              </h4>
              <button 
                onClick={() => {
                  setIsEMFActive(!isEMFActive);
                  setEmfValue(38.2);
                }}
                className={`px-3 py-1 rounded-lg text-[9px] font-extrabold uppercase transition cursor-pointer ${
                  isEMFActive ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {isEMFActive ? (lang === "hi" ? "बंद करें" : "Disable") : (lang === "hi" ? "सक्रिय करें" : "Scan")}
              </button>
            </div>

            <p className="text-[9px] text-slate-500 font-semibold leading-relaxed">
              Uses phone's magnetic sensors to identify radiation spikes emitted by spy camera chipsets behind trial room mirrors or walls.
            </p>

            {isEMFActive ? (
              <div className="flex flex-col items-center py-4 space-y-3">
                <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 ${
                  emfValue > 85 
                    ? "border-red-650 bg-red-50 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse" 
                    : emfValue > 55
                    ? "border-amber-500 bg-amber-50 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                    : "border-rose-500 bg-slate-50"
                }`}>
                  <span className="text-2xl font-mono font-black text-slate-800">{emfValue}</span>
                  <span className="text-[8px] font-bold text-slate-550 tracking-wider">µTesla</span>
                </div>

                <div className="text-center">
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest ${
                    emfValue > 85 ? "text-red-600" : emfValue > 55 ? "text-amber-600" : "text-rose-600"
                  }`}>
                    {emfValue > 85 ? "🚨 Metal/Camera Device Detected!" : emfValue > 55 ? "⚠️ Fluctuating Signals" : "✅ Safe (Normal Ambient Field)"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-50 rounded-xl border border-slate-100">
                Sensor Offline
              </div>
            )}
          </div>

          <div className="bg-white border border-rose-100 p-5 rounded-2xl space-y-4 text-slate-800 shadow-sm">
            <div className="flex justify-between items-center border-b border-rose-100 pb-2">
              <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4.5 h-4.5 text-rose-500" />
                {lang === "hi" ? "इन्फ्रारेड स्पाई लेंस खोजक" : "Spy Lens Infrared Filter"}
              </h4>
              <button 
                onClick={() => {
                  if (isCameraActive) stopCamera();
                  else startCamera();
                }}
                className={`px-3 py-1 rounded-lg text-[9px] font-extrabold uppercase transition cursor-pointer ${
                  isCameraActive ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {isCameraActive ? (lang === "hi" ? "कैमरा बंद" : "Close Scanner") : (lang === "hi" ? "कैमरा खोलें" : "Open Scanner")}
              </button>
            </div>

            <p className="text-[9px] text-slate-500 font-semibold leading-relaxed">
              Opens your back camera with an optimized high-contrast red filter to highlight reflection points from lens coatings.
            </p>

            {isCameraActive ? (
              <div className="relative rounded-xl overflow-hidden border border-rose-150 bg-black aspect-video flex items-center justify-center">
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                  style={{ filter: "contrast(220%) saturate(0%) sepia(100%) hue-rotate(-50deg)" }}
                />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-16 h-16 border-2 border-red-500/40 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-red-650 rounded-full animate-ping"></div>
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 bg-red-600 text-white text-[8px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded border border-red-500 animate-pulse">
                  IR filter Active
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-50 rounded-xl border border-slate-100">
                Camera Stream Offline
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SAFE MAP */}
      {activeTab === "routes" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white border border-rose-100 p-4 rounded-2xl space-y-4 text-slate-800 shadow-sm">
            <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Map className="w-4.5 h-4.5 text-rose-500" />
              {lang === "hi" ? "सुरक्षित मार्ग खोज व दिशा निर्देश" : "Safe Directions Finder"}
            </h4>

            <form onSubmit={handleRouteSearch} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  value={startLoc}
                  onChange={e => setStartLoc(e.target.value)}
                  required
                  placeholder={lang === "hi" ? "प्रारंभिक बिंदु" : "Start location"} 
                  className="border border-rose-150 bg-slate-50 rounded-lg text-xs px-2.5 py-2 font-bold outline-none text-slate-800 focus:border-rose-500"
                />
                <input 
                  type="text" 
                  value={endLoc}
                  onChange={e => setEndLoc(e.target.value)}
                  required
                  placeholder={lang === "hi" ? "गंतव्य बिंदु" : "Destination"} 
                  className="border border-rose-150 bg-slate-50 rounded-lg text-xs px-2.5 py-2 font-bold outline-none text-slate-800 focus:border-rose-500"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-[#000080] hover:bg-indigo-950 text-white font-bold py-2 rounded-lg text-xs shadow-md transition cursor-pointer"
              >
                {lang === "hi" ? "मार्ग का पता लगाएं" : "Find Safety Route"}
              </button>
            </form>

            {directionsUrl ? (
              <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video shadow-inner bg-slate-100">
                <iframe 
                  src={directionsUrl}
                  className="w-full h-full border-0 grayscale saturate-50"
                  allowFullScreen
                  loading="lazy"
                  title="Route Safety Map Directions"
                />
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-50 rounded-xl border border-slate-100">
                Input Locations to Map Route
              </div>
            )}
          </div>

          <div className="bg-white border border-rose-100 p-4 rounded-2xl space-y-4 text-slate-800 shadow-sm">
            <h4 className="text-xs font-black uppercase tracking-wider border-b border-rose-100 pb-2">
              {lang === "hi" ? "समुदाय द्वारा सुरक्षित मार्ग समीक्षा" : "Community Street Safety Reviews"}
            </h4>

            <form onSubmit={handleRatingSubmit} className="space-y-3 bg-slate-50 border border-slate-200/50 p-3.5 rounded-xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-650 block mb-1">Add Street Rating / समीक्षा जोड़ें</span>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  value={newStreetName}
                  onChange={e => setNewStreetName(e.target.value)}
                  required
                  placeholder="Street/Area (e.g. Karond Chowk)" 
                  className="border border-slate-200 bg-white rounded-lg text-xs px-2.5 py-1.5 font-semibold outline-none text-slate-800 focus:border-rose-500"
                />
                <select 
                  value={newRatingVal}
                  onChange={e => setNewRatingVal(parseInt(e.target.value, 10))}
                  className="border border-slate-200 bg-white rounded-lg text-xs px-2 py-1.5 font-bold outline-none text-slate-700 cursor-pointer"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (Very Safe)</option>
                  <option value={4}>⭐⭐⭐⭐ (Safe)</option>
                  <option value={3}>⭐⭐⭐ (Average)</option>
                  <option value={2}>⭐⭐ (Unsafe)</option>
                  <option value={1}>⭐ (High Alert)</option>
                </select>
              </div>
              <input 
                type="text" 
                value={newRatingNotes}
                onChange={e => setNewRatingNotes(e.target.value)}
                placeholder="Safety Notes (e.g. Broken lights, CCTVs, Police checking)"
                className="w-full border border-slate-200 bg-white rounded-lg text-xs px-2.5 py-1.5 font-semibold outline-none text-slate-800 focus:border-rose-500"
              />
              <button 
                type="submit" 
                disabled={submittingRating}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-lg text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {submittingRating ? "Saving..." : "Post Review"}
              </button>
            </form>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pt-2">
              {ratingsList.map((item, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-150 p-3 rounded-xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-700">{item.location_name}</span>
                    <span className="text-[9px] text-amber-500 font-bold">{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-semibold leading-relaxed">{item.notes}</p>
                  <span className="text-[8px] text-slate-400 block font-semibold">Post Date: {new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-rose-100 p-4 shadow-sm space-y-4 text-slate-800 rounded-2xl">
            <h4 className="font-display font-bold text-xs text-slate-800 uppercase tracking-widest border-b border-rose-100 pb-2 flex items-center gap-1.5">
              <Shield className="w-4.5 h-4.5 text-rose-500" />
              {lang === "hi" ? "स्थानीय सुरक्षा निर्देशिका (OSC / पुलिस)" : "Local Protection Directory (OSC / Police)"}
            </h4>

            <form onSubmit={handleDirectorySearch} className="flex gap-2">
              <input 
                type="text" 
                pattern="\d{6}"
                value={searchPincode}
                onChange={e => setSearchPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={lang === "hi" ? "पिनकोड दर्ज करें (e.g. 466001)" : "Enter 6-digit Pincode (e.g. 466001)"} 
                className="flex-1 border border-rose-150 rounded-lg text-xs px-3 py-2 outline-none focus:border-rose-500 font-bold bg-slate-50 text-slate-850"
              />
              <button 
                type="submit" 
                disabled={searchingDirectory || searchPincode.length < 6}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md transition disabled:opacity-40 cursor-pointer"
              >
                {searchingDirectory ? "..." : (lang === "hi" ? "खोजें" : "Search")}
              </button>
            </form>

            {directoryList.length > 0 ? (
              <div className="space-y-3 pt-2 max-h-[250px] overflow-y-auto">
                {directoryList.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-150 p-3 rounded-xl space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black text-slate-800 leading-tight">{item.name}</span>
                      <span className="text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-rose-250 bg-rose-50 text-rose-700">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-500 leading-relaxed font-semibold">{item.address}</p>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                      <span className="text-[8px] font-bold text-slate-400">Helpline: {item.helpline}</span>
                      <a 
                        href={`tel:${item.phone}`}
                        className="text-[8.5px] font-bold text-rose-700 hover:underline flex items-center gap-1"
                      >
                        📞 Call: {item.phone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[9px] text-slate-400 text-center py-2 font-semibold">
                {lang === "hi" ? "कोई स्थानीय केंद्र ढूंढने के लिए पिनकोड दर्ज करें।" : "Enter pincode to find local safety resources nearby."}
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS */}
      {activeTab === "settings" && (
        <div className="space-y-4 animate-fadeIn text-slate-850">
          <div className="bg-white border border-rose-100 p-5 rounded-2xl space-y-4 shadow-sm">
            <h4 className="text-xs font-black uppercase tracking-wider border-b border-rose-100 pb-2">Stealth App Settings</h4>
            
            <div className="flex justify-between items-center py-1">
              <div>
                <span className="text-xs font-extrabold block">Stealth Calculator Mode</span>
                <p className="text-[9px] text-slate-450 font-semibold mt-0.5">Disguises the safety dashboard behind a working calculator.</p>
              </div>
              <input 
                type="checkbox"
                checked={stealthEnabled}
                onChange={e => {
                  const val = e.target.checked;
                  setStealthEnabled(val);
                  localStorage.setItem("stealth_enabled", String(val));
                }}
                className="w-5 h-5 accent-rose-600 cursor-pointer"
              />
            </div>

            {stealthEnabled && (
              <div className="space-y-2 pt-2 border-t border-rose-105">
                <label className="text-[9px] font-black text-slate-450 uppercase tracking-wider block">Unlock PIN Code (4 Digits)</label>
                <input 
                  type="text"
                  maxLength={4}
                  value={calculatorPin}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setCalculatorPin(val);
                    localStorage.setItem("calc_pin", val);
                  }}
                  className="w-full max-w-[120px] border border-rose-200 bg-slate-50 rounded-lg text-xs px-3 py-2 font-mono font-black text-rose-700 outline-none focus:border-rose-500"
                />
              </div>
            )}
          </div>

          <div className="bg-white border border-rose-100 p-5 rounded-2xl space-y-4 shadow-sm">
            <h4 className="text-xs font-black uppercase tracking-wider border-b border-rose-100 pb-2">Physical Hardware Alerts</h4>

            <div className="flex justify-between items-center py-1">
              <div>
                <span className="text-xs font-extrabold block">Shake-To-Alert Trigger</span>
                <p className="text-[9px] text-slate-450 font-semibold mt-0.5">Aggressive shaking of the device immediately triggers SOS alert.</p>
              </div>
              <input 
                type="checkbox"
                checked={shakeEnabled}
                onChange={e => {
                  const val = e.target.checked;
                  setShakeEnabled(val);
                  localStorage.setItem("shake_enabled", String(val));
                }}
                className="w-5 h-5 accent-rose-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
