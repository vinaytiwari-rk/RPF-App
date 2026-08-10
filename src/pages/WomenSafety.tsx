import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Shield, AlertOctagon, Phone, Camera, Map, Settings, 
  Lock, X, Volume2, CheckCircle, Activity, FileText, Radio, 
  ExternalLink, Crosshair, Navigation, AlertTriangle, Users, Car, MapPin, Search, Battery, Share2
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAuth } from "../context/AuthContext";
import { 
  initAudio, playSiren, stopSiren, 
  playRingtone, stopRingtone, getRouteSafetyIndex 
} from "../utils/womenSafetyTools";

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

  // --- SMART CALCULATORS STATE ---
  const [activeCalc, setActiveCalc] = useState<string | null>(null);
  const [nearbyPolice, setNearbyPolice] = useState<any[]>([]);
  const [locating, setLocating] = useState(false);
  const [morseActive, setMorseActive] = useState(false);
  const [morseTimerId, setMorseTimerId] = useState<NodeJS.Timeout | null>(null);
  const [routeLight, setRouteLight] = useState(2); // 0-3 rating
  const [routeCrowd, setRouteCrowd] = useState(2); // 0-3 rating
  const [routeGuard, setRouteGuard] = useState(1); // 0-3 rating
  const [panicBreathTimer, setPanicBreathTimer] = useState(4);
  const [panicPhase, setPanicPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [panicBreathIntervalId, setPanicBreathIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [alarmActive, setAlarmActive] = useState(false);
  const [alarmFrequency, setAlarmFrequency] = useState(2500); // 2500Hz
  const [alarmOsc, setAlarmOsc] = useState<OscillatorNode | null>(null);
  const [alarmGain, setAlarmGain] = useState<GainNode | null>(null);
  const [heartbeatTimeout, setHeartbeatTimeout] = useState(10); // minutes

  // Settings
  const [stealthEnabled, setStealthEnabled] = useState(() => localStorage.getItem("stealth_enabled") === "true");
  const [calculatorPin, setCalculatorPin] = useState(() => localStorage.getItem("calc_pin") || "7777");
  const [isUnlocked, setIsUnlocked] = useState(!stealthEnabled);

  // States
  const [activeTab, setActiveTab] = useState<"deterrents" | "scanner" | "ncw" | "routes" | "settings" | "tools" | "rto" | "family">("deterrents");
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

  // --- RTO Vahan Trace State ---
  const [rtoPlate, setRtoPlate] = useState("");
  const [rtoResult, setRtoResult] = useState<any>(null);
  const [rtoLoading, setRtoLoading] = useState(false);
  const [rtoError, setRtoError] = useState("");

  // --- Family GPS State ---
  const [familyGroups, setFamilyGroups] = useState<any[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [familyLocations, setFamilyLocations] = useState<any[]>([]);
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [familyLoading, setFamilyLoading] = useState(false);


  const triggerHaptic = (pattern = [100]) => {
    if ("vibrate" in navigator) navigator.vibrate(pattern);
  };

  useEffect(() => {
    return () => {
      if (morseTimerId) clearTimeout(morseTimerId);
      if (panicBreathIntervalId) clearInterval(panicBreathIntervalId);
      stopAudioAlarm();
    };
  }, [morseTimerId, panicBreathIntervalId]);

  
  // --- RTO Vahan Trace Functions ---
  const searchRTOVehicle = async () => {
    if (!rtoPlate.trim()) return;
    setRtoLoading(true);
    setRtoError("");
    try {
      const res = await fetch(`/api/rto/vehicle/${encodeURIComponent(rtoPlate)}`);
      const data = await res.json();
      if (data.success) {
        setRtoResult(data.data);
      } else {
        setRtoError(data.error || "Vehicle not found");
        setRtoResult(null);
      }
    } catch (e: any) {
      setRtoError("Error connecting to server");
    } finally {
      setRtoLoading(false);
    }
  };

  // --- Family GPS Functions ---
  const fetchFamilyGroups = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/family/groups?userId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setFamilyGroups(data.data);
        if (data.data.length > 0 && !currentGroupId) {
          setCurrentGroupId(data.data[0].id);
        }
      }
    } catch (e) {}
  };

  const createFamilyGroup = async () => {
    if (!user || !newGroupName.trim()) return;
    setFamilyLoading(true);
    try {
      const res = await fetch('/api/family/group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName, userId: user.id })
      });
      const data = await res.json();
      if (data.success) {
        setNewGroupName("");
        await fetchFamilyGroups();
        setCurrentGroupId(data.data.groupId);
      }
    } catch (e) {}
    setFamilyLoading(false);
  };

  const joinFamilyGroup = async () => {
    if (!user || !inviteCodeInput.trim()) return;
    setFamilyLoading(true);
    try {
      const res = await fetch('/api/family/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCodeInput, userId: user.id })
      });
      const data = await res.json();
      if (data.success) {
        setInviteCodeInput("");
        await fetchFamilyGroups();
        setCurrentGroupId(data.data.groupId);
      } else {
        alert(data.error || "Invalid invite code");
      }
    } catch (e) {}
    setFamilyLoading(false);
  };

  const fetchFamilyLocations = async () => {
    if (!currentGroupId) return;
    try {
      const res = await fetch(`/api/family/locations/${currentGroupId}`);
      const data = await res.json();
      if (data.success) {
        setFamilyLocations(data.data);
      }
    } catch (e) {}
  };

  // Periodic location sync
  useEffect(() => {
    if (activeTab === "family") {
      fetchFamilyGroups();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "family" || !currentGroupId) return;
    fetchFamilyLocations();
    const interval = setInterval(fetchFamilyLocations, 10000); // Every 10s
    return () => clearInterval(interval);
  }, [activeTab, currentGroupId]);

  useEffect(() => {
    if (activeTab !== "family" || !user) return;
    
    let watchId: number;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          let batteryLevel = 100;
          let isCharging = false;
          try {
            if ('getBattery' in navigator) {
              const battery: any = await (navigator as any).getBattery();
              batteryLevel = Math.round(battery.level * 100);
              isCharging = battery.charging;
            }
          } catch (e) {}

          fetch('/api/family/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              battery_level: batteryLevel,
              is_charging: isCharging
            })
          }).catch(() => {});
        },
        (err) => console.log(err),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
    }
    return () => {
      if (watchId && navigator.geolocation) navigator.geolocation.clearWatch(watchId);
    };
  }, [activeTab]);

  const findNearbyPolice = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetch(`/api/public/nearby?type=police&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
            .then(res => res.json())
            .then(d => {
              setLocating(false);
              if (d.success) setNearbyPolice(d.data);
            })
            .catch(() => setLocating(false));
        },
        () => setLocating(false)
      );
    } else {
      setLocating(false);
    }
  };
  
  const startMorseSOS = () => {
    if (morseActive) {
      if (morseTimerId) clearTimeout(morseTimerId);
      setMorseTimerId(null);
      setMorseActive(false);
      const screen = document.getElementById("morse-screen-flash");
      if (screen) screen.style.backgroundColor = "";
      return;
    }

    setMorseActive(true);
    const sequence = [
      200, 200, 200, 200, 200, 600,
      600, 200, 600, 200, 600, 600,
      200, 200, 200, 200, 200, 1200
    ];

    let stepIdx = 0;
    const runSequence = () => {
      const active = stepIdx % 2 === 0;
      const duration = sequence[stepIdx % sequence.length];
      
      const screen = document.getElementById("morse-screen-flash");
      if (screen) {
        screen.style.backgroundColor = active ? "#ffffff" : "#0f172a";
      }

      stepIdx++;
      const tId = setTimeout(runSequence, duration);
      setMorseTimerId(tId);
    };
    runSequence();
  };

  const startPanicBreath = () => {
    if (panicBreathIntervalId) clearInterval(panicBreathIntervalId);
    
    setPanicPhase("inhale");
    setPanicBreathTimer(4);

    const id = setInterval(() => {
      setPanicBreathTimer((prev) => {
        if (prev <= 1) {
          setPanicPhase((currentPhase) => {
            if (currentPhase === "inhale") {
              setPanicBreathTimer(7);
              return "hold";
            } else if (currentPhase === "hold") {
              setPanicBreathTimer(8);
              return "exhale";
            } else {
              setPanicBreathTimer(4);
              return "inhale";
            }
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    setPanicBreathIntervalId(id);
  };

  const stopPanicBreath = () => {
    if (panicBreathIntervalId) {
      clearInterval(panicBreathIntervalId);
      setPanicBreathIntervalId(null);
    }
    setPanicBreathTimer(4);
    setPanicPhase("inhale");
  };

  const startAudioAlarm = () => {
    if (alarmActive) {
      stopAudioAlarm();
      return;
    }

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(alarmFrequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.7, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      setAlarmActive(true);
      setAlarmOsc(osc);
      setAlarmGain(gain);
    } catch (e) {
      console.error("Failed to start Web Audio alarm:", e);
    }
  };

  const stopAudioAlarm = () => {
    if (alarmOsc) {
      try { alarmOsc.stop(); alarmOsc.disconnect(); } catch (e){}
      setAlarmOsc(null);
    }
    if (alarmGain) {
      try { alarmGain.disconnect(); } catch (e){}
      setAlarmGain(null);
    }
    setAlarmActive(false);
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
    { key: "family", label: lang === "hi" ? "परिवार ट्रैकर" : "Family GPS", icon: Users },
    { key: "rto", label: lang === "hi" ? "वाहन ट्रेस" : "RTO Trace", icon: Car },
    { key: "routes", label: lang === "hi" ? "रूट्स" : "Routes", icon: Navigation },
    { key: "settings", label: lang === "hi" ? "सेटिंग" : "Settings", icon: Settings },
    { key: "tools", label: lang === "hi" ? "टूल्स" : "Calculators", icon: Shield },
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
                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-red-500" : ""}`} />
                <span className="text-[9px] sm:text-xs text-center leading-tight sm:leading-normal break-words px-1">{t.label}</span>
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
        {activeTab === "tools" && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h4 className="font-display font-bold text-xs text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>{lang === "hi" ? "आपातकालीन सुरक्षा एवं सहायता टूल्स" : "Safety & Distress Tools"}</span>
              <Shield className="w-4.5 h-4.5 text-red-500 animate-pulse" />
            </h4>

            {/* Tools Grid */}
            <div className="grid grid-cols-2 gap-2 text-center text-slate-350">
              {[
                { key: "morse", title: lang === "hi" ? "SOS मॉर्स विजुअल" : "Morse SOS Flash" },
                { key: "matrix", title: lang === "hi" ? "मार्ग सुरक्षा गुणांक" : "Route Safety Matrix" },
                { key: "breathing", title: lang === "hi" ? "पैनिक श्वास पेसर" : "Distress Breathing" },
                { key: "siren", title: lang === "hi" ? "हाई-डेसिबल अलार्म" : "High-Decibel Siren" }
              ].map(tool => (
                <button
                  key={tool.key}
                  onClick={() => setActiveCalc(tool.key)}
                  className={`p-2.5 rounded-lg text-[10.5px] font-bold border transition ${
                    activeCalc === tool.key ? "bg-red-600 text-white border-red-600" : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  {tool.title}
                </button>
              ))}
            </div>

            {/* Content Container */}
            {activeCalc && (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 mt-2 space-y-4 animate-fadeIn text-xs text-slate-300">
              
              {/* 1. Morse Code SOS */}
              {activeCalc === "morse" && (
                <div className="space-y-3">
                  <h5 className="font-bold text-slate-200">{lang === "hi" ? "मॉर्स कोड विजुअल फ्लैश (SOS)" : "Visual Morse Code SOS Flasher"}</h5>
                  <p className="text-[10px] text-slate-450 leading-normal">{lang === "hi" ? "आपातकाल में रात के समय मॉर्स कोड पैटर्न में स्क्रीन को चमकाने के लिए।" : "Flashes the screen in standard SOS Morse code sequence."}</p>

                  <div 
                    id="morse-screen-flash"
                    className="w-full h-24 rounded-lg bg-slate-900 border border-slate-850 flex items-center justify-center font-black transition-colors duration-100"
                  >
                    <span className="text-xs text-slate-450 tracking-widest">SOS BEACON</span>
                  </div>

                  <button 
                    onClick={startMorseSOS}
                    className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase transition ${
                      morseActive ? "bg-red-650 text-white" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                    }`}
                  >
                    {morseActive ? (lang === "hi" ? "फ्लैशर बंद करें" : "Stop Morse Flash") : (lang === "hi" ? "फ्लैशर चालू करें" : "Start Morse Flash")}
                  </button>
                </div>
              )}

              {/* 2. Route Safety Matrix */}
              {activeCalc === "matrix" && (
                <div className="space-y-3">
                  <h5 className="font-bold text-slate-200">{lang === "hi" ? "मार्ग सुरक्षा सूचकांक निर्धारक" : "Route Safety Risk Assessor"}</h5>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? "प्रकाश (Lighting)" : "Lighting Level"}</label>
                      <select value={routeLight} onChange={e => setRouteLight(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs font-bold text-slate-200 bg-white">
                        <option value="3">Brightly Lit (3)</option>
                        <option value="2">Dimly Lit (2)</option>
                        <option value="0">Pitch Dark (0)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? "भीड़ घनत्व (Crowd Density)" : "Foot Traffic / Crowd"}</label>
                      <select value={routeCrowd} onChange={e => setRouteCrowd(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs font-bold text-slate-200 bg-white">
                        <option value="3">High Foot Traffic (3)</option>
                        <option value="2">Moderate/Normal (2)</option>
                        <option value="0">Deserted (0)</option>
                      </select>
                    </div>
                  </div>

                  {(() => {
                    const { safetyClass, advice, color } = getRouteSafetyIndex(routeLight, routeCrowd, lang === 'hi');
                    return (
                      <div className={`p-3 rounded-lg border font-bold text-center ${color}`}>
                        <p className="text-xs font-black">{safetyClass}</p>
                        <p className="text-[9.5px] mt-1 text-slate-400 font-semibold">{advice}</p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 3. Panic/Distress Breathing */}
              {activeCalc === "breathing" && (
                <div className="space-y-3">
                  <h5 className="font-bold text-slate-200">{lang === "hi" ? "घबराहट निवारण श्वास पेसर" : "Panic State Breathing Pacer"}</h5>
                  <p className="text-[10px] text-slate-450 leading-normal">{lang === "hi" ? "आपातकालीन घबराहट या हाइपरवेंटिलेशन के दौरान श्वास नियंत्रण pacer।" : "Regulates heartbeat and hyperventilation during distress."}</p>

                  <div className="w-full h-24 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center font-black">
                    <p className="text-[9.5px] text-slate-500 uppercase tracking-widest">{panicPhase.toUpperCase()}</p>
                    <p className="text-3xl text-red-500 mt-1">{panicBreathTimer}s</p>
                  </div>

                  <div className="flex gap-2">
                    {!panicBreathIntervalId ? (
                      <button onClick={startPanicBreath} className="flex-1 py-2 bg-red-650 hover:bg-red-700 text-white font-bold rounded-lg text-xs uppercase tracking-wide">
                        {lang === "hi" ? "पेसर शुरू करें" : "Start Breathing"}
                      </button>
                    ) : (
                      <button onClick={stopPanicBreath} className="flex-1 py-2 bg-slate-850 hover:bg-slate-800 text-slate-200 font-bold rounded-lg text-xs uppercase tracking-wide">
                        {lang === "hi" ? "रोकें" : "Stop Pacer"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              
                {/* 5. Nearby Police Locator */}
                {activeCalc === "locator" && (
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-200">{lang === "hi" ? "????? ????? ??????" : "Find Nearby Police Stations"}</h5>
                    <button 
                      onClick={findNearbyPolice}
                      disabled={locating}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs tracking-wide transition"
                    >
                      {locating ? (lang === "hi" ? "???? ?? ??? ??..." : "Locating...") : (lang === "hi" ? "????? ?????? ??????" : "Locate Nearby Police")}
                    </button>
                    {nearbyPolice.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {nearbyPolice.map((st, i) => (
                          <div key={i} className="bg-slate-900 border border-slate-800 p-2 rounded flex justify-between items-center">
                            <span className="font-semibold text-slate-300 text-[10px]">{st.name}</span>
                            <a href={`https://www.google.com/maps/search/?api=1&query=${st.lat},${st.lon}`} target="_blank" rel="noreferrer" className="text-[#00ffff] text-[10px] underline">Map</a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
  
                {/* 4. High-Decibel Siren */}
              {activeCalc === "siren" && (
                <div className="space-y-3">
                  <h5 className="font-bold text-slate-200">{lang === "hi" ? "हाई-डेसिबल अलार्म सायरन" : "High-Decibel Sine Alarm"}</h5>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `सायरन फ्रीक्वेंसी: ${alarmFrequency} Hz` : `Siren Pitch: ${alarmFrequency} Hz`}</label>
                    <input type="range" min="1500" max="3500" step="100" value={alarmFrequency} onChange={e => {
                      setAlarmFrequency(Number(e.target.value));
                      if (alarmActive && alarmOsc) {
                        alarmOsc.frequency.setValueAtTime(Number(e.target.value), 0);
                      }
                    }} className="w-full accent-red-650" />
                  </div>

                  <button 
                    onClick={startAudioAlarm}
                    className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide transition ${
                      alarmActive ? "bg-red-600 text-white hover:bg-red-700 animate-pulse" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                    }`}
                  >
                    {alarmActive ? (lang === "hi" ? "सायरन बंद करें" : "Stop Siren") : (lang === "hi" ? "सायरन चालू करें" : "Activate Siren")}
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
        )}

        {/* RTO Vehicle Trace Tab */}
        {activeTab === "rto" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center">
                  <Car className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 uppercase tracking-wide">RTO Vehicle Trace</h3>
                  <p className="text-xs text-slate-400">Search vehicle registration details instantly</p>
                </div>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={rtoPlate}
                  onChange={(e) => setRtoPlate(e.target.value.toUpperCase())}
                  placeholder="e.g. UP 14 BX 0000" 
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 outline-none focus:border-blue-500 font-mono tracking-widest uppercase"
                />
                <button 
                  onClick={searchRTOVehicle}
                  disabled={rtoLoading || !rtoPlate.trim()}
                  className="bg-blue-600 hover:bg-blue-500 px-5 rounded-lg font-bold text-white transition-colors disabled:opacity-50"
                >
                  {rtoLoading ? <Activity className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </button>
              </div>
              {rtoError && <p className="text-red-400 text-xs mt-3">{rtoError}</p>}
            </div>

            {rtoResult && (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-2xl font-bold font-mono tracking-widest text-slate-100">{rtoResult.plate_number}</h4>
                    <p className="text-sm font-bold text-emerald-400 flex items-center gap-1 mt-1">
                      <CheckCircle className="w-3 h-3" /> STATUS: {rtoResult.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">RTO Code</p>
                    <p className="text-sm font-mono text-slate-300">{rtoResult.rto_code}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Owner Name</p>
                    <p className="text-sm font-bold text-slate-200 truncate">{rtoResult.owner_name}</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Vehicle Model</p>
                    <p className="text-sm font-bold text-slate-200 truncate">{rtoResult.vehicle_model}</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Fuel Type</p>
                    <p className="text-sm font-bold text-slate-200">{rtoResult.fuel_type}</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Reg. Date</p>
                    <p className="text-sm font-bold text-slate-200">{new Date(rtoResult.registration_date).toLocaleDateString()}</p>
                  </div>
                  <div className="col-span-2 bg-slate-950 p-3 rounded-lg border border-slate-800/50 flex justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Insurance Valid Upto</p>
                      <p className="text-sm font-bold text-slate-200">{new Date(rtoResult.insurance_validity).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Fitness Valid Upto</p>
                      <p className="text-sm font-bold text-slate-200">{new Date(rtoResult.fitness_validity).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => { setActiveTab("ncw"); setSuspectDetails(`Vehicle: ${rtoResult.plate_number}\nModel: ${rtoResult.vehicle_model}`); }}
                  className="w-full bg-red-950/50 hover:bg-red-900/50 border border-red-900/50 text-red-400 font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-4"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Report Suspicious Vehicle
                </button>
              </div>
            )}
          </div>
        )}

        {/* Family GPS Locator Tab */}
        {activeTab === "family" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {!currentGroupId ? (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-5">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-100">Family GPS Locator</h3>
                  <p className="text-xs text-slate-400 mt-1">Keep your loved ones safe with real-time tracking.</p>
                </div>
                
                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Create a New Circle</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="e.g. My Family" className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
                      />
                      <button onClick={createFamilyGroup} disabled={familyLoading || !newGroupName.trim()} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-bold text-xs">Create</button>
                    </div>
                  </div>
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-800"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-600 text-xs font-bold uppercase">Or</span>
                    <div className="flex-grow border-t border-slate-800"></div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Join with Invite Code</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" value={inviteCodeInput} onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                        placeholder="Enter 6-digit code" className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none font-mono tracking-widest uppercase"
                      />
                      <button onClick={joinFamilyGroup} disabled={familyLoading || !inviteCodeInput.trim()} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-bold text-xs">Join</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[500px]">
                {/* Header */}
                <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center z-10 relative">
                  <div>
                    <h3 className="font-bold text-slate-100 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      {familyGroups.find(g => g.id === currentGroupId)?.name || "Family Circle"}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 tracking-widest">
                      INVITE CODE: <span className="font-bold text-slate-200">{familyGroups.find(g => g.id === currentGroupId)?.invite_code}</span>
                    </p>
                  </div>
                  <button onClick={() => {
                     if (navigator.share) {
                        navigator.share({
                          title: 'Join my family circle',
                          text: `Join my family safety circle using invite code: ${familyGroups.find(g => g.id === currentGroupId)?.invite_code}`,
                        });
                     } else {
                        alert(`Share this code with family: ${familyGroups.find(g => g.id === currentGroupId)?.invite_code}`);
                     }
                  }} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700">
                    <Share2 className="w-4 h-4 text-slate-300" />
                  </button>
                </div>
                
                {/* Map */}
                <div className="flex-1 relative bg-slate-950">
                  {familyLocations.length > 0 ? (
                    <MapContainer center={[familyLocations[0].latitude, familyLocations[0].longitude]} zoom={13} className="w-full h-full z-0">
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                      />
                      {familyLocations.map((member, idx) => (
                        <Marker 
                          key={member.user_id} 
                          position={[member.latitude, member.longitude]}
                          icon={L.divIcon({
                            className: 'custom-icon',
                            html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(0,0,0,0.3);"><span style="color: white; font-weight: bold; font-size: 10px;">${member.user_name?.charAt(0) || '?'}</span></div>`,
                            iconSize: [24, 24],
                            iconAnchor: [12, 12]
                          })}
                        >
                          <Popup>
                            <div className="text-center font-sans">
                              <strong className="block text-sm text-slate-900">{member.user_name || member.phone}</strong>
                              <span className="text-xs text-slate-500">
                                {member.battery_level !== null ? `🔋 ${member.battery_level}% ${member.is_charging ? '⚡' : ''}` : ''}
                              </span>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-5 text-center">
                      <MapPin className="w-10 h-10 text-slate-700 mb-3" />
                      <p className="text-sm font-bold text-slate-400">Waiting for GPS signals...</p>
                      <p className="text-xs text-slate-600 mt-1">Make sure location permissions are enabled.</p>
                    </div>
                  )}
                </div>

                {/* Member List Panel */}
                <div className="bg-slate-900 border-t border-slate-800 p-4 max-h-48 overflow-y-auto">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Members ({familyLocations.length})</h4>
                  <div className="space-y-3">
                    {familyLocations.map(member => (
                      <div key={member.user_id} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-blue-400 uppercase">
                            {member.user_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-200">{member.user_name || member.phone}</p>
                            <p className="text-[10px] text-slate-500">
                              {new Date(member.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800/50">
                          <Battery className={`w-3.5 h-3.5 ${member.battery_level > 20 ? 'text-green-500' : 'text-red-500'}`} />
                          <span className="text-xs font-bold font-mono text-slate-300">
                            {member.battery_level !== null ? `${member.battery_level}%` : '--'}
                            {member.is_charging && <span className="text-yellow-400 ml-0.5">⚡</span>}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
