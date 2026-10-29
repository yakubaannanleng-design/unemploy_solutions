/**
 * PROBLÈME RÉSOLU : point d'entrée public du module notifications (encapsulation).
 * RESPONSABILITÉ  : ré-exporte uniquement ce que le module notifications expose au reste de l'application.
 * NE FAIT PAS     : ne contient aucune logique métier ni accès à la base de données.
 * DÉPEND DE       : features/notifications/components/NotificationsView.
 * UTILISÉ PAR     : app (route /notifications).
 */
export { default as NotificationsView } from "./components/NotificationsView";
export { default } from "./components/NotificationsView";