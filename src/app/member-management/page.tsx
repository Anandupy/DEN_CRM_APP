import React from 'react';
import AppLayout from '@/components/AppLayout';
import MemberManagementClient from './components/MemberManagementClient';

export default function MemberManagementPage() {
  return (
    <AppLayout activePath="/member-management">
      <MemberManagementClient />
    </AppLayout>
  );
}