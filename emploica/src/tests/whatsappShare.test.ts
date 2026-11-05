import { describe, expect, it, vi } from "vitest";
import { partagerOffre } from "../utils/partageWhatsApp";
import type { Offer } from "../types";

describe("partagerOffre", () => {
  it("ouvre WhatsApp avec les informations et le lien de l'offre encodés", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const offer = {
      id: "off-42",
      title: "Comptable",
      employerId: "employer-1",
      description: "",
      tasks: [],
      category: "finance",
      skills: [],
      location: { region: "Centre", city: "Yaoundé" },
      contract: "permanent",
      duration: "CDI",
      schedule: "",
      pay: "150 000 FCFA",
      payMode: "fixe",
      createdAt: "2026-11-02T00:00:00Z",
      status: "publiée",
      boost: false,
      views: 0,
    } satisfies Offer;
    const message = [
      "Comptable",
      "Entreprise Alpha",
      "Yaoundé",
      "150 000 FCFA",
      `${window.location.origin}/offres/off-42`,
    ].join("\n");

    partagerOffre(offer, "Entreprise Alpha");

    expect(open).toHaveBeenCalledWith(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    open.mockRestore();
  });
});
