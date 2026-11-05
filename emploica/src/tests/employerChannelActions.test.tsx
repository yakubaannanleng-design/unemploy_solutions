import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CarteOffreEmployeur from "@/features/employeur/components/CarteOffreEmployeur";
import type { Offer } from "@/types";

const mocks = vi.hoisted(() => ({
  whatsappLink: "https://whatsapp.com/channel/workca",
}));

vi.mock("@/config/canaux", () => ({
  get LIEN_CANAL_WHATSAPP() { return mocks.whatsappLink; },
  LIEN_CANAL_TELEGRAM: "",
}));

const offer: Offer = {
  id: "off-42",
  employerId: "employer-1",
  title: "Comptable",
  description: "Rejoignez notre équipe.",
  tasks: [],
  category: "finance",
  skills: [],
  location: { region: "Centre", city: "Yaoundé" },
  contract: "permanent",
  duration: "",
  schedule: "",
  pay: "150 000 FCFA",
  payMode: "fixe",
  createdAt: "2026-01-01T00:00:00.000Z",
  status: "publiée",
  boost: false,
  views: 0,
  shareTelegram: true,
};

describe("Employer channel actions", () => {
  afterEach(() => {
    cleanup();
    mocks.whatsappLink = "https://whatsapp.com/channel/workca";
  });

  it("offers protected manual WhatsApp sharing actions for published jobs", () => {
    render(
      <MemoryRouter>
        <CarteOffreEmployeur
          offer={offer}
          applicationCount={0}
          lang="fr"
          onMarkFilled={vi.fn()}
          onCopyFilledMessage={vi.fn()}
          onCopyOfferMessage={vi.fn()}
          onPublishTelegram={vi.fn()}
          telegramPending={false}
        />
      </MemoryRouter>,
    );

    const channelLink = screen.getByRole("link", { name: "Ouvrir le canal" });
    expect(channelLink).toHaveAttribute("href", mocks.whatsappLink);
    expect(channelLink).toHaveAttribute("target", "_blank");
    expect(channelLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("button", { name: "Copier le message" })).toBeInTheDocument();
  });

  it("allows retrying Telegram publication after approval", () => {
    const onPublishTelegram = vi.fn();
    render(
      <MemoryRouter>
        <CarteOffreEmployeur
          offer={offer}
          applicationCount={0}
          lang="fr"
          onMarkFilled={vi.fn()}
          onCopyFilledMessage={vi.fn()}
          onCopyOfferMessage={vi.fn()}
          onPublishTelegram={onPublishTelegram}
          telegramPending={false}
        />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Publier sur Telegram" }));
    expect(onPublishTelegram).toHaveBeenCalledWith(offer);
  });

  it("hides WhatsApp actions until the official channel link is configured", () => {
    mocks.whatsappLink = "";
    render(
      <MemoryRouter>
        <CarteOffreEmployeur
          offer={offer}
          applicationCount={0}
          lang="fr"
          onMarkFilled={vi.fn()}
          onCopyFilledMessage={vi.fn()}
          onCopyOfferMessage={vi.fn()}
          onPublishTelegram={vi.fn()}
          telegramPending={false}
        />
      </MemoryRouter>,
    );

    expect(screen.queryByRole("link", { name: "Ouvrir le canal" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Copier le message" })).not.toBeInTheDocument();
  });
});
