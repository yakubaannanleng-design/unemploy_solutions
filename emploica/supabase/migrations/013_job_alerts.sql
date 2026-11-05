create table if not exists public.job_alerts (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  category text,
  city text,
  contract contract_type,
  frequency text not null check (frequency in ('immediate', 'daily')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_job_alerts_user_created
  on public.job_alerts (user_id, created_at desc);

alter table public.job_alerts enable row level security;

create policy "job_alerts_select_own"
  on public.job_alerts for select
  using (auth.uid()::text = user_id);

create policy "job_alerts_insert_own"
  on public.job_alerts for insert
  with check (auth.uid()::text = user_id);

create policy "job_alerts_update_own"
  on public.job_alerts for update
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

create policy "job_alerts_delete_own"
  on public.job_alerts for delete
  using (auth.uid()::text = user_id);

grant select, insert, update, delete on public.job_alerts to authenticated;
