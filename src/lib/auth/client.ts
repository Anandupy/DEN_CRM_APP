'use client';

import type { Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { UserProfile } from './types';
import { normalizeRole } from './roles';

export async function fetchProfileByUserId(userId: string): Promise<UserProfile | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return null;

  const withActive = await client
    .from('profiles')
    .select('id, full_name, email, phone, role, is_active')
    .eq('id', userId)
    .single();
  if (!withActive.error && withActive.data) {
    return {
      ...(withActive.data as Omit<UserProfile, 'is_active'> & { is_active?: boolean }),
      role: normalizeRole(String(withActive.data.role)),
      is_active: withActive.data.is_active ?? true,
    };
  }

  const withoutActive = await client
    .from('profiles')
    .select('id, full_name, email, phone, role')
    .eq('id', userId)
    .single();

  if (withoutActive.error || !withoutActive.data) return null;

  return {
    ...(withoutActive.data as Omit<UserProfile, 'is_active'>),
    role: normalizeRole(String(withoutActive.data.role)),
    is_active: true,
  };
}

export async function signInWithSupabase(email: string, password: string) {
  const client = getSupabaseBrowserClient();

  if (!client) {
    return {
      error: new Error('Supabase is not configured. Add your project URL and publishable key in .env to enable auth.'),
      data: null,
    };
  }

  return client.auth.signInWithPassword({ email, password });
}

export async function signOutFromSupabase() {
  const client = getSupabaseBrowserClient();
  if (!client) return;
  await client.auth.signOut();
  await fetch('/api/auth/session', { method: 'DELETE' });
}

export async function getCurrentSession(): Promise<Session | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session;
}

export async function syncSessionCookies(session: Session | null) {
  if (!session?.access_token || !session.refresh_token) {
    await fetch('/api/auth/session', { method: 'DELETE' });
    return;
  }

  await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
    }),
  });
}
