'use client';

import { useState } from 'react';
import { 
  Receipt, 
  ChefHat, 
  Users, 
  Mic, 
  Scale,
  ExternalLink,
  Globe,
  Copy,
  Check
} from 'lucide-react';

interface App {
  name: string;
  description: string;
  port: number;
  icon: React.ReactNode;
  color: string;
  url: string;
}

const apps: App[] = [
  {
    name: 'QuickReceipt',
    description: 'Scan and organize receipts with AI',
    port: 3000,
    icon: <Receipt className="w-8 h-8" />,
    color: 'bg-blue-500',
    url: 'http://localhost:3000'
  },
  {
    name: 'Kitchen Commander',
    description: 'Pantry inventory & recipe suggestions',
    port: 3001,
    icon: <ChefHat className="w-8 h-8" />,
    color: 'bg-emerald-500',
    url: 'http://localhost:3001'
  },
  {
    name: 'PersonaSync',
    description: 'Writing style analyzer & message drafter',
    port: 3002,
    icon: <Users className="w-8 h-8" />,
    color: 'bg-rose-500',
    url: 'http://localhost:3002'
  },
  {
    name: 'VoiceTask',
    description: 'Voice-to-text task organizer',
    port: 3003,
    icon: <Mic className="w-8 h-8" />,
    color: 'bg-amber-500',
    url: 'http://localhost:3003'
  },
  {
    name: 'Argument Settler',
    description: 'Fact checker with roast feature',
    port: 3004,
    icon: <Scale className="w-8 h-8" />,
    color: 'bg-red-500',
    url: 'http://localhost:3004'
  }
];

export default function Dashboard() {
  const [tunnels, setTunnels] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState<number | null>(null);

  const startTunnel = async (port: number) => {
    setLoading(prev => ({ ...prev, [port]: true }));
    
    try {
      const response = await fetch('/api/tunnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ port })
      });
      
      const data = await response.json();
      if (data.url) {
        setTunnels(prev => ({ ...prev, [port]: data.url }));
      }
    } catch (error) {
      console.error('Failed to start tunnel:', error);
    } finally {
      setLoading(prev => ({ ...prev, [port]: false }));
    }
  };

  const copyUrl = (url: string, port: number) => {
    navigator.clipboard.writeText(url);
    setCopied(port);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Super Tools Dashboard
          </h1>
          <p className="text-xl text-gray-400">
            Your AI-powered toolkit, all in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {apps.map((app) => (
            <div
              key={app.port}
              className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all hover:scale-105"
            >
              <div className={`${app.color} w-16 h-16 rounded-xl flex items-center justify-center text-white mb-4`}>
                {app.icon}
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">{app.name}</h2>
              <p className="text-gray-400 mb-4">{app.description}</p>
              
              <div className="space-y-3">
                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  Open Local
                </a>

                {tunnels[app.port] ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={tunnels[app.port]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl transition-colors text-sm"
                    >
                      <Globe className="w-4 h-4" />
                      Public URL
                    </a>
                    <button
                      onClick={() => copyUrl(tunnels[app.port]!, app.port)}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
                    >
                      {copied === app.port ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startTunnel(app.port)}
                    disabled={loading[app.port]}
                    className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2 rounded-xl transition-colors text-sm"
                  >
                    <Globe className="w-4 h-4" />
                    {loading[app.port] ? 'Starting...' : 'Publish to Internet'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">5</div>
              <div className="text-gray-400">Apps Running</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {Object.keys(tunnels).length}
              </div>
              <div className="text-gray-400">Published</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">3000-3004</div>
              <div className="text-gray-400">Port Range</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">AI</div>
              <div className="text-gray-400">Powered by GPT</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
