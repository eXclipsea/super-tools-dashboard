'use client';

import { useState, useEffect } from 'react';
import { 
  Receipt, 
  ChefHat, 
  Users, 
  Mic, 
  Scale,
  ArrowRight,
  ArrowUpRight,
  Download,
  Zap,
  Shield,
  Cpu,
  Apple,
  Check,
  X
} from 'lucide-react';
import Link from 'next/link';

const apps = [
  {
    name: 'QuickReceipt',
    tagline: 'Your receipts, organized.',
    description: 'Point your camera at any receipt. AI reads it, categorizes it, and tracks your spending — automatically.',
    icon: Receipt,
    color: '#22d3ee',
    gradient: 'from-cyan-500/20 to-cyan-500/5',
    route: '/quickreceipt',
    dmg: 'https://github.com/eXclipsea/QuickReceipt/releases/download/v0.1.0/QuickReceipt_0.1.0_aarch64.dmg',
  },
  {
    name: 'Kitchen Commander',
    tagline: 'Cook smarter, waste less.',
    description: 'Snap a photo of your fridge. Get a full pantry inventory and recipe ideas based on what you already have.',
    icon: ChefHat,
    color: '#4ade80',
    gradient: 'from-green-500/20 to-green-500/5',
    route: '/kitchen-commander',
    dmg: 'https://github.com/eXclipsea/kitchen-commander/releases/download/v0.1.0/KitchenCommander_0.1.0_aarch64.dmg',
  },
  {
    name: 'PersonaSync',
    tagline: 'Write like you. Faster.',
    description: 'Learns your writing style from examples, then drafts replies that sound exactly like you wrote them.',
    icon: Users,
    color: '#fb7185',
    gradient: 'from-rose-500/20 to-rose-500/5',
    route: '/personasync',
    dmg: 'https://github.com/eXclipsea/persona-drafter/releases/download/v0.1.0/PersonaSync_0.1.0_aarch64.dmg',
  },
  {
    name: 'VoiceTask',
    tagline: 'Talk it out. Get it done.',
    description: 'Record a voice memo. AI turns it into organized, prioritized tasks with deadlines — no typing required.',
    icon: Mic,
    color: '#a78bfa',
    gradient: 'from-violet-500/20 to-violet-500/5',
    route: '/voicetask',
    dmg: 'https://github.com/eXclipsea/voice-task/releases/download/v0.1.0/VoiceTask_0.1.0_aarch64.dmg',
  },
  {
    name: 'Argument Settler',
    tagline: 'Settle it with facts.',
    description: 'Two sides enter, one verdict leaves. AI fact-checks both arguments and delivers a ruling with sources.',
    icon: Scale,
    color: '#fb923c',
    gradient: 'from-orange-500/20 to-orange-500/5',
    route: '/argument-settler',
    dmg: 'https://github.com/eXclipsea/neutral-ref/releases/download/v0.1.0/ArgumentSettler_0.1.0_aarch64.dmg',
  }
];

