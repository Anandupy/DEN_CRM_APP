'use client';
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { IndianRupee, Users, TrendingUp } from 'lucide-react';
import type { AttendanceTrendPoint, RevenuePoint } from '@/lib/erp/types';

interface RevenueAttendanceChartsProps {
  revenueData: RevenuePoint[];
  attendanceData: AttendanceTrendPoint[];
}

function formatRevenue(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${(value / 1000).toFixed(0)}K`;
}

interface RevenueTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

function RevenueTooltip({ active, payload, label }: RevenueTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-xl text-xs">
      <p className="font-semibold text-zinc-300 mb-2">{label} 2026</p>
      {payload.map((entry) => (
        <div key={`rev-tt-${entry.name}`} className="flex items-center justify-between gap-4">
          <span className="text-zinc-500 capitalize">{entry.name}</span>
          <span className="font-mono font-semibold" style={{ color: entry.color }}>
            {formatRevenue(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

interface AttendanceTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

function AttendanceTooltip({ active, payload, label }: AttendanceTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-xl text-xs">
      <p className="font-semibold text-zinc-300 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={`att-tt-${entry.name}`} className="flex items-center justify-between gap-4">
          <span className="text-zinc-500 capitalize">{entry.name}</span>
          <span className="font-mono font-semibold" style={{ color: entry.color }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function RevenueAttendanceCharts({ revenueData, attendanceData }: RevenueAttendanceChartsProps) {
  const bestDay = [...attendanceData].sort(
    (a, b) => (b.present / Math.max(b.present + b.absent, 1)) - (a.present / Math.max(a.present + a.absent, 1))
  )[0];
  const today = attendanceData[attendanceData.length - 1];
  const todayRate = today ? ((today.present / Math.max(today.present + today.absent, 1)) * 100).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Revenue Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <IndianRupee size={16} className="text-amber-400" />
              <h3 className="text-sm font-semibold text-zinc-200">Monthly Revenue</h3>
            </div>
            <p className="text-xs text-zinc-500">Collected vs. Target · Nov 2025 – Apr 2026</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-zinc-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
              Collected
            </span>
            <span className="flex items-center gap-1.5 text-zinc-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-zinc-600 inline-block" />
              Target
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={revenueData} barCategoryGap="30%" barGap={4}>
            <defs>
              <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(38 92% 50%)" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(38 92% 50%)" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 14%)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: 'hsl(240 5% 55%)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatRevenue}
              tick={{ fill: 'hsl(240 5% 55%)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip content={<RevenueTooltip />} />
            <Bar dataKey="revenue" fill="url(#revGradient)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="target" fill="hsl(240 5% 22%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-800">
          <TrendingUp size={13} className="text-emerald-400" />
          <span className="text-xs text-zinc-500">April 2026 is the highest revenue month on record</span>
        </div>
      </div>

      {/* Attendance Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Users size={16} className="text-blue-400" />
              <h3 className="text-sm font-semibold text-zinc-200">Daily Attendance</h3>
            </div>
            <p className="text-xs text-zinc-500">Present vs. Absent · Last 7 days</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-zinc-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Present
            </span>
            <span className="flex items-center gap-1.5 text-zinc-500">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-600 inline-block" />
              Absent
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={attendanceData}>
            <defs>
              <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(240 5% 40%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(240 5% 40%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 14%)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: 'hsl(240 5% 55%)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'hsl(240 5% 55%)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip content={<AttendanceTooltip />} />
            <Area
              type="monotone"
              dataKey="present"
              stroke="hsl(142 71% 45%)"
              strokeWidth={2}
              fill="url(#presentGrad)"
            />
            <Area
              type="monotone"
              dataKey="absent"
              stroke="hsl(240 5% 40%)"
              strokeWidth={2}
              fill="url(#absentGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
          <span className="text-xs text-zinc-500">Today&apos;s rate: {todayRate}%</span>
          <span className="text-xs text-emerald-400 font-medium">
            ↑ Best day this week: {bestDay?.day ?? 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}
