export type MemberStatus = 'active' | 'inactive' | 'expired' | 'suspended';
export type FeesStatus = 'paid' | 'pending' | 'overdue';
export type Plan = string;
export type Gender = 'Male' | 'Female' | 'Other';
export type PaymentMode = 'Cash' | 'UPI' | 'Card' | 'Online';
export type AttendanceStatus = 'present' | 'absent' | 'late' | null;
export type NotificationChannel = 'whatsapp_cloud' | 'twilio_sandbox' | 'wati_trial';
export type NotificationStatus = 'queued' | 'sent' | 'failed';

export interface Member {
  id: string;
  memberId: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  gender: Gender;
  age: string;
  joinDate: string;
  expiryDate: string;
  plan: Plan;
  trainer: string;
  emergencyContact: string;
  medicalNotes: string;
  status: MemberStatus;
  feesStatus: FeesStatus;
  attendancePct: string;
  profileInitials: string;
  profileColor: string;
  lastPaymentMode: PaymentMode;
  lastPaymentDate: string;
}

export interface Trainer {
  id: string;
  trainerId: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  assignedMembers: number;
  rating: number;
  joinDate: string;
  status: 'active' | 'inactive';
  initials: string;
  color: string;
  schedule: string;
}

export interface FeeRecord {
  id: string;
  memberId: string;
  memberName: string;
  initials: string;
  color: string;
  plan: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  paidDate: string | null;
  status: FeesStatus;
  mode: PaymentMode | null;
  month: string;
}

export interface AttendanceEntry {
  id: string;
  memberId: string;
  memberName: string;
  trainer: string;
  initials: string;
  color: string;
  date: string;
  status: AttendanceStatus;
}

export interface ActivityItem {
  id: string;
  type:
    | 'new_member'
    | 'fee_paid'
    | 'attendance_marked'
    | 'membership_expired'
    | 'plan_changed'
    | 'fee_overdue'
    | 'trainer_assigned'
    | 'late_entry';
  member: string;
  detail: string;
  time: string;
  amount?: string;
}

export interface PlanPrice {
  plan: Plan;
  price: number;
  duration: string;
}

export interface TrainerSalaryRecord {
  id: string;
  trainerId: string;
  trainerName: string;
  month: string;
  baseSalary: number;
  bonusAmount: number;
  deductions: number;
  netSalary: number;
  paidOn: string | null;
  status: 'pending' | 'paid';
}

export interface SupplementProduct {
  id: string;
  productName: string;
  sku: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  reorderLevel: number;
  profitPerUnit: number;
}

export interface InventoryTransactionRecord {
  id: string;
  productId: string;
  productName: string;
  transactionType: 'purchase' | 'sale' | 'adjustment';
  quantity: number;
  unitPrice: number;
  transactionDate: string;
}

export interface NotificationLog {
  id: string;
  recipientName: string;
  recipientPhone: string;
  templateKey: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  createdAt: string;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  target: number;
}

export interface AttendanceTrendPoint {
  day: string;
  present: number;
  absent: number;
}

export interface MemberPaymentEntry {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMode: PaymentMode | null;
  month: string;
  status: FeesStatus;
  plan: string;
  pendingBalance: number;
}

export interface MemberAttendanceMonthSummary {
  month: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  pct: number;
}

export interface MemberPortalSnapshot {
  source: 'supabase' | 'mock';
  member: Member | null;
  fees: FeeRecord[];
  payments: MemberPaymentEntry[];
  attendance: AttendanceEntry[];
  attendanceSeries: AttendanceTrendPoint[];
  monthlyAttendance: MemberAttendanceMonthSummary[];
}

export interface DashboardSummary {
  totalActiveMembers: number;
  joinedThisMonth: number;
  presentToday: number;
  absentToday: number;
  attendanceRateToday: number;
  inactiveForSevenDays: number;
  pendingFeesCount: number;
  pendingFeesAmount: number;
  monthlyRevenue: number;
  monthlyRevenueGrowth: number;
  newAdmissions: number;
  expiringSoon: number;
}

export interface ErpSnapshot {
  source: 'supabase' | 'mock';
  members: Member[];
  trainers: Trainer[];
  fees: FeeRecord[];
  attendance: AttendanceEntry[];
  activities: ActivityItem[];
  planPricing: PlanPrice[];
  revenueSeries: RevenuePoint[];
  attendanceSeries: AttendanceTrendPoint[];
  dashboard: DashboardSummary;
}
