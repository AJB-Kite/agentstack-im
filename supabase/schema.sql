create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  company text not null,
  preferred_setup text not null,
  goal text,
  source text,
  ip_hash text,
  user_agent text
);

-- Optional de-dup index by email/date window can be added later.
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (email);

alter table public.leads enable row level security;

-- No public access.
drop policy if exists "No anonymous read" on public.leads;
create policy "No anonymous read"
on public.leads
for select
to anon
using (false);

drop policy if exists "No anonymous insert" on public.leads;
create policy "No anonymous insert"
on public.leads
for insert
to anon
with check (false);

-- Authenticated users read via dashboard if needed.
drop policy if exists "Authenticated read" on public.leads;
create policy "Authenticated read"
on public.leads
for select
to authenticated
using (true);
