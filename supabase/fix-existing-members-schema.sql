alter table public.members add column if not exists trainer_name text not null default 'Unassigned';

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'members'
      and column_name = 'trainer'
  ) then
    update public.members
    set trainer_name = coalesce(nullif(trainer_name, ''), trainer)
    where coalesce(nullif(trainer_name, ''), '') = '';
  end if;
end $$;
