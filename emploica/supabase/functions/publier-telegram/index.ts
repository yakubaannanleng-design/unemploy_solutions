// PROBLÈME RÉSOLU : publie sur Telegram une offre vérifiée et approuvée dans Supabase.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildTelegramOfferMessage, type TelegramOffer } from "./message.ts";

interface TelegramApiResponse {
  ok?: boolean;
  description?: string;
  result?: { message_id?: number };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse(405, { error: "Méthode non autorisée." });
  }

  const authorization = request.headers.get("Authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return jsonResponse(401, { error: "Authentification requise." });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: "Corps de requête JSON invalide." });
  }
  const offerId = typeof body === "object" && body !== null && "offer_id" in body
    ? (body as { offer_id?: unknown }).offer_id
    : undefined;
  if (typeof offerId !== "string" || !offerId.trim() || offerId.length > 200) {
    return jsonResponse(400, { error: "Identifiant d'offre invalide." });
  }
  const normalizedOfferId = offerId.trim();

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const channelId = Deno.env.get("TELEGRAM_CHANNEL_ID");
  const appUrlValue = Deno.env.get("WORKCA_APP_URL");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse(500, { error: "La fonction Telegram n'est pas correctement configurée." });
  }
  if (!botToken || !channelId || !appUrlValue) {
    return jsonResponse(503, { error: "La publication Telegram n'est pas configurée dans Supabase." });
  }

  let appUrl: string;
  try {
    const parsedAppUrl = new URL(appUrlValue);
    if (parsedAppUrl.protocol !== "https:" && parsedAppUrl.protocol !== "http:") {
      return jsonResponse(500, { error: "L'URL de l'application configurée est invalide." });
    }
    appUrl = parsedAppUrl.origin;
  } catch {
    return jsonResponse(500, { error: "L'URL de l'application configurée est invalide." });
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user) {
    return jsonResponse(401, { error: "Session Supabase invalide ou expirée." });
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: actor, error: actorError } = await serviceClient
    .from("users")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (actorError) return jsonResponse(500, { error: "Impossible de vérifier le rôle du compte." });
  if (!actor || (actor.role !== "admin" && actor.role !== "employeur")) {
    return jsonResponse(403, { error: "Seuls l'employeur concerné ou un administrateur peuvent publier cette offre." });
  }

  const { data: offer, error: offerError } = await serviceClient
    .from("offers")
    .select("id,employer_id,title,description,category,location_city,location_region,contract,pay,status,share_telegram,telegram_message_id")
    .eq("id", normalizedOfferId)
    .maybeSingle();
  if (offerError) return jsonResponse(500, { error: "Impossible de charger l'offre à publier." });
  if (!offer) return jsonResponse(404, { error: "Offre introuvable." });
  if (actor.role !== "admin" && offer.employer_id !== authData.user.id) {
    return jsonResponse(403, { error: "Vous ne possédez pas cette offre." });
  }
  if (offer.status !== "publiee") {
    return jsonResponse(409, { error: "L'offre doit être approuvée avant sa publication sur Telegram." });
  }
  if (offer.share_telegram !== true) {
    return jsonResponse(409, { error: "La publication Telegram n'a pas été demandée pour cette offre." });
  }
  if (typeof offer.telegram_message_id === "string" && offer.telegram_message_id) {
    return jsonResponse(200, {
      already_published: true,
      message_id: offer.telegram_message_id,
    });
  }

  const { data: employerProfile, error: profileError } = await serviceClient
    .from("employer_profiles")
    .select("org_name")
    .eq("user_id", offer.employer_id)
    .maybeSingle();
  if (profileError) return jsonResponse(500, { error: "Impossible de charger le nom de l'employeur." });

  const telegramOffer: TelegramOffer = {
    id: offer.id,
    title: offer.title,
    description: offer.description,
    category: offer.category,
    location_city: offer.location_city,
    location_region: offer.location_region,
    contract: offer.contract,
    pay: offer.pay,
  };
  const text = buildTelegramOfferMessage(
    telegramOffer,
    employerProfile?.org_name || "Workca",
    appUrl,
  );
  let telegramResponse: Response;
  let telegramResult: TelegramApiResponse;
  try {
    telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: channelId, text }),
      signal: AbortSignal.timeout(15000),
    });
    telegramResult = await telegramResponse.json();
  } catch {
    return jsonResponse(502, {
      error: "La réponse de Telegram n'a pas pu être confirmée. Vérifiez le canal avant de relancer la publication.",
    });
  }
  const messageId = typeof telegramResult?.result?.message_id === "number"
    ? telegramResult.result.message_id
    : undefined;
  if (!telegramResponse.ok || telegramResult?.ok !== true || messageId === undefined) {
    const description = typeof telegramResult?.description === "string"
      ? telegramResult.description
      : "Erreur inconnue de l'API Telegram.";
    return jsonResponse(502, { error: `Telegram n'a pas publié l'offre : ${description}` });
  }

  const { data: savedOffer, error: saveError } = await serviceClient
    .from("offers")
    .update({ telegram_message_id: String(messageId) })
    .eq("id", offer.id)
    .is("telegram_message_id", null)
    .select("id")
    .maybeSingle();
  if (saveError || !savedOffer) {
    return jsonResponse(502, {
      error: "Telegram a publié l'offre, mais son identifiant n'a pas pu être enregistré dans Supabase. Vérifiez le canal avant toute nouvelle tentative.",
      sent: true,
    });
  }

  return jsonResponse(200, { sent: true, message_id: String(messageId) });
});
