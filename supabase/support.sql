-- Support requests: run once in Supabase → SQL Editor (after schema.sql). Safe to run again.
--
-- • Signed-in learners raise a request from CodeJack's Help page; each one is a ticket with a thread of replies.
-- • Both tables have row-level security on and no policies: the website can never read or write them directly.
--   Only the "support" Edge Function (for learners, their own tickets only) and the "admin" Edge Function
--   (for you) can, using the secret key.

create table if not exists public.support_tickets (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  name text not null default '',
  category text not null check (category in ('payment', 'account', 'content', 'bug', 'other')),
  subject text not null check (char_length(subject) between 3 and 120),
  message text not null check (char_length(message) between 10 and 4000),
  context jsonb not null default '{}'::jsonb, -- where it was raised from: page, web or app, payment reference
  status text not null default 'open' check (status in ('open', 'answered', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists support_tickets_user_idx on public.support_tickets (user_id, created_at desc);
create index if not exists support_tickets_status_idx on public.support_tickets (status, updated_at desc);
alter table public.support_tickets enable row level security;
-- No policies on purpose: only the Edge Functions (with the secret key) can read or write it.

create table if not exists public.support_replies (
  id bigint generated always as identity primary key,
  ticket_id bigint not null references public.support_tickets (id) on delete cascade,
  author text not null check (author in ('learner', 'support')),
  message text not null check (char_length(message) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index if not exists support_replies_ticket_idx on public.support_replies (ticket_id, created_at);
alter table public.support_replies enable row level security;
-- No policies on purpose, as above.

-- Useful queries:
--   Open requests:       select id, email, category, subject, created_at from public.support_tickets where status <> 'resolved' order by created_at;
--   Delete one request:  delete from public.support_tickets where id = 123;   -- its replies go with it
