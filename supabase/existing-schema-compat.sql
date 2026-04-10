begin;

create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists is_active boolean not null default true;

alter table public.profiles
  add column if not exists updated_at timestamptz not null default now();

alter table public.members
  add column if not exists trainer_name text not null default 'Unassigned';

alter table public.members
  add column if not exists attendance_pct numeric(5,2) not null default 0;

alter table public.members
  add column if not exists fees_status text not null default 'pending';

alter table public.members
  add column if not exists updated_at timestamptz not null default now();

alter table public.attendance
  add column if not exists member_code text;

alter table public.attendance
  add column if not exists member_name text;

alter table public.attendance
  add column if not exists trainer_name text not null default 'Unassigned';

alter table public.attendance
  add column if not exists updated_at timestamptz not null default now();

alter table public.payments
  add column if not exists updated_at timestamptz not null default now();

update public.members m
set trainer_name = coalesce(
  nullif(m.trainer_name, ''),
  p.full_name,
  'Unassigned'
)
from public.profiles p
where m.assigned_trainer = p.id
  and coalesce(nullif(m.trainer_name, ''), '') = '';

update public.members
set fees_status = case
  when status = 'left' then 'overdue'
  when monthly_fee <= 0 then 'paid'
  else coalesce(fees_status, 'pending')
end;

with payment_stats as (
  select
    p.member_id,
    count(*) as total_payments
  from public.payments p
  group by p.member_id
),
attendance_stats as (
  select
    a.member_id,
    round(
      100.0 * count(*) filter (where lower(a.status) = 'present')
      / nullif(count(*), 0),
      2
    ) as pct
  from public.attendance a
  group by a.member_id
)
update public.members m
set
  fees_status = case
    when coalesce(ps.total_payments, 0) > 0 then 'paid'
    when m.status = 'left' then 'overdue'
    else m.fees_status
  end,
  attendance_pct = coalesce(ast.pct, m.attendance_pct)
from payment_stats ps
full join attendance_stats ast on ast.member_id = ps.member_id
where m.id = coalesce(ps.member_id, ast.member_id);

update public.attendance a
set
  member_code = m.member_code,
  member_name = p.full_name,
  trainer_name = coalesce(
    nullif(a.trainer_name, ''),
    nullif(m.trainer_name, ''),
    'Unassigned'
  )
from public.members m
join public.profiles p on p.id = m.profile_id
where a.member_id = m.id;

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
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    phone,
    role,
    is_active
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.phone,
    coalesce(new.raw_user_meta_data->>'role', 'member'),
    true
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
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
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'owner'
      and is_active = true
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
    where id = auth.uid()
      and role = 'trainer'
      and is_active = true
  )
$$;

alter table public.profiles enable row level security;
alter table public.members enable row level security;
alter table public.attendance enable row level security;
alter table public.payments enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.is_owner()
);

drop policy if exists profiles_update on public.profiles;
create policy profiles_update
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
  or public.is_owner()
)
with check (
  id = auth.uid()
  or public.is_owner()
);

drop policy if exists members_select on public.members;
create policy members_select
on public.members
for select
to authenticated
using (
  public.is_owner()
  or profile_id = auth.uid()
  or assigned_trainer = auth.uid()
);

drop policy if exists members_insert on public.members;
create policy members_insert
on public.members
for insert
to authenticated
with check (
  public.is_owner()
  or public.is_trainer()
);

drop policy if exists members_update on public.members;
create policy members_update
on public.members
for update
to authenticated
using (
  public.is_owner()
  or assigned_trainer = auth.uid()
  or profile_id = auth.uid()
)
with check (
  public.is_owner()
  or assigned_trainer = auth.uid()
  or profile_id = auth.uid()
);

drop policy if exists members_delete on public.members;
create policy members_delete
on public.members
for delete
to authenticated
using (public.is_owner());

drop policy if exists attendance_select on public.attendance;
create policy attendance_select
on public.attendance
for select
to authenticated
using (
  public.is_owner()
  or exists (
    select 1
    from public.members m
    where m.id = attendance.member_id
      and (
        m.profile_id = auth.uid()
        or m.assigned_trainer = auth.uid()
      )
  )
);

drop policy if exists attendance_write on public.attendance;
create policy attendance_write
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

drop policy if exists payments_select on public.payments;
create policy payments_select
on public.payments
for select
to authenticated
using (
  public.is_owner()
  or exists (
    select 1
    from public.members m
    where m.id = payments.member_id
      and (
        m.profile_id = auth.uid()
        or m.assigned_trainer = auth.uid()
      )
  )
);

drop policy if exists payments_write on public.payments;
create policy payments_write
on public.payments
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

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_members_updated_at on public.members;
create trigger set_members_updated_at
before update on public.members
for each row execute procedure public.set_updated_at();

drop trigger if exists set_attendance_updated_at on public.attendance;
create trigger set_attendance_updated_at
before update on public.attendance
for each row execute procedure public.set_updated_at();

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
before update on public.payments
for each row execute procedure public.set_updated_at();

create index if not exists idx_members_assigned_trainer on public.members(assigned_trainer);
create index if not exists idx_attendance_member_id on public.attendance(member_id);
create index if not exists idx_attendance_date on public.attendance(attendance_date);
create index if not exists idx_payments_member_id on public.payments(member_id);

commit;
