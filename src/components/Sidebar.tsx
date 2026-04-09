'use client';
import React from 'react';
import Link from 'next/link';
import AppLogo from './ui/AppLogo';
import {
  LayoutDashboard, Users, UserCheck, CreditCard, BarChart3,
  Dumbbell, ChevronLeft, ChevronRight, X, Bell, Settings,
  LogOut, Calendar, FileText, Shield
} from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activePath: string;
  onMobileClose: () => void;
}

const navGroups = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/owner-admin-dashboard', badge: null },
      { label: 'Members', icon: Users, path: '/member-management', badge: '3' },
      { label: 'Attendance', icon: UserCheck, path: '/attendance', badge: null },
      { label: 'Fees', icon: CreditCard, path: '/fees-management', badge: '7' },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Trainers', icon: Dumbbell, path: '/trainers', badge: null },
      { label: 'Reports', icon: BarChart3, path: '/reports', badge: null },
      { label: 'Schedule', icon: Calendar, path: '/schedule', badge: null },
      { label: 'Notices', icon: FileText, path: '/notices', badge: null },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Notifications', icon: Bell, path: '/notifications', badge: '5' },
      { label: 'Settings', icon: Settings, path: '/settings', badge: null },
      { label: 'Access Control', icon: Shield, path: '/access-control', badge: null },
    ],
  },
];

export default function Sidebar({ collapsed, onToggleCollapse, activePath, onMobileClose }: SidebarProps) {
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
              <span className="text-amber-400 text-xs font-bold">RK</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-200 truncate">Rajesh Kumar</p>
              <p className="text-[10px] text-zinc-500 truncate">Owner · Admin</p>
            </div>
            <button
              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <span className="text-amber-400 text-xs font-bold">RK</span>
          </div>
        )}
      </div>
    </div>
  );
}