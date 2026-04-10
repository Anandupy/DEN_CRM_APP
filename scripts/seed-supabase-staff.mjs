import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  console.error('Set them in your shell before running:');
  console.error('  $env:NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"');
  console.error('  $env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const staffAccounts = [
  {
    role: 'owner',
    full_name: 'Denzil Dsoza',
    email: 'denzil.dsoza@denfitness.in',
    password: 'DenFitness@2026',
    phone: '+91 9876543210',
  },
  {
    role: 'senior_trainer',
    full_name: 'Raj Vishwakarma',
    email: 'raj.vishwakarma@denfitness.in',
    password: 'DenFitness@2026',
    phone: '+91 9876500001',
    trainer_code: 'T001',
    specialization: 'Strength & Conditioning',
    experience_label: '5 years',
    shift_label: 'Mon-Sat, 6AM-2PM',
  },
  {
    role: 'trainer',
    full_name: 'Raj Gupta',
    email: 'raj.gupta@denfitness.in',
    password: 'DenFitness@2026',
    phone: '+91 9876500002',
    trainer_code: 'T002',
    specialization: 'Weight Training',
    experience_label: '4 years',
    shift_label: 'Mon-Sat, 2PM-10PM',
  },
  {
    role: 'trainer',
    full_name: 'Arjun',
    email: 'arjun@denfitness.in',
    password: 'DenFitness@2026',
    phone: '+91 9876500003',
    trainer_code: 'T003',
    specialization: 'Functional Fitness',
    experience_label: '3 years',
    shift_label: 'Mon-Fri, 6AM-12PM',
  },
  {
    role: 'trainer',
    full_name: 'Karan',
    email: 'karan@denfitness.in',
    password: 'DenFitness@2026',
    phone: '+91 9876500004',
    trainer_code: 'T004',
    specialization: 'HIIT & Mobility',
    experience_label: '4 years',
    shift_label: 'Tue-Sun, 8AM-4PM',
  },
];

async function findUserByEmail(email) {
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;

    const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (match) return match;
    if (data.users.length < 200) return null;

    page += 1;
  }
}

async function ensureUser(account) {
  const existing = await findUserByEmail(account.email);
  if (existing) return existing;

  const { data, error } = await supabase.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
    user_metadata: {
      full_name: account.full_name,
      role: account.role,
      phone: account.phone,
    },
  });

  if (error) throw error;
  return data.user;
}

async function tableExists(tableName) {
  const { error } = await supabase.from(tableName).select('*').limit(1);
  return !error;
}

const hasTrainersTable = await tableExists('trainers');

for (const account of staffAccounts) {
  const user = await ensureUser(account);

  const baseProfile = {
    id: user.id,
    full_name: account.full_name,
    email: account.email,
    phone: account.phone,
    role: account.role,
  };

  let { error: profileError } = await supabase.from('profiles').upsert({
    ...baseProfile,
    is_active: true,
  });

  if (profileError && profileError.message?.toLowerCase().includes('is_active')) {
    const fallback = await supabase.from('profiles').upsert(baseProfile);
    profileError = fallback.error;
  }

  if (profileError) throw profileError;

  if (hasTrainersTable && account.role === 'trainer') {
    const { error: trainerError } = await supabase.from('trainers').upsert({
      profile_id: user.id,
      trainer_code: account.trainer_code,
      full_name: account.full_name,
      email: account.email,
      phone: account.phone,
      specialization: account.specialization,
      experience_label: account.experience_label,
      shift_label: account.shift_label,
      status: 'active',
    }, { onConflict: 'profile_id' });

    if (trainerError) throw trainerError;
  }

  console.log(`Seeded ${account.role}: ${account.full_name} <${account.email}>`);
}

console.log('\nStaff accounts ready.');
console.log('Default password for all seeded users: DenFitness@2026');
