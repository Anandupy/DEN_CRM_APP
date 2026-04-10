'use client';
import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import MetricsBentoGrid from './components/MetricsBentoGrid';
import RevenueAttendanceCharts from './components/RevenueAttendanceCharts';
import PendingFeesAlert from './components/PendingFeesAlert';
import RecentActivityFeed from './components/RecentActivityFeed';
import DashboardQuickActions from './components/DashboardQuickActions';
import { loadErpSnapshot } from '@/lib/erp/data';
import { mockErpSnapshot } from '@/lib/erp/mock-data';
import type { ErpSnapshot } from '@/lib/erp/types';

export default function OwnerAdminDashboardPage() {
  const [snapshot, setSnapshot] = useState<ErpSnapshot>(mockErpSnapshot);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);
    loadErpSnapshot()
      .then(setSnapshot)
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : 'Unable to load dashboard analytics.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const pendingFees = snapshot.fees
    .filter((fee) => fee.status !== 'paid')
    .slice(0, 6)
    .map((fee) => ({
      ...fee,
      mobile: snapshot.members.find((member) => member.memberId === fee.memberId)?.mobile,
    }));

  return (
    <AppLayout activePath="/owner-admin-dashboard">
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Good Morning, Denzil 👋</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Thursday, 09 April 2026 &nbsp;·&nbsp; Here&apos;s your gym overview for today
              <span className="ml-2 text-[11px] uppercase tracking-wide text-amber-500/80">
                {snapshot.source === 'supabase' ? 'Live Supabase data' : 'Mock fallback'}
              </span>
            </p>
          </div>
          <DashboardQuickActions />
        </div>

        {loadError ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {loadError}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-10 text-sm text-zinc-500">
            Loading real dashboard metrics...
          </div>
        ) : null}

        {/* KPI Bento Grid */}
        <MetricsBentoGrid summary={snapshot.dashboard} />

        {/* Charts row */}
        <RevenueAttendanceCharts
          revenueData={snapshot.revenueSeries}
          attendanceData={snapshot.attendanceSeries}
        />

        {/* Bottom row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <RecentActivityFeed activities={snapshot.activities} />
          </div>
          <div>
            <PendingFeesAlert pendingFees={pendingFees} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
