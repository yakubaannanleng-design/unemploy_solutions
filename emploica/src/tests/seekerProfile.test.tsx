// PROBLÈME RÉSOLU : vérifie que le profil candidat, le CV privé et le partage reposent sur Supabase.
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import type { SeekerProfile, User } from "@/types";
import ProfileView from "@/features/seekers/components/ProfileView";

const mocks = vi.hoisted(() => ({
  profile: null as SeekerProfile | null,
  updateStore: vi.fn(),
  updateRow: vi.fn(),
  open: vi.fn(),
  createSignedUrl: vi.fn(),
}));

vi.mock("lib/store", () => ({
  useStore: () => ({
    state: {
      employers: [],
      seekers: mocks.profile ? [mocks.profile] : [],
      users: [],
      ratings: [],
    },
    patch: vi.fn(),
    update: mocks.updateStore,
    currentUser: {
      id: "seeker-1",
      role: "chercheur",
      name: "Aïcha N.",
      phone: "+237 600 000 000",
      passwordHash: "",
      status: "actif",
      verification: "déclaré",
      createdAt: "2026-01-01T00:00:00.000Z",
    } satisfies User,
  }),
}));

vi.mock("@/features/seekers/hooks/useSeekerProfiles", () => ({
  useSeekerProfiles: () => ({
    data: mocks.profile ? [mocks.profile] : [],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("lib/supabase", () => ({
  supabase: {
    from: () => ({
      update: mocks.updateRow,
    }),
    storage: {
      from: () => ({
        createSignedUrl: mocks.createSignedUrl,
      }),
    },
  },
}));

const profile: SeekerProfile = {
  userId: "seeker-1",
  bio: "Profil initial",
  skills: ["React", "TypeScript"],
  categories: ["informatique"],
  contractWanted: ["permanent"],
  availability: "immédiatement",
  zone: { region: "Centre", city: "Yaoundé", quartier: "Bastos" },
  radiusKm: 10,
  experience: "Deux ans",
  education: "Licence en informatique",
  cvUrl: "seeker-1/cv.pdf",
  languages: ["français"],
  missionsDone: 0,
};

function renderProfile() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ProfileView />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Profil candidat", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("enregistre les modifications du profil dans Supabase", async () => {
    mocks.profile = { ...profile };
    mocks.updateStore.mockReset();
    mocks.updateRow.mockReset();
    mocks.updateRow.mockReturnValue({
      eq: () => ({
        select: () => ({
          maybeSingle: async () => ({ data: { user_id: "seeker-1" }, error: null }),
        }),
      }),
    });
    renderProfile();

    fireEvent.click(screen.getByRole("button", { name: "Modifier" }));
    fireEvent.change(screen.getByDisplayValue("Profil initial"), {
      target: { value: "Profil modifié" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() => {
      expect(mocks.updateRow).toHaveBeenCalledWith(expect.objectContaining({
        bio: "Profil modifié",
        education: "Licence en informatique",
        zone_city: "Yaoundé",
      }));
      expect(mocks.updateStore).toHaveBeenCalledWith("seekers", expect.arrayContaining([
        expect.objectContaining({ userId: "seeker-1", bio: "Profil modifié" }),
      ]));
    });
  });

  it("génère un lien temporaire sécurisé pour son propre CV et partage les détails du profil", async () => {
    mocks.profile = { ...profile };
    mocks.createSignedUrl.mockReset();
    mocks.createSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://storage.example/signed/cv.pdf" },
      error: null,
    });
    vi.spyOn(window, "open").mockImplementation(mocks.open);
    renderProfile();

    expect(await screen.findByRole("link", { name: "Télécharger le CV" })).toHaveAttribute(
      "href",
      "https://storage.example/signed/cv.pdf",
    );
    expect(mocks.createSignedUrl).toHaveBeenCalledWith("seeker-1/cv.pdf", 300);
    fireEvent.click(screen.getByRole("button", { name: "Partager" }));

    expect(mocks.open).toHaveBeenCalledWith(
      expect.stringMatching(/^https:\/\/wa\.me\/\?text=/),
      "_blank",
      "noopener,noreferrer",
    );
    const sharedUrl = new URL(mocks.open.mock.calls[0][0]);
    const message = sharedUrl.searchParams.get("text") ?? "";
    expect(message).toContain("Aïcha N.");
    expect(message).toContain("React, TypeScript");
    expect(message).not.toContain("/profil");
  });

  it("relie les offres enregistrées à leur page", () => {
    mocks.profile = { ...profile, cvUrl: undefined };
    renderProfile();

    expect(screen.getByRole("link", { name: "Offres enregistrées" })).toHaveAttribute("href", "/favoris");
  });
});
