// Shared auth utilities for Super Tools
// Uses consistent localStorage keys across all apps

export interface User {
  email: string;
  name: string;
}

const SESSION_KEY = 'supertools_session';
const USERS_KEY = 'supertools_users';

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return null;
  try {
    return JSON.parse(session) as User;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

export function findUser(email: string, password: string): User | null {
  if (typeof window === 'undefined') return null;
  const users: { email: string; name: string; password: string }[] = JSON.parse(
    localStorage.getItem(USERS_KEY) || '[]'
  );
  const user = users.find((u) => u.email === email && u.password === btoa(password));
  return user ? { email: user.email, name: user.name } : null;
}

export function createUser(email: string, name: string, password: string): boolean {
  if (typeof window === 'undefined') return false;
  const users: { email: string; name: string; password: string }[] = JSON.parse(
    localStorage.getItem(USERS_KEY) || '[]'
  );
  if (users.find((u) => u.email === email)) {
    return false; // User already exists
  }
  users.push({ email, name, password: btoa(password) });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return true;
}
