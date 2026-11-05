// PROBLÈME RÉSOLU : vérifie que l'écran de messagerie charge, lit et envoie les messages via Supabase.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import MessagesView from "@/features/messaging/components/MessagesView";

const mocks = vi.hoisted(() => ({
  conversations: [] as { id: string; participants: string[] }[],
  messages: [] as Record<string, unknown>[],
  from: vi.fn(),
}));

const currentUser = {
  id: "seeker-1",
  role: "chercheur",
  name: "Candidat",
  phone: "+237 600 000 000",
  passwordHash: "",
  status: "actif",
  verification: "déclaré",
  createdAt: "2026-01-01T00:00:00.000Z",
};
const otherUser = {
  ...currentUser,
  id: "employer-1",
  role: "employeur",
  name: "Orange Cameroun",
};

vi.mock("@/lib/store", () => ({
  useStore: () => ({ currentUser, state: { users: [currentUser, otherUser] } }),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: { from: mocks.from },
}));

function renderMessages(locationState = { conversationId: "conversation-1" }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[{ pathname: "/messages", state: locationState }]}>
        <MessagesView />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Messagerie", () => {
  beforeEach(() => {
    mocks.conversations = [{ id: "conversation-1", participants: [currentUser.id, otherUser.id] }];
    mocks.messages = [{
      id: "message-1",
      conversation_id: "conversation-1",
      sender_id: otherUser.id,
      receiver_id: currentUser.id,
      body: "Nous vous proposons un entretien.",
      created_at: "2026-11-04T06:00:00.000Z",
      status: "envoye",
    }];
    mocks.from.mockImplementation((table: string) => ({
      select: () => ({
        contains: async (_column: string, ids: string[]) => ({
          data: mocks.conversations.filter((conversation) =>
            ids.every((id) => conversation.participants.includes(id)),
          ),
          error: null,
        }),
        in: (_column: string, ids: string[]) => ({
          order: async () => ({
            data: mocks.messages.filter((message) => ids.includes(message.conversation_id as string)),
            error: null,
          }),
        }),
        eq: (_column: string, id: string) => ({
          order: async () => ({
            data: mocks.messages.filter((message) => message.conversation_id === id),
            error: null,
          }),
        }),
      }),
      insert: (row: Record<string, unknown>) => {
        if (table === "conversations") {
          return {
            select: () => ({
              single: async () => {
                mocks.conversations.push({ id: row.id as string, participants: row.participants as string[] });
                return { data: row, error: null };
              },
            }),
          };
        }
        return {
          then: (resolve: (result: { error: null }) => void) => {
            mocks.messages.push(row);
            resolve({ error: null });
          },
        };
      },
      update: (values: Record<string, unknown>) => ({
        eq: (_column: string, conversationId: string) => ({
          eq: (_receiverColumn: string, receiverId: string) => ({
            eq: async (_statusColumn: string, status: string) => {
              for (const message of mocks.messages) {
                if (message.conversation_id === conversationId &&
                  message.receiver_id === receiverId &&
                  message.status === status) Object.assign(message, values);
              }
              return { error: null };
            },
          }),
        }),
      }),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("affiche le fil, marque les messages reçus comme lus et persiste l'envoi", async () => {
    renderMessages();

    expect(await screen.findByText("Nous vous proposons un entretien.")).toBeInTheDocument();
    expect(screen.getAllByText("Orange Cameroun")).toHaveLength(2);
    await waitFor(() => {
      expect(mocks.messages[0].status).toBe("lu");
    });

    fireEvent.change(screen.getByRole("textbox", { name: "Écrivez un message..." }), {
      target: { value: "Merci, je serai présent." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

    await waitFor(() => {
      expect(mocks.messages).toEqual(expect.arrayContaining([
        expect.objectContaining({
          conversation_id: "conversation-1",
          sender_id: currentUser.id,
          receiver_id: otherUser.id,
          body: "Merci, je serai présent.",
          status: "envoye",
        }),
      ]));
    });
    expect(await screen.findAllByText("Merci, je serai présent.")).toHaveLength(2);
  });

  it("crée une conversation persistante lorsqu'on contacte un employeur pour la première fois", async () => {
    mocks.conversations = [];
    mocks.messages = [];
    renderMessages({ otherId: otherUser.id });

    expect(await screen.findAllByText("Orange Cameroun")).toHaveLength(2);
    await waitFor(() => {
      expect(mocks.conversations).toEqual([
        expect.objectContaining({
          participants: [currentUser.id, otherUser.id],
        }),
      ]);
    });
    expect(await screen.findByText("Envoyez le premier message.")).toBeInTheDocument();
  });
});
