'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Trash2, CheckCircle, Clock, AlertTriangle, Sparkles, Save, List, Calendar, Settings, Download, X, ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';
import { getCurrentUser, logout } from '@/lib/auth';

interface Task {
  id: string;
  text: string;
  category: 'urgent' | 'later' | 'completed';
  createdAt: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
}

interface Recording {
  id: string;
  url: string;
  createdAt: string;
  duration: number;
  transcript?: string;
}

export default function VoiceTask() {
  const [activeTab, setActiveTab] = useState<'record' | 'tasks' | 'recordings' | 'settings'>('record');
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [showBanner, setShowBanner] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [transcribing, setTranscribing] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [transcribeError, setTranscribeError] = useState('');
  const [transcribeNotice, setTranscribeNotice] = useState('');
  const [loadingStep, setLoadingStep] = useState('');
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);

  // Load user session on mount
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    window.location.href = '/';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        audioBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        const newRecording: Recording = {
          id: Date.now().toString(),
          url,
          createdAt: new Date().toISOString(),
          duration: 0,
        };
        setRecordings(prev => [newRecording, ...prev]);

        // Auto-transcribe with real Whisper API
        transcribeRecording(newRecording, blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setTranscribeError('Microphone access denied. Please allow microphone access and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeRecording = async (recording: Recording, blob: Blob) => {
    setTranscribing(true);
    setTranscribeError('');
    setTranscribeNotice('');

    setLoadingStep('Sending audio to Whisper...');
    const t1 = setTimeout(() => setLoadingStep('Transcribing speech...'), 2000);
    const t2 = setTimeout(() => setLoadingStep('Extracting tasks with GPT-4o...'), 4000);

    try {
      const formData = new FormData();
      formData.append('audio', new File([blob], 'recording.webm', { type: 'audio/webm' }));

      const res = await fetch('/api/voicetask/transcribe', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const { transcript, tasks: parsedTasks, aiMessage } = data;

      // Always save the transcript to the recording so user can see what was heard
      if (transcript) {
        setRecordings(prev => prev.map(r =>
          r.id === recording.id ? { ...r, transcript } : r
        ));
      }

      if (aiMessage) {
        setTranscribeNotice(aiMessage);
      }

      const newTasks: Task[] = (parsedTasks || []).map((t: Omit<Task, 'id' | 'createdAt'>, idx: number) => ({
        ...t,
        id: `task-${Date.now()}-${idx}`,
        createdAt: new Date().toISOString(),
        dueDate: t.dueDate || undefined,
      }));

      if (newTasks.length > 0) {
        setTasks(prev => [...newTasks, ...prev]);
        setActiveTab('tasks');
      }
    } catch (err: any) {
      console.error('Transcribe error:', err);
      setTranscribeError(err.message || 'Failed to transcribe. Please try again.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setTranscribing(false);
      setLoadingStep('');
    }
  };

  const updateTaskCategory = (id: string, category: Task['category']) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, category } : task
    ));
  };

  const updateTaskPriority = (id: string, priority: Task['priority']) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, priority } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const deleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(rec => rec.id !== id));
  };

  const urgentTasks = tasks.filter(t => t.category === 'urgent');
  const laterTasks = tasks.filter(t => t.category === 'later');
  const completedTasks = tasks.filter(t => t.category === 'completed');

  return (
    <div className="min-h-screen bg-black text-white">
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

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-2 hover:opacity-80 transition-opacity inline-block">
              <ArrowLeft className="w-4 h-4 text-white/50" />
              <span className="text-[13px] text-white/50">Back to Super Tools</span>
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <Mic className="w-6 h-6 text-violet-400" />
              <h1 className="text-2xl font-semibold tracking-tight">VoiceTask</h1>
            </div>
            <p className="text-neutral-500">{currentUser ? `Welcome back, ${currentUser.name}` : 'AI voice-to-text task organizer'}</p>
          </div>
          {currentUser && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{currentUser.name.charAt(0).toUpperCase()}</span>
              </div>
              <button onClick={handleLogout} className="text-white/50 hover:text-white text-sm">Logout</button>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-10 border-b border-neutral-800">
          {[
            { id: 'record', label: 'Record', icon: Mic },
            { id: 'tasks', label: 'Tasks', icon: List },
            { id: 'recordings', label: 'Recordings', icon: Save },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === id
                  ? 'border-violet-400 text-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Record Tab */}
        {activeTab === 'record' && (
          <div className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <div className="bg-neutral-900 rounded-xl p-8 border border-neutral-800 text-center">
                <h2 className="text-lg font-medium mb-2">Voice Recorder</h2>
                <p className="text-neutral-500 text-sm mb-8">Record your thoughts, ideas, or to-do list. AI will transcribe and organize tasks automatically.</p>
                
                <div className="flex justify-center mb-6">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all border-2 ${
                      isRecording 
                        ? 'border-red-400 bg-red-400/20 hover:bg-red-400/30 animate-pulse' 
                        : 'border-violet-400 bg-violet-400/10 hover:bg-violet-400/20'
                    }`}
                  >
                    {isRecording ? (
                      <Square className="w-8 h-8 text-red-400" />
                    ) : (
                      <Mic className="w-8 h-8 text-violet-400" />
                    )}
                  </button>
                </div>

                <p className="text-neutral-600 text-sm">
                  {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                </p>

                {transcribing && (
                  <div className="mt-6 space-y-1 text-center">
                    <div className="flex items-center justify-center gap-2 text-violet-400">
                      <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">{loadingStep || 'Processing...'}</span>
                    </div>
                    <p className="text-xs text-neutral-600">This may take a few seconds</p>
                  </div>
                )}

                {transcribeNotice && !transcribing && (
                  <div className="mt-4 text-left bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
                    <p className="text-amber-400 text-sm font-medium mb-1">⚠ Notice from AI</p>
                    <p className="text-amber-300 text-sm">{transcribeNotice}</p>
                    <p className="text-amber-600 text-xs mt-1">Check the Recordings tab to see the full transcript.</p>
                  </div>
                )}

                {transcribeError && (
                  <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    <span className="shrink-0">⚠</span>
                    {transcribeError}
                  </div>
                )}
              </div>

              {/* Task Stats */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 text-center">
                  <div className="text-xl font-semibold text-red-400">{urgentTasks.length}</div>
                  <div className="text-xs text-neutral-500 mt-1">Urgent</div>
                </div>
                <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 text-center">
                  <div className="text-xl font-semibold text-violet-400">{laterTasks.length}</div>
                  <div className="text-xs text-neutral-500 mt-1">Later</div>
                </div>
                <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 text-center">
                  <div className="text-xl font-semibold text-green-400">{completedTasks.length}</div>
                  <div className="text-xs text-neutral-500 mt-1">Done</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Urgent Tasks */}
            {urgentTasks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Urgent ({urgentTasks.length})
                </h3>
                <div className="space-y-3">
                  {urgentTasks.map(task => (
                    <div key={task.id} className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm">{task.text}</p>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        {task.dueDate && (
                          <span className="text-red-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {task.dueDate}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded ${
                          task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {task.priority}
                        </span>
                        <select
                          value={task.category}
                          onChange={(e) => updateTaskCategory(task.id, e.target.value as Task['category'])}
                          className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs"
                        >
                          <option value="urgent">Urgent</option>
                          <option value="later">Later</option>
                          <option value="completed">Done</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Later Tasks */}
            {laterTasks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-violet-400" />
                  Later ({laterTasks.length})
                </h3>
                <div className="space-y-3">
                  {laterTasks.map(task => (
                    <div key={task.id} className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm">{task.text}</p>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        {task.dueDate && (
                          <span className="text-violet-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {task.dueDate}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded ${
                          task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {task.priority}
                        </span>
                        <select
                          value={task.category}
                          onChange={(e) => updateTaskCategory(task.id, e.target.value as Task['category'])}
                          className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs"
                        >
                          <option value="urgent">Urgent</option>
                          <option value="later">Later</option>
                          <option value="completed">Done</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Completed ({completedTasks.length})
                </h3>
                <div className="space-y-3">
                  {completedTasks.map(task => (
                    <div key={task.id} className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 opacity-60">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm line-through">{task.text}</p>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-green-400">Completed</span>
                        <select
                          value={task.category}
                          onChange={(e) => updateTaskCategory(task.id, e.target.value as Task['category'])}
                          className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs"
                        >
                          <option value="urgent">Urgent</option>
                          <option value="later">Later</option>
                          <option value="completed">Done</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tasks.length === 0 && (
              <div className="text-center py-12">
                <List className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-500">No tasks yet. Record a voice memo to get started!</p>
              </div>
            )}
          </div>
        )}

        {/* Recordings Tab */}
        {activeTab === 'recordings' && (
          <div className="space-y-6">
            {recordings.length === 0 ? (
              <div className="text-center py-12">
                <Save className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-500">No recordings yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recordings.map(recording => (
                  <div key={recording.id} className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-sm font-medium">Recording</span>
                        <span className="text-xs text-neutral-500 ml-2">
                          {new Date(recording.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <audio controls className="h-8">
                          <source src={recording.url} type="audio/webm" />
                        </audio>
                        <button
                          onClick={() => deleteRecording(recording.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {recording.transcript && (
                      <div className="bg-neutral-800 rounded-lg p-4">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-violet-400" />
                          Transcript
                        </h4>
                        <p className="text-sm text-neutral-300">{recording.transcript}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
              <h3 className="text-lg font-semibold mb-4">Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-transcribe</p>
                    <p className="text-sm text-neutral-500">Automatically transcribe recordings</p>
                  </div>
                  <button className="w-12 h-6 bg-violet-400 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Task categorization</p>
                    <p className="text-sm text-neutral-500">AI-powered task organization</p>
                  </div>
                  <button className="w-12 h-6 bg-violet-400 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Priority detection</p>
                    <p className="text-sm text-neutral-500">Identify urgent tasks</p>
                  </div>
                  <button className="w-12 h-6 bg-violet-400 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
              <h3 className="text-lg font-semibold mb-4">Storage</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Recordings</span>
                  <span>{recordings.length} files</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Tasks</span>
                  <span>{tasks.length} total</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Storage used</span>
                  <span>~{recordings.length * 2} MB</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
