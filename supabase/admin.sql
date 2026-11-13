-- Admins: run once in Supabase → SQL Editor, after schema.sql. Safe to run again.
--
-- • Admins own every course automatically (lessons, knowledge bases and the paid files in storage),
--   without buying them.
-- • Only admins can use the admin page (the "admin" Edge Function checks this table).
-- • Nobody can read or change this table from the browser; only you, here in the SQL Editor.

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);
alter table public.admins enable row level security;
-- No policies on purpose: the table is invisible to the website's public and signed-in keys.

-- Is the signed-in user an admin? (Used by the Lab to unlock everything and show the admin link.)
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Owning a course now also includes being an admin. (The storage rule for paid files uses this.)
create or replace function public.owns(course text) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_admin() or exists (
    select 1 from public.purchases p
    where p.user_id = auth.uid() and p.status = 'paid' and (p.product_id = course or p.product_id = 'all')
  );
$$;
revoke all on function public.owns(text) from public, anon;
grant execute on function public.owns(text) to authenticated;

-- ---------------------------------------------------------------- make yourself an admin
-- 1. Sign up in the Learning Lab with your own email and confirm it.
-- 2. Replace the address below with that email and run this statement.
insert into public.admins (user_id)
select id from auth.users where email = lower('Shivam.soni1495@outlook.com')
on conflict do nothing;

-- See who is an admin:            select a.user_id, u.email from public.admins a join auth.users u on u.id = a.user_id;
-- Remove an admin (e.g. a tester): delete from public.admins where user_id = (select id from auth.users where email = lower('…'));
