// PROBLÈME RÉSOLU : centralise l'appel authentifié à la publication Telegram.
import { supabase } from "@/lib/supabase";

interface TelegramPublicationResult {
  already_published?: boolean;
  sent?: boolean;
  error?: string;
}

async function functionErrorMessage(error: { message: string } & object): Promise<string> {
  const context = "context" in error ? error.context : undefined;
  if (context instanceof Response) {
    try {
      const body: unknown = await context.clone().json();
      if (typeof body === "object" && body !== null && "error" in body && typeof body.error === "string") {
        return body.error;
      }
    } catch {
      return error.message;
    }
  }
  return error.message;
}

export async function publishTelegramOffer(offerId: string): Promise<TelegramPublicationResult> {
  if (!supabase) throw new Error("Connexion à Supabase indisponible.");
  const { data, error } = await supabase.functions.invoke<TelegramPublicationResult>(
    "publier-telegram",
    { body: { offer_id: offerId } },
  );
  if (error) throw new Error(await functionErrorMessage(error));
  if (data?.error) throw new Error(data.error);
  return data ?? {};
}
