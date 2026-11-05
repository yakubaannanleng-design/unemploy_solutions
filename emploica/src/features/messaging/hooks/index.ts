/**
 * PROBLÈME RÉSOLU : point d'entrée des hooks du module messaging.
 * RESPONSABILITÉ  : expose le chargement Supabase des conversations et messages.
 * NE FAIT PAS     : ne contient pas la logique d'accès à la base de données.
 * DÉPEND DE       : useConversations, useMessages.
 * UTILISÉ PAR     : features/messaging, components/navigation/BottomNav.
 */
export { useConversations } from "./useConversations";
export { useMessages } from "./useMessages";