'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { X, User, Phone, Mail, MapPin, Calendar, Dumbbell, AlertCircle, FileText, Save, Loader2 } from 'lucide-react';
import { Member, TRAINERS, PLANS, Plan, Gender, PaymentMode } from './memberData';
import Icon from '@/components/ui/AppIcon';


interface MemberModalProps {
  member: Member | null;
  onSave: (data: Member) => void;
  onClose: () => void;
}

type FormData = Omit<Member, 'id' | 'profileInitials' | 'profileColor' | 'attendancePct'>;

const defaultValues: FormData = {
  memberId: '',
  name: '',
  mobile: '',
  email: '',
  address: '',
  gender: 'Male',
  age: '',
  joinDate: new Date().toISOString().split('T')[0],
  expiryDate: '',
  plan: 'Monthly',
  trainer: TRAINERS[0],
  emergencyContact: '',
  medicalNotes: '',
  status: 'active',
  feesStatus: 'paid',
  lastPaymentMode: 'Cash',
  lastPaymentDate: new Date().toISOString().split('T')[0],
};

const PROFILE_COLORS = [
  'bg-blue-500/20 text-blue-400',
  'bg-pink-500/20 text-pink-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-amber-500/20 text-amber-400',
  'bg-purple-500/20 text-purple-400',
  'bg-cyan-500/20 text-cyan-400',
  'bg-rose-500/20 text-rose-400',
  'bg-teal-500/20 text-teal-400',
  'bg-indigo-500/20 text-indigo-400',
  'bg-orange-500/20 text-orange-400',
];

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]?.toUpperCase() || '').join('');
}

function getExpiryFromPlan(joinDate: string, plan: Plan): string {
  const d = new Date(joinDate);
  if (plan === 'Monthly') d.setMonth(d.getMonth() + 1);
  else if (plan === 'Quarterly') d.setMonth(d.getMonth() + 3);
  else if (plan === 'Half-Yearly') d.setMonth(d.getMonth() + 6);
  else if (plan === 'Annual') d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}

