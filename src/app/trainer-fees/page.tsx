'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Plus, AlertCircle, CheckCircle2, X, Info } from 'lucide-react';

interface FeeEntry {
  id: string;
  memberId: string;
  memberName: string;
  initials: string;
  color: string;
  amount: number;
  mode: string;
  month: string;
  addedAt: string;
  addedBy: string;
}

const existingFees: FeeEntry[] = [
  { id: 'F001', memberId: 'DEN-001', memberName: 'Amit Patil', initials: 'AP', color: 'bg-blue-500/20 text-blue-400', amount: 12000, mode: 'UPI', month: 'April 2026', addedAt: '2026-04-01', addedBy: 'Priya Sharma' },
  { id: 'F002', memberId: 'DEN-002', memberName: 'Kavya Reddy', initials: 'KR', color: 'bg-pink-500/20 text-pink-400', amount: 12000, mode: 'Card', month: 'April 2026', addedAt: '2026-04-09', addedBy: 'Priya Sharma' },
  { id: 'F008', memberId: 'DEN-008', memberName: 'Arjun Kadam', initials: 'AK', color: 'bg-amber-500/20 text-amber-400', amount: 3500, mode: 'Card', month: 'April 2026', addedAt: '2026-04-01', addedBy: 'Priya Sharma' },
  { id: 'F009', memberId: 'DEN-009', memberName: 'Sneha Iyer', initials: 'SI', color: 'bg-teal-500/20 text-teal-400', amount: 12000, mode: 'UPI', month: 'April 2026', addedAt: '2026-04-01', addedBy: 'Priya Sharma' },
];

const pendingMembers = [
  { id: 'DEN-001', name: 'Amit Patil', initials: 'AP', color: 'bg-blue-500/20 text-blue-400', plan: 'Annual', amount: 12000, dueDate: '2026-05-01' },
];

export default function TrainerFeesPage() {
  const [fees, setFees] = useState<FeeEntry[]>(existingFees);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ memberId: 'DEN-001', memberName: 'Amit Patil', amount: '12000', mode: 'Cash', month: 'May 2026' });

  const handleAdd = () => {
    const newEntry: FeeEntry = {
      id: `F${String(fees.length + 100).padStart(3, '0')}`,
      memberId: form.memberId,
      memberName: form.memberName,
      initials: form.memberName.split(' ').map(n => n[0]).join('').slice(0, 2),
      color: 'bg-zinc-500/20 text-zinc-400',
      amount: parseInt(form.amount),
      mode: form.mode,
      month: form.month,
      addedAt: new Date().toISOString().split('T')[0],
      addedBy: 'Priya Sharma',
    };
    setFees(prev => [newEntry, ...prev]);
    setShowModal(false);
  };

  return (
    <AppLayout activePath="/trainer-fees">
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Fee Entries</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Add fee entries for your assigned members</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary text-xs"><Plus size={14} /> Add Fee Entry</button>
        </div>

        {/* Trainer restriction notice */}
        <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <Info size={15} className="text-blue-400 shrink-0 mt-0.5" />
          <p className="text-blue-300 text-xs leading-relaxed">
            As a trainer, you can <strong>add new fee entries only</strong>. You cannot edit or delete existing entries. Contact the admin for any corrections.
          </p>
        </div>

        {/* Pending Fees */}
        {pendingMembers.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={15} className="text-amber-500" />
              <h3 className="text-sm font-semibold text-zinc-200">Pending Dues — My Members</h3>
            </div>
            <div className="space-y-3">
              {pendingMembers.map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-amber-500/5 border border-amber-500/15 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${m.color}`}>
                      {m.initials}
                    </div>
                    <div>
                      <p className="text-zinc-200 text-sm font-medium">{m.name}</p>
                      <p className="text-zinc-500 text-xs">{m.id} · Due: {m.dueDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-amber-400 font-semibold text-sm">₹{m.amount.toLocaleString('en-IN')}</p>
                    <p className="text-zinc-500 text-xs">{m.plan}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fee History */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-200">Payment History — My Members</h3>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {fees.map(fee => (
              <div key={fee.id} className="flex items-center justify-between px-5 py-4 hover:bg-zinc-800/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${fee.color}`}>
                    {fee.initials}
                  </div>
                  <div>
                    <p className="text-zinc-200 font-medium text-sm">{fee.memberName}</p>
                    <p className="text-zinc-500 text-xs">{fee.memberId} · {fee.month}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <p className="text-emerald-400 font-semibold text-sm">₹{fee.amount.toLocaleString('en-IN')}</p>
                  </div>
                  <p className="text-zinc-500 text-xs">{fee.mode} · {fee.addedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Fee Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                <h3 className="text-base font-semibold text-zinc-100">Add Fee Entry</h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Member ID</label>
                    <select value={form.memberId} onChange={e => {
                      const m = ['DEN-001', 'DEN-002', 'DEN-008', 'DEN-009'];
                      const names = ['Amit Patil', 'Kavya Reddy', 'Arjun Kadam', 'Sneha Iyer'];
                      const idx = m.indexOf(e.target.value);
                      setForm(p => ({ ...p, memberId: e.target.value, memberName: names[idx] || '' }));
                    }} className="form-input text-xs">
                      <option value="DEN-001">DEN-001</option>
                      <option value="DEN-002">DEN-002</option>
                      <option value="DEN-008">DEN-008</option>
                      <option value="DEN-009">DEN-009</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Member Name</label>
                    <input value={form.memberName} readOnly className="form-input text-xs opacity-60 cursor-not-allowed" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Amount (₹)</label>
                    <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} className="form-input text-xs" />
                  </div>
                  <div>
                    <label className="form-label">Payment Mode</label>
                    <select value={form.mode} onChange={e => setForm(p => ({ ...p, mode: e.target.value }))} className="form-input text-xs">
                      {['Cash', 'UPI', 'Card', 'Online'].map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">Month</label>
                  <input value={form.month} onChange={e => setForm(p => ({ ...p, month: e.target.value }))} className="form-input text-xs" placeholder="May 2026" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-5 border-t border-zinc-800">
                <button onClick={() => setShowModal(false)} className="btn-secondary text-xs">Cancel</button>
                <button onClick={handleAdd} className="btn-primary text-xs"><CheckCircle2 size={14} /> Add Entry</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
