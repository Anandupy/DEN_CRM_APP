'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { UserCheck, UserX, Calendar, Search, Filter, Download, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, Users, BarChart2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];

const members = [
  { id: 'DEN-001', name: 'Amit Patil', trainer: 'Priya Sharma', initials: 'AP', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'DEN-002', name: 'Kavya Reddy', trainer: 'Priya Sharma', initials: 'KR', color: 'bg-pink-500/20 text-pink-400' },
  { id: 'DEN-003', name: 'Vikram Desai', trainer: 'Suresh Kumar', initials: 'VD', color: 'bg-orange-500/20 text-orange-400' },
  { id: 'DEN-004', name: 'Sunita Rao', trainer: 'Anjali Mehta', initials: 'SR', color: 'bg-emerald-500/20 text-emerald-400' },
  { id: 'DEN-005', name: 'Rohit Sharma', trainer: 'Ravi Pillai', initials: 'RS', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'DEN-006', name: 'Deepak Nair', trainer: 'Suresh Kumar', initials: 'DN', color: 'bg-cyan-500/20 text-cyan-400' },
  { id: 'DEN-007', name: 'Pooja Mehta', trainer: 'Anjali Mehta', initials: 'PM', color: 'bg-rose-500/20 text-rose-400' },
  { id: 'DEN-008', name: 'Arjun Kadam', trainer: 'Priya Sharma', initials: 'AK', color: 'bg-amber-500/20 text-amber-400' },
  { id: 'DEN-009', name: 'Sneha Iyer', trainer: 'Priya Sharma', initials: 'SI', color: 'bg-teal-500/20 text-teal-400' },
  { id: 'DEN-010', name: 'Manish Sharma', trainer: 'Ravi Pillai', initials: 'MS', color: 'bg-indigo-500/20 text-indigo-400' },
  { id: 'DEN-011', name: 'Preethi Nair', trainer: 'Suresh Kumar', initials: 'PN', color: 'bg-green-500/20 text-green-400' },
  { id: 'DEN-012', name: 'Santosh Kulkarni', trainer: 'Deepika Nair', initials: 'SK', color: 'bg-lime-500/20 text-lime-400' },
];

type AttendanceStatus = 'present' | 'absent' | 'late' | null;

const initialAttendance: Record<string, AttendanceStatus> = {
  'DEN-001': 'present', 'DEN-002': 'present', 'DEN-003': 'absent',
  'DEN-004': 'present', 'DEN-005': 'late', 'DEN-006': 'absent',
  'DEN-007': 'present', 'DEN-008': 'present', 'DEN-009': 'present',
  'DEN-010': 'late', 'DEN-011': 'present', 'DEN-012': 'absent',
};

const weeklyData = [
  { day: 'Mon', present: 18, absent: 6 },
  { day: 'Tue', present: 22, absent: 4 },
  { day: 'Wed', present: 20, absent: 6 },
  { day: 'Thu', present: 19, absent: 7 },
  { day: 'Fri', present: 24, absent: 2 },
  { day: 'Sat', present: 28, absent: 4 },
  { day: 'Sun', present: 12, absent: 8 },
];

