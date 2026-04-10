'use client';
import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Pencil, Trash2, Eye, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { Member, MemberStatus, FeesStatus } from './memberData';

interface MemberTableProps {
  members: Member[];
  allMembers: Member[];
  selectedIds: Set<string>;
  sortKey: keyof Member;
  sortDir: 'asc' | 'desc';
  onSort: (key: keyof Member) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: MemberStatus) => void;
  onFeesStatusChange: (id: string, feesStatus: FeesStatus) => void;
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return <ChevronsUpDown size={12} className="text-zinc-600" />;
  return dir === 'asc'
    ? <ChevronUp size={12} className="text-amber-400" />
    : <ChevronDown size={12} className="text-amber-400" />;
}

const statusOptions: MemberStatus[] = ['active', 'inactive', 'expired', 'suspended'];
const feesOptions: FeesStatus[] = ['paid', 'pending', 'overdue'];

const statusBadgeClass: Record<MemberStatus, string> = {
  active: 'badge-active',
  inactive: 'badge-inactive',
  expired: 'badge-expired',
  suspended: 'badge badge-overdue',
};

const feesBadgeClass: Record<FeesStatus, string> = {
  paid: 'badge-active',
  pending: 'badge-pending',
  overdue: 'badge-overdue',
};

const planBadgeClass: Record<string, string> = {
  Monthly: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  Quarterly: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  'Half-Yearly': 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
  Annual: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
};

