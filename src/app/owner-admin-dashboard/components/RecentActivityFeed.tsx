import React from 'react';
import {
  UserPlus, CreditCard, UserCheck, UserX, RefreshCw,
  AlertCircle, Dumbbell, Clock
} from 'lucide-react';
import type { ActivityItem } from '@/lib/erp/types';


type ActivityType = 'new_member' | 'fee_paid' | 'attendance_marked' | 'membership_expired' | 'plan_changed' | 'fee_overdue' | 'trainer_assigned' | 'late_entry';

const activityConfig: Record<ActivityType, { icon: React.ElementType; iconBg: string; iconColor: string; label: string }> = {
  new_member: { icon: UserPlus, iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400', label: 'New Member' },
  fee_paid: { icon: CreditCard, iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400', label: 'Fee Paid' },
  attendance_marked: { icon: UserCheck, iconBg: 'bg-blue-500/15', iconColor: 'text-blue-400', label: 'Attendance' },
  membership_expired: { icon: Clock, iconBg: 'bg-zinc-700/40', iconColor: 'text-zinc-400', label: 'Expired' },
  plan_changed: { icon: RefreshCw, iconBg: 'bg-purple-500/15', iconColor: 'text-purple-400', label: 'Plan Change' },
  fee_overdue: { icon: AlertCircle, iconBg: 'bg-red-500/15', iconColor: 'text-red-400', label: 'Overdue' },
  trainer_assigned: { icon: Dumbbell, iconBg: 'bg-cyan-500/15', iconColor: 'text-cyan-400', label: 'Trainer' },
  late_entry: { icon: UserX, iconBg: 'bg-orange-500/15', iconColor: 'text-orange-400', label: 'Late Entry' },
};

interface RecentActivityFeedProps {
  activities: ActivityItem[];
}

export default function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Recent Activity</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Live feed · Updated 2 min ago</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs text-zinc-500">Live</span>
        </div>
      </div>

      <div className="divide-y divide-zinc-800/60 overflow-y-auto max-h-[400px]">
        {activities.map((activity) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;
          return (
            <div key={activity.id} className="flex items-start gap-3 p-3.5 hover:bg-zinc-800/30 transition-colors group">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${config.iconBg}`}>
                <Icon size={15} className={config.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-200 truncate">{activity.member}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{activity.detail}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] text-zinc-600 whitespace-nowrap">{activity.time}</span>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${config.iconBg} ${config.iconColor}`}>
                      {config.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-zinc-800">
        <button className="w-full text-xs font-semibold text-zinc-500 hover:text-zinc-300 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
          Load more activity
        </button>
      </div>
    </div>
  );
}
