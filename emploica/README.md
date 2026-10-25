# workca

Plateforme numérique de mise en relation entre chercheurs d'emploi et employeurs au Cameroun, basée sur le cahier des charges fonctionnel/technique (MINEFOP / Auto-Entrepreneuriat).

## Fonctionnalités (MVP)
- Inscription/connexion (3 comptes démo : chercheur, employeur, admin)
- Profils travailleur et employeur (compétences, localisation, disponibilité)
- Publication d'offres par catégorie (12 catégories) avec modération a priori
- Recherche par catégorie, région/ville/quartier, contrat
- Candidatures avec suivi de statut
- Messagerie intégrée entre candidat et employeur
- Panel d'administration : modération des offres, signalements, utilisateurs
- Interface bilingue FR/EN
- Règles anti-arnaque affichées en bas de page

## Prérequis
- Node.js >= 20

## Installation
```bash
npm install
```

## Développement
```bash
npm run dev
```
Accessible sur `http://localhost:3000`.

## Comptes démo
- Paul Mbarga (chercheur) : `+237 600000001` / `demo123`
- Mamadou Diallo (employeur) : `+237 600000002` / `demo123`
- Admin Plateforme : `+237 600000000` / `demo123`

## Build
```bash
npm run build
```

## Licence
MIT