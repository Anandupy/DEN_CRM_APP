import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  attendanceSeries,
  mockActivities,
  mockAttendance,
  mockErpSnapshot,
  mockFees,
  mockMembers,
  mockTrainers,
  planPricing,
  revenueSeries,
} from './mock-data';
import type {
  ActivityItem,
  AttendanceEntry,
  AttendanceStatus,
  AttendanceTrendPoint,
  DashboardSummary,
  ErpSnapshot,
  FeeRecord,
  InventoryTransactionRecord,
  MemberAttendanceMonthSummary,
  Member,
  MemberPaymentEntry,
  MemberPortalSnapshot,
  NotificationLog,
  PlanPrice,
  RevenuePoint,
  SupplementProduct,
  Trainer,
  TrainerSalaryRecord,
} from './types';

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: 'owner' | 'senior_trainer' | 'trainer' | 'member';
};

type PlanRow = {
  plan_name: string;
  price: number;
  duration_label: string;
  duration_months: number;
  is_active?: boolean;
};

type SaveMemberInput = Omit<Member, 'id' | 'memberId' | 'profileInitials' | 'profileColor' | 'attendancePct'> & {
  id?: string;
  memberId?: string;
};

type SaveTrainerInput = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  schedule: string;
};

type SaveFeeInput = {
  memberCode: string;
  amount: number;
  mode: FeeRecord['mode'];
  month: string;
  notes?: string;
  actorProfileId?: string;
};

