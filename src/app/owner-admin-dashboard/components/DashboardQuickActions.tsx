'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, UserCheck, CreditCard, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

export default function DashboardQuickActions() {
  const router = useRouter();

  return (
    <>
      <Toaster position="bottom-right" theme="dark" richColors />
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => router?.push('/member-management')}
          className="btn-primary text-xs py-2"
        >
          <UserPlus size={14} />
          Add Member
        </button>
        <button
          onClick={() => toast?.success('Attendance module opening...')}
          className="btn-secondary text-xs py-2"
        >
          <UserCheck size={14} />
          Mark Attendance
        </button>
        <button
          onClick={() => toast?.success('Fees collection opened')}
          className="btn-secondary text-xs py-2"
        >
          <CreditCard size={14} />
          Collect Fee
        </button>
        <button
          onClick={() => toast?.success('Generating report...')}
          className="btn-secondary text-xs py-2"
        >
          <Download size={14} />
          Export
        </button>
      </div>
    </>
  );
}