export default function MemberTable({
  members, allMembers, selectedIds, sortKey, sortDir,
  onSort, onSelectAll, onSelectOne, onEdit, onDelete,
  onStatusChange, onFeesStatusChange,
  page, pageSize, totalPages, totalCount, onPageChange, onPageSizeChange,
}: MemberTableProps) {
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
  const [feesDropdown, setFeesDropdown] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const allSelected = members.length > 0 && members.every((m) => selectedIds.has(m.id));
  const someSelected = members.some((m) => selectedIds.has(m.id));

  const handleDelete = (member: Member) => {
    setDeletingId(member.id);
    setTimeout(() => {
      onDelete(member.id);
      setDeletingId(null);
      toast.success(`${member.name} removed from member list`);
    }, 300);
  };

  const colHeader = (label: string, key: keyof Member) => (
    <th
      className="px-3 py-3 text-left cursor-pointer select-none group"
      onClick={() => onSort(key)}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">
        {label}
        <SortIcon active={sortKey === key} dir={sortDir} />
      </div>
    </th>
  );

  const pageNumbers: number[] = [];
  const startPage = Math.max(1, page - 2);
  const endPage = Math.min(totalPages, startPage + 4);
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  if (members.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-16 text-center">
        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye size={24} className="text-zinc-600" />
        </div>
        <p className="text-zinc-300 font-semibold mb-1">No members found</p>
        <p className="text-xs text-zinc-600">Try adjusting your search or filter criteria to find members.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Table wrapper with horizontal scroll */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80">
              <th className="px-3 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = !allSelected && someSelected; }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 accent-amber-500"
                />
              </th>
              {colHeader('Member ID', 'memberId')}
              <th className="px-3 py-3 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Member</th>
              {colHeader('Mobile', 'mobile')}
              {colHeader('Plan', 'plan')}
              {colHeader('Trainer', 'trainer')}
              {colHeader('Joined', 'joinDate')}
              {colHeader('Expiry', 'expiryDate')}
              <th className="px-3 py-3 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Fees</th>
              {colHeader('Attendance', 'attendancePct')}
              <th className="px-3 py-3 text-right text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {members.map((member, idx) => {
              const isSelected = selectedIds.has(member.id);
              const isDeleting = deletingId === member.id;
              return (
                <tr
                  key={member.id}
                  className={`table-row-hover transition-all duration-300 ${isSelected ? 'bg-amber-500/5' : idx % 2 === 1 ? 'bg-zinc-900/30' : ''} ${isDeleting ? 'opacity-0 scale-y-0' : ''}`}
                >
                  {/* Checkbox */}
                  <td className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onSelectOne(member.id, e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 accent-amber-500"
                    />
                  </td>

                  {/* Member ID */}
                  <td className="px-3 py-3">
                    <span className="font-mono text-xs text-zinc-500 font-medium">{member.memberId}</span>
                  </td>

                  {/* Member name + email */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${member.profileColor}`}>
                        {member.profileInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-200 truncate max-w-[140px]">{member.name}</p>
                        <p className="text-[10px] text-zinc-600 truncate max-w-[140px]">{member.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Mobile */}
                  <td className="px-3 py-3">
                    <span className="text-xs font-mono text-zinc-400">{member.mobile}</span>
                  </td>

                  {/* Plan */}
                  <td className="px-3 py-3">
                    <span className={`badge text-[10px] px-2 py-0.5 rounded-full font-medium ${planBadgeClass[member.plan] || ''}`}>
                      {member.plan}
                    </span>
                  </td>

                  {/* Trainer */}
                  <td className="px-3 py-3">
                    <span className="text-xs text-zinc-400 truncate max-w-[100px] block">{member.trainer}</span>
                  </td>

                  {/* Join Date */}
                  <td className="px-3 py-3">
                    <span className="text-xs font-mono text-zinc-500">
                      {new Date(member.joinDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </span>
                  </td>

                  {/* Expiry Date */}
                  <td className="px-3 py-3">
                    <span className={`text-xs font-mono ${
                      new Date(member.expiryDate) < new Date() ? 'text-red-400' :
                      new Date(member.expiryDate) < new Date(Date.now() + 7 * 86400000) ? 'text-amber-400': 'text-zinc-500'
                    }`}>
                      {new Date(member.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </span>
                  </td>

                  {/* Status — inline dropdown */}
                  <td className="px-3 py-3 relative">
                    <button
                      onClick={() => setStatusDropdown(statusDropdown === member.id ? null : member.id)}
                      className={`badge ${statusBadgeClass[member.status]} cursor-pointer hover:opacity-80 transition-opacity text-[10px]`}
                    >
                      <span className="capitalize">{member.status}</span>
                      <ChevronDown size={9} />
                    </button>
                    {statusDropdown === member.id && (
                      <div className="absolute left-0 top-full mt-1 z-20 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-1 min-w-[120px] fade-in">
                        {statusOptions.map((s) => (
                          <button
                            key={`status-opt-${member.id}-${s}`}
                            onClick={() => {
                              onStatusChange(member.id, s);
                              setStatusDropdown(null);
                              toast.success(`${member.name} status → ${s}`);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs capitalize hover:bg-zinc-700 transition-colors ${s === member.status ? 'text-amber-400 font-semibold' : 'text-zinc-300'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Fees status — inline dropdown */}
                  <td className="px-3 py-3 relative">
                    <button
                      onClick={() => setFeesDropdown(feesDropdown === member.id ? null : member.id)}
                      className={`badge ${feesBadgeClass[member.feesStatus]} cursor-pointer hover:opacity-80 transition-opacity text-[10px]`}
                    >
                      <span className="capitalize">{member.feesStatus}</span>
                      <ChevronDown size={9} />
                    </button>
                    {feesDropdown === member.id && (
                      <div className="absolute left-0 top-full mt-1 z-20 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-1 min-w-[110px] fade-in">
                        {feesOptions.map((f) => (
                          <button
                            key={`fees-opt-${member.id}-${f}`}
                            onClick={() => {
                              onFeesStatusChange(member.id, f);
                              setFeesDropdown(null);
                              toast.success(`${member.name} fees → ${f}`);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs capitalize hover:bg-zinc-700 transition-colors ${f === member.feesStatus ? 'text-amber-400 font-semibold' : 'text-zinc-300'}`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Attendance % */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            parseInt(member.attendancePct) >= 75 ? 'bg-emerald-500' :
                            parseInt(member.attendancePct) >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: member.attendancePct }}
                        />
                      </div>
                      <span className="text-xs font-mono text-zinc-400">{member.attendancePct}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(member)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                        title={`Edit ${member.name}'s profile`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(member)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title={`Delete ${member.name} — this cannot be undone`}
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                        title="More actions"
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span>
            Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, totalCount)} of {totalCount} members
          </span>
          <div className="flex items-center gap-2">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
            >
              {[10, 25, 50, 100].map((s) => <option key={`pagesize-${s}`} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={15} />
          </button>

          {pageNumbers.map((n) => (
            <button
              key={`page-${n}`}
              onClick={() => onPageChange(n)}
              className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                n === page
                  ? 'bg-amber-500 text-zinc-950 font-bold' :'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}