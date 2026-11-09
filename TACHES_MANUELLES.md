# Taches manuelles Workca

Etat au 9 novembre 2026. Le code corrige est sur `main` et `restructuration`, commit `9559566`. Les tests locaux, le build et les migrations ont ete verifies. Le projet Supabase de test (`kyssjkzxvwwnapffphxd`) et le projet de production (`vmmvniqdxnvpkmqhrbxb`) possedent maintenant les colonnes de roles, d'offres et de candidatures necessaires.

## A faire dans Vercel

1. Ouvrir le projet Vercel Workca et verifier que la branche de production est `main`.
2. Verifier `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans les variables de production. Elles doivent pointer vers `vmmvniqdxnvpkmqhrbxb`.
3. Relancer un deploiement depuis le commit `9559566` si le domaine affiche encore l'ancienne version.
4. Ouvrir le preview de `restructuration` et verifier que son URL utilise le projet Supabase de test avant de faire des essais de donnees.

## A faire dans Supabase Auth

1. Dans Authentication > Email, activer la confirmation email.
2. Verifier que le modele de confirmation contient le lien de verification Supabase.
3. Verifier que l'URL de redirection autorisee contient les domaines preview et production ainsi que `/reset-password`.
4. Tester un vrai email d'inscription, le bouton de renvoi du code et le lien Mot de passe oublie.

## A faire pour Telegram

1. Confirmer que `https://t.me/workca_cm` est bien le lien direct du canal. Si le nom reel est different, modifier l'unique constante `LIEN_CANAL_TELEGRAM` dans `emploica/src/config/canaux.ts`.
2. Dans les secrets Edge Functions de chaque projet Supabase, renseigner `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID` et `WORKCA_APP_URL`.
3. Ajouter le bot comme administrateur du canal avec le droit de publier.
4. Tester l'envoi dans un canal prive de test avant tout envoi dans le canal public.

## Verification fonctionnelle a faire

1. Creer un compte chercheur, confirmer le code email, puis recharger la page.
2. Utiliser Mot de passe oublie et choisir un nouveau mot de passe.
3. Creer un profil recruteur individuel puis un profil entreprise avec le meme compte.
4. Basculer entre chercheur, employeur et entreprise sans creer un second compte.
5. Publier une offre avec titre, categorie, competences, lieu, contrat, CV obligatoire et email de contact.
6. Verifier que l'offre reste presente apres rechargement et apparait dans Offres et Mes offres.
7. Postuler avec un message et un CV, puis verifier le statut cote chercheur et la candidature cote employeur. Refaire la meme action doit etre refusee.
8. Ouvrir les menus, faire defiler une page longue et verifier que les barres haut et bas restent opaques et que le contenu ne passe pas dessous.
9. Ouvrir Telegram depuis le bouton du canal et verifier qu'il arrive sur le canal, pas sur la page generale de l'application.

## Ce qui reste hors du code

- Les emails reels et les secrets Telegram ne peuvent pas etre testes sans vos comptes.
- Le domaine Vercel et ses variables doivent etre verifies dans votre tableau de bord.
- Le canal Telegram et le bot doivent etre confirmes manuellement pour eviter un envoi vers un mauvais canal.
