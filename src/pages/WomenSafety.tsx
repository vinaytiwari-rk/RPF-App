import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Shield, AlertOctagon, Phone, Camera, Map, Settings, 
  Lock, X, Volume2, CheckCircle, Activity, FileText, Radio, 
  ExternalLink, Crosshair, Navigation, AlertTriangle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Web Audio API Synthesizers
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

  sirenOsc.type = "square";
  sirenOsc.frequency.setValueAtTime(750, audioCtx.currentTime);
  sirenGain.gain.setValueAtTime(0.8, audioCtx.currentTime);

  sirenOsc.connect(sirenGain);
  sirenGain.connect(audioCtx.destination);
  sirenOsc.start();

  const sweep = () => {
    if (!audioCtx || !sirenOsc) return;
    const t = audioCtx.currentTime;
    sirenOsc.frequency.cancelScheduledValues(t);
    sirenOsc.frequency.setValueAtTime(750, t);
    sirenOsc.frequency.linearRampToValueAtTime(1450, t + 0.2);
    sirenOsc.frequency.linearRampToValueAtTime(750, t + 0.4);
  };

  sweep();
  sirenInterval = setInterval(sweep, 400);
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

// Realistic Calculator Disguise
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

  const btnStyles = "h-16 text-xl font-medium rounded-full transition-colors active:scale-95";
  const numStyle = `${btnStyles} bg-zinc-800 text-zinc-100 hover:bg-zinc-700`;
  const opStyle = `${btnStyles} bg-orange-500 text-white hover:bg-orange-400 font-semibold`;
  const actionStyle = `${btnStyles} bg-zinc-400 text-zinc-900 hover:bg-zinc-300 font-semibold`;

  return (
    <div className="w-full h-full min-h-screen bg-black flex flex-col justify-end px-5 pb-10">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-right text-white text-6xl font-light mb-6 px-4 overflow-hidden tracking-tight">
          {calcInput || "0"}
        </div>
        <div className="grid grid-cols-4 gap-3">
          <button onClick={() => handleBtn("C")} className={actionStyle}>AC</button>
          <button onClick={() => handleBtn("")} className={actionStyle}>+/-</button>
          <button onClick={() => handleBtn("")} className={actionStyle}>%</button>
          <button onClick={() => handleBtn("/")} className={opStyle}>÷</button>
          
          <button onClick={() => handleBtn("7")} className={numStyle}>7</button>
          <button onClick={() => handleBtn("8")} className={numStyle}>8</button>
          <button onClick={() => handleBtn("9")} className={numStyle}>9</button>
          <button onClick={() => handleBtn("*")} className={opStyle}>×</button>
          
          <button onClick={() => handleBtn("4")} className={numStyle}>4</button>
          <button onClick={() => handleBtn("5")} className={numStyle}>5</button>
          <button onClick={() => handleBtn("6")} className={numStyle}>6</button>
          <button onClick={() => handleBtn("-")} className={opStyle}>-</button>
          
          <button onClick={() => handleBtn("1")} className={numStyle}>1</button>
          <button onClick={() => handleBtn("2")} className={numStyle}>2</button>
          <button onClick={() => handleBtn("3")} className={numStyle}>3</button>
          <button onClick={() => handleBtn("+")} className={opStyle}>+</button>
          
          <button onClick={() => handleBtn("0")} className={`${numStyle} col-span-2 text-left pl-8`}>0</button>
          <button onClick={() => handleBtn(".")} className={numStyle}>.</button>
          <button onClick={() => handleBtn("=")} className={opStyle}>=</button>
        </div>
      </div>
    </div>
  );
}

