create table if not exists public.employer_follows (
  follower_id text not null references public.users(id) on delete cascade,
  company_id text not null references public.employer_profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint employer_follows_pk primary key (follower_id, company_id),
  constraint employer_follows_not_self check (follower_id <> company_id)
);

create index if not exists idx_employer_follows_company
  on public.employer_follows (company_id);

alter table public.employer_follows enable row level security;

create policy "employer_follows_select_own"
  on public.employer_follows for select
  using (auth.uid()::text = follower_id);

create policy "employer_follows_insert_own"
  on public.employer_follows for insert
  with check (auth.uid()::text = follower_id);

create policy "employer_follows_delete_own"
  on public.employer_follows for delete
  using (auth.uid()::text = follower_id);

grant select, insert, delete on public.employer_follows to authenticated;

create or replace function public.notify_followers_of_new_offer()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.status::text <> 'publiee' then
    return new;
  end if;

  if tg_op = 'UPDATE' and old.status::text = 'publiee' then
    return new;
  end if;

  insert into public.notifications (id, user_id, type, body, created_at, read)
  select
    'notif-' || replace(gen_random_uuid()::text, '-', ''),
    follows.follower_id,
    'offre',
    'Nouvelle offre de ' || coalesce(profiles.org_name, 'une entreprise') || ' : ' || new.title,
    now(),
    false
  from public.employer_follows as follows
  left join public.employer_profiles as profiles
    on profiles.user_id = new.employer_id
  where follows.company_id = new.employer_id
    and follows.follower_id <> new.employer_id;

  return new;
end;
$$;

drop trigger if exists offers_notify_company_followers on public.offers;
create trigger offers_notify_company_followers
  after insert or update of status on public.offers
  for each row
  execute function public.notify_followers_of_new_offer();
