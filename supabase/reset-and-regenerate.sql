-- WARNING:
-- This will permanently delete current ERP data from public tables.
-- It does NOT delete auth.users automatically.
-- After running this, run the staff seed script again.

begin;

drop trigger if exists on_auth_user_created on auth.users;

drop function if exists public.handle_new_user() cascade;
drop function if exists public.is_owner() cascade;
drop function if exists public.is_trainer() cascade;
drop function if exists public.current_role() cascade;
drop function if exists public.normalize_app_role(text) cascade;
drop function if exists public.set_updated_at() cascade;

drop table if exists public.activities cascade;
drop table if exists public.attendance cascade;
drop table if exists public.fees cascade;
drop table if exists public.payments cascade;
drop table if exists public.members cascade;
drop table if exists public.trainers cascade;
drop table if exists public.plans cascade;
drop table if exists public.profiles cascade;

drop type if exists public.app_role cascade;

commit;

create extension if not exists pgcrypto;

do $$
begin
  create type public.app_role as enum ('owner', 'trainer', 'member');
exception
  when duplicate_object then null;
end $$;

create or replace function public.normalize_app_role(input_role text)
returns public.app_role
language plpgsql
immutable
as $$
begin
  case lower(coalesce(input_role, 'member'))
    when 'owner' then return 'owner'::public.app_role;
    when 'trainer' then return 'trainer'::public.app_role;
    when 'member' then return 'member'::public.app_role;
    else return 'member'::public.app_role;
  end case;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  role public.app_role not null default 'member',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plans (
  plan_name text primary key,
  price numeric(12,2) not null,
  duration_label text not null,
  duration_months integer not null check (duration_months > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.trainers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  trainer_code text not null unique,
  full_name text not null,
  email text not null,
  phone text,
  specialization text not null default 'General Fitness',
  experience_label text not null default '1 year',
  assigned_members integer not null default 0,
  rating numeric(2,1) not null default 0 check (rating >= 0 and rating <= 5),
  joined_on date not null default current_date,
  status text not null default 'active' check (status in ('active', 'inactive')),
  shift_label text not null default 'Mon-Sat, 6AM-2PM',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  member_code text not null unique,
  full_name text not null,
  phone text not null,
  email text not null default '',
  address text not null default '',
  gender text not null default 'Other' check (gender in ('Male', 'Female', 'Other')),
  age integer not null default 18 check (age >= 12 and age <= 100),
  joined_on date not null default current_date,
  expires_on date not null default (current_date + interval '30 days'),
  plan_name text not null default 'Monthly' references public.plans(plan_name),
  trainer_name text not null default 'Unassigned',
  emergency_contact text not null default '',
  medical_notes text not null default 'None',
  status text not null default 'active' check (status in ('active', 'inactive', 'expired', 'suspended')),
  fees_status text not null default 'pending' check (fees_status in ('paid', 'pending', 'overdue')),
  attendance_pct numeric(5,2) not null default 0 check (attendance_pct >= 0 and attendance_pct <= 100),
  last_payment_mode text not null default 'Cash' check (last_payment_mode in ('Cash', 'UPI', 'Card', 'Online')),
  last_payment_date date not null default current_date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.fees (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade,
  member_code text not null,
  member_name text not null,
  plan_name text not null references public.plans(plan_name),
  amount numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  due_date date not null,
  paid_date date,
  status text not null default 'pending' check (status in ('paid', 'pending', 'overdue')),
  payment_mode text check (payment_mode in ('Cash', 'UPI', 'Card', 'Online')),
  billing_month text not null,
  notes text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade,
  member_code text not null,
  member_name text not null,
  trainer_name text not null default 'Unassigned',
  attendance_date date not null default current_date,
  status text check (status in ('present', 'absent', 'late')),
  marked_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_code, attendance_date)
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  activity_type text not null check (
    activity_type in (
      'new_member',
      'fee_paid',
      'attendance_marked',
      'membership_expired',
      'plan_changed',
      'fee_overdue',
      'trainer_assigned',
      'late_entry'
    )
  ),
  member_id uuid references public.members(id) on delete set null,
  member_name text not null default 'System',
  detail text not null,
  activity_time text not null default to_char(now(), 'HH12:MI AM'),
  amount text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_profiles_role on public.profiles(role);
create index idx_members_trainer_name on public.members(trainer_name);
create index idx_members_profile_id on public.members(profile_id);
create index idx_fees_member_id on public.fees(member_id);
create index idx_attendance_member_id on public.attendance(member_id);
create index idx_attendance_date on public.attendance(attendance_date);
create index idx_activities_created_at on public.activities(created_at desc);

insert into public.plans (plan_name, price, duration_label, duration_months)
values
  ('Monthly', 1500, '1 Month', 1),
  ('Quarterly', 3500, '3 Months', 3),
  ('Half-Yearly', 6500, '6 Months', 6),
  ('Annual', 12000, '12 Months', 12);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.phone,
    public.normalize_app_role(new.raw_user_meta_data->>'role')
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

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.current_role()
returns public.app_role
language sql
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'owner'::public.app_role and is_active = true
  )
$$;

create or replace function public.is_trainer()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'trainer'::public.app_role and is_active = true
  )
