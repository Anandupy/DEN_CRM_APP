import type {
  ActivityItem,
  AttendanceEntry,
  AttendanceTrendPoint,
  DashboardSummary,
  ErpSnapshot,
  FeeRecord,
  Member,
  PlanPrice,
  RevenuePoint,
  Trainer,
} from './types';

export const TRAINERS = ['Priya Sharma', 'Suresh Kumar', 'Anjali Mehta', 'Ravi Pillai', 'Deepika Nair'];
export const PLANS: PlanPrice['plan'][] = ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual'];

export const mockMembers: Member[] = [];

export const mockTrainers: Trainer[] = [
  { id: 'trainer-001', trainerId: 'T001', name: 'Priya Sharma', email: 'priya.trainer@denfitness.in', phone: '98765-43210', specialization: 'Weight Training & Cardio', experience: '5 years', assignedMembers: 4, rating: 4.9, joinDate: '2021-06-01', status: 'active', initials: 'PS', color: 'bg-pink-500/20 text-pink-400', schedule: 'Mon-Sat, 6AM-2PM' },
  { id: 'trainer-002', trainerId: 'T002', name: 'Suresh Kumar', email: 'suresh.k@denfitness.in', phone: '91234-56789', specialization: 'Strength & Conditioning', experience: '7 years', assignedMembers: 3, rating: 4.7, joinDate: '2020-03-15', status: 'active', initials: 'SK', color: 'bg-blue-500/20 text-blue-400', schedule: 'Mon-Sat, 2PM-10PM' },
  { id: 'trainer-003', trainerId: 'T003', name: 'Anjali Mehta', email: 'anjali.m@denfitness.in', phone: '87654-32109', specialization: 'Yoga & Flexibility', experience: '4 years', assignedMembers: 2, rating: 4.8, joinDate: '2022-01-10', status: 'active', initials: 'AM', color: 'bg-emerald-500/20 text-emerald-400', schedule: 'Mon-Fri, 6AM-12PM' },
  { id: 'trainer-004', trainerId: 'T004', name: 'Ravi Pillai', email: 'ravi.p@denfitness.in', phone: '77654-32109', specialization: 'CrossFit & HIIT', experience: '6 years', assignedMembers: 2, rating: 4.6, joinDate: '2021-09-20', status: 'active', initials: 'RP', color: 'bg-amber-500/20 text-amber-400', schedule: 'Tue-Sun, 8AM-4PM' },
  { id: 'trainer-005', trainerId: 'T005', name: 'Deepika Nair', email: 'deepika.n@denfitness.in', phone: '66543-21098', specialization: 'Zumba & Dance Fitness', experience: '3 years', assignedMembers: 1, rating: 4.5, joinDate: '2023-02-01', status: 'active', initials: 'DN', color: 'bg-purple-500/20 text-purple-400', schedule: 'Mon-Sat, 6AM-12PM' },
];

export const mockFees: FeeRecord[] = [];

export const mockAttendance: AttendanceEntry[] = [];

export const mockActivities: ActivityItem[] = [];

export const planPricing: PlanPrice[] = [
  { plan: 'Monthly', price: 1500, duration: '1 Month' },
  { plan: 'Quarterly', price: 3500, duration: '3 Months' },
  { plan: 'Half-Yearly', price: 6500, duration: '6 Months' },
  { plan: 'Annual', price: 12000, duration: '12 Months' },
];

export const revenueSeries: RevenuePoint[] = [];

export const attendanceSeries: AttendanceTrendPoint[] = [];

export const dashboardSummary: DashboardSummary = {
  totalActiveMembers: 0,
  joinedThisMonth: 0,
  presentToday: 0,
  absentToday: 0,
  attendanceRateToday: 0,
  inactiveForSevenDays: 0,
  pendingFeesCount: 0,
  pendingFeesAmount: 0,
  monthlyRevenue: 0,
  monthlyRevenueGrowth: 0,
  newAdmissions: 0,
  expiringSoon: 0,
};

export const mockErpSnapshot: ErpSnapshot = {
  source: 'mock',
  members: mockMembers,
  trainers: mockTrainers,
  fees: mockFees,
  attendance: mockAttendance,
  activities: mockActivities,
  planPricing,
  revenueSeries,
  attendanceSeries,
  dashboard: dashboardSummary,
};
