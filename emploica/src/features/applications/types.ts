/**
 * PROBLÈME RÉSOLU : types partagés du module applications.
 * RESPONSABILITÉ  : ré-exporte Application depuis src/types (définition conservée dans src/types.ts car dépend de ApplicationStatus).
 * NE FAIT PAS     : ne redéfinit pas Application (évite les boucles d'imports).
 * DÉPEND DE       : src/types (Application).
 * UTILISÉ PAR     : features/applications/*.
 */
export type { Application } from "@/types";