$$;

alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.trainers enable row level security;
alter table public.members enable row level security;
alter table public.fees enable row level security;
alter table public.attendance enable row level security;
alter table public.activities enable row level security;

create policy profiles_select
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_owner());

create policy profiles_update
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.is_owner())
with check (id = auth.uid() or public.is_owner());

create policy plans_select
on public.plans
for select
to authenticated
using (true);

create policy plans_owner_write
on public.plans
for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy trainers_select
on public.trainers
for select
to authenticated
using (true);

create policy trainers_owner_write
on public.trainers
for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy members_select
on public.members
for select
to authenticated
using (
  public.is_owner()
  or profile_id = auth.uid()
  or exists (
    select 1
    from public.trainers t
    where t.profile_id = auth.uid()
      and t.full_name = public.members.trainer_name
  )
);

create policy members_owner_or_trainer_insert
on public.members
for insert
to authenticated
with check (
  public.is_owner()
  or public.is_trainer()
);

create policy members_owner_or_trainer_update
on public.members
for update
to authenticated
using (
  public.is_owner()
  or exists (
    select 1
    from public.trainers t
    where t.profile_id = auth.uid()
      and t.full_name = public.members.trainer_name
  )
  or profile_id = auth.uid()
)
with check (
  public.is_owner()
  or exists (
    select 1
    from public.trainers t
    where t.profile_id = auth.uid()
      and t.full_name = public.members.trainer_name
  )
  or profile_id = auth.uid()
);

create policy members_owner_delete
on public.members
for delete
to authenticated
using (public.is_owner());

create policy fees_select
on public.fees
for select
to authenticated
using (
  public.is_owner()
  or exists (
    select 1
    from public.members m
    where m.id = public.fees.member_id
      and m.profile_id = auth.uid()
  )
  or exists (
    select 1
    from public.members m
    join public.trainers t on t.full_name = m.trainer_name
    where m.id = public.fees.member_id
      and t.profile_id = auth.uid()
  )
);

create policy fees_owner_or_trainer_insert
on public.fees
for insert
to authenticated
with check (
  public.is_owner()
  or public.is_trainer()
);

create policy fees_owner_or_trainer_update
on public.fees
for update
to authenticated
using (
  public.is_owner()
  or exists (
    select 1
    from public.members m
    join public.trainers t on t.full_name = m.trainer_name
    where m.id = public.fees.member_id
      and t.profile_id = auth.uid()
  )
)
with check (
  public.is_owner()
  or exists (
    select 1
    from public.members m
    join public.trainers t on t.full_name = m.trainer_name
    where m.id = public.fees.member_id
      and t.profile_id = auth.uid()
  )
);

create policy fees_owner_delete
on public.fees
for delete
to authenticated
using (public.is_owner());

create policy attendance_select
on public.attendance
for select
to authenticated
using (
  public.is_owner()
  or exists (
    select 1
    from public.members m
    where m.id = public.attendance.member_id
      and m.profile_id = auth.uid()
  )
  or exists (
    select 1
    from public.members m
    join public.trainers t on t.full_name = m.trainer_name
    where m.id = public.attendance.member_id
      and t.profile_id = auth.uid()
  )
);

create policy attendance_owner_or_trainer_write
on public.attendance
for all
to authenticated
using (
  public.is_owner()
  or public.is_trainer()
)
with check (
  public.is_owner()
  or public.is_trainer()
);

create policy activities_select
on public.activities
for select
to authenticated
using (true);

create policy activities_owner_or_trainer_insert
on public.activities
for insert
to authenticated
with check (
  public.is_owner()
  or public.is_trainer()
);

create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger set_plans_updated_at before update on public.plans for each row execute procedure public.set_updated_at();
create trigger set_trainers_updated_at before update on public.trainers for each row execute procedure public.set_updated_at();
create trigger set_members_updated_at before update on public.members for each row execute procedure public.set_updated_at();
create trigger set_fees_updated_at before update on public.fees for each row execute procedure public.set_updated_at();
create trigger set_attendance_updated_at before update on public.attendance for each row execute procedure public.set_updated_at();
