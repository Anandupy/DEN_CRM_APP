'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import { loadMemberPortalSnapshot } from '@/lib/erp/data';
import type { MemberPortalSnapshot } from '@/lib/erp/types';
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Dumbbell,
  MapPin,
  TrendingUp,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function formatDisplayDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MemberDashboardPage() {
  const { profile } = useAuth();
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
        if (active) {
          setSnapshot(nextSnapshot);
        }
      } catch (error) {
        if (active) {
          setLoadError(error instanceof Error ? error.message : 'Unable to load your dashboard right now.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [profile?.id]);

  const member = snapshot?.member ?? null;
  const attendanceLog = snapshot?.attendance ?? [];
  const paymentHistory = snapshot?.payments ?? [];
  const recentAttendance = attendanceLog.slice(0, 7);
  const presentDays = attendanceLog.filter((entry) => entry.status === 'present').length;
  const absentDays = attendanceLog.filter((entry) => entry.status === 'absent').length;
  const totalDays = attendanceLog.length;
  const attendancePct = useMemo(() => {
    if (!member) return 0;
    const parsed = Number.parseInt(member.attendancePct, 10);
    if (!Number.isNaN(parsed)) return parsed;
    return totalDays ? Math.round((presentDays / totalDays) * 100) : 0;
  }, [member, presentDays, totalDays]);

  const daysLeft = useMemo(() => {
    if (!member?.expiryDate) return 0;
    const expiry = new Date(member.expiryDate);
    if (Number.isNaN(expiry.getTime())) return 0;
    return Math.max(0, Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  }, [member?.expiryDate]);

  if (isLoading) {
    return (
      <AppLayout activePath="/member-dashboard">
        <div className="space-y-4 fade-in">
          <h1 className="text-2xl font-bold text-zinc-100">My Dashboard</h1>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-8 text-sm text-zinc-400">
            Loading your live attendance and payment data...
          </div>
        </div>
      </AppLayout>
    );
  }

  if (loadError) {
    return (
      <AppLayout activePath="/member-dashboard">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-8 text-sm text-red-300">
          {loadError}
        </div>
      </AppLayout>
    );
  }

  if (!member) {
    return (
      <AppLayout activePath="/member-dashboard">
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-8 text-sm text-amber-200">
          Your member profile has not been linked yet. Ask the owner to create a `members` record for your account.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout activePath="/member-dashboard">
      <div className="space-y-6 fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Welcome back, {profile?.full_name?.split(' ')[0] ?? 'Member'}</h1>
            <p className="mt-0.5 text-sm text-zinc-500">
              Live fitness overview from Supabase
              <span className="ml-2 text-[11px] uppercase tracking-wide text-amber-500/80">{snapshot?.source === 'supabase' ? 'Live data' : 'Mock fallback'}</span>
            </p>
          </div>
          <Link href="/member-profile" className="btn-secondary text-xs">View Profile</Link>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/20 via-zinc-900 to-zinc-900 p-6">
          <div className="absolute right-0 top-0 h-48 w-48 translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/5" />
          <div className="relative z-10">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-amber-500/80">DEN Fitness · Member Card</p>
                <h2 className="text-xl font-bold text-zinc-100">{member.name}</h2>
                <p className="text-sm text-zinc-400">{member.memberId}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/30 ${member.profileColor}`}>
                <span className="text-lg font-bold">{member.profileInitials}</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Plan', value: member.plan },
                { label: 'Trainer', value: member.trainer },
                { label: 'Joined', value: formatDisplayDate(member.joinDate) },
                { label: 'Expires', value: formatDisplayDate(member.expiryDate) },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">{item.label}</p>
                  <p className="mt-0.5 text-xs font-semibold text-zinc-200">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Attendance %', value: `${attendancePct}%`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Present Days', value: presentDays, icon: UserCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Absent Days', value: absentDays, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
            { label: 'Fees Status', value: member.feesStatus.toUpperCase(), icon: CheckCircle2, color: member.feesStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400', bg: member.feesStatus === 'paid' ? 'bg-emerald-500/10' : 'bg-amber-500/10' },
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

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 xl:col-span-2">
            <h3 className="mb-5 text-sm font-semibold text-zinc-200">Attendance Trend</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={snapshot?.attendanceSeries ?? []}>
                <defs>
                  <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="present" name="Present" stroke="#22c55e" fill="url(#presentGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="mb-4 text-sm font-semibold text-zinc-200">Last 7 Attendance Entries</h3>
            <div className="space-y-2">
              {recentAttendance.length ? recentAttendance.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-lg bg-zinc-800/40 p-2.5">
                  <div>
                    <p className="text-xs font-medium text-zinc-300">{formatDisplayDate(entry.date)}</p>
                    <p className="text-[10px] text-zinc-600">{entry.trainer}</p>
                  </div>
                  {entry.status === 'present'
                    ? <span className="badge badge-active text-[10px]">Present</span>
                    : entry.status === 'late'
                      ? <span className="badge badge-pending text-[10px]">Late</span>
                      : <span className="badge badge-overdue text-[10px]">Absent</span>}
                </div>
              )) : (
                <div className="rounded-lg bg-zinc-800/30 p-3 text-xs text-zinc-500">No attendance has been marked yet.</div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-200">Payment History</h3>
              <Link href="/member-fees" className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300">
                View all <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {paymentHistory.length ? paymentHistory.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{payment.month}</p>
                    <p className="text-xs text-zinc-500">{payment.paymentMode ?? 'Cash'} · {formatDisplayDate(payment.paymentDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-400">₹{payment.amount.toLocaleString('en-IN')}</p>
                    <span className={payment.pendingBalance > 0 ? 'badge badge-pending text-[10px]' : 'badge badge-active text-[10px]'}>
                      {payment.pendingBalance > 0 ? `Due ₹${payment.pendingBalance.toLocaleString('en-IN')}` : 'Settled'}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="rounded-lg bg-zinc-800/30 p-3 text-xs text-zinc-500">No payment history is available yet.</div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="mb-4 text-sm font-semibold text-zinc-200">Gym Information</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg bg-zinc-800/50 p-3">
                <Dumbbell size={14} className="mt-0.5 shrink-0 text-amber-500" />
                <div>
                  <p className="text-xs font-medium text-zinc-400">Your Trainer</p>
                  <p className="text-sm font-semibold text-zinc-200">{member.trainer}</p>
                  <p className="text-xs text-zinc-500">Membership linked trainer assignment</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-zinc-800/50 p-3">
                <Clock size={14} className="mt-0.5 shrink-0 text-amber-500" />
                <div>
                  <p className="text-xs font-medium text-zinc-400">Days Remaining</p>
                  <p className="text-sm text-zinc-200">{daysLeft} days left on your membership</p>
                  <p className="text-xs text-zinc-500">Expires on {formatDisplayDate(member.expiryDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-zinc-800/50 p-3">
                <MapPin size={14} className="mt-0.5 shrink-0 text-amber-500" />
                <div>
                  <p className="text-xs font-medium text-zinc-400">Location</p>
                  <p className="text-xs text-zinc-200">Shop No. 2, New Kailas Niwas 2, Near 90 Feet Rd, Saki Naka, Mumbai 400072</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-zinc-800/50 p-3">
                <Calendar size={14} className="mt-0.5 shrink-0 text-amber-500" />
                <div>
                  <p className="text-xs font-medium text-zinc-400">Membership</p>
                  <p className="text-sm text-zinc-200">{member.plan} Plan</p>
                  <p className="text-xs text-zinc-500">Joined {formatDisplayDate(member.joinDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
