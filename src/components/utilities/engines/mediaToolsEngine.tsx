import React, { useState, useRef, useEffect } from "react";
import { 
  Music, Video, Upload, Download, Copy, Check, 
  AlertCircle, RefreshCw, Play, Pause, Volume2, 
  FastForward, Scissors, Eye, Maximize, RotateCw, Mic, MicOff
} from "lucide-react";

interface Props {
  toolId: string;
  isHi: boolean;
  downloadBlob: (blob: Blob, filename: string) => void;
  copyToClipboard: (text: string) => void;
}

export default function MediaToolsEngine({ toolId, isHi, downloadBlob, copyToClipboard }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [metaInfo, setMetaInfo] = useState<Record<string, string | number> | null>(null);

  // Audio / Video control parameters
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [duration, setDuration] = useState(10);
  const [volumeLevel, setVolumeLevel] = useState(1.5); // 150%
  const [playbackSpeed, setPlaybackSpeed] = useState(1.25);
  const [selectedRatio, setSelectedRatio] = useState("16:9");
  const [targetWidth, setTargetWidth] = useState(1280);
  const [targetHeight, setTargetHeight] = useState(720);
  const [rotationAngle, setRotationAngle] = useState(90);

  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setSuccessMsg(null);
    setMetaInfo(null);
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    const url = URL.createObjectURL(f);
    setFileUrl(url);

    // Initial inspection
    if (f.type.startsWith("video") || toolId.includes("video")) {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => {
        const dur = Math.round(v.duration) || 10;
        setDuration(dur);
        setEndTime(dur);
        setTargetWidth(v.videoWidth || 1280);
        setTargetHeight(v.videoHeight || 720);
        setMetaInfo({
          [isHi ? "फ़ाइल नाम" : "File Name"]: f.name,
          [isHi ? "फ़ाइल प्रकार" : "MIME Type"]: f.type || "video/mp4",
          [isHi ? "आकार" : "File Size"]: (f.size / (1024 * 1024)).toFixed(2) + " MB",
          [isHi ? "अवधि (सेकंड)" : "Duration"]: `${dur}s`,
          [isHi ? "रिज़ॉल्यूशन" : "Resolution"]: `${v.videoWidth} x ${v.videoHeight}`,
          [isHi ? "आस्पेक्ट रेशियो" : "Aspect Ratio"]: (v.videoWidth && v.videoHeight) ? (v.videoWidth / v.videoHeight).toFixed(2) : "1.78",
        });
      };
      v.src = url;
    } else {
      setMetaInfo({
        [isHi ? "फ़ाइल नाम" : "File Name"]: f.name,
        [isHi ? "फ़ाइल प्रकार" : "MIME Type"]: f.type || "audio/wav",
        [isHi ? "आकार" : "File Size"]: (f.size / (1024 * 1024)).toFixed(2) + " MB",
        [isHi ? "अंतिम संशोधन" : "Last Modified"]: new Date(f.lastModified).toLocaleString(),
      });
    }
  };

  // Convert AudioBuffer to 16-bit PCM WAV Blob
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    const channels: Float32Array[] = [];
    const sampleRate = buffer.sampleRate;
    let offset = 0;
    let pos = 0;

    const setUint16 = (data: number) => { out.setUint16(pos, data, true); pos += 2; };
    const setUint32 = (data: number) => { out.setUint32(pos, data, true); pos += 4; };

    // RIFF identifier
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"

    // fmt sub-chunk
    setUint32(0x20746d66); // "fmt "
    setUint32(16); // subchunk1 size
    setUint16(1); // PCM format
    setUint16(numOfChan);
    setUint32(sampleRate);
    setUint32(sampleRate * numOfChan * 2); // byte rate
    setUint16(numOfChan * 2); // block align
    setUint16(16); // bits per sample

    // data sub-chunk
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for (let i = 0; i < numOfChan; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (offset < buffer.length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        out.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([out.buffer], { type: "audio/wav" });
  };

  const processAudio = async () => {
    if (!file) throw new Error("Select an audio file");
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    const decoded = await audioCtx.decodeAudioData(arrayBuffer);

    let outputBuffer: AudioBuffer = decoded;

    switch (toolId) {
      case "media_audio_trimmer": {
        const rate = decoded.sampleRate;
        const startOffset = Math.floor(Math.max(0, startTime) * rate);
        const endOffset = Math.floor(Math.min(decoded.duration, endTime) * rate);
        const frameCount = Math.max(1, endOffset - startOffset);
        outputBuffer = audioCtx.createBuffer(decoded.numberOfChannels, frameCount, rate);
        for (let c = 0; c < decoded.numberOfChannels; c++) {
          const from = decoded.getChannelData(c).subarray(startOffset, endOffset);
          outputBuffer.getChannelData(c).set(from);
        }
        break;
      }

      case "media_audio_volume": {
        outputBuffer = audioCtx.createBuffer(decoded.numberOfChannels, decoded.length, decoded.sampleRate);
        for (let c = 0; c < decoded.numberOfChannels; c++) {
          const from = decoded.getChannelData(c);
          const to = outputBuffer.getChannelData(c);
          for (let i = 0; i < from.length; i++) {
            to[i] = Math.max(-1, Math.min(1, from[i] * volumeLevel));
          }
        }
        break;
      }

      case "media_audio_speed":
      case "media_audio_pitch": {
        // Resample frames with speed multiplier
        const newRate = Math.round(decoded.sampleRate * playbackSpeed);
        outputBuffer = audioCtx.createBuffer(decoded.numberOfChannels, decoded.length, newRate);
        for (let c = 0; c < decoded.numberOfChannels; c++) {
          outputBuffer.getChannelData(c).set(decoded.getChannelData(c));
        }
        break;
      }

      case "media_audio_reverse": {
        outputBuffer = audioCtx.createBuffer(decoded.numberOfChannels, decoded.length, decoded.sampleRate);
        for (let c = 0; c < decoded.numberOfChannels; c++) {
          const from = decoded.getChannelData(c);
          const to = outputBuffer.getChannelData(c);
          for (let i = 0; i < from.length; i++) {
            to[i] = from[from.length - 1 - i];
          }
        }
        break;
      }

      case "media_audio_channel_split": {
        // Convert to mono (1 channel)
        outputBuffer = audioCtx.createBuffer(1, decoded.length, decoded.sampleRate);
        const mono = outputBuffer.getChannelData(0);
        const left = decoded.getChannelData(0);
        const right = decoded.numberOfChannels > 1 ? decoded.getChannelData(1) : left;
        for (let i = 0; i < decoded.length; i++) {
          mono[i] = (left[i] + right[i]) / 2;
        }
        break;
      }

      case "media_audio_channel_merge": {
        // Duplicate mono into 2 channels (Stereo)
        outputBuffer = audioCtx.createBuffer(2, decoded.length, decoded.sampleRate);
        const source = decoded.getChannelData(0);
        outputBuffer.getChannelData(0).set(source);
        outputBuffer.getChannelData(1).set(source);
        break;
      }

      case "media_audio_silence_remove": {
        // Simple threshold silence trimmer
        const threshold = 0.02;
        const left = decoded.getChannelData(0);
        const activeIndices: number[] = [];
        for (let i = 0; i < left.length; i += 64) {
          if (Math.abs(left[i]) > threshold) {
            activeIndices.push(i);
          }
        }
        if (activeIndices.length > 0) {
          const first = Math.max(0, activeIndices[0] - 1000);
          const last = Math.min(left.length, activeIndices[activeIndices.length - 1] + 1000);
          outputBuffer = audioCtx.createBuffer(decoded.numberOfChannels, Math.max(1, last - first), decoded.sampleRate);
          for (let c = 0; c < decoded.numberOfChannels; c++) {
            outputBuffer.getChannelData(c).set(decoded.getChannelData(c).subarray(first, last));
          }
        }
        break;
      }

      case "media_audio_fade": {
        // Apply 1.5s fade-in and fade-out
        outputBuffer = audioCtx.createBuffer(decoded.numberOfChannels, decoded.length, decoded.sampleRate);
        const fadeLen = Math.min(Math.floor(decoded.sampleRate * 1.5), Math.floor(decoded.length / 2));
        for (let c = 0; c < decoded.numberOfChannels; c++) {
          const from = decoded.getChannelData(c);
          const to = outputBuffer.getChannelData(c);
          for (let i = 0; i < decoded.length; i++) {
            let gain = 1.0;
            if (i < fadeLen) gain = i / fadeLen;
            else if (i > decoded.length - fadeLen) gain = (decoded.length - i) / fadeLen;
            to[i] = from[i] * gain;
          }
        }
        break;
      }

      case "media_audio_normalize": {
        // Peak normalization to 0.98
        outputBuffer = audioCtx.createBuffer(decoded.numberOfChannels, decoded.length, decoded.sampleRate);
        let maxPeak = 0.001;
        for (let c = 0; c < decoded.numberOfChannels; c++) {
          const data = decoded.getChannelData(c);
          for (let i = 0; i < data.length; i++) {
            const abs = Math.abs(data[i]);
            if (abs > maxPeak) maxPeak = abs;
          }
        }
        const factor = 0.98 / maxPeak;
        for (let c = 0; c < decoded.numberOfChannels; c++) {
          const from = decoded.getChannelData(c);
          const to = outputBuffer.getChannelData(c);
          for (let i = 0; i < from.length; i++) {
            to[i] = Math.max(-1, Math.min(1, from[i] * factor));
          }
        }
        break;
      }

      case "media_audio_samplerate": {
        // Standardize to 44.1 kHz
        const targetRate = 44100;
        outputBuffer = audioCtx.createBuffer(decoded.numberOfChannels, decoded.length, targetRate);
        for (let c = 0; c < decoded.numberOfChannels; c++) {
          outputBuffer.getChannelData(c).set(decoded.getChannelData(c));
        }
        break;
      }

      case "media_audio_metadata": {
        setMetaInfo({
          [isHi ? "ऑडियो अवधि" : "Audio Duration"]: `${decoded.duration.toFixed(2)} seconds`,
          [isHi ? "सैंपल रेट" : "Sample Rate"]: `${decoded.sampleRate} Hz`,
          [isHi ? "चैनल संख्या" : "Channels"]: decoded.numberOfChannels === 1 ? "1 (Mono)" : "2 (Stereo)",
          [isHi ? "कुल सैंपल्स" : "Total Samples"]: decoded.length,
          [isHi ? "फ़ाइल नाम" : "Original Filename"]: file.name,
          [isHi ? "फ़ाइल आकार" : "File Size"]: (file.size / 1024).toFixed(1) + " KB",
        });
        setSuccessMsg(isHi ? "मेटाडेटा लोड हो गया" : "Audio metadata loaded");
        return;
      }
    }

    const wavBlob = audioBufferToWav(outputBuffer);
    const outName = `${file.name.replace(/\.[^/.]+$/, "")}_${toolId}.wav`;
    downloadBlob(wavBlob, outName);
    setSuccessMsg(isHi ? `ऑडियो तैयार है: ${outName}` : `Processed audio ready: ${outName}`);
  };

  const processVideoFrame = async () => {
    if (!videoRef.current) throw new Error("Video element unavailable");
    const v = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth || v.videoWidth || 1280;
    canvas.height = targetHeight || v.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");

    if (toolId === "media_video_rotate") {
      if (rotationAngle === 90 || rotationAngle === 270) {
        canvas.width = v.videoHeight || 720;
        canvas.height = v.videoWidth || 1280;
      }
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotationAngle * Math.PI) / 180);
      ctx.drawImage(v, -v.videoWidth / 2, -v.videoHeight / 2);
    } else if (toolId === "media_video_flip_h") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    } else if (toolId === "media_video_flip_v") {
      ctx.translate(0, canvas.height);
      ctx.scale(1, -1);
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    } else if (toolId === "media_video_aspect_ratio") {
      const parts = selectedRatio.split(":").map(Number);
      if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) {
        canvas.height = Math.round((canvas.width * parts[1]) / parts[0]);
      }
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    }

    canvas.toBlob(blob => {
      if (!blob) throw new Error("Failed to capture frame");
      const outName = `${file ? file.name.replace(/\.[^/.]+$/, "") : "video"}_snapshot.png`;
      downloadBlob(blob, outName);
      setSuccessMsg(isHi ? `फ्रेम डाउनलोड हुआ: ${outName}` : `Frame captured: ${outName}`);
    }, "image/png");
  };

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
        setRecordedAudioBlob(audioBlob);
        if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
        setSuccessMsg(isHi ? "वॉयस रिकॉर्डिंग पूरी हुई!" : "Recording completed!");
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      recordTimerRef.current = window.setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch {
      setError(isHi ? "माइक्रोफ़ोन अनुमति नहीं मिली" : "Microphone permission denied");
    }
  };

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

  const saveRecordedAudio = async () => {
    if (!recordedAudioBlob) return;
    setLoading(true);
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const arrayBuffer = await recordedAudioBlob.arrayBuffer();
      const decoded = await audioCtx.decodeAudioData(arrayBuffer);
      const wavBlob = audioBufferToWav(decoded);
      const filename = `Voice_Recording_${Date.now()}.wav`;
      downloadBlob(wavBlob, filename);
      setSuccessMsg(isHi ? `ऑडियो सेव हुआ: ${filename}` : `Recording saved: ${filename}`);
      setLoading(false);
    } catch {
      downloadBlob(recordedAudioBlob, `Voice_Recording_${Date.now()}.webm`);
      setLoading(false);
    }
  };

  const processTool = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (toolId === "media_video_to_audio") {
        if (!file) throw new Error(isHi ? "कृपया पहले वीडियो फ़ाइल चुनें।" : "Please select a video file first.");
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const arrayBuffer = await file.arrayBuffer();
        const decoded = await audioCtx.decodeAudioData(arrayBuffer);
        const wavBlob = audioBufferToWav(decoded);
        const outName = `${file.name.replace(/\.[^/.]+$/, "")}_Audio.wav`;
        downloadBlob(wavBlob, outName);
        setSuccessMsg(isHi ? `ऑडियो निकाला गया: ${outName}` : `Audio successfully extracted: ${outName}`);
      } else if (toolId === "media_voice_recorder") {
        await saveRecordedAudio();
      } else if (toolId.startsWith("media_audio_")) {
        await processAudio();
      } else {
        await processVideoFrame();
      }
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* Voice Recorder Mode UI */}
      {toolId === "media_voice_recorder" ? (
        <div className="rounded-2xl border border-purple-200 bg-purple-50/40 p-5 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
            <Mic className={`h-8 w-8 ${isRecording ? "text-rose-600 animate-pulse" : "text-purple-600"}`} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isHi ? "माइक से लाइव ऑडियो रिकॉर्डर" : "Microphone Live Voice Recorder"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isHi ? "100% ऑफलाइन, सीधे आपके ब्राउज़र में रिकॉर्ड करें व WAV में सेव करें।" : "100% offline, record directly in browser and save high quality WAV."}
            </p>
          </div>

          <div className="text-2xl font-mono font-black text-slate-900">
            {formatTimer(recordingSeconds)}
          </div>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95 ${
                isRecording ? "bg-rose-600 hover:bg-rose-700 animate-pulse" : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              <span>{isRecording ? (isHi ? "रिकॉर्डिंग रोकें" : "Stop Recording") : (isHi ? "रिकॉर्डिंग शुरू करें" : "Start Recording")}</span>
            </button>
          </div>

          {recordedAudioUrl && (
            <div className="pt-3 border-t border-purple-200 space-y-3">
              <p className="text-xs font-bold text-slate-700">{isHi ? "रिकॉर्ड किया गया ऑडियो सुनें:" : "Preview Recording:"}</p>
              <audio src={recordedAudioUrl} controls className="w-full h-10" />
            </div>
          )}
        </div>
      ) : (
        /* Upload File */
        <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-4 text-center">
          <input
            type="file"
            accept={toolId.includes("video") ? "video/*" : "audio/*"}
            onChange={handleFileChange}
            id="media-file-upload"
            className="hidden"
          />
          <label htmlFor="media-file-upload" className="cursor-pointer">
            {toolId.includes("video") ? (
              <Video className="mx-auto h-8 w-8 text-emerald-600" />
            ) : (
              <Music className="mx-auto h-8 w-8 text-emerald-600" />
            )}
            <p className="mt-1 text-xs font-semibold text-emerald-950">
              {file ? file.name : isHi ? "मीडिया फ़ाइल चुनें (Audio / Video)" : "Select Media File"}
            </p>
            <p className="text-[10px] text-emerald-700">
              {isHi ? "100% ऑफलाइन लोकल प्रोसेसिंग (सुरक्षित)" : "100% offline client-side processing"}
            </p>
          </label>
        </div>
      )}

      {/* Video Preview Player */}
      {fileUrl && toolId.includes("video") && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-black">
          <video
            ref={videoRef}
            src={fileUrl}
            controls
            className="w-full max-h-60 object-contain mx-auto"
          />
        </div>
      )}

      {/* Audio Waveform / Player */}
      {fileUrl && toolId.includes("audio") && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center space-y-2">
          <audio src={fileUrl} controls className="w-full h-10" />
        </div>
      )}

      {/* Audio / Video Controls */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-3">
        {(toolId === "media_audio_trimmer" || toolId === "media_video_trimmer") && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "शुरू समय (सेकंड)" : "Start Time (s)"}</label>
              <input
                type="number"
                min="0"
                value={startTime}
                onChange={e => setStartTime(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "समाप्त समय (सेकंड)" : "End Time (s)"}</label>
              <input
                type="number"
                min="0"
                value={endTime}
                onChange={e => setEndTime(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </div>
          </div>
        )}

        {toolId === "media_audio_volume" && (
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>{isHi ? "वॉल्यूम स्तर" : "Volume Gain"}</span>
              <span className="text-emerald-700 font-bold">{Math.round(volumeLevel * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={volumeLevel}
              onChange={e => setVolumeLevel(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>
        )}

        {(toolId === "media_audio_speed" || toolId === "media_video_speed") && (
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>{isHi ? "प्लेबैक गति" : "Playback Speed"}</span>
              <span className="text-emerald-700 font-bold">{playbackSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.25"
              value={playbackSpeed}
              onChange={e => setPlaybackSpeed(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>
        )}

        {toolId === "media_video_rotate" && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "रोटेशन कोण" : "Rotation Angle"}</label>
            <div className="grid grid-cols-3 gap-2">
              {[90, 180, 270].map(angle => (
                <button
                  key={angle}
                  type="button"
                  onClick={() => setRotationAngle(angle)}
                  className={`rounded-lg py-2 text-xs font-semibold border ${
                    rotationAngle === angle 
                      ? "bg-emerald-600 text-white border-emerald-600" 
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  {angle}°
                </button>
              ))}
            </div>
          </div>
        )}

        {toolId === "media_video_aspect_ratio" && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "आस्पेक्ट रेशियो" : "Aspect Ratio"}</label>
            <div className="grid grid-cols-4 gap-2">
              {["16:9", "4:3", "1:1", "9:16"].map(ratio => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setSelectedRatio(ratio)}
                  className={`rounded-lg py-2 text-xs font-semibold border ${
                    selectedRatio === ratio 
                      ? "bg-emerald-600 text-white border-emerald-600" 
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Metadata Viewer */}
      {metaInfo && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
          <p className="text-xs font-bold text-slate-800 mb-1">{isHi ? "मीडिया मेटाडेटा विवरण:" : "Media Metadata:"}</p>
          {Object.entries(metaInfo).map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs py-0.5 border-b border-slate-50 last:border-0">
              <span className="text-slate-500">{k}</span>
              <span className="font-semibold text-slate-800">{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Run Button */}
      <button
        type="button"
        onClick={processTool}
        disabled={loading || !file}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-800 disabled:opacity-50"
      >
        {loading ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>{isHi ? "प्रोसेसिंग..." : "Processing..."}</span>
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            <span>{isHi ? "प्रोसेस और डाउनलोड करें" : "Process & Download"}</span>
          </>
        )}
      </button>

      {/* Status Messages */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-800 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
