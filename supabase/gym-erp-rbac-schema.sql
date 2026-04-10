begin;

create extension if not exists pgcrypto;

do $$
begin
  create type public.app_role as enum ('owner', 'senior_trainer', 'trainer', 'member');
exception
  when duplicate_object then null;
end $$;

alter type public.app_role add value if not exists 'senior_trainer';

create table if not exists public.roles (
  role_key public.app_role primary key,
  role_name text not null unique,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_key public.app_role not null references public.roles(role_key) on delete cascade,
  permission_key text not null,
  unique(role_key, permission_key)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  role public.app_role not null default 'member',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  plan_name text not null unique,
  price numeric(12,2) not null default 0,
  admission_fee numeric(12,2) not null default 0,
  duration_months integer not null default 1,
  duration_label text not null default '1 Month',
  features text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trainers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete cascade,
  trainer_code text not null unique,
  full_name text not null,
  email text not null,
  phone text,
  specialization text not null default 'General Fitness',
  experience_label text not null default '1 year',
  assigned_members integer not null default 0,
  rating numeric(3,2) not null default 0,
  joined_on date not null default current_date,
  status text not null default 'active' check (status in ('active', 'inactive')),
  shift_label text not null default 'Mon-Sat, 6AM-2PM',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trainer_permissions (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  permission_key text not null,
  created_at timestamptz not null default now(),
  unique(trainer_id, permission_key)
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  member_code text not null unique,
  full_name text not null,
  phone text not null,
  email text not null default '',
  address text not null default '',
  gender text not null default 'Other',
  age integer not null default 18,
  joined_on date not null default current_date,
  expires_on date not null default current_date,
  plan_id uuid references public.plans(id) on delete set null,
  plan_name text not null default 'Monthly',
  admission_fee numeric(12,2) not null default 0,
  monthly_fee numeric(12,2) not null default 0,
  trainer_id uuid references public.trainers(id) on delete set null,
  trainer_name text not null default 'Unassigned',
  emergency_contact text not null default '',
  medical_notes text not null default 'None',
  status text not null default 'active' check (status in ('active', 'inactive', 'expired', 'suspended')),
  fees_status text not null default 'pending' check (fees_status in ('paid', 'pending', 'overdue')),
  attendance_pct numeric(5,2) not null default 0,
  last_payment_mode text not null default 'Cash',
  last_payment_date date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fees (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  fee_type text not null default 'monthly' check (fee_type in ('admission', 'monthly')),
  member_code text not null,
  member_name text not null,
  plan_name text not null,
  amount numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  due_date date not null,
  paid_date date,
  status text not null default 'pending' check (status in ('paid', 'pending', 'overdue')),
  payment_mode text,
  billing_month text not null,
  notes text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  fee_id uuid references public.fees(id) on delete set null,
  amount numeric(12,2) not null default 0,
  payment_date date not null default current_date,
  payment_mode text not null default 'Cash',
  reference_no text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  trainer_id uuid references public.trainers(id) on delete set null,
  member_code text not null,
  member_name text not null,
  trainer_name text not null default 'Unassigned',
  attendance_date date not null default current_date,
  status text not null check (status in ('present', 'absent', 'late')),
  marked_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(member_id, attendance_date)
);

create table if not exists public.trainer_attendance (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  attendance_date date not null default current_date,
  status text not null check (status in ('present', 'absent', 'leave')),
  marked_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(trainer_id, attendance_date)
);

create table if not exists public.trainer_salary (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  month_label text not null,
  base_salary numeric(12,2) not null default 0,
  bonus_amount numeric(12,2) not null default 0,
  deductions numeric(12,2) not null default 0,
  net_salary numeric(12,2) not null default 0,
  paid_on date,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  created_at timestamptz not null default now()
);

create table if not exists public.supplements (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  sku text not null unique,
  category text not null default 'Supplement',
  cost_price numeric(12,2) not null default 0,
  selling_price numeric(12,2) not null default 0,
  quantity integer not null default 0,
  reorder_level integer not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  supplement_id uuid not null references public.supplements(id) on delete cascade,
  transaction_type text not null check (transaction_type in ('purchase', 'sale', 'adjustment')),
  quantity integer not null,
  unit_price numeric(12,2) not null default 0,
  transaction_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  supplement_id uuid not null references public.supplements(id) on delete cascade,
  quantity integer not null,
  selling_price numeric(12,2) not null default 0,
  sale_date date not null default current_date,
  profit numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_name text not null,
  recipient_phone text not null,
  template_key text not null,
  template_body text not null default '',
  channel text not null default 'whatsapp_cloud' check (channel in ('whatsapp_cloud', 'twilio_sandbox', 'wati_trial')),
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.roles(role_key, role_name, description)
values
  ('owner', 'Owner', 'Super admin with full control'),
  ('senior_trainer', 'Senior Trainer', 'Operations manager below owner'),
  ('trainer', 'Trainer', 'Marks attendance and manages assigned members'),
  ('member', 'Member', 'End customer account')
on conflict (role_key) do update set
  role_name = excluded.role_name,
  description = excluded.description;

insert into public.role_permissions(role_key, permission_key)
values
  ('owner', 'all'),
  ('senior_trainer', 'members.view'),
  ('senior_trainer', 'members.create'),
  ('senior_trainer', 'members.update'),
  ('senior_trainer', 'attendance.mark'),
  ('senior_trainer', 'fees.collect'),
  ('trainer', 'attendance.mark'),
  ('trainer', 'members.view'),
  ('member', 'fees.view')
on conflict do nothing;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.app_role;
begin
  requested_role :=
    case coalesce(new.raw_user_meta_data->>'role', '')
      when 'owner' then 'owner'::public.app_role
      when 'senior_trainer' then 'senior_trainer'::public.app_role
      when 'trainer' then 'trainer'::public.app_role
      else 'member'::public.app_role
    end;

  insert into public.profiles(id, full_name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.phone,
    requested_role
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    role = excluded.role,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_owner()
returns boolean
language sql
stable
as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'owner'::public.app_role and is_active = true)
$$;

create or replace function public.is_senior_trainer()
returns boolean
language sql
stable
as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'senior_trainer'::public.app_role and is_active = true)
$$;

create or replace function public.is_trainer()
returns boolean
language sql
stable
as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role in ('trainer'::public.app_role, 'senior_trainer'::public.app_role) and is_active = true)
$$;

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.plans enable row level security;
alter table public.trainers enable row level security;
alter table public.trainer_permissions enable row level security;
alter table public.members enable row level security;
alter table public.fees enable row level security;
alter table public.payments enable row level security;
alter table public.attendance enable row level security;
alter table public.trainer_attendance enable row level security;
alter table public.trainer_salary enable row level security;
alter table public.supplements enable row level security;
alter table public.inventory_transactions enable row level security;
alter table public.sales enable row level security;
alter table public.notifications enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated using (id = auth.uid() or public.is_owner() or public.is_senior_trainer());

drop policy if exists roles_select on public.roles;
create policy roles_select on public.roles for select to authenticated using (public.is_owner() or public.is_senior_trainer());

drop policy if exists role_permissions_select on public.role_permissions;
create policy role_permissions_select on public.role_permissions for select to authenticated using (public.is_owner() or public.is_senior_trainer());

drop policy if exists plans_select_all on public.plans;
create policy plans_select_all on public.plans for select to authenticated using (true);

drop policy if exists plans_owner_manage on public.plans;
create policy plans_owner_manage on public.plans for all to authenticated using (public.is_owner()) with check (public.is_owner());

drop policy if exists trainers_select on public.trainers;
create policy trainers_select on public.trainers for select to authenticated using (public.is_owner() or public.is_senior_trainer() or profile_id = auth.uid());

drop policy if exists trainers_manage on public.trainers;
create policy trainers_manage on public.trainers for all to authenticated using (public.is_owner() or public.is_senior_trainer()) with check (public.is_owner() or public.is_senior_trainer());

drop policy if exists members_select on public.members;
create policy members_select on public.members for select to authenticated using (
  public.is_owner()
  or public.is_senior_trainer()
  or profile_id = auth.uid()
  or exists(select 1 from public.trainers t where t.id = public.members.trainer_id and t.profile_id = auth.uid())
);

drop policy if exists members_manage on public.members;
create policy members_manage on public.members for all to authenticated using (public.is_owner() or public.is_senior_trainer() or public.is_trainer()) with check (public.is_owner() or public.is_senior_trainer() or public.is_trainer());

drop policy if exists fees_select on public.fees;
create policy fees_select on public.fees for select to authenticated using (
  public.is_owner()
  or public.is_senior_trainer()
  or exists(select 1 from public.members m where m.id = public.fees.member_id and m.profile_id = auth.uid())
  or exists(select 1 from public.members m join public.trainers t on t.id = m.trainer_id where m.id = public.fees.member_id and t.profile_id = auth.uid())
);

drop policy if exists fees_insert on public.fees;
create policy fees_insert on public.fees for insert to authenticated with check (
  public.is_owner()
  or public.is_senior_trainer()
  or exists(select 1 from public.members m join public.trainers t on t.id = m.trainer_id where m.id = public.fees.member_id and t.profile_id = auth.uid())
);

drop policy if exists fees_update on public.fees;
create policy fees_update on public.fees for update to authenticated using (
  public.is_owner()
  or public.is_senior_trainer()
  or exists(select 1 from public.members m join public.trainers t on t.id = m.trainer_id where m.id = public.fees.member_id and t.profile_id = auth.uid())
) with check (
  public.is_owner()
  or public.is_senior_trainer()
  or exists(select 1 from public.members m join public.trainers t on t.id = m.trainer_id where m.id = public.fees.member_id and t.profile_id = auth.uid())
);

drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments for select to authenticated using (
  public.is_owner()
  or public.is_senior_trainer()
  or exists(select 1 from public.members m where m.id = public.payments.member_id and m.profile_id = auth.uid())
  or exists(select 1 from public.members m join public.trainers t on t.id = m.trainer_id where m.id = public.payments.member_id and t.profile_id = auth.uid())
);

drop policy if exists payments_insert on public.payments;
create policy payments_insert on public.payments for insert to authenticated with check (
  public.is_owner()
  or public.is_senior_trainer()
  or exists(select 1 from public.members m join public.trainers t on t.id = m.trainer_id where m.id = public.payments.member_id and t.profile_id = auth.uid())
);

drop policy if exists attendance_select on public.attendance;
create policy attendance_select on public.attendance for select to authenticated using (
  public.is_owner()
  or public.is_senior_trainer()
  or exists(select 1 from public.members m where m.id = public.attendance.member_id and m.profile_id = auth.uid())
  or exists(select 1 from public.members m join public.trainers t on t.id = m.trainer_id where m.id = public.attendance.member_id and t.profile_id = auth.uid())
);

drop policy if exists attendance_manage on public.attendance;
create policy attendance_manage on public.attendance for all to authenticated using (
  public.is_owner()
  or public.is_senior_trainer()
  or exists(select 1 from public.members m join public.trainers t on t.id = m.trainer_id where m.id = public.attendance.member_id and t.profile_id = auth.uid())
) with check (
  public.is_owner()
  or public.is_senior_trainer()
  or exists(select 1 from public.members m join public.trainers t on t.id = m.trainer_id where m.id = public.attendance.member_id and t.profile_id = auth.uid())
);

drop policy if exists salary_select on public.trainer_salary;
create policy salary_select on public.trainer_salary for select to authenticated using (
  public.is_owner()
  or public.is_senior_trainer()
  or exists(select 1 from public.trainers t where t.id = public.trainer_salary.trainer_id and t.profile_id = auth.uid())
);

drop policy if exists salary_owner_manage on public.trainer_salary;
create policy salary_owner_manage on public.trainer_salary for all to authenticated using (public.is_owner()) with check (public.is_owner());

drop policy if exists supplements_select on public.supplements;
create policy supplements_select on public.supplements for select to authenticated using (public.is_owner() or public.is_senior_trainer());

drop policy if exists supplements_owner_manage on public.supplements;
create policy supplements_owner_manage on public.supplements for all to authenticated using (public.is_owner()) with check (public.is_owner());

drop policy if exists inventory_select on public.inventory_transactions;
create policy inventory_select on public.inventory_transactions for select to authenticated using (public.is_owner() or public.is_senior_trainer());

drop policy if exists inventory_owner_manage on public.inventory_transactions;
create policy inventory_owner_manage on public.inventory_transactions for all to authenticated using (public.is_owner()) with check (public.is_owner());

drop policy if exists sales_select on public.sales;
create policy sales_select on public.sales for select to authenticated using (public.is_owner() or public.is_senior_trainer());

drop policy if exists sales_owner_manage on public.sales;
create policy sales_owner_manage on public.sales for all to authenticated using (public.is_owner()) with check (public.is_owner());

drop policy if exists notifications_staff_access on public.notifications;
create policy notifications_staff_access on public.notifications for all to authenticated using (public.is_owner() or public.is_senior_trainer()) with check (public.is_owner() or public.is_senior_trainer());

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
drop trigger if exists set_plans_updated_at on public.plans;
create trigger set_plans_updated_at before update on public.plans for each row execute procedure public.set_updated_at();
drop trigger if exists set_trainers_updated_at on public.trainers;
create trigger set_trainers_updated_at before update on public.trainers for each row execute procedure public.set_updated_at();
drop trigger if exists set_members_updated_at on public.members;
create trigger set_members_updated_at before update on public.members for each row execute procedure public.set_updated_at();
drop trigger if exists set_fees_updated_at on public.fees;
create trigger set_fees_updated_at before update on public.fees for each row execute procedure public.set_updated_at();
drop trigger if exists set_attendance_updated_at on public.attendance;
create trigger set_attendance_updated_at before update on public.attendance for each row execute procedure public.set_updated_at();
drop trigger if exists set_supplements_updated_at on public.supplements;
create trigger set_supplements_updated_at before update on public.supplements for each row execute procedure public.set_updated_at();

commit;
