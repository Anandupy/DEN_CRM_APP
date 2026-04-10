'use client';
import React from 'react';
import Link from 'next/link';
import AppLogo from './ui/AppLogo';
import {
  LayoutDashboard, Users, UserCheck, CreditCard, BarChart3,
  Dumbbell, ChevronLeft, ChevronRight, X, Bell, Settings,
  LogOut, Calendar, FileText, Shield
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatRoleLabel } from '@/lib/auth/roles';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import type { AppRole } from '@/lib/auth/types';


interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activePath: string;
  onMobileClose: () => void;
}

const ownerNavGroups = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/owner/dashboard', badge: null },
      { label: 'Members', icon: Users, path: '/owner/members', badge: null },
      { label: 'Attendance', icon: UserCheck, path: '/owner/attendance', badge: null },
      { label: 'Fees', icon: CreditCard, path: '/owner/fees', badge: null },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Trainers', icon: Dumbbell, path: '/owner/trainers', badge: null },
      { label: 'Trainer Salary', icon: CreditCard, path: '/owner/salaries', badge: null },
      { label: 'Supplements', icon: FileText, path: '/owner/supplements', badge: null },
      { label: 'Reports', icon: BarChart3, path: '/owner/reports', badge: null },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Notifications', icon: Bell, path: '/owner/notifications', badge: null },
      { label: 'Settings', icon: Settings, path: '/owner/settings', badge: null },
      { label: 'Access Control', icon: Shield, path: '/owner/access-control', badge: null },
    ],
  },
];

const seniorTrainerNavGroups = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/senior/dashboard', badge: null },
      { label: 'Members', icon: Users, path: '/senior/members', badge: null },
      { label: 'Attendance', icon: UserCheck, path: '/senior/attendance', badge: null },
      { label: 'Fees', icon: CreditCard, path: '/senior/fees', badge: null },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Trainers', icon: Dumbbell, path: '/senior/trainers', badge: null },
      { label: 'Reports', icon: BarChart3, path: '/senior/reports', badge: null },
      { label: 'Notifications', icon: Bell, path: '/senior/notifications', badge: null },
    ],
  },
];

const trainerNavGroups = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/trainer/dashboard', badge: null },
      { label: 'My Members', icon: Users, path: '/trainer/members', badge: null },
      { label: 'Attendance', icon: UserCheck, path: '/trainer/attendance', badge: null },
      { label: 'Fees', icon: CreditCard, path: '/trainer/fees', badge: null },
      { label: 'Schedule', icon: Calendar, path: '/trainer/schedule', badge: null },
    ],
  },
];

const memberNavGroups = [
  {
    label: 'My Space',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/member/dashboard', badge: null },
      { label: 'My Plan', icon: CreditCard, path: '/member/plan', badge: null },
      { label: 'My Payments', icon: CreditCard, path: '/member/payments', badge: null },
      { label: 'Attendance', icon: UserCheck, path: '/member/attendance', badge: null },
      { label: 'Profile', icon: Users, path: '/member/profile', badge: null },
    ],
  },
];

function getNavGroups(role: AppRole | null | undefined) {
  if (role === 'senior_trainer') return seniorTrainerNavGroups;
  if (role === 'trainer') return trainerNavGroups;
  if (role === 'member') return memberNavGroups;
  return ownerNavGroups;
}

export default function Sidebar({ collapsed, onToggleCollapse, activePath, onMobileClose }: SidebarProps) {
  const { profile, signOut } = useAuth();
  const navGroups = getNavGroups(profile?.role);
  const initials = profile?.full_name
    ?.split(' ')
    .map((part) => part[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'RK';

  return (
    <div className="h-full bg-zinc-900 border-r border-zinc-800 flex flex-col select-none">
      {/* Header */}
      <div className={`flex items-center h-16 px-3 border-b border-zinc-800 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <AppLogo size={32} />
            <span className="font-bold text-base text-zinc-100 truncate tracking-tight">DEN Fitness</span>
          </div>
        )}
        {collapsed && <AppLogo size={32} />}

        <div className="flex items-center gap-1">
          {/* Mobile close */}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <X size={16} />
          </button>
          {/* Collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map((group) => (
          <div key={`group-${group.label}`}>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-3 mb-1.5">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = activePath === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={`nav-${item.path}`}
                    href={item.path}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span className="bg-amber-500/20 text-amber-400 text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User profile */}
      <div className={`border-t border-zinc-800 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <span className="text-amber-400 text-xs font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-200 truncate">{profile?.full_name ?? 'Rajesh Kumar'}</p>
              <p className="text-[10px] text-zinc-500 truncate">
                {profile ? formatRoleLabel(profile.role) : 'Owner'} {profile?.is_active === false ? '· Inactive' : ''}
              </p>
            </div>
            <button
              onClick={() => {
                if (isSupabaseConfigured()) {
                  signOut();
                }
              }}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <span className="text-amber-400 text-xs font-bold">{initials}</span>
          </div>
        )}
      </div>
    </div>
  );
}
