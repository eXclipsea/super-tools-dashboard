'use client';

import { useState } from 'react';
import { 
  Receipt, 
  ChefHat, 
  Users, 
  Mic, 
  Scale,
  ArrowUpRight,
  ArrowLeft,
  LayoutGrid,
  Download,
  Loader2
} from 'lucide-react';

const apps = [
  {
    name: 'QuickReceipt',
    description: 'Scan and organize receipts with AI',
    icon: Receipt,
    accent: 'text-cyan-400',
    accentBg: 'bg-cyan-400',
    border: 'hover:border-cyan-400/30',
    url: 'https://windsurf-project-2-one.vercel.app',
  },
  {
    name: 'Kitchen Commander',
    description: 'Pantry inventory & recipe suggestions',
    icon: ChefHat,
    accent: 'text-green-400',
    accentBg: 'bg-green-400',
    border: 'hover:border-green-400/30',
    url: 'https://kitchen-commander.vercel.app',
  },
  {
    name: 'PersonaSync',
    description: 'Writing style analyzer & message drafter',
    icon: Users,
    accent: 'text-rose-400',
    accentBg: 'bg-rose-400',
    border: 'hover:border-rose-400/30',
    url: 'https://personasync.vercel.app',
  },
  {
    name: 'VoiceTask',
    description: 'Voice-to-text task organizer',
    icon: Mic,
    accent: 'text-violet-400',
    accentBg: 'bg-violet-400',
    border: 'hover:border-violet-400/30',
    url: 'https://voicetask-phi.vercel.app',
  },
  {
    name: 'Argument Settler',
    description: 'Fact checker with roast feature',
    icon: Scale,
    accent: 'text-orange-400',
    accentBg: 'bg-orange-400',
    border: 'hover:border-orange-400/30',
    url: 'https://argument-settler.vercel.app',
  }
];

export default function Dashboard() {
  const [activeApp, setActiveApp] = useState<typeof apps[0] | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handlePurchase = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Embedded app view
  if (activeApp) {
    const Icon = activeApp.icon;
    return (
      <div className="h-screen flex flex-col bg-black">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-neutral-800 shrink-0">
          <button
            onClick={() => setActiveApp(null)}
            className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="w-px h-4 bg-neutral-800" />
          <Icon className={`w-4 h-4 ${activeApp.accent}`} />
          <span className="text-sm font-medium text-white">{activeApp.name}</span>
          <div className="flex-1" />
          <a
            href={activeApp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
        {/* Embedded app */}
        <iframe
          src={activeApp.url}
          className="flex-1 w-full border-0"
          allow="camera;microphone"
        />
      </div>
    );
  }

  // Dashboard view
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-3">
            <LayoutGrid className="w-7 h-7 text-indigo-400" />
            <h1 className="text-4xl font-semibold tracking-tight">
              Super Tools
            </h1>
          </div>
          <p className="text-neutral-500 text-lg">
            5 AI-powered apps. One toolkit.
          </p>
        </div>

        {/* App Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <button
                key={app.name}
                onClick={() => setActiveApp(app)}
                className={`group flex items-start justify-between p-6 rounded-xl border border-neutral-800 ${app.border} transition-all hover:bg-neutral-950 text-left`}
              >
                <div className="flex items-start gap-4">
                  <Icon className={`w-5 h-5 mt-0.5 ${app.accent}`} />
                  <div>
                    <h2 className="font-medium text-white group-hover:underline underline-offset-4">
                      {app.name}
                    </h2>
                    <p className="text-neutral-500 text-sm mt-1">
                      {app.description}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors mt-1 shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Download Section */}
        <div className="rounded-xl border border-indigo-400/20 p-8 mb-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight mb-1">
                Get Super Tools for Mac
              </h2>
              <p className="text-neutral-500 text-sm">
                All 5 apps in one native Mac app. $2.99 to support development.
              </p>
            </div>
            <button
              onClick={handlePurchase}
              disabled={checkoutLoading}
              className="shrink-0 bg-indigo-500 hover:bg-indigo-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-medium py-3 px-6 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              {checkoutLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {checkoutLoading ? 'Loading...' : 'Buy & Download — $2.99'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800 pt-8">
          <p className="text-neutral-600 text-sm">
            Built by Landon Li &middot; Powered by OpenAI
          </p>
        </div>
      </div>
    </div>
  );
}
