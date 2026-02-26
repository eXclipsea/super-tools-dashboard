'use client';

import { useState, useRef } from 'react';
import { Mic, User, Mail, Lock, ArrowRight, Download, X, ArrowLeft, Upload, FileAudio, Zap, Play, Pause, Square } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function VoiceTaskComponent() {
  const { user, login, logout, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [taskResult, setTaskResult] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    
    const success = await login(email, password, rememberMe);
    
    if (!success) {
      setLoginError('Invalid email or password');
    }
    
    setIsLoggingIn(false);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAudioFile(event.target?.result as string);
        setTaskResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    // Simulate recording for 3 seconds
    setTimeout(() => {
      setIsRecording(false);
      // Create a mock audio file
      setAudioFile('mock-audio-data');
    }, 3000);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const handleProcessVoice = async () => {
    if (!audioFile) return;
    
    setIsProcessing(true);
    // Simulate AI processing
    setTimeout(() => {
      setTaskResult({
        tasks: [
          { text: 'Schedule team meeting for Friday at 2 PM', priority: 'high', deadline: '2024-02-28' },
          { text: 'Review quarterly budget report', priority: 'medium', deadline: '2024-02-27' },
          { text: 'Call client about project update', priority: 'high', deadline: '2024-02-26' },
          { text: 'Update project documentation', priority: 'low', deadline: '2024-03-01' }
        ],
        summary: 'I found 4 tasks in your voice memo with varying priorities and deadlines.'
      });
      setIsProcessing(false);
    }, 2000);
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // If not logged in, show login form
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">VoiceTask</h2>
            <p className="text-white/60">Sign in to access voice task management</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 bg-white/[0.05] border border-white/[0.1] rounded text-white focus:ring-white/20"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-white/60">
                Keep me signed in
              </label>
            </div>
            
            {loginError && (
              <div className="text-red-400 text-sm">{loginError}</div>
            )}
            
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link href="/" className="text-violet-400 hover:text-violet-300 text-sm transition-colors">
              ← Back to Super Tools
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main app content when logged in
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-white/[0.02] border-b border-white/[0.04] px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-violet-400 hover:text-violet-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-white/80 text-sm">{user.email}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Download Popup */}
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-violet-500/10 backdrop-blur-xl border-b border-violet-400/20">
          <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
            <a
              href="https://github.com/eXclipsea/voice-task/releases/download/v0.1.0/VoiceTask_0.1.0_aarch64.dmg"
              className="flex items-center gap-2 text-[13px] text-white/80 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-violet-400" />
              <span>Get <strong>VoiceTask</strong> for Mac</span>
              <span className="text-violet-400 font-medium ml-1">Download &rarr;</span>
            </a>
            <button
              onClick={() => setShowBanner(false)}
              className="text-white/30 hover:text-white/60 transition-colors p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-violet-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Mic className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">VoiceTask</h1>
          <p className="text-white/60 text-lg">Transform voice memos into organized tasks with AI</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Voice Input Section */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Voice Input</h3>
            
            {!audioFile ? (
              <div className="space-y-4">
                {/* Recording Button */}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-full py-8 rounded-xl transition-all ${
                    isRecording 
                      ? 'bg-red-500/20 border-2 border-red-500 hover:bg-red-500/30' 
                      : 'bg-violet-500/20 border-2 border-violet-500 hover:bg-violet-500/30'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                      isRecording ? 'bg-red-500 animate-pulse' : 'bg-violet-500'
                    }`}>
                      {isRecording ? (
                        <Square className="w-8 h-8 text-white" />
                      ) : (
                        <Mic className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <p className="text-white font-medium">
                      {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                    </p>
                    {isRecording && (
                      <p className="text-white/60 text-sm mt-2">Recording your voice memo...</p>
                    )}
                  </div>
                </button>

                <div className="text-center">
                  <p className="text-white/40 text-sm mb-4">OR</p>
                </div>

                {/* Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-white/[0.2] rounded-xl p-6 hover:border-white/[0.4] transition-colors group"
                >
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-white/40 group-hover:text-white/60 mb-4" />
                    <p className="text-white/60 mb-2">Upload audio file</p>
                    <p className="text-white/40 text-sm">MP3, WAV, M4A up to 25MB</p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Audio Player */}
                <div className="bg-white/[0.05] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <FileAudio className="w-8 h-8 text-violet-400" />
                      <div>
                        <p className="text-white font-medium">Voice Memo</p>
                        <p className="text-white/60 text-sm">Audio file ready</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setAudioFile(null);
                        setTaskResult(null);
                      }}
                      className="text-white/40 hover:text-white/60 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlayPause}
                      className="w-12 h-12 bg-violet-500 rounded-full flex items-center justify-center hover:bg-violet-600 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white" />
                      )}
                    </button>
                    <div className="flex-1 bg-white/[0.1] rounded-full h-2">
                      <div className="bg-violet-500 h-2 rounded-full w-1/3"></div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleProcessVoice}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Convert to Tasks
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Tasks Results Section */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Generated Tasks</h3>
            
            {taskResult ? (
              <div className="space-y-4">
                <div className="bg-white/[0.05] rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-3">{taskResult.summary}</p>
                  
                  <div className="space-y-3">
                    {taskResult.tasks.map((task: any, index: number) => (
                      <div key={index} className="bg-white/[0.05] rounded-lg p-3 border-l-4 border-violet-500">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-white font-medium mb-2">{task.text}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                task.priority === 'high' 
                                  ? 'bg-red-500/20 text-red-400'
                                  : task.priority === 'medium'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-green-500/20 text-green-400'
                              }`}>
                                {task.priority}
                              </span>
                              <span className="text-white/60">
                                Due: {task.deadline}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button className="w-full bg-white/[0.05] text-white py-2 rounded-lg hover:bg-white/[0.1] transition-colors">
                  Add to Task Manager
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileAudio className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/40">Record or upload audio to generate tasks</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
