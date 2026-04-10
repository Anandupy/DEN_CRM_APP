'use client';
import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

interface MemberTableHeaderProps {
  search: string;
  plans: string[];
  trainers: string[];
  onSearchChange: (v: string) => void;
  filterPlan: string;
  onFilterPlan: (v: string) => void;
  filterTrainer: string;
  onFilterTrainer: (v: string) => void;
  filterStatus: string;
  onFilterStatus: (v: string) => void;
  filterFees: string;
  onFilterFees: (v: string) => void;
  totalCount: number;
}

export default function MemberTableHeader({
  search, plans, trainers, onSearchChange,
  filterPlan, onFilterPlan,
  filterTrainer, onFilterTrainer,
  filterStatus, onFilterStatus,
  filterFees, onFilterFees,
  totalCount,
}: MemberTableHeaderProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = [filterPlan, filterTrainer, filterStatus, filterFees].filter((f) => f !== 'all').length;

  const clearAll = () => {
    onFilterPlan('all');
    onFilterTrainer('all');
    onFilterStatus('all');
    onFilterFees('all');
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, mobile, email, or member ID..."
            className="form-input pl-9 pr-8"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`btn-secondary shrink-0 ${filtersOpen ? 'border-amber-500/40 text-amber-400' : ''}`}
        >
          <Filter size={14} />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-amber-500 text-zinc-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown size={13} className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filter row */}
      {filtersOpen && (
        <div className="flex flex-wrap gap-3 pt-1 fade-in">
          {/* Plan */}
          <div className="flex flex-col gap-1 min-w-[140px]">
            <label className="form-label text-[10px]">Membership Plan</label>
            <select
              value={filterPlan}
              onChange={(e) => onFilterPlan(e.target.value)}
              className="form-input text-xs py-2"
            >
              <option value="all">All Plans</option>
              {plans.map((plan) => <option key={`plan-opt-${plan}`} value={plan}>{plan}</option>)}
            </select>
          </div>

          {/* Trainer */}
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="form-label text-[10px]">Trainer</label>
            <select
              value={filterTrainer}
              onChange={(e) => onFilterTrainer(e.target.value)}
              className="form-input text-xs py-2"
            >
              <option value="all">All Trainers</option>
              {trainers.map((trainer) => <option key={`trainer-opt-${trainer}`} value={trainer}>{trainer}</option>)}
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1 min-w-[130px]">
            <label className="form-label text-[10px]">Member Status</label>
            <select
              value={filterStatus}
              onChange={(e) => onFilterStatus(e.target.value)}
              className="form-input text-xs py-2"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Fees */}
          <div className="flex flex-col gap-1 min-w-[130px]">
            <label className="form-label text-[10px]">Fees Status</label>
            <select
              value={filterFees}
              onChange={(e) => onFilterFees(e.target.value)}
              className="form-input text-xs py-2"
            >
              <option value="all">All Fees</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {activeFilterCount > 0 && (
            <div className="flex items-end">
              <button onClick={clearAll} className="btn-danger text-xs py-2">
                <X size={12} />
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Active filter chips */}
      {activeFilterCount > 0 && !filtersOpen && (
        <div className="flex flex-wrap gap-2">
          {filterPlan !== 'all' && (
            <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-2.5 py-1 rounded-full">
              Plan: {filterPlan}
              <button onClick={() => onFilterPlan('all')}><X size={11} /></button>
            </span>
          )}
          {filterTrainer !== 'all' && (
            <span className="flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-2.5 py-1 rounded-full">
              Trainer: {filterTrainer.split(' ')[0]}
              <button onClick={() => onFilterTrainer('all')}><X size={11} /></button>
            </span>
          )}
          {filterStatus !== 'all' && (
            <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-full capitalize">
              {filterStatus}
              <button onClick={() => onFilterStatus('all')}><X size={11} /></button>
            </span>
          )}
          {filterFees !== 'all' && (
            <span className="flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 text-xs px-2.5 py-1 rounded-full capitalize">
              Fees: {filterFees}
              <button onClick={() => onFilterFees('all')}><X size={11} /></button>
            </span>
          )}
          <span className="text-xs text-zinc-500 flex items-center">{totalCount} result{totalCount !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
}