export default function WomenSafety() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user } = useAuth();

  // Settings
  const [stealthEnabled, setStealthEnabled] = useState(() => localStorage.getItem("stealth_enabled") === "true");
  const [calculatorPin, setCalculatorPin] = useState(() => localStorage.getItem("calc_pin") || "7777");
  const [isUnlocked, setIsUnlocked] = useState(!stealthEnabled);

  // States
  const [activeTab, setActiveTab] = useState<"deterrents" | "scanner" | "ncw" | "routes" | "settings">("deterrents");
  const [sosActive, setSosActive] = useState(false);
  const [sosFired, setSosFired] = useState(false);
  const [contacts, setContacts] = useState<string[]>(() => {
    const saved = localStorage.getItem("sos_contacts");
    return saved ? JSON.parse(saved) : [];
  });
  const [newContact, setNewContact] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [fakeCallConnected, setFakeCallConnected] = useState(false);
  const [fakeCallTime, setFakeCallTime] = useState(0);
  const [fakeCallerName, setFakeCallerName] = useState(() => localStorage.getItem("fake_caller_name") || (lang === "hi" ? "पिताजी" : "Home"));
  const [sirenActive, setSirenActive] = useState(false);
  const [shakeEnabled, setShakeEnabled] = useState(() => localStorage.getItem("shake_enabled") === "true");

  const [isEMFActive, setIsEMFActive] = useState(false);
  const [emfValue, setEmfValue] = useState(0.0);
  const [isSensorSupported, setIsSensorSupported] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sensorRef = useRef<any>(null);

  const [complainantName, setComplainantName] = useState(user?.name || "");
  const [complainantPhone, setComplainantPhone] = useState(user?.phone || "");
  const [complaintType, setComplaintType] = useState("Harassment / Eve Teasing");
  const [incidentDate, setIncidentDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [incidentLocation, setIncidentLocation] = useState("");
  const [complaintDesc, setComplaintDesc] = useState("");
  const [suspectDetails, setSuspectDetails] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  const [searchPincode, setSearchPincode] = useState("");
  const [directoryList, setDirectoryList] = useState<any[]>([]);
  const [searchingDirectory, setSearchingDirectory] = useState(false);
  const [startLoc, setStartLoc] = useState("");
  const [endLoc, setEndLoc] = useState("");

  const [helpSubTab, setHelpSubTab] = useState<"panic" | "guardians">("panic");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const triggerHaptic = (pattern = [100]) => {
    if ("vibrate" in navigator) navigator.vibrate(pattern);
  };

  useEffect(() => {
    if (!shakeEnabled) return;
    let lastX: number | null = null, lastY: number | null = null, lastZ: number | null = null;
    const shakeThreshold = 18;
    const handleMotionEvent = (event: DeviceMotionEvent) => {
      const { x, y, z } = event.accelerationIncludingGravity || {};
      if (x == null || y == null || z == null) return;
      if (lastX !== null && lastY !== null && lastZ !== null) {
        const dX = Math.abs(x - lastX), dY = Math.abs(y - lastY), dZ = Math.abs(z - lastZ);
        if ((dX > shakeThreshold && dY > shakeThreshold) || dZ > shakeThreshold + 5) {
          triggerHaptic([300, 100, 300]);
          handleSOS();
        }
      }
      lastX = x; lastY = y; lastZ = z;
    };
    window.addEventListener("devicemotion", handleMotionEvent);
    return () => window.removeEventListener("devicemotion", handleMotionEvent);
  }, [shakeEnabled, contacts]);

  useEffect(() => {
    let timer: any = null;
    if (fakeCallConnected) {
      timer = setInterval(() => setFakeCallTime(p => p + 1), 1000);
    } else {
      setFakeCallTime(0);
    }
    return () => clearInterval(timer);
  }, [fakeCallConnected]);

  useEffect(() => {
    if (!isEMFActive) {
      if (sensorRef.current) { try { sensorRef.current.stop(); } catch(e){} }
      return;
    }
    if ("Magnetometer" in window) {
      try {
        const magSensor = new (window as any).Magnetometer({ frequency: 10 });
        sensorRef.current = magSensor;
        magSensor.addEventListener("reading", () => {
          const { x, y, z } = magSensor;
          const mag = Math.sqrt(x*x + y*y + z*z).toFixed(1);
          setEmfValue(parseFloat(mag));
          if (parseFloat(mag) > 100) triggerHaptic([50]);
        });
        magSensor.addEventListener("error", () => setIsSensorSupported(false));
        magSensor.start();
      } catch (err) {
        setIsSensorSupported(false);
      }
    } else {
      setIsSensorSupported(false);
    }
    return () => {
      if (sensorRef.current) { try { sensorRef.current.stop(); } catch(e){} }
    };
  }, [isEMFActive]);

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintDesc.trim() || !incidentLocation.trim()) return;
    setSubmittingComplaint(true);
    try {
      const res = await fetch("/api/women/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id || "guest",
          complainant_name: isAnonymous ? "Anonymous" : complainantName,
          complainant_phone: isAnonymous ? "" : complainantPhone,
          complaint_type: complaintType,
          incident_date: incidentDate,
          location: incidentLocation,
          description: complaintDesc,
          suspect_details: suspectDetails,
          is_anonymous: isAnonymous
        })
      });
      if (res.ok) {
        setSuccessMsg(lang === "hi" ? "शिकायत दर्ज की गई।" : "Report filed successfully.");
        setComplaintDesc("");
        setIncidentLocation("");
        setSuspectDetails("");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const handleSOS = async () => {
    setSosActive(true);
    triggerHaptic([300, 200, 300, 200, 500]);
    startSilentRecording();

    try {
      let locationStr = "Location unavailable";
      let latVal = null, lonVal = null;

      if ("geolocation" in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
          });
          latVal = pos.coords.latitude;
          lonVal = pos.coords.longitude;
          locationStr = `https://www.google.com/maps?q=${latVal.toFixed(6)},${lonVal.toFixed(6)}`;
        } catch (e) {
          console.warn("GPS failed", e);
        }
      }

      await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "guest",
          citizenName: user?.name || "Citizen",
          citizenPhone: user?.phone || "",
          serviceName: "Women Support",
          submissionData: { sosTriggered: true, userLocation: locationStr, designatedContacts: contacts },
          status: "pending",
          latitude: latVal,
          longitude: lonVal,
          timestamp: new Date().toISOString(),
        })
      });
      setSosFired(true);
    } catch (err) {
      console.error("SOS error:", err);
    } finally {
      setSosActive(false);
    }
  };

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
          await fetch("/api/submissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user?.id || "guest",
              citizenName: user?.name || "Citizen",
              serviceName: "Women Support - Audio Evidence",
              submissionData: { audio: reader.result },
              status: "pending"
            })
          });
        };
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setTimeout(() => { if (mediaRecorder.state !== "inactive") mediaRecorder.stop(); }, 15000);
    } catch (err) {
      console.warn("Mic blocked");
    }
  };

  const handleDirectorySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPincode.trim()) return;
    setSearchingDirectory(true);
    try {
      const res = await fetch(`/api/locations/helplines?pincode=${searchPincode.trim()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) setDirectoryList(json.data);
    } catch (err) {} finally {
      setSearchingDirectory(false);
    }
  };

  const handleRouteSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startLoc.trim() || !endLoc.trim()) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startLoc.trim())}&destination=${encodeURIComponent(endLoc.trim())}`;
    window.open(url, "_blank");
  };

  const addContact = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newContact.trim();
    if (val && contacts.length < 5) {
      if (val.includes("@") || /^\d{10}$/.test(val)) {
        const updated = [...contacts, val];
        setContacts(updated);
        localStorage.setItem("sos_contacts", JSON.stringify(updated));
        setNewContact("");
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
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsCameraActive(true);
    } catch (err) {}
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

  // Lock Screen
  if (stealthEnabled && !isUnlocked) {
    return <CalculatorDisguise onUnlock={() => setIsUnlocked(true)} correctPin={calculatorPin} />;
  }

  // Fake Call Screen
  if (fakeCallActive) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 text-white flex flex-col justify-between p-8 font-sans">
        <div className="text-center pt-20 space-y-3">
          <div className="text-4xl font-light tracking-wide">{fakeCallerName}</div>
          <p className="text-base text-slate-400">
            {fakeCallConnected ? formatTime(fakeCallTime) : (lang === "hi" ? "इनकमिंग कॉल..." : "Incoming call...")}
          </p>
        </div>

        {fakeCallConnected ? (
          <div className="flex flex-col items-center pb-20">
            <button
              className="w-20 h-20 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center transition-transform active:scale-90"
              onClick={() => {
                stopRingtone();
                setFakeCallActive(false);
                setFakeCallConnected(false);
              }}
            >
              <Phone className="w-8 h-8 text-white rotate-[135deg]" />
            </button>
          </div>
        ) : (
          <div className="flex justify-around pb-24 items-center px-10">
            <button
              onClick={() => {
                stopRingtone();
                setFakeCallActive(false);
              }}
              className="w-20 h-20 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center transition-transform active:scale-90"
            >
              <X className="w-8 h-8 text-white" />
            </button>
            <button
              onClick={() => {
                stopRingtone();
                setFakeCallConnected(true);
              }}
              className="w-20 h-20 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center transition-transform active:scale-90 animate-pulse"
            >
              <Phone className="w-8 h-8 text-white fill-white" />
            </button>
          </div>
        )}
      </div>
    );
  }

  const TABS = [
    { key: "deterrents", label: "SOS", icon: AlertOctagon },
    { key: "ncw", label: lang === "hi" ? "रिपोर्ट" : "Report", icon: FileText },
    { key: "routes", label: lang === "hi" ? "रूट्स" : "Routes", icon: Navigation },
    { key: "settings", label: lang === "hi" ? "सेटिंग" : "Settings", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-24 font-sans selection:bg-red-900/50">
      
      {/* Tactical Header */}
      <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-5 py-4 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-950 border border-red-800 flex items-center justify-center">
            <Shield className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 tracking-wide uppercase">
              {lang === "hi" ? "आपातकालीन कमान" : "Emergency Command"}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">System Online</p>
            </div>
          </div>
        </div>
        {stealthEnabled && (
          <button onClick={() => setIsUnlocked(false)} className="p-2.5 rounded-md bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-colors">
            <Lock className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      <div className="px-4 mt-6 max-w-xl mx-auto space-y-6">
        
        {/* Sleek Segmented Control */}
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key as any); stopCamera(); }}
                className={`flex-1 py-2.5 text-xs font-semibold flex flex-col items-center gap-1.5 rounded-md transition-all duration-200 ${
                  active ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-red-500" : ""}`} />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {successMsg && (
          <div className="bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 p-3 rounded-lg text-sm font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {successMsg}
          </div>
        )}

        {/* 1. SOS TAB */}
        {activeTab === "deterrents" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Primary SOS Button */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 to-transparent pointer-events-none"></div>
              
              <h3 className="text-xs font-bold text-slate-400 tracking-[0.2em] uppercase mb-8">
                {lang === "hi" ? "त्वरित कार्रवाई" : "Instant Action"}
              </h3>
              
              <button
                onClick={handleSOS}
                disabled={sosActive}
                className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                  sosActive 
                    ? "bg-red-900 scale-95" 
                    : "bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 active:scale-95 cursor-pointer shadow-[0_0_50px_rgba(220,38,38,0.3)]"
                } border-[6px] border-slate-950 ring-[8px] ring-slate-900`}
              >
                <AlertTriangle className={`w-12 h-12 text-white ${sosActive ? "animate-pulse" : ""}`} strokeWidth={2.5} />
                <span className="text-white font-black tracking-widest text-xl">SOS</span>
              </button>

              <p className="text-xs text-slate-500 mt-8 text-center max-w-xs font-medium">
                {lang === "hi" 
                  ? "टैप करते ही आपकी लाइव लोकेशन अभिभावकों को भेजी जाएगी और ऑडियो रिकॉर्डिंग शुरू होगी।" 
                  : "Transmits live coordinates and initiates secure ambient audio recording."}
              </p>
            </div>

            {sosFired && (
              <div className="bg-red-950/30 border border-red-900/50 p-5 rounded-xl space-y-4">
                <div className="flex items-center gap-3 text-red-500 font-bold">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="tracking-wide uppercase text-sm">Signal Transmitted</span>
                </div>
                <div className="flex gap-3">
                  <a href="tel:112" className="flex-1 bg-white text-black py-3 rounded-lg font-bold text-sm text-center flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
                    <Phone className="w-4 h-4" /> 112
                  </a>
                  <button onClick={() => setSosFired(false)} className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-lg font-bold text-sm hover:bg-slate-700 transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Tactical Grid */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => { setFakeCallActive(true); playRingtone(); }}
                className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-slate-800 hover:border-slate-700 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                  <Phone className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-slate-200">{lang === "hi" ? "फ़ेक कॉल" : "Fake Call"}</div>
                  <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">Simulate</div>
                </div>
              </button>

              <button 
                onClick={() => { sirenActive ? stopSiren() : playSiren(); setSirenActive(!sirenActive); triggerHaptic([500]); }}
                className={`border p-5 rounded-xl flex flex-col items-center justify-center gap-3 transition-all text-left ${
                  sirenActive ? "bg-red-950 border-red-900/50" : "bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-slate-700"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                  sirenActive ? "bg-red-900 border-red-800" : "bg-slate-800 border-slate-700"
                }`}>
                  <Volume2 className={`w-5 h-5 ${sirenActive ? "text-white animate-pulse" : "text-amber-400"}`} />
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-slate-200">{lang === "hi" ? "सायरन" : "Loud Siren"}</div>
                  <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">{sirenActive ? "Active" : "Trigger"}</div>
                </div>
              </button>
            </div>
            
            {/* Contacts Management */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-200 tracking-wide">EMERGENCY CONTACTS</h4>
                <span className="text-xs font-mono text-slate-500">{contacts.length}/5</span>
              </div>
              <form onSubmit={addContact} className="flex gap-2">
                <input
                  type="text"
                  value={newContact}
                  onChange={e => setNewContact(e.target.value)}
                  placeholder="Enter Phone Number"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-red-500 outline-none font-mono"
                />
                <button type="submit" disabled={contacts.length >= 5 || !newContact.trim()} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                  ADD
                </button>
              </form>
              <div className="space-y-2 mt-4">
                {contacts.map((c, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-lg">
                    <span className="text-sm font-mono text-slate-300">{c}</span>
                    <button onClick={() => removeContact(i)} className="text-red-500 hover:text-red-400 text-xs font-bold tracking-wider uppercase">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 2. SCANNER TAB (REMOVED) */}

        {/* 3. REPORT TAB */}
        {activeTab === "ncw" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <h4 className="text-sm font-bold text-slate-200 mb-4 tracking-wide">NCW PORTALS</h4>
              <div className="flex gap-3">
                <a href="https://ncwapps.nic.in/onlinecomplaintsv2/" target="_blank" rel="noopener noreferrer" className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-2 border border-slate-700 transition-colors">
                  File Complaint <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <h4 className="text-sm font-bold text-slate-200 tracking-wide">SECURE REPORTING</h4>
              <form onSubmit={handleComplaintSubmit} className="space-y-4">
                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <input type="checkbox" id="anon" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="w-4 h-4 accent-red-600" />
                  <label htmlFor="anon" className="text-sm font-medium text-slate-300">File Anonymously</label>
                </div>
                {!isAnonymous && (
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Name" value={complainantName} onChange={e => setComplainantName(e.target.value)} required className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-red-500" />
                    <input type="text" placeholder="Phone" value={complainantPhone} onChange={e => setComplainantPhone(e.target.value)} required className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-red-500" />
                  </div>
                )}
                <select value={complaintType} onChange={e => setComplaintType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-red-500">
                  <option>Harassment / Eve Teasing</option>
                  <option>Domestic Abuse / Violence</option>
                  <option>Cyber Stalking / Blackmail</option>
                  <option>Physical Threat / Assault</option>
                  <option>Other</option>
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={incidentDate} onChange={e => setIncidentDate(e.target.value)} required className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-red-500" />
                  <input type="text" placeholder="Location" value={incidentLocation} onChange={e => setIncidentLocation(e.target.value)} required className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-red-500" />
                </div>
                <textarea placeholder="Detailed description..." rows={4} value={complaintDesc} onChange={e => setComplaintDesc(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-sm text-slate-200 outline-none focus:border-red-500 resize-none"></textarea>
                <button type="submit" disabled={submittingComplaint} className="w-full bg-slate-100 hover:bg-white text-slate-900 py-3 rounded-lg text-sm font-bold tracking-wide transition-colors">
                  {submittingComplaint ? "SUBMITTING..." : "SUBMIT REPORT"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 4. ROUTES TAB */}
        {activeTab === "routes" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <h4 className="text-sm font-bold text-slate-200 tracking-wide flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-400" /> SECURE NAVIGATION
              </h4>
              <form onSubmit={handleRouteSearch} className="space-y-3">
                <input type="text" placeholder="Origin" value={startLoc} onChange={e => setStartLoc(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-sm text-slate-200 outline-none focus:border-blue-500" />
                <input type="text" placeholder="Destination" value={endLoc} onChange={e => setEndLoc(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-sm text-slate-200 outline-none focus:border-blue-500" />
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg text-sm font-bold tracking-wide transition-colors">
                  LAUNCH MAPS
                </button>
              </form>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <h4 className="text-sm font-bold text-slate-200 tracking-wide">LOCAL DIRECTORY</h4>
              <form onSubmit={handleDirectorySearch} className="flex gap-2">
                <input type="text" placeholder="Pincode" value={searchPincode} onChange={e => setSearchPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm font-mono text-slate-200 outline-none focus:border-blue-500" />
                <button type="submit" disabled={searchingDirectory || searchPincode.length < 6} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                  SEARCH
                </button>
              </form>
              <div className="space-y-2 mt-4">
                {directoryList.map((item, i) => (
                  <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-1.5">
                    <div className="font-bold text-sm text-slate-200">{item.name}</div>
                    <div className="text-xs text-slate-400">{item.address}</div>
                    <div className="text-xs font-mono font-bold text-blue-400 mt-1">{item.phone}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-6">
              <h4 className="text-sm font-bold text-slate-200 tracking-wide">SYSTEM PREFERENCES</h4>

              <div>
                <label className="text-sm font-bold text-slate-200 block mb-2">Fake Call Identity</label>
                <input type="text" value={fakeCallerName} onChange={e => {
                  setFakeCallerName(e.target.value);
                  localStorage.setItem("fake_caller_name", e.target.value);
                }} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
