'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { fetchProfileByUserId, signOutFromSupabase, syncSessionCookies } from '@/lib/auth/client';
import type { UserProfile } from '@/lib/auth/types';

interface AuthContextValue {
  loading: boolean;
  session: Session | null;
  profile: UserProfile | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(isSupabaseConfigured());
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const refreshProfile = async () => {
    if (!session?.user?.id) {
      setProfile(null);
      return;
    }

    const currentProfile = await fetchProfileByUserId(session.user.id);
    setProfile(currentProfile);
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const client = getSupabaseBrowserClient();
    if (!client) {
      setLoading(false);
      return;
    }

    client.auth.getSession().then(async ({ data }) => {
      const activeSession = data.session;
      await syncSessionCookies(activeSession);
      setSession(activeSession);
      if (activeSession?.user?.id) {
        const currentProfile = await fetchProfileByUserId(activeSession.user.id);
        setProfile(currentProfile);
      }
      setLoading(false);
    });

    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      syncSessionCookies(nextSession);
      if (!nextSession?.user?.id) {
        setProfile(null);
        setLoading(false);
        return;
      }

      fetchProfileByUserId(nextSession.user.id).then((currentProfile) => {
        setProfile(currentProfile);
        setLoading(false);
      });
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await signOutFromSupabase();
    setSession(null);
    setProfile(null);
  };

  const value = useMemo(
    () => ({
      loading,
      session,
      profile,
      refreshProfile,
      signOut,
    }),
    [loading, session, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
