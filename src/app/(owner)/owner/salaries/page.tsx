'use client';
import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardCard from '@/components/ui/DashboardCard';
import DataTable from '@/components/ui/DataTable';
import FormInput from '@/components/ui/FormInput';
import { loadErpSnapshot, loadTrainerSalaryRecords, saveTrainerSalaryRecord } from '@/lib/erp/data';
import type { TrainerSalaryRecord } from '@/lib/erp/types';
import { CreditCard, IndianRupee, ReceiptText, Users } from 'lucide-react';
import { toast } from 'sonner';

const currentMonth = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

export default function OwnerSalaryPage() {
  const [records, setRecords] = useState<TrainerSalaryRecord[]>([]);
  const [trainerOptions, setTrainerOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState({
    trainerId: '',
    month: currentMonth,
    baseSalary: '18000',
    bonusAmount: '0',
    deductions: '0',
    status: 'pending' as TrainerSalaryRecord['status'],
  });

  const refreshData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [salaryRows, snapshot] = await Promise.all([loadTrainerSalaryRecords(), loadErpSnapshot()]);
      setRecords(salaryRows);
      setTrainerOptions(snapshot.trainers.map((trainer) => ({ id: trainer.id, name: trainer.name })));

      if (!form.trainerId && snapshot.trainers[0]) {
        setForm((current) => ({ ...current, trainerId: snapshot.trainers[0].id }));
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load trainer salary history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const totalPayout = records.reduce((sum, row) => sum + row.netSalary, 0);
  const paidPayout = records.filter((row) => row.status === 'paid').reduce((sum, row) => sum + row.netSalary, 0);
  const pendingPayout = totalPayout - paidPayout;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveTrainerSalaryRecord({
        trainerId: form.trainerId,
        month: form.month,
        baseSalary: Number(form.baseSalary),
        bonusAmount: Number(form.bonusAmount),
        deductions: Number(form.deductions),
        status: form.status,
        paidOn: form.status === 'paid' ? new Date().toISOString().split('T')[0] : null,
      });
      toast.success('Trainer salary record saved');
      await refreshData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save trainer salary');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout activePath="/owner/salaries">
      <div className="space-y-6 fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Trainer Salary</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Track base salary, bonuses, deductions, and payouts.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard label="Salary Records" value={records.length} icon={ReceiptText} tone="info" />
          <DashboardCard label="Trainers Covered" value={new Set(records.map((row) => row.trainerId)).size} icon={Users} tone="default" />
          <DashboardCard label="Paid Out" value={`₹${paidPayout.toLocaleString('en-IN')}`} icon={IndianRupee} tone="success" />
          <DashboardCard label="Pending Payout" value={`₹${pendingPayout.toLocaleString('en-IN')}`} icon={CreditCard} tone="warning" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[420px,1fr] gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200">Add Salary Entry</h2>
            {loadError ? (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-300">
                {loadError}
              </div>
            ) : null}
            <label className="flex flex-col gap-1.5">
              <span className="form-label">Trainer</span>
              <select
                value={form.trainerId}
                onChange={(event) => setForm((current) => ({ ...current, trainerId: event.target.value }))}
                className="form-input text-sm"
              >
                {trainerOptions.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>{trainer.name}</option>
                ))}
              </select>
            </label>
            <FormInput label="Month" value={form.month} onChange={(event) => setForm((current) => ({ ...current, month: event.target.value }))} />
            <FormInput label="Base Salary" type="number" value={form.baseSalary} onChange={(event) => setForm((current) => ({ ...current, baseSalary: event.target.value }))} />
            <FormInput label="Bonus" type="number" value={form.bonusAmount} onChange={(event) => setForm((current) => ({ ...current, bonusAmount: event.target.value }))} />
            <FormInput label="Deductions" type="number" value={form.deductions} onChange={(event) => setForm((current) => ({ ...current, deductions: event.target.value }))} />
            <label className="flex flex-col gap-1.5">
              <span className="form-label">Status</span>
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as TrainerSalaryRecord['status'] }))}
                className="form-input text-sm"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </label>
            <button onClick={handleSave} disabled={isSaving || isLoading} className="btn-primary w-full justify-center disabled:opacity-60">
              {isSaving ? 'Saving...' : 'Save Salary Entry'}
            </button>
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-10 text-sm text-zinc-500">
              Loading salary payment history...
            </div>
          ) : (
            <DataTable
              rows={records}
              columns={[
                { key: 'trainer', title: 'Trainer', render: (row) => <div><p className="text-zinc-200 font-medium">{row.trainerName}</p><p className="text-xs text-zinc-600">{row.trainerId}</p></div> },
                { key: 'month', title: 'Month', render: (row) => <span className="text-zinc-300">{row.month}</span> },
                { key: 'base', title: 'Base Salary', render: (row) => <span className="text-zinc-300">₹{row.baseSalary.toLocaleString('en-IN')}</span> },
                { key: 'net', title: 'Net Salary', render: (row) => <span className="text-emerald-400 font-semibold">₹{row.netSalary.toLocaleString('en-IN')}</span> },
                { key: 'paidOn', title: 'Paid On', render: (row) => <span className="text-zinc-400">{row.paidOn ?? 'Pending'}</span> },
                { key: 'status', title: 'Status', render: (row) => row.status === 'paid' ? <span className="badge badge-active">Paid</span> : <span className="badge badge-pending">Pending</span> },
              ]}
              emptyState="No trainer salary records yet."
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
