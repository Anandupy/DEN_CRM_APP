'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Shield, CheckCircle2, XCircle, Minus } from 'lucide-react';

const permissions = [
  { module: 'Dashboard', owner: 'full', trainer: 'limited', member: 'own' },
  { module: 'View Members', owner: 'full', trainer: 'assigned', member: 'own' },
  { module: 'Add Members', owner: 'yes', trainer: 'no', member: 'no' },
  { module: 'Edit Members', owner: 'yes', trainer: 'no', member: 'limited' },
  { module: 'Delete Members', owner: 'yes', trainer: 'no', member: 'no' },
  { module: 'Mark Attendance', owner: 'yes', trainer: 'yes', member: 'no' },
  { module: 'View Attendance', owner: 'yes', trainer: 'assigned', member: 'own' },
  { module: 'Add Fee Entry', owner: 'yes', trainer: 'yes', member: 'no' },
  { module: 'Edit Fee Entry', owner: 'yes', trainer: 'no', member: 'no' },
  { module: 'Delete Fee Entry', owner: 'yes', trainer: 'no', member: 'no' },
  { module: 'View Fees', owner: 'yes', trainer: 'assigned', member: 'own' },
  { module: 'Manage Trainers', owner: 'yes', trainer: 'no', member: 'no' },
  { module: 'View Reports', owner: 'yes', trainer: 'limited', member: 'no' },
  { module: 'Export Reports', owner: 'yes', trainer: 'no', member: 'no' },
  { module: 'Manage Schedule', owner: 'yes', trainer: 'no', member: 'view' },
  { module: 'Post Notices', owner: 'yes', trainer: 'no', member: 'view' },
  { module: 'System Settings', owner: 'yes', trainer: 'no', member: 'no' },
  { module: 'Access Control', owner: 'yes', trainer: 'no', member: 'no' },
];

type PermLevel = 'yes' | 'no' | 'full' | 'limited' | 'assigned' | 'own' | 'view';

const permCell = (level: PermLevel) => {
  if (level === 'yes' || level === 'full') return (
    <div className="flex items-center justify-center gap-1.5">
      <CheckCircle2 size={14} className="text-emerald-400" />
      <span className="text-emerald-400 text-xs font-medium capitalize">{level === 'yes' ? 'Yes' : 'Full'}</span>
    </div>
  );
  if (level === 'no') return (
    <div className="flex items-center justify-center gap-1.5">
      <XCircle size={14} className="text-red-400" />
      <span className="text-red-400 text-xs font-medium">No</span>
    </div>
  );
  return (
    <div className="flex items-center justify-center gap-1.5">
      <Minus size={14} className="text-amber-400" />
      <span className="text-amber-400 text-xs font-medium capitalize">{level}</span>
    </div>
  );
};

export default function AccessControlPage() {
  return (
    <AppLayout activePath="/access-control">
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Access Control</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Role-based permissions matrix for DEN Fitness ERP</p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { role: 'Owner / Admin', desc: 'Full system access — all modules, all data', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', initials: 'OA' },
            { role: 'Trainer', desc: 'Limited access — assigned members, attendance, fee entry', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', initials: 'TR' },
            { role: 'Member', desc: 'Personal access — own data, attendance, fees, profile', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', initials: 'MB' },
          ].map(r => (
            <div key={r.role} className={`bg-zinc-900 border ${r.border} rounded-xl p-5`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full ${r.bg} flex items-center justify-center`}>
                  <Shield size={16} className={r.color} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${r.color}`}>{r.role}</p>
                </div>
              </div>
              <p className="text-zinc-500 text-xs leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>

        {/* Permissions Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-200">Permissions Matrix</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Module / Action</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-amber-500 uppercase tracking-wide">Owner</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-blue-500 uppercase tracking-wide">Trainer</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-emerald-500 uppercase tracking-wide">Member</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {permissions.map(perm => (
                  <tr key={perm.module} className="table-row-hover">
                    <td className="px-5 py-3 text-zinc-300 text-sm font-medium">{perm.module}</td>
                    <td className="px-5 py-3">{permCell(perm.owner as PermLevel)}</td>
                    <td className="px-5 py-3">{permCell(perm.trainer as PermLevel)}</td>
                    <td className="px-5 py-3">{permCell(perm.member as PermLevel)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
          <span className="font-medium text-zinc-400">Legend:</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-400" /> Full access</span>
          <span className="flex items-center gap-1.5"><Minus size={12} className="text-amber-400" /> Limited / conditional access</span>
          <span className="flex items-center gap-1.5"><XCircle size={12} className="text-red-400" /> No access</span>
        </div>
      </div>
    </AppLayout>
  );
}
