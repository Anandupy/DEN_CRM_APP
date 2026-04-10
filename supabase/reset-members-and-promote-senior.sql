begin;

alter type public.app_role add value if not exists 'senior_trainer';

delete from public.attendance;
delete from public.payments;
delete from public.fees;
delete from public.members;

update public.profiles
set role = 'senior_trainer'::public.app_role
where lower(email) = 'raj.vishwakarma@denfitness.in';

update public.profiles
set role = 'trainer'::public.app_role
where lower(email) = 'raj.gupta@denfitness.in';

commit;
