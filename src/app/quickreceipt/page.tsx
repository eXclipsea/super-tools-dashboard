'use client';

import { useState, useEffect } from 'react';
import { Camera, User, Mail, Lock, ArrowRight, Download, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import { useAuth } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'QuickReceipt - AI Receipt Scanner & Expense Tracker | Super Tools',
  description: 'QuickReceipt: AI-powered receipt scanner. Point your camera, instantly track expenses. Never lose receipts again. Perfect for business expenses and personal budgeting.',
  keywords: 'receipt scanner, expense tracker, AI OCR, business expenses, budget tracking, receipt management, financial organization, expense reports',
  openGraph: {
    title: 'QuickReceipt - AI Receipt Scanner',
    description: 'Scan receipts instantly with AI. Track expenses automatically. Never lose receipts again.',
    url: 'https://supertoolz.xyz/quickreceipt',
  },
};

export default function QuickReceipt() {
  const { user, login, logout, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

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
      <div className="bg-white/[0.02] border-b border-white/[0.04] px-6 py-3">
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

      <div className="max-w-sm w-full">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-4 h-4 text-white/50" />
            <span className="text-[13px] text-white/50">Back to Super Tools</span>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Camera className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-semibold text-white tracking-tight">QuickReceipt</h1>
          </div>
          <p className="text-neutral-500 text-sm">Scan and organize your receipts instantly</p>
        </div>

        {/* Auth Card */}
        <div className="rounded-xl border border-neutral-800 p-6">
          {/* Toggle */}
          <div className="flex mb-6 border border-neutral-800 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isLogin 
                  ? 'bg-neutral-800 text-white' 
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isLogin 
                  ? 'bg-neutral-800 text-white' 
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                    required={!isLogin}
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
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
            >
              {isLogin ? 'Login' : 'Sign Up'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Note */}
          <div className="mt-5 p-3 rounded-lg border border-neutral-800">
            <p className="text-xs text-neutral-500 text-center">
              Demo: Click any button to continue to the app
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-600">
            Built by Landon Li
          </p>
        </div>
      </div>
    </div>
  );
}
