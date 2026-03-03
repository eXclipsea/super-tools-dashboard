// Shared auth utilities for Super Tools
// Uses Supabase Auth for persistent accounts, localStorage fallback for guests

import { supabase } from './supabase';

export interface User {
  id?: string;
  email: string;
  name: string;
  provider?: string;
  accessToken?: string;
}

const SESSION_KEY = 'supertools_session';

// Get current user from Supabase session or localStorage guest session
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  // Check localStorage for cached session (fast sync check)
  const cached = localStorage.getItem(SESSION_KEY);
  if (cached) {
    try { return JSON.parse(cached) as User; } catch {}
  }
  return null;
}

// Async version that checks Supabase session
export async function getCurrentUserAsync(): Promise<User | null> {
  if (typeof window === 'undefined') return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const user: User = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
        provider: session.user.app_metadata?.provider,
        accessToken: session.provider_token || undefined,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    }
  } catch (err) {
    console.error('Supabase session check error:', err);
  }
  // Fall back to localStorage
  return getCurrentUser();
}

export function setCurrentUser(user: User | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

// Sign up with email/password via Supabase
export async function signUpWithEmail(email: string, name: string, password: string): Promise<{ user: User | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) return { user: null, error: error.message };
    if (data.user) {
      const user: User = { id: data.user.id, email, name };
      setCurrentUser(user);
      // Create profile
      await supabase.from('user_profiles').upsert({ id: data.user.id, name });
      return { user, error: null };
    }
    return { user: null, error: 'Check your email to confirm your account.' };
  } catch (err: any) {
    return { user: null, error: err.message || 'Sign up failed' };
  }
}

// Sign in with email/password via Supabase
export async function signInWithEmail(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { user: null, error: error.message };
    if (data.user) {
      const user: User = {
        id: data.user.id,
        email: data.user.email || email,
        name: data.user.user_metadata?.full_name || email.split('@')[0],
      };
      setCurrentUser(user);
      return { user, error: null };
    }
    return { user: null, error: 'Login failed' };
  } catch (err: any) {
    return { user: null, error: err.message || 'Login failed' };
  }
}

// Sign in with Google via Supabase (with Calendar scopes)
export async function signInWithGoogle(): Promise<void> {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events',
    },
  });
}

// Logout from Supabase + clear localStorage
export async function logout(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await supabase.auth.signOut();
  } catch {}
  localStorage.removeItem(SESSION_KEY);
}

// Legacy sync functions for backward compatibility
export function findUser(email: string, password: string): User | null {
  if (typeof window === 'undefined') return null;
  const USERS_KEY = 'supertools_users';
  const users: { email: string; name: string; password: string }[] = JSON.parse(
    localStorage.getItem(USERS_KEY) || '[]'
  );
  const user = users.find((u) => u.email === email && u.password === btoa(password));
  return user ? { email: user.email, name: user.name } : null;
}

export function createUser(email: string, name: string, password: string): boolean {
  if (typeof window === 'undefined') return false;
  const USERS_KEY = 'supertools_users';
  const users: { email: string; name: string; password: string }[] = JSON.parse(
    localStorage.getItem(USERS_KEY) || '[]'
  );
  if (users.find((u) => u.email === email)) return false;
  users.push({ email, name, password: btoa(password) });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return true;
}

// Listen for auth state changes
export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const user: User = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
        provider: session.user.app_metadata?.provider,
        accessToken: session.provider_token || undefined,
      };
      setCurrentUser(user);
      callback(user);
    } else {
      setCurrentUser(null);
      callback(null);
    }
  });
}
