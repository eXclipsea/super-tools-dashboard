'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, X, Aperture } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState('');

  // Set srcObject after the video element mounts (stream state change triggers re-render first)
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err?.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Unable to access camera. Please try again.');
      }
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(imageData);
      }
    }
  }, [onCapture]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    onCancel();
  }, [stream, onCancel]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="relative max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Take Photo</h3>
          <button onClick={stopCamera} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {!stream ? (
          <div className="bg-neutral-900 rounded-xl p-8 text-center">
            <Camera className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400 mb-4">Camera access required to take photos</p>
            <button
              onClick={startCamera}
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-medium py-3 px-6 rounded-lg"
            >
              Start Camera
            </button>
          </div>
        ) : (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              onLoadedMetadata={() => setIsReady(true)}
              className="w-full rounded-xl bg-black"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {isReady && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                <button
                  onClick={capturePhoto}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:bg-white/90 transition-colors"
                >
                  <Aperture className="w-8 h-8 text-black" />
                </button>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm text-center mt-4">{error}</p>
        )}
      </div>
    </div>
  );
}
