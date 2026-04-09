'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { CreditCard, Plus, Search, Filter, Download, TrendingUp, AlertCircle, CheckCircle2, Clock, X } from 'lucide-react';

type PaymentStatus = 'paid' | 'pending' | 'overdue';
type PaymentMode = 'Cash' | 'UPI' | 'Card' | 'Online';

interface FeeRecord {
  id: string;
  memberId: string;
  memberName: string;
  initials: string;
  color: string;
  plan: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  paidDate: string | null;
  status: PaymentStatus;
  mode: PaymentMode | null;
  month: string;
}

const feesData: FeeRecord[] = [
  { id: 'F001', memberId: 'DEN-001', memberName: 'Amit Patil', initials: 'AP', color: 'bg-blue-500/20 text-blue-400', plan: 'Annual', amount: 12000, paidAmount: 12000, dueDate: '2026-04-01', paidDate: '2026-04-01', status: 'paid', mode: 'UPI', month: 'April 2026' },
  { id: 'F002', memberId: 'DEN-002', memberName: 'Kavya Reddy', initials: 'KR', color: 'bg-pink-500/20 text-pink-400', plan: 'Annual', amount: 12000, paidAmount: 12000, dueDate: '2026-04-09', paidDate: '2026-04-09', status: 'paid', mode: 'Card', month: 'April 2026' },
  { id: 'F003', memberId: 'DEN-003', memberName: 'Vikram Desai', initials: 'VD', color: 'bg-orange-500/20 text-orange-400', plan: 'Annual', amount: 12000, paidAmount: 0, dueDate: '2026-01-14', paidDate: null, status: 'overdue', mode: null, month: 'January 2026' },
  { id: 'F004', memberId: 'DEN-004', memberName: 'Sunita Rao', initials: 'SR', color: 'bg-emerald-500/20 text-emerald-400', plan: 'Quarterly', amount: 3500, paidAmount: 0, dueDate: '2026-04-07', paidDate: null, status: 'overdue', mode: null, month: 'April 2026' },
  { id: 'F005', memberId: 'DEN-005', memberName: 'Rohit Sharma', initials: 'RS', color: 'bg-purple-500/20 text-purple-400', plan: 'Monthly', amount: 1500, paidAmount: 0, dueDate: '2026-04-01', paidDate: null, status: 'pending', mode: null, month: 'April 2026' },
  { id: 'F006', memberId: 'DEN-006', memberName: 'Deepak Nair', initials: 'DN', color: 'bg-cyan-500/20 text-cyan-400', plan: 'Half-Yearly', amount: 6500, paidAmount: 0, dueDate: '2026-04-04', paidDate: null, status: 'overdue', mode: null, month: 'April 2026' },
  { id: 'F007', memberId: 'DEN-007', memberName: 'Pooja Mehta', initials: 'PM', color: 'bg-rose-500/20 text-rose-400', plan: 'Quarterly', amount: 3500, paidAmount: 0, dueDate: '2026-04-14', paidDate: null, status: 'pending', mode: null, month: 'April 2026' },
  { id: 'F008', memberId: 'DEN-008', memberName: 'Arjun Kadam', initials: 'AK', color: 'bg-amber-500/20 text-amber-400', plan: 'Quarterly', amount: 3500, paidAmount: 3500, dueDate: '2026-04-01', paidDate: '2026-04-01', status: 'paid', mode: 'Card', month: 'April 2026' },
  { id: 'F009', memberId: 'DEN-009', memberName: 'Sneha Iyer', initials: 'SI', color: 'bg-teal-500/20 text-teal-400', plan: 'Annual', amount: 12000, paidAmount: 12000, dueDate: '2026-04-01', paidDate: '2026-04-01', status: 'paid', mode: 'UPI', month: 'April 2026' },
  { id: 'F010', memberId: 'DEN-010', memberName: 'Manish Sharma', initials: 'MS', color: 'bg-indigo-500/20 text-indigo-400', plan: 'Quarterly', amount: 3500, paidAmount: 3500, dueDate: '2026-04-05', paidDate: '2026-04-05', status: 'paid', mode: 'Cash', month: 'April 2026' },
  { id: 'F011', memberId: 'DEN-011', memberName: 'Preethi Nair', initials: 'PN', color: 'bg-green-500/20 text-green-400', plan: 'Monthly', amount: 1500, paidAmount: 1500, dueDate: '2026-04-08', paidDate: '2026-04-08', status: 'paid', mode: 'UPI', month: 'April 2026' },
  { id: 'F012', memberId: 'DEN-012', memberName: 'Santosh Kulkarni', initials: 'SK', color: 'bg-lime-500/20 text-lime-400', plan: 'Annual', amount: 12000, paidAmount: 12000, dueDate: '2026-04-01', paidDate: '2026-04-01', status: 'paid', mode: 'UPI', month: 'April 2026' },
];

const planPricing = [
  { plan: 'Monthly', price: 1500, duration: '1 Month' },
  { plan: 'Quarterly', price: 3500, duration: '3 Months' },
  { plan: 'Half-Yearly', price: 6500, duration: '6 Months' },
  { plan: 'Annual', price: 12000, duration: '12 Months' },
];

