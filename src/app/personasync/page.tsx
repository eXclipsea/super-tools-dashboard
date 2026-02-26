'use client';

import { useState, useRef } from 'react';
import { User, MessageSquare, Sparkles, Copy, Check, BookOpen, Zap, ImagePlus, X, Trash2, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface StyleProfile {
  description: string;
  characteristics: string[];
}

interface SavedBrand {
  id: string;
  name: string;
  profile: StyleProfile;
  createdAt: string;
}

interface HistoryEntry {
  id: string;
  inputMessage: string;
  summary: string;
  draft: string;
  brandName: string;
  timestamp: string;
}

export default function PersonaSync() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'draft' | 'brands' | 'history'>('analyze');
  const [showBanner, setShowBanner] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);
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
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [parsingImage, setParsingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingImage(true);
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
        if (data.text) setExamples(data.text);
      } catch (err) {
        console.error('Screenshot parse error:', err);
      } finally {
        setParsingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const analyzeStyle = async () => {
    if (!examples) return;

    setLoading(true);
    try {
      const res = await fetch('/api/personasync/analyze-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examples }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStyleProfile(data.profile);
      setStep(2);
    } catch (err) {
      console.error('Analyze style error:', err);
    } finally {
      setLoading(false);
    }
  };

  const processMessage = async () => {
    if (!inputMessage || !styleProfile) return;

    setLoading(true);
    try {
      const res = await fetch('/api/personasync/draft-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ styleProfile, inputMessage }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSummary(data.summary || '');
      setDraft(data.draft || '');

      const newEntry: HistoryEntry = {
        id: Date.now().toString(),
        inputMessage,
        summary: data.summary || '',
        draft: data.draft || '',
        brandName: brandName || 'Default',
        timestamp: new Date().toISOString(),
      };
      setMessageHistory(prev => [newEntry, ...prev]);
      setStep(3);
    } catch (err) {
      console.error('Draft reply error:', err);
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
      createdAt: new Date().toISOString(),
    };

    setSavedBrands(prev => [...prev, newBrand]);
    setBrandName('');
  };

  const deleteBrand = (id: string) => {
    setSavedBrands(prev => prev.filter(brand => brand.id !== id));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Download Popup */}
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-rose-500/10 backdrop-blur-xl border-b border-rose-400/20">
          <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
            <a
              href="https://github.com/eXclipsea/persona-drafter/releases/download/v0.1.0/PersonaSync_0.1.0_aarch64.dmg"
              className="flex items-center gap-2 text-[13px] text-white/80 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-rose-400" />
              <span>Get <strong>PersonaSync</strong> for Mac</span>
              <span className="text-rose-400 font-medium ml-1">Download &rarr;</span>
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
        <div className="mb-10">
          <Link href="/" className="flex items-center gap-3 mb-2 hover:opacity-80 transition-opacity inline-block">
            <ArrowLeft className="w-4 h-4 text-white/50" />
            <span className="text-[13px] text-white/50">Back to Super Tools</span>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <User className="w-6 h-6 text-rose-400" />
            <h1 className="text-2xl font-semibold tracking-tight">PersonaSync</h1>
          </div>
          <p className="text-neutral-500">AI writing style analyzer & message drafter</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-10 border-b border-neutral-800">
          {[
            { id: 'analyze', label: 'AI Generator', icon: Sparkles },
            { id: 'draft', label: 'Draft Reply', icon: MessageSquare },
            { id: 'brands', label: 'My Brands', icon: BookOpen },
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
            {/* Step 1: Create Your Style Profile */}
            {step === 1 && (
              <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
                <h2 className="text-xl font-semibold mb-4">Step 1: Create Your Style Profile</h2>
                <p className="text-neutral-400 mb-6">Paste 5 examples of your past emails or texts, or upload a screenshot. AI will analyze your writing style.</p>

                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-medium py-2 px-4 rounded-lg text-sm"
                    >
                      <ImagePlus className="w-4 h-4" />
                      Upload Screenshot
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      className="hidden"
                    />
                    <span className="text-neutral-500 text-sm">or paste examples below</span>
                  </div>

                  {screenshotPreview && (
                    <div className="mb-4">
                      <img src={screenshotPreview} alt="Screenshot" className="w-full h-48 object-cover rounded-lg" />
                      {parsingImage && (
                        <div className="flex items-center gap-2 text-rose-400 mt-2">
                          <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm">Parsing text from image...</span>
                        </div>
                      )}
                    </div>
                  )}

                  <textarea
                    value={examples}
                    onChange={(e) => setExamples(e.target.value)}
                    placeholder="Example 1: Hey! Thanks for reaching out...

Example 2: Just wanted to follow up on...

Example 3: lol that's hilarious..."
                    className="w-full h-64 p-4 bg-black border border-neutral-800 text-white rounded-lg focus:border-rose-400/50 focus:outline-none resize-none"
                  />
                </div>

                <button
                  onClick={analyzeStyle}
                  disabled={!examples || loading}
                  className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? 'Analyzing...' : 'Create Style Profile'}
                </button>
              </div>
            )}

            {/* Step 2: Input Message */}
            {step === 2 && (
              <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
                <div className="mb-6 p-4 bg-rose-500/10 rounded-lg border border-rose-500/20">
                  <h3 className="font-semibold text-rose-400 mb-2">Your Style Profile</h3>
                  <p className="text-sm text-rose-300 mb-3">{styleProfile?.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {styleProfile?.characteristics.map((c, i) => (
                      <span key={i} className="text-xs bg-rose-500/20 text-rose-300 px-2 py-1 rounded">{c}</span>
                    ))}
                  </div>
                </div>

                <h2 className="text-xl font-semibold mb-4">Step 2: Paste Message to Reply To</h2>
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Paste the long message you need to reply to..."
                  className="w-full h-40 p-4 bg-black border border-neutral-800 text-white rounded-lg focus:border-rose-400/50 focus:outline-none resize-none mb-6"
                />
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={processMessage}
                    disabled={!inputMessage || loading}
                    className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {loading ? 'Generating...' : 'Generate Reply'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Results */}
            {step === 3 && (
              <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
                <h2 className="text-xl font-semibold mb-6">Results</h2>

                <div className="mb-6 p-4 bg-neutral-800 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-400" />
                    TL;DR Summary
                  </h3>
                  <div className="text-neutral-300 text-sm whitespace-pre-line">{summary}</div>
                </div>

                <div className="mb-6 p-4 bg-rose-500/10 rounded-lg border border-rose-500/20">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-rose-400" />
                    Drafted Reply
                  </h3>
                  <p className="text-rose-100 whitespace-pre-wrap">{draft}</p>
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
                    className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Draft Reply Tab */}
        {activeTab === 'draft' && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-500">Complete the AI Generator workflow to access draft replies</p>
          </div>
        )}

        {/* My Brands Tab */}
        {activeTab === 'brands' && (
          <div className="space-y-6">
            <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
              <h3 className="text-lg font-semibold mb-4">Save Current Style</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Brand name"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="flex-1 bg-black border border-neutral-800 text-white rounded-lg px-3 py-2 text-sm"
                />
                <button
                  onClick={saveBrand}
                  disabled={!brandName || !styleProfile}
                  className="bg-rose-500 hover:bg-rose-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-medium py-2 px-4 rounded-lg text-sm"
                >
                  Save Brand
                </button>
              </div>
              {!styleProfile && (
                <p className="text-xs text-neutral-600 mt-2">Create a style profile first in the AI Generator tab</p>
              )}
            </div>

            {savedBrands.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-500">No saved brands yet</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {savedBrands.map(brand => (
                  <div key={brand.id} className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-lg mb-2">{brand.name}</h4>
                        <p className="text-sm text-neutral-400 mb-3">{brand.profile.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {brand.profile.characteristics.map((char, idx) => (
                            <span key={idx} className="bg-neutral-800 px-2 py-1 rounded text-xs">{char}</span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteBrand(brand.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {messageHistory.length === 0 ? (
              <div className="text-center py-12">
                <Zap className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-500">No message history yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messageHistory.map(entry => (
                  <div key={entry.id} className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{entry.brandName}</h4>
                      <span className="text-xs text-neutral-500">{new Date(entry.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-neutral-400 mb-3 line-clamp-2">{entry.inputMessage}</p>
                    <p className="text-sm text-rose-100 whitespace-pre-wrap">{entry.draft}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
