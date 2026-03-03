'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth callback error:', error);
        router.push('/');
        return;
      }

      if (session?.user) {
        // Store Google tokens for Calendar access if available
        if (session.provider_token) {
          await supabase.from('user_profiles').upsert({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            google_access_token: session.provider_token,
            google_refresh_token: session.provider_refresh_token || null,
          });
        }
      }

      router.push('/');
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-neutral-400 text-sm">Signing you in...</p>
      </div>
    </div>
  );
}
