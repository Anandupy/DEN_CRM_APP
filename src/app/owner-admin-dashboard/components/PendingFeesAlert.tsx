'use client';
import React, { useState } from 'react';
import { AlertCircle, MessageSquare, ChevronRight, IndianRupee, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

const pendingFees = [
  { id: 'member-023', name: 'Vikram Desai', plan: 'Annual', amount: 12000, dueDate: '25 Mar', daysOverdue: 15, mobile: '98765-01234' },
  { id: 'member-041', name: 'Sunita Rao', plan: 'Quarterly', amount: 4500, dueDate: '01 Apr', daysOverdue: 8, mobile: '91234-56789' },
  { id: 'member-058', name: 'Deepak Nair', plan: 'Monthly', amount: 1800, dueDate: '05 Apr', daysOverdue: 4, mobile: '87654-32109' },
  { id: 'member-067', name: 'Pooja Mehta', plan: 'Quarterly', amount: 4500, dueDate: '07 Apr', daysOverdue: 2, mobile: '99887-76655' },
  { id: 'member-074', name: 'Rahul Joshi', plan: 'Monthly', amount: 1800, dueDate: '08 Apr', daysOverdue: 1, mobile: '77665-54433' },
  { id: 'member-082', name: 'Ananya Singh', plan: 'Annual', amount: 12000, dueDate: '09 Apr', daysOverdue: 0, mobile: '88776-65544' },
];

export default function PendingFeesAlert() {
  const [sending, setSending] = useState<string | null>(null);

  const handleSendReminder = async (memberId: string, name: string) => {
    setSending(memberId);
    // TODO: Backend — POST /api/notifications/whatsapp-reminder with { memberId, type: 'fee_due' }
    await new Promise((r) => setTimeout(r, 800));
    setSending(null);
    toast.success(`WhatsApp reminder sent to ${name}`);
  };

  const totalOverdue = pendingFees.reduce((sum, m) => sum + m.amount, 0);

  return (
    <>
      <Toaster position="bottom-right" theme="dark" richColors />
      <div className="bg-zinc-900 border border-red-500/15 rounded-xl overflow-hidden h-full">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-red-500/5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400" />
              <h3 className="text-sm font-semibold text-zinc-200">Pending Fees</h3>
            </div>
            <span className="badge badge-overdue text-[10px]">{pendingFees.length} members</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <IndianRupee size={11} />
            <span>Total overdue:</span>
            <span className="text-red-400 font-semibold font-mono ml-1">
              ₹{totalOverdue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-zinc-800/60 overflow-y-auto max-h-[380px]">
          {pendingFees.map((member) => (
            <div key={`pending-${member.id}`} className="p-3.5 hover:bg-zinc-800/30 transition-colors group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-zinc-200 truncate">{member.name}</p>
                    {member.daysOverdue > 7 && (
                      <span className="badge badge-overdue text-[9px] px-1.5 py-0.5 shrink-0">
                        {member.daysOverdue}d overdue
                      </span>
                    )}
                    {member.daysOverdue > 0 && member.daysOverdue <= 7 && (
                      <span className="badge badge-pending text-[9px] px-1.5 py-0.5 shrink-0">
                        {member.daysOverdue}d due
                      </span>
                    )}
                    {member.daysOverdue === 0 && (
                      <span className="badge bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] px-1.5 py-0.5 shrink-0">
                        Due today
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                    <span>{member.plan}</span>
                    <span>·</span>
                    <span>Due {member.dueDate}</span>
                    <span>·</span>
                    <span className="font-mono">{member.mobile}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-sm font-bold text-red-400 font-mono">
                    ₹{member.amount.toLocaleString('en-IN')}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleSendReminder(member.id, member.name)}
                      disabled={sending === member.id}
                      className="p-1 rounded text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      title={`Send WhatsApp reminder to ${member.name}`}
                    >
                      {sending === member.id ? (
                        <div className="w-3 h-3 border border-emerald-400/40 border-t-emerald-400 rounded-full animate-spin" />
                      ) : (
                        <MessageSquare size={12} />
                      )}
                    </button>
                    <button
                      className="p-1 rounded text-zinc-600 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                      title={`Call ${member.name}`}
                    >
                      <Phone size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800">
          <button className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-amber-500 hover:text-amber-400 py-2 rounded-lg hover:bg-amber-500/8 transition-colors">
            View All 34 Pending Members
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </>
  );
}