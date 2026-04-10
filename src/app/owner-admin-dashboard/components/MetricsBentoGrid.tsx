'use client';
import React from 'react';
import {
  Users, UserCheck, UserX, AlertCircle,
  IndianRupee, UserPlus, Clock, TrendingUp, TrendingDown
} from 'lucide-react';
import type { DashboardSummary } from '@/lib/erp/types';


// Grid plan: 7 cards → grid-cols-4
// Row 1: hero (Total Members, spans 2 cols) + Present Today + Absent Today
// Row 2: Pending Fees (alert) + Monthly Revenue + New Admissions + Expired Memberships

interface MetricCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: React.ElementType;
  trend?: { value: string; positive: boolean } | null;
  variant?: 'default' | 'hero' | 'alert' | 'success' | 'warning';
  colSpan?: string;
}

function MetricCard({ title, value, subtext, icon: Icon, trend, variant = 'default', colSpan = '' }: MetricCardProps) {
  const variantStyles: Record<string, string> = {
    default: 'bg-zinc-900 border-zinc-800',
    hero: 'bg-gradient-to-br from-amber-500/10 to-zinc-900 border-amber-500/20',
    alert: 'bg-gradient-to-br from-red-500/8 to-zinc-900 border-red-500/20',
    success: 'bg-gradient-to-br from-emerald-500/8 to-zinc-900 border-emerald-500/20',
    warning: 'bg-gradient-to-br from-amber-500/8 to-zinc-900 border-amber-500/20',
  };

  const iconBgStyles: Record<string, string> = {
    default: 'bg-zinc-800 text-zinc-400',
    hero: 'bg-amber-500/20 text-amber-400',
    alert: 'bg-red-500/15 text-red-400',
    success: 'bg-emerald-500/15 text-emerald-400',
    warning: 'bg-amber-500/15 text-amber-400',
  };

  const valueStyles: Record<string, string> = {
    default: 'text-zinc-100',
    hero: 'text-amber-400',
    alert: 'text-red-400',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
  };

  return (
    <div className={`metric-card border ${variantStyles[variant]} ${colSpan} relative`}>
      {variant === 'hero' && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
      )}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBgStyles[variant]}`}>
          <Icon size={18} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend.positive
              ? 'bg-emerald-500/10 text-emerald-400' :'bg-red-500/10 text-red-400'
          }`}>
            {trend.positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend.value}
          </div>
        )}
      </div>
      <div>
        <p className={`text-2xl font-bold stat-value ${valueStyles[variant]} ${variant === 'hero' ? 'text-3xl' : ''}`}>
          {value}
        </p>
        <p className="text-xs font-semibold text-zinc-400 mt-0.5 uppercase tracking-wide">{title}</p>
        <p className="text-xs text-zinc-600 mt-1">{subtext}</p>
      </div>
    </div>
  );
}

interface MetricsBentoGridProps {
  summary: DashboardSummary;
}

function formatCompactCurrency(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
}

export default function MetricsBentoGrid({ summary }: MetricsBentoGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Row 1 */}
        <MetricCard
        title="Total Active Members"
        value={String(summary.totalActiveMembers)}
        subtext={`${summary.joinedThisMonth} joined this month`}
        icon={Users}
        trend={{ value: `+${summary.joinedThisMonth}`, positive: true }}
        variant="hero"
        colSpan="col-span-2 lg:col-span-2"
      />
      <MetricCard
        title="Present Today"
        value={String(summary.presentToday)}
        subtext={`${summary.attendanceRateToday}% attendance rate`}
        icon={UserCheck}
        trend={{ value: '+8.1%', positive: true }}
        variant="success"
      />
      <MetricCard
        title="Absent Today"
        value={String(summary.absentToday)}
        subtext={`${summary.inactiveForSevenDays} haven't visited in 7+ days`}
        icon={UserX}
        trend={{ value: '-3.2%', positive: false }}
        variant="default"
      />

      {/* Row 2 */}
      <MetricCard
        title="Pending Fees"
        value={String(summary.pendingFeesCount)}
        subtext={`${formatCompactCurrency(summary.pendingFeesAmount)} total overdue`}
        icon={AlertCircle}
        trend={{ value: `${summary.pendingFeesCount} open`, positive: false }}
        variant="alert"
      />
      <MetricCard
        title="Monthly Revenue"
        value={formatCompactCurrency(summary.monthlyRevenue)}
        subtext="April 2026 collected"
        icon={IndianRupee}
        trend={{ value: `+${summary.monthlyRevenueGrowth}%`, positive: true }}
        variant="success"
      />
      <MetricCard
        title="New Admissions"
        value={String(summary.newAdmissions)}
        subtext="This month"
        icon={UserPlus}
        trend={{ value: `+${summary.newAdmissions}`, positive: true }}
        variant="warning"
      />
      <MetricCard
        title="Expiring Soon"
        value={String(summary.expiringSoon)}
        subtext="Memberships expire in ≤7 days"
        icon={Clock}
        trend={{ value: `${summary.expiringSoon} at risk`, positive: false }}
        variant="alert"
      />
    </div>
  );
}
