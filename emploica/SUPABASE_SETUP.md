# Configuration Supabase — Workca

## 1. Exécuter le schéma SQL
1. Ouvrez votre projet Supabase : https://supabase.com/dashboard/project/vmmvniqdxnvpkmqhrbxb
2. Allez dans **SQL Editor** → **New query**.
3. Exécutez les migrations disponibles de `supabase/migrations/` dans l'ordre numérique (`001`, `003`, `004`, `005`, `006`, `007`, `008`, `009`, `010`, `011`, puis `012`) dans le SQL Editor.
4. Vérifiez dans **Table Editor** que les tables et les colonnes des offres sont créées.

La migration `004_offer_search_filters.sql` ajoute les champs structurés utilisés par les filtres détaillés d'offres. Elle doit être appliquée aux projets Supabase déjà initialisés avant d'utiliser ces filtres.

La migration `005_filled_offers.sql` ajoute la date de clôture des offres pourvues, la fenêtre de visibilité de sept jours, les notifications aux candidats ayant postulé ou enregistré l'offre, et l'accès RLS nécessaire aux détails partagés. Elle doit être appliquée après la migration 004.

La migration `006_employer_company_profile.sql` ajoute le secteur, la ville et le logo facultatif au profil d'entreprise, utilisés par l'étape de création du profil employeur.

La migration `007_employer_monthly_views.sql` enregistre une vue par compte et par offre chaque jour, afin de calculer les vues mensuelles du tableau de bord employeur. Elle doit être appliquée après les migrations 004 à 006.

La migration `008_offer_publication_contact.sql` ajoute à chaque offre le canal de contact choisi et l'option de partage Telegram. Les offres créées avant cette migration conservent leurs options de contact existantes.

La migration `009_expired_offer_status.sql` ajoute le statut d'offre expirée. La migration `010_employer_offer_management.sql` bloque les candidatures sur les offres clôturées ou expirées et planifie leur expiration toutes les quinze minutes avec `pg_cron`.

La migration `011_employer_follows.sql` ajoute le suivi des entreprises, ses règles RLS et les notifications envoyées aux abonnés lorsqu'une offre est publiée. Elle doit être appliquée après les migrations précédentes.

La migration `012_application_candidate_review.sql` rend le CV persistant dans le profil chercheur, limite la lecture des profils aux candidats ayant postulé auprès de l'employeur authentifié, supprime la possibilité pour un candidat de modifier directement le statut d'une candidature et autorise la décision de présélection/refus via une fonction SQL vérifiant la propriété de l'offre. Elle doit être appliquée après les migrations précédentes.

## 2. Récupérer les clés API
1. Allez dans **Project Settings** → **API**.
2. Copiez l'**URL** du projet et la clé **anon (public)**.
3. Créez un fichier `.env` à la racine de `emploica/` :
   ```
   VITE_SUPABASE_URL=https://vmmvniqdxnvpkmqhrbxb.supabase.co
   VITE_SUPABASE_ANON_KEY=<votre anon key>
   ```
   (Un exemple est fourni dans `.env.example`.)

## 3. Installer le client
```bash
cd emploica
npm install
```
Le package `@supabase/supabase-js` a été ajouté aux dépendances.

## 4. Intégrer dans le code
Le client est disponible dans `src/lib/supabase.ts` :
```ts
import { supabase } from "./lib/supabase";
```
Pour migrer le store actuel (localStorage) vers Supabase, remplacez les appels `patch`/`update`/`remove` par des appels Supabase (insert/select/update/delete) et utilisez `supabase.auth` pour l'authentification.

## 5. Authentification
- Activez **Email/Password** dans **Authentication** → **Providers**.
- Pour le téléphone (OTP), activez le provider **Phone** et configurez un fournisseur SMS.

## 6. Storage (photos de profil)
Créez un bucket `avatars` dans **Storage** et configurez les politiques RLS pour l'upload.

## 7. Realtime
Les subscriptions temps réel sont disponibles via `supabase.channel(...)` pour la messagerie et les notifications.