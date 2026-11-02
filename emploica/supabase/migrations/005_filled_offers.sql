alter table offers
  add column if not exists filled_at timestamptz;

create index if not exists idx_offers_filled_at
  on offers(filled_at)
  where is_filled = true;

create or replace function public.set_offer_filled_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.is_filled then
    if tg_op = 'INSERT' then
      new.filled_at := now();
    elsif old.is_filled is distinct from true then
      new.filled_at := now();
    else
      new.filled_at := old.filled_at;
    end if;
  else
    new.filled_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists offers_set_filled_at on offers;
create trigger offers_set_filled_at
  before insert or update on offers
  for each row
  execute function public.set_offer_filled_at();

create or replace function public.notify_candidates_when_offer_filled()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into notifications (id, user_id, type, body, created_at, read)
  select
    'notif-' || replace(gen_random_uuid()::text, '-', ''),
    recipients.user_id,
    'offre',
    'Le poste ' || new.title || ' a été pourvu.',
    now(),
    false
  from (
    select seeker_id as user_id
    from applications
    where offer_id = new.id
    union
    select user_id
    from favorites
    where offer_id = new.id
  ) as recipients;
  return new;
end;
$$;

drop trigger if exists offers_notify_candidates_when_filled on offers;
create trigger offers_notify_candidates_when_filled
  after update of is_filled on offers
  for each row
  when (old.is_filled is distinct from true and new.is_filled is true)
  execute function public.notify_candidates_when_offer_filled();

drop policy if exists "offers_select_published" on offers;
create policy "offers_select_published"
  on offers for select
  using (
    employer_id = auth.uid()::text
    or (status::text = 'publiee' and is_filled = false)
    or (
      is_filled = true
      and status::text in ('publiee', 'cloturee')
      and filled_at >= now() - interval '7 days'
    )
  );
