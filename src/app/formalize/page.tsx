'use client';

import { useState, useEffect } from 'react';
import { Quote, ArrowLeft, Sparkles, Copy, Check, Download, X } from 'lucide-react';
import Link from 'next/link';
import { getCurrentUser, logout } from '@/lib/auth';

const styles = [
  { id: 'shakespeare', name: 'Shakespeare', icon: '🎭', description: 'Thee/thou/thy with poetic flair' },
  { id: 'formal', name: 'Formal', icon: '📜', description: 'Professional business/academic tone' },
  { id: 'presidential', name: 'Presidential', icon: '🎤', description: 'Inspiring speech style' },
  { id: 'philosopher', name: 'Philosopher', icon: '🤔', description: 'Profound and contemplative' },
  { id: 'poet', name: 'Poet', icon: '🌸', description: 'Beautiful lyrical language' },
  { id: 'medieval', name: 'Medieval', icon: '⚔️', description: 'Archaic chivalric language' },
  { id: 'gangster', name: 'Gangster', icon: '🎩', description: '1920s noir mobster slang' },
];

export default function Formalize() {
  const [inputText, setInputText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('shakespeare');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);
  const [showBanner, setShowBanner] = useState(true);

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

  const transformText = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/formalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, style: selectedStyle }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOutput(data.transformedText);
    } catch (err: any) {
      console.error('Transform error:', err);
      setOutput('Failed to transform text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Download Popup */}
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/10 backdrop-blur-xl border-b border-amber-400/20">
          <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
            <a
              href="https://github.com/eXclipsea/formalize/releases/download/v0.1.0/Formalize_0.1.0_aarch64.dmg"
              className="flex items-center gap-2 text-[13px] text-white/80 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Get <strong>Formalize</strong> for Mac</span>
              <span className="text-amber-400 font-medium ml-1">Download &rarr;</span>
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
              <Quote className="w-6 h-6 text-amber-400" />
              <h1 className="text-2xl font-semibold tracking-tight">Formalize</h1>
            </div>
            <p className="text-neutral-500">
              {currentUser ? `Welcome back, ${currentUser.name}` : 'Transform your words into eloquence'}
            </p>
          </div>
          {currentUser && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{currentUser.name.charAt(0).toUpperCase()}</span>
              </div>
              <button onClick={handleLogout} className="text-white/50 hover:text-white text-sm">Logout</button>
            </div>
          )}
        </div>

        {/* Style Selector */}
        <div className="mb-8">
          <label className="block text-sm text-white/60 mb-3">Choose a style</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedStyle === style.id
                    ? 'border-amber-400 bg-amber-500/10'
                    : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                }`}
              >
                <span className="text-2xl mb-1 block">{style.icon}</span>
                <p className="text-sm font-medium text-white">{style.name}</p>
                <p className="text-xs text-white/40">{style.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="mb-6">
          <label className="block text-sm text-white/60 mb-2">Your text</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your text here... (e.g., 'Hey, can you grab some milk from the store?')"
            className="w-full h-32 p-4 bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:border-amber-400/50 focus:outline-none resize-none"
          />
        </div>

        {/* Transform Button */}
        <button
          onClick={transformText}
          disabled={!inputText.trim() || loading}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-semibold py-4 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mb-8"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Transforming...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Transform to {styles.find(s => s.id === selectedStyle)?.name}
            </>
          )}
        </button>

        {/* Output */}
        {output && (
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-amber-400">Transformed</h3>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <p className="text-lg leading-relaxed text-white/90">{output}</p>
          </div>
        )}
      </div>
    </div>
  );
}
