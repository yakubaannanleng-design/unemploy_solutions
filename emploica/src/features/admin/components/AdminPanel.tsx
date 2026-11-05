// Composant de l interface utilisateur
import { useStore } from "lib/store";
import { useLang, t } from "lib/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { User, Building2, ShieldCheck } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useUsers } from "@/features/auth/hooks/useUsers";
import { useOffers } from "@/features/jobs/hooks/useOffers";
import { publishTelegramOffer } from "@/features/canaux/utils/publishTelegramOffer";
import { supabase } from "@/lib/supabase";
import type { Offer } from "@/types";

export default function AdminPanel() {
  const { lang } = useLang();
  const { state, update, patch } = useStore();
  const queryClient = useQueryClient();
  const usersQuery = useUsers();
  const offersQuery = useOffers();
  const offers = supabase ? (offersQuery.data ?? []) : state.offers;
  const signedInUser = (supabase ? usersQuery.data : state.users)
    ?.find((user) => user.id === state.currentUserId);

  const pendingOffers = offers.filter((o) => o.status === "en-attente");
  const pendingReports = state.signalements.filter((s) => s.status === "en-attente");

  const reviewOffer = useMutation({
    mutationFn: async ({ offer, approved }: { offer: Offer; approved: boolean }) => {
      if (!supabase) {
        throw new Error(lang === "fr" ? "Connexion à Supabase indisponible." : "Supabase is unavailable.");
      }
      const { data, error } = await supabase.rpc("review_offer", {
        p_offer_id: offer.id,
        p_approved: approved,
      });
      if (error) throw error;
      if (data !== true) {
        throw new Error(lang === "fr"
          ? "Cette offre n'est plus en attente de validation."
          : "This job is no longer awaiting review.");
      }

      let telegramError: string | undefined;
      if (approved && offer.shareTelegram) {
        try {
          await publishTelegramOffer(offer.id);
        } catch (error) {
          telegramError = error instanceof Error ? error.message : String(error);
        }
      }
      return { offer, approved, telegramError };
    },
    onSuccess: async ({ offer, approved, telegramError }) => {
      const status = approved ? "publiée" : "clôturée";
      update("offers", state.offers.map((item) => item.id === offer.id ? { ...item, status } : item));
      await queryClient.invalidateQueries({ queryKey: ["offers"] });
      if (telegramError) {
        toast.error(lang === "fr"
          ? `Offre approuvée, mais publication Telegram échouée : ${telegramError}`
          : `Job approved, but Telegram publishing failed: ${telegramError}`);
      } else {
        toast.success(approved
          ? offer.shareTelegram
            ? lang === "fr" ? "L'offre a été approuvée et publiée sur Telegram." : "The job was approved and published on Telegram."
            : lang === "fr" ? "L'offre a été approuvée." : "The job was approved."
          : lang === "fr" ? "L'offre a été refusée." : "The job was rejected.");
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error
        ? error.message
        : lang === "fr" ? "Impossible d'enregistrer la décision." : "Could not save the review decision.");
    },
  });

  if (supabase && usersQuery.isLoading) {
    return <p role="status" className="py-10 text-center text-muted-foreground">
      {lang === "fr" ? "Vérification des droits…" : "Checking permissions…"}
    </p>;
  }
  if (signedInUser?.role !== "admin") return <Navigate to="/offres" replace />;

  const approve = (offer: Offer) => reviewOffer.mutate({ offer, approved: true });
  const reject = (offer: Offer) => reviewOffer.mutate({ offer, approved: false });
  const blockUser = (id: string) =>
    update("users", state.users.map((u) => (u.id === id ? { ...u, status: "suspendu" } : u)));
  const resolveReport = (id: string) =>
    update("signalements", state.signalements.map((s) => (s.id === id ? { ...s, status: "traité" } : s)));
  const verifyEmployer = (userId: string) => {
    update(
      "employers",
      state.employers.map((e) =>
        e.userId === userId
          ? { ...e, verification: "vérifié", verificationRequested: false, verifiedAt: new Date().toISOString() }
          : e
      )
    );
    const emp = state.employers.find((e) => e.userId === userId);
    if (emp) {
      patch("notifications", {
        id: "notif-" + Math.random().toString(36).slice(2, 9),
        userId,
        type: "alerte",
        body: `Votre entreprise « ${emp.orgName} » a été vérifiée par la plateforme.`,
        createdAt: new Date().toISOString(),
        read: false,
      });
    }
  };


  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{t("admin", lang)}</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{state.users.length}</div><div className="text-xs text-muted-foreground">{t("users", lang)}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{offers.length}</div><div className="text-xs text-muted-foreground">{t("offers", lang)}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-brand-600">{pendingOffers.length}</div><div className="text-xs text-muted-foreground">{t("moderation", lang)}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-red-600">{pendingReports.length}</div><div className="text-xs text-muted-foreground">{t("reports", lang)}</div></CardContent></Card>
      </div>

      {supabase && offersQuery.isError && (
        <p role="alert" className="text-sm text-destructive">
          {lang === "fr" ? "Impossible de charger les offres à modérer." : "Could not load jobs for review."}
        </p>
      )}

      <Card>
        <CardHeader><CardTitle>{t("moderation", lang)} — {t("offers", lang)}</CardTitle></CardHeader>
        <CardContent>
          {pendingOffers.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("noResults", lang)}</p>
          ) : (
            <div className="space-y-3">
              {pendingOffers.map((o) => {
                const emp = state.users.find((u) => u.id === o.employerId);
                return (
                  <div key={o.id} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{o.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {o.location.city} · par {emp?.name ?? t("unknownUser", lang)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" disabled={reviewOffer.isPending} onClick={() => approve(o)}>{t("approve", lang)}</Button>
                        <Button size="sm" variant="outline" disabled={reviewOffer.isPending} onClick={() => reject(o)}>{t("reject", lang)}</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t("reports", lang)}</CardTitle></CardHeader>
        <CardContent>
          {pendingReports.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("noResults", lang)}</p>
          ) : (
            <div className="space-y-2">
              {pendingReports.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="text-sm font-medium">
                      {s.targetType} : {s.targetId}
                    </div>
                    <div className="text-xs text-muted-foreground">{s.reason}</div>
                  </div>
                  <Button size="sm" onClick={() => resolveReport(s.id)}>{t("review", lang)}</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{lang === "fr" ? "Vérifications en attente" : "Pending verifications"}</CardTitle></CardHeader>
        <CardContent>
          {state.employers.filter((e) => e.verificationRequested && e.verification !== "vérifié").length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("noResults", lang)}</p>
          ) : (
            <div className="space-y-2">
              {state.employers
                .filter((e) => e.verificationRequested && e.verification !== "vérifié")
                .map((e) => {
                  const u = state.users.find((x) => x.id === e.userId);
                  return (
                    <div key={e.userId} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <div className="font-medium">{e.orgName}</div>
                        <div className="text-xs text-muted-foreground">
                          {u?.name} · {e.orgType} · {e.verification}
                        </div>
                      </div>
                      <Button size="sm" onClick={() => verifyEmployer(e.userId)}>
                        <ShieldCheck className="h-3 w-3 mr-1" /> {t("verify", lang)}
                      </Button>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t("users", lang)}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {state.users.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  {u.role === "employeur" ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {u.role} · {u.status} · {u.verification}
                    </div>
                  </div>
                </div>
                {u.status === "actif" && (
                  <Button size="sm" variant="outline" onClick={() => blockUser(u.id)}>
                    {t("block", lang)}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
