'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, User, Mail, Lock, ArrowRight, X, ArrowLeft, Upload, LogOut, Trash2, Sparkles, Receipt, TrendingUp, AlertCircle, Aperture, CheckCircle, Scale, ShoppingCart, Plus, Info } from 'lucide-react';
import Link from 'next/link';
import { getCurrentUser, getCurrentUserAsync, setCurrentUser as saveUserToStorage, logout, findUser, createUser, signInWithEmail, signUpWithEmail, signInWithGoogle, onAuthStateChange } from '@/lib/auth';
import { saveData, loadData } from '@/lib/data';
import { CameraCapture } from '@/components/CameraCapture';

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

interface StorePrice {
  store: string;
  price: number;
  pricePerUnit: string;
  inStock: boolean;
}

interface PriceComparison {
  item: string;
  unitSize: string;
  stores: StorePrice[];
  bestValue: string;
  savings: string;
}

interface CompareResult {
  comparisons: PriceComparison[];
  totalBestStore: string;
  totalByStore: { store: string; estimatedTotal: number }[];
}

interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  checked: boolean;
}

const EXPENSE_CATEGORIES = ['Food & Dining', 'Shopping', 'Transportation', 'Healthcare', 'Entertainment', 'Other'];

export default function QuickReceipt() {
  const [view, setView] = useState<'auth' | 'dashboard'>('auth');
  const [isLogin, setIsLogin] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');

  // Dashboard state
  const [receipts, setReceipts] = useState<ScannedReceipt[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanError, setScanError] = useState('');
  const [loadingStep, setLoadingStep] = useState('');
  const [activeTab, setActiveTab] = useState<'scan' | 'history' | 'summary' | 'compare' | 'grocery'>('scan');
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Price comparison state
  const [compareItems, setCompareItems] = useState<{ name: string; quantity: string }[]>([{ name: '', quantity: '' }]);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [compareError, setCompareError] = useState('');

  // Grocery list state
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [newGroceryItem, setNewGroceryItem] = useState('');

  // Load session on mount - check Supabase then localStorage
  useEffect(() => {
    const checkSession = async () => {
      const user = await getCurrentUserAsync();
      if (user) {
        setCurrentUser(user);
        setView('dashboard');
      }
    };
    checkSession();

    // Listen for Supabase auth changes (e.g. Google OAuth callback)
    const { data: { subscription } } = onAuthStateChange((user) => {
      if (user) {
        setCurrentUser(user);
        setView('dashboard');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load receipts from server or localStorage on mount
  useEffect(() => {
    const init = async () => {
      const saved = await loadData('quickreceipt', []);
      if (saved && saved.length > 0) {
        setReceipts(saved);
      }
      setIsInitialized(true);
    };
    init();
  }, []);

  // Persist receipts to server/localStorage whenever they change
  useEffect(() => {
    if (receipts.length > 0 || isInitialized) {
      saveData('quickreceipt', receipts);
    }
  }, [receipts, isInitialized]);

  // Load/save grocery list
  useEffect(() => {
    const saved = localStorage.getItem('qr_grocery');
    if (saved) try { setGroceryList(JSON.parse(saved)); } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('qr_grocery', JSON.stringify(groceryList));
  }, [groceryList]);

  const comparePrices = async () => {
    const validItems = compareItems.filter(i => i.name.trim());
    if (validItems.length === 0) return;
    setIsComparing(true);
    setCompareError('');
    setCompareResult(null);
    try {
      const res = await fetch('/api/quickreceipt/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: validItems }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCompareResult(data);
    } catch (err: any) {
      setCompareError(err.message || 'Failed to compare prices.');
    } finally {
      setIsComparing(false);
    }
  };

  const addGroceryItem = () => {
    if (!newGroceryItem.trim()) return;
    setGroceryList(prev => [...prev, { id: Date.now().toString(), name: newGroceryItem.trim(), quantity: '1', checked: false }]);
    setNewGroceryItem('');
  };

  const toggleGroceryItem = (id: string) => {
    setGroceryList(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  const removeGroceryItem = (id: string) => {
    setGroceryList(prev => prev.filter(i => i.id !== id));
  };

  const addReceiptItemsToGrocery = (items: ReceiptItem[]) => {
    const newItems = items.map(i => ({ id: Date.now().toString() + Math.random(), name: i.name, quantity: '1', checked: false }));
    setGroceryList(prev => [...prev, ...newItems]);
  };

  const sendGroceryToCompare = () => {
    const unchecked = groceryList.filter(i => !i.checked);
    setCompareItems(unchecked.map(i => ({ name: i.name, quantity: i.quantity })));
    setActiveTab('compare');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    // Try Supabase first, fall back to legacy localStorage
    const { user, error } = await signInWithEmail(email, password);
    if (user) {
      setCurrentUser(user);
      const saved = await loadData('quickreceipt', []);
      if (saved) setReceipts(saved);
      setView('dashboard');
    } else if (error) {
      // Fall back to legacy auth
      const legacyUser = findUser(email, password);
      if (legacyUser) {
        saveUserToStorage(legacyUser);
        setCurrentUser(legacyUser);
        const saved = await loadData('quickreceipt', []);
        if (saved) setReceipts(saved);
        setView('dashboard');
      } else {
        setAuthError(error || 'Invalid email or password.');
      }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const { user, error } = await signUpWithEmail(email, name, password);
    if (user) {
      setCurrentUser(user);
      setView('dashboard');
    } else {
      setAuthError(error || 'Sign up failed. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  const handleLogout = async () => {
    await logout();
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

  const handleCameraCapture = (imageData: string) => {
    setSelectedImage(imageData);
    setScanError('');
  };

  const analyzeReceipt = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setScanError('');
    setLoadingStep('Sending image to GPT-4o...');
    const t1 = setTimeout(() => setLoadingStep('Reading receipt details...'), 1800);
    const t2 = setTimeout(() => setLoadingStep('Extracting line items...'), 3500);

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
        return updated;
      });
      setSelectedImage(null);
      setActiveTab('history');
    } catch (err: any) {
      setScanError(err.message || 'Failed to analyze receipt. Please try again.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsAnalyzing(false);
      setLoadingStep('');
    }
  };

  const deleteReceipt = async (id: string) => {
    const updated = receipts.filter(r => r.id !== id);
    setReceipts(updated);
    await saveData('quickreceipt', updated);
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
        <div className="max-w-sm w-full">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-4 h-4 text-white/50" />
              <span className="text-[13px] text-white/50">Back</span>
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

            <div className="mt-4 pt-4 border-t border-neutral-800 space-y-3">
              <button
                onClick={handleGoogleLogin}
                className="w-full bg-white hover:bg-neutral-100 text-black font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>
              <button
                onClick={() => setView('dashboard')}
                className="w-full text-neutral-500 hover:text-neutral-300 text-sm py-2 transition-colors"
              >
                Continue as Guest
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-neutral-600 mt-6">
            Guest data is stored locally. Sign in to sync across devices.
          </p>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD VIEW ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-4 h-4 text-white/50" />
              <span className="text-[13px] text-white/50">Back</span>
            </Link>
            <div className="w-px h-6 bg-neutral-800" />
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-cyan-400" />
              <h1 className="text-lg font-semibold tracking-tight">QuickReceipt</h1>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors border border-neutral-800 hover:border-neutral-600 px-3 py-1.5 rounded-lg"
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
            { id: 'scan', label: 'Scan', icon: Camera },
            { id: 'history', label: 'Receipts', icon: Receipt },
            { id: 'compare', label: 'Compare', icon: Scale },
            { id: 'grocery', label: 'Grocery List', icon: ShoppingCart },
            { id: 'summary', label: 'Summary', icon: TrendingUp },
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
            {/* Instructions Card */}
            <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800">
              <h3 className="text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                How it works
              </h3>
              <ol className="text-sm text-neutral-500 space-y-1 list-decimal list-inside">
                <li>Upload a receipt photo or take a picture with your camera</li>
                <li>AI will automatically read and extract all receipt details</li>
                <li>View your organized receipts in the "My Receipts" tab</li>
              </ol>
            </div>

            <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
              <h2 className="text-lg font-semibold mb-4">Upload or Capture Receipt</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-800 hover:border-neutral-600 rounded-xl p-6 text-center transition-colors"
                >
                  <Upload className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-neutral-400 text-sm">Upload Photo</p>
                  <p className="text-neutral-600 text-xs mt-1">From your device</p>
                </button>
                <button
                  onClick={() => setShowCamera(true)}
                  className="border-2 border-dashed border-cyan-400/50 hover:border-cyan-400 rounded-xl p-6 text-center transition-colors"
                >
                  <Aperture className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <p className="text-cyan-400 text-sm">Take Photo</p>
                  <p className="text-neutral-600 text-xs mt-1">Use camera</p>
                </button>
              </div>

              {selectedImage && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Image ready for scanning
                  </p>
                </div>
              )}

              {scanError && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm font-medium mb-1 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Something went wrong
                  </p>
                  <p className="text-red-300 text-sm">{scanError}</p>
                  <div className="mt-3 text-xs text-neutral-500 space-y-1">
                    <p className="font-medium text-neutral-400">Try these steps:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Make sure the receipt image is clear and well-lit</li>
                      <li>Ensure all receipt text is visible and not cut off</li>
                      <li>Try uploading a different image format (JPG, PNG)</li>
                      <li>Check your internet connection</li>
                      <li>If the problem persists, try again in a few minutes</li>
                    </ul>
                  </div>
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
                    {loadingStep || 'Analyzing receipt...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {selectedImage ? 'Scan Receipt with AI' : 'Select an image first'}
                  </>
                )}
              </button>

              {!selectedImage && !scanError && (
                <p className="mt-3 text-center text-xs text-neutral-600">
                  Tip: For best results, make sure the receipt is flat and all text is clearly visible
                </p>
              )}
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
                      <button
                        onClick={() => addReceiptItemsToGrocery(receipt.items)}
                        className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <ShoppingCart className="w-3 h-3" /> Add all to grocery list
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Compare Prices Tab */}
        {activeTab === 'compare' && (
          <div className="space-y-6">
            {/* Stock Disclaimer */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-300 font-medium">Pricing Disclaimer</p>
                <p className="text-xs text-amber-400/70 mt-1">Prices shown are AI-generated estimates based on typical US retail pricing. Actual prices vary by location, time, and availability. Stock information is not guaranteed to be accurate.</p>
              </div>
            </div>

            <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-cyan-400" />
                Compare Prices by Weight &amp; Store
              </h3>
              <p className="text-sm text-neutral-500 mb-4">Enter items to compare prices across stores. Weight and unit pricing included.</p>

              <div className="space-y-3 mb-4">
                {compareItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => setCompareItems(prev => prev.map((p, i) => i === idx ? { ...p, name: e.target.value } : p))}
                      placeholder="Item name (e.g. chicken breast)"
                      className="flex-1 bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                    />
                    <input
                      type="text"
                      value={item.quantity}
                      onChange={(e) => setCompareItems(prev => prev.map((p, i) => i === idx ? { ...p, quantity: e.target.value } : p))}
                      placeholder="Qty/size"
                      className="w-28 bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                    />
                    {compareItems.length > 1 && (
                      <button onClick={() => setCompareItems(prev => prev.filter((_, i) => i !== idx))} className="text-neutral-600 hover:text-red-400">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCompareItems(prev => [...prev, { name: '', quantity: '' }])}
                  className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add item
                </button>
              </div>

              <button
                onClick={comparePrices}
                disabled={isComparing || compareItems.every(i => !i.name.trim())}
                className="mt-4 w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isComparing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Comparing prices...
                  </>
                ) : (
                  <>
                    <Scale className="w-4 h-4" />
                    Compare Prices
                  </>
                )}
              </button>
            </div>

            {compareError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {compareError}</p>
              </div>
            )}

            {compareResult && (
              <div className="space-y-4">
                {/* Best Store Summary */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <p className="text-green-400 font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Best overall value: <span className="font-bold">{compareResult.totalBestStore}</span>
                  </p>
                  <div className="flex gap-4 mt-2">
                    {compareResult.totalByStore?.map((s, idx) => (
                      <span key={idx} className={`text-sm ${s.store === compareResult.totalBestStore ? 'text-green-400 font-medium' : 'text-neutral-500'}`}>
                        {s.store}: ${s.estimatedTotal?.toFixed(2)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Per-item breakdown */}
                {compareResult.comparisons?.map((comp, idx) => (
                  <div key={idx} className="bg-neutral-900 rounded-xl p-5 border border-neutral-800">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{comp.item}</h4>
                        <p className="text-xs text-neutral-500">{comp.unitSize}</p>
                      </div>
                      <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full">Best: {comp.bestValue}</span>
                    </div>
                    <div className="space-y-2">
                      {comp.stores?.map((store, sIdx) => (
                        <div key={sIdx} className={`flex items-center justify-between text-sm py-1.5 px-3 rounded-lg ${store.store === comp.bestValue ? 'bg-green-500/10' : 'bg-neutral-800/50'}`}>
                          <span className={store.store === comp.bestValue ? 'text-green-400 font-medium' : 'text-neutral-400'}>{store.store}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-neutral-500">{store.pricePerUnit}</span>
                            <span className={store.store === comp.bestValue ? 'text-green-400 font-bold' : 'text-white'}>${store.price?.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {comp.savings && <p className="text-xs text-green-400/70 mt-2">{comp.savings}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Grocery List Tab */}
        {activeTab === 'grocery' && (
          <div className="space-y-6">
            <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-cyan-400" />
                Grocery List ({groceryList.filter(i => !i.checked).length} remaining)
              </h3>

              <form onSubmit={(e) => { e.preventDefault(); addGroceryItem(); }} className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={newGroceryItem}
                  onChange={(e) => setNewGroceryItem(e.target.value)}
                  placeholder="Add item..."
                  className="flex-1 bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                />
                <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-black font-medium py-2 px-4 rounded-lg text-sm">
                  <Plus className="w-4 h-4" />
                </button>
              </form>

              {groceryList.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
                  <p className="text-neutral-500 text-sm">Your grocery list is empty</p>
                  <p className="text-neutral-600 text-xs mt-1">Add items manually or from your scanned receipts</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {groceryList.map(item => (
                    <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${item.checked ? 'bg-neutral-800/30 border-neutral-800' : 'bg-neutral-800/50 border-neutral-700'}`}>
                      <button onClick={() => toggleGroceryItem(item.id)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${item.checked ? 'bg-cyan-500 border-cyan-500' : 'border-neutral-600'}`}>
                        {item.checked && <CheckCircle className="w-3 h-3 text-black" />}
                      </button>
                      <span className={`flex-1 text-sm ${item.checked ? 'line-through text-neutral-600' : 'text-white'}`}>{item.name}</span>
                      <button onClick={() => removeGroceryItem(item.id)} className="text-neutral-600 hover:text-red-400">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {groceryList.filter(i => !i.checked).length > 0 && (
                <button
                  onClick={sendGroceryToCompare}
                  className="mt-4 w-full bg-neutral-800 hover:bg-neutral-700 text-cyan-400 font-medium py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Scale className="w-4 h-4" />
                  Compare prices for unchecked items
                </button>
              )}

              {groceryList.length > 0 && (
                <button
                  onClick={() => setGroceryList(prev => prev.filter(i => !i.checked))}
                  className="mt-2 w-full text-neutral-600 hover:text-neutral-400 text-xs py-2 transition-colors"
                >
                  Clear checked items
                </button>
              )}
            </div>
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
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onCancel={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
