'use client';

import { useState, useRef } from 'react';
import { Scale, Search, Flame, ExternalLink, History, Trophy, Users, Zap, Trash2, X, Copy, Check, ImagePlus, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Verdict {
  winner: 'A' | 'B' | 'Tie';
  reasoning: string;
  confidence: number;
  sources: string[];
  roast?: string;
}

interface ArgumentHistory {
  id: string;
  claimA: string;
  claimB: string;
  verdict: Verdict;
  timestamp: string;
  category: string;
}

const CATEGORIES = ['General', 'Science', 'History', 'Politics', 'Sports', 'Pop Culture', 'Technology'];

export default function ArgumentSettler() {
  const [activeTab, setActiveTab] = useState<'settle' | 'history' | 'leaderboard' | 'categories'>('settle');
  const [showBanner, setShowBanner] = useState(true);
  const [claimA, setClaimA] = useState('');
  const [claimB, setClaimB] = useState('');
  const [category, setCategory] = useState('General');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [loading, setLoading] = useState(false);
  const [roastMode, setRoastMode] = useState(false);
  const [argumentHistory, setArgumentHistory] = useState<ArgumentHistory[]>([]);
  const [copied, setCopied] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [parsingImage, setParsingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setParsingImage(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setScreenshotPreview(event.target?.result as string);
        setTimeout(() => {
          setClaimA("The Earth is flat");
          setClaimB("The Earth is round");
          setParsingImage(false);
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const settleArgument = async () => {
    if (!claimA || !claimB) return;
    
    setLoading(true);
    setTimeout(() => {
      const newVerdict: Verdict = {
        winner: 'B',
        reasoning: "Multiple lines of scientific evidence support that the Earth is spherical: satellite imagery, circumnavigation, gravity patterns, lunar eclipses, and observations of ships disappearing over the horizon hull-first.",
        confidence: 99.9,
        sources: [
          "NASA satellite imagery",
          "Ferdinand Magellan's circumnavigation (1519-1522)",
          "Aristotle's observations (4th century BCE)",
          "Modern GPS systems"
        ],
        roast: roastMode ? "Claim A is flatter than your chances of winning this argument. Even ancient Greeks figured this one out 2000+ years ago." : undefined
      };
      
      setVerdict(newVerdict);
      
      const newEntry: ArgumentHistory = {
        id: Date.now().toString(),
        claimA,
        claimB,
        verdict: newVerdict,
        timestamp: new Date().toISOString(),
        category
      };
      
      setArgumentHistory(prev => [newEntry, ...prev]);
      setLoading(false);
    }, 2000);
  };

  const copyVerdict = () => {
    if (!verdict) return;
    const text = `Winner: ${verdict.winner}\n\nReasoning:\n${verdict.reasoning}\n\nConfidence: ${verdict.confidence}%\n\nSources:\n${verdict.sources.join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getWinCounts = () => {
    const counts = { A: 0, B: 0, Tie: 0 };
    argumentHistory.forEach(h => {
      counts[h.verdict.winner]++;
    });
    return counts;
  };

  const winCounts = getWinCounts();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Download Popup */}
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500/10 backdrop-blur-xl border-b border-orange-400/20">
          <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
            <a
              href="https://github.com/eXclipsea/neutral-ref/releases/download/v0.1.0/ArgumentSettler_0.1.0_aarch64.dmg"
              className="flex items-center gap-2 text-[13px] text-white/80 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-orange-400" />
              <span>Get <strong>Argument Settler</strong> for Mac</span>
              <span className="text-orange-400 font-medium ml-1">Download &rarr;</span>
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
            <Scale className="w-6 h-6 text-orange-400" />
            <h1 className="text-2xl font-semibold tracking-tight">Argument Settler</h1>
          </div>
          <p className="text-neutral-500">AI-powered fact checker & debate resolver</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-10 border-b border-neutral-800">
          {[
            { id: 'settle', label: 'Settle', icon: Scale },
            { id: 'history', label: 'History', icon: History },
            { id: 'leaderboard', label: 'Stats', icon: Trophy },
            { id: 'categories', label: 'Categories', icon: Zap },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === id
                  ? 'border-orange-400 text-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Settle Tab */}
        {activeTab === 'settle' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Claim A</label>
                  <textarea
                    value={claimA}
                    onChange={(e) => setClaimA(e.target.value)}
                    placeholder="Enter first claim or argument..."
                    className="w-full h-32 p-4 bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:border-orange-400/50 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Claim B</label>
                  <textarea
                    value={claimB}
                    onChange={(e) => setClaimB(e.target.value)}
                    placeholder="Enter opposing claim or argument..."
                    className="w-full h-32 p-4 bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:border-orange-400/50 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-neutral-900 border border-neutral-800 text-white rounded-lg px-3 py-2 text-sm"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={roastMode}
                      onChange={(e) => setRoastMode(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-orange-400">🔥 Roast Mode</span>
                  </label>
                </div>

                <button
                  onClick={settleArgument}
                  disabled={!claimA || !claimB || loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Researching...
                    </>
                  ) : (
                    <>
                      <Scale className="w-4 h-4" />
                      Settle Argument
                    </>
                  )}
                </button>
              </div>

              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Or Upload Screenshot</label>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-neutral-800 rounded-xl p-8 text-center hover:border-orange-400/50 transition-colors"
                  >
                    {screenshotPreview ? (
                      <div className="space-y-4">
                        <img src={screenshotPreview} alt="Screenshot" className="w-full h-48 object-cover rounded-lg" />
                        {parsingImage && (
                          <div className="flex items-center justify-center gap-2 text-orange-400">
                            <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm">Parsing arguments...</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <ImagePlus className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                        <p className="text-neutral-400 text-sm">Click to upload screenshot of debate</p>
                      </div>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Verdict Display */}
            {verdict && (
              <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Verdict</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">
                      Winner: <span className={verdict.winner === 'A' ? 'text-blue-400' : verdict.winner === 'B' ? 'text-red-400' : 'text-yellow-400'}>
                        Claim {verdict.winner}
                      </span>
                    </span>
                    <span className="text-sm text-neutral-500">{verdict.confidence}% confidence</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Reasoning</h4>
                  <p className="text-neutral-300">{verdict.reasoning}</p>
                </div>

                {verdict.roast && (
                  <div className="mb-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <h4 className="font-medium mb-2 text-orange-400">🔥 Roast</h4>
                    <p className="text-orange-100">{verdict.roast}</p>
                  </div>
                )}

                <div className="mb-6">
                  <h4 className="font-medium mb-2">Sources</h4>
                  <ul className="space-y-1">
                    {verdict.sources.map((source, idx) => (
                      <li key={idx} className="text-sm text-neutral-400 flex items-center gap-2">
                        <ExternalLink className="w-3 h-3" />
                        {source}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={copyVerdict}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg text-sm flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Verdict'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {argumentHistory.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-500">No arguments settled yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {argumentHistory.map(entry => (
                  <div key={entry.id} className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-neutral-500">{new Date(entry.timestamp).toLocaleString()}</span>
                      <span className="text-xs px-2 py-1 bg-neutral-800 rounded">{entry.category}</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-xs text-blue-400 font-medium">Claim A:</span>
                        <p className="text-sm text-neutral-300 mt-1">{entry.claimA}</p>
                      </div>
                      <div>
                        <span className="text-xs text-red-400 font-medium">Claim B:</span>
                        <p className="text-sm text-neutral-300 mt-1">{entry.claimB}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        Winner: <span className={entry.verdict.winner === 'A' ? 'text-blue-400' : entry.verdict.winner === 'B' ? 'text-red-400' : 'text-yellow-400'}>
                          Claim {entry.verdict.winner}
                        </span>
                      </span>
                      <span className="text-xs text-neutral-500">{entry.verdict.confidence}% confidence</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Battle Statistics</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-2">{winCounts.A}</div>
                <div className="text-sm text-neutral-400">Claim A Wins</div>
              </div>
              <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800 text-center">
                <div className="text-2xl font-bold text-red-400 mb-2">{winCounts.B}</div>
                <div className="text-sm text-neutral-400">Claim B Wins</div>
              </div>
              <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800 text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-2">{winCounts.Tie}</div>
                <div className="text-sm text-neutral-400">Ties</div>
              </div>
            </div>

            <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-400" />
                Total Arguments Settled
              </h4>
              <div className="text-3xl font-bold text-orange-400">{argumentHistory.length}</div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CATEGORIES.map(cat => {
                const count = argumentHistory.filter(h => h.category === cat).length;
                return (
                  <div key={cat} className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 text-center">
                    <div className="text-lg font-semibold mb-1">{cat}</div>
                    <div className="text-2xl font-bold text-orange-400">{count}</div>
                    <div className="text-xs text-neutral-500">arguments</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
