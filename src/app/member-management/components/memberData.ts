export type MemberStatus = 'active' | 'inactive' | 'expired' | 'suspended';
export type FeesStatus = 'paid' | 'pending' | 'overdue';
export type Plan = 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annual';
export type Gender = 'Male' | 'Female' | 'Other';
export type PaymentMode = 'Cash' | 'UPI' | 'Card' | 'Online';

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

export const TRAINERS = ['Priya Sharma', 'Suresh Kumar', 'Anjali Mehta', 'Ravi Pillai', 'Deepika Nair'];
export const PLANS: Plan[] = ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual'];

export const mockMembers: Member[] = [
  {
    id: 'member-001', memberId: 'DEN-001', name: 'Amit Patil', mobile: '98765-43210',
    email: 'amit.patil@gmail.com', address: 'Flat 4B, Andheri West, Mumbai', gender: 'Male',
    age: '28', joinDate: '2025-04-10', expiryDate: '2026-04-09', plan: 'Annual',
    trainer: 'Priya Sharma', emergencyContact: '91234-56789', medicalNotes: 'None',
    status: 'active', feesStatus: 'paid', attendancePct: '78%', profileInitials: 'AP',
    profileColor: 'bg-blue-500/20 text-blue-400', lastPaymentMode: 'UPI', lastPaymentDate: '2026-04-01',
  },
  {
    id: 'member-002', memberId: 'DEN-002', name: 'Kavya Reddy', mobile: '91234-67890',
    email: 'kavya.reddy@outlook.com', address: 'Powai, Mumbai', gender: 'Female',
    age: '24', joinDate: '2026-04-09', expiryDate: '2027-04-08', plan: 'Annual',
    trainer: 'Priya Sharma', emergencyContact: '98877-66554', medicalNotes: 'Mild knee issue — avoid high-impact',
    status: 'active', feesStatus: 'paid', attendancePct: '100%', profileInitials: 'KR',
    profileColor: 'bg-pink-500/20 text-pink-400', lastPaymentMode: 'Card', lastPaymentDate: '2026-04-09',
  },
  {
    id: 'member-003', memberId: 'DEN-003', name: 'Vikram Desai', mobile: '98765-01234',
    email: 'vikram.desai@yahoo.com', address: 'Kurla East, Mumbai', gender: 'Male',
    age: '35', joinDate: '2025-01-15', expiryDate: '2026-01-14', plan: 'Annual',
    trainer: 'Suresh Kumar', emergencyContact: '97766-55443', medicalNotes: 'Hypertension — monitor BP',
    status: 'expired', feesStatus: 'overdue', attendancePct: '45%', profileInitials: 'VD',
    profileColor: 'bg-orange-500/20 text-orange-400', lastPaymentMode: 'Cash', lastPaymentDate: '2025-01-15',
  },
  {
    id: 'member-004', memberId: 'DEN-004', name: 'Sunita Rao', mobile: '91234-56789',
    email: 'sunita.rao@gmail.com', address: 'Ghatkopar West, Mumbai', gender: 'Female',
    age: '31', joinDate: '2026-01-08', expiryDate: '2026-04-07', plan: 'Quarterly',
    trainer: 'Anjali Mehta', emergencyContact: '88765-43210', medicalNotes: 'None',
    status: 'active', feesStatus: 'overdue', attendancePct: '62%', profileInitials: 'SR',
    profileColor: 'bg-emerald-500/20 text-emerald-400', lastPaymentMode: 'UPI', lastPaymentDate: '2026-01-08',
  },
  {
    id: 'member-005', memberId: 'DEN-005', name: 'Rohit Sharma', mobile: '77654-32109',
    email: 'rohit.s@gmail.com', address: 'Chembur, Mumbai', gender: 'Male',
    age: '26', joinDate: '2026-03-01', expiryDate: '2026-03-31', plan: 'Monthly',
    trainer: 'Ravi Pillai', emergencyContact: '99887-76655', medicalNotes: 'None',
    status: 'expired', feesStatus: 'pending', attendancePct: '55%', profileInitials: 'RS',
    profileColor: 'bg-purple-500/20 text-purple-400', lastPaymentMode: 'Cash', lastPaymentDate: '2026-03-01',
  },
  {
    id: 'member-006', memberId: 'DEN-006', name: 'Deepak Nair', mobile: '87654-32109',
    email: 'deepak.nair@hotmail.com', address: 'Vikhroli, Mumbai', gender: 'Male',
    age: '40', joinDate: '2025-10-05', expiryDate: '2026-04-04', plan: 'Half-Yearly',
    trainer: 'Suresh Kumar', emergencyContact: '78654-32109', medicalNotes: 'Diabetes Type 2',
    status: 'active', feesStatus: 'overdue', attendancePct: '71%', profileInitials: 'DN',
    profileColor: 'bg-cyan-500/20 text-cyan-400', lastPaymentMode: 'Online', lastPaymentDate: '2025-10-05',
  },
  {
    id: 'member-007', memberId: 'DEN-007', name: 'Pooja Mehta', mobile: '99887-76655',
    email: 'pooja.mehta@gmail.com', address: 'Bhandup, Mumbai', gender: 'Female',
    age: '29', joinDate: '2026-01-15', expiryDate: '2026-04-14', plan: 'Quarterly',
    trainer: 'Anjali Mehta', emergencyContact: '88776-65544', medicalNotes: 'None',
    status: 'active', feesStatus: 'pending', attendancePct: '83%', profileInitials: 'PM',
    profileColor: 'bg-rose-500/20 text-rose-400', lastPaymentMode: 'UPI', lastPaymentDate: '2026-01-15',
  },
  {
    id: 'member-008', memberId: 'DEN-008', name: 'Arjun Kadam', mobile: '88765-43210',
    email: 'arjun.kadam@gmail.com', address: 'Mulund West, Mumbai', gender: 'Male',
    age: '22', joinDate: '2026-01-01', expiryDate: '2026-03-31', plan: 'Quarterly',
    trainer: 'Priya Sharma', emergencyContact: '77665-54433', medicalNotes: 'None',
    status: 'active', feesStatus: 'paid', attendancePct: '91%', profileInitials: 'AK',
    profileColor: 'bg-amber-500/20 text-amber-400', lastPaymentMode: 'Card', lastPaymentDate: '2026-01-01',
  },
  {
    id: 'member-009', memberId: 'DEN-009', name: 'Sneha Iyer', mobile: '66554-43322',
    email: 'sneha.iyer@gmail.com', address: 'Thane West, Mumbai', gender: 'Female',
    age: '27', joinDate: '2025-08-20', expiryDate: '2026-08-19', plan: 'Annual',
    trainer: 'Priya Sharma', emergencyContact: '55443-32211', medicalNotes: 'None',
    status: 'active', feesStatus: 'paid', attendancePct: '88%', profileInitials: 'SI',
    profileColor: 'bg-teal-500/20 text-teal-400', lastPaymentMode: 'UPI', lastPaymentDate: '2026-04-01',
  },
  {
    id: 'member-010', memberId: 'DEN-010', name: 'Manish Sharma', mobile: '77665-44332',
    email: 'manish.sharma@gmail.com', address: 'Kalwa, Thane', gender: 'Male',
    age: '33', joinDate: '2026-01-10', expiryDate: '2026-04-09', plan: 'Quarterly',
    trainer: 'Ravi Pillai', emergencyContact: '66554-33221', medicalNotes: 'Back pain — no deadlifts',
    status: 'active', feesStatus: 'paid', attendancePct: '69%', profileInitials: 'MS',
    profileColor: 'bg-indigo-500/20 text-indigo-400', lastPaymentMode: 'Cash', lastPaymentDate: '2026-04-05',
  },
  {
    id: 'member-011', memberId: 'DEN-011', name: 'Preethi Nair', mobile: '55443-22110',
    email: 'preethi.nair@gmail.com', address: 'Vashi, Navi Mumbai', gender: 'Female',
    age: '25', joinDate: '2026-04-08', expiryDate: '2026-05-07', plan: 'Monthly',
    trainer: 'Suresh Kumar', emergencyContact: '44332-11009', medicalNotes: 'None',
    status: 'active', feesStatus: 'paid', attendancePct: '100%', profileInitials: 'PN',
    profileColor: 'bg-green-500/20 text-green-400', lastPaymentMode: 'UPI', lastPaymentDate: '2026-04-08',
  },
  {
    id: 'member-012', memberId: 'DEN-012', name: 'Santosh Kulkarni', mobile: '99766-55443',
    email: 'santosh.k@gmail.com', address: 'Dombivli East, Thane', gender: 'Male',
    age: '38', joinDate: '2025-06-01', expiryDate: '2026-05-31', plan: 'Annual',
    trainer: 'Deepika Nair', emergencyContact: '88655-44332', medicalNotes: 'Asthma — carry inhaler',
    status: 'active', feesStatus: 'paid', attendancePct: '74%', profileInitials: 'SK',
    profileColor: 'bg-lime-500/20 text-lime-400', lastPaymentMode: 'UPI', lastPaymentDate: '2026-04-01',
  },
];
