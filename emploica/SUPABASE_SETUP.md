# Configuration Supabase — Workca

## 1. Exécuter le schéma SQL
Pour les premiers essais, utilisez exclusivement le projet isolé **workca-test** :
https://supabase.com/dashboard/project/kyssjkzxvwwnapffphxd

N'appliquez pas ces migrations au projet actif de production pour effectuer les tests amis. Dans le projet test, ouvrez **SQL Editor** et exécutez les migrations disponibles de `supabase/migrations/` dans l'ordre numérique (`001` à `016`). Vérifiez ensuite les tables et politiques RLS dans le dashboard avant de connecter l'application. Les migrations peuvent contenir des changements de schéma; contrôlez leur état projet par projet.

La migration `004_offer_search_filters.sql` ajoute les champs structurés utilisés par les filtres détaillés d'offres. Elle doit être appliquée aux projets Supabase déjà initialisés avant d'utiliser ces filtres.

La migration `005_filled_offers.sql` ajoute la date de clôture des offres pourvues, la fenêtre de visibilité de sept jours, les notifications aux candidats ayant postulé ou enregistré l'offre, et l'accès RLS nécessaire aux détails partagés. Elle doit être appliquée après la migration 004.

La migration `006_employer_company_profile.sql` ajoute le secteur, la ville et le logo facultatif au profil d'entreprise, utilisés par l'étape de création du profil employeur.

La migration `007_employer_monthly_views.sql` enregistre une vue par compte et par offre chaque jour, afin de calculer les vues mensuelles du tableau de bord employeur. Elle doit être appliquée après les migrations 004 à 006.

La migration `008_offer_publication_contact.sql` ajoute à chaque offre le canal de contact choisi et l'option de partage Telegram. Les offres créées avant cette migration conservent leurs options de contact existantes.

La migration `009_expired_offer_status.sql` ajoute le statut d'offre expirée. La migration `010_employer_offer_management.sql` bloque les candidatures sur les offres clôturées ou expirées et planifie leur expiration toutes les quinze minutes avec `pg_cron`.

La migration `011_employer_follows.sql` ajoute le suivi des entreprises, ses règles RLS et les notifications envoyées aux abonnés lorsqu'une offre est publiée. Elle doit être appliquée après les migrations précédentes.

La migration `012_application_candidate_review.sql` rend le CV persistant dans le profil chercheur, passe le bucket `cvs` en privé avec des liens signés réservés au candidat et à ses employeurs, limite la lecture des profils aux candidats ayant postulé auprès de l'employeur authentifié, supprime la possibilité pour un candidat de modifier directement le statut d'une candidature et autorise la décision de présélection/refus via une fonction SQL vérifiant la propriété de l'offre. Elle doit être appliquée après les migrations précédentes.

La migration `013_job_alerts.sql` crée les alertes emploi et leurs politiques RLS : chaque utilisateur authentifié ne peut consulter, créer, modifier ou supprimer que ses propres alertes.

La migration `014_notification_read_status.sql` permet à chaque utilisateur de marquer ses propres notifications comme lues, sans autoriser la modification de celles d'un autre compte.

La migration `015_message_read_status.sql` limite l'envoi aux participants d'une conversation et autorise son destinataire à mettre à jour uniquement le statut de lecture.

La migration `016_secure_offer_review_and_telegram.sql` protège les rôles et statuts administrateur contre les modifications de compte ordinaires, permet aux administrateurs de consulter et de modérer les offres dans Supabase, et n'autorise la publication d'une offre qu'après une décision d'administrateur.

## 8. Publication Telegram
La publication Telegram utilise uniquement la fonction Edge `publier-telegram`. Le jeton du bot, l'identifiant du canal et l'URL de l'application doivent être enregistrés dans **Project Settings → Edge Functions → Secrets** sous les noms `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID` et `WORKCA_APP_URL`. Ne les ajoutez jamais à `.env`, au code React ou à Git. Les variables Supabase `SUPABASE_URL`, `SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` sont fournies à la fonction par Supabase.

Déployez la fonction avec `supabase functions deploy publier-telegram` après avoir appliqué les migrations jusqu'à `016`. Le partage Telegram est déclenché par l'approbation d'une offre ; une offre en attente n'est jamais publiée. En cas d'échec temporaire, l'employeur peut relancer la publication depuis **Mes offres**.

Pour WhatsApp, renseignez le lien public officiel dans `src/config/canaux.ts`. L'employeur peut alors copier le message de son offre et ouvrir le canal pour la publier manuellement.

## 2. Récupérer les clés API du projet test
1. Allez dans **Project Settings** → **API**.
2. Copiez l'**URL** du projet et la clé **anon (public)**.
3. Créez un fichier `.env` à la racine de `emploica/` :
   ```
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_ANON_KEY=<votre anon key>
   ```
   (Un exemple est fourni dans `.env.example`.)

Ne copiez jamais le fichier `.env` dans Git. Pour le déploiement GitHub Pages, ajoutez ces mêmes valeurs comme secrets du dépôt `yakubaannanleng-design/unemploy_solutions`, sous **Settings → Secrets and variables → Actions** :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Le workflow échoue volontairement si ces secrets ne sont pas définis sur `main`, plutôt que de publier une version de test qui n'enregistre pas les données dans Supabase.

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
- Pour la vérification par code, laissez **Confirm email** activé et configurez le modèle **Authentication → Email Templates → Confirm signup** pour afficher `{{ .Token }}` (code à 6 chiffres), plutôt que de dépendre de `{{ .ConfirmationURL }}`. Le formulaire de l'application vérifie ce code, ouvre la session et redirige ensuite vers l'espace d'accueil du compte.
- Configurez un fournisseur SMTP pour garantir l'envoi des messages. Vérifiez le flux sur le projet de test avant d'appliquer les mêmes réglages au projet réel; ne désactivez pas la confirmation d'adresse pour contourner un problème de livraison.
- Ajoutez les URL publiques de l'application à **Authentication → URL Configuration → Redirect URLs**, notamment `https://emploica-test.vercel.app/reset-password` pour les essais et l'URL de production correspondante. Le modèle **Reset password** peut utiliser `{{ .ConfirmationURL }}`; après ouverture, la page `/reset-password` enregistre le nouveau mot de passe dans Supabase Auth.
- Pour le téléphone (OTP), activez le provider **Phone** et configurez un fournisseur SMS.

## 6. Storage (photos de profil)
Créez un bucket `avatars` dans **Storage** et configurez les politiques RLS pour l'upload.

## 7. Realtime
Les subscriptions temps réel sont disponibles via `supabase.channel(...)` pour la messagerie et les notifications.