// PROBLÈME RÉSOLU : vérifie la lecture Supabase des notifications, leur statut lu et le badge d'en-tête.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import PageNotifications from "@/features/notifications/components/PageNotifications";
import type { User } from "@/types";

const mocks = vi.hoisted(() => ({
  notifications: [] as Record<string, unknown>[],
  from: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: { from: mocks.from },
}));

vi.mock("@/components/navigation/BottomNav", () => ({ default: () => null }));
vi.mock("@/components/navigation/MenuPlus", () => ({ default: () => null }));

const user: User = {
  id: "seeker-1",
  role: "chercheur",
  name: "Candidat",
  phone: "+237 600 000 000",
  passwordHash: "",
  status: "actif",
  verification: "déclaré",
  createdAt: "2026-01-01T00:00:00.000Z",
};

function renderWithProviders(element: React.ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{element}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Notifications", () => {
  beforeEach(() => {
    mocks.notifications = [
      {
        id: "notification-1",
        user_id: user.id,
        type: "candidature",
        body: "Votre candidature a été consultée.",
        created_at: "2026-11-04T06:00:00.000Z",
        read: false,
      },
      {
        id: "notification-2",
        user_id: user.id,
        type: "offre",
        body: "Une nouvelle offre correspond à votre recherche.",
        created_at: "2026-11-03T06:00:00.000Z",
        read: true,
      },
    ];
    mocks.from.mockImplementation(() => ({
      select: () => ({
        eq: (_column: string, userId: string) => ({
          order: async () => ({
            data: mocks.notifications.filter((notification) => notification.user_id === userId),
            error: null,
          }),
        }),
      }),
      update: (values: Record<string, unknown>) => ({
        eq: (_column: string, userId: string) => ({
          eq: async (column: string, value: string | boolean) => {
            for (const notification of mocks.notifications) {
              if (notification.user_id === userId &&
                (column === "id" ? notification.id === value : notification.read === value)) {
                Object.assign(notification, values);
              }
            }
            return { error: null };
          },
        }),
      }),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("affiche les notifications et persiste l'action de marquage comme lu", async () => {
    renderWithProviders(<PageNotifications userId={user.id} />);

    expect(await screen.findByText("Votre candidature a été consultée.")).toBeInTheDocument();
    expect(screen.getByText("Une nouvelle offre correspond à votre recherche.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tout marquer comme lu" })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Marquer comme lu" })[0]);

    await waitFor(() => {
      expect(mocks.notifications[0].read).toBe(true);
    });
    expect(screen.queryByRole("button", { name: "Tout marquer comme lu" })).not.toBeInTheDocument();
  });

  it("affiche dans la cloche le nombre de notifications non lues", async () => {
    renderWithProviders(<AppLayout currentUser={user} onLogout={vi.fn()}><p>Contenu</p></AppLayout>);

    expect(await screen.findByRole("button", { name: /1 notification non lue/ })).toBeInTheDocument();
  });
});
