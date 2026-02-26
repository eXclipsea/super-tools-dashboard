'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, User, Mail, Lock, ArrowRight, Download, X, ArrowLeft, Upload, LogOut, Trash2, Sparkles, Receipt, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface ReceiptItem {
  name: string;
  amount: number;
}

interface ScannedReceipt {
  id: string;
  storeName: string;
  date: string;
  total: number;
  category: string;
  items: ReceiptItem[];
  imageUrl: string;
  addedAt: string;
}

interface CurrentUser {
  email: string;
  name: string;
}

const EXPENSE_CATEGORIES = ['Food & Dining', 'Shopping', 'Transportation', 'Healthcare', 'Entertainment', 'Other'];

export default function QuickReceipt() {
  const [view, setView] = useState<'auth' | 'dashboard'>('auth');
  const [isLogin, setIsLogin] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');

  // Dashboard state
  const [receipts, setReceipts] = useState<ScannedReceipt[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanError, setScanError] = useState('');
  const [activeTab, setActiveTab] = useState<'scan' | 'history' | 'summary'>('scan');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load session and receipts from localStorage on mount
  useEffect(() => {
    const session = localStorage.getItem('qr_session');
    if (session) {
      try {
        const user = JSON.parse(session) as CurrentUser;
        setCurrentUser(user);
        setView('dashboard');
      } catch {}
    }

    const saved = localStorage.getItem('qr_receipts');
    if (saved) {
      try {
        setReceipts(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Persist receipts to localStorage whenever they change
  useEffect(() => {
    if (receipts.length > 0) {
      localStorage.setItem('qr_receipts', JSON.stringify(receipts));
    }
  }, [receipts]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const users: any[] = JSON.parse(localStorage.getItem('qr_users') || '[]');
    const user = users.find(u => u.email === email && u.password === btoa(password));
    if (user) {
      const session = { email: user.email, name: user.name };
      localStorage.setItem('qr_session', JSON.stringify(session));
      setCurrentUser(session);
      setView('dashboard');
    } else {
      setAuthError('Invalid email or password.');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const users: any[] = JSON.parse(localStorage.getItem('qr_users') || '[]');
    if (users.find((u: any) => u.email === email)) {
      setAuthError('An account with this email already exists.');
      return;
    }
    const newUser = { email, name, password: btoa(password) };
    users.push(newUser);
    localStorage.setItem('qr_users', JSON.stringify(users));
    const session = { email, name };
    localStorage.setItem('qr_session', JSON.stringify(session));
    setCurrentUser(session);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('qr_session');
    setCurrentUser(null);
    setEmail('');
    setPassword('');
    setName('');
    setView('auth');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      setScanError('');
    };
    reader.readAsDataURL(file);
  };

  const analyzeReceipt = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setScanError('');

    try {
      const res = await fetch('/api/quickreceipt/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: selectedImage }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const newReceipt: ScannedReceipt = {
        id: Date.now().toString(),
        storeName: data.storeName || 'Unknown Store',
        date: data.date || new Date().toISOString().split('T')[0],
        total: typeof data.total === 'number' ? data.total : parseFloat(data.total) || 0,
        category: data.category || 'Other',
        items: data.items || [],
        imageUrl: selectedImage,
        addedAt: new Date().toISOString(),
      };

      setReceipts(prev => {
        const updated = [newReceipt, ...prev];
        localStorage.setItem('qr_receipts', JSON.stringify(updated));
        return updated;
      });
      setSelectedImage(null);
      setActiveTab('history');
    } catch (err: any) {
      setScanError(err.message || 'Failed to analyze receipt. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteReceipt = (id: string) => {
    setReceipts(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('qr_receipts', JSON.stringify(updated));
      return updated;
    });
  };

  // Summary calculations
  const totalSpend = receipts.reduce((sum, r) => sum + r.total, 0);
  const byCategory = EXPENSE_CATEGORIES.map(cat => ({
    category: cat,
    total: receipts.filter(r => r.category === cat).reduce((sum, r) => sum + r.total, 0),
    count: receipts.filter(r => r.category === cat).length,
  })).filter(c => c.count > 0);

  // ─── AUTH VIEW ───────────────────────────────────────────────────────────────
  if (view === 'auth') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        {showBanner && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-cyan-500/10 backdrop-blur-xl border-b border-cyan-400/20">
            <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
              <a
                href="https://github.com/eXclipsea/QuickReceipt/releases/download/v0.1.0/QuickReceipt_0.1.0_aarch64.dmg"
                className="flex items-center gap-2 text-[13px] text-white/80 hover:text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Get <strong>QuickReceipt</strong> for Mac</span>
                <span className="text-cyan-400 font-medium ml-1">Download &rarr;</span>
              </a>
              <button onClick={() => setShowBanner(false)} className="text-white/30 hover:text-white/60 transition-colors p-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className="max-w-sm w-full">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-4 h-4 text-white/50" />
              <span className="text-[13px] text-white/50">Back to Super Tools</span>
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <Camera className="w-6 h-6 text-cyan-400" />
              <h1 className="text-2xl font-semibold text-white tracking-tight">QuickReceipt</h1>
            </div>
            <p className="text-neutral-500 text-sm">Scan and organize your receipts instantly</p>
          </div>

          <div className="rounded-xl border border-neutral-800 p-6">
            <div className="flex mb-6 border border-neutral-800 rounded-lg p-1">
              <button
                onClick={() => { setIsLogin(true); setAuthError(''); }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${isLogin ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                Login
              </button>
              <button
                onClick={() => { setIsLogin(false); setAuthError(''); }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${!isLogin ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-neutral-600" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-transparent border border-neutral-800 text-white rounded-lg focus:border-cyan-400/50 focus:outline-none text-sm placeholder-neutral-600"
                      placeholder="Your name"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-neutral-600" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-transparent border border-neutral-800 text-white rounded-lg focus:border-cyan-400/50 focus:outline-none text-sm placeholder-neutral-600"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-neutral-600" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-transparent border border-neutral-800 text-white rounded-lg focus:border-cyan-400/50 focus:outline-none text-sm placeholder-neutral-600"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {authError && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
              >
                {isLogin ? 'Login' : 'Create Account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-neutral-600 mt-6">
            Your receipts are stored locally on this device.
          </p>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD VIEW ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white">
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-cyan-500/10 backdrop-blur-xl border-b border-cyan-400/20">
          <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
            <a
              href="https://github.com/eXclipsea/QuickReceipt/releases/download/v0.1.0/QuickReceipt_0.1.0_aarch64.dmg"
              className="flex items-center gap-2 text-[13px] text-white/80 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Get <strong>QuickReceipt</strong> for Mac</span>
              <span className="text-cyan-400 font-medium ml-1">Download &rarr;</span>
            </a>
            <button onClick={() => setShowBanner(false)} className="text-white/30 hover:text-white/60 transition-colors p-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-2 hover:opacity-80 transition-opacity inline-flex">
              <ArrowLeft className="w-4 h-4 text-white/50" />
              <span className="text-[13px] text-white/50">Back to Super Tools</span>
            </Link>
            <div className="flex items-center gap-3 mb-1">
              <Camera className="w-6 h-6 text-cyan-400" />
              <h1 className="text-2xl font-semibold tracking-tight">QuickReceipt</h1>
            </div>
            <p className="text-neutral-500 text-sm">Welcome back, {currentUser?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors border border-neutral-800 hover:border-neutral-600 px-3 py-2 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <p className="text-xs text-neutral-500 mb-1">Total Receipts</p>
            <p className="text-2xl font-bold text-cyan-400">{receipts.length}</p>
          </div>
          <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <p className="text-xs text-neutral-500 mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-white">${totalSpend.toFixed(2)}</p>
          </div>
          <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <p className="text-xs text-neutral-500 mb-1">Categories</p>
            <p className="text-2xl font-bold text-white">{byCategory.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-10 border-b border-neutral-800">
          {[
            { id: 'scan', label: 'Scan Receipt', icon: Camera },
            { id: 'history', label: 'My Receipts', icon: Receipt },
            { id: 'summary', label: 'Spending Summary', icon: TrendingUp },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === id
                  ? 'border-cyan-400 text-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Scan Tab */}
        {activeTab === 'scan' && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
              <h2 className="text-lg font-semibold mb-4">Upload a Receipt</h2>

              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  selectedImage ? 'border-cyan-400/50' : 'border-neutral-800 hover:border-neutral-600'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedImage ? (
                  <div className="space-y-4">
                    <img src={selectedImage} alt="Receipt" className="max-h-64 mx-auto rounded-lg object-contain" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                    <p className="text-neutral-400 mb-2">Click to upload receipt photo</p>
                    <p className="text-neutral-600 text-sm">JPG, PNG, HEIC supported</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {scanError && (
                <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {scanError}
                </div>
              )}

              <button
                onClick={analyzeReceipt}
                disabled={!selectedImage || isAnalyzing}
                className="mt-4 w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Analyzing receipt...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Scan Receipt with AI
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {receipts.length === 0 ? (
              <div className="text-center py-16">
                <Receipt className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                <p className="text-neutral-500">No receipts yet. Scan your first one!</p>
                <button
                  onClick={() => setActiveTab('scan')}
                  className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-black font-medium py-2 px-4 rounded-lg text-sm"
                >
                  Scan a Receipt
                </button>
              </div>
            ) : (
              receipts.map(receipt => (
                <div key={receipt.id} className="bg-neutral-900 rounded-xl p-5 border border-neutral-800">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{receipt.storeName}</h3>
                      <p className="text-sm text-neutral-500">{receipt.date} · {receipt.category}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-cyan-400">${receipt.total.toFixed(2)}</span>
                      <button
                        onClick={() => deleteReceipt(receipt.id)}
                        className="text-neutral-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {receipt.items.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-neutral-800 space-y-1">
                      {receipt.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-neutral-400">{item.name}</span>
                          <span className="text-neutral-300">${item.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {receipts.length === 0 ? (
              <div className="text-center py-16">
                <TrendingUp className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                <p className="text-neutral-500">Scan some receipts to see your spending breakdown.</p>
              </div>
            ) : (
              <>
                <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
                  <h3 className="font-semibold text-lg mb-4">Spending by Category</h3>
                  <div className="space-y-3">
                    {byCategory.sort((a, b) => b.total - a.total).map(({ category, total, count }) => {
                      const pct = totalSpend > 0 ? (total / totalSpend) * 100 : 0;
                      return (
                        <div key={category}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-neutral-300">{category}</span>
                            <span className="text-sm font-medium">${total.toFixed(2)} <span className="text-neutral-500">({count})</span></span>
                          </div>
                          <div className="w-full bg-neutral-800 rounded-full h-1.5">
                            <div
                              className="bg-cyan-400 h-1.5 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
                  <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
                  <div className="space-y-2">
                    {receipts.slice(0, 5).map(r => (
                      <div key={r.id} className="flex items-center justify-between text-sm py-2 border-b border-neutral-800 last:border-0">
                        <div>
                          <span className="text-white">{r.storeName}</span>
                          <span className="text-neutral-500 ml-2">{r.date}</span>
                        </div>
                        <span className="text-cyan-400 font-medium">${r.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
