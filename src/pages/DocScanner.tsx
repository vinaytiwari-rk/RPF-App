import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, Download, FileText, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

type FilterMode = 'original' | 'grayscale' | 'magic';
type SavedScan = { id: string; name: string; image: string; createdAt: string };

const STORAGE_KEY = 'rpf_document_scans_v1';
const MAX_LOCAL_SCANS = 10;

const DocScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>('magic');
  const [error, setError] = useState('');
  const [savedScans, setSavedScans] = useState<SavedScan[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSavedScans(JSON.parse(stored));
    } catch {
      setSavedScans([]);
    }
  }, []);

  const persistScans = (scans: SavedScan[]) => {
    setSavedScans(scans);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera is not supported in this browser or WebView.');
      return;
    }

    try {
      // Stop any previous stream before requesting a new one.
      setStream(current => {
        current?.getTracks().forEach(track => track.stop());
        return null;
      });

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      // The <video> element is rendered only after stream state changes.
      // Do not assign srcObject here because videoRef.current can still be null.
      setStream(mediaStream);
      setError('');
    } catch (err) {
      const name = err instanceof DOMException ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setError('Camera permission was denied. Please allow Camera permission for RPFoundation in Android Settings and try again.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setError('No camera was found on this device.');
      } else if (name === 'NotReadableError' || name === 'TrackStartError') {
        setError('The camera is busy or unavailable. Close other apps using the camera and try again.');
      } else {
        setError('Unable to start the camera. Please check camera permission and try again.');
      }
      console.error('Error accessing camera:', err);
    }
  };

  // IMPORTANT for Android WebView: the video element does not exist until
  // after setStream() causes a render. Attach the MediaStream after that render.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;

    const playVideo = async () => {
      try {
        await video.play();
        setError('');
      } catch (err) {
        console.warn('Video autoplay/play failed; waiting for canplay:', err);
      }
    };

    const handleCanPlay = () => {
      void playVideo();
    };

    video.addEventListener('canplay', handleCanPlay);
    void playVideo();

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      if (video.srcObject === stream) video.srcObject = null;
    };
  }, [stream]);

  const stopCamera = useCallback(() => {
    setStream(current => {
      current?.getTracks().forEach(track => track.stop());
      return null;
    });
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const processImage = useCallback((source: string, mode: FilterMode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      if (mode !== 'original') {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          if (mode === 'grayscale') {
            data[i] = data[i + 1] = data[i + 2] = gray;
          } else {
            const contrast = 1.75;
            const value = Math.min(255, Math.max(0, contrast * (gray - 128) + 128));
            data[i] = data[i + 1] = data[i + 2] = value;
          }
        }
        ctx.putImageData(imageData, 0, 0);
      }
      setCapturedImage(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.src = source;
  }, []);

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Camera is not ready yet. Please wait a moment and try again.');
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const original = canvas.toDataURL('image/jpeg', 0.92);
    setOriginalImage(original);
    processImage(original, filterMode);
    stopCamera();
    setError('');
  };

  useEffect(() => {
    if (originalImage) processImage(originalImage, filterMode);
  }, [filterMode, originalImage, processImage]);

  const retake = () => {
    setCapturedImage(null);
    setOriginalImage(null);
    startCamera();
  };

  const saveImage = () => {
    if (!capturedImage) return;
    const a = document.createElement('a');
    a.href = capturedImage;
    a.download = `RPF_Document_${Date.now()}.jpg`;
    a.click();
  };

  const savePdf = () => {
    if (!capturedImage) return;
    const img = new Image();
    img.onload = () => {
      const orientation = img.naturalWidth >= img.naturalHeight ? 'landscape' : 'portrait';
      const pdf = new jsPDF({ orientation, unit: 'px', format: [img.naturalWidth, img.naturalHeight], compress: true });
      pdf.addImage(capturedImage, 'JPEG', 0, 0, img.naturalWidth, img.naturalHeight, undefined, 'FAST');
      pdf.save(`RPF_Document_${Date.now()}.pdf`);
    };
    img.src = capturedImage;
  };

  const saveToLibrary = () => {
    if (!capturedImage) return;
    const scan: SavedScan = {
      id: crypto.randomUUID(),
      name: `Document ${new Date().toLocaleString()}`,
      image: capturedImage,
      createdAt: new Date().toISOString(),
    };
    persistScans([scan, ...savedScans].slice(0, MAX_LOCAL_SCANS));
  };

  const deleteScan = (id: string) => persistScans(savedScans.filter(scan => scan.id !== id));

  const openSavedScan = (scan: SavedScan) => {
    setCapturedImage(scan.image);
    setOriginalImage(scan.image);
    stopCamera();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fadeIn max-w-4xl mx-auto space-y-6 text-[#14213D]">
      <div>
        <h1 className="text-2xl font-bold text-[#14213D] flex items-center gap-2">
          <Camera className="w-7 h-7 text-[#D97706]" />
          Document Scanner (दस्तावेज़ स्कैनर)
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1">
          Scan documents, apply magic/grayscale filters, save as PDF/Image, and keep scans securely on your device.
        </p>
      </div>

      <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 sm:p-6 flex flex-col items-center shadow-2xs">
        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-[#DC2626] rounded-xl w-full text-center text-xs font-bold">{error}</div>}

        <div className="relative w-full max-w-xl aspect-[3/4] bg-slate-950 rounded-2xl overflow-hidden shadow-md mb-6">
          {!capturedImage ? (
            stream ? (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-4 border-2 border-amber-400/80 border-dashed rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="bg-black/70 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold">
                    Align document within frame / दस्तावेज़ को फ्रेम में रखें
                  </span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                <Camera className="w-14 h-14 mb-3 text-amber-400" />
                <p className="mb-4 text-slate-300 text-xs font-medium">Camera access is required to scan documents.</p>
                <button
                  onClick={startCamera}
                  className="px-5 py-2.5 bg-[#D97706] hover:bg-[#C2410C] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Start Camera (कैमरा खोलें)
                </button>
              </div>
            )
          ) : (
            <img src={capturedImage} alt="Scanned document" className="w-full h-full object-contain bg-slate-100" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {(stream || capturedImage) && (
          <div className="flex justify-center gap-2 bg-gray-100 p-1.5 rounded-full w-max mx-auto mb-6">
            {(['original', 'grayscale', 'magic'] as FilterMode[]).map(mode => (
              <button key={mode} onClick={() => setFilterMode(mode)} className={`px-4 py-2 rounded-full text-sm font-medium ${filterMode === mode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
                {mode === 'magic' ? 'B&W Scan' : mode[0].toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          {!capturedImage && stream && (
            <button onClick={captureImage} aria-label="Capture document" className="w-16 h-16 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
            </button>
          )}
          {capturedImage && (
            <>
              <button onClick={retake} className="px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium flex items-center gap-2"><RefreshCw className="w-5 h-5" /> Retake</button>
              <button onClick={saveImage} className="px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium flex items-center gap-2"><Download className="w-5 h-5" /> Image</button>
              <button onClick={savePdf} className="px-5 py-3 bg-[var(--rp-primary)] text-white rounded-xl font-medium flex items-center gap-2"><FileText className="w-5 h-5" /> PDF</button>
              <button onClick={saveToLibrary} className="px-5 py-3 bg-[var(--rp-secondary)] text-white rounded-xl font-medium">Save on Device</button>
            </>
          )}
        </div>
      </div>

      {savedScans.length > 0 && (
        <section className="glass-card p-5 rounded-2xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Saved on this device</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {savedScans.map(scan => (
              <div key={scan.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <button onClick={() => openSavedScan(scan)} className="block w-full" title="Open scan">
                  <img src={scan.image} alt={scan.name} className="w-full aspect-[3/4] object-cover" />
                </button>
                <div className="p-2 flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-600 truncate">{scan.name}</span>
                  <button onClick={() => deleteScan(scan.id)} aria-label="Delete saved scan" className="text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">Up to {MAX_LOCAL_SCANS} scans are stored locally in this browser/device. They are not uploaded to the RPF server.</p>
        </section>
      )}
    </div>
  );
};

export default DocScanner;
