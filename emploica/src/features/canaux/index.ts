/**
 * PROBLÈME RÉSOLU : expose l'interface publique du domaine canaux.
 * RESPONSABILITÉ  : ré-exporte la page, ses cartes et sa bannière.
 * NE FAIT PAS     : ne contient aucune logique métier.
 * DÉPEND DE       : PageCanaux, CarteCanal, BanniereCanaux.
 * UTILISÉ PAR     : app et liste des offres.
 */
export { default } from "./PageCanaux";
export { default as PageCanaux } from "./PageCanaux";
export { default as CarteCanal } from "./CarteCanal";
export { default as BanniereCanaux } from "./BanniereCanaux";
