
'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Settings, Save, Building2, CreditCard, Clock, Bell, Shield, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'gym' | 'plans' | 'hours' | 'notifications' | 'security'>('gym');
  const [saved, setSaved] = useState(false);

  const [gymForm, setGymForm] = useState({
    name: 'DEN Fitness',
    tagline: 'Gym Management System',
    address: 'Shop Number 2, New Kailas Niwas 2, Near 90 Feet Rd, Netaji Nagar, Ashok Nagar, Saki Naka, Mumbai, Maharashtra 400072',
    phone: '+91 98765 43210',
    email: 'info@denfitness.in',
    website: 'www.denfitness.in',
    gst: '27AABCD1234E1Z5',
    established: '2018',
  });

  const [plans, setPlans] = useState([
    { id: 'P1', name: 'Monthly', price: '1500', duration: '1', features: 'Full gym access, Locker' },
    { id: 'P2', name: 'Quarterly', price: '3500', duration: '3', features: 'Full gym access, Locker, 1 PT session' },
    { id: 'P3', name: 'Half-Yearly', price: '6500', duration: '6', features: 'Full gym access, Locker, 3 PT sessions' },
    { id: 'P4', name: 'Annual', price: '12000', duration: '12', features: 'Full gym access, Locker, 6 PT sessions, Diet plan' },
  ]);

  const [hours, setHours] = useState({
    weekdayOpen: '06:00', weekdayClose: '22:00',
    saturdayOpen: '06:00', saturdayClose: '22:00',
    sundayOpen: '07:00', sundayClose: '13:00',
    holidayClosed: true,
  });

  const [notifSettings, setNotifSettings] = useState({
    feeReminder: true, feeReminderDays: '3',
    expiryAlert: true, expiryAlertDays: '7',
    attendanceAlert: true, attendanceThreshold: '50',
    newMemberAlert: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tabs = [
    { key: 'gym' as const, label: 'Gym Profile', icon: Building2 },
    { key: 'plans' as const, label: 'Membership Plans', icon: CreditCard },
    { key: 'hours' as const, label: 'Working Hours', icon: Clock },
    { key: 'notifications' as const, label: 'Notifications', icon: Bell },
    { key: 'security' as const, label: 'Security', icon: Shield },
  ];

  return (
    <AppLayout activePath="/settings">
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Manage gym profile, plans, and system preferences</p>
          </div>
          <button onClick={handleSave} className={`btn-primary text-xs transition-all ${saved ? 'bg-emerald-500 hover:bg-emerald-400' : ''}`}>
            {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-52 shrink-0">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 space-y-0.5">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                    activeTab === tab.key
                      ? 'bg-amber-500/15 text-amber-400' :'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  <tab.icon size={15} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            {activeTab === 'gym' && (
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-zinc-200 mb-4">Gym Profile Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Gym Name</label>
                    <input value={gymForm.name} onChange={e => setGymForm(p => ({ ...p, name: e.target.value }))} className="form-input text-xs" />
                  </div>
                  <div>
                    <label className="form-label">Tagline</label>
                    <input value={gymForm.tagline} onChange={e => setGymForm(p => ({ ...p, tagline: e.target.value }))} className="form-input text-xs" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="form-label">Address</label>
                    <textarea value={gymForm.address} onChange={e => setGymForm(p => ({ ...p, address: e.target.value }))} className="form-input text-xs resize-none" rows={2} />
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input value={gymForm.phone} onChange={e => setGymForm(p => ({ ...p, phone: e.target.value }))} className="form-input text-xs" />
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <input type="email" value={gymForm.email} onChange={e => setGymForm(p => ({ ...p, email: e.target.value }))} className="form-input text-xs" />
                  </div>
                  <div>
                    <label className="form-label">Website</label>
                    <input value={gymForm.website} onChange={e => setGymForm(p => ({ ...p, website: e.target.value }))} className="form-input text-xs" />
                  </div>
                  <div>
                    <label className="form-label">GST Number</label>
                    <input value={gymForm.gst} onChange={e => setGymForm(p => ({ ...p, gst: e.target.value }))} className="form-input text-xs" />
                  </div>
                  <div>
                    <label className="form-label">Established Year</label>
                    <input value={gymForm.established} onChange={e => setGymForm(p => ({ ...p, established: e.target.value }))} className="form-input text-xs" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'plans' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-200 mb-4">Membership Plan Pricing</h3>
                {plans.map((plan, i) => (
                  <div key={plan.id} className="p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="form-label">Plan Name</label>
                        <input
                          value={plan.name}
                          onChange={e => setPlans(prev => prev.map((p, idx) => idx === i ? { ...p, name: e.target.value } : p))}
                          className="form-input text-xs"
                        />
                      </div>
                      <div>
                        <label className="form-label">Price (₹)</label>
                        <input
                          type="number"
                          value={plan.price}
                          onChange={e => setPlans(prev => prev.map((p, idx) => idx === i ? { ...p, price: e.target.value } : p))}
                          className="form-input text-xs"
                        />
                      </div>
                      <div>
                        <label className="form-label">Duration (months)</label>
                        <input
                          type="number"
                          value={plan.duration}
                          onChange={e => setPlans(prev => prev.map((p, idx) => idx === i ? { ...p, duration: e.target.value } : p))}
                          className="form-input text-xs"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="form-label">Features</label>
                        <input
                          value={plan.features}
                          onChange={e => setPlans(prev => prev.map((p, idx) => idx === i ? { ...p, features: e.target.value } : p))}
                          className="form-input text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'hours' && (
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-zinc-200 mb-4">Working Hours</h3>
                {[
                  { label: 'Weekdays (Mon–Fri)', openKey: 'weekdayOpen' as const, closeKey: 'weekdayClose' as const },
                  { label: 'Saturday', openKey: 'saturdayOpen' as const, closeKey: 'saturdayClose' as const },
                  { label: 'Sunday', openKey: 'sundayOpen' as const, closeKey: 'sundayClose' as const },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl">
                    <p className="text-zinc-300 text-sm font-medium w-40 shrink-0">{row.label}</p>
                    <div className="flex items-center gap-3">
                      <input type="time" value={hours[row.openKey]} onChange={e => setHours(p => ({ ...p, [row.openKey]: e.target.value }))} className="form-input text-xs w-auto" />
                      <span className="text-zinc-600 text-xs">to</span>
                      <input type="time" value={hours[row.closeKey]} onChange={e => setHours(p => ({ ...p, [row.closeKey]: e.target.value }))} className="form-input text-xs w-auto" />
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-xl">
                  <input
                    type="checkbox"
                    id="holidayClosed"
                    checked={hours.holidayClosed}
                    onChange={e => setHours(p => ({ ...p, holidayClosed: e.target.checked }))}
                    className="w-4 h-4 accent-amber-500"
                  />
                  <label htmlFor="holidayClosed" className="text-zinc-300 text-sm">Closed on public holidays</label>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-zinc-200 mb-4">Notification Preferences</h3>
                {[
                  {
                    key: 'feeReminder' as const, label: 'Fee Due Reminder',
                    desc: 'Send reminder before fee due date',
                    extra: { key: 'feeReminderDays' as const, label: 'Days before due' }
                  },
                  {
                    key: 'expiryAlert' as const, label: 'Membership Expiry Alert',
                    desc: 'Alert before membership expires',
                    extra: { key: 'expiryAlertDays' as const, label: 'Days before expiry' }
                  },
                  {
                    key: 'attendanceAlert' as const, label: 'Low Attendance Alert',
                    desc: 'Alert when attendance drops below threshold',
                    extra: { key: 'attendanceThreshold' as const, label: 'Threshold (%)' }
                  },
                ].map(item => (
                  <div key={item.key} className="p-4 bg-zinc-800/50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-zinc-200 text-sm font-medium">{item.label}</p>
                        <p className="text-zinc-500 text-xs">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifSettings(p => ({ ...p, [item.key]: !p[item.key] }))}
                        className={`relative w-10 h-5 rounded-full transition-colors ${notifSettings[item.key] ? 'bg-amber-500' : 'bg-zinc-700'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifSettings[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                    {notifSettings[item.key] && (
                      <div className="flex items-center gap-3">
                        <label className="text-zinc-500 text-xs">{item.extra.label}:</label>
                        <input
                          type="number"
                          value={notifSettings[item.extra.key]}
                          onChange={e => setNotifSettings(p => ({ ...p, [item.extra.key]: e.target.value }))}
                          className="form-input text-xs w-20"
                        />
                      </div>
                    )}
                  </div>
                ))}
                <div className="p-4 bg-zinc-800/50 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-zinc-200 text-sm font-medium">New Member Alert</p>
                    <p className="text-zinc-500 text-xs">Notify when a new member joins</p>
                  </div>
                  <button
                    onClick={() => setNotifSettings(p => ({ ...p, newMemberAlert: !p.newMemberAlert }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${notifSettings.newMemberAlert ? 'bg-amber-500' : 'bg-zinc-700'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifSettings.newMemberAlert ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-zinc-200 mb-4">Security Settings</h3>
                <div className="p-4 bg-zinc-800/50 rounded-xl space-y-4">
                  <p className="text-zinc-300 text-sm font-medium">Change Password</p>
                  <div>
                    <label className="form-label">Current Password</label>
                    <input type="password" className="form-input text-xs" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-input text-xs" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" className="form-input text-xs" placeholder="••••••••" />
                  </div>
                  <button className="btn-primary text-xs"><Shield size={14} /> Update Password</button>
                </div>
                <div className="p-4 bg-zinc-800/50 rounded-xl">
                  <p className="text-zinc-300 text-sm font-medium mb-1">Login Sessions</p>
                  <p className="text-zinc-500 text-xs mb-3">Manage active sessions across devices</p>
                  <div className="space-y-2">
                    {[
                      { device: 'Chrome on Windows', location: 'Mumbai, IN', time: 'Active now', current: true },
                      { device: 'Safari on iPhone', location: 'Mumbai, IN', time: '2 hours ago', current: false },
                    ].map((session, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg">
                        <div>
                          <p className="text-zinc-300 text-xs font-medium">{session.device}</p>
                          <p className="text-zinc-600 text-[10px]">{session.location} · {session.time}</p>
                        </div>
                        {session.current
                          ? <span className="badge badge-active text-[10px]">Current</span>
                          : <button className="text-xs text-red-400 hover:text-red-300 transition-colors">Revoke</button>
                        }
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