export default function MemberModal({ member, onSave, onClose }: MemberModalProps) {
  const isEditing = !!member;
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<'personal' | 'membership' | 'medical'>('personal');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<FormData>({
    defaultValues: member
      ? {
          memberId: member.memberId,
          name: member.name,
          mobile: member.mobile,
          email: member.email,
          address: member.address,
          gender: member.gender,
          age: member.age,
          joinDate: member.joinDate,
          expiryDate: member.expiryDate,
          plan: member.plan,
          trainer: member.trainer,
          emergencyContact: member.emergencyContact,
          medicalNotes: member.medicalNotes,
          status: member.status,
          feesStatus: member.feesStatus,
          lastPaymentMode: member.lastPaymentMode,
          lastPaymentDate: member.lastPaymentDate,
        }
      : defaultValues,
  });

  const watchedPlan = watch('plan');
  const watchedJoinDate = watch('joinDate');
  const watchedName = watch('name');

  // Auto-compute expiry when plan or join date changes
  useEffect(() => {
    if (watchedJoinDate && watchedPlan) {
      setValue('expiryDate', getExpiryFromPlan(watchedJoinDate, watchedPlan as Plan));
    }
  }, [watchedPlan, watchedJoinDate, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    // TODO: Backend — POST /api/members (create) or PUT /api/members/:id (update)
    await new Promise((r) => setTimeout(r, 900));
    setIsLoading(false);

    const initials = getInitials(data.name) || 'XX';
    const colorIndex = Math.abs(data.name.charCodeAt(0) + (data.name.charCodeAt(1) || 0)) % PROFILE_COLORS.length;
    const profileColor = PROFILE_COLORS[colorIndex];

    const savedMember: Member = {
      ...data,
      id: member?.id || `member-${Date.now()}`,
      profileInitials: initials,
      profileColor,
      attendancePct: member?.attendancePct || '0%',
      plan: data.plan as Plan,
      gender: data.gender as Gender,
      lastPaymentMode: data.lastPaymentMode as PaymentMode,
    };

    onSave(savedMember);
    toast.success(isEditing ? `${data.name}'s profile updated` : `${data.name} added as new member`);
  };

  const sections = [
    { key: 'personal', label: 'Personal Info', icon: User },
    { key: 'membership', label: 'Membership', icon: Dumbbell },
    { key: 'medical', label: 'Medical & Notes', icon: FileText },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => {
          if (isDirty && !window.confirm('You have unsaved changes. Close anyway?')) return;
          onClose();
        }}
      />

      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <User size={18} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">
                {isEditing ? `Edit Member` : 'Add New Member'}
              </h2>
              <p className="text-xs text-zinc-500">
                {isEditing ? `Editing: ${member.name} · ${member.memberId}` : 'Fill in all required fields to register a new member'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isDirty && !window.confirm('You have unsaved changes. Close anyway?')) return;
              onClose();
            }}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex gap-0 border-b border-zinc-800 px-6 shrink-0">
          {sections.map((s) => {
            const Icon = s.icon;
            const isActive = activeSection === s.key;
            return (
              <button
                key={`modal-tab-${s.key}`}
                type="button"
                onClick={() => setActiveSection(s.key)}
                className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition-all duration-150 -mb-px ${
                  isActive
                    ? 'border-amber-500 text-amber-400' :'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon size={13} />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* ── PERSONAL INFO ── */}
            {activeSection === 'personal' && (
              <div className="space-y-4 fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="form-label">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        {...register('name', { required: 'Full name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })}
                        className="form-input pl-9"
                        placeholder="e.g. Rahul Sharma"
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
                    {watchedName && (
                      <p className="mt-1 text-[10px] text-zinc-600">
                        Initials: <span className="text-zinc-400 font-semibold">{getInitials(watchedName)}</span>
                      </p>
                    )}
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="form-label">
                      Mobile Number <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="tel"
                        {...register('mobile', {
                          required: 'Mobile number is required',
                          pattern: { value: /^[\d\s\-+]{10,14}$/, message: 'Enter a valid mobile number' },
                        })}
                        className="form-input pl-9"
                        placeholder="98765-43210"
                      />
                    </div>
                    {errors.mobile && <p className="mt-1 text-xs text-red-400">{errors.mobile.message}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="form-label">Email Address</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="email"
                        {...register('email', {
                          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
                        })}
                        className="form-input pl-9"
                        placeholder="member@email.com"
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="form-label">
                      Gender <span className="text-red-400">*</span>
                    </label>
                    <select
                      {...register('gender', { required: 'Gender is required' })}
                      className="form-input"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && <p className="mt-1 text-xs text-red-400">{errors.gender.message}</p>}
                  </div>

                  {/* Age */}
                  <div>
                    <label className="form-label">
                      Age <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      {...register('age', {
                        required: 'Age is required',
                        min: { value: 12, message: 'Minimum age is 12' },
                        max: { value: 80, message: 'Maximum age is 80' },
                      })}
                      className="form-input"
                      placeholder="25"
                      min={12}
                      max={80}
                    />
                    {errors.age && <p className="mt-1 text-xs text-red-400">{errors.age.message}</p>}
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="form-label">Address</label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3 top-3 text-zinc-500" />
                      <textarea
                        {...register('address')}
                        className="form-input pl-9 resize-none"
                        rows={2}
                        placeholder="Flat No., Building, Area, Mumbai"
                      />
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="sm:col-span-2">
                    <label className="form-label">Emergency Contact</label>
                    <p className="text-[10px] text-zinc-600 mb-1.5">Name and phone number of a person to contact in case of emergency</p>
                    <div className="relative">
                      <AlertCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        {...register('emergencyContact')}
                        className="form-input pl-9"
                        placeholder="e.g. Suresh Patil · 91234-56789"
                      />
                    </div>
                  </div>
                </div>

                {/* Section navigation hint */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveSection('membership')}
                    className="text-xs text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-1"
                  >
                    Next: Membership Details →
                  </button>
                </div>
              </div>
            )}

            {/* ── MEMBERSHIP ── */}
            {activeSection === 'membership' && (
              <div className="space-y-4 fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Plan */}
                  <div>
                    <label className="form-label">
                      Membership Plan <span className="text-red-400">*</span>
                    </label>
                    <p className="text-[10px] text-zinc-600 mb-1.5">Expiry date will be auto-calculated from join date</p>
                    <select
                      {...register('plan', { required: 'Plan is required' })}
                      className="form-input"
                    >
                      {PLANS.map((p) => <option key={`plan-sel-${p}`} value={p}>{p}</option>)}
                    </select>
                    {errors.plan && <p className="mt-1 text-xs text-red-400">{errors.plan.message}</p>}
                  </div>

                  {/* Trainer */}
                  <div>
                    <label className="form-label">
                      Assigned Trainer <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Dumbbell size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <select
                        {...register('trainer', { required: 'Trainer is required' })}
                        className="form-input pl-9"
                      >
                        {TRAINERS.map((t) => <option key={`trainer-sel-${t}`} value={t}>{t}</option>)}
                      </select>
                    </div>
                    {errors.trainer && <p className="mt-1 text-xs text-red-400">{errors.trainer.message}</p>}
                  </div>

                  {/* Join Date */}
                  <div>
                    <label className="form-label">
                      Joining Date <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="date"
                        {...register('joinDate', { required: 'Joining date is required' })}
                        className="form-input pl-9"
                      />
                    </div>
                    {errors.joinDate && <p className="mt-1 text-xs text-red-400">{errors.joinDate.message}</p>}
                  </div>

                  {/* Expiry Date (auto) */}
                  <div>
                    <label className="form-label">Expiry Date (auto-calculated)</label>
                    <p className="text-[10px] text-zinc-600 mb-1.5">Auto-set based on plan. You can override manually.</p>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="date"
                        {...register('expiryDate', { required: 'Expiry date is required' })}
                        className="form-input pl-9"
                      />
                    </div>
                    {errors.expiryDate && <p className="mt-1 text-xs text-red-400">{errors.expiryDate.message}</p>}
                  </div>

                  {/* Member Status */}
                  <div>
                    <label className="form-label">Member Status</label>
                    <select {...register('status')} className="form-input">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="expired">Expired</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>

                  {/* Fees Status */}
                  <div>
                    <label className="form-label">Fees Status</label>
                    <select {...register('feesStatus')} className="form-input">
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>

                  {/* Last Payment Mode */}
                  <div>
                    <label className="form-label">Payment Mode</label>
                    <select {...register('lastPaymentMode')} className="form-input">
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="Online">Online</option>
                    </select>
                  </div>

                  {/* Last Payment Date */}
                  <div>
                    <label className="form-label">Last Payment Date</label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="date"
                        {...register('lastPaymentDate')}
                        className="form-input pl-9"
                      />
                    </div>
                  </div>
                </div>

                {/* Plan pricing info */}
                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3.5">
                  <p className="text-xs font-semibold text-zinc-400 mb-2">Plan Pricing (DEN Fitness)</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { plan: 'Monthly', price: '₹1,800', duration: '1 month' },
                      { plan: 'Quarterly', price: '₹4,500', duration: '3 months' },
                      { plan: 'Half-Yearly', price: '₹8,000', duration: '6 months' },
                      { plan: 'Annual', price: '₹14,000', duration: '12 months' },
                    ].map((item) => (
                      <div
                        key={`pricing-${item.plan}`}
                        className={`p-2 rounded-lg text-center border transition-all ${
                          watchedPlan === item.plan
                            ? 'bg-amber-500/10 border-amber-500/30' :'bg-zinc-900/50 border-zinc-800'
                        }`}
                      >
                        <p className={`text-xs font-bold ${watchedPlan === item.plan ? 'text-amber-400' : 'text-zinc-300'}`}>
                          {item.price}
                        </p>
                        <p className="text-[10px] text-zinc-600">{item.plan}</p>
                        <p className="text-[9px] text-zinc-700">{item.duration}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveSection('personal')}
                    className="text-xs text-zinc-500 hover:text-zinc-300 font-semibold flex items-center gap-1"
                  >
                    ← Back: Personal Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection('medical')}
                    className="text-xs text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-1"
                  >
                    Next: Medical & Notes →
                  </button>
                </div>
              </div>
            )}

            {/* ── MEDICAL & NOTES ── */}
            {activeSection === 'medical' && (
              <div className="space-y-4 fade-in">
                <div className="bg-amber-500/8 border border-amber-500/15 rounded-xl p-3.5 flex items-start gap-2.5">
                  <AlertCircle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Medical notes are visible to trainers. Record any health conditions, injuries, or restrictions that may affect training. This information is confidential and used for member safety only.
                  </p>
                </div>

                <div>
                  <label className="form-label">Medical Notes / Health Conditions</label>
                  <p className="text-[10px] text-zinc-600 mb-1.5">
                    e.g. Hypertension, Diabetes, Knee injury, Back pain — or write &quot;None&quot; if no conditions
                  </p>
                  <textarea
                    {...register('medicalNotes')}
                    className="form-input resize-none"
                    rows={4}
                    placeholder="None — no known medical conditions or injuries"
                  />
                </div>

                {/* Summary */}
                <div className="bg-zinc-800/50 border border-zinc-700/40 rounded-xl p-4">
                  <p className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wide">Registration Summary</p>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <span className="text-zinc-600">Name</span>
                    <span className="text-zinc-300 font-medium truncate">{watch('name') || '—'}</span>
                    <span className="text-zinc-600">Mobile</span>
                    <span className="text-zinc-300 font-mono">{watch('mobile') || '—'}</span>
                    <span className="text-zinc-600">Plan</span>
                    <span className="text-zinc-300">{watch('plan') || '—'}</span>
                    <span className="text-zinc-600">Trainer</span>
                    <span className="text-zinc-300 truncate">{watch('trainer') || '—'}</span>
                    <span className="text-zinc-600">Join Date</span>
                    <span className="text-zinc-300 font-mono">{watch('joinDate') || '—'}</span>
                    <span className="text-zinc-600">Expiry</span>
                    <span className="text-zinc-300 font-mono">{watch('expiryDate') || '—'}</span>
                    <span className="text-zinc-600">Fees Status</span>
                    <span className="text-zinc-300 capitalize">{watch('feesStatus') || '—'}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveSection('membership')}
                    className="text-xs text-zinc-500 hover:text-zinc-300 font-semibold flex items-center gap-1"
                  >
                    ← Back: Membership
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-zinc-800 bg-zinc-900/80 shrink-0">
            {isDirty && (
              <p className="text-xs text-amber-500/80 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full inline-block animate-pulse" />
                Unsaved changes
              </p>
            )}
            {!isDirty && <div />}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (isDirty && !window.confirm('Discard changes?')) return;
                  onClose();
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary min-w-[140px] justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    {isEditing ? 'Save Changes' : 'Add Member'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}