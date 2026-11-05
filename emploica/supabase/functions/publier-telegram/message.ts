// PROBLÈME RÉSOLU : construit un message Telegram lisible, sûr et limité en longueur.
export interface TelegramOffer {
  id: string;
  title: string;
  description: string;
  category: string | null;
  location_city: string | null;
  location_region: string | null;
  contract: string | null;
  pay: string | null;
}

export function buildTelegramOfferMessage(
  offer: TelegramOffer,
  companyName: string,
  appUrl: string,
): string {
  const offerUrl = new URL(`/offres/${encodeURIComponent(offer.id)}`, appUrl).toString();
  const details = [
    offer.category && `Catégorie : ${offer.category}`,
    [offer.location_city, offer.location_region].filter(Boolean).join(" · ") || undefined,
    offer.contract && `Contrat : ${offer.contract}`,
    offer.pay && `Rémunération : ${offer.pay}`,
  ].filter((line): line is string => Boolean(line));
  const prefix = [
    offer.title,
    companyName,
    ...details,
    "",
  ].join("\n");
  const suffix = `\n\n${offerUrl}`;
  const descriptionBudget = Math.max(0, 4000 - Array.from(prefix + suffix).length);
  const description = Array.from(offer.description).slice(0, descriptionBudget).join("");
  return `${prefix}${description}${suffix}`;
}
