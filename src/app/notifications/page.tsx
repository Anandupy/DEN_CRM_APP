'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Bell, CheckCheck, Trash2, AlertCircle, CreditCard, UserCheck, Info, CheckCircle2 } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


type NotifType = 'fee' | 'attendance' | 'expiry' | 'system' | 'new_member';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const initialNotifs: Notification[] = [
  { id: 'NF001', type: 'fee', title: 'Overdue Fee Alert', message: 'Vikram Desai (DEN-003) has an overdue fee of ₹12,000 for 85 days. Immediate action required.', time: '2 min ago', read: false },
  { id: 'NF002', type: 'expiry', title: 'Membership Expiring Soon', message: 'Manish Sharma (DEN-010) membership expires today (09 Apr 2026). Renewal reminder sent.', time: '15 min ago', read: false },
  { id: 'NF003', type: 'new_member', title: 'New Member Joined', message: 'Kavya Reddy (DEN-002) has joined with Annual plan. Assigned to trainer Priya Sharma.', time: '1 hr ago', read: false },
  { id: 'NF004', type: 'fee', title: 'Payment Received', message: 'Sneha Iyer (DEN-009) paid ₹12,000 via UPI for Annual plan renewal.', time: '3 hrs ago', read: true },
  { id: 'NF005', type: 'attendance', title: 'Low Attendance Alert', message: 'Vikram Desai (DEN-003) attendance dropped to 45% this month. Consider follow-up.', time: '5 hrs ago', read: true },
  { id: 'NF006', type: 'expiry', title: 'Membership Expired', message: 'Rohit Sharma (DEN-005) membership expired on 31 Mar 2026. 9 days overdue.', time: '1 day ago', read: true },
  { id: 'NF007', type: 'system', title: 'System Update', message: 'DEN Fitness ERP has been updated to v2.1. New features: bulk attendance marking, PDF export.', time: '2 days ago', read: true },
  { id: 'NF008', type: 'fee', title: 'Fee Reminder Sent', message: 'Automated fee reminders sent to 5 members with pending dues for April 2026.', time: '3 days ago', read: true },
  { id: 'NF009', type: 'new_member', title: 'New Member Joined', message: 'Preethi Nair (DEN-011) has joined with Monthly plan. Assigned to trainer Suresh Kumar.', time: '3 days ago', read: true },
  { id: 'NF010', type: 'attendance', title: 'Full Attendance', message: 'Kavya Reddy (DEN-002) and Preethi Nair (DEN-011) achieved 100% attendance this week!', time: '4 days ago', read: true },
];

const typeConfig: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
  fee: { icon: CreditCard, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  attendance: { icon: UserCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  expiry: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  system: { icon: Info, color: 'text-zinc-400', bg: 'bg-zinc-700/50' },
  new_member: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>(initialNotifs);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifs.filter(n => !n.read).length;
  const displayed = filter === 'unread' ? notifs.filter(n => !n.read) : notifs;

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotif = (id: string) => setNotifs(prev => prev.filter(n => n.id !== id));
  const clearAll = () => setNotifs([]);

  return (
    <AppLayout activePath="/notifications">
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-amber-500/20 text-amber-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">System alerts, fee reminders & activity updates</p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="btn-secondary text-xs"><CheckCheck size={14} /> Mark All Read</button>
            )}
            <button onClick={clearAll} className="btn-danger text-xs"><Trash2 size={14} /> Clear All</button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
          {(['all', 'unread'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === f ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {f === 'all' ? `All (${notifs.length})` : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>

        {/* Notifications */}
        {displayed.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <Bell size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayed.map(notif => {
              const config = typeConfig[notif.type];
              const Icon = config.icon;
              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                    notif.read
                      ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' :'bg-zinc-900 border-zinc-700 hover:border-zinc-600'
                  }`}
                  onClick={() => markRead(notif.id)}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${config.bg}`}>
                    <Icon size={16} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`text-sm font-semibold ${notif.read ? 'text-zinc-300' : 'text-zinc-100'}`}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="w-2 h-2 bg-amber-500 rounded-full shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">{notif.message}</p>
                    <p className="text-[10px] text-zinc-700 mt-1.5">{notif.time}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteNotif(notif.id); }}
                    className="p-1.5 rounded-lg text-zinc-700 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}