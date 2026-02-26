'use client';

import { useEffect, useState } from 'react';
import { Download, Check, Home } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('session_id');
    setSessionId(id);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Payment Successful!</h1>
          <p className="text-neutral-500">Thank you for purchasing Super Tools Dashboard. Your download is ready.</p>
        </div>

        <div className="bg-neutral-900 rounded-xl p-8 border border-neutral-800 mb-8">
          <h3 className="font-semibold text-lg mb-6 text-center">Download Super Tools Dashboard</h3>
          <a
            href="https://github.com/eXclipsea/super-tools-dashboard/releases/download/v0.1.0/SuperTools_0.1.0_aarch64.dmg"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg"
          >
            <Download className="w-6 h-6" />
            Download for Mac
          </a>
          <p className="text-xs text-neutral-500 mt-4 text-center">
            Session ID: {sessionId || 'N/A'}
          </p>
          <div className="mt-6 text-sm text-neutral-400 text-center">
            <p>All 5 AI-powered tools in one native macOS app</p>
            <p>Free lifetime updates • No subscription</p>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="mt-8 text-center text-sm text-neutral-500">
          <p>Need help? Contact support@supertoolz.xyz</p>
        </div>
      </div>
    </div>
  );
}
