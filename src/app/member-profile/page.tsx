'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { User, Phone, Edit2, Save, X, Shield } from 'lucide-react';

const memberData = {
  name: 'Amit Patil', memberId: 'DEN-001', initials: 'AP',
  phone: '98765-43210', email: 'amit.patil@gmail.com',
  address: 'Flat 4B, Andheri West, Mumbai', gender: 'Male', age: '28',
  joinDate: '10 Apr 2025', plan: 'Annual', trainer: 'Priya Sharma',
  expiryDate: '09 Apr 2026', emergencyContact: '91234-56789',
  medicalNotes: 'None', bloodGroup: 'B+',
};

export default function MemberProfilePage() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    phone: memberData?.phone,
    email: memberData?.email,
    address: memberData?.address,
    emergencyContact: memberData?.emergencyContact,
    medicalNotes: memberData?.medicalNotes,
  });

  return (
    <AppLayout activePath="/member-profile">
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">My Profile</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Your personal details and membership information</p>
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-secondary text-xs"><Edit2 size={14} /> Edit Profile</button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => setEditing(false)} className="btn-secondary text-xs"><X size={14} /> Cancel</button>
              <button onClick={() => setEditing(false)} className="btn-primary text-xs"><Save size={14} /> Save Changes</button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-blue-500/20 border-2 border-blue-500/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-400 font-bold text-2xl">{memberData?.initials}</span>
            </div>
            <h2 className="text-zinc-100 font-bold text-lg">{memberData?.name}</h2>
            <p className="text-zinc-500 text-sm">{memberData?.memberId}</p>
            <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Plan</span>
                <span className="text-amber-400 font-semibold">{memberData?.plan}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Trainer</span>
                <span className="text-zinc-300">{memberData?.trainer}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Joined</span>
                <span className="text-zinc-300">{memberData?.joinDate}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Expires</span>
                <span className="text-zinc-300">{memberData?.expiryDate}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Blood Group</span>
                <span className="text-red-400 font-semibold">{memberData?.bloodGroup}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Personal Info */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                <User size={14} className="text-amber-500" /> Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', value: memberData?.name, editable: false },
                  { label: 'Gender', value: memberData?.gender, editable: false },
                  { label: 'Age', value: memberData?.age + ' years', editable: false },
                  { label: 'Member ID', value: memberData?.memberId, editable: false },
                ]?.map(field => (
                  <div key={field?.label}>
                    <label className="form-label">{field?.label}</label>
                    <input value={field?.value} readOnly className="form-input text-xs opacity-60 cursor-not-allowed" />
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                <Phone size={14} className="text-amber-500" /> Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Phone Number</label>
                  <input
                    value={form?.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e?.target?.value }))}
                    readOnly={!editing}
                    className={`form-input text-xs ${!editing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    value={form?.email}
                    onChange={e => setForm(p => ({ ...p, email: e?.target?.value }))}
                    readOnly={!editing}
                    className={`form-input text-xs ${!editing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Address</label>
                  <input
                    value={form?.address}
                    onChange={e => setForm(p => ({ ...p, address: e?.target?.value }))}
                    readOnly={!editing}
                    className={`form-input text-xs ${!editing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div>
                  <label className="form-label">Emergency Contact</label>
                  <input
                    value={form?.emergencyContact}
                    onChange={e => setForm(p => ({ ...p, emergencyContact: e?.target?.value }))}
                    readOnly={!editing}
                    className={`form-input text-xs ${!editing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div>
                  <label className="form-label">Medical Notes</label>
                  <input
                    value={form?.medicalNotes}
                    onChange={e => setForm(p => ({ ...p, medicalNotes: e?.target?.value }))}
                    readOnly={!editing}
                    className={`form-input text-xs ${!editing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>
            </div>

            {/* Membership Info (read-only) */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                <Shield size={14} className="text-amber-500" /> Membership Details
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Plan', value: memberData?.plan },
                  { label: 'Trainer', value: memberData?.trainer },
                  { label: 'Join Date', value: memberData?.joinDate },
                  { label: 'Expiry Date', value: memberData?.expiryDate },
                  { label: 'Blood Group', value: memberData?.bloodGroup },
                  { label: 'Status', value: 'Active' },
                ]?.map(field => (
                  <div key={field?.label}>
                    <label className="form-label">{field?.label}</label>
                    <input value={field?.value} readOnly className="form-input text-xs opacity-60 cursor-not-allowed" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-600 mt-3 flex items-center gap-1.5">
                <Shield size={11} /> Membership details can only be changed by the gym admin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}