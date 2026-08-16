import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Battery, Camera, Compass, Flashlight, Gauge, Lightbulb, MapPin, RefreshCw, Smartphone, Volume2, Wifi, Zap } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";

type Lang = "en" | "hi";
const card = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm";
const btn = "rounded-xl bg-[#000080] px-4 py-2.5 text-sm font-bold text-white active:scale-95 transition";

export default function DeviceTools() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const hi = lang === "hi";
  const navigate = useNavigate();
  const [torch, setTorch] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [battery, setBattery] = useState<number | null>(null);
  const [charging, setCharging] = useState<boolean | null>(null);
  const [light, setLight] = useState<number | null>(null);
  const [online, setOnline] = useState(navigator.onLine);
  const [vibrate, setVibrate] = useState(false);
  const [message, setMessage] = useState("");
  const sensorRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const onOnline = () => setOnline(true); const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline); window.addEventListener("offline", onOffline);
    let cleanupBattery: (() => void) | undefined;
    (navigator as Navigator & { getBattery?: () => Promise<any> }).getBattery?.().then((b: any) => {
      const update = () => { setBattery(Math.round(b.level * 100)); setCharging(Boolean(b.charging)); };
      update(); b.addEventListener("levelchange", update); b.addEventListener("chargingchange", update);
      cleanupBattery = () => { b.removeEventListener("levelchange", update); b.removeEventListener("chargingchange", update); };
    }).catch(() => undefined);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); cleanupBattery?.(); sensorRef.current?.abort(); };
  }, []);

  const toggleTorch = async () => {
    if (torch && stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); setTorch(false); return; }
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      const track = media.getVideoTracks()[0];
      const caps = (track.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean }) || {};
      if (!caps.torch) { media.getTracks().forEach(t => t.stop()); setMessage(hi ? "इस फोन/ब्राउज़र में flashlight API उपलब्ध नहीं है।" : "Flashlight control is not available on this device/browser."); return; }
      await track.applyConstraints({ advanced: [{ torch: true }] } as MediaTrackConstraints);
      setStream(media); setTorch(true); setMessage(hi ? "Flashlight चालू है" : "Flashlight is on");
    } catch { setMessage(hi ? "Camera/flash permission आवश्यक है।" : "Camera/flash permission is required."); }
  };

  const startCompass = async () => {
    try {
      sensorRef.current?.abort(); const controller = new AbortController(); sensorRef.current = controller;
      const orientation = (e: DeviceOrientationEvent) => {
        const webkit = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
        const raw = typeof webkit === "number" ? webkit : typeof e.alpha === "number" ? 360 - e.alpha : null;
        if (raw !== null) setHeading(Math.round((raw + 360) % 360));
      };
      const DeviceOrientation = DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> };
      if (typeof DeviceOrientation.requestPermission === "function") { const permission = await DeviceOrientation.requestPermission(); if (permission !== "granted") throw new Error("permission"); }
      window.addEventListener("deviceorientation", orientation, { signal: controller.signal });
      setMessage(hi ? "Compass चालू है" : "Compass is active");
    } catch { setMessage(hi ? "Compass permission उपलब्ध नहीं है।" : "Compass permission is unavailable."); }
  };

  const readAmbientLight = () => {
    const w = window as Window & { AmbientLightSensor?: new () => { illuminance?: number; start: () => void; addEventListener: (e: string, fn: () => void) => void } };
    if (!w.AmbientLightSensor) { setLight(null); setMessage(hi ? "इस device/browser में ambient light sensor web API उपलब्ध नहीं है।" : "Ambient light sensor Web API is not available on this device/browser."); return; }
    try {
      const sensor = new w.AmbientLightSensor();
      const update = () => setLight(typeof sensor.illuminance === "number" ? Math.round(sensor.illuminance) : null);
      sensor.addEventListener("reading", update); sensor.start(); setMessage(hi ? "Light sensor पढ़ रहा है" : "Reading light sensor");
    } catch { setMessage(hi ? "Light sensor permission नहीं मिली।" : "Light sensor permission was not granted."); }
  };

  const vibrateNow = () => { if (navigator.vibrate) { navigator.vibrate([120, 80, 120]); setVibrate(true); window.setTimeout(() => setVibrate(false), 500); } else setMessage(hi ? "Vibration API उपलब्ध नहीं है।" : "Vibration API is not available."); };

  return <div className="min-h-screen bg-slate-50 p-4 pb-28 space-y-4">
    <header className="flex items-center gap-3 pt-2"><button onClick={() => navigate(-1)} className="h-10 w-10 rounded-full border bg-white flex items-center justify-center"><ArrowLeft className="h-5 w-5" /></button><div><p className="text-xs font-black uppercase tracking-widest text-[#000080]">RPF Device Tools</p><h1 className="text-2xl font-black text-slate-900">{hi ? "फोन यूटिलिटी" : "Phone Utilities"}</h1></div></header>
    {message && <div className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-800">{message}</div>}
    <section className={card}><div className="flex items-center gap-3"><Flashlight className="text-amber-500"/><div className="flex-1"><h2 className="font-extrabold">{hi ? "Flashlight" : "Smart Flashlight"}</h2><p className="text-xs text-slate-500">{hi ? "Camera torch API उपलब्ध होने पर" : "Uses the device camera torch API when supported."}</p></div><button className={btn} onClick={toggleTorch}>{torch ? (hi ? "बंद" : "Off") : (hi ? "चालू" : "On")}</button></div></section>
    <section className={card}><div className="flex items-center gap-3"><Compass className="text-blue-600"/><div className="flex-1"><h2 className="font-extrabold">{hi ? "Digital Compass" : "Digital Compass"}</h2><p className="text-xs text-slate-500">{heading === null ? "—" : `${heading}° • ${heading < 22.5 || heading >= 337.5 ? "N" : heading < 67.5 ? "NE" : heading < 112.5 ? "E" : heading < 157.5 ? "SE" : heading < 202.5 ? "S" : heading < 247.5 ? "SW" : heading < 292.5 ? "W" : "NW" : "N"}`}</p></div><button className={btn} onClick={startCompass}>{hi ? "पढ़ें" : "Read"}</button></div></section>
    <section className={card}><div className="flex items-center gap-3"><Lightbulb className="text-yellow-500"/><div className="flex-1"><h2 className="font-extrabold">{hi ? "Lux Meter" : "Lux Meter"}</h2><p className="text-xs text-slate-500">{light === null ? (hi ? "Sensor उपलब्ध हो तो reading दिखेगी" : "Reading appears when the sensor API is available") : `${light} lux`}</p></div><button className={btn} onClick={readAmbientLight}><RefreshCw className="inline h-4 w-4 mr-1"/>{hi ? "पढ़ें" : "Read"}</button></div></section>
    <section className={card}><div className="flex items-center gap-3"><Battery className="text-green-600"/><div className="flex-1"><h2 className="font-extrabold">{hi ? "Battery Status" : "Battery Status"}</h2><p className="text-xs text-slate-500">{battery === null ? "Not exposed by browser" : `${battery}% • ${charging ? (hi ? "Charging" : "Charging") : (hi ? "Battery" : "On battery")}`}</p></div></div></section>
    <section className={card}><div className="flex items-center gap-3"><Wifi className={online ? "text-green-600" : "text-red-500"}/><div className="flex-1"><h2 className="font-extrabold">{hi ? "Network Status" : "Network Status"}</h2><p className="text-xs text-slate-500">{online ? (hi ? "Internet उपलब्ध" : "Online") : (hi ? "ऑफलाइन" : "Offline")}</p></div></div></section>
    <section className={card}><div className="flex items-center gap-3"><Zap className="text-purple-600"/><div className="flex-1"><h2 className="font-extrabold">{hi ? "Vibration Test" : "Vibration Test"}</h2><p className="text-xs text-slate-500">{vibrate ? (hi ? "वाइब्रेशन चल रहा है" : "Vibrating") : (hi ? "फोन vibration motor test करें" : "Test the phone vibration motor")}</p></div><button className={btn} onClick={vibrateNow}>Test</button></div></section>
    <section className={card}><div className="flex items-center gap-3"><Smartphone className="text-slate-600"/><div className="flex-1"><h2 className="font-extrabold">{hi ? "Device Capability" : "Device Capability"}</h2><p className="text-xs text-slate-500">Camera {navigator.mediaDevices?.getUserMedia ? "✓" : "—"} · GPS {"geolocation" in navigator ? "✓" : "—"} · Vibration {navigator.vibrate ? "✓" : "—"}</p></div></div></section>
    <div className="grid grid-cols-2 gap-3"><button className="rounded-xl border bg-white p-3 text-sm font-bold" onClick={() => navigate("/utilities")}><Gauge className="inline h-4 w-4 mr-1"/>Utility Center</button><button className="rounded-xl border bg-white p-3 text-sm font-bold" onClick={() => navigate("/browser")}><Camera className="inline h-4 w-4 mr-1"/>Browser</button></div>
  </div>;
}
