// Composant de l interface utilisateur
import { useStore } from "lib/store";
import { useLang, t } from "lib/i18n";
import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Separator } from "components/ui/separator";
import { Link } from "react-router-dom";
import { User, Building2, ShieldCheck, MessageSquare } from "lucide-react";
import { categoryById } from "@/data/categories";

export default function AdminPanel() {
  const { lang } = useLang();
  const { state, update, replace, remove } = useStore();

  const pendingOffers = state.offers.filter((o) => o.status === "en-attente");
  const pendingReports = state.signalements.filter((s) => s.status === "en-attente");

  const approve = (id: string) =>
    update("offers", state.offers.map((o) => (o.id === id ? { ...o, status: "publiée" } : o)));
  const reject = (id: string) =>
    update("offers", state.offers.map((o) => (o.id === id ? { ...o, status: "clôturée" } : o)));
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
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{state.offers.length}</div><div className="text-xs text-muted-foreground">{t("offers", lang)}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-brand-600">{pendingOffers.length}</div><div className="text-xs text-muted-foreground">{t("moderation", lang)}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-red-600">{pendingReports.length}</div><div className="text-xs text-muted-foreground">{t("reports", lang)}</div></CardContent></Card>
      </div>

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
                        <Button size="sm" onClick={() => approve(o.id)}>{t("approve", lang)}</Button>
                        <Button size="sm" variant="outline" onClick={() => reject(o.id)}>{t("reject", lang)}</Button>
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
