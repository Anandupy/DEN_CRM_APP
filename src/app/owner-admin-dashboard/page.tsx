import React from 'react';
import AppLayout from '@/components/AppLayout';
import MetricsBentoGrid from './components/MetricsBentoGrid';
import RevenueAttendanceCharts from './components/RevenueAttendanceCharts';
import PendingFeesAlert from './components/PendingFeesAlert';
import RecentActivityFeed from './components/RecentActivityFeed';
import DashboardQuickActions from './components/DashboardQuickActions';

export default function OwnerAdminDashboardPage() {
  return (
    <AppLayout activePath="/owner-admin-dashboard">
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Good Morning, Rajesh 👋</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Thursday, 09 April 2026 &nbsp;·&nbsp; Here&apos;s your gym overview for today</p>
          </div>
          <DashboardQuickActions />
        </div>

        {/* KPI Bento Grid */}
        <MetricsBentoGrid />

        {/* Charts row */}
        <RevenueAttendanceCharts />

        {/* Bottom row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <RecentActivityFeed />
          </div>
          <div>
            <PendingFeesAlert />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}