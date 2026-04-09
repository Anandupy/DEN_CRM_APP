'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Calendar, TrendingUp, CheckCircle2, XCircle, Clock } from 'lucide-react';

const attendanceLog = [
  { date: '2026-04-09', status: 'present' as const, time: '6:32 AM' },
  { date: '2026-04-08', status: 'present' as const, time: '6:45 AM' },
  { date: '2026-04-07', status: 'absent' as const, time: null },
  { date: '2026-04-06', status: 'present' as const, time: '7:10 AM' },
  { date: '2026-04-05', status: 'absent' as const, time: null },
  { date: '2026-04-04', status: 'present' as const, time: '6:28 AM' },
  { date: '2026-04-03', status: 'present' as const, time: '6:55 AM' },
  { date: '2026-04-02', status: 'late' as const, time: '8:20 AM' },
  { date: '2026-04-01', status: 'present' as const, time: '6:40 AM' },
  { date: '2026-03-31', status: 'present' as const, time: '6:30 AM' },
  { date: '2026-03-30', status: 'present' as const, time: '7:00 AM' },
  { date: '2026-03-29', status: 'absent' as const, time: null },
  { date: '2026-03-28', status: 'present' as const, time: '6:50 AM' },
  { date: '2026-03-27', status: 'present' as const, time: '6:35 AM' },
];

const monthlyStats = [
  { month: 'April 2026', present: 7, absent: 2, late: 1, total: 10, pct: 70 },
  { month: 'March 2026', present: 20, absent: 5, late: 2, total: 27, pct: 74 },
  { month: 'February 2026', present: 18, absent: 6, late: 1, total: 25, pct: 72 },
  { month: 'January 2026', present: 22, absent: 4, late: 0, total: 26, pct: 85 },
];

export default function MemberAttendancePage() {
  const [view, setView] = useState<'log' | 'monthly'>('log');

  const presentCount = attendanceLog.filter(a => a.status === 'present').length;
  const absentCount = attendanceLog.filter(a => a.status === 'absent').length;
  const lateCount = attendanceLog.filter(a => a.status === 'late').length;
  const pct = Math.round((presentCount / attendanceLog.length) * 100);

  const statusIcon = (s: 'present' | 'absent' | 'late') => {
    if (s === 'present') return <CheckCircle2 size={15} className="text-emerald-400" />;
    if (s === 'absent') return <XCircle size={15} className="text-red-400" />;
    return <Clock size={15} className="text-amber-400" />;
  };

  const statusBadge = (s: 'present' | 'absent' | 'late') => {
    if (s === 'present') return <span className="badge badge-active text-[10px]">Present</span>;
    if (s === 'absent') return <span className="badge badge-overdue text-[10px]">Absent</span>;
    return <span className="badge badge-pending text-[10px]">Late</span>;
  };

  return (
    <AppLayout activePath="/member-attendance">
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">My Attendance</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Your personal attendance history and monthly stats</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Attendance %', value: `${pct}%`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Present Days', value: presentCount, icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Absent Days', value: absentCount, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
            { label: 'Late Entries', value: lateCount, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
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

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
          {(['log', 'monthly'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                view === v ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {v === 'log' ? 'Attendance Log' : 'Monthly Summary'}
            </button>
          ))}
        </div>

        {view === 'log' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
              <Calendar size={15} className="text-amber-500" />
              <h3 className="text-sm font-semibold text-zinc-200">Recent Attendance Log</h3>
            </div>
            <div className="divide-y divide-zinc-800/50">
              {attendanceLog.map(entry => (
                <div key={entry.date} className="flex items-center justify-between px-5 py-3.5 hover:bg-zinc-800/20 transition-colors">
                  <div className="flex items-center gap-3">
                    {statusIcon(entry.status)}
                    <div>
                      <p className="text-zinc-200 text-sm font-medium">{entry.date}</p>
                      {entry.time && <p className="text-zinc-500 text-xs">Check-in: {entry.time}</p>}
                      {!entry.time && <p className="text-zinc-600 text-xs">No check-in recorded</p>}
                    </div>
                  </div>
                  {statusBadge(entry.status)}
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'monthly' && (
          <div className="space-y-4">
            {monthlyStats.map(month => (
              <div key={month.month} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-zinc-200">{month.month}</h3>
                  <span className={`text-sm font-bold ${month.pct >= 75 ? 'text-emerald-400' : month.pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {month.pct}%
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2 mb-4">
                  <div
                    className={`h-2 rounded-full ${month.pct >= 75 ? 'bg-emerald-500' : month.pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${month.pct}%` }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-3 text-center">
                  {[
                    { label: 'Total', value: month.total, color: 'text-zinc-300' },
                    { label: 'Present', value: month.present, color: 'text-emerald-400' },
                    { label: 'Absent', value: month.absent, color: 'text-red-400' },
                    { label: 'Late', value: month.late, color: 'text-amber-400' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-zinc-800/50 rounded-lg p-2">
                      <p className={`text-lg font-bold stat-value ${stat.color}`}>{stat.value}</p>
                      <p className="text-zinc-600 text-[10px]">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
