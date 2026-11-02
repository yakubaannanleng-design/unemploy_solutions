alter table public.offers
  add column if not exists contact_mode text,
  add column if not exists contact_phone text,
  add column if not exists share_telegram boolean not null default false;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'offers_contact_mode_check'
      and conrelid = 'public.offers'::regclass
  ) then
    alter table public.offers
      add constraint offers_contact_mode_check
      check (contact_mode is null or contact_mode in ('profil', 'whatsapp', 'appel'));
  end if;
end;
$$;
