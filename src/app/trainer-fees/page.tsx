'use client';
import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Plus, AlertCircle, CheckCircle2, X, Info } from 'lucide-react';
import SearchSelect, { type SearchOption } from '@/components/ui/SearchSelect';
import { createFeeInSupabase, loadErpSnapshot, searchMembersByName } from '@/lib/erp/data';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import type { PaymentMode } from '@/lib/erp/types';

function getCurrentBillingMonth() {
  return new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

interface FeeEntry {
  id: string;
  memberId: string;
  memberName: string;
  initials: string;
  color: string;
  amount: number;
  pendingBalance: number;
  status: 'paid' | 'pending' | 'overdue';
  mode: PaymentMode;
  month: string;
  addedAt: string;
  addedBy: string;
}

export default function TrainerFeesPage() {
  const { profile } = useAuth();
  const [fees, setFees] = useState<FeeEntry[]>([]);
  const [assignedMembers, setAssignedMembers] = useState<Array<{ id: string; name: string; initials: string; color: string; plan: string; amount: number; dueDate: string }>>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<SearchOption | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState({ memberId: '', memberName: '', amount: '', mode: 'Cash' as PaymentMode, month: getCurrentBillingMonth() });

  const refreshData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const snapshot = await loadErpSnapshot();
      const members = snapshot.members.filter((member) => member.trainer === profile?.full_name);
      setAssignedMembers(members.map((member) => ({
        id: member.memberId,
        name: member.name,
        initials: member.profileInitials,
        color: member.profileColor,
        plan: member.plan,
        amount: snapshot.planPricing.find((plan) => plan.plan === member.plan)?.price ?? 0,
        dueDate: member.expiryDate,
      })));
      setFees(
        snapshot.fees
          .filter((fee) => members.some((member) => member.memberId === fee.memberId))
          .map((fee) => ({
            id: fee.id,
            memberId: fee.memberId,
            memberName: fee.memberName,
            initials: fee.initials,
            color: fee.color,
            amount: fee.paidAmount,
            pendingBalance: Math.max(0, fee.amount - fee.paidAmount),
            status: fee.status,
            mode: fee.mode ?? 'Cash',
            month: fee.month,
            addedAt: fee.paidDate ?? fee.dueDate,
            addedBy: profile?.full_name ?? 'Trainer',
          }))
      );

      if (members[0]) {
        setForm((current) => ({
          ...current,
          memberId: current.memberId || members[0].memberId,
          memberName: current.memberName || members[0].name,
          amount: current.amount || String(snapshot.planPricing.find((plan) => plan.plan === members[0].plan)?.price ?? 0),
        }));
        setSelectedMember({
          id: members[0].memberId,
          label: members[0].name,
          helper: `${members[0].memberId} · ${members[0].plan}`,
        });
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load trainer fee entries.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [profile?.full_name]);

  const pendingMembers = useMemo(
    () => assignedMembers.filter((member) => {
      const relevantFees = fees.filter((fee) => fee.memberId === member.id && fee.month === form.month);
      if (!relevantFees.length) return true;
      return relevantFees.some((fee) => fee.pendingBalance > 0 || fee.status !== 'paid');
    }),
    [assignedMembers, fees, form.month]
  );

  const handleAdd = async () => {
    try {
      setIsSaving(true);
      if (isSupabaseConfigured()) {
        await createFeeInSupabase({
          memberCode: form.memberId,
          amount: parseInt(form.amount, 10),
          mode: form.mode as FeeEntry['mode'],
          month: form.month,
          actorProfileId: profile?.id,
        });
        await refreshData();
      } else {
        const newEntry: FeeEntry = {
          id: `F${String(fees.length + 100).padStart(3, '0')}`,
          memberId: form.memberId,
          memberName: form.memberName,
          initials: form.memberName.split(' ').map(n => n[0]).join('').slice(0, 2),
          color: 'bg-zinc-500/20 text-zinc-400',
          amount: parseInt(form.amount, 10),
          pendingBalance: 0,
          status: 'paid',
          mode: form.mode,
          month: form.month,
          addedAt: new Date().toISOString().split('T')[0],
          addedBy: profile?.full_name ?? 'Trainer',
        };
        setFees(prev => [newEntry, ...prev]);
      }
      toast.success('Fee entry saved');
      setShowModal(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save fee entry');
    } finally {
      setIsSaving(false);
    }
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
        {loadError ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {loadError}
          </div>
        ) : null}
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
            {isLoading ? (
              <div className="px-5 py-6 text-sm text-zinc-500">Loading fee history...</div>
            ) : fees.map(fee => (
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
                  <p className="text-zinc-500 text-xs">
                    {fee.mode} · {fee.addedAt}
                    {fee.pendingBalance > 0 ? ` · Due ₹${fee.pendingBalance.toLocaleString('en-IN')}` : ''}
                  </p>
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
                  <div className="col-span-2">
                    <SearchSelect
                      label="Member Search"
                      placeholder="Type at least 2 letters..."
                      value={selectedMember}
                      search={async (query) => {
                        const options = await searchMembersByName(query);
                        return options.filter((option) => assignedMembers.some((member) => member.id === option.id));
                      }}
                      disabled={isLoading}
                      loadingText="Searching assigned members..."
                      emptyText="No assigned member matches this search."
                      onSelect={(option) => {
                        const selected = assignedMembers.find((member) => member.id === option.id);
                        setSelectedMember(option);
                        setForm((current) => ({
                          ...current,
                          memberId: option.id,
                          memberName: option.label,
                          amount: String(selected?.amount ?? current.amount),
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <label className="form-label">Member ID</label>
                    <input value={form.memberId} readOnly className="form-input text-xs opacity-60 cursor-not-allowed" />
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
                      <select value={form.mode} onChange={e => setForm(p => ({ ...p, mode: e.target.value as PaymentMode }))} className="form-input text-xs">
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
                <button onClick={handleAdd} disabled={isSaving} className="btn-primary text-xs disabled:opacity-60">
                  <CheckCircle2 size={14} /> {isSaving ? 'Saving...' : 'Add Entry'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
