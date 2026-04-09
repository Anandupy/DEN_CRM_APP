import React from 'react';
import {
  UserPlus, CreditCard, UserCheck, UserX, RefreshCw,
  AlertCircle, Dumbbell, Clock
} from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


type ActivityType = 'new_member' | 'fee_paid' | 'attendance_marked' | 'membership_expired' | 'plan_changed' | 'fee_overdue' | 'trainer_assigned' | 'late_entry';

interface Activity {
  id: string;
  type: ActivityType;
  member: string;
  detail: string;
  time: string;
  amount?: string;
}

const activities: Activity[] = [
  { id: 'act-001', type: 'new_member', member: 'Kavya Reddy', detail: 'Joined on Annual Plan · Trainer: Priya Sharma', time: '08:12 AM' },
  { id: 'act-002', type: 'fee_paid', member: 'Santosh Kulkarni', detail: 'Monthly fee paid · UPI · ₹1,800', time: '07:58 AM', amount: '₹1,800' },
  { id: 'act-003', type: 'attendance_marked', member: 'Batch A (38 members)', detail: 'Morning session marked present · 6:00–8:00 AM', time: '07:45 AM' },
  { id: 'act-004', type: 'late_entry', member: 'Rohan Verma', detail: 'Late entry recorded · 09:32 AM (session at 09:00)', time: '09:34 AM' },
  { id: 'act-005', type: 'fee_overdue', member: 'Vikram Desai', detail: 'Fee overdue by 15 days · ₹12,000 pending', time: '09:00 AM' },
  { id: 'act-006', type: 'membership_expired', member: 'Neha Patil', detail: 'Quarterly plan expired · Renewal pending', time: '08:45 AM' },
  { id: 'act-007', type: 'plan_changed', member: 'Arjun Kadam', detail: 'Upgraded: Monthly → Quarterly Plan · Diff: ₹2,700', time: '08:30 AM' },
  { id: 'act-008', type: 'trainer_assigned', member: 'Sneha Iyer', detail: 'Trainer changed: Suresh → Priya Sharma', time: '08:15 AM' },
  { id: 'act-009', type: 'fee_paid', member: 'Manish Sharma', detail: 'Quarterly fee paid · Cash · ₹4,500', time: 'Yesterday', amount: '₹4,500' },
  { id: 'act-010', type: 'new_member', member: 'Preethi Nair', detail: 'Joined on Monthly Plan · Trainer: Suresh Kumar', time: 'Yesterday' },
];

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

export default function RecentActivityFeed() {
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