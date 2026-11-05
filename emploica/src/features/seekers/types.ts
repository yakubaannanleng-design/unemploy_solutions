/**
 * PROBLÈME RÉSOLU : types partagés du module seekers.
 * RESPONSABILITÉ  : ré-exporte SeekerProfile depuis src/types (définition conservée dans src/types.ts car dépend de ContractType/Location).
 * NE FAIT PAS     : ne redéfinit pas SeekerProfile (évite les boucles d'imports).
 * DÉPEND DE       : src/types (SeekerProfile).
 * UTILISÉ PAR     : features/seekers/*.
 */
export type { SeekerProfile } from "@/types";
