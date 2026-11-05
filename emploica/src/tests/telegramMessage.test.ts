import { describe, expect, it } from "vitest";
import { buildTelegramOfferMessage } from "../../supabase/functions/publier-telegram/message";

describe("buildTelegramOfferMessage", () => {
  it("includes the offer details and a link on the configured app origin", () => {
    const message = buildTelegramOfferMessage({
      id: "off-42",
      title: "Comptable",
      description: "Rejoignez notre équipe.",
      category: "finance",
      location_city: "Yaoundé",
      location_region: "Centre",
      contract: "permanent",
      pay: "150 000 FCFA",
    }, "Entreprise Alpha", "https://workca.example");

    expect(message).toContain("Comptable");
    expect(message).toContain("Entreprise Alpha");
    expect(message).toContain("Yaoundé · Centre");
    expect(message).toContain("Rejoignez notre équipe.");
    expect(message).toContain("https://workca.example/offres/off-42");
  });

  it("keeps oversized messages within Telegram's message limit", () => {
    const message = buildTelegramOfferMessage({
      id: "off-42",
      title: "Comptable",
      description: "Offre détaillée. ".repeat(600),
      category: null,
      location_city: null,
      location_region: null,
      contract: null,
      pay: null,
    }, "Entreprise Alpha", "https://workca.example");

    expect(Array.from(message).length).toBeLessThanOrEqual(4000);
    expect(message.endsWith("https://workca.example/offres/off-42")).toBe(true);
  });
});
