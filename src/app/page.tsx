'use client';

import { useState, useEffect } from 'react';
import { 
  Receipt, 
  ChefHat, 
  Users, 
  Mic, 
  Scale,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Download,
  Zap,
  Shield,
  Cpu,
  Apple
} from 'lucide-react';

const apps = [
  {
    name: 'QuickReceipt',
    tagline: 'Your receipts, organized.',
    description: 'Point your camera at any receipt. AI reads it, categorizes it, and tracks your spending — automatically.',
    icon: Receipt,
    color: '#22d3ee',
    gradient: 'from-cyan-500/20 to-cyan-500/5',
    url: 'https://windsurf-project-2-one.vercel.app',
    dmg: 'https://github.com/eXclipsea/QuickReceipt/releases/download/v0.1.0/QuickReceipt_0.1.0_aarch64.dmg',
  },
  {
    name: 'Kitchen Commander',
    tagline: 'Cook smarter, waste less.',
    description: 'Snap a photo of your fridge. Get a full pantry inventory and recipe ideas based on what you already have.',
    icon: ChefHat,
    color: '#4ade80',
    gradient: 'from-green-500/20 to-green-500/5',
    url: 'https://kitchen-commander.vercel.app',
    dmg: 'https://github.com/eXclipsea/kitchen-commander/releases/download/v0.1.0/KitchenCommander_0.1.0_aarch64.dmg',
  },
  {
    name: 'PersonaSync',
    tagline: 'Write like you. Faster.',
    description: 'Learns your writing style from examples, then drafts replies that sound exactly like you wrote them.',
    icon: Users,
    color: '#fb7185',
    gradient: 'from-rose-500/20 to-rose-500/5',
    url: 'https://personasync-flax.vercel.app',
    dmg: 'https://github.com/eXclipsea/persona-drafter/releases/download/v0.1.0/PersonaSync_0.1.0_aarch64.dmg',
  },
  {
    name: 'VoiceTask',
    tagline: 'Talk it out. Get it done.',
    description: 'Record a voice memo. AI turns it into organized, prioritized tasks with deadlines — no typing required.',
    icon: Mic,
    color: '#a78bfa',
    gradient: 'from-violet-500/20 to-violet-500/5',
    url: 'https://voicetask-phi.vercel.app',
    dmg: 'https://github.com/eXclipsea/voice-task/releases/download/v0.1.0/VoiceTask_0.1.0_aarch64.dmg',
  },
  {
    name: 'Argument Settler',
    tagline: 'Settle it with facts.',
    description: 'Two sides enter, one verdict leaves. AI fact-checks both arguments and delivers a ruling with sources.',
    icon: Scale,
    color: '#fb923c',
    gradient: 'from-orange-500/20 to-orange-500/5',
    url: 'https://argument-settler.vercel.app',
    dmg: 'https://github.com/eXclipsea/neutral-ref/releases/download/v0.1.0/ArgumentSettler_0.1.0_aarch64.dmg',
  }
];

export default function Dashboard() {
  const [activeApp, setActiveApp] = useState<typeof apps[0] | null>(null);
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);
  const [showDownloads, setShowDownloads] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (activeApp) {
    const Icon = activeApp.icon;
    return (
      <div className="h-screen flex flex-col bg-[#0a0a0a]">
        <div className="flex items-center gap-3 px-5 py-2.5 bg-[#111] border-b border-white/[0.06] shrink-0">
          <button
            onClick={() => setActiveApp(null)}
            className="flex items-center gap-1.5 text-white/50 hover:text-white transition-all duration-200 text-[13px] font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </button>
          <div className="w-px h-3.5 bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeApp.color }} />
            <span className="text-[13px] font-medium text-white/80">{activeApp.name}</span>
          </div>
          <div className="flex-1" />
          <a
            href={activeApp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 hover:text-white/60 transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
        <iframe
          src={activeApp.url}
          className="flex-1 w-full border-0"
          allow="camera;microphone"
        />
      </div>
    );
  }

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

        <div className="space-y-4">
          {apps.map((app, i) => {
            const Icon = app.icon;
            const isHovered = hoveredApp === app.name;
            return (
              <button
                key={app.name}
                onClick={() => setActiveApp(app)}
                onMouseEnter={() => setHoveredApp(app.name)}
                onMouseLeave={() => setHoveredApp(null)}
                className="group w-full text-left"
              >
                <div
                  className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                    isHovered
                      ? 'border-white/10 bg-white/[0.03]'
                      : 'border-white/[0.04] bg-transparent'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${app.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative flex items-center gap-6 p-7">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${app.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: app.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3">
                        <h3 className="font-semibold text-[17px]">{app.name}</h3>
                        <span className="text-[13px] font-medium" style={{ color: app.color }}>
                          {app.tagline}
                        </span>
                      </div>
                      <p className="text-white/40 text-[14px] mt-1 leading-relaxed">
                        {app.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <a
                        href={app.dmg}
                        onClick={(e) => e.stopPropagation()}
                        className="text-white/20 hover:text-white/60 transition-colors p-2"
                        title={`Download ${app.name}`}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center group-hover:bg-white/10 transition-all">
                        <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-px transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
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
              <a
                href="https://github.com/eXclipsea/super-tools-dashboard/releases/download/v0.1.0/SuperTools_0.1.0_aarch64.dmg"
                className="group inline-flex items-center gap-2.5 bg-white text-black font-semibold text-[15px] px-8 py-4 rounded-full hover:bg-white/90 transition-all"
              >
                <Apple className="w-4.5 h-4.5" />
                Download Super Tools
                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </a>
              <p className="text-white/25 text-[13px]">macOS (Apple Silicon) &middot; v0.1.0 &middot; Free</p>
            </div>

            <button
              onClick={() => setShowDownloads(!showDownloads)}
              className="mt-8 text-[13px] text-white/30 hover:text-white/50 transition-colors underline underline-offset-4"
            >
              {showDownloads ? 'Hide individual downloads' : 'Or download apps individually'}
            </button>

            {showDownloads && (
              <div className="mt-6 max-w-md mx-auto space-y-2">
                {apps.map((app) => {
                  const Icon = app.icon;
                  return (
                    <a
                      key={app.name}
                      href={app.dmg}
                      className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" style={{ color: app.color }} />
                        <span className="text-[13px] font-medium text-white/70">{app.name}</span>
                      </div>
                      <Download className="w-3.5 h-3.5 text-white/25" />
                    </a>
                  );
                })}
              </div>
            )}
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
    </div>
  );
}
