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
- [ ] employers (structure seule)
- [x] applications
- [x] admin
- [x] dashboard
- [ ] auth
- [ ] layout / common / pages légales
- [ ] App.tsx (par petits morceaux)
- [ ] store.ts

## Étapes suivantes
- [ ] étape B (extraction de la logique : OffersView, EmployerHome, ProfileView à scinder, Header.switchMode)
- [ ] dédoublonnage, un doublon à la fois
- [ ] règle ESLint no-restricted-imports + vérification des cycles
- [ ] en-têtes sur tous les fichiers
- [ ] ARCHITECTURE.md, README par domaine, AGENTS.md
- [ ] récapitulatif final

## Vérifications (dernier domaine : seekers)
- Build : ✅
- Tests : ✅ 4/4
- tsc : 23 erreurs (toutes pré-existantes, 0 nouvelle)
- git grep "Ã" : 0
- ESLint : 83 problèmes (81 erreurs, 2 avertissements) — identique au départ

## TODO techniques
- `src/features/jobs/components/OfferCard.tsx:55` : `(offer as any).verification` — `Offer` n'a pas de champ `verification` (à typer proprement lors de l'étape B). Commentaire `// TODO: type Offer sans champ verification` ajouté.
## Bugs découverts (à traiter après la restructuration)
1. `OffersView:83` insère `status: "envoyee"` (sans accent) dans Supabase alors que le type `ApplicationStatus` et `STATUS_LABELS` attendent `"envoyée"` (accentué) → mauvais badge. Ne pas corriger maintenant.
2. `AdminPanel` : toutes les actions de modération sont locales (store + localStorage), non persistées dans Supabase ; elles disparaissent au rechargement.
3. Les notes (ratings) et la modification de profil ne sont enregistrées qu'en localStorage, pas dans Supabase.

