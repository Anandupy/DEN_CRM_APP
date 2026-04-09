'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Users, UserCheck, UserX, CreditCard, CheckCircle2,
  XCircle, Clock, AlertCircle, Calendar, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

const trainerMembers = [
  { id: 'DEN-001', name: 'Amit Patil', initials: 'AP', color: 'bg-blue-500/20 text-blue-400', plan: 'Annual', feesStatus: 'paid' as const, attendance: null as null | 'present' | 'absent' | 'late', phone: '98765-43210', joinDate: '2025-04-10' },
  { id: 'DEN-002', name: 'Kavya Reddy', initials: 'KR', color: 'bg-pink-500/20 text-pink-400', plan: 'Annual', feesStatus: 'paid' as const, attendance: null as null | 'present' | 'absent' | 'late', phone: '91234-67890', joinDate: '2026-04-09' },
  { id: 'DEN-008', name: 'Arjun Kadam', initials: 'AK', color: 'bg-amber-500/20 text-amber-400', plan: 'Quarterly', feesStatus: 'paid' as const, attendance: null as null | 'present' | 'absent' | 'late', phone: '88765-43210', joinDate: '2026-01-01' },
  { id: 'DEN-009', name: 'Sneha Iyer', initials: 'SI', color: 'bg-teal-500/20 text-teal-400', plan: 'Annual', feesStatus: 'paid' as const, attendance: null as null | 'present' | 'absent' | 'late', phone: '66554-43322', joinDate: '2025-08-20' },
];

const recentActivity = [
  { text: 'Kavya Reddy joined today', time: '9:00 AM', type: 'new' },
  { text: 'Amit Patil marked present', time: '6:30 AM', type: 'attendance' },
  { text: 'Sneha Iyer fee renewed', time: 'Yesterday', type: 'fee' },
  { text: 'Arjun Kadam late entry', time: 'Yesterday', type: 'late' },
];

export default function TrainerDashboardPage() {
  const [members, setMembers] = useState(trainerMembers);

  const markAttendance = (id: string, status: 'present' | 'absent' | 'late') => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, attendance: status } : m));
  };

  const presentCount = members.filter(m => m.attendance === 'present').length;
  const absentCount = members.filter(m => m.attendance === 'absent').length;
  const unmarkedCount = members.filter(m => m.attendance === null).length;

  return (
    <AppLayout activePath="/trainer-dashboard">
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Good Morning, Priya 👋</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Thursday, 09 April 2026 · Your assigned members today</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'My Members', value: members.length, icon: Users, color: 'text-zinc-300', bg: 'bg-zinc-800/50' },
            { label: 'Present Today', value: presentCount, icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Absent Today', value: absentCount, icon: UserX, color: 'text-red-400', bg: 'bg-red-500/10' },
            { label: 'Not Marked', value: unmarkedCount, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          ].map(stat => (
            <div key={stat.label} className="metric-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon size={16} className={stat.color} />
                </div>
              </div>
              <p className={`text-3xl font-bold stat-value ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Attendance Marking */}
          <div className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-amber-500" />
                <h3 className="text-sm font-semibold text-zinc-200">Mark Today&apos;s Attendance</h3>
              </div>
              <span className="text-xs text-zinc-500">09 Apr 2026</span>
            </div>
            <div className="divide-y divide-zinc-800/50">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between px-5 py-4 hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${member.color}`}>
                      {member.initials}
                    </div>
                    <div>
                      <p className="text-zinc-200 font-medium text-sm">{member.name}</p>
                      <p className="text-zinc-600 text-xs">{member.id} · {member.plan}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.attendance && (
                      <span className={`text-xs font-medium ${
                        member.attendance === 'present' ? 'text-emerald-400' :
                        member.attendance === 'absent' ? 'text-red-400' : 'text-amber-400'
                      }`}>
                        {member.attendance.charAt(0).toUpperCase() + member.attendance.slice(1)}
                      </span>
                    )}
                    <button
                      onClick={() => markAttendance(member.id, 'present')}
                      className={`p-1.5 rounded-lg transition-all ${
                        member.attendance === 'present' ?'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :'bg-zinc-800 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                      title="Present"
                    >
                      <CheckCircle2 size={15} />
                    </button>
                    <button
                      onClick={() => markAttendance(member.id, 'absent')}
                      className={`p-1.5 rounded-lg transition-all ${
                        member.attendance === 'absent' ?'bg-red-500/20 text-red-400 border border-red-500/30' :'bg-zinc-800 text-zinc-500 hover:text-red-400 hover:bg-red-500/10'
                      }`}
                      title="Absent"
                    >
                      <XCircle size={15} />
                    </button>
                    <button
                      onClick={() => markAttendance(member.id, 'late')}
                      className={`p-1.5 rounded-lg transition-all ${
                        member.attendance === 'late' ?'bg-amber-500/20 text-amber-400 border border-amber-500/30' :'bg-zinc-800 text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10'
                      }`}
                      title="Late"
                    >
                      <Clock size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Quick Links */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-zinc-200 mb-3">Quick Access</h3>
              <div className="space-y-2">
                {[
                  { label: 'My Members', path: '/trainer-members', icon: Users, color: 'text-blue-400' },
                  { label: 'Add Fee Entry', path: '/trainer-fees', icon: CreditCard, color: 'text-amber-400' },
                  { label: 'Pending Fees', path: '/trainer-fees', icon: AlertCircle, color: 'text-red-400' },
                  { label: 'Attendance List', path: '/trainer-attendance', icon: UserCheck, color: 'text-emerald-400' },
                ].map(link => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className="flex items-center justify-between p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <link.icon size={14} className={link.color} />
                      <span className="text-zinc-300 text-xs font-medium">{link.label}</span>
                    </div>
                    <ChevronRight size={13} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-zinc-200 mb-3">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((act, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      act.type === 'new' ? 'bg-emerald-400' :
                      act.type === 'fee' ? 'bg-amber-400' :
                      act.type === 'late' ? 'bg-orange-400' : 'bg-blue-400'
                    }`} />
                    <div>
                      <p className="text-zinc-300 text-xs">{act.text}</p>
                      <p className="text-zinc-600 text-[10px]">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

