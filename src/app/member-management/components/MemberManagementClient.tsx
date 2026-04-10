'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import MemberTableHeader from './MemberTableHeader';
import MemberTable from './MemberTable';
import MemberModal from './MemberModal';
import BulkActionBar from './BulkActionBar';
import { Member, PlanPrice, mockMembers } from './memberData';
import { planPricing } from '@/lib/erp/mock-data';
import {
  createOrUpdateMemberInSupabase,
  deleteMembersInSupabase,
  loadErpSnapshot,
  updateMemberFieldInSupabase,
} from '@/lib/erp/data';
import { useAuth } from '@/components/providers/AuthProvider';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export default function MemberManagementClient() {
  const { profile } = useAuth();
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [planOptions, setPlanOptions] = useState<PlanPrice[]>(planPricing);
  const [trainerOptions, setTrainerOptions] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterTrainer, setFilterTrainer] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFees, setFilterFees] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<keyof Member>('joinDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dataSource, setDataSource] = useState<'supabase' | 'mock'>('mock');

  const refreshMembers = async () => {
    loadErpSnapshot().then((snapshot) => {
      setMembers(snapshot.members);
      setPlanOptions(snapshot.planPricing);
      setTrainerOptions(snapshot.trainers.map((trainer) => trainer.name));
      setDataSource(snapshot.source);
    });
  };

  useEffect(() => {
    refreshMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    let result = [...members];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.mobile.includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.memberId.toLowerCase().includes(q)
      );
    }
    if (filterPlan !== 'all') result = result.filter((m) => m.plan === filterPlan);
    if (filterTrainer !== 'all') result = result.filter((m) => m.trainer === filterTrainer);
    if (filterStatus !== 'all') result = result.filter((m) => m.status === filterStatus);
    if (filterFees !== 'all') result = result.filter((m) => m.feesStatus === filterFees);

    result.sort((a, b) => {
      const av = a[sortKey] as string;
      const bv = b[sortKey] as string;
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

    return result;
  }, [members, search, filterPlan, filterTrainer, filterStatus, filterFees, sortKey, sortDir]);

  const totalPages = Math.ceil(filteredMembers.length / pageSize);
  const paginatedMembers = filteredMembers.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: keyof Member) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(paginatedMembers.map((m) => m.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    setSelectedIds(next);
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setModalOpen(true);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setModalOpen(true);
  };

  const handleDeleteMember = async (id: string) => {
    try {
      if (isSupabaseConfigured()) {
        await deleteMembersInSupabase([id]);
        await refreshMembers();
      } else {
        setMembers((prev) => prev.filter((m) => m.id !== id));
      }
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete member');
    }
  };

  const handleBulkDelete = async () => {
    try {
      if (isSupabaseConfigured()) {
        await deleteMembersInSupabase(Array.from(selectedIds));
        await refreshMembers();
      } else {
        setMembers((prev) => prev.filter((m) => !selectedIds.has(m.id)));
      }
      setSelectedIds(new Set());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete members');
    }
  };

  const handleSaveMember = async (data: Member) => {
    if (isSupabaseConfigured()) {
      await createOrUpdateMemberInSupabase(
        {
          id: editingMember?.id,
          memberId: editingMember?.memberId || undefined,
          name: data.name,
          mobile: data.mobile,
          email: data.email,
          address: data.address,
          gender: data.gender,
          age: data.age,
          joinDate: data.joinDate,
          expiryDate: data.expiryDate,
          plan: data.plan,
          trainer: data.trainer,
          emergencyContact: data.emergencyContact,
          medicalNotes: data.medicalNotes,
          status: data.status,
          feesStatus: data.feesStatus,
          lastPaymentMode: data.lastPaymentMode,
          lastPaymentDate: data.lastPaymentDate,
        },
        profile?.id
      );
      await refreshMembers();
    } else if (editingMember) {
      setMembers((prev) => prev.map((m) => (m.id === data.id ? data : m)));
    } else {
      const newId = `member-${String(members.length + 1).padStart(3, '0')}`;
      setMembers((prev) => [{ ...data, id: newId, memberId: newId.toUpperCase() }, ...prev]);
    }
    setModalOpen(false);
  };

  const handleStatusChange = async (id: string, status: Member['status']) => {
    try {
      if (isSupabaseConfigured()) {
        await updateMemberFieldInSupabase(id, { status });
        await refreshMembers();
      } else {
        setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update status');
    }
  };

  const handleFeesStatusChange = async (id: string, feesStatus: Member['feesStatus']) => {
    try {
      if (isSupabaseConfigured()) {
        await updateMemberFieldInSupabase(id, { feesStatus });
        await refreshMembers();
      } else {
        setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, feesStatus } : m)));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update fees status');
    }
  };

  return (
    <>
      <Toaster position="bottom-right" theme="dark" richColors />
      <div className="space-y-4 fade-in">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Member Management</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              {filteredMembers.length} of {members.length} members &nbsp;·&nbsp; {dataSource === 'supabase' ? 'Synced from Supabase' : 'Showing fallback ERP data'}
            </p>
          </div>
          <button onClick={handleAddMember} className="btn-primary shrink-0">
            <span className="text-lg leading-none">+</span>
            Add New Member
          </button>
        </div>

        {/* Filters */}
        <MemberTableHeader
          search={search}
          plans={planOptions.map((plan) => plan.plan)}
          trainers={trainerOptions}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          filterPlan={filterPlan}
          onFilterPlan={(v) => { setFilterPlan(v); setPage(1); }}
          filterTrainer={filterTrainer}
          onFilterTrainer={(v) => { setFilterTrainer(v); setPage(1); }}
          filterStatus={filterStatus}
          onFilterStatus={(v) => { setFilterStatus(v); setPage(1); }}
          filterFees={filterFees}
          onFilterFees={(v) => { setFilterFees(v); setPage(1); }}
          totalCount={filteredMembers.length}
        />

        {/* Bulk action bar */}
        <BulkActionBar
          selectedCount={selectedIds.size}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => setSelectedIds(new Set())}
        />

        {/* Table */}
        <MemberTable
          members={paginatedMembers}
          allMembers={filteredMembers}
          selectedIds={selectedIds}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          onEdit={handleEditMember}
          onDelete={handleDeleteMember}
          onStatusChange={handleStatusChange}
          onFeesStatusChange={handleFeesStatusChange}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          totalCount={filteredMembers.length}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        />
      </div>

      {/* Modal */}
      {modalOpen && (
        <MemberModal
          member={editingMember}
          trainerOptions={trainerOptions}
          planOptions={planOptions}
          onSave={handleSaveMember}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