type SavePlanInput = {
  plan: string;
  price: number;
  durationMonths: number;
  durationLabel: string;
  isActive: boolean;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function generateMemberCode() {
  return `DEN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

const palette = [
  'bg-blue-500/20 text-blue-400',
  'bg-pink-500/20 text-pink-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-amber-500/20 text-amber-400',
  'bg-purple-500/20 text-purple-400',
  'bg-cyan-500/20 text-cyan-400',
  'bg-rose-500/20 text-rose-400',
  'bg-teal-500/20 text-teal-400',
  'bg-indigo-500/20 text-indigo-400',
  'bg-lime-500/20 text-lime-400',
];

function pickColor(seed: string) {
  const hash = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return palette[hash % palette.length];
}

function formatPct(value: number) {
  return `${Math.round(value)}%`;
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function getPlanPrice(plan: string, plans: PlanPrice[] = planPricing) {
  return plans.find((item) => item.plan === plan)?.price ?? 0;
}

function formatDateLabel(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function normalizeBillingMonthLabel(value: string | null | undefined, fallbackDate?: string) {
  const input = value?.trim();

  if (input) {
    const parsed = new Date(input);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    }

    return input;
  }

  return formatBillingMonth(fallbackDate ?? getTodayKey());
}

function parseNumericValue(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getRemainingFeeAmount(amount: number, paidAmount: number) {
  return Math.max(0, amount - paidAmount);
}

function resolveFeeStatus(amount: number, paidAmount: number, dueDate: string) {
  const remaining = getRemainingFeeAmount(amount, paidAmount);
  if (remaining <= 0) return 'paid' as const;
  return dueDate < getTodayKey() ? 'overdue' as const : 'pending' as const;
}

function formatBillingMonth(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Current Month';
  return parsed.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function getMonthSortValue(monthLabel: string) {
  const parsed = new Date(`1 ${monthLabel}`);
  if (!Number.isNaN(parsed.getTime())) return parsed.getTime();

  const fallback = new Date(monthLabel);
  return Number.isNaN(fallback.getTime()) ? 0 : fallback.getTime();
}

function formatShortDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function mapPlanPricing(rows: Record<string, unknown>[]): PlanPrice[] {
  return rows
    .map((row) => ({
      plan: String(row.plan_name ?? row.plan ?? ''),
      price: Number(row.price ?? 0),
      duration: String(row.duration_label ?? row.duration ?? `${row.duration_months ?? 1} Month`),
    }));
}

async function loadPlanPricingFromSupabase(client: SupabaseClient) {
  const { data, error } = await client.from('plans').select('*').order('duration_months', { ascending: true });

  if (error || !data?.length) {
    return planPricing;
  }

  return mapPlanPricing(data as Record<string, unknown>[]);
}

function normalizeMemberStatus(status: string | null | undefined): Member['status'] {
  switch ((status ?? '').toLowerCase()) {
    case 'active':
      return 'active';
    case 'paused':
      return 'inactive';
    case 'left':
      return 'expired';
    case 'suspended':
      return 'suspended';
    default:
      return 'active';
  }
}

function normalizeAttendanceStatus(status: string | null | undefined): AttendanceEntry['status'] {
  switch ((status ?? '').toLowerCase()) {
    case 'present':
      return 'present';
    case 'absent':
      return 'absent';
    case 'late':
      return 'late';
    default:
      return null;
  }
}

function buildDashboard(members: Member[], fees: FeeRecord[], attendance: AttendanceEntry[]): DashboardSummary {
  const activeMembers = members.filter((member) => member.status === 'active').length;
  const currentMonth = formatBillingMonth(getTodayKey());
  const joinedThisMonth = members.filter((member) => formatBillingMonth(member.joinDate) === currentMonth).length;
  const presentToday = attendance.filter((entry) => entry.status === 'present').length;
  const absentToday = attendance.filter((entry) => entry.status === 'absent').length;
  const pendingFeeRecords = fees.filter((fee) => fee.status !== 'paid');
  const revenueForMonth = fees
    .filter((fee) => fee.status === 'paid' && fee.month === currentMonth)
    .reduce((sum, fee) => sum + fee.paidAmount, 0);
  const upcomingCutoff = new Date();
  upcomingCutoff.setDate(upcomingCutoff.getDate() + 7);
  const upcomingCutoffKey = upcomingCutoff.toISOString().split('T')[0];

  return {
    totalActiveMembers: activeMembers,
    joinedThisMonth,
    presentToday,
    absentToday,
    attendanceRateToday: attendance.length ? Number(((presentToday / attendance.length) * 100).toFixed(1)) : 0,
    inactiveForSevenDays: members.filter((member) => Number.parseInt(member.attendancePct, 10) < 60).length,
    pendingFeesCount: pendingFeeRecords.length,
    pendingFeesAmount: pendingFeeRecords.reduce((sum, fee) => sum + (fee.amount - fee.paidAmount), 0),
    monthlyRevenue: revenueForMonth,
    monthlyRevenueGrowth: 12.3,
    newAdmissions: joinedThisMonth,
    expiringSoon: members.filter((member) => member.expiryDate >= getTodayKey() && member.expiryDate <= upcomingCutoffKey).length,
  };
}

function mapMembers(rows: Record<string, unknown>[], profilesById: Map<string, ProfileRow>): Member[] {
  return rows.map((row) => {
    const profileId = String(row.profile_id ?? '');
    const profile = profilesById.get(profileId);
    const name = String(row.full_name ?? row.name ?? 'Unnamed Member');
    const resolvedName = profile?.full_name ?? name;
    const resolvedPhone = profile?.phone ?? String(row.phone ?? row.mobile ?? '');
    const resolvedEmail = profile?.email ?? String(row.email ?? '');
    const planName = String(row.plan_name ?? row.plan ?? 'Monthly');
    const monthlyFee = Number(row.monthly_fee ?? 0);

    return {
      id: String(row.id),
      memberId: String(row.member_code ?? row.memberId ?? row.id),
      name: resolvedName,
      mobile: resolvedPhone,
      email: resolvedEmail,
      address: String(row.address ?? ''),
      gender: (row.gender as Member['gender']) ?? 'Other',
      age: String(row.age ?? ''),
      joinDate: String(row.joined_on ?? row.join_date ?? row.joinDate ?? ''),
      expiryDate: String(row.expires_on ?? row.expiryDate ?? ''),
      plan: (planName as Member['plan']) ?? 'Monthly',
      trainer: String(row.trainer_name ?? row.trainer ?? 'Unassigned'),
      emergencyContact: String(row.emergency_contact ?? ''),
      medicalNotes: String(row.medical_notes ?? row.notes ?? 'None'),
      status: normalizeMemberStatus(String(row.status ?? 'active')),
      feesStatus: (row.fees_status as Member['feesStatus']) ?? (monthlyFee > 0 ? 'pending' : 'paid'),
      attendancePct: formatPct(Number(row.attendance_pct ?? 0)),
      profileInitials: getInitials(resolvedName),
      profileColor: pickColor(resolvedName),
      lastPaymentMode: (row.last_payment_mode as Member['lastPaymentMode']) ?? 'Cash',
      lastPaymentDate: String(row.last_payment_date ?? ''),
    };
  });
}

function mapTrainers(rows: Record<string, unknown>[]): Trainer[] {
  return rows.map((row) => {
    const name = String(row.full_name ?? row.name ?? 'Unnamed Trainer');
    return {
      id: String(row.id),
      trainerId: String(row.trainer_code ?? row.id),
      name,
      email: String(row.email ?? ''),
      phone: String(row.phone ?? ''),
      specialization: String(row.specialization ?? ''),
      experience: String(row.experience_label ?? (row.experience_years ? `${row.experience_years} years` : '')),
      assignedMembers: Number(row.assigned_members ?? 0),
      rating: Number(row.rating ?? 0),
      joinDate: String(row.joined_on ?? ''),
      status: (row.status as Trainer['status']) ?? 'active',
      initials: getInitials(name),
      color: pickColor(name),
      schedule: String(row.shift_label ?? row.schedule ?? ''),
    };
  });
}

function mapTrainersFromProfiles(rows: ProfileRow[], members: Member[]): Trainer[] {
  return rows
    .filter((profile) => profile.role === 'trainer' || profile.role === 'senior_trainer')
    .map((profile, index) => {
      const assignedMembers = members.filter((member) => member.trainer === profile.full_name).length;
      return {
        id: profile.id,
        trainerId: `T${String(index + 1).padStart(3, '0')}`,
        name: profile.full_name,
        email: profile.email,
        phone: profile.phone ?? '',
        specialization: 'Gym Trainer',
        experience: 'Available',
        assignedMembers,
        rating: 0,
        joinDate: '2026-04-10',
        status: 'active',
        initials: getInitials(profile.full_name),
        color: pickColor(profile.full_name),
        schedule: 'Mon-Sat',
      };
    });
}

function mapFees(rows: Record<string, unknown>[]): FeeRecord[] {
  return rows.map((row) => {
    const memberName = String(row.member_name ?? 'Unknown Member');
    const amount = parseNumericValue(row.amount);
    const paidAmount = parseNumericValue(row.paid_amount);
    const dueDate = String(row.due_date ?? '');
    return {
      id: String(row.id),
      memberId: String(row.member_code ?? row.member_id ?? ''),
      memberName,
      initials: getInitials(memberName),
      color: pickColor(memberName),
      plan: String(row.plan_name ?? row.plan ?? 'Monthly'),
      amount,
      paidAmount,
      dueDate,
      paidDate: row.paid_date ? String(row.paid_date) : null,
      status: ((row.status as FeeRecord['status']) ?? resolveFeeStatus(amount, paidAmount, dueDate)),
      mode: (row.payment_mode as FeeRecord['mode']) ?? null,
      month: normalizeBillingMonthLabel(String(row.billing_month ?? row.month ?? ''), dueDate),
    };
  });
}

function mapPayments(
  rows: Record<string, unknown>[],
  membersById: Map<string, Member>
): FeeRecord[] {
  return rows.map((row) => {
    const member = membersById.get(String(row.member_id ?? ''));
    const amount = parseNumericValue(row.amount);
    const memberName = member?.name ?? 'Unknown Member';
    const paymentDate = String(row.payment_date ?? row.billing_month ?? '');

    return {
      id: String(row.id),
      memberId: member?.memberId ?? String(row.member_id ?? ''),
      memberName,
      initials: getInitials(memberName),
      color: pickColor(memberName),
      plan: member?.plan ?? 'Monthly',
      amount,
      paidAmount: amount,
      dueDate: paymentDate,
      paidDate: paymentDate,
      status: 'paid',
      mode: (row.payment_mode as FeeRecord['mode']) ?? null,
      month: normalizeBillingMonthLabel(String(row.billing_month ?? ''), paymentDate),
    };
  });
}

function buildDerivedFeeRecords(members: Member[], existingFees: FeeRecord[], plans: PlanPrice[]) {
  const existingMemberIds = new Set(existingFees.map((fee) => fee.memberId));

  return members
    .filter((member) => !existingMemberIds.has(member.memberId))
    .map((member): FeeRecord => {
      const amount = getPlanPrice(member.plan, plans);
      return {
        id: `derived-${member.id}`,
        memberId: member.memberId,
        memberName: member.name,
        initials: member.profileInitials,
        color: member.profileColor,
        plan: member.plan,
        amount,
        paidAmount: member.feesStatus === 'paid' ? amount : 0,
        dueDate: member.joinDate || new Date().toISOString().split('T')[0],
        paidDate: member.feesStatus === 'paid' ? member.lastPaymentDate : null,
        status: member.feesStatus,
        mode: member.feesStatus === 'paid' ? member.lastPaymentMode : null,
        month: formatBillingMonth(member.joinDate || new Date().toISOString().split('T')[0]),
      };
    });
}

function buildFeePayloadFromMember(member: Member, plans: PlanPrice[]) {
  const amount = getPlanPrice(member.plan, plans);
  const dueDate = member.joinDate || getTodayKey();
  const paidAmount = member.feesStatus === 'paid' ? amount : 0;
  return {
    member_id: member.id,
    member_code: member.memberId,
    member_name: member.name,
    plan_name: member.plan,
    fee_type: 'monthly',
    amount,
    paid_amount: paidAmount,
    due_date: dueDate,
    paid_date: member.feesStatus === 'paid' ? member.lastPaymentDate : null,
    status: resolveFeeStatus(amount, paidAmount, dueDate),
    payment_mode: member.feesStatus === 'paid' ? member.lastPaymentMode : null,
    billing_month: normalizeBillingMonthLabel(member.joinDate, dueDate),
    notes: member.medicalNotes || '',
    created_by: null,
  };
}

async function insertFeeRows(
  client: SupabaseClient,
  payload: Record<string, unknown> | Array<Record<string, unknown>>,
  selectColumns = '*'
) {
  const primaryResult = await client.from('fees').insert(payload as never).select(selectColumns);

  if (!primaryResult.error) {
    return primaryResult;
  }

  const errorMessage = `${primaryResult.error.message} ${primaryResult.error.details ?? ''}`.toLowerCase();
  if (!errorMessage.includes('fee_type')) {
    return primaryResult;
  }

  const sanitizedPayload = Array.isArray(payload)
    ? payload.map(({ fee_type: _feeType, ...rest }) => rest)
    : (({ fee_type: _feeType, ...rest }) => rest)(payload);

  return client.from('fees').insert(sanitizedPayload as never).select(selectColumns);
}

async function insertPaymentRow(
  client: SupabaseClient,
  payload: Record<string, unknown>
) {
  const primaryResult = await client.from('payments').insert(payload);

  if (!primaryResult.error) {
    return primaryResult;
  }

  const errorMessage = `${primaryResult.error.message} ${primaryResult.error.details ?? ''}`.toLowerCase();
  if (!errorMessage.includes('payment_mode') && !errorMessage.includes('fee_id') && !errorMessage.includes('reference_no')) {
    return primaryResult;
  }

  const { payment_mode: _paymentMode, fee_id: _feeId, reference_no: _referenceNo, ...legacyPayload } = payload;
  return client.from('payments').insert(legacyPayload);
}

async function backfillMissingFeesInSupabase(
  client: SupabaseClient,
  members: Member[],
  existingFees: FeeRecord[],
  plans: PlanPrice[]
) {
  const existingMemberIds = new Set(existingFees.map((fee) => fee.memberId));
  const missingMembers = members.filter((member) => !existingMemberIds.has(member.memberId));

  if (!missingMembers.length) {
    return existingFees;
  }

  const missingPayload = missingMembers.map((member) => buildFeePayloadFromMember(member, plans));
  const { data, error } = await insertFeeRows(client, missingPayload);

  if (error || !data) {
    return existingFees;
  }

  return [...existingFees, ...mapFees(data as unknown as Record<string, unknown>[])];
}

function buildRevenueSeries(fees: FeeRecord[]): RevenuePoint[] {
  const grouped = new Map<string, number>();

  fees
    .filter((fee) => fee.status === 'paid')
    .forEach((fee) => {
      const key = fee.month || formatBillingMonth(fee.paidDate ?? fee.dueDate);
      grouped.set(key, (grouped.get(key) ?? 0) + fee.paidAmount);
    });

  const sorted = [...grouped.entries()]
    .sort((left, right) => getMonthSortValue(left[0]) - getMonthSortValue(right[0]))
    .slice(-6);

  if (!sorted.length) {
    return revenueSeries;
  }

  return sorted.map(([month, revenue]) => ({
    month,
    revenue,
    target: Math.round(revenue * 1.1),
  }));
}

function buildRevenueSeriesFromPaymentRows(rows: Record<string, unknown>[]): RevenuePoint[] {
  const grouped = new Map<string, number>();

  rows.forEach((row) => {
    const paymentDate = String(row.payment_date ?? getTodayKey());
    const key = normalizeBillingMonthLabel(String(row.billing_month ?? ''), paymentDate);
    grouped.set(key, (grouped.get(key) ?? 0) + parseNumericValue(row.amount));
  });

  const sorted = [...grouped.entries()]
    .sort((left, right) => getMonthSortValue(left[0]) - getMonthSortValue(right[0]))
    .slice(-6);

  if (!sorted.length) {
    return revenueSeries;
  }

  return sorted.map(([month, revenue]) => ({
    month,
    revenue,
    target: Math.round(revenue * 1.1),
  }));
}

function buildCurrentMonthRevenueFromPayments(rows: Record<string, unknown>[]) {
  const currentMonth = normalizeBillingMonthLabel(getTodayKey(), getTodayKey());
  return rows.reduce((sum, row) => {
    const paymentDate = String(row.payment_date ?? getTodayKey());
    const month = normalizeBillingMonthLabel(String(row.billing_month ?? ''), paymentDate);
    if (month !== currentMonth) return sum;
    return sum + parseNumericValue(row.amount);
  }, 0);
}

function buildAttendanceSeries(entries: AttendanceEntry[]): AttendanceTrendPoint[] {
  const grouped = new Map<string, { present: number; absent: number }>();

  entries.forEach((entry) => {
    const bucket = grouped.get(entry.date) ?? { present: 0, absent: 0 };
    if (entry.status === 'present') bucket.present += 1;
    if (entry.status === 'absent') bucket.absent += 1;
    grouped.set(entry.date, bucket);
  });

  const sorted = [...grouped.entries()]
    .sort((left, right) => new Date(left[0]).getTime() - new Date(right[0]).getTime())
    .slice(-7);

  if (!sorted.length) {
    return attendanceSeries;
  }

  return sorted.map(([date, counts]) => ({
    day: formatShortDate(date),
    present: counts.present,
    absent: counts.absent,
  }));
}

function buildMonthlyAttendanceSummary(entries: AttendanceEntry[]): MemberAttendanceMonthSummary[] {
  const grouped = new Map<string, { present: number; absent: number; late: number }>();

  entries.forEach((entry) => {
    const key = normalizeBillingMonthLabel(entry.date, entry.date);
    const bucket = grouped.get(key) ?? { present: 0, absent: 0, late: 0 };

    if (entry.status === 'present') bucket.present += 1;
    if (entry.status === 'absent') bucket.absent += 1;
    if (entry.status === 'late') bucket.late += 1;
    grouped.set(key, bucket);
  });

  return [...grouped.entries()]
    .sort((left, right) => getMonthSortValue(right[0]) - getMonthSortValue(left[0]))
    .map(([month, counts]) => {
      const total = counts.present + counts.absent + counts.late;
      const pct = total ? Math.round((counts.present / total) * 100) : 0;

      return {
        month,
        present: counts.present,
        absent: counts.absent,
        late: counts.late,
        total,
        pct,
      };
    });
}

function mapAttendance(rows: Record<string, unknown>[]): AttendanceEntry[] {
  return rows.map((row) => {
    const memberName = String(row.member_name ?? 'Unknown Member');
    return {
      id: String(row.id),
      memberId: String(row.member_code ?? row.member_id ?? ''),
      memberName,
      trainer: String(row.trainer_name ?? 'Unassigned'),
      initials: getInitials(memberName),
      color: pickColor(memberName),
      date: String(row.attendance_date ?? row.date ?? ''),
      status: normalizeAttendanceStatus(String(row.status ?? '')),
    };
  });
}

function mapMemberPayments(
  rows: Record<string, unknown>[],
  feesById: Map<string, FeeRecord>,
  fallbackPlan: string
): MemberPaymentEntry[] {
  return rows.map((row) => {
    const fee = feesById.get(String(row.fee_id ?? ''));
    const amount = parseNumericValue(row.amount);
    const paymentDate = String(row.payment_date ?? getTodayKey());
    const pendingBalance = fee ? getRemainingFeeAmount(fee.amount, fee.paidAmount) : 0;

    return {
      id: String(row.id),
      amount,
      paymentDate,
      paymentMode: (row.payment_mode as MemberPaymentEntry['paymentMode']) ?? null,
      month: fee?.month ?? normalizeBillingMonthLabel(String(row.billing_month ?? ''), paymentDate),
      status: fee?.status ?? 'paid',
      plan: fee?.plan ?? fallbackPlan,
      pendingBalance,
    };
  });
}

function mapActivities(rows: Record<string, unknown>[]): ActivityItem[] {
  return rows.map((row) => ({
    id: String(row.id),
    type: (row.activity_type as ActivityItem['type']) ?? 'attendance_marked',
    member: String(row.member_name ?? row.member ?? 'System'),
    detail: String(row.detail ?? ''),
    time: String(row.activity_time ?? row.time ?? ''),
    amount: row.amount ? String(row.amount) : undefined,
  }));
}

export async function loadErpSnapshot(): Promise<ErpSnapshot> {
  if (!isSupabaseConfigured()) {
    return mockErpSnapshot;
  }

  try {
    const client = getSupabaseBrowserClient();

    if (!client) {
      return mockErpSnapshot;
    }

    const [profilesResult, membersResult, trainersResult, plansResult, feesResult, paymentsResult, attendanceResult, activityResult] = await Promise.all([
      client.from('profiles').select('id, full_name, email, phone, role'),
      client.from('members').select('*'),
      client.from('trainers').select('*'),
      client.from('plans').select('*').order('duration_months', { ascending: true }),
      client.from('fees').select('*'),
      client.from('payments').select('*'),
      client.from('attendance').select('*').order('attendance_date', { ascending: false }),
      client.from('activities').select('*').order('created_at', { ascending: false }).limit(8),
    ]);

    if (membersResult.error || profilesResult.error || attendanceResult.error) {
      return mockErpSnapshot;
    }

    const profiles = (profilesResult.data ?? []) as ProfileRow[];
    const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
    const livePlanPricing = plansResult.error
      ? planPricing
      : mapPlanPricing((plansResult.data ?? []) as Record<string, unknown>[]);
    const effectivePlanPricing = livePlanPricing.length ? livePlanPricing : planPricing;
    const members = mapMembers((membersResult.data ?? []) as Record<string, unknown>[], profilesById);
    const membersById = new Map(members.map((member) => [member.id, member]));
    const trainers = trainersResult.error
      ? mapTrainersFromProfiles(profiles, members)
      : mapTrainers((trainersResult.data ?? []) as Record<string, unknown>[]);
    const fees = feesResult.error
      ? paymentsResult.error
        ? mockFees
        : mapPayments((paymentsResult.data ?? []) as Record<string, unknown>[], membersById)
      : mapFees((feesResult.data ?? []) as Record<string, unknown>[]);
    const hydratedFees = feesResult.error ? fees : await backfillMissingFeesInSupabase(client, members, fees, effectivePlanPricing);
    const completeFees = [...hydratedFees, ...buildDerivedFeeRecords(members, hydratedFees, effectivePlanPricing)];
    const paymentRows = (paymentsResult.data ?? []) as Record<string, unknown>[];
    const attendanceHistory = mapAttendance((attendanceResult.data ?? []) as Record<string, unknown>[]);
    const latestAttendanceDate = attendanceHistory
      .map((entry) => entry.date)
      .sort()
      .at(-1);
    const attendance = latestAttendanceDate
      ? attendanceHistory.filter((entry) => entry.date === latestAttendanceDate)
      : [];
    const activities = activityResult.error
      ? mockActivities
      : mapActivities((activityResult.data ?? []) as Record<string, unknown>[]);
    const dashboard = buildDashboard(members, completeFees, attendance);

    if (!paymentsResult.error) {
      dashboard.monthlyRevenue = buildCurrentMonthRevenueFromPayments(paymentRows);
    }

    return {
      source: 'supabase',
      members,
      trainers,
      fees: completeFees,
      attendance,
      activities,
      planPricing: effectivePlanPricing,
      revenueSeries: paymentsResult.error ? buildRevenueSeries(completeFees) : buildRevenueSeriesFromPaymentRows(paymentRows),
      attendanceSeries: buildAttendanceSeries(attendanceHistory),
      dashboard,
    };
  } catch {
    return mockErpSnapshot;
  }
}

export function getErpFallbackData() {
  return {
    members: mockMembers,
    trainers: mockTrainers,
    fees: mockFees,
    attendance: mockAttendance,
    dashboard: buildDashboard(mockMembers, mockFees, mockAttendance),
  };
}

export async function loadMemberPortalSnapshot(profileId?: string): Promise<MemberPortalSnapshot> {
  const fallbackMember = mockMembers[0] ?? null;
  const fallbackFees = mockFees.filter((fee) => fee.memberId === fallbackMember?.memberId);
  const fallbackAttendance = mockAttendance.filter((entry) => entry.memberId === fallbackMember?.memberId);

  if (!isSupabaseConfigured() || !profileId) {
    return {
      source: 'mock',
      member: fallbackMember,
      fees: fallbackFees,
      payments: fallbackFees
        .filter((fee) => fee.paidAmount > 0)
        .map((fee) => ({
          id: fee.id,
          amount: fee.paidAmount,
          paymentDate: fee.paidDate ?? fee.dueDate,
          paymentMode: fee.mode,
          month: fee.month,
          status: fee.status,
          plan: fee.plan,
          pendingBalance: getRemainingFeeAmount(fee.amount, fee.paidAmount),
        })),
      attendance: fallbackAttendance,
      attendanceSeries: buildAttendanceSeries(fallbackAttendance),
      monthlyAttendance: buildMonthlyAttendanceSummary(fallbackAttendance),
    };
  }

  try {
    const client = getSupabaseBrowserClient();

    if (!client) {
      throw new Error('Supabase client is unavailable.');
    }

    const [profileResult, memberResult, planRows] = await Promise.all([
      client.from('profiles').select('id, full_name, email, phone, role').eq('id', profileId).single(),
      client.from('members').select('*').eq('profile_id', profileId).single(),
      loadPlanPricingFromSupabase(client),
    ]);

    if (memberResult.error || !memberResult.data) {
      return {
        source: 'supabase',
        member: null,
        fees: [],
        payments: [],
        attendance: [],
        attendanceSeries: [],
        monthlyAttendance: [],
      };
    }

    const profileRows = profileResult.data ? [profileResult.data as ProfileRow] : [];
    const profilesById = new Map(profileRows.map((profile) => [profile.id, profile]));
    const member = mapMembers([memberResult.data as Record<string, unknown>], profilesById)[0] ?? null;

    if (!member) {
      return {
        source: 'supabase',
        member: null,
        fees: [],
        payments: [],
        attendance: [],
        attendanceSeries: [],
        monthlyAttendance: [],
      };
    }

    const [feesResult, paymentsResult, attendanceResult] = await Promise.all([
      client.from('fees').select('*').eq('member_id', member.id).order('due_date', { ascending: false }),
      client.from('payments').select('*').eq('member_id', member.id).order('payment_date', { ascending: false }),
      client.from('attendance').select('*').eq('member_id', member.id).order('attendance_date', { ascending: false }),
    ]);

    const mappedFees = feesResult.error
      ? buildDerivedFeeRecords([member], [], planRows)
      : mapFees((feesResult.data ?? []) as Record<string, unknown>[]);
    const fees = mappedFees.length ? mappedFees : buildDerivedFeeRecords([member], [], planRows);
    const feesById = new Map(fees.map((fee) => [fee.id, fee]));
    const attendance = attendanceResult.error ? [] : mapAttendance((attendanceResult.data ?? []) as Record<string, unknown>[]);
    const payments = paymentsResult.error
      ? fees
          .filter((fee) => fee.paidAmount > 0)
          .map((fee) => ({
            id: fee.id,
            amount: fee.paidAmount,
            paymentDate: fee.paidDate ?? fee.dueDate,
            paymentMode: fee.mode,
            month: fee.month,
            status: fee.status,
            plan: fee.plan,
            pendingBalance: getRemainingFeeAmount(fee.amount, fee.paidAmount),
          }))
      : mapMemberPayments((paymentsResult.data ?? []) as Record<string, unknown>[], feesById, member.plan);

    return {
      source: 'supabase',
      member,
      fees,
      payments,
      attendance,
      attendanceSeries: buildAttendanceSeries(attendance),
      monthlyAttendance: buildMonthlyAttendanceSummary(attendance),
    };
  } catch {
    return {
      source: 'mock',
      member: fallbackMember,
      fees: fallbackFees,
      payments: fallbackFees
        .filter((fee) => fee.paidAmount > 0)
        .map((fee) => ({
          id: fee.id,
          amount: fee.paidAmount,
          paymentDate: fee.paidDate ?? fee.dueDate,
          paymentMode: fee.mode,
          month: fee.month,
          status: fee.status,
          plan: fee.plan,
          pendingBalance: getRemainingFeeAmount(fee.amount, fee.paidAmount),
        })),
      attendance: fallbackAttendance,
      attendanceSeries: buildAttendanceSeries(fallbackAttendance),
      monthlyAttendance: buildMonthlyAttendanceSummary(fallbackAttendance),
    };
  }
}

export async function loadAttendanceStatusMap(date: string) {
  const client = getSupabaseBrowserClient();

  if (!client) {
      return Object.fromEntries(mockErpSnapshot.attendance.map((entry) => [entry.memberId, entry.status]));
  }

  const { data, error } = await client
    .from('attendance')
    .select('member_code, status')
    .eq('attendance_date', date);

  if (error || !data) {
    return Object.fromEntries(mockErpSnapshot.attendance.map((entry) => [entry.memberId, entry.status]));
  }

  return Object.fromEntries(
    (data as Array<{ member_code: string; status: string | null }>).map((entry) => [
      entry.member_code,
      normalizeAttendanceStatus(entry.status),
    ])
  );
}

async function syncMemberFeeStatus(
  client: SupabaseClient,
  memberId: string,
  fallbackMode?: FeeRecord['mode'],
  fallbackDate?: string
) {
  const { data: feeRows, error } = await client
    .from('fees')
    .select('amount, paid_amount, due_date')
    .eq('member_id', memberId);

  if (error || !feeRows) {
    return;
  }

  const openRows = (feeRows as Array<Record<string, unknown>>).filter((row) => {
    const amount = parseNumericValue(row.amount);
    const paidAmount = parseNumericValue(row.paid_amount);
    return getRemainingFeeAmount(amount, paidAmount) > 0;
  });

  const nextStatus: Member['feesStatus'] = !openRows.length
    ? 'paid'
    : openRows.some((row) => String(row.due_date ?? getTodayKey()) < getTodayKey())
      ? 'overdue'
      : 'pending';

  await client
    .from('members')
    .update({
      fees_status: nextStatus,
      ...(fallbackMode ? { last_payment_mode: fallbackMode } : {}),
      ...(fallbackDate ? { last_payment_date: fallbackDate } : {}),
    })
    .eq('id', memberId);
}

export async function createOrUpdateMemberInSupabase(
  input: SaveMemberInput,
  actorProfileId?: string
) {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  const payload = {
    member_code: input.memberId || generateMemberCode(),
    full_name: input.name,
    phone: input.mobile,
    email: input.email || '',
    address: input.address || '',
    gender: input.gender,
    age: Number(input.age || 18),
    joined_on: input.joinDate,
    expires_on: input.expiryDate,
    plan_name: input.plan,
    trainer_name: input.trainer,
    emergency_contact: input.emergencyContact || '',
    medical_notes: input.medicalNotes || 'None',
    status: input.status,
    fees_status: input.feesStatus,
    attendance_pct: 0,
    last_payment_mode: input.lastPaymentMode,
    last_payment_date: input.lastPaymentDate,
    created_by: actorProfileId ?? null,
  };

  if (input.id) {
    const { error } = await client.from('members').update(payload).eq('id', input.id);
    if (error) throw error;
    return;
  }

  const livePlanPricing = await loadPlanPricingFromSupabase(client);

  const { data: createdMember, error } = await client
    .from('members')
    .insert(payload)
    .select('id, member_code, full_name, plan_name')
    .single();

  if (error || !createdMember) throw error ?? new Error('Unable to create member.');

  const feePayload = {
    ...buildFeePayloadFromMember({
      id: createdMember.id,
      memberId: createdMember.member_code,
      name: createdMember.full_name,
      mobile: input.mobile,
      email: input.email,
      address: input.address,
      gender: input.gender,
      age: input.age,
      joinDate: input.joinDate,
      expiryDate: input.expiryDate,
      plan: input.plan,
      trainer: input.trainer,
      emergencyContact: input.emergencyContact,
      medicalNotes: input.medicalNotes,
      status: input.status,
      feesStatus: input.feesStatus,
      attendancePct: '0%',
      profileInitials: getInitials(createdMember.full_name),
      profileColor: pickColor(createdMember.full_name),
      lastPaymentMode: input.lastPaymentMode,
      lastPaymentDate: input.lastPaymentDate,
    }, livePlanPricing),
    created_by: actorProfileId ?? null,
  };

  const { error: feeError } = await insertFeeRows(client, feePayload, 'id');
  if (feeError) throw feeError;
}

export async function deleteMembersInSupabase(ids: string[]) {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await client.from('members').delete().in('id', ids);
  if (error) throw error;
}

export async function updateMemberFieldInSupabase(
  id: string,
  updates: Partial<Pick<Member, 'status' | 'feesStatus'>>
) {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  const payload: Record<string, unknown> = {};

  if (updates.status) payload.status = updates.status;
  if (updates.feesStatus) payload.fees_status = updates.feesStatus;

  const { error } = await client.from('members').update(payload).eq('id', id);
  if (error) throw error;
}

export async function createFeeInSupabase(input: SaveFeeInput) {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  const { data: member, error: memberError } = await client
    .from('members')
    .select('id, member_code, full_name, plan_name')
    .eq('member_code', input.memberCode)
    .single();

  if (memberError || !member) {
    throw new Error('Member not found for payment entry.');
  }

  const livePlanPricing = await loadPlanPricingFromSupabase(client);
  const today = new Date().toISOString().split('T')[0];
  const resolvedPlanPrice = getPlanPrice(String(member.plan_name), livePlanPricing);
  const paymentAmount = input.amount || resolvedPlanPrice;
  const billingMonth = normalizeBillingMonthLabel(input.month, today);

  const { data: existingFeeRows, error: feeLookupError } = await client
    .from('fees')
    .select('*')
    .eq('member_id', member.id)
    .order('due_date', { ascending: true });

  if (feeLookupError) throw feeLookupError;

  const existingFees = (existingFeeRows ?? []) as Array<Record<string, unknown>>;
  let targetFee = existingFees.find((row) => {
    const remaining = getRemainingFeeAmount(parseNumericValue(row.amount), parseNumericValue(row.paid_amount));
    return normalizeBillingMonthLabel(String(row.billing_month ?? ''), String(row.due_date ?? today)) === billingMonth && remaining > 0;
  });

  targetFee ??= existingFees.find((row) => {
    const remaining = getRemainingFeeAmount(parseNumericValue(row.amount), parseNumericValue(row.paid_amount));
    return remaining > 0;
  });

  if (targetFee) {
    const currentAmount = parseNumericValue(targetFee.amount);
    const nextPaidAmount = parseNumericValue(targetFee.paid_amount) + paymentAmount;
    const nextStatus = resolveFeeStatus(currentAmount, nextPaidAmount, String(targetFee.due_date ?? today));
    const { error: updateFeeError } = await client
      .from('fees')
      .update({
        paid_amount: nextPaidAmount,
        paid_date: today,
        payment_mode: input.mode,
        status: nextStatus,
        notes: input.notes ?? String(targetFee.notes ?? ''),
      })
      .eq('id', String(targetFee.id));

    if (updateFeeError) throw updateFeeError;

    const { error: paymentError } = await insertPaymentRow(client, {
      member_id: member.id,
      fee_id: String(targetFee.id),
      amount: paymentAmount,
      payment_date: today,
      payment_mode: input.mode ?? 'Cash',
      created_by: input.actorProfileId ?? null,
    });

    if (paymentError) throw paymentError;
  } else {
    const feeAmount = Math.max(paymentAmount, resolvedPlanPrice);
    const feeStatus = resolveFeeStatus(feeAmount, paymentAmount, today);
    const { data: insertedFee, error: insertFeeError } = await insertFeeRows(client, {
        member_id: member.id,
        member_code: member.member_code,
        member_name: member.full_name,
        plan_name: member.plan_name,
        fee_type: 'monthly',
        amount: feeAmount,
        paid_amount: paymentAmount,
        due_date: today,
        paid_date: paymentAmount > 0 ? today : null,
        status: feeStatus,
        payment_mode: input.mode,
        billing_month: billingMonth,
        notes: input.notes ?? '',
        created_by: input.actorProfileId ?? null,
      }, 'id');

    const insertedFeeRow = (Array.isArray(insertedFee) ? insertedFee[0] : insertedFee) as Record<string, unknown> | null;
    if (insertFeeError || !insertedFeeRow) throw insertFeeError ?? new Error('Unable to create fee record.');

    const { error: paymentError } = await insertPaymentRow(client, {
      member_id: member.id,
      fee_id: String(insertedFeeRow.id),
      amount: paymentAmount,
      payment_date: today,
      payment_mode: input.mode ?? 'Cash',
      created_by: input.actorProfileId ?? null,
    });

    if (paymentError) throw paymentError;
  }

  await syncMemberFeeStatus(client, String(member.id), input.mode ?? 'Cash', today);
}

export async function loadPlanPricing() {
  const client = getSupabaseBrowserClient();

  if (!client) {
    return planPricing;
  }

  return loadPlanPricingFromSupabase(client);
}

export async function loadPlanMasterData(): Promise<SavePlanInput[]> {
  const client = getSupabaseBrowserClient();

  if (!client) {
    return planPricing.map((plan) => ({
      plan: plan.plan,
      price: plan.price,
      durationMonths: Number.parseInt(plan.duration, 10) || 1,
      durationLabel: plan.duration,
      isActive: true,
    }));
  }

  const { data, error } = await client.from('plans').select('*').order('duration_months', { ascending: true });

  if (error || !data?.length) {
    return planPricing.map((plan) => ({
      plan: plan.plan,
      price: plan.price,
      durationMonths: Number.parseInt(plan.duration, 10) || 1,
      durationLabel: plan.duration,
      isActive: true,
    }));
  }

  return (data as PlanRow[]).map((plan) => ({
    plan: plan.plan_name,
    price: Number(plan.price ?? 0),
    durationMonths: Number(plan.duration_months ?? 1),
    durationLabel: String(plan.duration_label ?? `${plan.duration_months ?? 1} Month`),
    isActive: plan.is_active ?? true,
  }));
}

export async function savePlanPricingInSupabase(plans: SavePlanInput[]) {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  const payload = plans.map((plan) => ({
    plan_name: plan.plan,
    price: plan.price,
    duration_months: plan.durationMonths,
    duration_label: plan.durationLabel,
    is_active: plan.isActive,
  }));

  const { error } = await client.from('plans').upsert(payload, { onConflict: 'plan_name' });
  if (error) throw error;
}

export async function saveTrainerInSupabase(input: SaveTrainerInput) {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  const payload = {
    trainer_code: input.id ? undefined : `T${Math.random().toString().slice(2, 5)}`,
    full_name: input.name,
    email: input.email,
    phone: input.phone,
    specialization: input.specialization || 'General Fitness',
    experience_label: input.experience || '1 year',
    shift_label: input.schedule || 'Mon-Sat',
    status: 'active',
  };

  if (input.id) {
    const { error } = await client.from('trainers').update({
      full_name: payload.full_name,
      email: payload.email,
      phone: payload.phone,
      specialization: payload.specialization,
      experience_label: payload.experience_label,
      shift_label: payload.shift_label,
    }).eq('id', input.id);
    if (error) throw error;
    return;
  }

  const { error } = await client.from('trainers').insert(payload);
  if (error) throw error;
}

export async function deleteTrainerInSupabase(id: string) {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await client.from('trainers').delete().eq('id', id);
  if (error) throw error;
}

export async function markAttendanceInSupabase({
  memberCode,
  date,
  status,
  actorProfileId,
}: {
  memberCode: string;
  date: string;
  status: Exclude<AttendanceStatus, null>;
  actorProfileId?: string;
}) {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  const { data: member, error: memberError } = await client
    .from('members')
    .select('id, member_code, full_name, trainer_name, trainer_id')
    .eq('member_code', memberCode)
    .single();

  if (memberError || !member) {
    throw new Error('Member not found for attendance.');
  }

  const { data: existingRow, error: existingError } = await client
    .from('attendance')
    .select('id')
    .eq('member_id', member.id)
    .eq('attendance_date', date)
    .maybeSingle();

  if (existingError) throw existingError;

  const payload = {
    member_id: member.id,
    trainer_id: member.trainer_id ?? null,
    member_code: member.member_code,
    member_name: member.full_name,
    trainer_name: member.trainer_name ?? 'Unassigned',
    attendance_date: date,
    status,
    marked_by: actorProfileId ?? null,
  };

  if (existingRow?.id) {
    let { error: updateError } = await client.from('attendance').update(payload).eq('id', existingRow.id);
    if (updateError && `${updateError.message} ${updateError.details ?? ''}`.toLowerCase().includes('trainer_id')) {
      const { trainer_id: _trainerId, ...legacyPayload } = payload;
      ({ error: updateError } = await client.from('attendance').update(legacyPayload).eq('id', existingRow.id));
    }
    if (updateError) throw updateError;
    return;
  }

  let { error: insertError } = await client.from('attendance').insert(payload);
  if (insertError && `${insertError.message} ${insertError.details ?? ''}`.toLowerCase().includes('trainer_id')) {
    const { trainer_id: _trainerId, ...legacyPayload } = payload;
    ({ error: insertError } = await client.from('attendance').insert(legacyPayload));
  }
  if (insertError) throw insertError;
}

export async function searchMembersByName(query: string) {
  const trimmed = query.trim();

  if (trimmed.length < 2) return [];

  const client = getSupabaseBrowserClient();
  if (!client) {
    return mockMembers
      .filter((member) => member.name.toLowerCase().includes(trimmed.toLowerCase()))
      .slice(0, 5)
      .map((member) => ({
        id: member.memberId,
        label: member.name,
        helper: `${member.memberId} · ${member.plan} · ${member.mobile}`,
      }));
  }

  const { data, error } = await client
    .from('members')
    .select('id, member_code, full_name, plan_name, phone')
    .ilike('full_name', `${trimmed}%`)
    .limit(8);

  if (error || !data) return [];

  return (data as Array<Record<string, unknown>>).map((member) => ({
    id: String(member.member_code ?? member.id),
    label: String(member.full_name ?? 'Unknown Member'),
    helper: `${String(member.member_code ?? '')} · ${String(member.plan_name ?? '')} · ${String(member.phone ?? '')}`,
  }));
}

export async function loadTrainerSalaryRecords() {
  const client = getSupabaseBrowserClient();

  if (!client) {
    return [] as TrainerSalaryRecord[];
  }

  const { data, error } = await client
    .from('trainer_salary')
    .select('id, month_label, base_salary, bonus_amount, deductions, net_salary, paid_on, status, trainer:trainers(full_name, trainer_code)')
    .order('month_label', { ascending: false });

  if (error || !data) return [] as TrainerSalaryRecord[];

  return (data as Array<Record<string, unknown>>).map((row) => {
    const trainer = row.trainer as { full_name?: string; trainer_code?: string } | null;
    return {
      id: String(row.id),
      trainerId: String(trainer?.trainer_code ?? ''),
      trainerName: String(trainer?.full_name ?? 'Trainer'),
      month: String(row.month_label ?? ''),
      baseSalary: Number(row.base_salary ?? 0),
      bonusAmount: Number(row.bonus_amount ?? 0),
      deductions: Number(row.deductions ?? 0),
      netSalary: Number(row.net_salary ?? 0),
      paidOn: row.paid_on ? String(row.paid_on) : null,
      status: (row.status as TrainerSalaryRecord['status']) ?? 'pending',
    };
  });
}

export async function saveTrainerSalaryRecord(input: {
  trainerId: string;
  month: string;
  baseSalary: number;
  bonusAmount: number;
  deductions: number;
  paidOn?: string | null;
  status: TrainerSalaryRecord['status'];
}) {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  if (!input.trainerId) {
    throw new Error('Select a trainer first.');
  }

  const netSalary = input.baseSalary + input.bonusAmount - input.deductions;
  if (netSalary < 0) {
    throw new Error('Net salary cannot be negative.');
  }
  const { error } = await client.from('trainer_salary').insert({
    trainer_id: input.trainerId,
    month_label: input.month,
    base_salary: input.baseSalary,
    bonus_amount: input.bonusAmount,
    deductions: input.deductions,
    net_salary: netSalary,
    paid_on: input.paidOn ?? null,
    status: input.status,
  });

  if (error) throw error;
}

export async function loadSupplementInventory() {
  const client = getSupabaseBrowserClient();

  if (!client) {
    return {
      products: [] as SupplementProduct[],
      transactions: [] as InventoryTransactionRecord[],
    };
  }

  const [productsResult, transactionsResult] = await Promise.all([
    client.from('supplements').select('*').order('product_name', { ascending: true }),
    client.from('inventory_transactions').select('id, quantity, unit_price, transaction_type, transaction_date, supplement:supplements(id, product_name)').order('transaction_date', { ascending: false }).limit(12),
  ]);

  const products = productsResult.error || !productsResult.data
    ? []
    : (productsResult.data as Array<Record<string, unknown>>).map((row) => ({
        id: String(row.id),
        productName: String(row.product_name ?? ''),
        sku: String(row.sku ?? ''),
        category: String(row.category ?? 'Supplement'),
        costPrice: Number(row.cost_price ?? 0),
        sellingPrice: Number(row.selling_price ?? 0),
        quantity: Number(row.quantity ?? 0),
        reorderLevel: Number(row.reorder_level ?? 0),
        profitPerUnit: Number(row.selling_price ?? 0) - Number(row.cost_price ?? 0),
      }));

  const transactions = transactionsResult.error || !transactionsResult.data
    ? []
    : (transactionsResult.data as Array<Record<string, unknown>>).map((row) => {
        const supplement = row.supplement as { id?: string; product_name?: string } | null;
        return {
          id: String(row.id),
          productId: String(supplement?.id ?? ''),
          productName: String(supplement?.product_name ?? 'Product'),
          transactionType: (row.transaction_type as InventoryTransactionRecord['transactionType']) ?? 'purchase',
          quantity: Number(row.quantity ?? 0),
          unitPrice: Number(row.unit_price ?? 0),
          transactionDate: String(row.transaction_date ?? ''),
        };
      });

  return { products, transactions };
}

export async function saveSupplementProduct(input: {
  id?: string;
  productName: string;
  sku: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  reorderLevel: number;
}) {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  const payload = {
    product_name: input.productName,
    sku: input.sku,
    category: input.category,
    cost_price: input.costPrice,
    selling_price: input.sellingPrice,
    quantity: input.quantity,
    reorder_level: input.reorderLevel,
  };

  if (input.id) {
    const { error } = await client.from('supplements').update(payload).eq('id', input.id);
    if (error) throw error;
    return;
  }

  const { error } = await client.from('supplements').insert(payload);
  if (error) throw error;
}

export async function createInventoryTransaction(input: {
  productId: string;
  quantity: number;
  unitPrice: number;
  type: InventoryTransactionRecord['transactionType'];
}) {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  if (input.quantity <= 0) {
    throw new Error('Quantity must be greater than 0.');
  }

  const today = getTodayKey();
  const quantityDelta = input.type === 'sale' ? -Math.abs(input.quantity) : Math.abs(input.quantity);

  const { data: product, error: productError } = await client
    .from('supplements')
    .select('id, quantity, cost_price')
    .eq('id', input.productId)
    .single();

  if (productError || !product) throw productError ?? new Error('Product not found.');

  const currentQuantity = Number(product.quantity ?? 0);
  if (input.type === 'sale' && currentQuantity < Math.abs(input.quantity)) {
    throw new Error('Insufficient stock for this sale.');
  }

  const { error: transactionError } = await client.from('inventory_transactions').insert({
    supplement_id: input.productId,
    transaction_type: input.type,
    quantity: Math.abs(input.quantity),
    unit_price: input.unitPrice,
    transaction_date: today,
  });

  if (transactionError) throw transactionError;

  const { error: updateError } = await client
    .from('supplements')
    .update({ quantity: currentQuantity + quantityDelta })
    .eq('id', input.productId);

  if (updateError) throw updateError;

  if (input.type === 'sale') {
    await client.from('sales').insert({
      supplement_id: input.productId,
      quantity: Math.abs(input.quantity),
      selling_price: input.unitPrice,
      sale_date: today,
      profit: (input.unitPrice - Number(product.cost_price ?? 0)) * Math.abs(input.quantity),
    });
  }
}

export async function loadNotificationLogs() {
  const client = getSupabaseBrowserClient();

  if (!client) {
    return [] as NotificationLog[];
  }

  const { data, error } = await client
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !data) return [] as NotificationLog[];

  return (data as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    recipientName: String(row.recipient_name ?? ''),
    recipientPhone: String(row.recipient_phone ?? ''),
    templateKey: String(row.template_key ?? ''),
    channel: (row.channel as NotificationLog['channel']) ?? 'whatsapp_cloud',
    status: (row.status as NotificationLog['status']) ?? 'queued',
    createdAt: String(row.created_at ?? ''),
  }));
}
