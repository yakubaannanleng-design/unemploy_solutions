-- Migration : correction RLS pour la photo de profil (Storage + tables)
-- A executer dans Supabase > SQL Editor > New query.
-- Ne desactive pas le RLS : on ajoute des politiques.

-- 1) Buckets Storage (publics pour affichage des avatars/CV)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', true)
on conflict (id) do nothing;

-- 2) RLS sur storage.objects (deja active par defaut, on s'assure)
alter table storage.objects enable row level security;

-- Nettoyage d'anciennes politiques (optionnel, ignore si absentes)
drop policy if exists "avatars_read_public" on storage.objects;
drop policy if exists "avatars_insert_own" on storage.objects;
drop policy if exists "avatars_update_own" on storage.objects;
drop policy if exists "avatars_delete_own" on storage.objects;
drop policy if exists "cvs_read_public" on storage.objects;
drop policy if exists "cvs_insert_own" on storage.objects;
drop policy if exists "cvs_update_own" on storage.objects;
drop policy if exists "cvs_delete_own" on storage.objects;

-- Avatars : lecture publique, ecriture uniquement dans son dossier (auth.uid())
create policy "avatars_read_public"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_insert_own"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_update_own"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_delete_own"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- CV : lecture publique, ecriture uniquement dans son dossier
create policy "cvs_read_public"
  on storage.objects for select
  using (bucket_id = 'cvs');

create policy "cvs_insert_own"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "cvs_update_own"
  on storage.objects for update to authenticated
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "cvs_delete_own"
  on storage.objects for delete to authenticated
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);

-- 3) Politiques sur les tables de profils (RLS reste active)
-- seeker_profiles
drop policy if exists "seeker_profiles_read_self" on seeker_profiles;
drop policy if exists "seeker_profiles_insert_self" on seeker_profiles;
drop policy if exists "seeker_profiles_update_self" on seeker_profiles;

create policy "seeker_profiles_read_self"
  on seeker_profiles for select to authenticated
  using (user_id = auth.uid()::text);

create policy "seeker_profiles_insert_self"
  on seeker_profiles for insert to authenticated
  with check (user_id = auth.uid()::text);

create policy "seeker_profiles_update_self"
  on seeker_profiles for update to authenticated
  using (user_id = auth.uid()::text)
  with check (user_id = auth.uid()::text);

-- employer_profiles
drop policy if exists "employer_profiles_read_self" on employer_profiles;
drop policy if exists "employer_profiles_insert_self" on employer_profiles;
drop policy if exists "employer_profiles_update_self" on employer_profiles;

create policy "employer_profiles_read_self"
  on employer_profiles for select to authenticated
  using (user_id = auth.uid()::text);

create policy "employer_profiles_insert_self"
  on employer_profiles for insert to authenticated
  with check (user_id = auth.uid()::text);

create policy "employer_profiles_update_self"
  on employer_profiles for update to authenticated
  using (user_id = auth.uid()::text)
  with check (user_id = auth.uid()::text);

-- Si vous avez une table generique "profiles", appliquez les memes politiques :
-- alter table profiles enable row level security;
-- create policy "profiles_read_self" on profiles for select to authenticated using (user_id = auth.uid()::text);
-- create policy "profiles_insert_self" on profiles for insert to authenticated with check (user_id = auth.uid()::text);
-- create policy "profiles_update_self" on profiles for update to authenticated using (user_id = auth.uid()::text) with check (user_id = auth.uid()::text);
