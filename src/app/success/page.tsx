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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <a
              href="https://github.com/eXclipsea/super-tools-dashboard/releases/download/v0.1.0/SuperTools_0.1.0_aarch64.dmg"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Download for Mac
            </a>
            <a
              href="https://github.com/eXclipsea/super-tools-dashboard/releases/download/v0.1.0/SuperTools_0.1.0_x64-setup.exe"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
              </svg>
              Download for Windows
            </a>
          </div>
          
          <p className="text-xs text-neutral-500 text-center mb-2">
            Session ID: {sessionId || 'N/A'}
          </p>
          <div className="text-sm text-neutral-400 text-center">
            <p>All 6 AI-powered tools in one desktop app</p>
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
