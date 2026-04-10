'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { UserCheck, Calendar, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock } from 'lucide-react';

const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];

const attendanceHistory: Record<string, Record<string, 'present' | 'absent' | 'late'>> = {
  '2026-04-09': { 'DEN-001': 'present', 'DEN-002': 'present', 'DEN-008': 'present', 'DEN-009': 'present' },
  '2026-04-08': { 'DEN-001': 'present', 'DEN-002': 'present', 'DEN-008': 'late', 'DEN-009': 'present' },
  '2026-04-07': { 'DEN-001': 'absent', 'DEN-002': 'present', 'DEN-008': 'present', 'DEN-009': 'present' },
  '2026-04-06': { 'DEN-001': 'present', 'DEN-002': 'absent', 'DEN-008': 'present', 'DEN-009': 'late' },
  '2026-04-05': { 'DEN-001': 'present', 'DEN-002': 'present', 'DEN-008': 'absent', 'DEN-009': 'present' },
};

const members = [
  { id: 'DEN-001', name: 'Amit Patil', initials: 'AP', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'DEN-002', name: 'Kavya Reddy', initials: 'KR', color: 'bg-pink-500/20 text-pink-400' },
  { id: 'DEN-008', name: 'Arjun Kadam', initials: 'AK', color: 'bg-amber-500/20 text-amber-400' },
  { id: 'DEN-009', name: 'Sneha Iyer', initials: 'SI', color: 'bg-teal-500/20 text-teal-400' },
];

export default function TrainerAttendancePage() {
  const [selectedDate, setSelectedDate] = useState(formatDate(today));

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

  const dayData = attendanceHistory[selectedDate] || {};

  const statusIcon = (s: 'present' | 'absent' | 'late' | undefined) => {
    if (s === 'present') return <CheckCircle2 size={16} className="text-emerald-400" />;
    if (s === 'absent') return <XCircle size={16} className="text-red-400" />;
    if (s === 'late') return <Clock size={16} className="text-amber-400" />;
    return <span className="text-zinc-600 text-xs">—</span>;
  };

  const statusBadge = (s: 'present' | 'absent' | 'late' | undefined) => {
    if (s === 'present') return <span className="badge badge-active">Present</span>;
    if (s === 'absent') return <span className="badge badge-overdue">Absent</span>;
    if (s === 'late') return <span className="badge badge-pending">Late</span>;
    return <span className="badge badge-inactive">No Data</span>;
  };

  const presentCount = Object.values(dayData).filter(v => v === 'present').length;
  const absentCount = Object.values(dayData).filter(v => v === 'absent').length;

  return (
    <AppLayout activePath="/trainer-attendance">
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Attendance List</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Daily attendance record for your assigned members</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="metric-card">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Total</p>
            <p className="text-3xl font-bold text-zinc-300 stat-value">{members.length}</p>
          </div>
          <div className="metric-card">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Present</p>
            <p className="text-3xl font-bold text-emerald-400 stat-value">{presentCount}</p>
          </div>
          <div className="metric-card">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Absent</p>
            <p className="text-3xl font-bold text-red-400 stat-value">{absentCount}</p>
          </div>
        </div>

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

        {/* Attendance Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <UserCheck size={15} className="text-amber-500" />
              Attendance — {selectedDate}
            </h3>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {members.map(member => (
              <div key={member.id} className="flex items-center justify-between px-5 py-4 hover:bg-zinc-800/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${member.color}`}>
                    {member.initials}
                  </div>
                  <div>
                    <p className="text-zinc-200 font-medium text-sm">{member.name}</p>
                    <p className="text-zinc-600 text-xs">{member.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {statusIcon(dayData[member.id])}
                  {statusBadge(dayData[member.id])}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-4">Monthly Summary — April 2026</h3>
          <div className="space-y-3">
            {members.map(member => {
              const totalDays = Object.keys(attendanceHistory).length;
              const presentDays = Object.values(attendanceHistory).filter(d => d[member.id] === 'present').length;
              const pct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
              return (
                <div key={member.id} className="flex items-center gap-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${member.color} shrink-0`}>
                    {member.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-zinc-300 text-xs font-medium">{member.name}</span>
                      <span className="text-zinc-400 text-xs">{presentDays}/{totalDays} days · {pct}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}