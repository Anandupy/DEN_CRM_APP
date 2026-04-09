'use client';
import React, { useState, useMemo } from 'react';
import { Toaster } from 'sonner';
import MemberTableHeader from './MemberTableHeader';
import MemberTable from './MemberTable';
import MemberModal from './MemberModal';
import BulkActionBar from './BulkActionBar';
import { Member, mockMembers } from './memberData';

export default function MemberManagementClient() {
  const [members, setMembers] = useState<Member[]>(mockMembers);
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

  const handleDeleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
  };

  const handleBulkDelete = () => {
    setMembers((prev) => prev.filter((m) => !selectedIds.has(m.id)));
    setSelectedIds(new Set());
  };

  const handleSaveMember = (data: Member) => {
    if (editingMember) {
      setMembers((prev) => prev.map((m) => (m.id === data.id ? data : m)));
    } else {
      const newId = `member-${String(members.length + 1).padStart(3, '0')}`;
      setMembers((prev) => [{ ...data, id: newId, memberId: newId.toUpperCase() }, ...prev]);
    }
    setModalOpen(false);
  };

  const handleStatusChange = (id: string, status: Member['status']) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  const handleFeesStatusChange = (id: string, feesStatus: Member['feesStatus']) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, feesStatus } : m)));
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
              {filteredMembers.length} of {members.length} members &nbsp;·&nbsp; Last synced 2 min ago
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
          onSave={handleSaveMember}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}