import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  ArrowLeft, Download, Music, Video, Play, Pause, RotateCcw,
  Volume2, VolumeX, Mic, MicOff, Scissors, Camera, Gauge,
  RefreshCw, Sparkles, Check, AlertCircle, Plus, FileAudio, FileVideo,
  Radio, Film
} from "lucide-react";
import { Capacitor, registerPlugin } from "@capacitor/core";
import toast from "react-hot-toast";

interface NativeDownloadsPlugin {
  saveToDownloads(options: { filename: string; mimeType: string; data: string }): Promise<{ uri: string; filename: string }>;
}
const NativeDownloads = registerPlugin<NativeDownloadsPlugin>("NativeDownloads");

type StudioMode = "audio" | "video";

export default function MediaStudioPage() {
  const navigate = useNavigate();
  const context = useOutletContext<{ lang?: "en" | "hi" }>() || {};
  const isHi = context.lang === "hi";

  const [mode, setMode] = useState<StudioMode>("audio");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // AUDIO STUDIO STATES
  // ==========================================
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioTrimStart, setAudioTrimStart] = useState(0);
  const [audioTrimEnd, setAudioTrimEnd] = useState(0);
  const [audioVolume, setAudioVolume] = useState(1); // 1 = 100%, up to 3 = 300%
  const [audioSpeed, setAudioSpeed] = useState(1);

  // Voice Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ==========================================
  // VIDEO STUDIO STATES
  // ==========================================
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoTrimStart, setVideoTrimStart] = useState(0);
  const [videoTrimEnd, setVideoTrimEnd] = useState(0);
  const [videoSpeed, setVideoSpeed] = useState(1);
  const [videoMuted, setVideoMuted] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Helper format time MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ------------------------------------------
  // AUDIO HANDLERS
  // ------------------------------------------
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setIsPlayingAudio(false);
    toast.success(isHi ? `ऑडियो लोड हुआ: ${file.name}` : `Audio loaded: ${file.name}`);
  };

  const onAudioLoadedMetadata = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration;
      setAudioDuration(dur);
      setAudioTrimStart(0);
      setAudioTrimEnd(dur);
    }
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // Start Mic Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setAudioFile(new File([audioBlob], `Voice_Recording_${Date.now()}.webm`, { type: "audio/webm" }));
        stream.getTracks().forEach(track => track.stop());
        toast.success(isHi ? "वॉयस रिकॉर्डिंग पूरी हुई!" : "Recording completed!");
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      recordTimerRef.current = window.setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch {
      toast.error(isHi ? "माइक्रोफ़ोन अनुमति नहीं मिली" : "Microphone permission denied");
    }
  };

  // Stop Mic Voice Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
    }
  };

  // Export Trimmed & Boosted Audio using Web Audio API
  const exportTrimmedAudio = async () => {
    if (!audioFile && !audioUrl) return;
    setLoading(true);

    try {
      const resp = await fetch(audioUrl!);
      const arrayBuffer = await resp.arrayBuffer();
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      const sampleRate = decodedBuffer.sampleRate;
      const channels = decodedBuffer.numberOfChannels;
      const startOffset = Math.floor(audioTrimStart * sampleRate);
      const endOffset = Math.floor(Math.min(audioTrimEnd, decodedBuffer.duration) * sampleRate);
      const frameCount = Math.max(1, endOffset - startOffset);

      // Create trimmed buffer
      const trimmedBuffer = audioCtx.createBuffer(channels, frameCount, sampleRate);
      for (let ch = 0; ch < channels; ch++) {
        const origChannelData = decodedBuffer.getChannelData(ch);
        const trimmedChannelData = trimmedBuffer.getChannelData(ch);
        for (let i = 0; i < frameCount; i++) {
          // Apply volume booster
          trimmedChannelData[i] = origChannelData[startOffset + i] * audioVolume;
        }
      }

      // Encode trimmedBuffer to WAV
      const wavBlob = audioBufferToWav(trimmedBuffer);
      const filename = `Trimmed_Audio_${Date.now()}.wav`;

      if (Capacitor.isNativePlatform()) {
        const reader = new FileReader();
        reader.readAsDataURL(wavBlob);
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          await NativeDownloads.saveToDownloads({
            filename,
            mimeType: "audio/wav",
            data: dataUrl,
          });
          toast.success(isHi ? `ऑडियो Downloads में सेव हुआ: ${filename}` : `Audio saved: ${filename}`);
        };
      } else {
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 60000);
        toast.success(isHi ? `ऑडियो डाउनलोड हुआ: ${filename}` : `Audio downloaded: ${filename}`);
      }
      setLoading(false);
    } catch {
      setLoading(false);
      toast.error(isHi ? "ऑडियो एक्सपोर्ट विफल" : "Failed to export audio");
    }
  };

  // WAV Encoder Helper
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const outBuffer = new ArrayBuffer(length);
    const view = new DataView(outBuffer);
    const channels: Float32Array[] = [];
    let sample = 0;
    let offset = 0;
    let pos = 0;

    const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; };
    const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; };

    // RIFF chunk
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    // FMT chunk
    setUint32(0x20746d66); // "fmt "
    setUint32(16); // subchunk1size (16 for PCM)
    setUint16(1);  // PCM format
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16); // 16-bit
    // DATA chunk
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (offset < buffer.length) {
      for (let i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([outBuffer], { type: "audio/wav" });
  };

  // ------------------------------------------
  // VIDEO HANDLERS
  // ------------------------------------------
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setIsPlayingVideo(false);
    toast.success(isHi ? `वीडियो लोड हुआ: ${file.name}` : `Video loaded: ${file.name}`);
  };

  const onVideoLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setVideoDuration(dur);
      setVideoTrimStart(0);
      setVideoTrimEnd(dur);
    }
  };

  const togglePlayVideo = () => {
    if (!videoRef.current) return;
    if (isPlayingVideo) {
      videoRef.current.pause();
      setIsPlayingVideo(false);
    } else {
      videoRef.current.play();
      setIsPlayingVideo(true);
    }
  };

  // Capture High-Res Photo Frame from Video
  const captureVideoFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const filename = `Video_Frame_${Math.round(video.currentTime)}s_${Date.now()}.png`;

      if (Capacitor.isNativePlatform()) {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          await NativeDownloads.saveToDownloads({
            filename,
            mimeType: "image/png",
            data: dataUrl,
          });
          toast.success(isHi ? `फ्रेम फ़ोटो सेव हुआ: ${filename}` : `Snapshot saved: ${filename}`);
        };
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 60000);
        toast.success(isHi ? `फ्रेम फ़ोटो डाउनलोड हुआ: ${filename}` : `Snapshot downloaded: ${filename}`);
      }
    }, "image/png");
  };

  // Extract Audio track from Video completely offline
  const extractAudioFromVideo = async () => {
    if (!videoUrl) return;
    setLoading(true);

    try {
      const resp = await fetch(videoUrl);
      const arrayBuffer = await resp.arrayBuffer();
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      const wavBlob = audioBufferToWav(decodedBuffer);
      const filename = `${videoFile?.name?.replace(/\.[^/.]+$/, "") || "Extracted"}_Audio.wav`;

      if (Capacitor.isNativePlatform()) {
        const reader = new FileReader();
        reader.readAsDataURL(wavBlob);
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          await NativeDownloads.saveToDownloads({
            filename,
            mimeType: "audio/wav",
            data: dataUrl,
          });
          toast.success(isHi ? `ऑडियो एक्सट्रेक्ट हुआ: ${filename}` : `Audio extracted: ${filename}`);
        };
      } else {
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 60000);
        toast.success(isHi ? `ऑडियो एक्सट्रेक्ट हुआ: ${filename}` : `Audio extracted: ${filename}`);
      }
      setLoading(false);
    } catch {
      setLoading(false);
      toast.error(isHi ? "ऑडियो निकालने में विफल" : "Failed to extract audio track");
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-[#FFF7E8] text-slate-800 overflow-hidden font-sans select-none fixed inset-0 z-50">
      {/* 1. TOP PREMIUM HEADER BAR */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/utilities")}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition"
            title="Back to Utilities"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 flex items-center gap-1.5">
              <span>Media Studio Pro</span>
              <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
                Studio
              </span>
            </h1>
            <p className="text-[11px] text-slate-500">
              {mode === "audio"
                ? audioFile ? audioFile.name : (isHi ? "ऑडियो कटर व रिकॉर्डर" : "Audio Cutter & Booster")
                : videoFile ? videoFile.name : (isHi ? "वीडियो ट्रिमर व ऑडियो एक्सट्रेक्टर" : "Video Trimmer & Extractor")}
            </p>
          </div>
        </div>

        {/* Studio Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-2xl p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setMode("audio")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              mode === "audio" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Music className="h-3.5 w-3.5" />
            <span>{isHi ? "ऑडियो स्टूडियो" : "Audio"}</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("video")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              mode === "video" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Video className="h-3.5 w-3.5" />
            <span>{isHi ? "वीडियो स्टूडियो" : "Video"}</span>
          </button>
        </div>
      </header>

      {/* 2. AUDIO STUDIO SECTION */}
      {mode === "audio" && (
        <main className="flex-1 overflow-auto p-4 sm:p-8 flex flex-col items-center justify-center">
          {!audioUrl ? (
            <div className="w-full max-w-md rounded-3xl border border-[#D8E8DB] bg-white p-8 text-center shadow-md">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 mb-4 ring-1 ring-purple-200">
                <Music className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-black text-slate-900">
                {isHi ? "ऑडियो स्टूडियो में शुरू करें" : "Open Audio in Studio"}
              </h2>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                {isHi
                  ? "डिवाइस से गाना/ऑडियो चुनें या सीधे माइक से रिकॉर्ड करें। रिंगटोन बनाएं, वॉल्यूम 300% बूस्ट करें व ट्रिम करें।"
                  : "Trim audio, boost volume up to 300%, change pitch/speed, or record live voice without uploading to any server."}
              </p>

              {/* Upload Audio File */}
              <div className="mt-6 flex flex-col gap-3">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  id="audio-file-studio-upload"
                  className="hidden"
                />
                <label
                  htmlFor="audio-file-studio-upload"
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-purple-600 py-3.5 text-xs font-black text-white shadow-md hover:bg-purple-500 transition active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isHi ? "डिवाइस से ऑडियो फ़ाइल चुनें" : "Select Audio from Device"}</span>
                </label>

                {/* Voice Recorder Button */}
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-black transition ${
                    isRecording
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-rose-500" />}
                  <span>
                    {isRecording
                      ? `${isHi ? "रिकॉर्डिंग रोकें" : "Stop Recording"} (${formatTime(recordingSeconds)})`
                      : (isHi ? "माइक से आवाज़ रिकॉर्ड करें" : "Record Live Voice")}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-2xl rounded-3xl border border-[#D8E8DB] bg-white p-6 sm:p-8 shadow-md">
              <audio
                ref={audioRef}
                src={audioUrl}
                onLoadedMetadata={onAudioLoadedMetadata}
                onTimeUpdate={() => {
                  if (audioRef.current) setAudioCurrentTime(audioRef.current.currentTime);
                }}
                onEnded={() => setIsPlayingAudio(false)}
              />

              {/* Audio Track Visual Wave Display */}
              <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200 text-center relative overflow-hidden">
                <div className="flex items-center justify-center gap-1.5 h-16">
                  {Array.from({ length: 32 }).map((_, idx) => {
                    const isPassed = (audioCurrentTime / (audioDuration || 1)) * 32 > idx;
                    const randomH = Math.sin(idx * 0.4) * 20 + 28;
                    return (
                      <div
                        key={idx}
                        style={{ height: `${randomH}px` }}
                        className={`w-1.5 rounded-full transition-all ${
                          isPassed ? "bg-purple-600" : "bg-slate-300"
                        }`}
                      />
                    );
                  })}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs font-mono font-bold text-slate-600">
                  <span>{formatTime(audioCurrentTime)}</span>
                  <span>{formatTime(audioDuration)}</span>
                </div>
              </div>

              {/* Player Controls */}
              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = audioTrimStart;
                      audioRef.current.play();
                      setIsPlayingAudio(true);
                    }
                  }}
                  className="p-3 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                  title="Replay from Trim Start"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={togglePlayAudio}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-white shadow-md hover:bg-purple-500 transition active:scale-95"
                >
                  {isPlayingAudio ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                </button>
              </div>

              {/* Trimmer Sliders */}
              <div className="mt-8 space-y-4 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-purple-700">
                    <Scissors className="h-4 w-4" />
                    <span>{isHi ? "ऑडियो ट्रिम / कटर" : "Trim Range"}</span>
                  </span>
                  <span className="text-slate-600">
                    {formatTime(audioTrimStart)} - {formatTime(audioTrimEnd)} (कुल: {formatTime(audioTrimEnd - audioTrimStart)})
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-semibold">
                    <span>{isHi ? "शुरुआती समय (Start):" : "Start Time:"} {formatTime(audioTrimStart)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={audioDuration}
                    step="0.1"
                    value={audioTrimStart}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val < audioTrimEnd) setAudioTrimStart(val);
                    }}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-semibold">
                    <span>{isHi ? "समाप्ति समय (End):" : "End Time:"} {formatTime(audioTrimEnd)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={audioDuration}
                    step="0.1"
                    value={audioTrimEnd}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val > audioTrimStart) setAudioTrimEnd(val);
                    }}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Volume Booster & Speed Controls */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Volume Booster */}
                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-[#245D45]" />
                    <span className="text-xs font-bold text-slate-700">{isHi ? "वॉल्यूम बूस्टर:" : "Boost:"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.5"
                      max="3.0"
                      step="0.1"
                      value={audioVolume}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setAudioVolume(v);
                        if (audioRef.current) audioRef.current.volume = Math.min(1, v);
                      }}
                      className="w-24 accent-[#245D45]"
                    />
                    <span className="text-xs font-mono font-bold text-[#245D45] w-10 text-right">
                      {Math.round(audioVolume * 100)}%
                    </span>
                  </div>
                </div>

                {/* Speed Pitch */}
                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-bold text-slate-700">{isHi ? "गति:" : "Speed:"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => {
                          setAudioSpeed(spd);
                          if (audioRef.current) audioRef.current.playbackRate = spd;
                        }}
                        className={`rounded-lg px-2 py-1 text-[11px] font-bold ${
                          audioSpeed === spd ? "bg-amber-600 text-white" : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAudioUrl(null);
                    setAudioFile(null);
                  }}
                  className="rounded-xl bg-slate-100 border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  {isHi ? "अन्य फ़ाइल चुनें" : "Change File"}
                </button>

                <button
                  type="button"
                  onClick={exportTrimmedAudio}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-xs font-black text-white shadow-md hover:from-purple-500 hover:to-indigo-500 transition active:scale-95 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  <span>{isHi ? "ट्रिम किया ऑडियो सेव करें" : "Save Trimmed Audio"}</span>
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* 3. VIDEO STUDIO SECTION */}
      {mode === "video" && (
        <main className="flex-1 overflow-auto p-4 sm:p-6 flex flex-col items-center justify-center">
          {!videoUrl ? (
            <div className="w-full max-w-md rounded-3xl border border-[#D8E8DB] bg-white p-8 text-center shadow-md">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4 ring-1 ring-indigo-200">
                <Video className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-black text-slate-900">
                {isHi ? "वीडियो स्टूडियो में शुरू करें" : "Open Video in Studio"}
              </h2>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                {isHi
                  ? "वीडियो से ऑडियो निकालें (MP4 से MP3/WAV), एचडी फोटो फ्रेम कैप्चर करें, स्पीड बदलें व ट्रिम करें—100% सुरक्षित।"
                  : "Extract pure audio from video, capture crisp HD frame snapshot, change video speed & mute completely private."}
              </p>

              <div className="mt-6">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  id="video-file-studio-upload"
                  className="hidden"
                />
                <label
                  htmlFor="video-file-studio-upload"
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-xs font-black text-white shadow-md hover:bg-indigo-500 transition active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isHi ? "डिवाइस से वीडियो फ़ाइल चुनें" : "Select Video from Device"}</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-3xl flex flex-col gap-4">
              {/* Video Player Canvas View */}
              <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-300 shadow-md max-h-[50vh] flex justify-center items-center">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  muted={videoMuted}
                  onLoadedMetadata={onVideoLoadedMetadata}
                  onTimeUpdate={() => {
                    if (videoRef.current) setVideoCurrentTime(videoRef.current.currentTime);
                  }}
                  onEnded={() => setIsPlayingVideo(false)}
                  className="w-full max-h-[50vh] object-contain"
                />

                <button
                  type="button"
                  onClick={togglePlayVideo}
                  className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition hover:scale-110 active:scale-95"
                >
                  {isPlayingVideo ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                </button>
              </div>

              {/* Video Tools Bar */}
              <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {formatTime(videoCurrentTime)} / {formatTime(videoDuration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Capture Frame Snapshot */}
                  <button
                    type="button"
                    onClick={captureVideoFrame}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                  >
                    <Camera className="h-4 w-4 text-indigo-600" />
                    <span>{isHi ? "फ्रेम फोटो लें" : "Take Snapshot"}</span>
                  </button>

                  {/* Extract Audio */}
                  <button
                    type="button"
                    onClick={extractAudioFromVideo}
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-black text-white hover:bg-indigo-500 shadow-xs transition active:scale-95 disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Music className="h-4 w-4" />}
                    <span>{isHi ? "ऑडियो निकालें (WAV)" : "Extract Audio"}</span>
                  </button>
                </div>
              </div>

              {/* Video Controls & Mute */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Speed */}
                <div className="rounded-2xl bg-white p-3.5 border border-slate-200 shadow-xs flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{isHi ? "वीडियो गति:" : "Speed:"}</span>
                  <div className="flex items-center gap-1">
                    {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => {
                          setVideoSpeed(spd);
                          if (videoRef.current) videoRef.current.playbackRate = spd;
                        }}
                        className={`rounded-lg px-2 py-1 text-[11px] font-bold ${
                          videoSpeed === spd ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mute */}
                <div className="rounded-2xl bg-white p-3.5 border border-slate-200 shadow-xs flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{isHi ? "ऑडियो म्यूट:" : "Mute Sound:"}</span>
                  <button
                    type="button"
                    onClick={() => setVideoMuted(m => !m)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      videoMuted ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                    }`}
                  >
                    {videoMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    <span>{videoMuted ? (isHi ? "म्यूटेड" : "Muted") : (isHi ? "चालू" : "Unmuted")}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