export default function Dashboard() {
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);
  const [showDownloads, setShowDownloads] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePurchase = async () => {
    setIsProcessing(true);
    
    try {
      // Initialize Stripe with your keys
      const stripe = (window as any).Stripe('pk_live_51QjpF8C7Kvo5MPeV6LIkydaHiy1I4hxuUPGSlhb2OoWtRUsQiA0WnxCDUYvbZV120BiHvAIW9cBMR9MhRcBJwuK900rosLeOM1');
      
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId: 'prod_U2qxYcJ5mrZBZJ',
          productName: 'Super Tools Dashboard'
        })
      });
      
      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        console.error('Stripe error:', error);
      }
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight">Super Tools</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#apps" className="text-[13px] text-white/50 hover:text-white transition-colors">Apps</a>
            <a href="#download" className="text-[13px] text-white/50 hover:text-white transition-colors">Download</a>
            <a
              href="https://github.com/eXclipsea/super-tools-dashboard/releases/download/v0.1.0/SuperTools_0.1.0_aarch64.dmg"
              className="text-[13px] font-medium bg-white text-black px-4 py-1.5 rounded-full hover:bg-white/90 transition-colors"
            >
              Get the app
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/[0.07] via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-20">
          <div
            className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <p className="text-blue-400 text-sm font-medium tracking-wide uppercase mb-5">
              5 tools. One app. Zero friction.
            </p>
            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-tight max-w-3xl">
              The toolkit that
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-rose-400 bg-clip-text text-transparent">
                actually helps.
              </span>
            </h1>
            <p className="text-white/45 text-lg mt-6 max-w-xl leading-relaxed">
              Five focused apps that handle the tedious stuff — receipts, cooking, writing, tasks, and arguments — so you can spend time on what matters.
            </p>
            <div className="flex items-center gap-4 mt-10">
              <a
                href="https://github.com/eXclipsea/super-tools-dashboard/releases/download/v0.1.0/SuperTools_0.1.0_aarch64.dmg"
                className="group inline-flex items-center gap-2.5 bg-white text-black font-semibold text-[15px] px-7 py-3.5 rounded-full hover:bg-white/90 transition-all"
              >
                <Apple className="w-4 h-4" />
                Download for Mac
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="#apps"
                className="inline-flex items-center gap-2 text-white/50 font-medium text-[15px] px-6 py-3.5 rounded-full border border-white/10 hover:border-white/20 hover:text-white/70 transition-all"
              >
                Explore apps
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/[0.04] bg-white/[0.015]">
        <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-3 gap-8">
          {[
            { icon: Cpu, label: 'Powered by GPT-4o', sub: 'Latest AI models' },
            { icon: Shield, label: 'Private by default', sub: 'Your data stays yours' },
            { icon: Zap, label: 'Instant results', sub: 'No setup required' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-white/25" />
              <div>
                <p className="text-[13px] font-medium text-white/70">{label}</p>
                <p className="text-[12px] text-white/30">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Apps */}
      <section id="apps" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight">
            Five apps. Each one does its job.
          </h2>
          <p className="text-white/40 mt-3 text-lg">
            Click any app to open it right here.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <Link
                key={app.name}
                href={app.route}
                onMouseEnter={() => setHoveredApp(app.name)}
                onMouseLeave={() => setHoveredApp(null)}
                className="group relative bg-gradient-to-br from-[#111] to-[#0a0a0a] rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 cursor-pointer overflow-hidden block"
                style={{
                  boxShadow: hoveredApp === app.name 
                    ? `0 0 40px ${app.color}20, inset 0 1px 0 rgba(255,255,255,0.1)`
                    : '0 0 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${app.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: app.color }} />
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors duration-300" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">{app.name}</h3>
                  <p className="text-sm text-white/60 mb-4">{app.tagline}</p>
                  <p className="text-sm text-white/40 leading-relaxed">{app.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Download */}
      <section id="download" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/[0.05] via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Get the native app.
            </h2>
            <p className="text-white/40 mt-3 text-lg max-w-md mx-auto">
              All five tools in a single Mac app. Free, fast, and always up to date.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4">
              <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] rounded-3xl border border-white/[0.06] p-12">
                <div className="max-w-4xl mx-auto text-center">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <Download className="w-8 h-8 text-blue-400" />
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-bold mb-4">Get Super Tools Dashboard</h2>
                  <p className="text-lg text-white/60 mb-8 max-w-2xl mx-auto">
                    Download the complete Super Tools Dashboard as a desktop app. All 5 AI-powered tools in one beautiful, native application.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <button
                      onClick={() => setShowPurchaseModal(true)}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      <Apple className="w-5 h-5" />
                      Get Super Tools for Mac
                    </button>
                    <button className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl transition-all duration-300">
                      Coming to Windows
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
                    <div className="text-center">
                      <Shield className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Privacy First</h3>
                      <p className="text-sm text-white/60">All processing happens locally. Your data never leaves your device.</p>
                    </div>
                    <div className="text-center">
                      <Zap className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Lightning Fast</h3>
                      <p className="text-sm text-white/60">Native performance with instant startup and smooth interactions.</p>
                    </div>
                    <div className="text-center">
                      <Cpu className="w-8 h-8 text-green-400 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">AI Powered</h3>
                      <p className="text-sm text-white/60">Advanced AI models for receipt scanning, voice transcription, and more.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-[13px] font-medium text-white/40">Super Tools</span>
          </div>
          <p className="text-white/20 text-[12px]">
            Built by Landon Li
          </p>
        </div>
      </footer>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] rounded-2xl border border-white/[0.06] p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Get Super Tools</h3>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="text-white/40 hover:text-white/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <Apple className="w-6 h-6 text-blue-400" />
                <div>
                  <p className="font-medium">Super Tools Dashboard</p>
                  <p className="text-sm text-white/60">Complete desktop app with all 5 tools</p>
                </div>
              </div>
              
              <div className="border-t border-white/[0.06] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60">One-time purchase</span>
                  <span className="text-2xl font-bold">$2.99</span>
                </div>
                <p className="text-xs text-white/40">Lifetime access • Free updates • No subscription</p>
              </div>
              
              <div className="space-y-2 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>All 5 AI-powered tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Native macOS app</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Privacy-first design</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Free lifetime updates</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-neutral-600 disabled:to-neutral-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Purchase with Stripe
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            
            <p className="text-xs text-white/40 text-center mt-4">
              Secure payment powered by Stripe
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
