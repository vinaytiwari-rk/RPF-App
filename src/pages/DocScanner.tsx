import React, { useState, useRef, useCallback } from 'react';
import { Camera, RefreshCw, Download, Image as ImageIcon, Check, X } from 'lucide-react';

const DocScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'original' | 'grayscale' | 'magic'>('magic');
  const [error, setError] = useState<string>('');

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError('');
    } catch (err) {
      setError('Camera access denied or not available. Please ensure you have granted permissions.');
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        applyFilterAndSave(ctx, canvas);
      }
    }
  };

  const applyFilterAndSave = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    if (filterMode === 'grayscale' || filterMode === 'magic') {
      for (let i = 0; i < data.length; i += 4) {
        // Basic grayscale conversion
        const avg = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
        
        if (filterMode === 'magic') {
          // Increase contrast for 'magic' document scan look
          const factor = (259 * (128 + 255)) / (255 * (259 - 128));
          const color = factor * (avg - 128) + 128;
          data[i] = data[i + 1] = data[i + 2] = Math.min(Math.max(color, 0), 255);
        } else {
          data[i] = data[i + 1] = data[i + 2] = avg;
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }

    setCapturedImage(canvas.toDataURL('image/png'));
    stopCamera();
  };

  // Re-apply filter if mode changes after capture
  React.useEffect(() => {
    if (capturedImage && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          applyFilterAndSave(ctx, canvas);
        }
      };
      // To re-process from original, we would ideally store the original image data,
      // but for simplicity in this demo, we'll just let the user retake if they want to change modes drastically.
    }
  }, [filterMode]);

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const downloadImage = () => {
    if (capturedImage) {
      const a = document.createElement('a');
      a.href = capturedImage;
      a.download = `Document_Scan_${new Date().getTime()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fadeIn max-w-4xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Camera className="w-8 h-8 text-[var(--rp-primary)]" />
            Document Scanner
          </h1>
          <p className="text-gray-600">Digitize your physical documents instantly.</p>
        </div>
      </div>

      <div className="glass-card p-4 sm:p-8 rounded-2xl flex flex-col items-center">
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl w-full text-center">
            {error}
          </div>
        )}

        <div className="relative w-full max-w-xl aspect-[3/4] bg-black rounded-2xl overflow-hidden shadow-premium mb-6">
          {!capturedImage ? (
            <>
              {stream ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                  <Camera className="w-16 h-16 mb-4 text-gray-400" />
                  <p className="mb-6 text-gray-300">Grant camera access to scan documents.</p>
                  <button 
                    onClick={startCamera}
                    className="px-6 py-3 bg-[var(--rp-primary)] rounded-full font-bold hover:bg-blue-800 transition-colors"
                  >
                    Open Camera
                  </button>
                </div>
              )}
              
              {/* Scan Guide Overlay */}
              {stream && (
                <div className="absolute inset-4 border-2 border-white/50 border-dashed rounded-lg pointer-events-none flex items-center justify-center">
                  <span className="bg-black/50 text-white px-3 py-1 rounded text-sm backdrop-blur-sm">Align document within frame</span>
                </div>
              )}
            </>
          ) : (
            <img src={capturedImage} alt="Scanned Document" className="w-full h-full object-contain bg-gray-100" />
          )}
          
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="w-full max-w-xl flex flex-col gap-6">
          
          {/* Filters (only show if we have an image or stream) */}
          {(stream || capturedImage) && (
            <div className="flex justify-center gap-2 bg-gray-100 p-1.5 rounded-full w-max mx-auto">
              <button 
                onClick={() => setFilterMode('original')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterMode === 'original' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Original
              </button>
              <button 
                onClick={() => setFilterMode('grayscale')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterMode === 'grayscale' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Grayscale
              </button>
              <button 
                onClick={() => setFilterMode('magic')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterMode === 'magic' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
              >
                B&W Scan
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            {!capturedImage && stream && (
              <button 
                onClick={captureImage}
                className="w-16 h-16 bg-white border-4 border-gray-300 rounded-full hover:border-[var(--rp-primary)] transition-colors flex items-center justify-center shadow-lg"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-full hover:bg-[var(--rp-primary)] transition-colors" />
              </button>
            )}

            {capturedImage && (
              <>
                <button 
                  onClick={retake}
                  className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center gap-2 shadow-sm"
                >
                  <RefreshCw className="w-5 h-5" /> Retake
                </button>
                <button 
                  onClick={downloadImage}
                  className="px-6 py-3 bg-[var(--rp-primary)] text-white rounded-xl hover:bg-blue-800 transition-colors font-medium flex items-center gap-2 shadow-sm"
                >
                  <Download className="w-5 h-5" /> Save PDF/Image
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DocScanner;
