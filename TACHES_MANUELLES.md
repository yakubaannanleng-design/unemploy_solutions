# Point de contrôle Workca — étape 18 et migrations

État vérifié le 4 novembre 2026. Aucune écriture, suppression ou modification n'a été effectuée dans Supabase. Aucun commit ni push n'a été effectué.

## Résultats vérifiables depuis le projet

- `npm test` : **réussi**, 25 fichiers de tests, 52 tests.
- `npm run typecheck` : **réussi**, `tsc --noEmit`, code de sortie 0.
- `npm run build` : **réussi**, Vite 5.4.21, 2 800 modules, build terminé.
- Lint ciblé : **réussi**, ESLint sans erreur sur les fichiers concernés par l'étape 18 et l'approbation des offres.
- `git diff --check` : **réussi**, aucune erreur d'espacement.
- `.env` et `.env.local` sont ignorés par Git via les règles `.env` et `.env.local` de `emploica/.gitignore`.
- Aucun motif connu de jeton Bot Telegram ou d'affectation de clé `service_role` n'a été trouvé dans le code examiné ni dans les 251 commits accessibles. C'est une recherche par motifs, pas une preuve mathématique d'absence de tout secret imaginable ; les valeurs détectées n'ont pas été affichées.
- `supabase/functions/publier-telegram` lit ses valeurs sensibles avec `Deno.env.get`; aucun jeton n'est codé en dur.
- La migration 016 protège l'approbation côté base : `review_offer` est `SECURITY DEFINER`, exige un utilisateur authentifié dont le rôle Supabase est `admin`, et un trigger refuse une transition vers `publiee` lorsqu'elle ne vient pas d'un administrateur ou du rôle de service. Cette protection ne dépend donc pas uniquement de l'interface.
- Les fichiers `public/workca-photo-canaux.png`, les URL des canaux fournies, l'icône et les métadonnées de partage sont maintenant reliés au projet.

### État d'application des migrations

**Pour toutes les migrations, le statut dans l'historique Supabase est impossible à vérifier depuis cet environnement** : la CLI Supabase et l'accès administrateur à l'historique des migrations ne sont pas disponibles. Les réponses REST ci-dessous sont des lectures `GET` avec `limit=0`; elles décrivent l'exposition ou la présence de quelques objets, et ne prouvent pas qu'un fichier de migration précis a été appliqué intégralement. En particulier, un objet peut être absent de l'API REST parce qu'il n'est pas exposé ou que le cache de schéma n'est pas actualisé.

