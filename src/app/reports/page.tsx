'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { BarChart3, Download, Users, CreditCard, UserCheck, TrendingUp, Calendar, AlertCircle, UserPlus, UserX } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

const monthlyRevenue = [
  { month: 'Oct', revenue: 82000, members: 18 },
  { month: 'Nov', revenue: 91000, members: 22 },
  { month: 'Dec', revenue: 78000, members: 19 },
  { month: 'Jan', revenue: 105000, members: 28 },
  { month: 'Feb', revenue: 98000, members: 24 },
  { month: 'Mar', revenue: 112000, members: 31 },
  { month: 'Apr', revenue: 94500, members: 26 },
];

const attendanceMonthly = [
  { month: 'Oct', present: 420, absent: 130 },
  { month: 'Nov', present: 480, absent: 110 },
  { month: 'Dec', present: 390, absent: 160 },
  { month: 'Jan', present: 510, absent: 90 },
  { month: 'Feb', present: 470, absent: 120 },
  { month: 'Mar', present: 530, absent: 80 },
  { month: 'Apr', present: 382, absent: 98 },
];

const membershipPieData = [
  { name: 'Annual', value: 6, color: '#f59e0b' },
  { name: 'Half-Yearly', value: 2, color: '#3b82f6' },
  { name: 'Quarterly', value: 3, color: '#8b5cf6' },
  { name: 'Monthly', value: 1, color: '#22c55e' },
];

const pendingFeesList = [
  { name: 'Vikram Desai', id: 'DEN-003', amount: 12000, overdueDays: 85, status: 'overdue' },
  { name: 'Sunita Rao', id: 'DEN-004', amount: 3500, overdueDays: 2, status: 'overdue' },
  { name: 'Deepak Nair', id: 'DEN-006', amount: 6500, overdueDays: 5, status: 'overdue' },
  { name: 'Rohit Sharma', id: 'DEN-005', amount: 1500, overdueDays: 0, status: 'pending' },
  { name: 'Pooja Mehta', id: 'DEN-007', amount: 3500, overdueDays: 0, status: 'pending' },
];

const newMembersThisMonth = [
  { name: 'Kavya Reddy', id: 'DEN-002', joinDate: '2026-04-09', plan: 'Annual', trainer: 'Priya Sharma' },
  { name: 'Preethi Nair', id: 'DEN-011', joinDate: '2026-04-08', plan: 'Monthly', trainer: 'Suresh Kumar' },
];

const expiredMembers = [
  { name: 'Vikram Desai', id: 'DEN-003', expiredOn: '2026-01-14', plan: 'Annual', daysExpired: 85 },
  { name: 'Rohit Sharma', id: 'DEN-005', expiredOn: '2026-03-31', plan: 'Monthly', daysExpired: 9 },
];

