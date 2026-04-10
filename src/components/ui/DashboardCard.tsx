'use client';
import React from 'react';

interface DashboardCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  hint?: string;
}

const toneClasses = {
  default: { text: 'text-zinc-200', bg: 'bg-zinc-800/60' },
  success: { text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  warning: { text: 'text-amber-400', bg: 'bg-amber-500/10' },
  danger: { text: 'text-red-400', bg: 'bg-red-500/10' },
  info: { text: 'text-blue-400', bg: 'bg-blue-500/10' },
};

export default function DashboardCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
  hint,
}: DashboardCardProps) {
  const theme = toneClasses[tone];

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">{label}</span>
        <div className={`p-2 rounded-lg ${theme.bg}`}>
          <Icon size={16} className={theme.text} />
        </div>
      </div>
      <p className={`text-2xl font-bold stat-value ${theme.text}`}>{value}</p>
      {hint ? <p className="text-xs text-zinc-600 mt-1">{hint}</p> : null}
    </div>
  );
}
