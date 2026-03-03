'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, RotateCcw, ArrowLeft, Timer, CheckCircle2, Camera, Upload, AlertCircle, X } from 'lucide-react';
import Link from 'next/link';
import { saveData, loadData } from '@/lib/data';
import { CameraCapture } from '@/components/CameraCapture';

interface DeclutterTask {
  id: string;
  task: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface RoomAnalysis {
  roomType: string;
  clutterLevel: 'light' | 'moderate' | 'heavy';
  tasks: DeclutterTask[];
  tips: string[];
}

export default function SpaceClear() {
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<RoomAnalysis | null>(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [scanError, setScanError] = useState('');
  const [loadingStep, setLoadingStep] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user session and saved data on mount
  useEffect(() => {
    const init = async () => {
      const saved = await loadData('spaceclear_analysis', null);
      if (saved) {
        setAnalysis(saved);
      }
      setIsInitialized(true);
    };
    init();
  }, []);

  // Persist analysis whenever it changes
  useEffect(() => {
    if (isInitialized && analysis) {
      saveData('spaceclear_analysis', analysis);
    }
  }, [analysis, isInitialized]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setScanError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (imageData: string) => {
    setSelectedImage(imageData);
    setShowCamera(false);
    setScanError('');
  };

  const analyzeRoom = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setScanError('');
    
    const t1 = setTimeout(() => setLoadingStep('Uploading image...'), 100);
    const t2 = setTimeout(() => setLoadingStep('AI analyzing room...'), 1500);
    const t3 = setTimeout(() => setLoadingStep('Generating task list...'), 3000);

    try {
      const res = await fetch('/api/spaceclear/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: selectedImage })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze room');
      }

      // Transform AI response into tasks
      const tasks: DeclutterTask[] = data.tasks.map((task: string, index: number) => ({
        id: `task-${index}`,
        task,
        completed: false,
        priority: index < 3 ? 'high' : index < 6 ? 'medium' : 'low'
      }));

      const roomAnalysis: RoomAnalysis = {
        roomType: data.roomType || 'Room',
        clutterLevel: data.clutterLevel || 'moderate',
        tasks,
        tips: data.tips || []
      };

      setAnalysis(roomAnalysis);
      setTimeLeft(600);
      setIsTimerActive(false);
    } catch (err: any) {
      setScanError(err.message || 'Failed to analyze room. Please try again.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setIsAnalyzing(false);
      setLoadingStep('');
    }
  };

  const toggleTask = (taskId: string) => {
    if (!analysis) return;
    setAnalysis({
      ...analysis,
      tasks: analysis.tasks.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setSelectedImage(null);
    setTimeLeft(600);
    setIsTimerActive(false);
    saveData('spaceclear_analysis', null);
  };

  const completedCount = analysis?.tasks.filter(t => t.completed).length || 0;
  const totalCount = analysis?.tasks.length || 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-4 h-4 text-white/50" />
            <span className="text-[13px] text-white/50">Back</span>
          </Link>
          <div className="w-px h-6 bg-neutral-800" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h1 className="text-lg font-semibold tracking-tight">SpaceClear</h1>
          </div>
        </div>

        {!analysis ? (
          /* Photo Upload Section */
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800">
              <h3 className="text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                How it works
              </h3>
              <ol className="text-sm text-neutral-500 space-y-1 list-decimal list-inside">
                <li>Take a photo of any cluttered room or space</li>
                <li>AI analyzes the clutter and identifies problem areas</li>
                <li>Get a customized step-by-step decluttering task list</li>
                <li>Use the 10-minute timer to stay focused</li>
              </ol>
            </div>

            <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
              <h2 className="text-lg font-semibold mb-4">Upload Room Photo</h2>
              
              {!selectedImage ? (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-800 hover:border-neutral-600 rounded-xl p-6 text-center transition-colors"
                  >
                    <Upload className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                    <p className="text-neutral-400 text-sm">Upload Photo</p>
                    <p className="text-neutral-600 text-xs mt-1">From gallery</p>
                  </button>
                  <button
                    onClick={() => setShowCamera(true)}
                    className="border-2 border-dashed border-emerald-400/50 hover:border-emerald-400 rounded-xl p-6 text-center transition-colors"
                  >
                    <Camera className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-emerald-400 text-sm">Take Photo</p>
                    <p className="text-neutral-600 text-xs mt-1">Use camera</p>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img src={selectedImage} alt="Room" className="w-full h-64 object-cover rounded-xl" />
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={analyzeRoom}
                      disabled={isAnalyzing}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          {loadingStep || 'Analyzing...'}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Analyze Room with AI
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {scanError && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm font-medium mb-1 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Something went wrong
                  </p>
                  <p className="text-red-300 text-sm">{scanError}</p>
                </div>
              )}

              {!selectedImage && !scanError && (
                <div className="mt-4 text-xs text-neutral-600">
                  <p className="font-medium text-neutral-500 mb-1">Photo tips:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Capture the whole room in one photo if possible</li>
                    <li>Ensure good lighting for better analysis</li>
                    <li>Include visible clutter and problem areas</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Analysis Results */
          <div className="space-y-6">
            {/* Room Info */}
            <div className="bg-neutral-900/50 rounded-3xl p-6 border border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-neutral-500 text-sm">Detected: {analysis.roomType}</p>
                  <h2 className="text-2xl font-semibold text-emerald-300">
                    Clutter Level: {analysis.clutterLevel.charAt(0).toUpperCase() + analysis.clutterLevel.slice(1)}
                  </h2>
                </div>
                <button
                  onClick={resetAnalysis}
                  className="text-neutral-500 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>

              {/* Timer */}
              <div className="flex items-center justify-center py-4">
                <div className="text-center">
                  <div className="flex items-center gap-3 text-neutral-500 mb-2">
                    <Timer className="w-4 h-4" />
                    <span className="text-sm">10-Minute Focus Session</span>
                  </div>
                  <div className={`text-5xl font-mono font-light ${timeLeft < 60 ? 'text-red-400' : 'text-emerald-300'}`}>
                    {formatTime(timeLeft)}
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setIsTimerActive(!isTimerActive)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium py-2 px-6 rounded-xl transition-colors"
                >
                  {isTimerActive ? 'Pause' : timeLeft === 600 ? 'Start Timer' : 'Resume'}
                </button>
                <button
                  onClick={() => {
                    setTimeLeft(600);
                    setIsTimerActive(false);
                  }}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-2 px-6 rounded-xl transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-400 font-medium">Decluttering Progress</span>
                <span className="text-emerald-400">{completedCount} / {totalCount} tasks</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div
                  className="bg-emerald-400 h-2 rounded-full transition-all"
                  style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Your Decluttering Tasks</h3>
              {analysis.tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    task.completed
                      ? 'bg-emerald-500/10 border-emerald-500/30 opacity-50'
                      : task.priority === 'high'
                        ? 'bg-red-500/5 border-red-500/20'
                        : task.priority === 'medium'
                          ? 'bg-amber-500/5 border-amber-500/20'
                          : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      task.completed ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {task.completed ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs">{task.priority === 'high' ? '!' : '•'}</span>}
                    </div>
                    <div className="flex-1">
                      <span className={`${task.completed ? 'line-through text-emerald-300' : 'text-white'}`}>
                        {task.task}
                      </span>
                      {!task.completed && (
                        <span className={`ml-2 text-xs ${
                          task.priority === 'high' ? 'text-red-400' : task.priority === 'medium' ? 'text-amber-400' : 'text-neutral-500'
                        }`}>
                          {task.priority} priority
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Tips */}
            {analysis.tips.length > 0 && (
              <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800">
                <h3 className="text-sm font-medium text-neutral-500 mb-3">Pro Tips</h3>
                <ul className="space-y-2">
                  {analysis.tips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-neutral-400 flex items-start gap-2">
                      <span className="text-emerald-400">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Completion */}
            {completedCount === totalCount && totalCount > 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-medium text-emerald-300 mb-2">Space Cleared!</h3>
                <p className="text-neutral-500">Great job. Your space looks better already.</p>
              </div>
            )}
          </div>
        )}

        {showCamera && (
          <CameraCapture
            onCapture={handleCameraCapture}
            onCancel={() => setShowCamera(false)}
          />
        )}
      </div>
    </div>
  );
}
