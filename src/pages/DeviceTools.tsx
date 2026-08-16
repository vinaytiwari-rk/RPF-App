import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Battery, Compass, Flashlight, Gauge, Lightbulb, Smartphone, Wifi, Zap } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";

type Lang = "en" | "hi";

type BatteryManager = {
  level: number;
  charging: boolean;
  addEventListener: (name: string, fn: () => void) => void;
  removeEventListener: (name: string, fn: () => void) => void;
};

type NavigatorWithBattery = Navigator & { getBattery?: () => Promise<BatteryManager> };

type OrientationEventWithCompass = DeviceOrientationEvent & { webkitCompassHeading?: number };

type OrientationEventConstructor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

const card = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm";
const button = "rounded-xl bg-[#000080] px-4 py-2.5 text-sm font-bold text-white active:scale-95 transition";

function directionForHeading(value: number): string {
  if (value < 22.5 || value >= 337.5) return "N";
  if (value < 67.5) return "NE";
  if (value < 112.5) return "E";
  if (value < 157.5) return "SE";
  if (value < 202.5) return "S";
  if (value < 247.5) return "SW";
  if (value < 292.5) return "W";
  return "NW";
}

export default function DeviceTools() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const hi = lang === "hi";
  const [torch, setTorch] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [battery, setBattery] = useState<number | null>(null);
  const [charging, setCharging] = useState(false);
  const [light, setLight] = useState<number | null>(null);
  const [online, setOnline] = useState(() => navigator.onLine);
  const [message, setMessage] = useState("");
  const compassHandler = useRef<((event: DeviceOrientationEvent) => void) | null>(null);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    let cleanupBattery: (() => void) | undefined;
    const batteryApi = navigator as NavigatorWithBattery;
    batteryApi.getBattery?.().then((manager) => {
      const update = () => {
        setBattery(Math.round(manager.level * 100));
        setCharging(manager.charging);
      };
      update();
      manager.addEventListener("levelchange", update);
      manager.addEventListener("chargingchange", update);
      cleanupBattery = () => {
        manager.removeEventListener("levelchange", update);
        manager.removeEventListener("chargingchange", update);
      };
    }).catch(() => undefined);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      cleanupBattery?.();
      if (stream) stream.getTracks().forEach((track) => track.stop());
      if (compassHandler.current) window.removeEventListener("deviceorientation", compassHandler.current);
    };
  }, [stream]);

  const toggleTorch = async () => {
    if (torch && stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setTorch(false);
      return;
    }
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("camera unavailable");
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      const track = media.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean };
      if (!capabilities.torch) {
        media.getTracks().forEach((item) => item.stop());
        throw new Error("torch unavailable");
      }
      await track.applyConstraints({ advanced: [{ torch: true } as MediaTrackConstraintSet] });
      setStream(media);
      setTorch(true);
      setMessage(hi ? "Flashlight चालू है" : "Flashlight is on");
    } catch {
      setMessage(hi ? "इस device/browser में flashlight control उपलब्ध नहीं है।" : "Flashlight control is not available on this device/browser.");
    }
  };

  const startCompass = async () => {
    try {
      if (compassHandler.current) window.removeEventListener("deviceorientation", compassHandler.current);
      const Orientation = DeviceOrientationEvent as OrientationEventConstructor;
      if (Orientation.requestPermission) {
        const permission = await Orientation.requestPermission();
        if (permission !== "granted") throw new Error("permission denied");
      }
      const handler = (event: DeviceOrientationEvent) => {
        const orientation = event as OrientationEventWithCompass;
        const value = typeof orientation.webkitCompassHeading === "number"
          ? orientation.webkitCompassHeading
          : typeof orientation.alpha === "number" ? 360 - orientation.alpha : null;
        if (value !== null) setHeading(Math.round((value + 360) % 360));
      };
      compassHandler.current = handler;
      window.addEventListener("deviceorientation", handler);
      setMessage(hi ? "Compass चालू है" : "Compass is active");
    } catch {
      setMessage(hi ? "Compass permission उपलब्ध नहीं है।" : "Compass permission is unavailable.");
    }
  };

  const readAmbientLight = () => {
    const win = window as Window & {
      AmbientLightSensor?: new () => {
        illuminance?: number;
        start: () => void;
        addEventListener: (name: string, fn: () => void) => void;
      };
    };
    if (!win.AmbientLightSensor) {
      setMessage(hi ? "इस device/browser में ambient light sensor API उपलब्ध नहीं है।" : "Ambient light sensor API is not available on this device/browser.");
      return;
    }
    try {
      const sensor = new win.AmbientLightSensor();
      sensor.addEventListener("reading", () => {
        setLight(typeof sensor.illuminance === "number" ? Math.round(sensor.illuminance) : null);
      });
      sensor.start();
      setMessage(hi ? "Light sensor पढ़ रहा है" : "Reading light sensor");
    } catch {
      setMessage(hi ? "Light sensor permission नहीं मिली।" : "Light sensor permission was not granted.");
    }
  };

  const vibrateNow = () => {
    if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
    else setMessage(hi ? "Vibration API उपलब्ध नहीं है।" : "Vibration API is not available.");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-28 space-y-4">
      <header className="flex items-center gap-3 pt-2">
        <button onClick={() => navigate(-1)} className="h-10 w-10 rounded-full border bg-white flex items-center justify-center" aria-label="Back"><ArrowLeft className="h-5 w-5" /></button>
        <div><p className="text-xs font-black uppercase tracking-widest text-[#000080]">RPF Device Tools</p><h1 className="text-2xl font-black text-slate-900">{hi ? "फोन यूटिलिटी" : "Phone Utilities"}</h1></div>
      </header>

      {message && <div className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-800">{message}</div>}

      <section className={card}><div className="flex items-center gap-3"><Flashlight className="text-amber-500"/><div className="flex-1"><h2 className="font-extrabold">{hi ? "स्मार्ट फ्लैशलाइट" : "Smart Flashlight"}</h2><p className="text-xs text-slate-500">{hi ? "Camera torch API supported होने पर" : "Uses the device camera torch API when supported."}</p></div><button className={button} onClick={toggleTorch}>{torch ? (hi ? "बंद" : "Off") : (hi ? "चालू" : "On")}</button></div></section>

      <section className={card}><div className="flex items-center gap-3"><Compass className="text-blue-600"/><div className="flex-1"><h2 className="font-extrabold">Digital Compass</h2><p className="text-xs text-slate-500">{heading === null ? "—" : `${heading}° • ${directionForHeading(heading)}`}</p></div><button className={button} onClick={startCompass}>{hi ? "पढ़ें" : "Read"}</button></div></section>

      <section className={card}><div className="flex items-center gap-3"><Lightbulb className="text-yellow-500"/><div className="flex-1"><h2 className="font-extrabold">Lux Meter</h2><p className="text-xs text-slate-500">{light === null ? (hi ? "Sensor उपलब्ध होने पर reading दिखेगी" : "Reading appears when the sensor API is available") : `${light} lux`}</p></div><button className={button} onClick={readAmbientLight}>{hi ? "पढ़ें" : "Read"}</button></div></section>

      <section className={card}><div className="flex items-center gap-3"><Battery className="text-green-600"/><div><h2 className="font-extrabold">Battery Status</h2><p className="text-xs text-slate-500">{battery === null ? (hi ? "Browser battery API उपलब्ध नहीं है" : "Battery API is not exposed") : `${battery}% • ${charging ? (hi ? "चार्ज हो रहा है" : "Charging") : (hi ? "बैटरी" : "On battery")}`}</p></div></div></section>

      <section className={card}><div className="flex items-center gap-3"><Wifi className={online ? "text-green-600" : "text-red-500"}/><div><h2 className="font-extrabold">Network Status</h2><p className="text-xs text-slate-500">{online ? (hi ? "Internet उपलब्ध" : "Online") : (hi ? "ऑफलाइन" : "Offline")}</p></div></div></section>

      <section className={card}><div className="flex items-center gap-3"><Zap className="text-purple-600"/><div className="flex-1"><h2 className="font-extrabold">Vibration Test</h2><p className="text-xs text-slate-500">{hi ? "फोन vibration motor test करें" : "Test the phone vibration motor"}</p></div><button className={button} onClick={vibrateNow}>Test</button></div></section>

      <section className={card}><div className="flex items-center gap-3"><Smartphone className="text-slate-600"/><div><h2 className="font-extrabold">Device Capability</h2><p className="text-xs text-slate-500">Camera {navigator.mediaDevices?.getUserMedia ? "✓" : "—"} · GPS {"geolocation" in navigator ? "✓" : "—"} · Vibration {navigator.vibrate ? "✓" : "—"}</p></div></div></section>

      <button className="w-full rounded-xl border bg-white p-3 text-sm font-bold" onClick={() => navigate("/utilities")}><Gauge className="inline h-4 w-4 mr-1"/>Utility Center</button>
    </div>
  );
}
