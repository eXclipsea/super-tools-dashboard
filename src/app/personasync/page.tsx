'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  User, MessageSquare, Sparkles, Copy, Check, BookOpen, Zap, 
  ImagePlus, X, Trash2, ArrowLeft, Aperture, 
  FileText, StickyNote, MessageCircle, GraduationCap, Upload,
  Link2, FileUp, Lightbulb, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { CameraCapture } from '@/components/CameraCapture';

interface StyleProfile {
  description: string;
  characteristics: string[];
  commonPhrases?: string[];
  sentencePatterns?: string;
  toneMarkers?: string;
}

interface SavedBrand {
  id: string;
  name: string;
  profile: StyleProfile;
  sourceType: 'paste' | 'google-doc' | 'essay' | 'imessage' | 'screenshot' | 'camera';
  styleCategory: 'formal' | 'casual' | 'notes';
  createdAt: string;
}

interface HistoryEntry {
  id: string;
  inputMessage: string;
  summary: string;
  draft: string;
  brandName: string;
  outputType: 'reply' | 'notes';
  feedback?: 'positive' | 'negative';
  timestamp: string;
}

type InputSource = 'paste' | 'google-doc' | 'essay' | 'imessage' | 'screenshot' | 'camera';
type OutputType = 'reply' | 'notes';
type ToneMode = 'casual' | 'match' | 'formal';
type StyleCategory = 'formal' | 'casual' | 'notes';