| Migration | Objet principal déclaré par le fichier local | Statut | Observation en lecture seule |
|---|---|---|---|
| `001_initial_schema.sql` | Schéma initial : comptes, profils, offres, candidatures, messages et autres tables | **impossible à vérifier** | Aucun historique de migrations consultable. |
| `002_profile_photo_rls.sql` | Bucket avatars et politiques Storage des photos | **impossible à vérifier** | Les politiques Storage ne sont pas vérifiables avec les lectures REST effectuées. |
| `003_rls_policies.sql` | Politiques RLS initiales des tables métier | **impossible à vérifier** | Les réponses REST ne prouvent pas le contenu des politiques. |
| `004_offer_search_filters.sql` | Colonnes et index des filtres d'offres | **impossible à vérifier** | Aucun relevé complet de `information_schema` ou des migrations. |
| `005_filled_offers.sql` | Gestion des postes pourvus, date de clôture et notification associée | **impossible à vérifier** | Les fonctions, triggers et politiques ne sont pas vérifiables par les probes REST exécutées. |
| `006_employer_company_profile.sql` | Champs complémentaires du profil entreprise | **impossible à vérifier** | Aucun historique de migrations consultable. |
| `007_employer_monthly_views.sql` | Table `offer_views` et accès aux vues mensuelles | **impossible à vérifier** | `GET offer_views?select=id&limit=0` a répondu HTTP 404 ; cela ne prouve pas si la migration manque ou si l'objet n'est pas exposé. |
| `008_offer_publication_contact.sql` | Champs de contact et indicateur `share_telegram` | **impossible à vérifier** | Le GET `offers?select=share_telegram&limit=0` a répondu HTTP 400 avec « column offers.share_telegram does not exist » : la colonne n'est pas disponible dans l'API interrogée. |
| `009_expired_offer_status.sql` | Statut d'offre expirée | **impossible à vérifier** | Les types PostgreSQL ne sont pas vérifiés par les probes REST. |
| `010_employer_offer_management.sql` | Expiration, clôture et identifiant de message Telegram | **impossible à vérifier** | Le GET ciblant `telegram_message_id` a répondu HTTP 400 ; l'état exact de cette migration ne peut pas être établi. |
| `011_employer_follows.sql` | Table de suivi des entreprises, RLS et notifications | **impossible à vérifier** | `GET employer_follows?select=follower_id&limit=0` a répondu HTTP 404 ; l'exposition REST ne constitue pas un historique de migration. |
| `012_application_candidate_review.sql` | CV privé, champs de profil et revue des candidatures | **impossible à vérifier** | Le GET des colonnes `education` et `cv_url` sur `seeker_profiles` a répondu HTTP 400 ; les autres changements de sécurité restent inconnus. |
| `013_job_alerts.sql` | Table et politiques RLS des alertes emploi | **impossible à vérifier** | `GET job_alerts?select=id&limit=0` a répondu HTTP 404 ; l'exposition REST ne constitue pas un historique de migration. |
| `014_notification_read_status.sql` | Politique de mise à jour des notifications propres à l'utilisateur | **impossible à vérifier** | `notifications.read` répond HTTP 200, mais cela ne démontre ni l'application de cette migration ni sa politique RLS. |
| `015_message_read_status.sql` | Politiques d'envoi et de lecture des messages | **impossible à vérifier** | `messages.status` répond HTTP 200, mais cela ne démontre ni l'application de cette migration ni ses politiques RLS. |
| `016_secure_offer_review_and_telegram.sql` | Revue administrateur, transition d'approbation protégée et lecture admin des offres | **impossible à vérifier** | Le code local contient la protection ; aucune lecture Supabase ne permet de prouver que le SQL est appliqué en production. |

## Liste A — Ce que l'assistant peut faire depuis le projet

- [x] Vérifier les tests, le typecheck, le build, le lint ciblé et l'état de whitespace.
- [x] Examiner les fichiers locaux des migrations, la fonction Edge, `.gitignore`, le code et l'historique Git sans afficher de valeur secrète.
- [x] Relier les URL reçues dans `emploica/src/config/canaux.ts`.
- [x] Remplacer l'ancienne icône du site par `emploica/public/workca-photo-canaux.png` dans le favicon, l'icône iOS et les métadonnées de partage. L'ancien fichier `logo_app.jpeg` n'a pas été supprimé.
- [x] Rédiger cette liste de contrôle, avec les opérations de production réservées à la propriétaire du compte.
- [x] Refaire les validations locales après les changements de liens et d'icône.

## Liste B — Actions nécessitant votre compte, appareil ou confirmation

Suivre l'ordre ci-dessous. **Ne pas exécuter une migration au hasard** : identifier d'abord celles qui sont réellement absentes. Une migration SQL peut modifier la base, les règles d'accès, le stockage et les données existantes.

### 1. Vérifier l'historique des migrations — lecture seule

**Pourquoi :** c'est le moyen fiable de distinguer les fichiers déjà appliqués de ceux qui restent à appliquer, si ce projet utilise le registre Supabase standard.

