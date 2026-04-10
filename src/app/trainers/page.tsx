'use client';
import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Dumbbell, Plus, Search, Users, Star, Phone, Mail,
  Edit2, Trash2, X, CheckCircle2, Award, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { deleteTrainerInSupabase, loadErpSnapshot, saveTrainerInSupabase } from '@/lib/erp/data';
import { mockTrainers } from '@/lib/erp/mock-data';
import type { Trainer } from '@/lib/erp/types';
import { isSupabaseConfigured } from '@/lib/supabase/client';

const emptyForm = { name: '', email: '', phone: '', specialization: '', experience: '', schedule: '' };

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>(mockTrainers);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTrainer, setEditTrainer] = useState<Trainer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'supabase' | 'mock'>('mock');

  const refreshData = async () => {
    loadErpSnapshot().then((snapshot) => {
      setTrainers(snapshot.trainers);
      setDataSource(snapshot.source);
    });
  };

  useEffect(() => {
    refreshData();
  }, []);

  const filtered = trainers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.specialization.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditTrainer(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (t: Trainer) => {
    setEditTrainer(t);
    setForm({ name: t.name, email: t.email, phone: t.phone, specialization: t.specialization, experience: t.experience, schedule: t.schedule });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (isSupabaseConfigured()) {
        await saveTrainerInSupabase({
          id: editTrainer?.id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          specialization: form.specialization,
          experience: form.experience,
          schedule: form.schedule,
        });
        await refreshData();
      } else if (editTrainer) {
        setTrainers(prev => prev.map(t => t.id === editTrainer.id ? { ...t, ...form } : t));
      } else {
        const newT: Trainer = {
          id: `trainer-${String(trainers.length + 1).padStart(3, '0')}`,
          trainerId: `T${String(trainers.length + 1).padStart(3, '0')}`,
          ...form,
          assignedMembers: 0,
          rating: 0,
          joinDate: new Date().toISOString().split('T')[0],
          status: 'active',
          initials: form.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
          color: 'bg-zinc-500/20 text-zinc-400',
        };
        setTrainers(prev => [newT, ...prev]);
      }
      toast.success(editTrainer ? 'Trainer updated' : 'Trainer added');
      setShowModal(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save trainer');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (isSupabaseConfigured()) {
        await deleteTrainerInSupabase(id);
        await refreshData();
      } else {
        setTrainers(prev => prev.filter(t => t.id !== id));
      }
      setDeleteConfirm(null);
      toast.success('Trainer removed');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete trainer');
    }
  };

  const activeCount = trainers.filter(t => t.status === 'active').length;
  const totalMembers = trainers.reduce((s, t) => s + t.assignedMembers, 0);
  const avgRating = (trainers.reduce((s, t) => s + t.rating, 0) / trainers.filter(t => t.rating > 0).length).toFixed(1);

  return (
    <AppLayout activePath="/trainers">
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Trainers</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Manage gym trainers and their assignments
              <span className="ml-2 text-[11px] uppercase tracking-wide text-amber-500/80">
                {dataSource === 'supabase' ? 'Live Supabase data' : 'Mock fallback'}
              </span>
            </p>
          </div>
          <button onClick={openAdd} className="btn-primary text-xs"><Plus size={14} /> Add Trainer</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Trainers', value: trainers.length, icon: Dumbbell, color: 'text-zinc-300', bg: 'bg-zinc-800/50' },
            { label: 'Active Trainers', value: activeCount, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Members Assigned', value: totalMembers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Avg Rating', value: avgRating + '★', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          ].map(stat => (
            <div key={stat.label} className="metric-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon size={16} className={stat.color} />
                </div>
              </div>
              <p className={`text-3xl font-bold stat-value ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search trainers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input pl-9 text-xs"
          />
        </div>

        {/* Trainer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(trainer => (
            <div key={trainer.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${trainer.color}`}>
                    {trainer.initials}
                  </div>
                  <div>
                    <p className="text-zinc-100 font-semibold text-sm">{trainer.name}</p>
                    <p className="text-zinc-500 text-xs">{trainer.trainerId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {trainer.status === 'active'
                    ? <span className="badge badge-active text-[10px]">Active</span>
                    : <span className="badge badge-inactive text-[10px]">Inactive</span>
                  }
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Award size={12} className="text-amber-500 shrink-0" />
                  <span>{trainer.specialization}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Phone size={12} className="text-zinc-600 shrink-0" />
                  <span>{trainer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Mail size={12} className="text-zinc-600 shrink-0" />
                  <span className="truncate">{trainer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Calendar size={12} className="text-zinc-600 shrink-0" />
                  <span>{trainer.schedule}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <p className="text-zinc-600">Members</p>
                    <p className="text-zinc-200 font-semibold">{trainer.assignedMembers}</p>
                  </div>
                  <div>
                    <p className="text-zinc-600">Exp.</p>
                    <p className="text-zinc-200 font-semibold">{trainer.experience}</p>
                  </div>
                  {trainer.rating > 0 && (
                    <div>
                      <p className="text-zinc-600">Rating</p>
                      <p className="text-amber-400 font-semibold">{trainer.rating}★</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => openEdit(trainer)} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => setDeleteConfirm(trainer.id)} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                <h3 className="text-base font-semibold text-zinc-100">{editTrainer ? 'Edit Trainer' : 'Add New Trainer'}</h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="form-label">Full Name</label>
                    <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="form-input text-xs" placeholder="Trainer Name" />
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="form-input text-xs" placeholder="email@denfitness.in" />
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="form-input text-xs" placeholder="98765-43210" />
                  </div>
                  <div className="col-span-2">
                    <label className="form-label">Specialization</label>
                    <input value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} className="form-input text-xs" placeholder="e.g. Weight Training & Cardio" />
                  </div>
                  <div>
                    <label className="form-label">Experience</label>
                    <input value={form.experience} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} className="form-input text-xs" placeholder="e.g. 5 years" />
                  </div>
                  <div>
                    <label className="form-label">Schedule</label>
                    <input value={form.schedule} onChange={e => setForm(p => ({ ...p, schedule: e.target.value }))} className="form-input text-xs" placeholder="Mon–Sat, 6AM–2PM" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-5 border-t border-zinc-800">
                <button onClick={() => setShowModal(false)} className="btn-secondary text-xs">Cancel</button>
                <button onClick={handleSave} className="btn-primary text-xs"><CheckCircle2 size={14} /> {editTrainer ? 'Update' : 'Add Trainer'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <h3 className="text-base font-semibold text-zinc-100 mb-2">Remove Trainer?</h3>
              <p className="text-sm text-zinc-500 mb-6">This action cannot be undone. The trainer will be removed from all assigned members.</p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary text-xs">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger text-xs"><Trash2 size={13} /> Remove</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
