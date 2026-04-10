'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import { loadMemberPortalSnapshot } from '@/lib/erp/data';
import type { MemberPortalSnapshot } from '@/lib/erp/types';
import { Calendar, CheckCircle2, Clock, CreditCard, TrendingUp } from 'lucide-react';

function formatDisplayDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MemberFeesPage() {
  const { profile } = useAuth();
  const [snapshot, setSnapshot] = useState<MemberPortalSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const nextSnapshot = await loadMemberPortalSnapshot(profile?.id);
        if (active) setSnapshot(nextSnapshot);
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : 'Unable to load payment history.');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [profile?.id]);

  const member = snapshot?.member ?? null;
  const payments = snapshot?.payments ?? [];
  const fees = snapshot?.fees ?? [];
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const currentDue = useMemo(
    () => fees.reduce((sum, fee) => sum + Math.max(0, fee.amount - fee.paidAmount), 0),
    [fees]
  );
  const activeFee = fees[0] ?? null;

  if (isLoading) {
    return (
      <AppLayout activePath="/member-fees">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-8 text-sm text-zinc-400">
          Loading your live payment history...
        </div>
      </AppLayout>
    );
  }

  if (loadError) {
    return (
      <AppLayout activePath="/member-fees">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-8 text-sm text-red-300">
          {loadError}
        </div>
      </AppLayout>
    );
  }

  if (!member) {
    return (
      <AppLayout activePath="/member-fees">
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-8 text-sm text-amber-200">
          Your member profile is not linked yet, so payment history is unavailable.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout activePath="/member-fees">
      <div className="space-y-6 fade-in">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">My Fees</h1>
          <p className="mt-0.5 text-sm text-zinc-500">Live payment history and current membership billing</p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="metric-card">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-zinc-500">Total Paid</span>
              <TrendingUp size={16} className="text-emerald-400" />
            </div>
            <p className="stat-value text-2xl font-bold text-emerald-400">₹{totalPaid.toLocaleString('en-IN')}</p>
          </div>
          <div className="metric-card">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-zinc-500">Current Plan</span>
              <CreditCard size={16} className="text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400">{member.plan}</p>
          </div>
          <div className="metric-card">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-zinc-500">Current Due</span>
              <Clock size={16} className="text-amber-400" />
            </div>
            <p className={`text-2xl font-bold ${currentDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              ₹{currentDue.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="metric-card">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-zinc-500">Status</span>
              <CheckCircle2 size={16} className={member.feesStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'} />
            </div>
            <p className={`text-2xl font-bold ${member.feesStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>{member.feesStatus.toUpperCase()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard size={15} className="text-amber-500" />
              <h3 className="text-sm font-semibold text-zinc-200">Current Billing</h3>
            </div>
            <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
              <p className="text-lg font-bold text-amber-400">{member.plan} Plan</p>
              <p className="text-sm text-zinc-400">Renewal due on {formatDisplayDate(activeFee?.dueDate ?? member.expiryDate)}</p>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'Member ID', value: member.memberId },
                { label: 'Start Date', value: formatDisplayDate(member.joinDate) },
                { label: 'Expiry Date', value: formatDisplayDate(member.expiryDate) },
                { label: 'Pending Balance', value: `₹${currentDue.toLocaleString('en-IN')}` },
              ].map((row) => (
                <div key={row.label} className="flex justify-between border-b border-zinc-800/50 py-2">
                  <span className="text-xs text-zinc-500">{row.label}</span>
                  <span className="text-xs font-medium text-zinc-300">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            <div className="border-b border-zinc-800 px-5 py-4">
              <h3 className="text-sm font-semibold text-zinc-200">Payment History</h3>
            </div>
            <div className="divide-y divide-zinc-800/50">
              {payments.length ? payments.map((payment) => (
                <div key={payment.id} className="px-5 py-4 transition-colors hover:bg-zinc-800/20">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-200">{payment.month}</p>
                    <p className="text-sm font-semibold text-emerald-400">₹{payment.amount.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1"><Calendar size={11} /> {formatDisplayDate(payment.paymentDate)}</span>
                      <span className="flex items-center gap-1"><CreditCard size={11} /> {payment.paymentMode ?? 'Cash'}</span>
                    </div>
                    <span className={payment.pendingBalance > 0 ? 'badge badge-pending text-[10px]' : 'badge badge-active text-[10px]'}>
                      {payment.pendingBalance > 0 ? `Due ₹${payment.pendingBalance.toLocaleString('en-IN')}` : 'Paid'}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="px-5 py-6 text-sm text-zinc-500">No payments have been recorded yet.</div>
              )}
            </div>
            <div className="border-t border-zinc-800 bg-zinc-800/30 px-5 py-4">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Clock size={12} className="text-amber-500" />
                <span>
                  Next renewal due:
                  <span className="ml-1 font-medium text-zinc-300">{formatDisplayDate(activeFee?.dueDate ?? member.expiryDate)}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
