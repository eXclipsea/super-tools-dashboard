'use client';

import { Download, LayoutGrid, Check } from 'lucide-react';

const downloads = [
  { name: 'Super Tools (All-in-One)', url: 'https://github.com/eXclipsea/super-tools-dashboard/releases/download/v0.1.0/SuperTools_0.1.0_aarch64.dmg' },
  { name: 'Kitchen Commander', url: 'https://github.com/eXclipsea/kitchen-commander/releases/download/v0.1.0/KitchenCommander_0.1.0_aarch64.dmg' },
  { name: 'PersonaSync', url: 'https://github.com/eXclipsea/persona-drafter/releases/download/v0.1.0/PersonaSync_0.1.0_aarch64.dmg' },
  { name: 'Argument Settler', url: 'https://github.com/eXclipsea/neutral-ref/releases/download/v0.1.0/ArgumentSettler_0.1.0_aarch64.dmg' },
  { name: 'VoiceTask', url: 'https://github.com/eXclipsea/voice-task/releases/download/v0.1.0/VoiceTask_0.1.0_aarch64.dmg' },
  { name: 'QuickReceipt', url: 'https://github.com/eXclipsea/QuickReceipt/releases/download/v0.1.0/QuickReceipt_0.1.0_aarch64.dmg' },
];

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full border-2 border-green-400 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Thank you!</h1>
          <p className="text-neutral-500">Your support means a lot. Download your Mac apps below.</p>
        </div>

        <div className="space-y-3">
          {downloads.map((app) => (
            <a
              key={app.name}
              href={app.url}
              className="flex items-center justify-between p-4 rounded-xl border border-neutral-800 hover:bg-neutral-950 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium">{app.name}</span>
              </div>
              <span className="text-xs text-neutral-600 group-hover:text-neutral-400 transition-colors">.dmg</span>
            </a>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a href="/" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
