create table if not exists public.offer_views (
  offer_id text not null references public.offers(id) on delete cascade,
  viewer_id text not null references public.users(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  view_day date not null default (timezone('utc', now())::date),
  constraint offer_views_once_per_user_per_day unique (offer_id, viewer_id, view_day)
);

create index if not exists idx_offer_views_offer_viewed_at
  on public.offer_views (offer_id, viewed_at);

alter table public.offer_views enable row level security;

drop policy if exists "employers_select_own_offer_views" on public.offer_views;
create policy "employers_select_own_offer_views"
  on public.offer_views for select
  using (
    exists (
      select 1
      from public.offers
      where offers.id = offer_views.offer_id
        and offers.employer_id = auth.uid()::text
    )
  );

grant select on public.offer_views to authenticated;
revoke insert, update, delete on public.offer_views from anon, authenticated;

create or replace function public.record_offer_view(p_offer_id text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'An authenticated user is required to record an offer view.';
  end if;

  insert into public.offer_views (offer_id, viewer_id)
  select offers.id, auth.uid()::text
  from public.offers
  where offers.id = p_offer_id
    and offers.employer_id <> auth.uid()::text
    and offers.status::text = 'publiee'
    and offers.is_filled = false
  on conflict (offer_id, viewer_id, view_day) do nothing;
end;
$$;

revoke all on function public.record_offer_view(text) from public;
grant execute on function public.record_offer_view(text) to authenticated;
