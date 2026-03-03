// Data persistence utilities for Super Tools apps
// Uses Supabase for logged-in users, localStorage fallback for guests

import { supabase } from './supabase';
import { getCurrentUser } from './auth';

// Generic function to save data
export async function saveData(appId: string, data: any): Promise<void> {
  // Always save to localStorage as backup
  localStorage.setItem(`supertools_${appId}_data`, JSON.stringify(data));

  // If user has a Supabase ID, sync to database
  const user = getCurrentUser();
  if (user?.id) {
    try {
      await supabase.from('user_app_data').upsert(
        { user_id: user.id, app_id: appId, data },
        { onConflict: 'user_id,app_id' }
      );
    } catch (err) {
      console.error('Supabase sync error:', err);
    }
  }
}

// Generic function to load data
export async function loadData(appId: string, defaultData: any = null): Promise<any> {
  const user = getCurrentUser();

  // If user has a Supabase ID, try database first
  if (user?.id) {
    try {
      const { data: row, error } = await supabase
        .from('user_app_data')
        .select('data')
        .eq('user_id', user.id)
        .eq('app_id', appId)
        .single();

      if (!error && row?.data) {
        localStorage.setItem(`supertools_${appId}_data`, JSON.stringify(row.data));
        return row.data;
      }
    } catch (err) {
      console.error('Supabase load error:', err);
    }
  }

  // Fall back to localStorage
  const stored = localStorage.getItem(`supertools_${appId}_data`);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }

  return defaultData;
}
