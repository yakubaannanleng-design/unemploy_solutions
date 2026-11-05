import type { Offer } from "@/types";

export function partagerOffre(
  offre: Offer,
  entreprise: string = offre.employerId,
): void {
  const lien = new URL(`/offres/${encodeURIComponent(offre.id)}`, window.location.origin);
  const message = [
    offre.title,
    entreprise,
    offre.location.city,
    offre.pay,
    lien.toString(),
  ]
    .filter(Boolean)
    .join("\n");

  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
}
