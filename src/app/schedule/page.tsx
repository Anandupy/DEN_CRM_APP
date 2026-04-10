'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Calendar, Clock, Plus, Users, Dumbbell, X, CheckCircle2 } from 'lucide-react';

interface ClassSlot {
  id: string;
  title: string;
  trainer: string;
  day: string;
  time: string;
  duration: string;
  capacity: number;
  enrolled: number;
  type: 'strength' | 'cardio' | 'yoga' | 'hiit' | 'zumba';
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const typeColors: Record<string, string> = {
  strength: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  cardio: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  yoga: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  hiit: 'bg-red-500/15 text-red-400 border-red-500/20',
  zumba: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
};

const initialSchedule: ClassSlot[] = [
  { id: 'S001', title: 'Morning Strength', trainer: 'Priya Sharma', day: 'Monday', time: '6:00 AM', duration: '60 min', capacity: 15, enrolled: 12, type: 'strength' },
  { id: 'S002', title: 'HIIT Blast', trainer: 'Ravi Pillai', day: 'Monday', time: '7:30 AM', duration: '45 min', capacity: 12, enrolled: 10, type: 'hiit' },
  { id: 'S003', title: 'Yoga Flow', trainer: 'Anjali Mehta', day: 'Monday', time: '9:00 AM', duration: '60 min', capacity: 10, enrolled: 8, type: 'yoga' },
  { id: 'S004', title: 'Cardio Burn', trainer: 'Suresh Kumar', day: 'Tuesday', time: '6:00 AM', duration: '45 min', capacity: 15, enrolled: 11, type: 'cardio' },
  { id: 'S005', title: 'Zumba Party', trainer: 'Deepika Nair', day: 'Tuesday', time: '8:00 AM', duration: '60 min', capacity: 20, enrolled: 18, type: 'zumba' },
  { id: 'S006', title: 'Power Lifting', trainer: 'Suresh Kumar', day: 'Wednesday', time: '6:00 AM', duration: '75 min', capacity: 10, enrolled: 9, type: 'strength' },
  { id: 'S007', title: 'Morning Yoga', trainer: 'Anjali Mehta', day: 'Wednesday', time: '7:30 AM', duration: '60 min', capacity: 10, enrolled: 7, type: 'yoga' },
  { id: 'S008', title: 'CrossFit', trainer: 'Ravi Pillai', day: 'Thursday', time: '6:00 AM', duration: '60 min', capacity: 12, enrolled: 12, type: 'hiit' },
  { id: 'S009', title: 'Evening Cardio', trainer: 'Priya Sharma', day: 'Thursday', time: '6:00 PM', duration: '45 min', capacity: 15, enrolled: 10, type: 'cardio' },
  { id: 'S010', title: 'Full Body Strength', trainer: 'Suresh Kumar', day: 'Friday', time: '6:00 AM', duration: '60 min', capacity: 15, enrolled: 13, type: 'strength' },
  { id: 'S011', title: 'Zumba Fitness', trainer: 'Deepika Nair', day: 'Saturday', time: '8:00 AM', duration: '60 min', capacity: 20, enrolled: 20, type: 'zumba' },
  { id: 'S012', title: 'Weekend HIIT', trainer: 'Ravi Pillai', day: 'Saturday', time: '10:00 AM', duration: '45 min', capacity: 12, enrolled: 8, type: 'hiit' },
  { id: 'S013', title: 'Sunday Yoga', trainer: 'Anjali Mehta', day: 'Sunday', time: '7:00 AM', duration: '90 min', capacity: 10, enrolled: 6, type: 'yoga' },
];

const emptyForm = { title: '', trainer: 'Priya Sharma', day: 'Monday', time: '6:00 AM', duration: '60 min', capacity: '15', type: 'strength' as ClassSlot['type'] };

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ClassSlot[]>(initialSchedule);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const dayClasses = schedule.filter(s => s.day === selectedDay);

  const handleAdd = () => {
    const newSlot: ClassSlot = {
      id: `S${String(schedule.length + 1).padStart(3, '0')}`,
      ...form,
      capacity: parseInt(form.capacity),
      enrolled: 0,
    };
    setSchedule(prev => [...prev, newSlot]);
    setShowModal(false);
    setForm(emptyForm);
  };

  const handleDelete = (id: string) => {
    setSchedule(prev => prev.filter(s => s.id !== id));
  };

  return (
    <AppLayout activePath="/schedule">
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Class Schedule</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Weekly gym class timetable and trainer assignments</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary text-xs"><Plus size={14} /> Add Class</button>
        </div>

        {/* Day Selector */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDay === day
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
              }`}
            >
              {day.slice(0, 3)}
              <span className="hidden sm:inline">{day.slice(3)}</span>
              <span className="ml-1.5 text-[10px] opacity-70">
                ({schedule.filter(s => s.day === day).length})
              </span>
            </button>
          ))}
        </div>

        {/* Classes for selected day */}
        {dayClasses.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <Calendar size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No classes scheduled for {selectedDay}</p>
            <button onClick={() => setShowModal(true)} className="btn-primary text-xs mt-4 mx-auto"><Plus size={13} /> Add Class</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {dayClasses.map(cls => (
              <div key={cls.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`badge border text-[10px] mb-2 ${typeColors[cls.type]}`}>{cls.type.toUpperCase()}</span>
                    <p className="text-zinc-100 font-semibold text-sm">{cls.title}</p>
                  </div>
                  <button onClick={() => handleDelete(cls.id)} className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <X size={13} />
                  </button>
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Dumbbell size={12} className="text-zinc-600" />
                    <span>{cls.trainer}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Clock size={12} className="text-zinc-600" />
                    <span>{cls.time} · {cls.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Users size={12} className="text-zinc-600" />
                    <span>{cls.enrolled}/{cls.capacity} enrolled</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${cls.enrolled >= cls.capacity ? 'bg-red-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min((cls.enrolled / cls.capacity) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-600 mt-1">
                  {cls.enrolled >= cls.capacity ? 'Full' : `${cls.capacity - cls.enrolled} spots left`}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Add Class Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                <h3 className="text-base font-semibold text-zinc-100">Add New Class</h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="form-label">Class Title</label>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="form-input text-xs" placeholder="e.g. Morning Strength" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Trainer</label>
                    <select value={form.trainer} onChange={e => setForm(p => ({ ...p, trainer: e.target.value }))} className="form-input text-xs">
                      {['Priya Sharma', 'Suresh Kumar', 'Anjali Mehta', 'Ravi Pillai', 'Deepika Nair'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Day</label>
                    <select value={form.day} onChange={e => setForm(p => ({ ...p, day: e.target.value }))} className="form-input text-xs">
                      {days.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Time</label>
                    <input value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} className="form-input text-xs" placeholder="6:00 AM" />
                  </div>
                  <div>
                    <label className="form-label">Duration</label>
                    <input value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} className="form-input text-xs" placeholder="60 min" />
                  </div>
                  <div>
                    <label className="form-label">Capacity</label>
                    <input type="number" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} className="form-input text-xs" />
                  </div>
                  <div>
                    <label className="form-label">Type</label>
                    <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as ClassSlot['type'] }))} className="form-input text-xs">
                      {['strength', 'cardio', 'yoga', 'hiit', 'zumba'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-5 border-t border-zinc-800">
                <button onClick={() => setShowModal(false)} className="btn-secondary text-xs">Cancel</button>
                <button onClick={handleAdd} className="btn-primary text-xs"><CheckCircle2 size={14} /> Add Class</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}