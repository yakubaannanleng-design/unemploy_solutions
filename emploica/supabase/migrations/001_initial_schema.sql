-- Migration initiale : schema Workca (Supabase / Postgres)
-- A executer dans Supabase > SQL Editor > New query

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Types ENUM
do $$ begin
  create type user_role as enum ('chercheur','employeur','admin');
  create type user_status as enum ('actif','suspendu');
  create type verification_level as enum ('declare','verifie');
  create type contract_type as enum ('permanent','temporaire','mission','stage','temps-partiel','independant');
  create type application_status as enum ('envoyee','consultee','retenue','refusee','retiree');
  create type offer_status as enum ('brouillon','en-attente','publiee','cloturee');
  create type message_status as enum ('envoye','lu');
  create type notif_type as enum ('offre','message','candidature','alerte');
  create type signalement_status as enum ('en-attente','traite');
  create type transaction_type as enum ('boost','abonnement');
  create type transaction_status as enum ('reussi','echec','en-attente');
  create type payment_operator as enum ('Orange Money','MTN MoMo');
exception when duplicate_object then null;
end $$;

-- Utilisateurs
create table if not exists users (
  id text primary key,
  role user_role not null,
  name text not null,
  phone text not null,
  email text,
  password_hash text not null,
  status user_status not null default 'actif',
  verification verification_level not null default 'declare',
  created_at timestamptz not null default now()
);

-- Profils chercheurs
create table if not exists seeker_profiles (
  user_id text primary key references users(id) on delete cascade,
  bio text default '',
  skills text[] default '{}',
  categories text[] default '{}',
  contract_wanted contract_type[] default '{}',
  availability text default 'immediatement',
  zone_region text,
  zone_city text,
  zone_quartier text,
  radius_km integer default 10,
  experience text default '',
  languages text[] default '{}',
  photo text,
  missions_done integer default 0,
  rating numeric(3,2)
);

-- Profils employeurs
create table if not exists employer_profiles (
  user_id text primary key references users(id) on delete cascade,
  org_name text not null,
  description text default '',
  org_type text check (org_type in ('entreprise','particulier','association')) default 'entreprise',
  verification verification_level not null default 'declare',
  verified_at timestamptz,
  verification_requested boolean default false,
  verification_requested_at timestamptz
);

-- Offres
create table if not exists offers (
  id text primary key,
  employer_id text not null references users(id) on delete cascade,
  title text not null,
  description text default '',
  tasks text[] default '{}',
  category text,
  skills text[] default '{}',
  location_region text,
  location_city text,
  location_quartier text,
  lat double precision,
  lng double precision,
  contract contract_type,
  duration text,
  schedule text,
  pay text,
  pay_mode text check (pay_mode in ('negocier','fixe')) default 'fixe',
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  status offer_status not null default 'en-attente',
  boost boolean default false,
  views integer default 0
);

-- Candidatures
create table if not exists applications (
  id text primary key,
  offer_id text not null references offers(id) on delete cascade,
  seeker_id text not null references users(id) on delete cascade,
  status application_status not null default 'envoyee',
  created_at timestamptz not null default now(),
  unique (offer_id, seeker_id)
);

-- Conversations
create table if not exists conversations (
  id text primary key,
  participants text[] not null,
  created_at timestamptz not null default now()
);

-- Messages
create table if not exists messages (
  id text primary key,
  conversation_id text not null references conversations(id) on delete cascade,
  sender_id text not null references users(id) on delete cascade,
  receiver_id text not null references users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  status message_status not null default 'envoye'
);

-- Notifications
create table if not exists notifications (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  type notif_type not null,
  body text not null,
  created_at timestamptz not null default now(),
  read boolean default false
);

-- Signalements
create table if not exists signalements (
  id text primary key,
  author_id text not null references users(id) on delete cascade,
  target_type text check (target_type in ('offre','message','utilisateur')),
  target_id text not null,
  reason text,
  created_at timestamptz not null default now(),
  status signalement_status not null default 'en-attente'
);

-- Transactions
create table if not exists transactions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  type transaction_type not null,
  amount integer not null,
  operator payment_operator not null,
  status transaction_status not null,
  created_at timestamptz not null default now()
);

-- Offres flash
create table if not exists flash_offers (
  id text primary key,
  offer_id text not null references offers(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  max_candidates integer default 1,
  taken_count integer default 0
);

-- Evaluations
create table if not exists ratings (
  id text primary key,
  from_user_id text not null references users(id) on delete cascade,
  to_user_id text not null references users(id) on delete cascade,
  to_role text check (to_role in ('employeur','chercheur')),
  mission_id text,
  score integer check (score between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- Favoris
create table if not exists favorites (
  user_id text not null references users(id) on delete cascade,
  offer_id text not null references offers(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, offer_id)
);

-- Formations (referentiel)
create table if not exists trainings (
  id text primary key,
  name text not null,
  category text,
  provider text,
  duration text,
  location text,
  cost text,
  url text
);

-- Index utiles
create index if not exists idx_offers_employer on offers(employer_id);
create index if not exists idx_offers_status on offers(status);
create index if not exists idx_applications_seeker on applications(seeker_id);
create index if not exists idx_applications_offer on applications(offer_id);
create index if not exists idx_messages_conv on messages(conversation_id);
create index if not exists idx_notifications_user on notifications(user_id);
create index if not exists idx_favorites_user on favorites(user_id);

-- RLS : activer sur toutes les tables
alter table users enable row level security;
alter table seeker_profiles enable row level security;
alter table employer_profiles enable row level security;
alter table offers enable row level security;
alter table applications enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table signalements enable row level security;
alter table transactions enable row level security;
alter table flash_offers enable row level security;
alter table ratings enable row level security;
alter table favorites enable row level security;
alter table trainings enable row level security;

-- Politiques simples (a adapter selon vos regles metier)
-- Lecture publique des offres publiees
create policy "offers_read_published" on offers for select using (status = 'publiee');
-- Employeur gere ses offres
create policy "offers_owner_all" on offers for all using (employer_id = auth.uid()::text);
-- Utilisateur lit son profil
create policy "users_read_self" on users for select using (id = auth.uid()::text);
-- Seeker lit son profil
create policy "seeker_read_self" on seeker_profiles for select using (user_id = auth.uid()::text);
-- Employer lit son profil
create policy "employer_read_self" on employer_profiles for select using (user_id = auth.uid()::text);
-- Notifications personnelles
create policy "notifications_read_self" on notifications for select using (user_id = auth.uid()::text);
-- Favoris personnels
create policy "favorites_self" on favorites for all using (user_id = auth.uid()::text);
-- Formations lisibles par tous
create policy "trainings_read_all" on trainings for select using (true);
-- Candidatures : chercheur voit les siennes, employeur voit celles de ses offres
create policy "applications_seeker_read" on applications for select using (seeker_id = auth.uid()::text);

