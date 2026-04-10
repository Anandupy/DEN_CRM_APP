'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Plus, Pin, Trash2, X, CheckCircle2, Bell, Users, Dumbbell, Shield } from 'lucide-react';

type NoticeAudience = 'all' | 'members' | 'trainers';
type NoticePriority = 'normal' | 'important' | 'urgent';

interface Notice {
  id: string;
  title: string;
  content: string;
  audience: NoticeAudience;
  priority: NoticePriority;
  postedBy: string;
  postedAt: string;
  pinned: boolean;
}

const initialNotices: Notice[] = [
  { id: 'N001', title: 'Gym Closed on 14th April (Ambedkar Jayanti)', content: 'Dear members, the gym will remain closed on 14th April 2026 on account of Dr. B.R. Ambedkar Jayanti. Regular operations will resume on 15th April. We apologize for any inconvenience.', audience: 'all', priority: 'important', postedBy: 'Rajesh Kumar', postedAt: '2026-04-08', pinned: true },
  { id: 'N002', title: 'New Zumba Batch Starting 15th April', content: 'We are excited to announce a new Zumba batch starting from 15th April 2026. Timings: Monday, Wednesday, Friday — 7:00 AM to 8:00 AM. Trainer: Deepika Nair. Limited seats available. Contact the front desk to enroll.', audience: 'members', priority: 'normal', postedBy: 'Rajesh Kumar', postedAt: '2026-04-07', pinned: false },
  { id: 'N003', title: 'Trainer Meeting — 10th April at 5 PM', content: 'All trainers are requested to attend a mandatory meeting on 10th April 2026 at 5:00 PM in the office. Agenda: Monthly performance review, new member assignments, and schedule updates.', audience: 'trainers', priority: 'urgent', postedBy: 'Rajesh Kumar', postedAt: '2026-04-06', pinned: false },
  { id: 'N004', title: 'Fee Reminder — April Dues Pending', content: 'This is a reminder to all members with pending April fees. Please clear your dues at the front desk or via UPI before 15th April to avoid membership suspension. Contact us for any payment issues.', audience: 'members', priority: 'important', postedBy: 'Rajesh Kumar', postedAt: '2026-04-05', pinned: false },
  { id: 'N005', title: 'New Equipment Installed', content: 'We have installed 4 new treadmills and 2 cable crossover machines. These are now available for use. Please follow proper usage guidelines and report any issues to the front desk.', audience: 'all', priority: 'normal', postedBy: 'Rajesh Kumar', postedAt: '2026-04-03', pinned: false },
];

const priorityConfig: Record<NoticePriority, { label: string; className: string }> = {
  normal: { label: 'Normal', className: 'bg-zinc-700/50 text-zinc-400 border-zinc-700' },
  important: { label: 'Important', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  urgent: { label: 'Urgent', className: 'bg-red-500/15 text-red-400 border-red-500/20' },
};

const audienceConfig: Record<NoticeAudience, { label: string; icon: React.ElementType }> = {
  all: { label: 'Everyone', icon: Bell },
  members: { label: 'Members', icon: Users },
  trainers: { label: 'Trainers', icon: Dumbbell },
};

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [showModal, setShowModal] = useState(false);
  const [filterAudience, setFilterAudience] = useState<'all' | NoticeAudience>('all');
  const [form, setForm] = useState({ title: '', content: '', audience: 'all' as NoticeAudience, priority: 'normal' as NoticePriority });

  const filtered = notices
    .filter(n => filterAudience === 'all' || n.audience === filterAudience)
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const handleAdd = () => {
    const newNotice: Notice = {
      id: `N${String(notices.length + 1).padStart(3, '0')}`,
      ...form,
      postedBy: 'Rajesh Kumar',
      postedAt: new Date().toISOString().split('T')[0],
      pinned: false,
    };
    setNotices(prev => [newNotice, ...prev]);
    setShowModal(false);
    setForm({ title: '', content: '', audience: 'all', priority: 'normal' });
  };

  const togglePin = (id: string) => {
    setNotices(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const handleDelete = (id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
  };

  return (
    <AppLayout activePath="/notices">
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Notices & Announcements</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Post gym notices for members and trainers</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary text-xs"><Plus size={14} /> Post Notice</button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
          {(['all', 'members', 'trainers'] as const).map(a => (
            <button
              key={a}
              onClick={() => setFilterAudience(a)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterAudience === a ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {a === 'all' ? 'All' : a.charAt(0).toUpperCase() + a.slice(1)}
            </button>
          ))}
        </div>

        {/* Notices List */}
        <div className="space-y-4">
          {filtered.map(notice => {
            const AudienceIcon = audienceConfig[notice.audience].icon;
            return (
              <div
                key={notice.id}
                className={`bg-zinc-900 border rounded-xl p-5 transition-colors ${
                  notice.pinned ? 'border-amber-500/30' : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {notice.pinned && <Pin size={12} className="text-amber-400 shrink-0" />}
                      <span className={`badge border text-[10px] ${priorityConfig[notice.priority].className}`}>
                        {priorityConfig[notice.priority].label}
                      </span>
                      <span className="badge bg-zinc-800/80 text-zinc-400 border border-zinc-700 text-[10px] flex items-center gap-1">
                        <AudienceIcon size={10} />
                        {audienceConfig[notice.audience].label}
                      </span>
                    </div>
                    <h3 className="text-zinc-100 font-semibold text-sm mb-2">{notice.title}</h3>
                    <p className="text-zinc-400 text-xs leading-relaxed">{notice.content}</p>
                    <div className="flex items-center gap-3 mt-3 text-[10px] text-zinc-600">
                      <span className="flex items-center gap-1"><Shield size={10} /> {notice.postedBy}</span>
                      <span>·</span>
                      <span>{notice.postedAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => togglePin(notice.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        notice.pinned
                          ? 'bg-amber-500/20 text-amber-400' :'bg-zinc-800 text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10'
                      }`}
                      title={notice.pinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(notice.id)}
                      className="p-1.5 rounded-lg bg-zinc-800 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Notice Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                <h3 className="text-base font-semibold text-zinc-100">Post New Notice</h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="form-label">Title</label>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="form-input text-xs" placeholder="Notice title..." />
                </div>
                <div>
                  <label className="form-label">Content</label>
                  <textarea
                    value={form.content}
                    onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                    className="form-input text-xs resize-none"
                    rows={4}
                    placeholder="Write your notice here..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Audience</label>
                    <select value={form.audience} onChange={e => setForm(p => ({ ...p, audience: e.target.value as NoticeAudience }))} className="form-input text-xs">
                      <option value="all">Everyone</option>
                      <option value="members">Members Only</option>
                      <option value="trainers">Trainers Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Priority</label>
                    <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as NoticePriority }))} className="form-input text-xs">
                      <option value="normal">Normal</option>
                      <option value="important">Important</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-5 border-t border-zinc-800">
                <button onClick={() => setShowModal(false)} className="btn-secondary text-xs">Cancel</button>
                <button onClick={handleAdd} className="btn-primary text-xs"><CheckCircle2 size={14} /> Post Notice</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}