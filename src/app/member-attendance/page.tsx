'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import { loadMemberPortalSnapshot } from '@/lib/erp/data';
import type { MemberPortalSnapshot } from '@/lib/erp/types';
import { Calendar, CheckCircle2, Clock, TrendingUp, XCircle } from 'lucide-react';

function formatDisplayDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MemberAttendancePage() {
  const { profile } = useAuth();
  const [view, setView] = useState<'log' | 'monthly'>('log');
  const [snapshot, setSnapshot] = useState<MemberPortalSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const nextSnapshot = await loadMemberPortalSnapshot(profile?.id);
        if (active) setSnapshot(nextSnapshot);
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : 'Unable to load attendance.');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [profile?.id]);

  const attendanceLog = snapshot?.attendance ?? [];
  const monthlyStats = snapshot?.monthlyAttendance ?? [];
  const presentCount = attendanceLog.filter((entry) => entry.status === 'present').length;
  const absentCount = attendanceLog.filter((entry) => entry.status === 'absent').length;
  const lateCount = attendanceLog.filter((entry) => entry.status === 'late').length;
  const pct = useMemo(() => {
    if (!attendanceLog.length) return 0;
    return Math.round((presentCount / attendanceLog.length) * 100);
  }, [attendanceLog.length, presentCount]);

  const statusIcon = (status: 'present' | 'absent' | 'late') => {
    if (status === 'present') return <CheckCircle2 size={15} className="text-emerald-400" />;
    if (status === 'absent') return <XCircle size={15} className="text-red-400" />;
    return <Clock size={15} className="text-amber-400" />;
  };

  const statusBadge = (status: 'present' | 'absent' | 'late') => {
    if (status === 'present') return <span className="badge badge-active text-[10px]">Present</span>;
    if (status === 'absent') return <span className="badge badge-overdue text-[10px]">Absent</span>;
    return <span className="badge badge-pending text-[10px]">Late</span>;
  };

  if (isLoading) {
    return (
      <AppLayout activePath="/member-attendance">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-8 text-sm text-zinc-400">
          Loading your live attendance log...
        </div>
      </AppLayout>
    );
  }

  if (loadError) {
    return (
      <AppLayout activePath="/member-attendance">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-8 text-sm text-red-300">
          {loadError}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout activePath="/member-attendance">
      <div className="space-y-6 fade-in">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">My Attendance</h1>
          <p className="mt-0.5 text-sm text-zinc-500">Real attendance log and monthly performance summary</p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Attendance %', value: `${pct}%`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Present Days', value: presentCount, icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Absent Days', value: absentCount, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
            { label: 'Late Entries', value: lateCount, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          ].map((stat) => (
            <div key={stat.label} className="metric-card">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">{stat.label}</span>
                <div className={`rounded-lg p-2 ${stat.bg}`}>
                  <stat.icon size={16} className={stat.color} />
                </div>
              </div>
              <p className={`stat-value text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex w-fit items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1">
          {(['log', 'monthly'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setView(option)}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold capitalize transition-all ${
                view === option ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {option === 'log' ? 'Attendance Log' : 'Monthly Summary'}
            </button>
          ))}
        </div>

        {view === 'log' && (
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            <div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-4">
              <Calendar size={15} className="text-amber-500" />
              <h3 className="text-sm font-semibold text-zinc-200">Attendance Log</h3>
            </div>
            <div className="divide-y divide-zinc-800/50">
              {attendanceLog.length ? attendanceLog.map((entry) => {
                if (!entry.status) return null;
                return (
                  <div key={entry.id} className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-zinc-800/20">
                    <div className="flex items-center gap-3">
                      {statusIcon(entry.status)}
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{formatDisplayDate(entry.date)}</p>
                        <p className="text-xs text-zinc-500">{entry.trainer}</p>
                      </div>
                    </div>
                    {statusBadge(entry.status)}
                  </div>
                );
              }) : (
                <div className="px-5 py-6 text-sm text-zinc-500">No attendance entries have been marked yet.</div>
              )}
            </div>
          </div>
        )}

        {view === 'monthly' && (
          <div className="space-y-4">
            {monthlyStats.length ? monthlyStats.map((month) => (
              <div key={month.month} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-200">{month.month}</h3>
                  <span className={`text-sm font-bold ${month.pct >= 75 ? 'text-emerald-400' : month.pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {month.pct}%
                  </span>
                </div>
                <div className="mb-4 h-2 w-full rounded-full bg-zinc-800">
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
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg bg-zinc-800/50 p-2">
                      <p className={`stat-value text-lg font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-[10px] text-zinc-600">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )) : (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-6 text-sm text-zinc-500">
                Monthly attendance summary will appear after attendance starts getting marked.
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
