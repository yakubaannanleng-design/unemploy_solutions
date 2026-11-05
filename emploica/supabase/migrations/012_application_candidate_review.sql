alter table public.seeker_profiles
  add column if not exists education text,
  add column if not exists cv_url text;

update public.seeker_profiles
set cv_url = substring(cv_url from '/storage/v1/object/public/cvs/(.*)$')
where cv_url like '%/storage/v1/object/public/cvs/%';

update storage.buckets
set public = false
where id = 'cvs';

drop policy if exists "cvs_read_public" on storage.objects;
drop policy if exists "cvs_read_owner_or_applicant_employer" on storage.objects;

create policy "cvs_read_owner_or_applicant_employer"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'cvs'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1
        from public.applications as application
        join public.offers as offer on offer.id = application.offer_id
        where application.seeker_id = (storage.foldername(name))[1]
          and offer.employer_id = auth.uid()::text
      )
    )
  );

drop policy if exists "seeker_profiles_select_public" on public.seeker_profiles;
drop policy if exists "seeker_profiles_read_self" on public.seeker_profiles;
drop policy if exists "seeker_read_self" on public.seeker_profiles;

create policy "seeker_profiles_select_self_or_applicant_employer"
  on public.seeker_profiles for select to authenticated
  using (
    auth.uid()::text = user_id
    or exists (
      select 1
      from public.applications as application
      join public.offers as offer on offer.id = application.offer_id
      where application.seeker_id = seeker_profiles.user_id
        and offer.employer_id = auth.uid()::text
    )
  );

drop policy if exists "applications_update_seeker" on public.applications;

create or replace function public.update_application_status(
  p_application_id text,
  p_status application_status
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  candidate_id text;
  application_offer_id text;
  offer_title text;
  employer_name text;
begin
  if auth.uid() is null then
    raise exception 'An authenticated employer is required to review an application.';
  end if;

  if p_status is null or p_status not in ('retenue', 'refusee') then
    raise exception 'Only shortlist or rejection decisions are supported.';
  end if;

  update public.applications as application
  set status = p_status
  where application.id = p_application_id
    and application.status::text in ('envoyee', 'consultee')
    and exists (
      select 1
      from public.offers as offer
      where offer.id = application.offer_id
        and offer.employer_id = auth.uid()::text
    )
  returning application.seeker_id, application.offer_id
  into candidate_id, application_offer_id;

  if candidate_id is null then
    raise exception 'The application was not found or is no longer reviewable by this employer.';
  end if;

  select offer.title
  into offer_title
  from public.applications as application
  join public.offers as offer on offer.id = application.offer_id
  where application.id = p_application_id
    and application.offer_id = application_offer_id;

  select coalesce(profile.org_name, employer.name, 'votre employeur')
  into employer_name
  from public.applications as application
  join public.offers as offer on offer.id = application.offer_id
  left join public.employer_profiles as profile on profile.user_id = offer.employer_id
  left join public.users as employer on employer.id = offer.employer_id
  where application.id = p_application_id
    and application.offer_id = application_offer_id;

  insert into public.notifications (id, user_id, type, body, created_at, read)
  values (
    'notif-' || replace(gen_random_uuid()::text, '-', ''),
    candidate_id,
    'candidature',
    case p_status
      when 'retenue' then 'Votre candidature pour « ' || offer_title || ' » a été retenue par ' || employer_name || '.'
      else 'Votre candidature pour « ' || offer_title || ' » a été refusée par ' || employer_name || '.'
    end,
    now(),
    false
  );

  return true;
end;
$$;

revoke all on function public.update_application_status(text, application_status) from public, anon;
grant execute on function public.update_application_status(text, application_status) to authenticated;
