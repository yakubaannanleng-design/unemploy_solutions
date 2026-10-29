-- Migration 003 : Row Level Security pour Workca
-- Chaque table est protégée : un utilisateur ne peut lire/écrire que ses propres données.
-- Les admins conservent un accès complet (à adapter selon votre table `users` / rôle).

-- 1. users : lecture publique (profils), écriture propre uniquement
alter table users enable row level security;

create policy "users_select_own_or_public"
  on users for select
  using ( true );

create policy "users_insert_own"
  on users for insert
  with check ( auth.uid()::text = id );

create policy "users_update_own"
  on users for update
  using ( auth.uid()::text = id );

-- 2. seeker_profiles : lecture publique, écriture propre uniquement
alter table seeker_profiles enable row level security;

create policy "seeker_profiles_select_public"
  on seeker_profiles for select
  using ( true );

create policy "seeker_profiles_insert_own"
  on seeker_profiles for insert
  with check ( auth.uid()::text = user_id );

create policy "seeker_profiles_update_own"
  on seeker_profiles for update
  using ( auth.uid()::text = user_id );

-- 3. employer_profiles : lecture publique, écriture propre uniquement
alter table employer_profiles enable row level security;

create policy "employer_profiles_select_public"
  on employer_profiles for select
  using ( true );

create policy "employer_profiles_insert_own"
  on employer_profiles for insert
  with check ( auth.uid()::text = user_id );

create policy "employer_profiles_update_own"
  on employer_profiles for update
  using ( auth.uid()::text = user_id );

-- 4. offers : lecture publique (publiées), écriture employeur propre
alter table offers enable row level security;

create policy "offers_select_published"
  on offers for select
  using ( status = 'publiée' );

create policy "offers_insert_employer"
  on offers for insert
  with check ( auth.uid()::text = employer_id );

create policy "offers_update_employer"
  on offers for update
  using ( auth.uid()::text = employer_id );

create policy "offers_delete_employer"
  on offers for delete
  using ( auth.uid()::text = employer_id );

-- 5. applications : lecture employeur de l'offre + candidat propre, écriture candidat propre
alter table applications enable row level security;

create policy "applications_select_own_or_employer"
  on applications for select
  using (
    auth.uid()::text = seeker_id
    or exists (
      select 1 from offers
      where offers.id = applications.offer_id
        and offers.employer_id = auth.uid()::text
    )
  );

create policy "applications_insert_seeker"
  on applications for insert
  with check ( auth.uid()::text = seeker_id );

create policy "applications_update_seeker"
  on applications for update
  using ( auth.uid()::text = seeker_id );

-- 6. conversations : lecture participants uniquement
alter table conversations enable row level security;

create policy "conversations_select_participants"
  on conversations for select
  using ( auth.uid()::text = any (participants) );

create policy "conversations_insert_participant"
  on conversations for insert
  with check ( auth.uid()::text = any (participants) );

-- 7. messages : lecture participants de la conversation, écriture expéditeur propre
alter table messages enable row level security;

create policy "messages_select_conversation_participants"
  on messages for select
  using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
        and auth.uid()::text = any (conversations.participants)
    )
  );

create policy "messages_insert_sender"
  on messages for insert
  with check ( auth.uid()::text = sender_id );

-- 8. notifications : lecture destinataire propre uniquement
alter table notifications enable row level security;

create policy "notifications_select_own"
  on notifications for select
  using ( auth.uid()::text = user_id );

create policy "notifications_insert_own"
  on notifications for insert
  with check ( auth.uid()::text = user_id );

-- 9. signalements : lecture auteur propre + admin, écriture auteur propre
alter table signalements enable row level security;

create policy "signalements_select_author_or_admin"
  on signalements for select
  using (
    auth.uid()::text = author_id
    or exists (
      select 1 from users
      where users.id = auth.uid()::text
        and users.role = 'admin'
    )
  );

create policy "signalements_insert_author"
  on signalements for insert
  with check ( auth.uid()::text = author_id );

-- 10. transactions : lecture utilisateur propre uniquement
alter table transactions enable row level security;

create policy "transactions_select_own"
  on transactions for select
  using ( auth.uid()::text = user_id );

create policy "transactions_insert_own"
  on transactions for insert
  with check ( auth.uid()::text = user_id );
