'use client';
import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { BarChart3, Download, Users, CreditCard, UserCheck, TrendingUp, Calendar, AlertCircle, UserPlus, UserX } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { loadErpSnapshot } from '@/lib/erp/data';
import { mockErpSnapshot } from '@/lib/erp/mock-data';
import type { ErpSnapshot } from '@/lib/erp/types';

type ReportType = 'overview' | 'attendance' | 'fees' | 'members';

function getMonthLabel(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function getMonthSortValue(label: string) {
  const parsed = new Date(`1 ${label}`);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function getOverdueDays(dueDate: string) {
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return 0;
  const diff = Date.now() - due.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export default function ReportsPage() {
  const [snapshot, setSnapshot] = useState<ErpSnapshot>(mockErpSnapshot);
  const [activeReport, setActiveReport] = useState<ReportType>('overview');

  useEffect(() => {
    loadErpSnapshot().then(setSnapshot);
  }, []);

  const periodOptions = useMemo(() => {
    const months = new Set<string>();
    snapshot.fees.forEach((fee) => months.add(fee.month));
    snapshot.members.forEach((member) => {
      const label = getMonthLabel(member.joinDate);
      if (label) months.add(label);
    });

    const sorted = [...months].sort((left, right) => getMonthSortValue(right) - getMonthSortValue(left));
    return sorted.length ? sorted : [new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })];
  }, [snapshot]);

  const [period, setPeriod] = useState('');

  useEffect(() => {
    if (!period && periodOptions[0]) {
      setPeriod(periodOptions[0]);
    }
  }, [period, periodOptions]);

  const monthlyRevenue = useMemo(
    () =>
      snapshot.revenueSeries.map((item) => ({
        month: item.month,
        revenue: item.revenue,
        members: snapshot.members.filter((member) => getMonthLabel(member.joinDate) === item.month).length,
      })),
    [snapshot]
  );

  const attendanceMonthly = useMemo(
    () =>
      snapshot.attendanceSeries.map((item) => ({
        month: item.day,
        present: item.present,
        absent: item.absent,
      })),
    [snapshot]
  );

  const membershipPieData = useMemo(() => {
    const palette = ['#f59e0b', '#3b82f6', '#8b5cf6', '#22c55e', '#ef4444', '#06b6d4'];
    const grouped = snapshot.members.reduce<Record<string, number>>((accumulator, member) => {
      accumulator[member.plan] = (accumulator[member.plan] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(grouped).map(([name, value], index) => ({
      name,
      value,
      color: palette[index % palette.length],
    }));
  }, [snapshot.members]);

  const pendingFeesList = useMemo(
    () =>
      snapshot.fees
        .filter((fee) => fee.status !== 'paid')
        .sort((left, right) => getOverdueDays(right.dueDate) - getOverdueDays(left.dueDate))
        .slice(0, 5)
        .map((fee) => ({
          name: fee.memberName,
          id: fee.memberId,
          amount: fee.amount - fee.paidAmount,
          overdueDays: getOverdueDays(fee.dueDate),
          status: fee.status,
        })),
    [snapshot.fees]
  );

  const newMembersThisMonth = useMemo(
    () =>
      snapshot.members
        .filter((member) => getMonthLabel(member.joinDate) === period)
        .map((member) => ({
          name: member.name,
          id: member.memberId,
          joinDate: member.joinDate,
          plan: member.plan,
          trainer: member.trainer,
        })),
    [snapshot.members, period]
  );

  const expiredMembers = useMemo(
    () =>
      snapshot.members
        .filter((member) => member.status === 'expired' || member.expiryDate < new Date().toISOString().split('T')[0])
        .map((member) => ({
          name: member.name,
          id: member.memberId,
          expiredOn: member.expiryDate,
          plan: member.plan,
          daysExpired: getOverdueDays(member.expiryDate),
        }))
        .sort((left, right) => right.daysExpired - left.daysExpired)
        .slice(0, 5),
    [snapshot.members]
  );

  const revenueSummaryByPlan = useMemo(() => {
    const grouped = snapshot.fees
      .filter((fee) => fee.status === 'paid' && fee.month === period)
      .reduce<Record<string, { count: number; amount: number }>>((accumulator, fee) => {
        const bucket = accumulator[fee.plan] ?? { count: 0, amount: 0 };
        bucket.count += 1;
        bucket.amount += fee.paidAmount;
        accumulator[fee.plan] = bucket;
        return accumulator;
      }, {});

    return snapshot.planPricing.map((plan, index) => ({
      label: `${plan.plan} Plans`,
      count: grouped[plan.plan]?.count ?? 0,
      amount: grouped[plan.plan]?.amount ?? 0,
      color: ['text-amber-400', 'text-blue-400', 'text-purple-400', 'text-emerald-400'][index % 4],
    }));
  }, [snapshot.fees, snapshot.planPricing, period]);

  const totalRevenueForPeriod = revenueSummaryByPlan.reduce((sum, row) => sum + row.amount, 0);
  const totalPendingAmount = snapshot.fees
    .filter((fee) => fee.status !== 'paid')
    .reduce((sum, fee) => sum + (fee.amount - fee.paidAmount), 0);

  const reportTabs: { key: ReportType; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'attendance', label: 'Attendance', icon: UserCheck },
    { key: 'fees', label: 'Fees & Revenue', icon: CreditCard },
    { key: 'members', label: 'Members', icon: Users },
  ];

  return (
    <AppLayout activePath="/reports">
      <div className="space-y-6 fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Reports</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Comprehensive analytics and exportable reports
              <span className="ml-2 text-[11px] uppercase tracking-wide text-amber-500/80">
                {snapshot.source === 'supabase' ? 'Live master data' : 'Mock fallback'}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
              <Calendar size={13} className="text-amber-500" />
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                className="bg-transparent text-zinc-300 text-xs focus:outline-none"
              >
                {periodOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <button className="btn-secondary text-xs"><Download size={14} /> Export PDF</button>
            <button className="btn-primary text-xs"><Download size={14} /> Export Excel</button>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 overflow-x-auto">
          {reportTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveReport(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeReport === tab.key ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeReport === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: `Total Revenue (${period})`, value: `₹${totalRevenueForPeriod.toLocaleString('en-IN')}`, change: `${revenueSummaryByPlan.reduce((sum, row) => sum + row.count, 0)} payments`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'Total Members', value: String(snapshot.members.length), change: `${newMembersThisMonth.length} new`, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'Avg Attendance', value: `${Math.round(snapshot.dashboard.attendanceRateToday)}%`, change: `${snapshot.dashboard.presentToday} present`, icon: UserCheck, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: 'Pending Dues', value: `₹${totalPendingAmount.toLocaleString('en-IN')}`, change: `${pendingFeesList.length} members`, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
              ].map((stat) => (
                <div key={stat.label} className="metric-card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">{stat.label}</span>
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <stat.icon size={16} className={stat.color} />
                    </div>
                  </div>
                  <p className={`text-2xl font-bold stat-value ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-zinc-600 mt-1">{stat.change}</p>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-200 mb-5">Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-zinc-200 mb-5">Membership Plan Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={membershipPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {membershipPieData.map((entry, index) => (
                        <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend formatter={(value) => <span style={{ color: '#a1a1aa', fontSize: '12px' }}>{value}</span>} />
                    <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-zinc-200 mb-5">New Members Trend</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="members" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeReport === 'attendance' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-200 mb-5">Attendance Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={attendanceMonthly} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="present" name="Present" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-200">Recent Attendance Buckets</h3>
                <button className="btn-secondary text-xs"><Download size={13} /> Export</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Present</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Absent</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {attendanceMonthly.map((row) => {
                      const total = row.present + row.absent;
                      const pct = total ? Math.round((row.present / total) * 100) : 0;
                      return (
                        <tr key={row.month} className="table-row-hover">
                          <td className="px-4 py-3 text-zinc-200 font-medium">{row.month}</td>
                          <td className="px-4 py-3"><span className="text-emerald-400 font-semibold">{row.present}</span></td>
                          <td className="px-4 py-3"><span className="text-red-400 font-semibold">{row.absent}</span></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 max-w-[80px] bg-zinc-800 rounded-full h-1.5">
                                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-zinc-300 text-xs font-medium">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeReport === 'fees' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-zinc-200">Pending Fees</h3>
                  <span className="badge badge-overdue">{pendingFeesList.length} members</span>
                </div>
                <div className="space-y-3">
                  {pendingFeesList.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <div>
                        <p className="text-zinc-200 text-sm font-medium">{member.name}</p>
                        <p className="text-zinc-500 text-xs">{member.id} · {member.overdueDays > 0 ? `${member.overdueDays} days overdue` : 'Due soon'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-400 font-semibold text-sm">₹{member.amount.toLocaleString('en-IN')}</p>
                        {member.status === 'overdue'
                          ? <span className="badge badge-overdue text-[10px]">Overdue</span>
                          : <span className="badge badge-pending text-[10px]">Pending</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-zinc-200 mb-4">Revenue Summary — {period}</h3>
                <div className="space-y-3">
                  {revenueSummaryByPlan.map((row) => (
                    <div key={row.label} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <div>
                        <p className="text-zinc-200 text-sm font-medium">{row.label}</p>
                        <p className="text-zinc-500 text-xs">{row.count} payments</p>
                      </div>
                      <p className={`font-semibold text-sm ${row.color}`}>₹{row.amount.toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-amber-300 font-semibold text-sm">Total Collected</p>
                    <p className="text-amber-400 font-bold text-base">₹{totalRevenueForPeriod.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeReport === 'members' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <UserPlus size={15} className="text-emerald-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">New Members — {period}</h3>
                </div>
                <div className="space-y-3">
                  {newMembersThisMonth.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <div>
                        <p className="text-zinc-200 text-sm font-medium">{member.name}</p>
                        <p className="text-zinc-500 text-xs">{member.id} · Joined {member.joinDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-zinc-300 text-xs font-medium">{member.plan}</p>
                        <p className="text-zinc-500 text-xs">{member.trainer}</p>
                      </div>
                    </div>
                  ))}
                  {newMembersThisMonth.length === 0 && (
                    <p className="text-zinc-600 text-sm text-center py-4">No new members for this period</p>
                  )}
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <UserX size={15} className="text-red-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">Expired Memberships</h3>
                </div>
                <div className="space-y-3">
                  {expiredMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <div>
                        <p className="text-zinc-200 text-sm font-medium">{member.name}</p>
                        <p className="text-zinc-500 text-xs">{member.id} · Expired {member.expiredOn}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-400 text-xs font-medium">{member.daysExpired} days ago</p>
                        <p className="text-zinc-500 text-xs">{member.plan}</p>
                      </div>
                    </div>
                  ))}
                  {expiredMembers.length === 0 && (
                    <p className="text-zinc-600 text-sm text-center py-4">No expired memberships</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
