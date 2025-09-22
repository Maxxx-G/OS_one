-- Threads & Messages for OS_One
-- Requires: pgcrypto for gen_random_uuid(); enable if not present
create extension if not exists pgcrypto;

-- THREADS
create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text,
  created_at timestamptz not null default now()
);

-- MESSAGES
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  text text not null,
  response_id text,
  model text,
  provider text,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_threads_user on public.threads(user_id);
create index if not exists idx_messages_thread on public.messages(thread_id);
create index if not exists idx_messages_response on public.messages(response_id);

-- RLS
alter table public.threads enable row level security;
alter table public.messages enable row level security;

-- Policies (owner = auth.uid())
create policy threads_sel on public.threads
  for select using (user_id = auth.uid());
create policy threads_ins on public.threads
  for insert with check (user_id = auth.uid());
create policy threads_upd on public.threads
  for update using (user_id = auth.uid());
create policy threads_del on public.threads
  for delete using (user_id = auth.uid());

create policy messages_sel on public.messages
  for select using (
    exists (select 1 from public.threads t where t.id = thread_id and t.user_id = auth.uid())
  );
create policy messages_ins on public.messages
  for insert with check (
    exists (select 1 from public.threads t where t.id = thread_id and t.user_id = auth.uid())
  );
create policy messages_upd on public.messages
  for update using (
    exists (select 1 from public.threads t where t.id = thread_id and t.user_id = auth.uid())
  );
create policy messages_del on public.messages
  for delete using (
    exists (select 1 from public.threads t where t.id = thread_id and t.user_id = auth.uid())
  );
