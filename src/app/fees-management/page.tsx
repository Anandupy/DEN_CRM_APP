'use client';
import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { CreditCard, Plus, Search, Filter, Download, TrendingUp, AlertCircle, CheckCircle2, Clock, X } from 'lucide-react';
import { toast } from 'sonner';
import SearchSelect, { type SearchOption } from '@/components/ui/SearchSelect';
import { createFeeInSupabase, getErpFallbackData, loadErpSnapshot, searchMembersByName } from '@/lib/erp/data';
import type { FeeRecord, PaymentMode, PlanPrice } from '@/lib/erp/types';
import { planPricing as fallbackPlanPricing } from '@/lib/erp/mock-data';
import { useAuth } from '@/components/providers/AuthProvider';
import { isSupabaseConfigured } from '@/lib/supabase/client';

function getCurrentBillingMonth() {
  return new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export default function FeesManagementPage() {
  const { profile } = useAuth();
  const fallback = getErpFallbackData();
  const [fees, setFees] = useState<FeeRecord[]>(fallback.fees);
  const [members, setMembers] = useState(fallback.members);
  const [planCatalog, setPlanCatalog] = useState<PlanPrice[]>(fallbackPlanPricing);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | FeeRecord['status']>('all');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'records' | 'pricing'>('records');
  const [dataSource, setDataSource] = useState<'supabase' | 'mock'>('mock');
  const [selectedMember, setSelectedMember] = useState<SearchOption | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState({
    memberId: fallback.members[0]?.memberId ?? 'DEN-001',
    memberName: fallback.members[0]?.name ?? 'Amit Patil',
    plan: 'Monthly',
    amount: '1500',
    mode: 'Cash' as PaymentMode,
    month: getCurrentBillingMonth(),
    notes: ''
  });

  const refreshData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const snapshot = await loadErpSnapshot();
      setFees(snapshot.fees);
      setMembers(snapshot.members);
      setPlanCatalog(snapshot.planPricing);
      setDataSource(snapshot.source);
      const firstMember = snapshot.members[0];
      if (firstMember) {
        const defaultAmount = snapshot.planPricing.find((plan) => plan.plan === firstMember.plan)?.price ?? 0;
        setForm((current) => ({
          ...current,
          memberId: firstMember.memberId,
          memberName: firstMember.name,
          plan: firstMember.plan,
          amount: String(defaultAmount || current.amount),
        }));
        setSelectedMember({
          id: firstMember.memberId,
          label: firstMember.name,
          helper: `${firstMember.memberId} · ${firstMember.plan}`,
        });
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load fees data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const totalCollected = fees.reduce((s, f) => s + f.paidAmount, 0);
  const totalPending = fees.filter(f => f.status !== 'paid').reduce((s, f) => s + Math.max(0, f.amount - f.paidAmount), 0);
  const overdueCount = fees.filter(f => f.status === 'overdue').length;
  const pendingCount = fees.filter(f => f.status === 'pending').length;

  const filtered = fees.filter(f =>
    (filterStatus === 'all' || f.status === filterStatus) &&
    f.memberName.toLowerCase().includes(search.toLowerCase())
  );

  const selectableMembers = useMemo(
    () => members.map((member) => ({ id: member.memberId, name: member.name, plan: member.plan })),
    [members]
  );

  const handleAddFees = async () => {
    try {
      setIsSaving(true);
      if (isSupabaseConfigured()) {
        await createFeeInSupabase({
          memberCode: form.memberId,
          amount: parseInt(form.amount, 10),
          mode: form.mode,
          month: form.month,
          notes: form.notes,
          actorProfileId: profile?.id,
        });
        await refreshData();
      } else {
        const newRecord: FeeRecord = {
          id: `F${String(fees.length + 1).padStart(3, '0')}`,
          memberId: form.memberId,
          memberName: form.memberName,
          initials: form.memberName.split(' ').map(n => n[0]).join('').slice(0, 2),
          color: 'bg-zinc-500/20 text-zinc-400',
          plan: form.plan,
          amount: parseInt(form.amount, 10),
          paidAmount: parseInt(form.amount, 10),
          dueDate: new Date().toISOString().split('T')[0],
          paidDate: new Date().toISOString().split('T')[0],
          status: 'paid',
          mode: form.mode,
          month: form.month,
        };
        setFees(prev => [newRecord, ...prev]);
      }
      toast.success('Payment saved successfully');
      setShowModal(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save payment');
    } finally {
      setIsSaving(false);
    }
  };

  const statusIcon = (s: FeeRecord['status']) => {
    if (s === 'paid') return <CheckCircle2 size={14} className="text-emerald-400" />;
    if (s === 'overdue') return <AlertCircle size={14} className="text-red-400" />;
    return <Clock size={14} className="text-amber-400" />;
  };

  const statusBadge = (s: FeeRecord['status']) => {
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
            <p className="text-sm text-zinc-500 mt-0.5">
              Track payments, pending dues & membership pricing
              <span className="ml-2 text-[11px] uppercase tracking-wide text-amber-500/80">
                {dataSource === 'supabase' ? 'Live Supabase data' : 'Mock fallback'}
              </span>
            </p>
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
            {loadError ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
                {loadError}
              </div>
            ) : null}
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
                  onChange={e => setFilterStatus(e.target.value as 'all' | FeeRecord['status'])}
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
                {isLoading ? (
                  <div className="px-4 py-10 text-sm text-zinc-500">Loading live fee records...</div>
                ) : (
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
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'pricing' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {planCatalog.map(p => (
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
                  <div className="col-span-2">
                    <SearchSelect
                      label="Member Search"
                      placeholder="Type at least 2 letters..."
                      value={selectedMember}
                      search={searchMembersByName}
                      loadingText="Searching members..."
                      emptyText="No members match this search."
                      onSelect={(option) => {
                        const selected = selectableMembers.find((member) => member.id === option.id);
                        setSelectedMember(option);
                        setForm((current) => ({
                          ...current,
                          memberId: option.id,
                          memberName: option.label,
                          plan: selected?.plan ?? current.plan,
                          amount: String(planCatalog.find((plan) => plan.plan === (selected?.plan ?? current.plan))?.price ?? Number(current.amount)),
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <label className="form-label">Member ID</label>
                    <input value={form.memberId} readOnly className="form-input text-xs opacity-80" />
                  </div>
                  <div>
                    <label className="form-label">Member Name</label>
                    <input value={form.memberName} readOnly className="form-input text-xs opacity-80" placeholder="Full Name" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Plan</label>
                    <select value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value, amount: String(planCatalog.find(pl => pl.plan === e.target.value)?.price || 0) }))} className="form-input text-xs">
                      {planCatalog.map(p => <option key={p.plan} value={p.plan}>{p.plan}</option>)}
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
                <button onClick={handleAddFees} disabled={isSaving} className="btn-primary text-xs disabled:opacity-60">
                  <CheckCircle2 size={14} /> {isSaving ? 'Saving...' : 'Save Payment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
