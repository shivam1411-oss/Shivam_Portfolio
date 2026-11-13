-- Learning Lab accounts and paid courses: run once in Supabase → SQL Editor → New query → Run.
-- Safe to run again: everything uses "if not exists" / "or replace".
--
-- Who can do what (enforced by the database, not the website):
--   • Anyone can read the product list and prices.
--   • A signed-in learner can read only their own purchases and their own progress.
--   • Nobody can create or change a purchase from the browser. Only the payment server functions
--     (which hold the secret key and check Razorpay's signature) can mark something as paid.
--   • Paid lesson files are in a private bucket; a learner can download a course's files only if they
--     own that course or all-access.

-- ---------------------------------------------------------------- products and prices
create table if not exists public.products (
  id text primary key,                 -- course id ('python', 'pandas', …) or 'all'
  title text not null,
  price_paise integer not null check (price_paise > 0),   -- ₹399 = 39900
  active boolean not null default true
);
alter table public.products enable row level security;
drop policy if exists "products are public" on public.products;
create policy "products are public" on public.products for select to anon, authenticated using (active);

insert into public.products (id, title, price_paise) values
  ('python', 'Python', 39900),
  ('pandas', 'Data Analysis with pandas', 39900),
  ('sql',    'SQL with Python', 39900),
  ('viz',    'Charts with Matplotlib', 39900),
  ('react',  'React', 39900),
  ('jira',   'Jira', 39900),
  ('k8s',    'Kubernetes', 39900),
  ('all',    'All-access: every course', 149900)
on conflict (id) do nothing;          -- change prices later with: update public.products set price_paise = 49900 where id = 'python';

-- ---------------------------------------------------------------- purchases
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null references public.products (id),
  amount_paise integer not null,
  status text not null default 'created' check (status in ('created', 'paid', 'failed', 'refunded')),
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists purchases_user_idx on public.purchases (user_id);
alter table public.purchases enable row level security;
drop policy if exists "read own purchases" on public.purchases;
create policy "read own purchases" on public.purchases for select to authenticated using (user_id = (select auth.uid()));
-- No insert/update/delete policies on purpose: only server functions (secret key) write purchases.

-- ---------------------------------------------------------------- progress (follows the learner across devices)
create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.progress enable row level security;
drop policy if exists "own progress" on public.progress;
create policy "own progress" on public.progress for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------- does the signed-in learner own a course?
create or replace function public.owns(course text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.purchases p
    where p.user_id = auth.uid() and p.status = 'paid' and (p.product_id = course or p.product_id = 'all')
  );
$$;
revoke all on function public.owns(text) from public;
grant execute on function public.owns(text) to authenticated;

-- ---------------------------------------------------------------- private storage for paid lessons
insert into storage.buckets (id, name, public) values ('paid-lessons', 'paid-lessons', false)
on conflict (id) do nothing;
drop policy if exists "owners read paid lessons" on storage.objects;
create policy "owners read paid lessons" on storage.objects for select to authenticated
  using (bucket_id = 'paid-lessons' and public.owns(split_part(name, '/', 1)));
