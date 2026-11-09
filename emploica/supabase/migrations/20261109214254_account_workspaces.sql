-- PROBLÈME RÉSOLU : persiste les trois espaces d'un même compte et les champs nécessaires aux candidatures.
alter table public.users
  add column if not exists active_role text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'users_active_role_check'
      and conrelid = 'public.users'::regclass
  ) then
    alter table public.users add constraint users_active_role_check
      check (active_role is null or active_role in ('chercheur', 'employeur', 'entreprise'));
  end if;
end;
$$;

update public.users
set active_role = case when role::text = 'employeur' then 'employeur' else 'chercheur' end
where active_role is null and role::text <> 'admin';

create table if not exists public.user_roles (
  user_id text not null references public.users(id) on delete cascade,
  role text not null check (role in ('chercheur', 'employeur', 'entreprise')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

insert into public.user_roles (user_id, role)
select id, case when role::text = 'employeur' then 'employeur' else 'chercheur' end
from public.users
where role::text <> 'admin'
on conflict (user_id, role) do nothing;

alter table public.user_roles enable row level security;

drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own"
  on public.user_roles for select to authenticated
  using (user_id = auth.uid()::text);

drop policy if exists "user_roles_insert_own" on public.user_roles;
create policy "user_roles_insert_own"
  on public.user_roles for insert to authenticated
  with check (user_id = auth.uid()::text);

drop policy if exists "user_roles_delete_own" on public.user_roles;
create policy "user_roles_delete_own"
  on public.user_roles for delete to authenticated
  using (user_id = auth.uid()::text);

drop policy if exists "users_update_active_role" on public.users;
create policy "users_update_active_role"
  on public.users for update to authenticated
  using (id = auth.uid()::text)
  with check (id = auth.uid()::text);

grant select, insert, delete on public.user_roles to authenticated;

alter table public.offers
  add column if not exists cv_required boolean not null default false,
  add column if not exists contact_email text;

alter table public.applications
  add column if not exists cover_message text,
  add column if not exists cv_path text;

grant update (active_role) on public.users to authenticated;