export default function PersonaSync() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'brands' | 'connect' | 'history'>('analyze');
  const [step, setStep] = useState<1 | 1.5 | 2 | 3>(1);
  const [examples, setExamples] = useState('');
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [summary, setSummary] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [savedBrands, setSavedBrands] = useState<SavedBrand[]>([]);
  const [messageHistory, setMessageHistory] = useState<HistoryEntry[]>([]);
  const [tone, setTone] = useState<ToneMode>('match');
  const [inputSource, setInputSource] = useState<InputSource>('paste');
  const [outputType, setOutputType] = useState<OutputType>('reply');
  const [googleDocUrl, setGoogleDocUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileText, setUploadedFileText] = useState('');
  const [notesTopic, setNotesTopic] = useState('');
  const [questionToAnswer, setQuestionToAnswer] = useState('');
  const [parsingFile, setParsingFile] = useState(false);
  const [styleCategory, setStyleCategory] = useState<StyleCategory>('casual');
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'positive' | 'negative'>>({});
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [parsingImage, setParsingImage] = useState(false);
  const [screenshotNotice, setScreenshotNotice] = useState('');
  const [loadingStep, setLoadingStep] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  // API Keys state
  const [groqApiKey, setGroqApiKey] = useState('');
  const [useGroq, setUseGroq] = useState(false);

  // Load API keys on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('personasync_groq_key');
    if (savedKey) {
      setGroqApiKey(savedKey);
      setUseGroq(true);
    }
  }, []);

  const saveGroqKey = (key: string) => {
    if (key) {
      localStorage.setItem('personasync_groq_key', key);
      setGroqApiKey(key);
      setUseGroq(true);
    } else {
      localStorage.removeItem('personasync_groq_key');
      setGroqApiKey('');
      setUseGroq(false);
    }
  };

  // Google Drive connection state
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleUser, setGoogleUser] = useState<{email?: string; name?: string; picture?: string} | null>(null);
  const [googleFiles, setGoogleFiles] = useState<any[]>([]);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Detect if running in Tauri desktop app
  const [isDesktopApp, setIsDesktopApp] = useState(false);
  useEffect(() => {
    // @ts-ignore - Tauri injects this global
    setIsDesktopApp(typeof window !== 'undefined' && !!(window.__TAURI__ || window.__TAURI_INTERNALS__));
  }, []);

  // Auto-setup wizard state
  const [showAutoSetup, setShowAutoSetup] = useState(true);
  const [autoSetupStep, setAutoSetupStep] = useState<'checking' | 'found' | 'importing' | 'done'>('checking');
  const [detectedSources, setDetectedSources] = useState<{
    imessageAvailable: boolean;
    fullDiskAccess: boolean;
    googleDriveConnected: boolean;
  }>({ imessageAvailable: false, fullDiskAccess: false, googleDriveConnected: false });

  // Check available data sources on mount
  useEffect(() => {
    checkAvailableSources();
  }, [isDesktopApp]);

  const checkAvailableSources = async () => {
    setAutoSetupStep('checking');
    const sources = {
      imessageAvailable: false,
      fullDiskAccess: false,
      googleDriveConnected: false,
    };

    // Check if desktop app with iMessage access
    if (isDesktopApp) {
      try {
        // @ts-ignore - Tauri API
        const { invoke } = window.__TAURI__?.core || window.__TAURI_INTERNALS__?.core;
        const hasAccess = await invoke('check_full_disk_access');
        sources.fullDiskAccess = hasAccess;
        sources.imessageAvailable = hasAccess;
      } catch (e) {
        console.log('Full disk access check failed');
      }
    }

    // Check Google Drive
    try {
      const res = await fetch('/api/personasync/google-drive');
      const data = await res.json();
      sources.googleDriveConnected = data.connected;
    } catch (e) {
      console.log('Google Drive check failed');
    }

    setDetectedSources(sources);
    setAutoSetupStep('found');

    // If we have at least one source, show the setup panel
    if (sources.imessageAvailable || sources.googleDriveConnected) {
      setShowAutoSetup(true);
    }
  };

  const runAutoSetup = async () => {
    setAutoSetupStep('importing');
    setLoading(true);
    
    let importedText = '';
    let sourceType: InputSource = 'paste';

    // Import iMessages if available
    if (detectedSources.imessageAvailable && detectedSources.fullDiskAccess) {
      setLoadingStep('Syncing iMessages...');
      try {
        // @ts-ignore - Tauri API
        const { invoke } = window.__TAURI__?.core || window.__TAURI_INTERNALS__?.core || await import('@tauri-apps/api/core');
        const conversations = await invoke('read_imessage_database', { limit: 1000 });
        
        for (const conv of conversations as any[]) {
          importedText += `\n--- ${conv.display_name} ---\n`;
          for (const msg of conv.messages) {
            const sender = msg.is_from_me ? 'Me' : msg.sender;
            importedText += `[${msg.date}] ${sender}: ${msg.text}\n`;
          }
        }
        sourceType = 'imessage';
      } catch (err) {
        console.error('iMessage import failed:', err);
      }
    }

    // Import Google Docs if connected
    if (detectedSources.googleDriveConnected) {
      setLoadingStep('Fetching Google Docs...');
      try {
        const res = await fetch('/api/personasync/google-drive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'listFiles' }),
        });
        const data = await res.json();
        
        if (data.files && data.files.length > 0) {
          // Import first few docs
          for (const file of data.files.slice(0, 3)) {
            const docRes = await fetch('/api/personasync/google-drive', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'getDoc', fileId: file.id }),
            });
            const docData = await docRes.json();
            if (docData.text) {
              importedText += `\n--- ${file.name} ---\n${docData.text}\n`;
            }
          }
          if (sourceType === 'paste') sourceType = 'google-doc';
        }
      } catch (err) {
        console.error('Google Docs import failed:', err);
      }
    }

    setLoading(false);
    setLoadingStep('');

    if (importedText.length > 100) {
      setUploadedFileText(importedText);
      setExamples(importedText.substring(0, 5000));
      setInputSource(sourceType);
      setAutoSetupStep('done');
      
      // Auto-analyze after import
      setTimeout(() => {
        analyzeStyle();
      }, 500);
    } else {
      setAutoSetupStep('found');
      alert('Could not auto-import data. Please try manual upload.');
    }
  };

  // Auto-set tone and style category based on input source
  useEffect(() => {
    switch (inputSource) {
      case 'imessage':
      case 'screenshot':
      case 'camera':
        setTone('casual');
        setStyleCategory('casual');
        break;
      case 'essay':
        setTone('formal');
        setStyleCategory('formal');
        break;
      case 'google-doc':
        setTone('match');
        setStyleCategory('notes');
        break;
      case 'paste':
      default:
        setTone('match');
        setStyleCategory('casual');
    }
  }, [inputSource]);

  // Check Google connection on mount
  useEffect(() => {
    checkGoogleConnection();
  }, []);

  const checkGoogleConnection = async () => {
    try {
      const res = await fetch('/api/personasync/google-drive');
      const data = await res.json();
      if (data.connected) {
        setGoogleConnected(true);
        setGoogleUser(data);
        fetchGoogleFiles();
      }
    } catch (err) {
      console.error('Failed to check Google connection:', err);
    }
  };

  const connectGoogle = async () => {
    try {
      const res = await fetch('/api/personasync/auth/google');
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to start Google connection');
    }
  };

  const disconnectGoogle = async () => {
    try {
      await fetch('/api/personasync/google-drive', { method: 'DELETE' });
      setGoogleConnected(false);
      setGoogleUser(null);
      setGoogleFiles([]);
    } catch (err) {
      console.error('Failed to disconnect Google:', err);
    }
  };

  const fetchGoogleFiles = async () => {
    setGoogleLoading(true);
    try {
      const res = await fetch('/api/personasync/google-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'listFiles' }),
      });
      const data = await res.json();
      if (data.files) {
        setGoogleFiles(data.files);
      }
    } catch (err) {
      console.error('Failed to fetch Google files:', err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const importGoogleDoc = async (fileId: string, fileName: string) => {
    setLoading(true);
    setLoadingStep('Importing from Google Drive...');
    try {
      const res = await fetch('/api/personasync/google-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getDoc', fileId }),
      });
      const data = await res.json();
      if (data.text) {
        setExamples(data.text.substring(0, 5000));
        setGoogleDocUrl(`https://docs.google.com/document/d/${fileId}/edit`);
        setInputSource('google-doc');
        setActiveTab('analyze');
        setStep(1);
        alert(`Imported "${fileName}" successfully!`);
      } else {
        alert('Failed to import document');
      }
    } catch (err) {
      alert('Failed to import from Google Drive');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingImage(true);
    setScreenshotNotice('');
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setScreenshotPreview(dataUrl);

      try {
        const res = await fetch('/api/personasync/parse-screenshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        if (data.hasText && data.text) {
          setExamples(data.text);
        } else {
          setScreenshotNotice(
            data.reason
              ? `AI couldn't extract text: ${data.reason}`
              : 'No readable message text found. Try a screenshot of iMessage, Gmail, or any chat app where the text is clearly visible.'
          );
        }
      } catch (err: any) {
        console.error('Screenshot parse error:', err);
        setScreenshotNotice(err.message || 'Failed to read screenshot. Please try again or paste your text manually.');
      } finally {
        setParsingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (imageData: string) => {
    setScreenshotPreview(imageData);
    setShowCamera(false);
    // Trigger the same parsing as upload
    setParsingImage(true);
    setScreenshotNotice('');
    fetch('/api/personasync/parse-screenshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageData }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        if (data.hasText && data.text) {
          setExamples(data.text);
        } else {
          setScreenshotNotice(
            data.reason
              ? `AI couldn't extract text: ${data.reason}`
              : 'No readable message text found. Try a screenshot of iMessage, Gmail, or any chat app where the text is clearly visible.'
          );
        }
      })
      .catch((err: any) => {
        console.error('Screenshot parse error:', err);
        setScreenshotNotice(err.message || 'Failed to read screenshot. Please try again or paste your text manually.');
      })
      .finally(() => {
        setParsingImage(false);
      });
  };

  const getAnalysisText = () => {
    switch (inputSource) {
      case 'google-doc':
        return uploadedFileText || examples;
      case 'essay':
      case 'imessage':
        return uploadedFileText || examples;
      default:
        return examples;
    }
  };

  const fetchGoogleDoc = async () => {
    if (!googleDocUrl.trim()) return;
    
    setLoading(true);
    setLoadingStep('Fetching Google Doc...');
    
    try {
      const res = await fetch('/api/personasync/fetch-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: googleDocUrl }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setExamples(data.text.substring(0, 5000));
      setLoadingStep('Google Doc loaded!');
      setTimeout(() => setLoadingStep(''), 1000);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch Google Doc. Make sure it\'s publicly viewable.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'essay' | 'imessage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setParsingFile(true);
    setUploadedFileText('');

    try {
      let text = '';
      
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
        text = await file.text();
      } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
        const html = await file.text();
        text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      } else {
        // PDF/DOCX - send to server
        const formData = new FormData();
        formData.append('file', file);
        
        const res = await fetch('/api/personasync/parse-file', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        text = data.text;
      }

      if (text.length < 100) {
        throw new Error('File appears to be empty or contains no readable text');
      }

      setUploadedFileText(text);
      setExamples(text.substring(0, 5000));
    } catch (err: any) {
      console.error('File parse error:', err);
      alert(err.message || 'Failed to parse file');
      setUploadedFile(null);
    } finally {
      setParsingFile(false);
    }
  };

  const getSourceLabel = (source: InputSource): string => {
    const labels: Record<InputSource, string> = {
      'paste': 'Paste Text',
      'google-doc': 'Google Doc',
      'essay': 'Essay/File',
      'imessage': 'iMessage Export',
      'screenshot': 'Screenshot',
      'camera': 'Camera'
    };
    return labels[source];
  };

  const getSourceIcon = (source: InputSource) => {
    const icons = {
      'paste': FileText,
      'google-doc': Link2,
      'essay': GraduationCap,
      'imessage': MessageCircle,
      'screenshot': ImagePlus,
      'camera': Aperture
    };
    return icons[source];
  };

  const analyzeStyle = async () => {
    const text = getAnalysisText();
    if (!text || text.length < 50) {
      alert('Please provide more text to analyze (at least 50 characters)');
      return;
    }

    setLoading(true);
    setLoadingStep('Analyzing your unique writing style...');
    
    try {
      const res = await fetch('/api/personasync/analyze-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          examples: text,
          sourceType: inputSource,
          groqApiKey: useGroq ? groqApiKey : undefined
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStyleProfile(data.profile);
      setStep(1.5);
    } catch (err: any) {
      console.error('Analyze style error:', err);
      alert(err.message || 'Failed to analyze style');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const processMessage = async () => {
    if (!styleProfile) return;
    
    if (outputType === 'reply' && !inputMessage) {
      alert('Please paste the message you want to reply to');
      return;
    }
    if (outputType === 'notes' && !notesTopic) {
      alert('Please enter a topic for your notes');
      return;
    }

    setLoading(true);
    setLoadingStep(outputType === 'reply' ? 'Drafting your reply...' : 'Generating your notes...');
    
    try {
      const endpoint = outputType === 'reply' ? '/api/personasync/draft-reply' : '/api/personasync/generate-notes';
      const body = outputType === 'reply' 
        ? { styleProfile, inputMessage, tone, questionToAnswer }
        : { styleProfile, topic: notesTopic, tone };
        
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...body,
          groqApiKey: useGroq ? groqApiKey : undefined
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setSummary(data.summary || '');
      setDraft(data.draft || data.notes || '');

      const newEntry: HistoryEntry = {
        id: Date.now().toString(),
        inputMessage: outputType === 'reply' ? inputMessage : notesTopic,
        summary: data.summary || '',
        draft: data.draft || data.notes || '',
        brandName: brandName || 'Default',
        outputType,
        timestamp: new Date().toISOString(),
      };
      setMessageHistory(prev => [newEntry, ...prev]);
      setStep(3);
    } catch (err: any) {
      console.error('Generation error:', err);
      alert(err.message || 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  const copyDraft = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveBrand = () => {
    if (!brandName || !styleProfile) return;

    const newBrand: SavedBrand = {
      id: Date.now().toString(),
      name: brandName,
      profile: styleProfile,
      sourceType: inputSource,
      styleCategory,
      createdAt: new Date().toISOString(),
    };

    setSavedBrands(prev => [...prev, newBrand]);
    setBrandName('');
  };

  const loadBrand = (brand: SavedBrand) => {
    setStyleProfile(brand.profile);
    setInputSource(brand.sourceType);
    setStyleCategory(brand.styleCategory);
    setStep(2);
  };

  const deleteBrand = (id: string) => {
    setSavedBrands(prev => prev.filter(brand => brand.id !== id));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-4 h-4 text-white/50" />
            <span className="text-[13px] text-white/50">Back</span>
          </Link>
          <div className="w-px h-6 bg-neutral-800" />
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-rose-400" />
            <h1 className="text-lg font-semibold tracking-tight">PersonaSync</h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-10 border-b border-neutral-800">
          {[
            { id: 'analyze', label: 'AI Generator', icon: Sparkles },
            { id: 'brands', label: 'My Voices', icon: BookOpen },
            { id: 'connect', label: 'Connect', icon: Link2 },
            { id: 'history', label: 'History', icon: Zap },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === id
                  ? 'border-rose-400 text-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* AI Generator Tab */}
        {activeTab === 'analyze' && (
          <div className="space-y-6">
            {/* Auto Setup Wizard - Only show when no data imported yet */}
            {showAutoSetup && step === 1 && !examples && !uploadedFileText && (
              <div className="bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-rose-500/10 rounded-xl p-6 border border-violet-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Automatic Setup</h3>
                      <p className="text-sm text-neutral-400">
                        {autoSetupStep === 'checking' && 'Detecting available data sources...'}
                        {autoSetupStep === 'found' && `Found ${[
                          detectedSources.imessageAvailable && 'iMessages',
                          detectedSources.googleDriveConnected && 'Google Docs'
                        ].filter(Boolean).join(', ')} to import`}
                        {autoSetupStep === 'importing' && loadingStep}
                        {autoSetupStep === 'done' && 'Import complete! Analyzing your style...'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAutoSetup(false)}
                    className="text-neutral-500 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {autoSetupStep === 'found' && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {isDesktopApp && (
                        <div className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
                          detectedSources.fullDiskAccess 
                            ? 'bg-emerald-500/20 text-emerald-300' 
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          <MessageCircle className="w-4 h-4" />
                          iMessages
                          {detectedSources.fullDiskAccess ? ' (Ready)' : ' (Need permission)'}
                        </div>
                      )}
                      <div className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
                        detectedSources.googleDriveConnected 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : 'bg-neutral-700 text-neutral-400'
                      }`}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Google Drive
                        {detectedSources.googleDriveConnected ? ' (Connected)' : ' (Not connected)'}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {(detectedSources.imessageAvailable || detectedSources.googleDriveConnected) ? (
                        <button
                          onClick={runAutoSetup}
                          className="flex-1 bg-violet-500 hover:bg-violet-600 text-white font-medium py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          Import Everything Automatically
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveTab('connect')}
                          className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-2.5 px-4 rounded-lg text-sm"
                        >
                          Go to Connect Tab
                        </button>
                      )}
                      <button
                        onClick={() => setShowAutoSetup(false)}
                        className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-lg text-sm"
                      >
                        Manual Setup
                      </button>
                    </div>

                    {isDesktopApp && !detectedSources.fullDiskAccess && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                        <p className="text-sm text-amber-400">
                          <strong>Enable Full Disk Access</strong> for automatic iMessage sync:
                          <br />
                          1. Open System Settings → Privacy & Security → Full Disk Access
                          <br />
                          2. Click the + button and add Super Tools
                          <br />
                          3. Restart Super Tools
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {autoSetupStep === 'checking' && (
                  <div className="flex items-center gap-2 text-violet-400">
                    <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Scanning for available data sources...</span>
                  </div>
                )}

                {autoSetupStep === 'importing' && (
                  <div className="flex items-center gap-2 text-violet-400">
                    <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">{loadingStep || 'Importing your data...'}</span>
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Create Your Style Profile */}
            {step === 1 && (
              <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
                <h2 className="text-xl font-semibold mb-2">Step 1: Teach AI Your Voice</h2>
                <p className="text-neutral-400 mb-6">Choose how you want to share your writing style. Different sources work best for different outputs.</p>

                {/* Input Source Selector */}
                <div className="mb-6">
                  <label className="text-sm text-neutral-400 mb-3 block">Choose your writing source</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {([
                      { id: 'paste', label: 'Paste Text', desc: 'Any text you copy', icon: FileText },
                      { id: 'google-doc', label: 'Google Doc', desc: 'Link to your notes doc', icon: Link2, recommended: 'notes' },
                      { id: 'essay', label: 'Essay/File', desc: 'PDF, DOCX, or TXT', icon: GraduationCap, recommended: 'formal' },
                      { id: 'imessage', label: 'iMessage', desc: 'Export from Mac Messages', icon: MessageCircle, recommended: 'casual' },
                      { id: 'screenshot', label: 'Screenshot', desc: 'Upload chat screenshot', icon: ImagePlus, recommended: 'casual' },
                      { id: 'camera', label: 'Camera', desc: 'Take a photo now', icon: Aperture, recommended: 'casual' },
                    ] as { id: InputSource; label: string; desc: string; icon: any; recommended?: string }[]).map(({ id, label, desc, icon: Icon, recommended }) => (
                      <button
                        key={id}
                        onClick={() => {
                          setInputSource(id);
                          if (id === 'camera') setShowCamera(true);
                        }}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          inputSource === id
                            ? 'bg-rose-500/10 border-rose-400/50'
                            : 'bg-neutral-800/50 border-neutral-700 hover:border-neutral-500'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-2 ${inputSource === id ? 'text-rose-400' : 'text-neutral-400'}`} />
                        <div className={`font-medium text-sm ${inputSource === id ? 'text-white' : 'text-neutral-300'}`}>{label}</div>
                        <div className="text-xs text-neutral-500 mt-1">{desc}</div>
                        {recommended && (
                          <div className={`text-xs mt-1.5 ${recommended === 'casual' ? 'text-amber-400' : recommended === 'formal' ? 'text-blue-400' : 'text-emerald-400'}`}>
                            Best for {recommended}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Source-specific inputs */}
                {inputSource === 'google-doc' && (
                  <div className="mb-6">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-blue-300 text-sm font-medium">Perfect for notes mode!</p>
                          <p className="text-blue-400/80 text-xs mt-1">
                            Google Docs with your notes will teach AI your personal note-taking style.
                            Make sure your doc is set to &quot;Anyone with the link can view&quot;
                          </p>
                        </div>
                      </div>
                    </div>
                    <label className="text-sm text-neutral-400 mb-2 block">Google Doc URL</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={googleDocUrl}
                        onChange={(e) => setGoogleDocUrl(e.target.value)}
                        placeholder="https://docs.google.com/document/d/..."
                        className="flex-1 p-3 bg-black border border-neutral-800 text-white rounded-lg focus:border-rose-400/50 focus:outline-none text-sm"
                      />
                      <button
                        onClick={fetchGoogleDoc}
                        disabled={!googleDocUrl || loading}
                        className="bg-rose-500 hover:bg-rose-600 disabled:bg-neutral-800 text-white font-medium py-2 px-4 rounded-lg text-sm"
                      >
                        {loading ? 'Loading...' : 'Load'}
                      </button>
                    </div>
                    {examples && inputSource === 'google-doc' && (
                      <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <p className="text-emerald-400 text-sm">✓ Google Doc loaded ({examples.length.toLocaleString()} chars)</p>
                      </div>
                    )}
                  </div>
                )}

                {inputSource === 'essay' && (
                  <div className="mb-6">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-blue-300 text-sm font-medium">Perfect for formal tone!</p>
                          <p className="text-blue-400/80 text-xs mt-1">
                            Upload academic papers, essays, or formal writing to train formal voice.
                            Supports PDF, DOCX, and TXT files.
                          </p>
                        </div>
                      </div>
                    </div>
                    <label className="text-sm text-neutral-400 mb-2 block">Upload Essay or Document</label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => docFileInputRef.current?.click()}
                        className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-medium py-2 px-4 rounded-lg text-sm"
                      >
                        <Upload className="w-4 h-4" />
                        Choose File
                      </button>
                      <span className="text-neutral-500 text-sm">
                        {uploadedFile ? uploadedFile.name : 'PDF, DOCX, or TXT'}
                      </span>
                    </div>
                    <input
                      ref={docFileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc,.txt,.html,.htm"
                      onChange={(e) => handleFileUpload(e, 'essay')}
                      className="hidden"
                    />
                    {parsingFile && (
                      <div className="mt-3 flex items-center gap-2 text-rose-400">
                        <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">{loadingStep || 'Parsing file...'}</span>
                      </div>
                    )}
                    {uploadedFileText && (
                      <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <p className="text-emerald-400 text-sm">✓ File parsed ({uploadedFileText.length.toLocaleString()} chars)</p>
                      </div>
                    )}
                  </div>
                )}

                {inputSource === 'imessage' && (
                  <div className="mb-6">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-amber-400 mt-0.5" />
                        <div>
                          <p className="text-amber-300 text-sm font-medium">Perfect for casual tone!</p>
                          <p className="text-amber-400/80 text-xs mt-1">
                            {isDesktopApp 
                              ? "Auto-sync your iMessage conversations directly from the Messages app."
                              : "Export your iMessage history from Mac to train casual, conversational voice."}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {isDesktopApp ? (
                      <>
                        <button
                          onClick={async () => {
                            setLoading(true);
                            setLoadingStep('Reading iMessage database...');
                            try {
                              // @ts-ignore - Tauri API
                              const { invoke } = window.__TAURI__?.core || window.__TAURI_INTERNALS__?.core || await import('@tauri-apps/api/core');
                              const conversations = await invoke('read_imessage_database', { limit: 1000 });
                              
                              // Convert conversations to text format
                              let allText = '';
                              for (const conv of conversations as any[]) {
                                allText += `\n--- ${conv.display_name} ---\n`;
                                for (const msg of conv.messages) {
                                  const sender = msg.is_from_me ? 'Me' : msg.sender;
                                  allText += `[${msg.date}] ${sender}: ${msg.text}\n`;
                                }
                              }
                              
                              setUploadedFileText(allText);
                              setExamples(allText.substring(0, 5000));
                              alert(`Synced ${conversations.length} conversations with ${allText.length} characters!`);
                            } catch (err: any) {
                              console.error('iMessage sync error:', err);
                              alert(err?.toString() || 'Failed to sync iMessages. Make sure Full Disk Access is granted in System Settings > Privacy & Security > Full Disk Access.');
                            } finally {
                              setLoading(false);
                              setLoadingStep('');
                            }
                          }}
                          disabled={loading}
                          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-800 text-white font-medium py-3 px-4 rounded-lg text-sm"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              {loadingStep || 'Syncing...'}
                            </>
                          ) : (
                            <>
                              <MessageCircle className="w-4 h-4" />
                              Auto-Sync iMessages
                            </>
                          )}
                        </button>
                        <p className="text-xs text-neutral-500 mt-2 text-center">
                          Requires Full Disk Access in System Settings
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="bg-neutral-800/50 rounded-lg p-4 mb-4">
                          <p className="text-sm text-neutral-400 mb-2 font-medium">How to export iMessages from Mac:</p>
                          <ol className="text-xs text-neutral-500 space-y-1 list-decimal list-inside">
                            <li>Open Messages app on your Mac</li>
                            <li>Find a conversation with lots of your messages</li>
                            <li>File → Print → Save as PDF (or copy-paste text)</li>
                            <li>Upload the PDF or paste the text below</li>
                          </ol>
                        </div>

                        <label className="text-sm text-neutral-400 mb-2 block">Upload iMessage Export</label>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => docFileInputRef.current?.click()}
                            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-medium py-2 px-4 rounded-lg text-sm"
                          >
                            <Upload className="w-4 h-4" />
                            Choose File
                          </button>
                          <span className="text-neutral-500 text-sm">
                            {uploadedFile ? uploadedFile.name : 'PDF, HTML, or TXT export'}
                          </span>
                        </div>
                        <input
                          ref={docFileInputRef}
                          type="file"
                          accept=".pdf,.txt,.html,.htm,.csv"
                          onChange={(e) => handleFileUpload(e, 'imessage')}
                          className="hidden"
                        />
                      </>
                    )}
                    {parsingFile && (
                      <div className="mt-3 flex items-center gap-2 text-rose-400">
                        <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">{loadingStep || 'Parsing messages...'}</span>
                      </div>
                    )}
                    {uploadedFileText && (
                      <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <p className="text-emerald-400 text-sm">✓ Messages loaded ({uploadedFileText.length.toLocaleString()} chars)</p>
                      </div>
                    )}
                  </div>
                )}

                {inputSource === 'screenshot' && (
                  <div className="mb-6">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-amber-400 mt-0.5" />
                        <div>
                          <p className="text-amber-300 text-sm font-medium">Quick casual style capture</p>
                          <p className="text-amber-400/80 text-xs mt-1">
                            Screenshot your iMessage or any chat app. AI will extract the text.
                          </p>
                        </div>
                      </div>
                    </div>
                    <label className="text-sm text-neutral-400 mb-2 block">Upload Screenshot</label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-medium py-2 px-4 rounded-lg text-sm"
                      >
                        <ImagePlus className="w-4 h-4" />
                        Choose Screenshot
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      className="hidden"
                    />
                    {screenshotPreview && (
                      <div className="mt-4">
                        <img src={screenshotPreview} alt="Screenshot" className="w-full h-48 object-cover rounded-lg" />
                        {parsingImage && (
                          <div className="flex items-center gap-2 text-rose-400 mt-2">
                            <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm">Reading text from screenshot...</span>
                          </div>
                        )}
                        {screenshotNotice && !parsingImage && (
                          <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <p className="text-amber-400 text-sm">{screenshotNotice}</p>
                          </div>
                        )}
                        {examples && !screenshotNotice && (
                          <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                            <p className="text-emerald-400 text-sm">✓ Text extracted ({examples.length.toLocaleString()} chars)</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {inputSource === 'camera' && (
                  <div className="mb-6">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-amber-400 mt-0.5" />
                        <div>
                          <p className="text-amber-300 text-sm font-medium">Quick capture</p>
                          <p className="text-amber-400/80 text-xs mt-1">
                            Take a photo of any text to extract and analyze your style.
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowCamera(true)}
                      className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 px-4 rounded-lg text-sm"
                    >
                      <Aperture className="w-4 h-4" />
                      Open Camera
                    </button>
                    {examples && inputSource === 'camera' && (
                      <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <p className="text-emerald-400 text-sm">✓ Photo captured and text extracted</p>
                      </div>
                    )}
                  </div>
                )}

                {inputSource === 'paste' && (
                  <div className="mb-6">
                    <label className="text-sm text-neutral-400 mb-2 block">Paste your writing samples</label>
                    <textarea
                      value={examples}
                      onChange={(e) => setExamples(e.target.value)}
                      placeholder="Example 1: Hey! Thanks for reaching out...

Example 2: Just wanted to follow up on...

Example 3: lol that's hilarious..."
                      className="w-full h-48 p-4 bg-black border border-neutral-800 text-white rounded-lg focus:border-rose-400/50 focus:outline-none resize-none"
                    />
                    {examples.length > 0 && examples.length < 200 && (
                      <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                        <p className="text-amber-400 text-sm font-medium">⚠️ Low text input</p>
                        <p className="text-amber-300 text-sm mt-1">
                          For best results, provide at least 200+ characters. Paste longer samples or try uploading a file.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={analyzeStyle}
                  disabled={!getAnalysisText() || getAnalysisText().length < 50 || loading}
                  className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? (loadingStep || 'Analyzing...') : 'Create Style Profile'}
                </button>
              </div>
            )}

            {/* Step 1.5: Style Category Selection */}
            {step === 1.5 && (
              <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
                <h2 className="text-xl font-semibold mb-2">What style is this?</h2>
                <p className="text-neutral-400 mb-6">Categorize this voice so AI knows when to use it.</p>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {([
                    { id: 'formal', label: 'Formal', desc: 'Essays, work emails, academic', icon: GraduationCap, color: 'blue' },
                    { id: 'casual', label: 'Casual', desc: 'Texts, chats, friendly', icon: MessageCircle, color: 'amber' },
                    { id: 'notes', label: 'Notes', desc: 'Study notes, documentation', icon: StickyNote, color: 'emerald' },
                  ] as { id: StyleCategory; label: string; desc: string; icon: any; color: string }[]).map(({ id, label, desc, icon: Icon, color }) => (
                    <button
                      key={id}
                      onClick={() => setStyleCategory(id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        styleCategory === id
                          ? color === 'blue' ? 'bg-blue-500/10 border-blue-400/50' :
                            color === 'amber' ? 'bg-amber-500/10 border-amber-400/50' :
                            'bg-emerald-500/10 border-emerald-400/50'
                          : 'bg-neutral-800/50 border-neutral-700 hover:border-neutral-500'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${
                        styleCategory === id
                          ? color === 'blue' ? 'text-blue-400' :
                            color === 'amber' ? 'text-amber-400' :
                            'text-emerald-400'
                          : 'text-neutral-400'
                      }`} />
                      <div className={`font-medium text-sm ${styleCategory === id ? 'text-white' : 'text-neutral-300'}`}>{label}</div>
                      <div className="text-xs text-neutral-500 mt-1">{desc}</div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Configure Output */}
            {step === 2 && styleProfile && (
              <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
                {/* Style Profile Card */}
                <div className="mb-6 p-4 bg-rose-500/10 rounded-lg border border-rose-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-rose-400">Your Style Profile</h3>
                    <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-1 rounded">
                      {getSourceLabel(inputSource)}
                    </span>
                  </div>
                  <p className="text-sm text-rose-300 mb-3">{styleProfile?.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {styleProfile?.characteristics?.slice(0, 6).map((c, i) => (
                      <span key={i} className="text-xs bg-rose-500/20 text-rose-300 px-2 py-1 rounded">{c}</span>
                    ))}
                  </div>
                </div>

                <h2 className="text-xl font-semibold mb-4">Step 2: What do you need?</h2>

                {/* Output Type Selector */}
                <div className="mb-6">
                  <label className="text-sm text-neutral-400 mb-2 block">Output Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOutputType('reply')}
                      className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                        outputType === 'reply'
                          ? 'bg-rose-500/20 border-rose-400/60 text-rose-300'
                          : 'bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:border-neutral-500'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 mx-auto mb-1" />
                      Reply to Message
                    </button>
                    <button
                      onClick={() => setOutputType('notes')}
                      className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                        outputType === 'notes'
                          ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300'
                          : 'bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:border-neutral-500'
                      }`}
                    >
                      <StickyNote className="w-4 h-4 mx-auto mb-1" />
                      Generate Notes
                    </button>
                  </div>
                </div>

                {/* Tone Selector */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-neutral-400">Tone</label>
                    {inputSource === 'google-doc' && (
                      <span className="text-xs text-blue-400">Recommended for notes</span>
                    )}
                    {inputSource === 'imessage' && (
                      <span className="text-xs text-amber-400">Recommended for casual</span>
                    )}
                    {inputSource === 'essay' && (
                      <span className="text-xs text-blue-400">Recommended for formal</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {([
                      { id: 'casual', label: 'Casual', desc: 'Relaxed & chatty', color: 'amber' },
                      { id: 'match', label: 'Match My Style', desc: 'Exact voice match', color: 'rose' },
                      { id: 'formal', label: 'Formal', desc: 'Professional', color: 'blue' },
                    ] as { id: ToneMode; label: string; desc: string; color: string }[]).map(({ id, label, desc }) => (
                      <button
                        key={id}
                        onClick={() => setTone(id)}
                        className={`flex-1 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${
                          tone === id
                            ? tone === 'casual' ? 'bg-amber-500/20 border-amber-400/60 text-amber-300' :
                              tone === 'formal' ? 'bg-blue-500/20 border-blue-400/60 text-blue-300' :
                              'bg-rose-500/20 border-rose-400/60 text-rose-300'
                            : 'bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:border-neutral-500'
                        }`}
                      >
                        <div>{label}</div>
                        <div className="text-xs mt-0.5 font-normal opacity-70">{desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reply-specific inputs */}
                {outputType === 'reply' && (
                  <>
                    <label className="text-sm text-neutral-400 mb-2 block">Message to reply to</label>
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Paste the email, text, or message you need to reply to..."
                      className="w-full h-32 p-4 bg-black border border-neutral-800 text-white rounded-lg focus:border-rose-400/50 focus:outline-none resize-none mb-4"
                    />

                    <label className="text-sm text-neutral-400 mb-2 block">
                      What do you want to say? <span className="text-neutral-600">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={questionToAnswer}
                      onChange={(e) => setQuestionToAnswer(e.target.value)}
                      placeholder="e.g. Tell them I'm free Thursday, decline politely, ask about the budget..."
                      className="w-full p-3 bg-black border border-neutral-800 text-white rounded-lg focus:border-rose-400/50 focus:outline-none mb-6 text-sm"
                    />
                  </>
                )}

                {/* Notes-specific inputs */}
                {outputType === 'notes' && (
                  <>
                    <label className="text-sm text-neutral-400 mb-2 block">What are you taking notes on?</label>
                    <input
                      type="text"
                      value={notesTopic}
                      onChange={(e) => setNotesTopic(e.target.value)}
                      placeholder="e.g. Team standup, Lecture on neural networks, Book: Thinking Fast and Slow..."
                      className="w-full p-3 bg-black border border-neutral-800 text-white rounded-lg focus:border-emerald-400/50 focus:outline-none mb-4 text-sm"
                    />
                    
                    <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <p className="text-emerald-400 text-sm">
                        <strong>Notes mode</strong> generates study notes, meeting notes, or any documentation in your personal note-taking style. 
                        Great with Google Docs that contain your existing notes!
                      </p>
                    </div>
                  </>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={processMessage}
                    disabled={loading || (outputType === 'reply' ? !inputMessage : !notesTopic)}
                    className={`flex-1 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      outputType === 'notes'
                        ? 'bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white'
                        : 'bg-rose-500 hover:bg-rose-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white'
                    }`}
                  >
                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {loading ? 'Generating...' : outputType === 'notes' ? 'Generate Notes' : 'Generate Reply'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Results */}
            {step === 3 && (
              <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Results</h2>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      tone === 'casual' ? 'bg-amber-500/15 text-amber-400' :
                      tone === 'formal' ? 'bg-blue-500/15 text-blue-400' :
                      'bg-rose-500/15 text-rose-400'
                    }`}>
                      {tone === 'casual' ? 'Casual' : tone === 'formal' ? 'Formal' : 'My Style'}
                    </span>
                    {outputType === 'notes' && (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-500/15 text-emerald-400">
                        Notes
                      </span>
                    )}
                  </div>
                </div>

                {summary && (
                  <div className="mb-6 p-4 bg-neutral-800 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm text-neutral-400">
                      <Sparkles className="w-4 h-4" />
                      TL;DR Summary
                    </h3>
                    <div className="text-neutral-300 text-sm whitespace-pre-line">{summary}</div>
                  </div>
                )}

                <div className={`mb-6 p-4 rounded-lg border ${
                  outputType === 'notes' 
                    ? 'bg-emerald-500/10 border-emerald-500/20' 
                    : 'bg-rose-500/10 border-rose-500/20'
                }`}>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    {outputType === 'notes' ? (
                      <><StickyNote className="w-4 h-4 text-emerald-400" /> Your Notes</>
                    ) : (
                      <><MessageSquare className="w-4 h-4 text-rose-400" /> Drafted Reply</>
                    )}
                  </h3>
                  <p className={`whitespace-pre-wrap ${outputType === 'notes' ? 'text-emerald-100' : 'text-rose-100'}`}>
                    {draft}
                  </p>
                </div>

                {/* Feedback Section */}
                <div className="mb-6 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
                  <p className="text-sm text-neutral-400 mb-3">How did we do? Your feedback helps AI improve.</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const entryId = messageHistory[0]?.id;
                        if (entryId) {
                          setFeedbackGiven(prev => ({ ...prev, [entryId]: 'positive' }));
                        }
                      }}
                      disabled={messageHistory.length === 0 || feedbackGiven[messageHistory[0]?.id] === 'negative'}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        feedbackGiven[messageHistory[0]?.id] === 'positive'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/50'
                          : 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600 disabled:opacity-50'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      Good response
                    </button>
                    <button
                      onClick={() => {
                        const entryId = messageHistory[0]?.id;
                        if (entryId) {
                          setFeedbackGiven(prev => ({ ...prev, [entryId]: 'negative' }));
                        }
                      }}
                      disabled={messageHistory.length === 0 || feedbackGiven[messageHistory[0]?.id] === 'positive'}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        feedbackGiven[messageHistory[0]?.id] === 'negative'
                          ? 'bg-red-500/20 text-red-400 border border-red-400/50'
                          : 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600 disabled:opacity-50'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                      </svg>
                      Needs work
                    </button>
                  </div>
                  {feedbackGiven[messageHistory[0]?.id] && (
                    <p className="text-xs text-neutral-500 mt-2">
                      {feedbackGiven[messageHistory[0]?.id] === 'positive' 
                        ? 'Thanks! AI will learn from this style.' 
                        : 'Noted. AI will adjust for next time.'}
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={copyDraft}
                    className={`flex-1 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      outputType === 'notes'
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        : 'bg-rose-500 hover:bg-rose-600 text-white'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* My Voices Tab */}
        {activeTab === 'brands' && (
          <div className="space-y-6">
            <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
              <h3 className="text-lg font-semibold mb-4">Save Current Style</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Give this voice a name (e.g. 'Work Formal', 'Casual Texts')"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="flex-1 bg-black border border-neutral-800 text-white rounded-lg px-3 py-2 text-sm"
                />
                <button
                  onClick={saveBrand}
                  disabled={!brandName || !styleProfile}
                  className="bg-rose-500 hover:bg-rose-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-medium py-2 px-4 rounded-lg text-sm"
                >
                  Save Voice
                </button>
              </div>
              {!styleProfile && (
                <p className="text-xs text-neutral-600 mt-2">Create a style profile in the AI Generator tab first</p>
              )}
            </div>

            {savedBrands.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-500">No saved voices yet</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {savedBrands.map(brand => {
                  const SourceIcon = getSourceIcon(brand.sourceType);
                  const categoryColors = {
                    formal: 'bg-blue-500/20 text-blue-300',
                    casual: 'bg-amber-500/20 text-amber-300',
                    notes: 'bg-emerald-500/20 text-emerald-300'
                  };
                  return (
                    <div key={brand.id} className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h4 className="font-semibold text-lg">{brand.name}</h4>
                            <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded flex items-center gap-1">
                              <SourceIcon className="w-3 h-3" />
                              {getSourceLabel(brand.sourceType)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded capitalize ${categoryColors[brand.styleCategory]}`}>
                              {brand.styleCategory}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-400 mb-3">{brand.profile.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {brand.profile.characteristics?.slice(0, 6).map((char, idx) => (
                              <span key={idx} className="bg-neutral-800 px-2 py-1 rounded text-xs">{char}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => loadBrand(brand)}
                            className="text-rose-400 hover:text-rose-300 text-sm font-medium px-3 py-1"
                          >
                            Use
                          </button>
                          <button
                            onClick={() => deleteBrand(brand.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Connect Tab */}
        {activeTab === 'connect' && (
          <div className="space-y-6">
            {/* Google Drive Connection */}
            <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Google Drive</h3>
                    <p className="text-sm text-neutral-400">Connect to import Docs, Sheets, and more</p>
                  </div>
                </div>
                {googleConnected ? (
                  <button
                    onClick={disconnectGoogle}
                    className="text-sm text-red-400 hover:text-red-300 px-3 py-1"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={connectGoogle}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg text-sm"
                  >
                    Connect
                  </button>
                )}
              </div>

              {googleConnected && googleUser && (
                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    {googleUser.picture && (
                      <img src={googleUser.picture} alt="" className="w-8 h-8 rounded-full" />
                    )}
                    <div>
                      <p className="text-sm text-blue-300 font-medium">{googleUser.name}</p>
                      <p className="text-xs text-blue-400/70">{googleUser.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {googleConnected && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-neutral-300">Your Google Docs</h4>
                    <button
                      onClick={fetchGoogleFiles}
                      disabled={googleLoading}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      {googleLoading ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>
                  
                  {googleFiles.length === 0 ? (
                    <p className="text-sm text-neutral-500">No documents found</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {googleFiles.map((file: any) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                            </svg>
                            <div>
                              <p className="text-sm text-neutral-300 truncate max-w-[200px]">{file.name}</p>
                              <p className="text-xs text-neutral-500">
                                {new Date(file.modifiedTime).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => importGoogleDoc(file.id, file.name)}
                            className="text-xs bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 px-3 py-1.5 rounded transition-colors"
                          >
                            Import
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Messages / iMessage Section */}
            <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Messages</h3>
                  <p className="text-sm text-neutral-400">
                    {isDesktopApp ? 'iMessage connected via desktop app' : 'Import your iMessage conversations'}
                  </p>
                </div>
              </div>

              {!isDesktopApp ? (
                <>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
                    <p className="text-sm text-amber-300 font-medium mb-2">Web Version Limitation</p>
                    <p className="text-sm text-amber-400/80">
                      Due to Apple&apos;s restrictions, web apps cannot directly access iMessage. 
                      Use the manual export option below or download the PersonaSync Mac app for automatic syncing.
                    </p>
                  </div>

                  <div className="bg-neutral-800/50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-neutral-400 mb-3 font-medium">Manual Export Instructions:</p>
                    <ol className="text-sm text-neutral-500 space-y-2 list-decimal list-inside">
                      <li>Open Messages app on your Mac</li>
                      <li>Select a conversation</li>
                      <li>File → Print → Save as PDF</li>
                      <li>Upload the PDF in the AI Generator tab</li>
                    </ol>
                  </div>

                  <a
                    href="https://github.com/eXclipsea/QuickReceipt/releases"
                    className="inline-flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                    Download Super Tools for automatic sync
                  </a>
                </>
              ) : (
                <>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 mb-4">
                    <p className="text-sm text-emerald-300 font-medium mb-2">Desktop App Active</p>
                    <p className="text-sm text-emerald-400/80">
                      You&apos;re using the Super Tools desktop app. Full disk access is available for automatic message syncing.
                    </p>
                  </div>
                  <div className="bg-neutral-800/50 rounded-lg p-4">
                    <p className="text-sm text-neutral-400">
                      Go to AI Generator tab and select &quot;iMessage&quot; to sync your messages automatically.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Groq API Key Section */}
            <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Groq API (Optional)</h3>
                  <p className="text-sm text-neutral-400">Use your own API key for faster, cheaper AI</p>
                </div>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-4">
                <p className="text-sm text-orange-300 font-medium mb-2">Student-friendly pricing!</p>
                <p className="text-sm text-orange-400/80">
                  Groq offers free credits and much cheaper rates than OpenAI. 
                  Get your API key at <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-orange-300">console.groq.com</a>
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-neutral-400">Use Groq API</label>
                  <button
                    onClick={() => {
                      if (useGroq) {
                        saveGroqKey('');
                      }
                      setUseGroq(!useGroq);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      useGroq ? 'bg-orange-500' : 'bg-neutral-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useGroq ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {useGroq && (
                  <div className="space-y-2">
                    <input
                      type="password"
                      value={groqApiKey}
                      onChange={(e) => setGroqApiKey(e.target.value)}
                      placeholder="gsk_..."
                      className="w-full bg-black border border-neutral-800 text-white rounded-lg px-3 py-2 text-sm focus:border-orange-400/50 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveGroqKey(groqApiKey)}
                        disabled={!groqApiKey.startsWith('gsk_')}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-medium py-2 px-4 rounded-lg text-sm"
                      >
                        Save Key
                      </button>
                      <button
                        onClick={() => { saveGroqKey(''); setUseGroq(false); }}
                        className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-lg text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    {!groqApiKey.startsWith('gsk_') && groqApiKey && (
                      <p className="text-xs text-red-400">Key should start with "gsk_"</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Batch Import Section - GhostReply Style */}
            <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Batch Import</h3>
                  <p className="text-sm text-neutral-400">Import all your messages at once</p>
                </div>
              </div>

              <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-4 mb-4">
                <p className="text-sm text-violet-300 font-medium mb-2">GhostReply-style ingestion</p>
                <p className="text-sm text-violet-400/80">
                  Export your message history as TXT, PDF, or HTML and upload here. 
                  AI will analyze your writing patterns from all messages combined.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => docFileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 font-medium py-3 px-4 rounded-lg text-sm border border-violet-500/30 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload Message Archive
                </button>
                <p className="text-xs text-neutral-500 text-center">
                  Supports: iMessage exports, WhatsApp exports, email archives, chat logs
                </p>
              </div>
            </div>

            {/* Coming Soon Section */}
            <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800 opacity-60">
              <h3 className="font-semibold text-white mb-4">More Connections</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-neutral-700 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>
                      </svg>
                    </div>
                    <span className="text-sm text-neutral-400">Gmail</span>
                  </div>
                  <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-1 rounded">Coming Soon</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-neutral-700 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                      </svg>
                    </div>
                    <span className="text-sm text-neutral-400">Notion</span>
                  </div>
                  <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-1 rounded">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {messageHistory.length === 0 ? (
              <div className="text-center py-12">
                <Zap className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-500">No history yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messageHistory.map(entry => (
                  <div key={entry.id} className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{entry.brandName}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          entry.outputType === 'notes' 
                            ? 'bg-emerald-500/20 text-emerald-300' 
                            : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {entry.outputType === 'notes' ? 'Notes' : 'Reply'}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-500">{new Date(entry.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-neutral-400 mb-3 line-clamp-2">{entry.inputMessage}</p>
                    <p className={`text-sm whitespace-pre-wrap ${
                      entry.outputType === 'notes' ? 'text-emerald-100' : 'text-rose-100'
                    }`}>{entry.draft}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onCancel={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
