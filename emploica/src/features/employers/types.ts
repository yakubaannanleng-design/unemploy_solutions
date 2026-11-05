/**
 * PROBLÈME RÉSOLU : types partagés du module employers.
 * RESPONSABILITÉ  : ré-exporte EmployerProfile depuis src/types (définition conservée dans src/types.ts car dépend de VerificationLevel).
 * NE FAIT PAS     : ne redéfinit pas EmployerProfile (évite les boucles d'imports).
 * DÉPEND DE       : src/types (EmployerProfile).
 * UTILISÉ PAR     : features/employers/*.
 */
export type { EmployerProfile } from "@/types";
