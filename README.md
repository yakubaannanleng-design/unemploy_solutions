# Unemploy Solutions - Workca

Plateforme numérique de mise en relation entre chercheurs d'emploi et employeurs au Cameroun, basée sur le cahier des charges fonctionnel/technique (MINEFOP / Auto-Entrepreneuriat).

## Présentation du Projet

Ce dépôt contient le développement de l'application **Workca**, une solution digitale destinée à faciliter la mise en relation entre les demandeurs d'emploi et les employeurs au Cameroun. L'application vise à moderniser la recherche d'emploi, à simplifier les candidatures et à offrir un panel d'administration pour la modération.

## Structure du Dépôt

Le projet est structuré de la manière suivante :

- `emploica/` : Contient l'application frontend (développée avec Vite, React et TypeScript). C'est le cœur du projet.
- `Cahier_des_charges_emploi_Cameroun_ENRICHI (2).docx` : Document détaillant le cahier des charges fonctionnel et technique du projet.
- `logo_app.jpeg` : Logo de l'application.
- `.gitignore` : Liste des fichiers et dossiers exclus de la versioning Git (comme `node_modules`).
- `.kilo/` : Configuration de l'assistant Kilo.
- `.vite/` : Cache de l'outil de build Vite.

## Technologie Utilisée

Le frontend est développé avec les technologies suivantes :

- **Framework** : React 19 avec TypeScript
- **Build Tool** : Vite
- **Styling** : Tailwind CSS avec les composants `shadcn/ui`
- **Routing** : React Router DOM
- **State Management & Data Fetching** : TanStack Query (React Query)
- **Form Handling** : React Hook Form avec Zod pour la validation
- **Icons** : Lucide React
- **Animations** : Framer Motion
- **UI Components** : Composants Radix UI (Accordion, Dialog, Dropdown, etc.)

## Prérequis pour le Développement

Avant de commencer, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) (version >= 20)
- [npm](https://www.npmjs.com/) (gestionnaire de dépendances inclus avec Node.js)

## Installation et Lancement

1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/yakubaannanleng-design/unemploy_solutions.git
   cd unemploy_solutions
   ```

2. **Aller dans le répertoire de l'application** :
   ```bash
   cd emploica
   ```

3. **Installer les dépendances** :
   ```bash
   npm install
   ```

4. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:3000`.

## Comptes Démo

L'application inclut des comptes de démonstration pour tester les différentes fonctionnalités :

- **Chercheur d'emploi** :
  - Nom : Paul Mbarga
  - Téléphone : `+237 600000001`
  - Mot de passe : `demo123`

- **Employeur** :
  - Nom : Mamadou Diallo
  - Téléphone : `+237 600000002`
  - Mot de passe : `demo123`

- **Administrateur de la Plateforme** :
  - Téléphone : `+237 600000000`
  - Mot de passe : `demo123`

## Fonctionnalités Principales (MVP)

- **Inscription/Connexion** : Authentification avec simulation de comptes démo.
- **Profils** : Gestion des profils travailleur (compétences, localisation, disponibilité) et employeur.
- **Publication d'Offres** : Création d'offres d'emploi classées par catégories (12 catégories disponibles) avec modération.
- **Recherche et Filtres** : Recherche par catégorie, région/ville/quartier, et type de contrat.
- **Candidatures** : Postuler aux offres avec suivi du statut de la candidature.
- **Messagerie** : Échange intégré entre candidats et employeurs.
- **Administration** : Panel d'administration pour la modération des offres, la gestion des signalements et des utilisateurs.
- **Internationalisation (i18n)** : Interface bilingue Français / Anglais.
- **Sécurité** : Affichage de règles anti-arnaque en bas de page.

## Build et Déploiement

Pour produire une version optimisée de l'application :

```bash
npm run build
```

Pour prévisualiser la version de production localement :

```bash
npm run preview
```

## Maintenance et Contributions

Pour maintenir ce projet, veuillez suivre les étapes suivantes :

1. **Branches** : La branche principale est `main`. Utilisez des branches de fonctionnalités pour développer de nouvelles fonctionnalités.
2. **Tests** : Assurez-vous de vérifier le bon fonctionnement de l'application après chaque modification.
3. **Style de code** : Respectez les conventions de code existantes (TypeScript, ESLint).
4. **Mise à jour des dépendances** : Périodiquement, vérifiez les mises à jour des packages avec `npm outdated` et `npm update`.

## Licence

Ce projet est sous licence MIT.
\n## Auteur et droits de propriété\n\n© 2026 **MADI OUMAROU YAKUBA** — Workca. Tous droits réservés.\n\nDéveloppé et maintenu par MADI OUMAROU YAKUBA.\n

---

Pour toute question ou support, veuillez contacter l'équipe de développement.