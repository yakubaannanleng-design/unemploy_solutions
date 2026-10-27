# Configuration Supabase — Workca

## 1. Exécuter le schéma SQL
1. Ouvrez votre projet Supabase : https://supabase.com/dashboard/project/vmmvniqdxnvpkmqhrbxb
2. Allez dans **SQL Editor** → **New query**.
3. Copiez le contenu de `supabase/migrations/001_initial_schema.sql` et exécutez-le.
4. Vérifiez dans **Table Editor** que les tables sont créées.

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