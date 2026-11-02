# MIGRATION_STATUS

Suivi de la restructuration par domaines.

## Règle après chaque domaine
- `npm run build` ✅
- `npm test` ✅
- `npx tsc -p tsconfig.app.json --noEmit` (erreurs = 23, toutes pré-existantes)
- `git grep "Ã"` = 0

## Domaines
- [x] settings — commit `91c32e2`
- [x] search — commit `a8b54d6` 
- [x] favorites — commit `eecf187`
- [x] notifications — commit `f25f38c`
- [x] messaging — commit `ff2372c`
- [x] ratings — commit `f97c05e`
- [x] jobs (étape A) — commit `33f8c05`
- [x] seekers — commit `d70b16e` (+ corrections `26438fa`, `037ae16`, `9abe3e1`)
- [x] employers (structure seule) — aucun nouveau déplacement (hooks, types, index déjà en place)
- [x] applications
- [x] admin
- [x] dashboard
- [x] auth
- [x] layout / common / pages légales — commit `1b48b99`
- [ ] App.tsx (par petits morceaux)
  - [x] routes → `src/app/routes.tsx` (commit `4b6188d`, morceau 1/7)
  - [ ] providers (StoreProvider, Suspense, Toaster)
  - [ ] session (restauration Supabase)
  - [ ] chargement initial (useEffect Promise.all)
  - [ ] createOffer
  - [ ] boostOffer
  - [ ] addRating
- [ ] store.ts

## Étapes suivantes
- [ ] étape B (extraction de la logique : OffersView, EmployerHome, ProfileView à scinder, Header.switchMode)
- [ ] dédoublonnage, un doublon à la fois
- [ ] règle ESLint no-restricted-imports + vérification des cycles
- [ ] en-têtes sur tous les fichiers
- [ ] ARCHITECTURE.md, README par domaine, AGENTS.md
- [ ] récapitulatif final

## Refonte des interfaces Workca
- [x] étape 5 — entreprises qui recrutent sur l'accueil (données Supabase)
- [x] étape 11 — page publique d'entreprise, liens depuis les offres et suivi Supabase
- [ ] appliquer la migration `011_employer_follows.sql` au projet Supabase

## Vérifications (dernier domaine : phase 7, morceau 1 routes — commit `4b6188d`)
- Build : ✅
- Tests : ✅ 4/4
- tsc : 23 erreurs (toutes pré-existantes, 0 nouvelle) — même liste qu'avant, numéros de ligne légèrement déplacés suite à suppression de ~30 lignes dans App.tsx
- git grep "Ã" : 0
- ESLint : 83 problèmes (81 erreurs, 2 avertissements) — identique au départ

### Comparaison tsc : départ vs après morceau 1
Aucune erreur n'a été ajoutée ni supprimée. Les 23 erreurs pré-existantes sont identiques (codes et messages), seules les numéros de ligne de `src/App.tsx` ont légèrement changé (suppression de `PROTECTED_ROUTES` et `RequireAuth`).
- `src/App.tsx` : TS2345 User[] incompatibilité (ligne 178→135), TS2345 EmployerProfile[] incompatibilité (ligne 212→169)
- `src/components/layout/Header.tsx` : TS2322 Badge size/showText
- `src/components/ui/aspect-ratio.tsx` : TS2307 module @radix-ui/react-aspect-ratio
- `src/features/admin/components/AdminPanel.tsx` : TS2345 Offer[]×2, User[], Signalement[], EmployerProfile[], TS2304 'patch'
- `src/features/applications/components/SeekerApplicationsView.tsx` : TS2339 'orgName', TS2322 Badge variant
- `src/features/auth/components/AuthPage.tsx` : TS2339 'role', TS1196 catch clause
- `src/features/auth/components/LoginView.tsx` : TS2322 Badge size/showText
- `src/lib/store.ts` : TS2536/TS2488/TS2339 ×5 indexation StoreState
- `src/tests/application.test.tsx` : TS2322 currentUser type


## Phase 6 (employers) — structure seule, aucun déplacement supplémentaire
- `features/employers/` : `index.ts`, `types.ts` (ré-exporte `EmployerProfile`), `hooks/useEmployerProfiles.ts` (NON UTILISÉ), `services/` — déjà en place depuis la phase seekers.
- Aucun nouveau fichier déplacé ; domaine considéré comme terminé.

## TODO techniques
- `src/features/jobs/components/OfferCard.tsx:55` : `(offer as any).verification` — `Offer` n'a pas de champ `verification` (à typer proprement lors de l'étape B). Commentaire `// TODO: type Offer sans champ verification` ajouté.

## Bugs découverts (à traiter après la restructuration)
1. `OffersView:83` insère `status: "envoyee"` (sans accent) dans Supabase alors que le type `ApplicationStatus` et `STATUS_LABELS` attendent `"envoyée"` (accentué) → mauvais badge. Ne pas corriger maintenant.
2. `AdminPanel` : toutes les actions de modération sont locales (store + localStorage), non persistées dans Supabase ; elles disparaissent au rechargement.
3. Les notes (ratings) et la modification de profil ne sont enregistrées qu'en localStorage, pas dans Supabase.
