'use client';

import { useState, useRef, useCallback } from 'react';
import { Mic, X, Square, Play, RotateCcw } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onCancel: () => void;
}

export function AudioRecorder({ onRecordingComplete, onCancel }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        audioChunksRef.current = [];
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Unable to access microphone. Please ensure microphone permissions are granted.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording]);

  const resetRecording = useCallback(() => {
    setAudioBlob(null);
    setRecordingTime(0);
    audioChunksRef.current = [];
  }, []);

  const confirmRecording = useCallback(() => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
    }
  }, [audioBlob, onRecordingComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="relative max-w-md w-full mx-4 bg-neutral-900 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Record Voice Memo</h3>
          <button onClick={onCancel} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center">
          {!isRecording && !audioBlob && (
            <>
              <Mic className="w-16 h-16 text-violet-400 mx-auto mb-4" />
              <p className="text-neutral-400 mb-6">Tap the button below to start recording</p>
              <button
                onClick={startRecording}
                className="w-20 h-20 bg-violet-500 hover:bg-violet-600 rounded-full flex items-center justify-center transition-colors"
              >
                <Mic className="w-8 h-8 text-white" />
              </button>
            </>
          )}

          {isRecording && (
            <>
              <div className="text-4xl font-bold text-violet-400 mb-4">
                {formatTime(recordingTime)}
              </div>
              <p className="text-neutral-400 mb-6">Recording...</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 text-sm">Recording</span>
              </div>
              <button
                onClick={stopRecording}
                className="w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
              >
                <Square className="w-8 h-8 text-white" />
              </button>
            </>
          )}

          {audioBlob && !isRecording && (
            <>
              <div className="text-4xl font-bold text-violet-400 mb-4">
                {formatTime(recordingTime)}
              </div>
              <p className="text-neutral-400 mb-6">Recording complete!</p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={resetRecording}
                  className="w-14 h-14 bg-neutral-700 hover:bg-neutral-600 rounded-full flex items-center justify-center transition-colors"
                >
                  <RotateCcw className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={confirmRecording}
                  className="w-20 h-20 bg-violet-500 hover:bg-violet-600 rounded-full flex items-center justify-center transition-colors"
                >
                  <Play className="w-8 h-8 text-white" />
                </button>
              </div>
            </>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mt-4">{error}</p>
        )}
      </div>
    </div>
  );
}
