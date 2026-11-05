-- PROBLÈME RÉSOLU : sécurise la revue des offres et leurs transitions vers la publication.
create or replace function public.protect_user_privileges()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if auth.role() = 'service_role' or current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;

  if tg_op = 'INSERT' and new.role::text = 'admin' then
    raise exception 'Administrator accounts must be provisioned by a privileged operator.';
  end if;

  if tg_op = 'UPDATE' then
    if (new.role is distinct from old.role or new.status is distinct from old.status)
      and not exists (
        select 1
        from public.users as actor
        where actor.id = auth.uid()::text
          and actor.role::text = 'admin'
      )
    then
      raise exception 'Only an administrator can change a user role or status.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_user_privileges on public.users;
create trigger protect_user_privileges
  before insert or update on public.users
  for each row
  execute function public.protect_user_privileges();

create or replace function public.prevent_unapproved_offer_publication()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.status::text = 'publiee'
    and old.status::text <> 'publiee'
    and auth.role() <> 'service_role'
    and not exists (
      select 1
      from public.users as actor
      where actor.id = auth.uid()::text
        and actor.role::text = 'admin'
    )
  then
    raise exception 'Only an administrator can approve an offer.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_unapproved_offer_publication on public.offers;
create trigger prevent_unapproved_offer_publication
  before update of status on public.offers
  for each row
  execute function public.prevent_unapproved_offer_publication();

drop policy if exists "offers_select_owner_or_admin" on public.offers;
create policy "offers_select_owner_or_admin"
  on public.offers for select
  using (
    auth.uid()::text = employer_id
    or exists (
      select 1
      from public.users as actor
      where actor.id = auth.uid()::text
        and actor.role::text = 'admin'
    )
  );

create or replace function public.review_offer(
  p_offer_id text,
  p_approved boolean
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_approved is null then
    raise exception 'An approval decision is required.';
  end if;

  if auth.uid() is null or not exists (
    select 1
    from public.users as actor
    where actor.id = auth.uid()::text
      and actor.role::text = 'admin'
  ) then
    raise exception 'An authenticated administrator is required to review offers.';
  end if;

  update public.offers
  set status = case when p_approved then 'publiee'::offer_status else 'cloturee'::offer_status end
  where id = p_offer_id
    and status::text = 'en-attente';

  return found;
end;
$$;

revoke all on function public.review_offer(text, boolean) from public, anon;
grant execute on function public.review_offer(text, boolean) to authenticated;
