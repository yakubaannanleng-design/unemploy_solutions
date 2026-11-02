alter table public.offers
  add column if not exists telegram_message_id text;

create or replace function public.expire_offers()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  expired_count integer;
begin
  update public.offers
  set status = 'expiree'
  where status::text in ('publiee', 'en-attente')
    and is_filled = false
    and expires_at is not null
    and expires_at <= now();

  get diagnostics expired_count = row_count;
  return expired_count;
end;
$$;

revoke all on function public.expire_offers() from public;
grant execute on function public.expire_offers() to authenticated;

create or replace function public.mark_offer_filled(p_offer_id text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'An authenticated user is required to close an offer.';
  end if;

  update public.offers
  set is_filled = true,
      status = 'cloturee'
  where id = p_offer_id
    and employer_id = auth.uid()::text
    and status::text = 'publiee'
    and is_filled = false
    and (expires_at is null or expires_at > now());

  return found;
end;
$$;

revoke all on function public.mark_offer_filled(text) from public;
grant execute on function public.mark_offer_filled(text) to authenticated;

drop policy if exists "applications_insert_seeker" on public.applications;
create policy "applications_insert_seeker"
  on public.applications for insert
  with check (
    auth.uid()::text = seeker_id
    and exists (
      select 1
      from public.offers
      where offers.id = applications.offer_id
        and offers.status::text = 'publiee'
        and offers.is_filled = false
        and (offers.expires_at is null or offers.expires_at > now())
    )
  );

create extension if not exists pg_cron;

do $$
declare
  existing_job bigint;
begin
  select jobid
  into existing_job
  from cron.job
  where jobname = 'workca-expire-offers';

  if existing_job is not null then
    perform cron.unschedule(existing_job);
  end if;

  perform cron.schedule(
    'workca-expire-offers',
    '*/15 * * * *',
    'select public.expire_offers();'
  );
end;
$$;
