'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { UserCheck, Calendar, Dumbbell, Clock, MapPin, TrendingUp, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const memberInfo = {
  name: 'Amit Patil',
  memberId: 'DEN-001',
  initials: 'AP',
  plan: 'Annual',
  trainer: 'Priya Sharma',
  joinDate: '10 Apr 2025',
  expiryDate: '09 Apr 2026',
  daysLeft: 0,
  phone: '98765-43210',
  email: 'amit.patil@gmail.com',
  address: 'Flat 4B, Andheri West, Mumbai',
  feesStatus: 'paid' as const,
  lastPaid: '01 Apr 2026',
  lastAmount: 12000,
  attendancePct: 78,
  presentDays: 18,
  absentDays: 5,
  totalDays: 23,
};

const attendanceData = [
  { week: 'W1', present: 5, absent: 1 },
  { week: 'W2', present: 4, absent: 2 },
  { week: 'W3', present: 6, absent: 0 },
  { week: 'W4', present: 3, absent: 2 },
];

const paymentHistory = [
  { month: 'April 2026', amount: 12000, mode: 'UPI', date: '01 Apr 2026', status: 'paid' },
  { month: 'April 2025', amount: 12000, mode: 'UPI', date: '10 Apr 2025', status: 'paid' },
];

const recentAttendance = [
  { date: '09 Apr', day: 'Thu', status: 'present' as const },
  { date: '08 Apr', day: 'Wed', status: 'present' as const },
  { date: '07 Apr', day: 'Tue', status: 'absent' as const },
  { date: '06 Apr', day: 'Mon', status: 'present' as const },
  { date: '05 Apr', day: 'Sun', status: 'absent' as const },
  { date: '04 Apr', day: 'Sat', status: 'present' as const },
  { date: '03 Apr', day: 'Fri', status: 'present' as const },
];

export default function MemberDashboardPage() {
  const daysLeftPct = Math.max(0, Math.min(100, (memberInfo.daysLeft / 365) * 100));

  return (
    <AppLayout activePath="/member-dashboard">
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Welcome back, Amit 👋</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Thursday, 09 April 2026 · Your fitness overview</p>
          </div>
          <Link href="/member-profile" className="btn-secondary text-xs">View Profile</Link>
        </div>

        {/* Membership Card */}
        <div className="bg-gradient-to-br from-amber-500/20 via-zinc-900 to-zinc-900 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-amber-500/80 font-medium uppercase tracking-wider mb-1">DEN Fitness · Member Card</p>
                <h2 className="text-xl font-bold text-zinc-100">{memberInfo.name}</h2>
                <p className="text-zinc-400 text-sm">{memberInfo.memberId}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <span className="text-amber-400 font-bold text-lg">{memberInfo.initials}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              {[
                { label: 'Plan', value: memberInfo.plan },
                { label: 'Trainer', value: memberInfo.trainer },
                { label: 'Joined', value: memberInfo.joinDate },
                { label: 'Expires', value: memberInfo.expiryDate },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{item.label}</p>
                  <p className="text-zinc-200 text-xs font-semibold mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Attendance %', value: `${memberInfo.attendancePct}%`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Present Days', value: memberInfo.presentDays, icon: UserCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Absent Days', value: memberInfo.absentDays, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
            { label: 'Fees Status', value: 'Paid', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
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
          {/* Attendance Chart */}
          <div className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-5">Attendance This Month</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={attendanceData}>
                <defs>
                  <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="present" name="Present" stroke="#22c55e" fill="url(#presentGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Attendance */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4">Last 7 Days</h3>
            <div className="space-y-2">
              {recentAttendance.map(day => (
                <div key={day.date} className="flex items-center justify-between p-2.5 bg-zinc-800/40 rounded-lg">
                  <div>
                    <p className="text-zinc-300 text-xs font-medium">{day.date}</p>
                    <p className="text-zinc-600 text-[10px]">{day.day}</p>
                  </div>
                  {day.status === 'present'
                    ? <span className="badge badge-active text-[10px]">Present</span>
                    : <span className="badge badge-overdue text-[10px]">Absent</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment History */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-200">Payment History</h3>
              <Link href="/member-fees" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
                View all <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {paymentHistory.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div>
                    <p className="text-zinc-200 text-sm font-medium">{p.month}</p>
                    <p className="text-zinc-500 text-xs">{p.mode} · {p.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-semibold text-sm">₹{p.amount.toLocaleString('en-IN')}</p>
                    <span className="badge badge-active text-[10px]">Paid</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gym Info */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4">Gym Information</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <Dumbbell size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-zinc-400 text-xs font-medium">Your Trainer</p>
                  <p className="text-zinc-200 text-sm font-semibold">{memberInfo.trainer}</p>
                  <p className="text-zinc-500 text-xs">Weight Training & Cardio</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <Clock size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-zinc-400 text-xs font-medium">Gym Timings</p>
                  <p className="text-zinc-200 text-sm">Mon–Sat: 6:00 AM – 10:00 PM</p>
                  <p className="text-zinc-500 text-xs">Sunday: 7:00 AM – 1:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <MapPin size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-zinc-400 text-xs font-medium">Location</p>
                  <p className="text-zinc-200 text-xs">Shop No. 2, New Kailas Niwas 2, Near 90 Feet Rd, Saki Naka, Mumbai 400072</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <Calendar size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-zinc-400 text-xs font-medium">Membership</p>
                  <p className="text-zinc-200 text-sm">{memberInfo.plan} Plan</p>
                  <p className="text-zinc-500 text-xs">Expires: {memberInfo.expiryDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
