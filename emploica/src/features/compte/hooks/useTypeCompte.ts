/**
 * PROBLÈME RÉSOLU : centralise l'espace de travail actif du compte connecté.
 * RESPONSABILITÉ  : lit le choix d'espace et le mémorise comme préférence d'interface.
 * NE FAIT PAS     : ne change pas le rôle métier du compte ni ses profils Supabase.
 * DÉPEND DE       : lib/store.
 * UTILISÉ PAR     : features/compte, features/settings.
 */
import { useStore, type Workspace } from "@/lib/store";

export default function useTypeCompte() {
  const { state, currentUser, setActiveSpace } = useStore();

  return {
    currentSpace: currentUser.role === "admin" ? null : currentUser.role,
    hasSelectedSpace: Object.prototype.hasOwnProperty.call(state.activeSpaces, currentUser.id),
    selectSpace: (space: Workspace) => setActiveSpace(space),
  };
}