export default function FeesManagementPage() {
  const [fees, setFees] = useState<FeeRecord[]>(feesData);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | PaymentStatus>('all');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'records' | 'pricing'>('records');
  const [form, setForm] = useState({
    memberId: 'DEN-001', memberName: 'Amit Patil', plan: 'Monthly',
    amount: '1500', mode: 'Cash' as PaymentMode, month: 'April 2026', notes: ''
  });

  const totalCollected = fees.filter(f => f.status === 'paid').reduce((s, f) => s + f.paidAmount, 0);
  const totalPending = fees.filter(f => f.status !== 'paid').reduce((s, f) => s + f.amount, 0);
  const overdueCount = fees.filter(f => f.status === 'overdue').length;
  const pendingCount = fees.filter(f => f.status === 'pending').length;

  const filtered = fees.filter(f =>
    (filterStatus === 'all' || f.status === filterStatus) &&
    f.memberName.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddFees = () => {
    const newRecord: FeeRecord = {
      id: `F${String(fees.length + 1).padStart(3, '0')}`,
      memberId: form.memberId,
      memberName: form.memberName,
      initials: form.memberName.split(' ').map(n => n[0]).join('').slice(0, 2),
      color: 'bg-zinc-500/20 text-zinc-400',
      plan: form.plan,
      amount: parseInt(form.amount),
      paidAmount: parseInt(form.amount),
      dueDate: new Date().toISOString().split('T')[0],
      paidDate: new Date().toISOString().split('T')[0],
      status: 'paid',
      mode: form.mode,
      month: form.month,
    };
    setFees(prev => [newRecord, ...prev]);
    setShowModal(false);
  };

  const statusIcon = (s: PaymentStatus) => {
    if (s === 'paid') return <CheckCircle2 size={14} className="text-emerald-400" />;
    if (s === 'overdue') return <AlertCircle size={14} className="text-red-400" />;
    return <Clock size={14} className="text-amber-400" />;
  };

  const statusBadge = (s: PaymentStatus) => {
    if (s === 'paid') return <span className="badge badge-active">Paid</span>;
    if (s === 'overdue') return <span className="badge badge-overdue">Overdue</span>;
    return <span className="badge badge-pending">Pending</span>;
  };

  return (
    <AppLayout activePath="/fees-management">
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Fees Management</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Track payments, pending dues & membership pricing</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary text-xs"><Download size={14} /> Export</button>
            <button onClick={() => setShowModal(true)} className="btn-primary text-xs"><Plus size={14} /> Add Payment</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Collected (Apr)', value: `₹${totalCollected.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Pending Amount', value: `₹${totalPending.toLocaleString('en-IN')}`, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Overdue Members', value: overdueCount, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
            { label: 'Pending Members', value: pendingCount, icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          ].map(stat => (
            <div key={stat.label} className="metric-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon size={16} className={stat.color} />
                </div>
              </div>
              <p className={`text-2xl font-bold stat-value ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
          {(['records', 'pricing'] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === t ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t === 'records' ? 'Payment Records' : 'Plan Pricing'}
            </button>
          ))}
        </div>

        {activeTab === 'records' && (
          <>
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
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value as 'all' | PaymentStatus)}
                  className="form-input text-xs w-auto"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Member</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide hidden md:table-cell">Plan</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Amount</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide hidden sm:table-cell">Due Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide hidden lg:table-cell">Mode</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {filtered.map(fee => (
                      <tr key={fee.id} className="table-row-hover">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${fee.color}`}>
                              {fee.initials}
                            </div>
                            <div>
                              <p className="text-zinc-200 font-medium text-sm">{fee.memberName}</p>
                              <p className="text-zinc-600 text-xs">{fee.memberId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-xs hidden md:table-cell">{fee.plan}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {statusIcon(fee.status)}
                            <span className="text-zinc-200 font-semibold text-sm">₹{fee.amount.toLocaleString('en-IN')}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-xs hidden sm:table-cell">{fee.dueDate}</td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {fee.mode ? (
                            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">{fee.mode}</span>
                          ) : (
                            <span className="text-zinc-600 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">{statusBadge(fee.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'pricing' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {planPricing.map(p => (
              <div key={p.plan} className="metric-card border-zinc-700 hover:border-amber-500/30 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <CreditCard size={16} className="text-amber-400" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-200">{p.plan}</span>
                </div>
                <p className="text-3xl font-bold text-amber-400 stat-value mb-1">₹{p.price.toLocaleString('en-IN')}</p>
                <p className="text-xs text-zinc-500">{p.duration}</p>
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <p className="text-xs text-zinc-500">Per month: <span className="text-zinc-300 font-medium">₹{Math.round(p.price / parseInt(p.duration)).toLocaleString('en-IN')}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Payment Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                <h3 className="text-base font-semibold text-zinc-100">Add Payment Entry</h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Member ID</label>
                    <input value={form.memberId} onChange={e => setForm(p => ({ ...p, memberId: e.target.value }))} className="form-input text-xs" placeholder="DEN-001" />
                  </div>
                  <div>
                    <label className="form-label">Member Name</label>
                    <input value={form.memberName} onChange={e => setForm(p => ({ ...p, memberName: e.target.value }))} className="form-input text-xs" placeholder="Full Name" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Plan</label>
                    <select value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value, amount: String(planPricing.find(pl => pl.plan === e.target.value)?.price || 1500) }))} className="form-input text-xs">
                      {planPricing.map(p => <option key={p.plan} value={p.plan}>{p.plan}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Amount (₹)</label>
                    <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} className="form-input text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Payment Mode</label>
                    <select value={form.mode} onChange={e => setForm(p => ({ ...p, mode: e.target.value as PaymentMode }))} className="form-input text-xs">
                      {['Cash', 'UPI', 'Card', 'Online'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Month</label>
                    <input value={form.month} onChange={e => setForm(p => ({ ...p, month: e.target.value }))} className="form-input text-xs" placeholder="April 2026" />
                  </div>
                </div>
                <div>
                  <label className="form-label">Notes (optional)</label>
                  <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="form-input text-xs" placeholder="Any remarks..." />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-5 border-t border-zinc-800">
                <button onClick={() => setShowModal(false)} className="btn-secondary text-xs">Cancel</button>
                <button onClick={handleAddFees} className="btn-primary text-xs"><CheckCircle2 size={14} /> Save Payment</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