1. Ouvrez [Supabase Dashboard](https://supabase.com/dashboard/project/vmmvniqdxnvpkmqhrbxb).
2. Dans le menu gauche, ouvrez **SQL Editor**, puis **New query**.
3. Copiez-collez et exécutez cette requête, qui ne lit que l'historique :

   ```sql
   select version, name
   from supabase_migrations.schema_migrations
   order by version;
   ```

4. Comparez les versions affichées aux fichiers `001` à `016` dans `emploica/supabase/migrations`.
5. Si le schéma ou la table `supabase_migrations.schema_migrations` n'existe pas, **arrêtez-vous** : n'exécutez pas toute la série. Ce projet a peut-être été initialisé manuellement ; demandez à l'administrateur de la base de comparer le schéma et les politiques avec les fichiers avant toute application.

**Réussi si :** vous avez une liste fiable des versions appliquées et des versions manquantes. La requête échoue si le registre n'existe pas ou si votre compte n'y a pas accès ; ne transformez pas cet échec en preuve que toutes les migrations sont en attente.

### 2. Sauvegarder puis appliquer uniquement les migrations manquantes

**Pourquoi :** les étapes 18 et les évolutions précédentes dépendent de colonnes, fonctions et règles RLS. Les probes ont notamment constaté que `offers.share_telegram` n'est pas disponible dans l'API actuelle. Il faut d'abord valider le processus en préproduction, sans toucher à la production.

1. Dans [Supabase Dashboard](https://supabase.com/dashboard), choisissez la bonne organisation puis **New project**.
2. Créez un projet de préproduction (par exemple `workca-staging`), avec un mot de passe de base unique conservé dans votre gestionnaire de mots de passe et la région appropriée. Ne réutilisez pas le mot de passe de production.
3. Dans le projet de préproduction, ouvrez **SQL Editor → New query**. Sur un projet neuf, exécutez chaque migration `001` à `016` dans l'ordre numérique, une par une. Copiez le contenu depuis `emploica/supabase/migrations/` et vérifiez le résultat après chaque exécution.
4. Si le projet de préproduction contient déjà des tables, commencez par l'étape 1 (historique des migrations) et ne jouez que les versions dont l'absence est confirmée. Si l'historique est absent, faites comparer le schéma avant toute exécution.
5. Si une migration échoue, arrêtez-vous ; gardez le message d'erreur et ne relancez pas aveuglément le SQL, qui peut avoir été partiellement exécuté.
6. Ne faites aucun changement en production à cette étape. La préparation de production est décrite à l'étape 7, après le test de préproduction.
7. Ne supprimez ni ne recréez aucune table pour faire disparaître une erreur. Demandez à l'administrateur de la base de vérifier le schéma et les politiques si une migration ne s'applique pas proprement.

**À copier-coller :** le SQL du fichier précis confirmé manquant, dans **SQL Editor → New query**. Ne copiez aucune clé API ni aucun jeton dans le SQL Editor.

**Réussi si :** chaque requête se termine sans erreur et le registre contient chaque version après exécution dans l'environnement correspondant. La migration 016 doit créer `review_offer` et les triggers de protection.

### 3. Vérifier ou créer le canal Telegram et le bot

**Pourquoi :** la fonction a besoin d'un bot autorisé à écrire dans le canal. Le jeton du bot est un secret.

1. Dans WhatsApp sur votre téléphone, ouvrez **Mises à jour → + → Créer une chaîne** si le canal Workca n'existe pas déjà. Donnez-lui le nom et la description voulus, puis ouvrez **Partager le lien**.
2. Comparez le lien affiché avec celui déjà configuré dans `emploica/src/config/canaux.ts`. S'il est différent, remplacez `LIEN_CANAL_WHATSAPP` par le lien de partage officiel (sans le publier dans cette conversation).
3. Dans Telegram, créez un canal privé de test via **Nouveau message → Nouveau canal** (ou **Menu → Nouveau canal**, selon l'appareil). Ce canal sert à vérifier l'envoi sans publier un test dans le canal public Workca.
4. Ouvrez **@BotFather** et utilisez **/newbot** si vous n'avez pas déjà de bot dédié à Workca. Suivez ses questions ; copiez le jeton uniquement pour le saisir directement dans les secrets Supabase à l'étape suivante. **Ne le publiez pas ici, dans Git, dans un ticket ou dans un fichier du projet.**
5. Dans le canal privé de test, ouvrez **Gérer le canal → Administrateurs → Ajouter un administrateur**. Sélectionnez le bot et autorisez-le à publier des messages.
6. Relevez l'identifiant du canal privé ; il commence généralement par `-100`. Si vous avez aussi créé le canal public Workca, ajoutez le bot comme administrateur seulement au moment de la mise en service.
7. Vérifiez le lien fourni `https://t.me/boost/workca_cm` dans Telegram. Le chemin `/boost/` peut ouvrir une page de boost plutôt que la page normale pour suivre le canal. Si ce n'est pas le lien de suivi attendu, remplacez la constante `LIEN_CANAL_TELEGRAM` par le vrai lien public/invitation du canal.

**Réussi si :** les deux liens ouvrent les canaux Workca souhaités, le bot apparaît comme administrateur du canal Telegram avec le droit de publier. Si BotFather ne retourne plus le jeton ou si celui-ci a été partagé publiquement, révoquez-le avec BotFather et utilisez le nouveau jeton.

### 4. Enregistrer les secrets de la fonction dans Supabase

**Pourquoi :** le jeton du bot, le canal cible et l'URL de l'application doivent être disponibles au serveur sans apparaître dans le navigateur ou le dépôt.

1. Dans le Dashboard du projet **de préproduction**, ouvrez **Edge Functions → Secrets** (selon la version du Dashboard : **Project Settings → Edge Functions → Secrets**).
2. Ajoutez ces trois secrets, un par un, en visant le canal privé de test :
   - Nom : `TELEGRAM_BOT_TOKEN` — valeur : le jeton copié directement depuis BotFather.
   - Nom : `TELEGRAM_CHANNEL_ID` — valeur : l'identifiant numérique du canal privé de test.
   - Nom : `WORKCA_APP_URL` — valeur : `http://localhost:3001` pour le test local ou l'adresse de l'application de préproduction, sans chemin de page.
3. Enregistrez chaque entrée dans Supabase. N'ajoutez pas de guillemets autour de la valeur.
4. Répétez cette configuration pour la production seulement après que le test en préproduction est réussi ; utilisez alors le canal public Workca et l'adresse HTTPS publique.
5. Ne copiez pas le jeton dans cette conversation, `.env`, `.env.local`, un fichier SQL, ou un fichier versionné.

**Réussi si :** les trois noms apparaissent dans la liste des secrets Edge Functions ; le Dashboard ne montre généralement plus leur valeur après enregistrement.

### 5. Installer les outils et déployer la fonction Edge

**Pourquoi :** le projet local contient la fonction, mais elle n'est pas déployée. Le déploiement ne doit avoir lieu qu'après la migration 016 et la configuration des secrets.

1. Vérifiez d'abord que les étapes précédentes sont terminées **dans le projet de préproduction** :
   - la migration 016 corrigée s'y est exécutée sans erreur ;
   - les trois secrets de l'étape 4 y sont enregistrés ;
   - le bot est administrateur du canal Telegram privé de test et peut y publier.
   Si l'un de ces points n'est pas confirmé, arrêtez-vous et ne déployez pas.
2. Installez la **Supabase CLI** sur Windows avec Scoop. Si Scoop n'est pas installé, suivez d'abord les instructions de son site officiel (`https://scoop.sh/`), puis ouvrez un nouveau PowerShell et exécutez :

   ```powershell
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

   Deno n'est pas nécessaire pour envoyer la fonction au projet Supabase. Il est utile pour des vérifications locales ; vous pouvez l'installer depuis le site officiel `https://deno.com/` et ouvrir un nouveau PowerShell après l'installation.
3. Vérifiez les outils installés :

   ```powershell
   supabase --version
   deno --version
   ```

   Si vous n'avez pas installé Deno, ignorez uniquement `deno --version`. Si `supabase` n'est pas reconnu, fermez puis rouvrez PowerShell ; si l'erreur persiste, vérifiez l'installation de Scoop et son `PATH` avant de continuer.
4. Dans un nouveau PowerShell, placez-vous dans le dossier de l'application et connectez la CLI à votre compte :

   ```powershell
   cd F:\Mes_Projets\unemploy_solutions\emploica
   supabase login
   ```

   `supabase login` ouvre normalement une page du navigateur. Connectez-vous au compte qui a accès au projet de préproduction et autorisez la CLI. Ne partagez jamais le jeton de connexion ou une capture qui le révèle.
5. Trouvez la référence du **projet de préproduction** dans le Dashboard (adresse du projet ou **Project Settings → General → Reference ID**). Vous pouvez aussi afficher les projets accessibles avec `supabase projects list`, puis comparer le nom et la référence avec le Dashboard. N'utilisez pas la référence de production.
6. Saisissez explicitement cette référence dans PowerShell et liez le dossier local au projet de préproduction :

   ```powershell
   $refTest = Read-Host "Collez ici la référence du projet de préproduction"
   if ([string]::IsNullOrWhiteSpace($refTest)) { throw "Référence vide : arrêt sans déploiement." }
   supabase link --project-ref $refTest
   ```

   Si la CLI demande le mot de passe de la base, saisissez-le uniquement dans l'invite locale de la CLI ; ne l'inscrivez pas dans une commande, un fichier ou cette conversation. La commande `link` associe le dossier local au projet ; elle n'applique pas les migrations et ne modifie pas les données.
7. Avant le déploiement, relisez `$refTest` et confirmez une dernière fois dans le Dashboard qu'il s'agit bien de la préproduction. Vérifiez aussi que le fichier de configuration et le code de la fonction sont présents :

   ```powershell
   Write-Host "Projet ciblé : $refTest"
   Test-Path .\supabase\config.toml
   Test-Path .\supabase\functions\publier-telegram\index.ts
   ```

   Les deux commandes `Test-Path` doivent afficher `True`. En cas de référence incorrecte ou de fichier absent, arrêtez-vous.
8. Déployez la fonction en indiquant explicitement la référence de préproduction :

   ```powershell
   supabase functions deploy publier-telegram --project-ref $refTest
   ```

   Ne changez pas cette commande pour y ajouter un jeton, une clé API ou une valeur secrète.
9. Si la commande échoue, arrêtez-vous et conservez le message d'erreur en masquant tout jeton ou valeur secrète éventuelle. N'installez Docker que si l'erreur de la CLI le demande explicitement ; dans ce cas, installez Docker Desktop depuis son site officiel, démarrez-le, puis réessayez la même commande.
10. Ne déployez pas sur le projet de production. Son déploiement est décrit à l'étape 7, après validation complète de la préproduction.

**Réussi si :** la CLI confirme le déploiement de `publier-telegram` et le Dashboard de préproduction affiche cette fonction. Cela confirme le déploiement, pas encore l'envoi Telegram : effectuez ensuite le test contrôlé de l'étape 6. Si la compilation échoue, ne changez pas les secrets pour contourner l'erreur ; arrêtez-vous et faites vérifier le message.

### 6. Tester sans publier dans le canal public

**Pourquoi :** une approbation avec le partage Telegram activé envoie réellement un message dans le canal cible.

1. Dans `emploica/.env.local` (fichier ignoré par Git), saisissez l'URL Supabase de préproduction et sa clé `anon` publique obtenues dans **Project Settings → API**, au format suivant. Remplacez les deux valeurs entre chevrons sur votre ordinateur ; ne les envoyez pas dans cette conversation. Ne remplacez pas `.env` de production.

   ```dotenv
   VITE_SUPABASE_URL=<URL_DU_PROJET_DE_PREPRODUCTION>
   VITE_SUPABASE_ANON_KEY=<CLE_ANON_DU_PROJET_DE_PREPRODUCTION>
   ```

2. Démarrez le site depuis le dossier `emploica` avec `npm run dev`, puis ouvrez `http://localhost:3001`.
3. Connectez-vous avec un compte de préproduction ayant le rôle administrateur. Si aucun compte admin de test n'existe, demandez à l'administrateur de la base de le provisionner **dans la préproduction seulement**.
4. Dans cette préproduction, créez une offre de test avec **Partager aussi sur Telegram** activé, puis approuvez-la.
5. Vérifiez qu'un seul message apparaît dans le canal privé, qu'il contient le titre et le lien de l'offre, et que `telegram_message_id` est enregistré.
6. Testez aussi le refus d'une offre et vérifiez qu'elle n'est pas envoyée. Une offre en attente ne doit jamais être envoyée.
7. Testez une nouvelle tentative depuis **Mes offres** après un échec temporaire.

**Réussi si :** les offres approuvées sont publiées une seule fois, les refus et les offres en attente ne le sont pas, et le bouton de nouvelle tentative affiche clairement les erreurs.

**Attention :** ne faites pas ce test dans le canal public ou la base de production sans accepter explicitement qu'une véritable annonce y soit publiée. Le test écrit une offre et son identifiant de message en base.

### 7. Préparer la mise en production — seulement après le test de préproduction

**Pourquoi :** les politiques, les secrets et la fonction doivent être prêts dans le projet réel, mais seulement après validation dans un environnement de test.

1. Confirmez à nouveau la référence du projet de production : `vmmvniqdxnvpkmqhrbxb`. Dans son Dashboard, ouvrez **Database → Backups** et vérifiez une sauvegarde récente.
2. À partir du registre vérifié à l'étape 1, exécutez uniquement les migrations de production manquantes en suivant les consignes de l'étape 2. Vérifiez le registre et les résultats SQL. Si l'historique ne permet pas de confirmer une version, arrêtez-vous et demandez une comparaison du schéma à l'administrateur.
3. Dans **Edge Functions → Secrets** du projet de production, configurez `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID` et `WORKCA_APP_URL`. Pour `TELEGRAM_CHANNEL_ID`, utilisez le vrai canal public Workca, pas le canal de test.
4. Si nécessaire, donnez au bot le droit de publier sur le canal public Telegram. Vérifiez avant que le lien d'abonnement Workca soit bien le bon et pas seulement un lien de boost.
5. Dans PowerShell, liez la CLI au projet dont la référence a été confirmée, puis déployez :

   ```powershell
   cd F:\Mes_Projets\unemploy_solutions\emploica
   supabase link --project-ref vmmvniqdxnvpkmqhrbxb
   supabase functions deploy publier-telegram --project-ref vmmvniqdxnvpkmqhrbxb
   ```

6. Ne créez pas d'offre factice pour tester sur le canal public : l'approbation enverrait une vraie annonce et écrirait dans la base de production. Le test d'envoi doit d'abord avoir réussi sur le canal privé de préproduction.

**Réussi si :** le registre de production contient les migrations requises, les secrets sont configurés dans le projet correct, et la CLI confirme le déploiement de la fonction dans cette même référence.

### 8. Commit et push — après votre revue seulement

**Pourquoi :** les changements locaux ne sont pas encore sur GitHub ; le commit et le push nécessitent votre décision. Ils ne sont pas faits dans le cadre de ce point de contrôle.

1. Dans VS Code, ouvrez **Source Control** et examinez chaque fichier modifié, y compris les travaux précédents encore présents dans le dépôt.
2. Ne sélectionnez que les changements que vous souhaitez publier ; ne faites pas automatiquement **Stage All** si vous ne voulez pas inclure les travaux des étapes précédentes.
3. Après revue, le message proposé pour l'ensemble cohérent des changements est :

   ```text
   feat(workca): complete channels and secure Telegram publishing
   ```

4. Créez le commit, puis poussez la branche avec le bouton **Sync Changes** ou **Push** de VS Code.

**Réussi si :** le commit apparaît dans l'historique Git et la branche distante affiche les mêmes changements. Ne poussez pas de secrets ; vérifiez les fichiers staged avant le commit.

## Fichiers changés par ce point de contrôle

- `TACHES_MANUELLES.md` (ce fichier)
- `emploica/src/config/canaux.ts`
- `emploica/index.html`

L'image `emploica/public/workca-photo-canaux.png` existait déjà dans `public/`; elle est maintenant utilisée comme icône et image de partage. Le worktree contient aussi des modifications locales antérieures aux étapes 12 à 18, notamment des migrations, des composants et des tests. Elles n'ont pas été annulées, commitées ni poussées.

## Risques à connaître avant mise en ligne

- Les migrations SQL et leurs politiques RLS n'ont pas été appliquées ni vérifiées sur la base de production.
- La fonction Edge n'a pas été déployée ni testée sur Telegram ; aucun envoi réel n'a été effectué par ce contrôle.
- Le lien Telegram fourni contient `/boost/` et pourrait ne pas être le lien de suivi du canal.
- Le secret Bot Telegram et l'identifiant cible doivent être configurés exactement dans les secrets Supabase ; ne pas les mettre dans le code.
- Une erreur après l'envoi Telegram mais avant l'enregistrement du `message_id` peut nécessiter une vérification manuelle du canal avant une nouvelle tentative, pour éviter un doublon.
- Le rôle administrateur doit être correctement configuré dans la table `users`; la migration 016 et ses effets n'ont pas encore été testés sur la base réelle.
- Les modifications locales, incluant des travaux plus anciens, ne sont pas encore publiées sur GitHub.
