import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Shield, AlertOctagon, Phone, User, Plus, Heart,
  HelpCircle, CheckCircle, X, Volume2, Camera, Eye,
  Map, Settings, Play, Square, RefreshCw, Layers, Radio, Globe, ExternalLink,
  Lock, ChevronRight, ChevronLeft, MapPin, Star, Sparkles, FileText, Activity, BarChart2
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

  sirenOsc.type = "triangle";
  sirenOsc.frequency.setValueAtTime(650, audioCtx.currentTime);

  sirenGain.gain.setValueAtTime(0.5, audioCtx.currentTime);

  sirenOsc.connect(sirenGain);
  sirenGain.connect(audioCtx.destination);

  sirenOsc.start();

  const sweep = () => {
    if (!audioCtx || !sirenOsc) return;
    const t = audioCtx.currentTime;
    sirenOsc.frequency.cancelScheduledValues(t);
    sirenOsc.frequency.setValueAtTime(650, t);
    sirenOsc.frequency.linearRampToValueAtTime(1350, t + 0.25);
    sirenOsc.frequency.linearRampToValueAtTime(650, t + 0.5);
  };

  sweep();
  sirenInterval = setInterval(sweep, 500);
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

// 1. Calculator Disguise Component (Professional standard design)
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
    <div className="max-w-xs mx-auto p-4 bg-gray-100 border border-gray-300 rounded-lg shadow-lg space-y-3 mt-10">
      <div className="bg-white border border-gray-300 p-3 rounded text-right text-gray-800 font-mono text-2xl h-14 overflow-hidden flex items-center justify-end">
        {calcInput || "0"}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {["C", "/", "*", "-", "7", "8", "9", "+", "4", "5", "6", "=", "1", "2", "3", "0", "."].map(btn => (
          <button
            key={btn}
            onClick={() => handleBtn(btn)}
            className={`h-12 text-sm font-semibold rounded transition cursor-pointer ${
              btn === "="
                ? "bg-blue-600 hover:bg-blue-700 text-white row-span-2 h-full"
                : ["C", "/", "*", "-", "+"].includes(btn)
                ? "bg-gray-300 hover:bg-gray-400 text-gray-800"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
            style={{ gridColumn: btn === "." ? "span 3" : undefined }}
          >
            {btn}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest pt-1">Standard Calculator</p>
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
  const [activeTab, setActiveTab] = useState<"deterrents" | "scanner" | "ncw" | "routes" | "stats" | "settings">("deterrents");
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
  const [fakeCallerName, setFakeCallerName] = useState(() => localStorage.getItem("fake_caller_name") || (lang === "hi" ? "पिताजी" : "Home"));
  const [sirenActive, setSirenActive] = useState(false);
  const [shakeEnabled, setShakeEnabled] = useState(() => localStorage.getItem("shake_enabled") === "true");

  // Scanner state
  const [isEMFActive, setIsEMFActive] = useState(false);
  const [emfValue, setEmfValue] = useState(0.0);
  const [isSensorSupported, setIsSensorSupported] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sensorRef = useRef<any>(null);

  // Built-in Complaint Portal states
  const [complainantName, setComplainantName] = useState(user?.name || "");
  const [complainantPhone, setComplainantPhone] = useState(user?.phone || "");
  const [complaintType, setComplaintType] = useState("Harassment / Eve Teasing");
  const [incidentDate, setIncidentDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [incidentLocation, setIncidentLocation] = useState("");
  const [complaintDesc, setComplaintDesc] = useState("");
  const [suspectDetails, setSuspectDetails] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [complaintsList, setComplaintsList] = useState<any[]>([]);
  const [fetchingComplaints, setFetchingComplaints] = useState(false);
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  // Safe routes state
  const [searchPincode, setSearchPincode] = useState("");
  const [directoryList, setDirectoryList] = useState<any[]>([]);
  const [searchingDirectory, setSearchingDirectory] = useState(false);
  const [startLoc, setStartLoc] = useState("");
  const [endLoc, setEndLoc] = useState("");
  const [ratingsList, setRatingsList] = useState<any[]>([]);
  const [newStreetName, setNewStreetName] = useState("");
  const [newRatingVal, setNewRatingVal] = useState(4);
  const [newRatingNotes, setNewRatingNotes] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  // Sub-tabs
  const [helpSubTab, setHelpSubTab] = useState<"panic" | "guardians">("panic");

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // OGD API States
  const [ogdResourceId, setOgdResourceId] = useState(() => localStorage.getItem("ogd_resource_id") || "");
  const [ogdData, setOgdData] = useState<any[]>([]);
  const [ogdLoading, setOgdLoading] = useState(false);
  const [ogdError, setOgdError] = useState("");
  const OGD_API_KEY = "579b464db66ec23bdd00000190c6f32d55f843bf63331559161f2b1d";

  const fetchOgdData = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ogdResourceId.trim()) return;
    setOgdLoading(true);
    setOgdError("");
    try {
      localStorage.setItem("ogd_resource_id", ogdResourceId.trim());
      const res = await fetch(`https://api.data.gov.in/resource/${ogdResourceId.trim()}?api-key=${OGD_API_KEY}&format=json&limit=100`);
      if (!res.ok) throw new Error("Failed to fetch data from data.gov.in");
      const json = await res.json();
      if (json.records) {
        setOgdData(json.records);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      setOgdError(err.message || "An error occurred");
    } finally {
      setOgdLoading(false);
    }
  };

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

  // Real Magnetometer Sensor query
  useEffect(() => {
    if (!isEMFActive) {
      if (sensorRef.current) {
        try { sensorRef.current.stop(); } catch(e){}
      }
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
          if (parseFloat(mag) > 100) {
            triggerHaptic([50]);
          }
        });

        magSensor.addEventListener("error", (e: any) => {
          console.warn("Magnetometer API error:", e);
          setIsSensorSupported(false);
        });

        magSensor.start();
      } catch (err) {
        console.warn("Magnetometer initialization failed:", err);
        setIsSensorSupported(false);
      }
    } else {
      setIsSensorSupported(false);
    }

    return () => {
      if (sensorRef.current) {
        try { sensorRef.current.stop(); } catch(e){}
      }
    };
  }, [isEMFActive]);

  // Fetch Safe Street Ratings
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

  // Fetch filed complaints
  useEffect(() => {
    if (activeTab === "ncw") {
      fetchComplaints();
    }
  }, [activeTab, user?.id]);

  const fetchComplaints = async () => {
    setFetchingComplaints(true);
    try {
      const res = await fetch(`/api/women/complaints?userId=${user?.id || "guest"}`);
      const json = await res.json();
      if (json.success) setComplaintsList(json.data);
    } catch (e) {
      console.error("Failed to fetch complaints", e);
    } finally {
      setFetchingComplaints(false);
    }
  };

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
        setSuccessMsg(lang === "hi" ? "शिकायत दर्ज की गई।" : "Complaint filed successfully.");
        setComplaintDesc("");
        setIncidentLocation("");
        setSuspectDetails("");
        setFormStep(1);
        fetchComplaints();
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
    triggerHaptic([200, 100, 200]);
    startSilentRecording();

    try {
      let locationStr = "Location unavailable";
      let latVal = null;
      let lonVal = null;

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
          const base64Audio = reader.result;
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
    // Fix: Open real google maps for directions instead of an iframe which is broken without API keys.
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startLoc.trim())}&destination=${encodeURIComponent(endLoc.trim())}`;
    window.open(url, "_blank");
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
        setSuccessMsg(lang === "hi" ? "सम्पर्क जोड़ा गया।" : "Contact added.");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setSuccessMsg(lang === "hi" ? "वैध जानकारी दर्ज करें" : "Enter valid info");
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

  // ---------- STEALTH LOCK SCREEN ----------
  if (stealthEnabled && !isUnlocked) {
    return (
      <div className="p-5 flex flex-col items-center justify-center min-h-[85vh] bg-gray-50 text-gray-800">
        <CalculatorDisguise onUnlock={() => setIsUnlocked(true)} correctPin={calculatorPin} />
      </div>
    );
  }

  // ---------- FAKE CALL FULL SCREEN ----------
  if (fakeCallActive) {
    return (
      <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-10 font-sans">
        <div className="text-center pt-14 space-y-4">
          <div className="text-3xl font-normal">{fakeCallerName}</div>
          <p className="text-sm text-gray-300">
            {fakeCallConnected ? formatTime(fakeCallTime) : (lang === "hi" ? "इनकमिंग कॉल" : "Incoming call")}
          </p>
        </div>

        {fakeCallConnected ? (
          <div className="flex flex-col items-center pb-16">
            <button
              className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center cursor-pointer"
              onClick={() => {
                stopRingtone();
                setFakeCallActive(false);
                setFakeCallConnected(false);
              }}
            >
              <Phone className="w-6 h-6 text-white rotate-[135deg]" />
            </button>
          </div>
        ) : (
          <div className="flex justify-around pb-20 items-center">
            <button
              onClick={() => {
                stopRingtone();
                setFakeCallActive(false);
              }}
              className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center cursor-pointer"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() => {
                stopRingtone();
                setFakeCallConnected(true);
              }}
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center cursor-pointer"
            >
              <Phone className="w-6 h-6 text-white" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // ---------- MAIN DASHBOARD ----------
  const TABS = [
    { key: "deterrents", label: lang === "hi" ? "SOS" : "SOS", icon: AlertOctagon },
    { key: "scanner", label: lang === "hi" ? "स्कैनर" : "Scan", icon: Camera },
    { key: "ncw", label: lang === "hi" ? "रिपोर्ट" : "Report", icon: FileText },
    { key: "routes", label: lang === "hi" ? "नेविगेशन" : "Routes", icon: Map },
    { key: "stats", label: lang === "hi" ? "आँकड़े" : "Stats", icon: BarChart2 },
    { key: "settings", label: lang === "hi" ? "सेटिंग" : "Settings", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-20">

      {/* Professional Header */}
      <div className="bg-slate-900 text-white px-5 py-4 shadow-md flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold tracking-wide flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            {lang === "hi" ? "महिला सुरक्षा केंद्र" : "Women Safety Command"}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {lang === "hi" ? "आपातकालीन एवं सहायता सेवा" : "Emergency & Support Services"}
          </p>
        </div>
        {stealthEnabled && (
          <button
            onClick={() => setIsUnlocked(false)}
            className="p-2 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 transition"
          >
            <Lock className="w-4 h-4 text-gray-300" />
          </button>
        )}
      </div>

      <div className="px-4 mt-4 space-y-4 max-w-2xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex bg-white rounded border border-gray-300 shadow-sm overflow-hidden">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => {
                  setActiveTab(t.key as any);
                  stopCamera();
                }}
                className={`flex-1 py-3 px-1 text-xs font-semibold flex flex-col md:flex-row items-center justify-center gap-1.5 transition ${
                  active ? "bg-slate-800 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {successMsg && (
          <div className="bg-green-100 text-green-800 border border-green-300 p-3 rounded text-sm font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= TAB 1: PANIC & SOS ================= */}
        {activeTab === "deterrents" && (
          <div className="space-y-4">
            <div className="flex bg-white border border-gray-300 rounded overflow-hidden">
              <button
                onClick={() => setHelpSubTab("panic")}
                className={`flex-1 py-2 text-sm font-semibold transition ${
                  helpSubTab === "panic" ? "bg-gray-200 text-gray-800" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {lang === "hi" ? "आपातकालीन" : "Emergency"}
              </button>
              <button
                onClick={() => setHelpSubTab("guardians")}
                className={`flex-1 py-2 text-sm font-semibold transition ${
                  helpSubTab === "guardians" ? "bg-gray-200 text-gray-800" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {lang === "hi" ? "अभिभावक (Guardians)" : "Guardians"}
              </button>
            </div>

            {helpSubTab === "panic" && (
              <div className="space-y-4">
                {/* Professional SOS Button */}
                <div className="bg-white border border-red-300 p-6 rounded-lg text-center shadow-sm">
                  <h3 className="text-sm font-semibold text-red-700 mb-4 uppercase tracking-wider">
                    {lang === "hi" ? "आपातकालीन अलर्ट" : "Emergency SOS Alert"}
                  </h3>
                  <button
                    onClick={handleSOS}
                    disabled={sosActive}
                    className={`w-full max-w-sm mx-auto py-5 rounded-md font-bold text-lg flex items-center justify-center gap-3 transition ${
                      sosActive
                        ? "bg-red-800 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white shadow-md"
                    }`}
                  >
                    <AlertOctagon className="w-6 h-6" />
                    {sosActive ? (lang === "hi" ? "अलर्ट भेजा जा रहा है..." : "Sending Alert...") : (lang === "hi" ? "मदद के लिए टैप करें" : "TAP FOR HELP")}
                  </button>
                  <p className="text-xs text-gray-500 mt-4 max-w-sm mx-auto">
                    {lang === "hi" ? "इसे दबाने से आपकी लाइव लोकेशन आपके रजिस्टर्ड अभिभावकों को भेज दी जाएगी।" : "Pressing this will instantly transmit your live location to registered guardians."}
                  </p>
                </div>

                {sosFired && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-red-700 font-bold">
                      <Activity className="w-5 h-5 animate-pulse" />
                      <span>{lang === "hi" ? "अलर्ट सक्रिय है!" : "Alert Active!"}</span>
                    </div>
                    <p className="text-gray-700">
                      {lang === "hi"
                        ? "आपके संपर्कों को लोकेशन भेज दी गई है। एक 10-सेकंड का ऑडियो रिकॉर्ड भी सुरक्षित किया जा रहा है।"
                        : "Location transmitted to contacts. A 10-second ambient audio recording has commenced."}
                    </p>
                    <a
                      href="tel:1091"
                      className="inline-flex items-center justify-center w-full bg-slate-800 text-white py-2.5 rounded font-semibold gap-2 hover:bg-slate-900 transition"
                    >
                      <Phone className="w-4 h-4" />
                      {lang === "hi" ? "पुलिस (1091) को कॉल करें" : "Call Police (1091)"}
                    </a>
                    <button
                      onClick={() => setSosFired(false)}
                      className="w-full text-center text-gray-500 text-xs font-semibold py-2 hover:text-gray-800"
                    >
                      {lang === "hi" ? "अलर्ट बंद करें" : "Dismiss Alert"}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-300 p-4 rounded-lg flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {lang === "hi" ? "फ़ेक कॉल" : "Simulate Call"}
                      </h4>
                      <p className="text-xs text-gray-500 mt-2">
                        {lang === "hi" ? "फ़ोन पर घंटी बजाएं" : "Trigger a simulated incoming call."}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setFakeCallActive(true);
                        playRingtone();
                        startFakeCallHaptics();
                      }}
                      className="mt-4 w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded text-xs font-semibold transition"
                    >
                      {lang === "hi" ? "शुरू करें" : "Activate"}
                    </button>
                  </div>

                  <div className="bg-white border border-gray-300 p-4 rounded-lg flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />
                        {lang === "hi" ? "सायरन" : "Loud Siren"}
                      </h4>
                      <p className="text-xs text-gray-500 mt-2">
                        {lang === "hi" ? "तेज़ अलार्म बजाएं" : "Play a high-decibel alarm."}
                      </p>
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
                      className={`mt-4 w-full py-2 rounded text-xs font-semibold transition ${
                        sirenActive ? "bg-gray-300 text-gray-800" : "bg-slate-800 hover:bg-slate-900 text-white"
                      }`}
                    >
                      {sirenActive ? (lang === "hi" ? "रोकें" : "Stop") : (lang === "hi" ? "शुरू करें" : "Activate")}
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-300 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    {lang === "hi" ? "राष्ट्रीय हेल्पलाइन" : "National Helplines"}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { title: "Women Helpline", number: "1091" },
                      { title: "Domestic Abuse", number: "181" },
                      { title: "Emergency", number: "112" },
                      { title: "Police", number: "100" }
                    ].map(h => (
                      <a
                        key={h.number}
                        href={`tel:${h.number}`}
                        className="flex flex-col p-2 border border-gray-200 rounded hover:bg-gray-50 transition decoration-none text-gray-800"
                      >
                        <span className="text-[10px] text-gray-500 uppercase">{h.title}</span>
                        <span className="text-sm font-bold">{h.number}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {helpSubTab === "guardians" && (
              <div className="bg-white border border-gray-300 p-5 rounded-lg space-y-4">
                <h4 className="text-sm font-semibold text-gray-800">
                  {lang === "hi" ? "आपातकालीन संपर्क" : "Emergency Contacts"}
                </h4>
                <p className="text-xs text-gray-500">
                  {lang === "hi" ? "अधिकतम 5 नंबर या ईमेल जोड़ें।" : "Add up to 5 mobile numbers or emails."}
                </p>

                <form onSubmit={addContact} className="flex gap-2">
                  <input
                    type="text"
                    value={newContact}
                    onChange={e => setNewContact(e.target.value)}
                    placeholder="Email / Phone"
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:border-slate-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={contacts.length >= 5 || !newContact.trim()}
                    className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded text-sm font-semibold transition disabled:opacity-50"
                  >
                    Add
                  </button>
                </form>

                <div className="space-y-2 mt-4">
                  {contacts.length > 0 ? contacts.map((c, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 p-2.5 border border-gray-200 rounded">
                      <span className="text-sm text-gray-700 font-mono">{c}</span>
                      <button onClick={() => removeContact(i)} className="text-red-600 text-xs font-semibold hover:underline">
                        Remove
                      </button>
                    </div>
                  )) : (
                    <div className="text-center py-4 text-xs text-gray-400">No contacts added.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: SCANNERS ================= */}
        {activeTab === "scanner" && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-300 p-5 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Radio className="w-4 h-4" />
                  {lang === "hi" ? "छिपा हुआ कैमरा स्कैनर (EMF)" : "Hidden Camera Scanner (EMF)"}
                </h4>
                <button
                  onClick={() => {
                    setIsEMFActive(!isEMFActive);
                    setEmfValue(0.0);
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                    isEMFActive ? "bg-gray-200 text-gray-800" : "bg-slate-800 text-white"
                  }`}
                >
                  {isEMFActive ? "Stop" : "Scan"}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {lang === "hi" ? "दीवारों के पीछे इलेक्ट्रॉनिक उपकरणों का पता लगाएं।" : "Detects electromagnetic fields from hidden devices."}
              </p>

              {isEMFActive && isSensorSupported && (
                <div className="py-6 text-center">
                  <div className="text-4xl font-mono font-bold text-gray-800">{emfValue} <span className="text-sm text-gray-500">µT</span></div>
                  <div className={`mt-2 text-sm font-semibold ${emfValue > 85 ? "text-red-600" : "text-green-600"}`}>
                    {emfValue > 85 ? "High Signal Detected!" : "Normal Signal"}
                  </div>
                </div>
              )}
              {isEMFActive && !isSensorSupported && (
                <div className="p-3 bg-red-50 text-red-700 text-xs border border-red-200 rounded mt-3">
                  Hardware Magnetometer not supported or permission denied.
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-300 p-5 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  {lang === "hi" ? "लेंस खोजक" : "Lens Finder (Red Filter)"}
                </h4>
                <button
                  onClick={() => {
                    if (isCameraActive) stopCamera();
                    else startCamera();
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                    isCameraActive ? "bg-gray-200 text-gray-800" : "bg-slate-800 text-white"
                  }`}
                >
                  {isCameraActive ? "Close" : "Open"}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {lang === "hi" ? "कैमरे के लेंस को देखने के लिए लाल फ़िल्टर।" : "Uses high contrast red filter to spot camera lenses."}
              </p>

              {isCameraActive && (
                <div className="mt-3 bg-black rounded overflow-hidden relative aspect-video">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ filter: "contrast(200%) saturate(0%) sepia(100%) hue-rotate(-50deg)" }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: NCW ================= */}
        {activeTab === "ncw" && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-300 p-5 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Official NCW Portals</h4>
              <div className="flex gap-3">
                <a href="https://www.ncw.gov.in/" target="_blank" rel="noopener noreferrer" className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded text-xs font-semibold text-center flex items-center justify-center gap-1">
                  NCW Website <ExternalLink className="w-3 h-3" />
                </a>
                <a href="https://ncwapps.nic.in/onlinecomplaintsv2/" target="_blank" rel="noopener noreferrer" className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded text-xs font-semibold text-center flex items-center justify-center gap-1">
                  File Complaint <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="bg-white border border-gray-300 p-5 rounded-lg space-y-4">
              <h4 className="text-sm font-semibold text-gray-800">Incident Reporting Desk</h4>
              <form onSubmit={handleComplaintSubmit} className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <input type="checkbox" id="anon" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="w-4 h-4" />
                  <label htmlFor="anon" className="text-xs font-medium text-gray-700">File Anonymously</label>
                </div>
                {!isAnonymous && (
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Name" value={complainantName} onChange={e => setComplainantName(e.target.value)} required className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-slate-500" />
                    <input type="text" placeholder="Phone" value={complainantPhone} onChange={e => setComplainantPhone(e.target.value)} required className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-slate-500" />
                  </div>
                )}
                <select value={complaintType} onChange={e => setComplaintType(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-slate-500">
                  <option>Harassment / Eve Teasing</option>
                  <option>Domestic Abuse / Violence</option>
                  <option>Cyber Stalking / Blackmail</option>
                  <option>Physical Threat / Assault</option>
                  <option>Other</option>
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={incidentDate} onChange={e => setIncidentDate(e.target.value)} required className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-slate-500" />
                  <input type="text" placeholder="Location" value={incidentLocation} onChange={e => setIncidentLocation(e.target.value)} required className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-slate-500" />
                </div>
                <textarea placeholder="Description of incident" rows={3} value={complaintDesc} onChange={e => setComplaintDesc(e.target.value)} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-slate-500"></textarea>
                <button type="submit" disabled={submittingComplaint} className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded text-sm font-semibold transition">
                  {submittingComplaint ? "Submitting..." : "Submit Report"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= TAB 4: ROUTES ================= */}
        {activeTab === "routes" && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-300 p-5 rounded-lg space-y-4">
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Map className="w-4 h-4" /> Safe Route Navigation
              </h4>
              <form onSubmit={handleRouteSearch} className="space-y-3">
                <input type="text" placeholder="Start Location" value={startLoc} onChange={e => setStartLoc(e.target.value)} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-slate-500" />
                <input type="text" placeholder="Destination" value={endLoc} onChange={e => setEndLoc(e.target.value)} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-slate-500" />
                <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded text-sm font-semibold transition">
                  Open Route in Maps
                </button>
              </form>
            </div>

            <div className="bg-white border border-gray-300 p-5 rounded-lg space-y-4">
              <h4 className="text-sm font-semibold text-gray-800">Directory (Local Helplines)</h4>
              <form onSubmit={handleDirectorySearch} className="flex gap-2">
                <input type="text" placeholder="Pincode (e.g. 462001)" value={searchPincode} onChange={e => setSearchPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-slate-500" />
                <button type="submit" disabled={searchingDirectory || searchPincode.length < 6} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded text-sm font-semibold transition disabled:opacity-50">
                  Search
                </button>
              </form>
              <div className="space-y-2">
                {directoryList.map((item, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-200 p-3 rounded space-y-1">
                    <div className="font-semibold text-sm">{item.name}</div>
                    <div className="text-xs text-gray-600">{item.address}</div>
                    <div className="text-xs font-bold text-gray-800">Phone: {item.phone}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: STATS ================= */}
        {activeTab === "stats" && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-300 p-5 rounded-lg space-y-4">
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <BarChart2 className="w-4 h-4" /> 
                {lang === "hi" ? "WHL सहायता आँकड़े (Data.gov.in)" : "WHL Assistance Stats (Data.gov.in)"}
              </h4>
              <p className="text-xs text-gray-500">
                {lang === "hi" ? "महिला हेल्पलाइन के माध्यम से राज्य-वार आँकड़े प्राप्त करें।" : "Fetch State-wise number of women assisted through WHL using Open Government Data API."}
              </p>

              <form onSubmit={fetchOgdData} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Dataset Resource ID" 
                  value={ogdResourceId} 
                  onChange={e => setOgdResourceId(e.target.value)} 
                  required 
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-slate-500 font-mono" 
                />
                <button 
                  type="submit" 
                  disabled={ogdLoading || !ogdResourceId.trim()} 
                  className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded text-sm font-semibold transition disabled:opacity-50"
                >
                  {ogdLoading ? (lang === "hi" ? "लोड हो रहा..." : "Loading...") : (lang === "hi" ? "प्राप्त करें" : "Fetch Data")}
                </button>
              </form>

              {ogdError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs border border-red-200 rounded">
                  {ogdError}
                </div>
              )}

              {ogdData.length > 0 && (
                <div className="overflow-x-auto border border-gray-200 rounded mt-4">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-100 border-b border-gray-200 text-gray-800 font-semibold text-xs uppercase">
                      <tr>
                        {Object.keys(ogdData[0]).filter(k => k !== 'id').map(key => (
                          <th key={key} className="px-4 py-3">{key.replace(/_/g, ' ')}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                      {ogdData.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition">
                          {Object.entries(row).filter(([k]) => k !== 'id').map(([k, v]: any, j) => (
                            <td key={j} className="px-4 py-2">{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 6: SETTINGS ================= */}
        {activeTab === "settings" && (
          <div className="space-y-4">

            <div className="bg-white border border-gray-300 p-5 rounded-lg space-y-4">
              <h4 className="text-sm font-semibold text-gray-800">Application Settings</h4>

              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-semibold text-gray-800">Stealth Mode (Calculator)</div>
                  <div className="text-xs text-gray-500">Hides app behind a calculator interface</div>
                </div>
                <input type="checkbox" checked={stealthEnabled} onChange={e => {
                  const val = e.target.checked;
                  setStealthEnabled(val);
                  localStorage.setItem("stealth_enabled", String(val));
                }} className="w-4 h-4" />
              </div>

              {stealthEnabled && (
                <div className="space-y-1 pt-2">
                  <label className="text-xs font-semibold text-gray-700">Calculator Unlock PIN</label>
                  <input type="password" maxLength={4} value={calculatorPin} onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setCalculatorPin(val);
                    localStorage.setItem("calc_pin", val);
                  }} className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-slate-500 w-24" />
                </div>
              )}

              <hr className="border-gray-200" />

              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-semibold text-gray-800">Shake to Alert</div>
                  <div className="text-xs text-gray-500">Trigger SOS by shaking device</div>
                </div>
                <input type="checkbox" checked={shakeEnabled} onChange={e => {
                  const val = e.target.checked;
                  setShakeEnabled(val);
                  localStorage.setItem("shake_enabled", String(val));
                }} className="w-4 h-4" />
              </div>

              <hr className="border-gray-200" />

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-800 block">Fake Call Name</label>
                <input type="text" value={fakeCallerName} onChange={e => {
                  setFakeCallerName(e.target.value);
                  localStorage.setItem("fake_caller_name", e.target.value);
                }} className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-slate-500 w-full" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
