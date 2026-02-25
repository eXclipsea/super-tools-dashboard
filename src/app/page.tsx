'use client';

import { 
  Receipt, 
  ChefHat, 
  Users, 
  Mic, 
  Scale,
  ArrowUpRight
} from 'lucide-react';

const apps = [
  {
    name: 'QuickReceipt',
    description: 'Scan and organize receipts with AI',
    icon: Receipt,
    accent: 'text-cyan-400',
    border: 'hover:border-cyan-400/30',
    url: 'https://windsurf-project-2-one.vercel.app',
  },
  {
    name: 'Kitchen Commander',
    description: 'Pantry inventory & recipe suggestions',
    icon: ChefHat,
    accent: 'text-green-400',
    border: 'hover:border-green-400/30',
    url: 'https://kitchen-commander.vercel.app',
  },
  {
    name: 'PersonaSync',
    description: 'Writing style analyzer & message drafter',
    icon: Users,
    accent: 'text-rose-400',
    border: 'hover:border-rose-400/30',
    url: 'https://personasync.vercel.app',
  },
  {
    name: 'VoiceTask',
    description: 'Voice-to-text task organizer',
    icon: Mic,
    accent: 'text-violet-400',
    border: 'hover:border-violet-400/30',
    url: 'https://voicetask-phi.vercel.app',
  },
  {
    name: 'Argument Settler',
    description: 'Fact checker with roast feature',
    icon: Scale,
    accent: 'text-orange-400',
    border: 'hover:border-orange-400/30',
    url: 'https://argument-settler.vercel.app',
  }
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl font-semibold tracking-tight mb-3">
            Super Tools
          </h1>
          <p className="text-neutral-500 text-lg">
            5 AI-powered apps. One toolkit.
          </p>
        </div>

        {/* App Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <a
                key={app.name}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-start justify-between p-6 rounded-xl border border-neutral-800 ${app.border} transition-all hover:bg-neutral-950`}
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
              </a>
            );
          })}
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
