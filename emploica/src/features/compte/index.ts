/**
 * PROBLÈME RÉSOLU : point d'entrée public des composants de compte.
 * RESPONSABILITÉ  : expose le choix d'espace et la gestion du profil employeur.
 * NE FAIT PAS     : ne contient aucune logique métier.
 * DÉPEND DE       : features/compte/components/*.
 * UTILISÉ PAR     : app, components/navigation, features/settings.
 */
export { default as ChoixTypeCompte } from "./components/ChoixTypeCompte";
export { default as FenetrePublier } from "./components/FenetrePublier";
export { default as FormulaireProfilEntreprise } from "./components/FormulaireProfilEntreprise";
export { default as useTypeCompte } from "./hooks/useTypeCompte";
