/**
 * PROBLÈME RÉSOLU : point d'entrée public du module messaging (encapsulation).
 * RESPONSABILITÉ  : ré-exporte uniquement ce que le module messaging expose au reste de l'application.
 * NE FAIT PAS     : ne contient aucune logique métier ni accès à la base de données.
 * DÉPEND DE       : features/messaging/components/MessagesView.
 * UTILISÉ PAR     : app (route /messages).
 */
export { default as MessagesView } from "./components/MessagesView";
export { default } from "./components/MessagesView";export { useConversations } from "./hooks/useConversations";
export { useMessages } from "./hooks/useMessages";
