'use client';

import { useState, useRef } from 'react';
import { Camera, User, Mail, Lock, ArrowRight, Download, X, ArrowLeft, Upload, FileImage, Zap } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function QuickReceiptComponent() {
  const { user, login, logout, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setScanResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setUploadedImage(event.target?.result as string);
          setScanResult(null);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleScanReceipt = async () => {
    if (!uploadedImage) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: uploadedImage
        })
      });

      const data = await response.json();
      
      if (data.error) {
        console.error('API Error:', data.error);
        alert('Failed to scan receipt: ' + data.error);
      } else {
        setScanResult(data);
      }
    } catch (error) {
      console.error('Error scanning receipt:', error);
      alert('Failed to scan receipt. Please try again.');
    } finally {
      setIsProcessing(false);
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
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">QuickReceipt</h2>
            <p className="text-white/60">Sign in to access AI receipt scanning</p>
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
                  className="w-full bg-black border border-white/[0.1] rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-colors"
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
                  className="w-full bg-black border border-white/[0.1] rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-colors"
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
                className="w-4 h-4 bg-black border border-white/[0.1] rounded text-white focus:ring-white/20"
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
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link href="/" className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
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
      <div className="bg-black border-b border-white/[0.04] px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center">
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
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">QuickReceipt</h1>
          <p className="text-white/60 text-lg">AI-powered receipt scanning and expense tracking</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-black border border-white/[0.06] rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Upload Receipt</h3>
            
            {!uploadedImage ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                <div 
                className={`border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
                  isDragging 
                    ? 'border-cyan-400 bg-cyan-400/5' 
                    : 'border-white/[0.2] hover:border-white/[0.4]'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-white/40 mb-4" />
                  <p className="text-white/60 mb-2">Drag & drop receipt image here</p>
                  <p className="text-white/40 text-sm mb-4">or click to browse</p>
                  <p className="text-white/30 text-xs">PNG, JPG up to 10MB</p>
                </div>
              </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden">
                  <img src={uploadedImage} alt="Receipt" className="w-full h-64 object-cover" />
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setScanResult(null);
                    }}
                    className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-lg hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <button
                  onClick={handleScanReceipt}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Scan Receipt
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-black border border-white/[0.06] rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Scan Results</h3>
            
            {scanResult ? (
              <div className="space-y-4">
                <div className="bg-black rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-white/60 text-sm">Merchant</p>
                      <p className="text-white font-medium">{scanResult.merchant}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Date</p>
                      <p className="text-white font-medium">{scanResult.date}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Total</p>
                      <p className="text-cyan-400 font-semibold text-lg">{scanResult.total}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Category</p>
                      <p className="text-white font-medium">{scanResult.category}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-white/60 text-sm mb-2">Items</p>
                    <div className="space-y-2">
                      {scanResult.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-white/80">{item.name}</span>
                          <span className="text-white">{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <button className="w-full bg-black text-white py-2 rounded-lg hover:bg-white/[0.1] transition-colors">
                  Save to Expenses
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileImage className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/40">Upload and scan a receipt to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
