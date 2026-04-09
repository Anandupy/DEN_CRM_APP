'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { CreditCard, CheckCircle2, Clock, Calendar, TrendingUp } from 'lucide-react';

const paymentHistory = [
  { id: 'F001', month: 'April 2026', amount: 12000, mode: 'UPI', date: '01 Apr 2026', status: 'paid' as const, plan: 'Annual' },
  { id: 'F002', month: 'April 2025', amount: 12000, mode: 'UPI', date: '10 Apr 2025', status: 'paid' as const, plan: 'Annual' },
];

const planDetails = {
  name: 'Annual Plan',
  price: 12000,
  duration: '12 Months',
  startDate: '10 Apr 2025',
  endDate: '09 Apr 2026',
  features: ['Full gym access', 'Locker facility', '6 Personal training sessions', 'Diet consultation', 'Fitness assessment'],
};

export default function MemberFeesPage() {
  const totalPaid = paymentHistory.reduce((s, p) => s + p.amount, 0);

  return (
    <AppLayout activePath="/member-fees">
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">My Fees</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Payment history and membership plan details</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="metric-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-500 uppercase tracking-wide">Total Paid</span>
              <TrendingUp size={16} className="text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 stat-value">₹{totalPaid.toLocaleString('en-IN')}</p>
          </div>
          <div className="metric-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-500 uppercase tracking-wide">Current Plan</span>
              <CreditCard size={16} className="text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400">Annual</p>
          </div>
          <div className="metric-card col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-500 uppercase tracking-wide">Status</span>
              <CheckCircle2 size={16} className="text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">Paid</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plan Details */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={15} className="text-amber-500" />
              <h3 className="text-sm font-semibold text-zinc-200">Current Plan</h3>
            </div>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
              <p className="text-amber-400 font-bold text-lg">{planDetails.name}</p>
              <p className="text-zinc-400 text-sm">₹{planDetails.price.toLocaleString('en-IN')} / year</p>
            </div>
            <div className="space-y-2.5 mb-4">
              {[
                { label: 'Duration', value: planDetails.duration },
                { label: 'Start Date', value: planDetails.startDate },
                { label: 'End Date', value: planDetails.endDate },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-2 border-b border-zinc-800/50">
                  <span className="text-zinc-500 text-xs">{row.label}</span>
                  <span className="text-zinc-300 text-xs font-medium">{row.value}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Included Features</p>
              <ul className="space-y-1.5">
                {planDetails.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-zinc-400">
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-200">Payment History</h3>
            </div>
            <div className="divide-y divide-zinc-800/50">
              {paymentHistory.map(payment => (
                <div key={payment.id} className="px-5 py-4 hover:bg-zinc-800/20 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-zinc-200 font-medium text-sm">{payment.month}</p>
                    <p className="text-emerald-400 font-semibold text-sm">₹{payment.amount.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1"><Calendar size={11} /> {payment.date}</span>
                      <span className="flex items-center gap-1"><CreditCard size={11} /> {payment.mode}</span>
                    </div>
                    <span className="badge badge-active text-[10px]">Paid</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 bg-zinc-800/30 border-t border-zinc-800">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Clock size={12} className="text-amber-500" />
                <span>Next renewal due: <span className="text-zinc-300 font-medium">10 Apr 2027</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
