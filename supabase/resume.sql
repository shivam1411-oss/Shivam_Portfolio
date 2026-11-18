-- Run once in Supabase → SQL Editor. Used by the send-resume Edge Function to limit how often the
-- "Get Resume" form can send email. Holds only hashed email addresses and IPs, kept for two days.
create table if not exists public.resume_requests (
  id bigint generated always as identity primary key,
  email_hash text not null,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists resume_requests_created_idx on public.resume_requests (created_at);
alter table public.resume_requests enable row level security;
-- No policies on purpose: only the Edge Function (with the secret key) can read or write it.
