-- Memory & Profile (OS_One)
create extension if not exists pgcrypto;
create extension if not exists vector;  -- for embeddings

-- SEMANTIC MEMORIES (cross-thread distilled facts)
create table if not exists public.semantic_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text,
  content text not null,
  embedding vector(1536),    -- adjust dim to your encoder
  salience real default 0.0,
  tags text[] default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_sem_mem_user on public.semantic_memories(user_id);
create index if not exists idx_sem_mem_created on public.semantic_memories(created_at);
-- Optional ANN index (enable after data loads):
-- create index if not exists idx_sem_mem_vec on public.semantic_memories
--   using hnsw (embedding vector_cosine_ops);

-- PROFILE TRAITS (behavioral mirroring; 1 row per user)
create table if not exists public.profile_traits (
  user_id uuid primary key,
  tone text default 'neutral',
  formatting_prefs jsonb default '{}'::jsonb,
  do_list text[] default '{}',
  dont_list text[] default '{}',
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.semantic_memories enable row level security;
alter table public.profile_traits enable row level security;

create policy sem_mem_sel on public.semantic_memories
  for select using (user_id = auth.uid());
create policy sem_mem_ins on public.semantic_memories
  for insert with check (user_id = auth.uid());
create policy sem_mem_upd on public.semantic_memories
  for update using (user_id = auth.uid());
create policy sem_mem_del on public.semantic_memories
  for delete using (user_id = auth.uid());

create policy profile_sel on public.profile_traits
  for select using (user_id = auth.uid());
create policy profile_ins on public.profile_traits
  for insert with check (user_id = auth.uid());
create policy profile_upd on public.profile_traits
  for update using (user_id = auth.uid());
create policy profile_del on public.profile_traits
  for delete using (user_id = auth.uid());
