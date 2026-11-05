/**
 * PROBLÈME RÉSOLU : point d'entrée public du module settings (encapsulation).
 * RESPONSABILITÉ  : ré-exporte uniquement ce que le module settings expose au reste de l'application.
 * NE FAIT PAS     : ne contient aucune logique métier ni accès à la base de données.
 * DÉPEND DE       : features/settings/components/SettingsView.
 * UTILISÉ PAR     : app (route /parametres).
 */
export { default as SettingsView } from "./components/SettingsView";
export { default } from "./components/SettingsView";