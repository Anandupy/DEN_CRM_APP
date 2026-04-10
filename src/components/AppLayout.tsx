'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { getHomeRouteForRole, canAccessRoute, getLegacyRedirect } from '@/lib/auth/roles';
import { isSupabaseConfigured } from '@/lib/supabase/client';

interface AppLayoutProps {
  children: React.ReactNode;
  activePath?: string;
}

export default function AppLayout({ children, activePath = '' }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { loading, session, profile } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const resolvedActivePath = getLegacyRedirect(pathname) ?? pathname ?? activePath;

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    if (loading) return;

    if (!session || !profile) {
      router.replace('/sign-in');
      return;
    }

    if (!canAccessRoute(profile.role, resolvedActivePath)) {
      router.replace(getHomeRouteForRole(profile.role));
    }
  }, [loading, session, profile, resolvedActivePath, router]);

  if (isSupabaseConfigured() && (loading || !session || !profile || !canAccessRoute(profile.role, resolvedActivePath))) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <div className="w-5 h-5 border-2 border-zinc-700 border-t-amber-500 rounded-full animate-spin" />
          Loading your workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative z-40 h-full transition-all duration-300 ease-in-out
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'w-16' : 'w-60'}
        `}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          activePath={resolvedActivePath}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMobileMenuOpen={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-zinc-950 px-4 lg:px-6 xl:px-8 2xl:px-10 py-6">
          <div className="max-w-screen-2xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