type ReportType = 'overview' | 'attendance' | 'fees' | 'members';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('overview');
  const [period, setPeriod] = useState('April 2026');

  const reportTabs: { key: ReportType; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'attendance', label: 'Attendance', icon: UserCheck },
    { key: 'fees', label: 'Fees & Revenue', icon: CreditCard },
    { key: 'members', label: 'Members', icon: Users },
  ];

  return (
    <AppLayout activePath="/reports">
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Reports</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Comprehensive analytics and exportable reports</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
              <Calendar size={13} className="text-amber-500" />
              <select
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="bg-transparent text-zinc-300 text-xs focus:outline-none"
              >
                {['April 2026', 'March 2026', 'February 2026', 'January 2026'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <button className="btn-secondary text-xs"><Download size={14} /> Export PDF</button>
            <button className="btn-primary text-xs"><Download size={14} /> Export Excel</button>
          </div>
        </div>

        {/* Report Tabs */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 overflow-x-auto">
          {reportTabs.map(tab => (
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

        {/* Overview */}
        {activeReport === 'overview' && (
          <div className="space-y-6">
            {/* KPI Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Revenue (Apr)', value: '₹94,500', change: '+12%', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'Total Members', value: '12', change: '+2 new', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'Avg Attendance', value: '79%', change: '+3%', icon: UserCheck, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: 'Pending Dues', value: '₹23,500', change: '5 members', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
              ].map(stat => (
                <div key={stat.label} className="metric-card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">{stat.label}</span>
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <stat.icon size={16} className={stat.color} />
                    </div>
                  </div>
                  <p className={`text-2xl font-bold stat-value ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-zinc-600 mt-1">{stat.change} vs last month</p>
                </div>
              ))}
            </div>

            {/* Revenue Chart */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-200 mb-5">Monthly Revenue (Last 7 Months)</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Membership Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-zinc-200 mb-5">Membership Plan Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={membershipPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {membershipPieData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend formatter={(v) => <span style={{ color: '#a1a1aa', fontSize: '12px' }}>{v}</span>} />
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

        {/* Attendance Report */}
        {activeReport === 'attendance' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-200 mb-5">Monthly Attendance Report (Last 7 Months)</h3>
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
                <h3 className="text-sm font-semibold text-zinc-200">Daily Attendance — {period}</h3>
                <button className="btn-secondary text-xs"><Download size={13} /> Export</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Month</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Present Days</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Absent Days</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {attendanceMonthly.map(row => (
                      <tr key={row.month} className="table-row-hover">
                        <td className="px-4 py-3 text-zinc-200 font-medium">{row.month} 2025/26</td>
                        <td className="px-4 py-3"><span className="text-emerald-400 font-semibold">{row.present}</span></td>
                        <td className="px-4 py-3"><span className="text-red-400 font-semibold">{row.absent}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 max-w-[80px] bg-zinc-800 rounded-full h-1.5">
                              <div
                                className="bg-amber-500 h-1.5 rounded-full"
                                style={{ width: `${Math.round((row.present / (row.present + row.absent)) * 100)}%` }}
                              />
                            </div>
                            <span className="text-zinc-300 text-xs font-medium">
                              {Math.round((row.present / (row.present + row.absent)) * 100)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Fees Report */}
        {activeReport === 'fees' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-zinc-200">Pending Fees</h3>
                  <span className="badge badge-overdue">{pendingFeesList.length} members</span>
                </div>
                <div className="space-y-3">
                  {pendingFeesList.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <div>
                        <p className="text-zinc-200 text-sm font-medium">{m.name}</p>
                        <p className="text-zinc-500 text-xs">{m.id} · {m.overdueDays > 0 ? `${m.overdueDays} days overdue` : 'Due soon'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-400 font-semibold text-sm">₹{m.amount.toLocaleString('en-IN')}</p>
                        {m.status === 'overdue'
                          ? <span className="badge badge-overdue text-[10px]">Overdue</span>
                          : <span className="badge badge-pending text-[10px]">Pending</span>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-zinc-200 mb-4">Revenue Summary — {period}</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Annual Plans', count: 6, amount: 72000, color: 'text-amber-400' },
                    { label: 'Quarterly Plans', count: 3, amount: 10500, color: 'text-blue-400' },
                    { label: 'Half-Yearly Plans', count: 2, amount: 13000, color: 'text-purple-400' },
                    { label: 'Monthly Plans', count: 1, amount: 1500, color: 'text-emerald-400' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <div>
                        <p className="text-zinc-200 text-sm font-medium">{row.label}</p>
                        <p className="text-zinc-500 text-xs">{row.count} members</p>
                      </div>
                      <p className={`font-semibold text-sm ${row.color}`}>₹{row.amount.toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-amber-300 font-semibold text-sm">Total Collected</p>
                    <p className="text-amber-400 font-bold text-base">₹97,000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Members Report */}
        {activeReport === 'members' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <UserPlus size={15} className="text-emerald-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">New Members — {period}</h3>
                </div>
                <div className="space-y-3">
                  {newMembersThisMonth.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <div>
                        <p className="text-zinc-200 text-sm font-medium">{m.name}</p>
                        <p className="text-zinc-500 text-xs">{m.id} · Joined {m.joinDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-zinc-300 text-xs font-medium">{m.plan}</p>
                        <p className="text-zinc-500 text-xs">{m.trainer}</p>
                      </div>
                    </div>
                  ))}
                  {newMembersThisMonth.length === 0 && (
                    <p className="text-zinc-600 text-sm text-center py-4">No new members this month</p>
                  )}
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <UserX size={15} className="text-red-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">Expired Memberships</h3>
                </div>
                <div className="space-y-3">
                  {expiredMembers.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <div>
                        <p className="text-zinc-200 text-sm font-medium">{m.name}</p>
                        <p className="text-zinc-500 text-xs">{m.id} · Expired {m.expiredOn}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-400 text-xs font-medium">{m.daysExpired} days ago</p>
                        <p className="text-zinc-500 text-xs">{m.plan}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
