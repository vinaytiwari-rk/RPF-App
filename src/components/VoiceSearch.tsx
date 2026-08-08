import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

interface VoiceSearchProps {
  onResult: (text: string) => void;
  className?: string;
}

export const VoiceSearch: React.FC<VoiceSearchProps> = ({ onResult, className = "" }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        audioChunks.current = [];
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required for voice search.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    const formData = new FormData();
    // Sarvam API expects a file. 
    formData.append('file', blob, 'recording.wav');

    try {
      const res = await fetch('/api/public/speech-to-text', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data?.transcript) {
        onResult(data.data.transcript);
      } else {
        console.error("Transcription failed:", data);
        alert("Sorry, could not transcribe the audio. Please try again.");
      }
    } catch (err) {
      console.error("Audio upload error:", err);
      alert("Error processing voice search. Please try again later.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <button disabled className={`p-2 bg-indigo-100 text-indigo-600 rounded-full ${className}`}>
        <Loader2 className="w-5 h-5 animate-spin" />
      </button>
    );
  }

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      className={`p-2 rounded-full transition-colors flex items-center justify-center ${
        isRecording 
          ? 'bg-red-500 text-white animate-pulse shadow-md' 
          : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
      } ${className}`}
      title={isRecording ? "Stop Recording" : "Voice Search"}
    >
      {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
    </button>
  );
};
