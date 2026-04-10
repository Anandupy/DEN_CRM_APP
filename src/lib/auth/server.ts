import type { AppRole, UserProfile } from './types';
import { normalizeRole } from './roles';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function getHeaders(accessToken: string) {
  return {
    apikey: supabaseAnonKey ?? '',
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

async function fetchSupabaseUser(accessToken: string) {
  if (!supabaseUrl || !supabaseAnonKey || !accessToken) return null;

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: getHeaders(accessToken),
    cache: 'no-store',
  });

  if (!response.ok) return null;
  return (await response.json()) as { id: string; email?: string | null; phone?: string | null };
}

async function fetchProfile(accessToken: string, userId: string) {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const response = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=id,full_name,email,phone,role,is_active`,
    {
      headers: getHeaders(accessToken),
      cache: 'no-store',
    }
  );

  if (!response.ok) return null;

  const [profile] = (await response.json()) as Array<{
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    role: string;
    is_active?: boolean;
  }>;

  if (!profile) return null;

  return {
    id: profile.id,
    full_name: profile.full_name,
    email: profile.email,
    phone: profile.phone,
    role: normalizeRole(profile.role) as AppRole,
    is_active: profile.is_active ?? true,
  } satisfies UserProfile;
}

export async function getProfileFromAccessToken(accessToken: string) {
  const user = await fetchSupabaseUser(accessToken);
  if (!user?.id) return null;
  return fetchProfile(accessToken, user.id);
}
