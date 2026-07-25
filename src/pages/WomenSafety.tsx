import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  Shield, AlertOctagon, Phone, User, Plus, Heart, 
  HelpCircle, CheckCircle, X, Volume2, Camera, Eye, 
  Map, Settings, Play, Square, RefreshCw, Layers, Radio, Globe, ExternalLink
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
                ? "bg-purple-650 hover:bg-purple-750 text-white row-span-2 h-26" 
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
  const [activeTab, setActiveTab] = useState<"deterrents" | "scanner" | "ncw" | "routes" | "settings">("deterrents");
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
  const [fakeCallerName, setFakeCallerName] = useState(() => localStorage.getItem("fake_caller_name") || (lang === "hi" ? "पिताजी (घर)" : "Papa (Home)"));
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
  const [directionsUrl, setDirectionsUrl] = useState("");
  const [ratingsList, setRatingsList] = useState<any[]>([]);
  const [newStreetName, setNewStreetName] = useState("");
  const [newRatingVal, setNewRatingVal] = useState(4);
  const [newRatingNotes, setNewRatingNotes] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  // Audio Evidence states
  const [helpSubTab, setHelpSubTab] = useState<"panic" | "guardians">("panic");
  const [ncwSubTab, setNcwSubTab] = useState<"file" | "status">("file");
  const [routeSubTab, setRouteSubTab] = useState<"nav" | "ratings" | "directory">("nav");

  const [complaintsPage, setComplaintsPage] = useState(1);
  const [ratingsPage, setRatingsPage] = useState(1);
  const [directoryPage, setDirectoryPage] = useState(1);
  const itemsPerPage = 3;

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

  // Real Magnetometer Sensor query (No simulation, 100% authentic)
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

  // Fetch filed complaints when tab becomes active
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
        setSuccessMsg(lang === "hi" ? "शिकायत सफलतापूर्वक दर्ज की गई!" : "Complaint submitted successfully!");
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
            {fakeCallerName.slice(0, 2)}
          </div>
          <h2 className="text-2xl font-bold font-display">{fakeCallerName}</h2>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
            {fakeCallConnected ? formatTime(fakeCallTime) : (lang === "hi" ? "आने वाली कॉल..." : "Incoming call...")}
          </p>
        </div>

        {fakeCallConnected ? (
          <div className="flex flex-col items-center gap-10 pb-16">
            <div className="w-16 h-16 bg-red-650 rounded-full flex items-center justify-center shadow-lg cursor-pointer animate-bounce"
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
      {/* Header */}
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

      {/* Tabs list (5 columns now) */}
      <div className="flex bg-white border border-rose-100 rounded-xl p-1 shadow-sm shrink-0 overflow-x-auto gap-0.5 no-scrollbar">
        {[
          { key: "deterrents", title: lang === "hi" ? "🚨 पैनिक & SOS" : "🚨 Help Button", icon: AlertOctagon },
          { key: "scanner", title: lang === "hi" ? "🔍 कैमरा स्कैनर" : "🔍 Lens Scan", icon: Camera },
          { key: "ncw", title: lang === "hi" ? "📝 शिकायत डेस्क" : "📝 Complaint", icon: Globe },
          { key: "routes", title: lang === "hi" ? "🗺️ सुरक्षित मार्ग" : "🗺️ Safe Route", icon: Map },
          { key: "settings", title: lang === "hi" ? "⚙️ सेटिंग्स" : "⚙️ Settings", icon: Settings },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button 
              key={t.key}
              onClick={() => {
                setActiveTab(t.key as any);
                stopCamera();
              }}
              className={`flex-1 shrink-0 py-2 px-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition flex flex-col items-center gap-1 cursor-pointer min-w-[70px] text-center leading-tight ${
                activeTab === t.key 
                  ? "bg-rose-600 text-white shadow-md font-bold" 
                  : "text-slate-450 hover:text-slate-700"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
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
          {/* Inner Sub-tab Navigation */}
          <div className="flex bg-rose-50 border border-rose-100 rounded-xl p-1 shadow-sm shrink-0 gap-1">
            <button 
              onClick={() => setHelpSubTab("panic")}
              className={`flex-1 py-2 rounded-lg text-[10.5px] font-black uppercase tracking-wider transition cursor-pointer text-center ${
                helpSubTab === "panic" 
                  ? "bg-rose-600 text-white shadow-md" 
                  : "text-rose-700 hover:bg-rose-100"
              }`}
            >
              {lang === "hi" ? "🚨 आपातकालीन" : "🚨 Emergency Panel"}
            </button>
            <button 
              onClick={() => setHelpSubTab("guardians")}
              className={`flex-1 py-2 rounded-lg text-[10.5px] font-black uppercase tracking-wider transition cursor-pointer text-center ${
                helpSubTab === "guardians" 
                  ? "bg-rose-600 text-white shadow-md" 
                  : "text-rose-700 hover:bg-rose-100"
              }`}
            >
              {lang === "hi" ? "👥  अभिभावक" : "👥 Guardians"}
            </button>
          </div>

          {helpSubTab === "panic" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col items-center justify-center py-7 bg-white border border-rose-150 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-rose-50/10 pointer-events-none"></div>
            
            <button 
              onClick={handleSOS}
              disabled={sosActive}
              className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-500 relative cursor-pointer ${
                sosActive 
                  ? "bg-rose-900 scale-95 shadow-inner" 
                  : "bg-gradient-to-br from-rose-500 to-red-650 hover:scale-105 shadow-[0_10px_25px_rgba(244,63,94,0.3)]"
              }`}
            >
              {!sosActive && (
                <>
                  <div className="absolute inset-0 rounded-full border border-rose-450/30 animate-ping"></div>
                  <div className="absolute -inset-4 rounded-full border border-rose-450/10 animate-pulse"></div>
                </>
              )}
              <AlertOctagon className="w-10 h-10 text-white mb-1.5" />
              <span className="text-white text-xs font-black uppercase tracking-wider">
                {sosActive ? (lang === "hi" ? "भेज रहे हैं..." : "Sending...") : (lang === "hi" ? "🚨 मदद बटन" : "🚨 Help Button")}
              </span>
            </button>
            <p className="text-[10px] text-rose-600 font-bold uppercase tracking-widest mt-4 text-center px-4 leading-relaxed">
              {lang === "hi" ? "इसे दबाते ही परिवार को आपकी लोकेशन और ईमेल अलर्ट मिल जाएगा।" : "Press this to send your live location and email alert to your family."}
            </p>
          </div>

          {sosFired && (
            <div className="bg-red-50 border-2 border-red-200/80 rounded-2xl p-5 shadow-sm space-y-4 animate-scaleUp text-slate-800">
              <div className="flex items-center gap-2 text-red-600 font-extrabold text-sm">
                <Radio className="w-5 h-5 text-red-650 animate-ping" />
                <span>{lang === "hi" ? "🚨 अलर्ट शुरू हो गया है!" : "🚨 Alert Active!"}</span>
              </div>
              
              <p className="text-[11px] text-slate-650 leading-relaxed font-semibold">
                {lang === "hi" 
                  ? "आपके परिवार को आपकी लोकेशन ईमेल कर दी गई है। साथ ही सुरक्षा के लिए 10 सेकंड का बैकग्राउंड रिकॉर्डर शुरू हो गया है। नीचे दिए बटनों से मदद लें:" 
                  : "Your family has been emailed your live location. A 10-second security voice recorder has also started. Use the buttons below for help:"}
              </p>

              <div className="flex justify-center">
                <a 
                  href="tel:1091"
                  className="w-full bg-red-650 hover:bg-red-750 text-white py-2.5 px-4 rounded-xl text-xs font-black text-center flex items-center justify-center gap-2 shadow-md transition decoration-none animate-bounce"
                >
                  <span>{lang === "hi" ? "हेल्पलाइन कॉल (1091)" : "Call Helpline (1091)"}</span>
                </a>
              </div>

              <button 
                onClick={() => setSosFired(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
              >
                {lang === "hi" ? "अलर्ट बंद करें" : "Turn off Alert"}
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-rose-100 p-4 rounded-xl flex flex-col justify-between space-y-4 shadow-sm">
              <div>
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <Phone className="w-4 h-4 text-emerald-500 fill-emerald-105" />
                  {lang === "hi" ? "📞 बचाव फ़ोन कॉल (Fake)" : "📞 Save Me Call"}
                </h4>
                <p className="text-[9px] text-slate-450 font-semibold mt-1">
                  {lang === "hi" ? "बातचीत का नाटक करके पीछा करने वाले को डराने के लिए फ़ोन पर घंटी बजाएं।" : "Pretend to speak to family to escape stalkers by ringing your phone."}
                </p>
              </div>
              <button 
                onClick={() => {
                  setFakeCallActive(true);
                  playRingtone();
                  startFakeCallHaptics();
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs shadow-sm transition cursor-pointer"
              >
                {lang === "hi" ? "घंटी बजाएं" : "Ring Phone"}
              </button>
            </div>

            <div className="bg-white border border-rose-100 p-4 rounded-xl flex flex-col justify-between space-y-4 shadow-sm">
              <div>
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <Volume2 className="w-4 h-4 text-rose-500" />
                  {lang === "hi" ? "🔊 तेज़ पुलिस अलार्म" : "🔊 Loud Alarm"}
                </h4>
                <p className="text-[9px] text-slate-450 font-semibold mt-1">
                  {lang === "hi" ? "हमलावर को डराने और लोगों को सतर्क करने के लिए तेज़ पुलिस सायरन बजाएं।" : "Play a very loud police siren to scare attackers and attract attention."}
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
                className={`w-full font-bold py-2 rounded-lg text-xs shadow-md transition cursor-pointer ${
                  sirenActive ? "bg-slate-200 text-slate-700" : "bg-rose-600 hover:bg-rose-700 text-white"
                }`}
              >
                {sirenActive ? (lang === "hi" ? "अलार्म बंद करें" : "Stop Alarm") : (lang === "hi" ? "अलार्म चालू करें" : "Start Alarm")}
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

            </div>
          )}

          {helpSubTab === "guardians" && (
            <div className="bg-white border border-rose-100 p-4 shadow-sm space-y-4 rounded-2xl animate-fadeIn">
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
              <p className="text-[9px] text-slate-450 text-center py-4 font-semibold bg-rose-50/30 rounded-xl">
                {lang === "hi" ? "कोई अभिभावक दर्ज नहीं है। ईमेल या नंबर जोड़ें।" : "No contacts registered. Register emails for free alerts."}
              </p>
            )}
          </div>
        )}
      </div>
    )}

      {/* TAB 2: SCANNERS */}
      {activeTab === "scanner" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white border border-rose-100 p-5 rounded-2xl space-y-4 text-slate-800 shadow-sm">
            <div className="flex justify-between items-center border-b border-rose-100 pb-2">
              <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-4.5 h-4.5 text-rose-500" />
                {lang === "hi" ? "🔍 शीशा कैमरा खोजक" : "🔍 Mirror Camera Finder"}
              </h4>
              <button 
                onClick={() => {
                  setIsEMFActive(!isEMFActive);
                  setEmfValue(0.0);
                }}
                className={`px-3 py-1 rounded-lg text-[9px] font-extrabold uppercase transition cursor-pointer ${
                  isEMFActive ? "bg-red-650 text-white" : "bg-slate-100 text-slate-650"
                }`}
              >
                {isEMFActive ? (lang === "hi" ? "बंद करें" : "Disable") : (lang === "hi" ? "स्कैन करें" : "Scan")}
              </button>
            </div>

            <p className="text-[9px] text-slate-500 font-semibold leading-relaxed">
              {lang === "hi" ? "ट्रायल रूम के शीशे या दीवारों के पीछे छिपे कैमरों के चुंबकीय सिग्नल्स को ढूँढने में मदद करता है।" : "Finds hidden spy cameras behind mirrors or walls in hotel/trial rooms by detecting magnetic fields."}
            </p>

            {isEMFActive ? (
              isSensorSupported ? (
                <div className="flex flex-col items-center py-4 space-y-3">
                  <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 ${
                    emfValue > 85 
                      ? "border-red-650 bg-red-50 shadow-[0_0_20px_rgba(239,68,68,0.2)]" 
                      : emfValue > 55
                      ? "border-amber-500 bg-amber-50 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                      : "border-rose-500 bg-slate-50"
                  }`}>
                    <span className="text-2xl font-mono font-black text-slate-800">{emfValue}</span>
                    <span className="text-[8px] font-bold text-slate-550 tracking-wider">µTesla</span>
                  </div>

                  <div className="text-center">
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest ${
                      emfValue > 85 ? "text-red-650" : emfValue > 55 ? "text-amber-600" : "text-rose-600"
                    }`}>
                      {emfValue > 85 ? (lang === "hi" ? "🚨 कैमरा सिग्नल्स का पता चला!" : "🚨 Camera Signals Detected!") : emfValue > 55 ? (lang === "hi" ? "⚠️ सामान्य से अधिक सिग्नल्स" : "⚠️ High Signals") : (lang === "hi" ? "✅ सुरक्षित इलाका" : "✅ Safe Ambient Field")}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center space-y-1">
                  <span className="text-[10px] font-black text-red-700 block uppercase tracking-wider">{lang === "hi" ? "सेंसर काम नहीं कर रहा" : "Sensor Unavailable"}</span>
                  <p className="text-[9px] text-red-600 font-bold leading-relaxed">
                    {lang === "hi" ? "इस काम के लिए आपके फ़ोन में दिशा-सूचक (Compass) सेंसर होना ज़रूरी है जो इस फ़ोन में उपलब्ध नहीं है।" : "This feature requires a compass hardware sensor. Your device does not support this sensor API."}
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-6 text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-50 rounded-xl border border-slate-100">
                {lang === "hi" ? "स्कैनर बंद है" : "Scanner Off"}
              </div>
            )}
          </div>

          <div className="bg-white border border-rose-100 p-5 rounded-2xl space-y-4 text-slate-800 shadow-sm">
            <div className="flex justify-between items-center border-b border-rose-100 pb-2">
              <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4.5 h-4.5 text-rose-500" />
                {lang === "hi" ? "🔴 लाल बत्ती लेंस स्कैनर" : "🔴 Red Light Lens Scan"}
              </h4>
              <button 
                onClick={() => {
                  if (isCameraActive) stopCamera();
                  else startCamera();
                }}
                className={`px-3 py-1 rounded-lg text-[9px] font-extrabold uppercase transition cursor-pointer ${
                  isCameraActive ? "bg-red-650 text-white" : "bg-slate-100 text-slate-650"
                }`}
              >
                {isCameraActive ? (lang === "hi" ? "कैमरा बंद करें" : "Close Camera") : (lang === "hi" ? "कैमरा खोलें" : "Open Camera")}
              </button>
            </div>

            <p className="text-[9px] text-slate-550 font-semibold leading-relaxed">
              {lang === "hi" ? "कमरे में अंधेरा करके कैमरे के लेंस की चमक को लाल रंग के फिल्टर में देखें।" : "Opens your back camera with an optimized high-contrast red filter to highlight reflection points from lens coatings."}
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
                  {lang === "hi" ? "कैमरा सक्रिय" : "Camera Active"}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-50 rounded-xl border border-slate-100">
                {lang === "hi" ? "कैमरा बंद है" : "Camera Offline"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: NCW PORTAL & INCIDENT REPORTING DESK */}
      {activeTab === "ncw" && (
        <div className="space-y-4 animate-fadeIn text-slate-800">
          {/* Quick Access to Official Portals (Browser Launch) */}
          <div className="bg-white border border-rose-100 p-4 rounded-2xl space-y-3 shadow-sm">
            <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-b border-rose-100 pb-2">
              <Globe className="w-4 h-4 text-rose-550" />
              {lang === "hi" ? "महिला आयोग आधिकारिक लिंक" : "Official Women Commission Portals"}
            </h4>
            <p className="text-[9px] text-slate-450 font-semibold leading-relaxed">
              If you wish to file a report directly with the National Commission for Women, click the buttons below to open the official portals in your phone browser:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <a 
                href="https://www.ncw.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-rose-50 text-rose-700 border border-rose-200/50 hover:bg-rose-100 rounded-xl text-[9px] font-black uppercase tracking-wider text-center decoration-none flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>NCW Website</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="https://ncwapps.nic.in/onlinecomplaintsv2/"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-rose-50 text-rose-700 border border-rose-200/50 hover:bg-rose-100 rounded-xl text-[9px] font-black uppercase tracking-wider text-center decoration-none flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>NCW Complaints</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* RPF Internal Complaint Lodging Desk */}
          <div className="bg-white border border-rose-100 p-4 rounded-2xl space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-rose-100 pb-2">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4.5 h-4.5 text-rose-600 fill-rose-100" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-850">
                  {lang === "hi" ? "आरपीएफ अपराध एवं शिकायत डेस्क" : "RPF Crime & Complaint Desk"}
                </h4>
              </div>
              <span className="text-[8px] font-mono font-black uppercase tracking-wider bg-rose-50 border border-rose-200 text-rose-750 px-2 py-0.5 rounded-full">
                {lang === "hi" ? "सक्रिय डेस्क" : "Active Desk"}
              </span>
            </div>

            <form onSubmit={handleComplaintSubmit} className="space-y-4">
              {/* Anonymous Report Toggle */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-[10px] font-black block text-slate-800">
                    {lang === "hi" ? "गुमनाम शिकायत (Anonymous)" : "File Anonymously"}
                  </span>
                  <span className="text-[8px] text-slate-450 font-semibold block mt-0.5">
                    Hides your name and phone number from the report logs.
                  </span>
                </div>
                <input 
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  className="w-4.5 h-4.5 accent-rose-600 cursor-pointer"
                />
              </div>

              {formStep === 1 && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-rose-600 uppercase tracking-widest">Step 1 of 3: Complainant Details</span>
                    <button 
                      type="button" 
                      onClick={() => setFormStep(2)}
                      className="text-[9.5px] font-black text-rose-600 hover:underline cursor-pointer"
                    >
                      Next Step &rarr;
                    </button>
                  </div>

                  {!isAnonymous && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-450 uppercase tracking-wider block">Your Name</label>
                        <input 
                          type="text" 
                          value={complainantName}
                          onChange={e => setComplainantName(e.target.value)}
                          required
                          className="w-full border border-rose-150 bg-slate-50 rounded-lg text-xs px-2.5 py-1.5 font-bold outline-none text-slate-800 focus:border-rose-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-450 uppercase tracking-wider block">Phone Number</label>
                        <input 
                          type="tel" 
                          value={complainantPhone}
                          onChange={e => setComplainantPhone(e.target.value)}
                          required
                          className="w-full border border-rose-150 bg-slate-50 rounded-lg text-xs px-2.5 py-1.5 font-bold outline-none text-slate-800 focus:border-rose-500"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-450 uppercase tracking-wider block">Select Complaint Category</label>
                    <select 
                      value={complaintType}
                      onChange={e => setComplaintType(e.target.value)}
                      className="w-full border border-rose-150 bg-slate-50 rounded-lg text-xs px-2.5 py-1.5 font-bold outline-none text-slate-750 cursor-pointer focus:border-rose-500"
                    >
                      <option value="Harassment / Eve Teasing">Harassment / Eve Teasing (Verbal Abuse)</option>
                      <option value="Domestic Abuse / Violence">Domestic Abuse / Violence</option>
                      <option value="Cyber Stalking / Blackmail">Cyber Stalking / Blackmail</option>
                      <option value="Physical Threat / Assault">Physical Threat / Assault</option>
                      <option value="Stalking in Public Spaces">Stalking in Public Spaces</option>
                      <option value="Other Crime / Emergency">Other Crime / Emergency</option>
                    </select>
                  </div>
                </div>
              )}

              {formStep === 2 && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <button 
                      type="button" 
                      onClick={() => setFormStep(1)}
                      className="text-[9.5px] font-black text-slate-500 hover:underline cursor-pointer"
                    >
                      &larr; Back
                    </button>
                    <span className="text-[9px] font-bold text-rose-600 uppercase tracking-widest">Step 2 of 3: Incident Info</span>
                    <button 
                      type="button" 
                      onClick={() => setFormStep(3)}
                      className="text-[9.5px] font-black text-rose-600 hover:underline cursor-pointer"
                    >
                      Next Step &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-450 uppercase tracking-wider block">Incident Date</label>
                      <input 
                        type="date" 
                        value={incidentDate}
                        onChange={e => setIncidentDate(e.target.value)}
                        required
                        className="w-full border border-rose-150 bg-slate-50 rounded-lg text-xs px-2.5 py-1.5 font-bold outline-none text-slate-800 focus:border-rose-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-450 uppercase tracking-wider block">Incident Location (Area/Pincode)</label>
                      <input 
                        type="text" 
                        value={incidentLocation}
                        onChange={e => setIncidentLocation(e.target.value)}
                        required
                        placeholder="e.g. Karond Chowk, Bhopal"
                        className="w-full border border-rose-150 bg-slate-50 rounded-lg text-xs px-2.5 py-1.5 font-bold outline-none text-slate-800 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-450 uppercase tracking-wider block">Incident Details (Describe clearly)</label>
                    <textarea 
                      value={complaintDesc}
                      onChange={e => setComplaintDesc(e.target.value)}
                      required
                      rows={3}
                      placeholder="Please enter a detailed description of what occurred..."
                      className="w-full border border-rose-150 bg-slate-50 rounded-lg text-xs px-2.5 py-2 font-bold outline-none text-slate-800 focus:border-rose-500"
                    />
                  </div>
                </div>
              )}

              {formStep === 3 && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <button 
                      type="button" 
                      onClick={() => setFormStep(2)}
                      className="text-[9.5px] font-black text-slate-500 hover:underline cursor-pointer"
                    >
                      &larr; Back
                    </button>
                    <span className="text-[9px] font-bold text-rose-600 uppercase tracking-widest">Step 3 of 3: Suspect details & Submit</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-450 uppercase tracking-wider block">Suspect Description (Optional)</label>
                    <input 
                      type="text" 
                      value={suspectDetails}
                      onChange={e => setSuspectDetails(e.target.value)}
                      placeholder="Name, clothing, vehicle details, physical attributes..."
                      className="w-full border border-rose-150 bg-slate-50 rounded-lg text-xs px-2.5 py-1.5 font-bold outline-none text-slate-800 focus:border-rose-500"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={submittingComplaint}
                    className="w-full mt-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-lg text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    {submittingComplaint ? "Filing Official Report..." : "Submit Complaint Report"}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Filed Complaints Tracking Board */}
          <div className="bg-white border border-rose-100 p-4 rounded-2xl space-y-4 shadow-sm">
            <h4 className="text-xs font-black uppercase tracking-wider border-b border-rose-100 pb-2">
              {lang === "hi" ? "मेरी दर्ज शिकायतें स्थिति" : "My Filed Complaints (Live Status Tracker)"}
            </h4>

            {fetchingComplaints ? (
              <div className="text-center py-6">
                <div className="w-5 h-5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider animate-pulse">Syncing logs...</span>
              </div>
            ) : complaintsList.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {complaintsList.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10.5px] font-black text-slate-850 block">{item.complaint_type}</span>
                        <span className="text-[7.5px] font-mono text-slate-400 block mt-0.5">Report ID: RPF-2026-00{item.id}</span>
                      </div>
                      <span className={`text-[7.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        item.status === 'Resolved' 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                          : item.status === 'Under Investigation'
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <p className="text-[9px] text-slate-500 leading-relaxed font-semibold">{item.description}</p>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/50 text-[8px] font-bold text-slate-400">
                      <span>Location: {item.location}</span>
                      <span>Date: {item.incident_date}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[9px] text-slate-400 text-center py-4 font-semibold">
                No incident reports filed yet. Use the desk above to submit a report if needed.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SAFE MAP */}
      {activeTab === "routes" && (
        <div className="space-y-4 animate-fadeIn text-slate-800">
          {/* Inner Sub-tab Navigation */}
          <div className="flex bg-rose-50 border border-rose-100 rounded-xl p-1 shadow-sm shrink-0 gap-1 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setRouteSubTab("nav")}
              className={`flex-1 shrink-0 py-2 px-1 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition cursor-pointer text-center min-w-[85px] ${
                routeSubTab === "nav" 
                  ? "bg-rose-600 text-white shadow-md" 
                  : "text-rose-700 hover:bg-rose-100"
              }`}
            >
              {lang === "hi" ? "🗺️ मार्ग खोजें" : "🗺️ Find Route"}
            </button>
            <button 
              onClick={() => setRouteSubTab("ratings")}
              className={`flex-1 shrink-0 py-2 px-1 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition cursor-pointer text-center min-w-[85px] ${
                routeSubTab === "ratings" 
                  ? "bg-rose-600 text-white shadow-md" 
                  : "text-rose-700 hover:bg-rose-100"
              }`}
            >
              {lang === "hi" ? "⭐ सुरक्षा समीक्षा" : "⭐ Street Reviews"}
            </button>
            <button 
              onClick={() => setRouteSubTab("directory")}
              className={`flex-1 shrink-0 py-2 px-1 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition cursor-pointer text-center min-w-[85px] ${
                routeSubTab === "directory" 
                  ? "bg-rose-600 text-white shadow-md" 
                  : "text-rose-700 hover:bg-rose-100"
              }`}
            >
              {lang === "hi" ? "🏢 सुरक्षा निर्देशिका" : "🏢 Local Centers"}
            </button>
          </div>

          {routeSubTab === "nav" && (
            <div className="bg-white border border-rose-100 p-4 rounded-2xl space-y-4 shadow-sm animate-fadeIn">
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
          )}

          {routeSubTab === "ratings" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white border border-rose-100 p-4 rounded-2xl space-y-4 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-wider border-b border-rose-100 pb-2">
                  {lang === "hi" ? "सुरक्षित मार्ग समीक्षा" : "Street Safety Rating"}
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

                {ratingsList.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    {(() => {
                      const idxLast = ratingsPage * itemsPerPage;
                      const idxFirst = idxLast - itemsPerPage;
                      const currentList = ratingsList.slice(idxFirst, idxLast);
                      const totalPages = Math.ceil(ratingsList.length / itemsPerPage);

                      return (
                        <>
                          {currentList.map((item, idx) => (
                            <div key={idx} className="bg-slate-50 border border-slate-150 p-3 rounded-xl space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-700">{item.location_name}</span>
                                <span className="text-[9px] text-amber-500 font-bold">{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</span>
                              </div>
                              <p className="text-[9px] text-slate-550 font-semibold leading-relaxed">{item.notes}</p>
                              <span className="text-[8px] text-slate-450 block font-semibold">Post Date: {new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                          ))}

                          {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2.5 pt-3 border-t border-slate-100">
                              <button 
                                type="button"
                                disabled={ratingsPage === 1}
                                onClick={() => setRatingsPage(prev => Math.max(1, prev - 1))}
                                className="px-2.5 py-1 text-[8.5px] font-black uppercase tracking-wider rounded bg-slate-100 hover:bg-slate-200 text-slate-650 disabled:opacity-40 transition cursor-pointer"
                              >
                                &larr; Prev
                              </button>
                              <span className="text-[9px] font-black text-slate-500">Page {ratingsPage} of {totalPages}</span>
                              <button 
                                type="button"
                                disabled={ratingsPage === totalPages}
                                onClick={() => setRatingsPage(prev => Math.min(totalPages, prev + 1))}
                                className="px-2.5 py-1 text-[8.5px] font-black uppercase tracking-wider rounded bg-slate-100 hover:bg-slate-200 text-slate-650 disabled:opacity-40 transition cursor-pointer"
                              >
                                Next &rarr;
                              </button>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <p className="text-[9px] text-slate-450 text-center py-6 bg-slate-50/50 rounded-xl">
                    No safety reviews posted yet. Feel free to rate a street safety above.
                  </p>
                )}
              </div>
            </div>
          )}

          {routeSubTab === "directory" && (
            <div className="bg-white border border-rose-100 p-4 shadow-sm space-y-4 rounded-2xl animate-fadeIn">
              <h4 className="font-display font-bold text-xs text-slate-800 uppercase tracking-widest border-b border-rose-100 pb-2 flex items-center gap-1.5">
                <Shield className="w-4.5 h-4.5 text-rose-500" />
                {lang === "hi" ? "स्थानीय सुरक्षा निर्देशिका" : "Local Protection Directory"}
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
                <div className="space-y-3 pt-2">
                  {(() => {
                    const idxLast = directoryPage * itemsPerPage;
                    const idxFirst = idxLast - itemsPerPage;
                    const currentList = directoryList.slice(idxFirst, idxLast);
                    const totalPages = Math.ceil(directoryList.length / itemsPerPage);

                    return (
                      <>
                        {currentList.map((item, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-150 p-3 rounded-xl space-y-1">
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-black text-slate-800 leading-tight">{item.name}</span>
                              <span className="text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-rose-250 bg-rose-50 text-rose-700">
                                {item.type}
                              </span>
                            </div>
                            <p className="text-[9px] text-slate-505 leading-relaxed font-semibold">{item.address}</p>
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

                        {totalPages > 1 && (
                          <div className="flex justify-center items-center gap-2.5 pt-3 border-t border-slate-100">
                            <button 
                              type="button"
                              disabled={directoryPage === 1}
                              onClick={() => setDirectoryPage(prev => Math.max(1, prev - 1))}
                              className="px-2.5 py-1 text-[8.5px] font-black uppercase tracking-wider rounded bg-slate-100 hover:bg-slate-200 text-slate-655 disabled:opacity-40 transition cursor-pointer"
                            >
                              &larr; Prev
                            </button>
                            <span className="text-[9px] font-black text-slate-500">Page {directoryPage} of {totalPages}</span>
                            <button 
                              type="button"
                              disabled={directoryPage === totalPages}
                              onClick={() => setDirectoryPage(prev => Math.min(totalPages, prev + 1))}
                              className="px-2.5 py-1 text-[8.5px] font-black uppercase tracking-wider rounded bg-slate-100 hover:bg-slate-200 text-slate-655 disabled:opacity-40 transition cursor-pointer"
                            >
                              Next &rarr;
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              ) : (
                <p className="text-[9px] text-slate-450 text-center py-6 bg-slate-50/50 rounded-xl">
                  {lang === "hi" ? "कोई स्थानीय केंद्र ढूंढने के लिए पिनकोड दर्ज करें।" : "Enter pincode to find local safety resources nearby."}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SETTINGS */}
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
                <label className="text-[9px] font-black text-slate-455 uppercase tracking-wider block">Unlock PIN Code (4 Digits)</label>
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

          <div className="bg-white border border-rose-100 p-5 rounded-2xl space-y-4 shadow-sm">
            <h4 className="text-xs font-black uppercase tracking-wider border-b border-rose-100 pb-2">
              {lang === "hi" ? "बचाव फ़ोन कॉल सेटिंग" : "Save Me Call Settings"}
            </h4>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-450 uppercase tracking-wider block">
                {lang === "hi" ? "कॉल करने वाले का नाम (जैसे: पुलिस, पिताजी)" : "Display Name of Caller (e.g. Papa, Police)"}
              </label>
              <input 
                type="text"
                value={fakeCallerName}
                onChange={e => {
                  setFakeCallerName(e.target.value);
                  localStorage.setItem("fake_caller_name", e.target.value);
                }}
                className="w-full max-w-[200px] border border-rose-200 bg-slate-50 rounded-lg text-xs px-3 py-2 font-bold text-slate-800 outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