const monthlyData = [
  { week: 'W1', present: 118, absent: 32 },
  { week: 'W2', present: 124, absent: 26 },
  { week: 'W3', present: 110, absent: 40 },
  { week: 'W4', present: 130, absent: 20 },
];

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(formatDate(today));
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(initialAttendance);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [filterTrainer, setFilterTrainer] = useState('All');

  const trainers = ['All', 'Priya Sharma', 'Suresh Kumar', 'Anjali Mehta', 'Ravi Pillai', 'Deepika Nair'];

  const filtered = members.filter(m =>
    (filterTrainer === 'All' || m.trainer === filterTrainer) &&
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = Object.values(attendance).filter(v => v === 'present').length;
  const absentCount = Object.values(attendance).filter(v => v === 'absent').length;
  const lateCount = Object.values(attendance).filter(v => v === 'late').length;

  const markAttendance = (id: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(formatDate(d));
  };

  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(formatDate(d));
  };

  const statusBadge = (status: AttendanceStatus) => {
    if (status === 'present') return <span className="badge badge-active">Present</span>;
    if (status === 'absent') return <span className="badge badge-overdue">Absent</span>;
    if (status === 'late') return <span className="badge badge-pending">Late</span>;
    return <span className="badge badge-inactive">Not Marked</span>;
  };

  return (
    <AppLayout activePath="/attendance">
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Attendance</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Track daily, weekly & monthly member attendance</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary text-xs">
              <Download size={14} /> Export PDF
            </button>
            <button className="btn-primary text-xs">
              <CheckCircle2 size={14} /> Mark All Present
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Members', value: members.length, icon: Users, color: 'text-zinc-300', bg: 'bg-zinc-800/50' },
            { label: 'Present Today', value: presentCount, icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Absent Today', value: absentCount, icon: UserX, color: 'text-red-400', bg: 'bg-red-500/10' },
            { label: 'Late Entry', value: lateCount, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
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
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
          {(['daily', 'weekly', 'monthly'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                view === v ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {view === 'daily' && (
          <>
            {/* Date Navigator */}
            <div className="flex items-center gap-3">
              <button onClick={prevDay} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2">
                <Calendar size={15} className="text-amber-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="bg-transparent text-zinc-200 text-sm font-medium focus:outline-none"
                />
              </div>
              <button onClick={nextDay} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search member..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="form-input pl-9 text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-zinc-500" />
                <select
                  value={filterTrainer}
                  onChange={e => setFilterTrainer(e.target.value)}
                  className="form-input text-xs w-auto"
                >
                  {trainers.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Member</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide hidden sm:table-cell">Trainer</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Mark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {filtered.map(member => (
                      <tr key={member.id} className="table-row-hover">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${member.color}`}>
                              {member.initials}
                            </div>
                            <div>
                              <p className="text-zinc-200 font-medium text-sm">{member.name}</p>
                              <p className="text-zinc-600 text-xs">{member.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-xs hidden sm:table-cell">{member.trainer}</td>
                        <td className="px-4 py-3">{statusBadge(attendance[member.id])}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => markAttendance(member.id, 'present')}
                              className={`p-1.5 rounded-lg transition-all text-xs font-medium ${
                                attendance[member.id] === 'present' ?'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :'bg-zinc-800 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10'
                              }`}
                              title="Mark Present"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                            <button
                              onClick={() => markAttendance(member.id, 'absent')}
                              className={`p-1.5 rounded-lg transition-all text-xs font-medium ${
                                attendance[member.id] === 'absent' ?'bg-red-500/20 text-red-400 border border-red-500/30' :'bg-zinc-800 text-zinc-500 hover:text-red-400 hover:bg-red-500/10'
                              }`}
                              title="Mark Absent"
                            >
                              <XCircle size={14} />
                            </button>
                            <button
                              onClick={() => markAttendance(member.id, 'late')}
                              className={`p-1.5 rounded-lg transition-all text-xs font-medium ${
                                attendance[member.id] === 'late' ?'bg-amber-500/20 text-amber-400 border border-amber-500/30' :'bg-zinc-800 text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10'
                              }`}
                              title="Mark Late"
                            >
                              <Clock size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {(view === 'weekly' || view === 'monthly') && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 size={16} className="text-amber-500" />
              <h3 className="text-sm font-semibold text-zinc-200">
                {view === 'weekly' ? 'This Week — Daily Attendance' : 'This Month — Weekly Attendance'}
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={view === 'weekly' ? weeklyData : monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey={view === 'weekly' ? 'day' : 'week'} tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#e4e4e7' }}
                />
                <Bar dataKey="present" name="Present" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
