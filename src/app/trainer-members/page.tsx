'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Users, Search, Phone, Calendar, CreditCard, UserCheck } from 'lucide-react';

const myMembers = [
  { id: 'DEN-001', name: 'Amit Patil', initials: 'AP', color: 'bg-blue-500/20 text-blue-400', plan: 'Annual', phone: '98765-43210', joinDate: '2025-04-10', expiryDate: '2026-04-09', feesStatus: 'paid' as const, attendancePct: '78%', age: '28', gender: 'Male', email: 'amit.patil@gmail.com' },
  { id: 'DEN-002', name: 'Kavya Reddy', initials: 'KR', color: 'bg-pink-500/20 text-pink-400', plan: 'Annual', phone: '91234-67890', joinDate: '2026-04-09', expiryDate: '2027-04-08', feesStatus: 'paid' as const, attendancePct: '100%', age: '24', gender: 'Female', email: 'kavya.reddy@outlook.com' },
  { id: 'DEN-008', name: 'Arjun Kadam', initials: 'AK', color: 'bg-amber-500/20 text-amber-400', plan: 'Quarterly', phone: '88765-43210', joinDate: '2026-01-01', expiryDate: '2026-03-31', feesStatus: 'paid' as const, attendancePct: '91%', age: '22', gender: 'Male', email: 'arjun.kadam@gmail.com' },
  { id: 'DEN-009', name: 'Sneha Iyer', initials: 'SI', color: 'bg-teal-500/20 text-teal-400', plan: 'Annual', phone: '66554-43322', joinDate: '2025-08-20', expiryDate: '2026-08-19', feesStatus: 'paid' as const, attendancePct: '88%', age: '27', gender: 'Female', email: 'sneha.iyer@gmail.com' },
];

export default function TrainerMembersPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = myMembers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.id.toLowerCase().includes(search.toLowerCase())
  );

  const selectedMember = myMembers.find(m => m.id === selected);

  return (
    <AppLayout activePath="/trainer-members">
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">My Members</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Members assigned to you — Priya Sharma</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Assigned', value: myMembers.length, icon: Users, color: 'text-zinc-300' },
            { label: 'Active Members', value: myMembers.filter(m => m.feesStatus === 'paid').length, icon: UserCheck, color: 'text-emerald-400' },
            { label: 'Avg Attendance', value: '89%', icon: Calendar, color: 'text-amber-400' },
            { label: 'Fees Cleared', value: myMembers.filter(m => m.feesStatus === 'paid').length, icon: CreditCard, color: 'text-blue-400' },
          ].map(stat => (
            <div key={stat.label} className="metric-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">{stat.label}</span>
                <stat.icon size={16} className={stat.color} />
              </div>
              <p className={`text-3xl font-bold stat-value ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input pl-9 text-xs"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Member List */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="divide-y divide-zinc-800/50">
              {filtered.map(member => (
                <div
                  key={member.id}
                  className={`flex items-center justify-between px-5 py-4 cursor-pointer transition-colors ${
                    selected === member.id ? 'bg-amber-500/5 border-l-2 border-amber-500' : 'hover:bg-zinc-800/30'
                  }`}
                  onClick={() => setSelected(selected === member.id ? null : member.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${member.color}`}>
                      {member.initials}
                    </div>
                    <div>
                      <p className="text-zinc-200 font-medium text-sm">{member.name}</p>
                      <p className="text-zinc-500 text-xs">{member.id} · {member.plan}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-400 text-xs">{member.attendancePct} attendance</p>
                    <span className={`badge text-[10px] ${member.feesStatus === 'paid' ? 'badge-active' : 'badge-overdue'}`}>
                      {member.feesStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Member Detail */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            {selectedMember ? (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${selectedMember.color}`}>
                    {selectedMember.initials}
                  </div>
                  <div>
                    <p className="text-zinc-100 font-semibold">{selectedMember.name}</p>
                    <p className="text-zinc-500 text-xs">{selectedMember.id}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Age', value: selectedMember.age + ' years' },
                    { label: 'Gender', value: selectedMember.gender },
                    { label: 'Phone', value: selectedMember.phone },
                    { label: 'Email', value: selectedMember.email },
                    { label: 'Plan', value: selectedMember.plan },
                    { label: 'Joined', value: selectedMember.joinDate },
                    { label: 'Expires', value: selectedMember.expiryDate },
                    { label: 'Attendance', value: selectedMember.attendancePct },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center py-2 border-b border-zinc-800/50 last:border-0">
                      <span className="text-zinc-500 text-xs">{row.label}</span>
                      <span className="text-zinc-300 text-xs font-medium">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Users size={28} className="text-zinc-700 mb-3" />
                <p className="text-zinc-500 text-sm">Select a member to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
