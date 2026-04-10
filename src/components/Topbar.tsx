'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Menu, Search, Bell, MapPin, Clock } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatRoleLabel } from '@/lib/auth/roles';

interface TopbarProps {
  onMobileMenuOpen: () => void;
}

export default function Topbar({ onMobileMenuOpen }: TopbarProps) {
  const { profile } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const formattedDate = useMemo(
    () => currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }),
    [currentTime]
  );
  const formattedTime = useMemo(
    () => currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    [currentTime]
  );

  return (
    <header className="h-16 bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 flex items-center px-4 lg:px-6 gap-4 shrink-0 sticky top-0 z-20">
      {/* Mobile menu button */}
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className={`flex-1 max-w-sm ${searchOpen ? 'flex' : 'hidden lg:flex'}`}>
        <div className="relative w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search members, fees, trainers..."
            className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/40 focus:border-amber-500/30 transition-all"
          />
        </div>
      </div>

      <button
        className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
        onClick={() => setSearchOpen(!searchOpen)}
      >
        <Search size={20} />
      </button>

      <div className="flex-1 lg:flex-none" />

      {profile && (
        <div className="hidden lg:flex flex-col items-end border-r border-zinc-800 pr-4 mr-1">
          <span className="text-xs font-semibold text-zinc-200">{profile.full_name}</span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wide">{formatRoleLabel(profile.role)}</span>
        </div>
      )}

      {/* Gym info */}
      <div className="hidden xl:flex items-center gap-1.5 text-xs text-zinc-500 border-r border-zinc-800 pr-4 mr-1">
        <MapPin size={12} className="text-amber-500/60" />
        <span>Saki Naka, Mumbai</span>
        <span className="mx-1.5 text-zinc-700">·</span>
        <Clock size={12} className="text-amber-500/60" />
        <span>6:00 AM – 10:00 PM</span>
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
      </button>

      {/* Date */}
      <div className="hidden md:flex flex-col items-end">
        <span className="text-xs font-semibold text-zinc-300">{formattedDate}</span>
        <span className="text-[10px] text-zinc-600">{formattedTime}</span>
      </div>
    </header>
  );
}
