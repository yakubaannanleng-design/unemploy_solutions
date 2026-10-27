// Composant de l interface utilisateur
import { useStore } from "../../lib/store";
import { useLang, t } from "../../lib/i18n";
import { Link } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Briefcase, Users, Eye, MessageSquare, Banknote, Zap, BookOpen, Star } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useState } from "react";
import OfferForm from "../offers/OfferForm";
import type { Offer } from "../../types";

export default function EmployerHome() {
  const { lang } = useLang();
  const { state, patch, replace, update, currentUser } = useStore();
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const myOffers = state.offers.filter((o) => o.employerId === currentUser.id);
  const myApps = state.applications.filter((a) =>
    myOffers.some((o) => o.id === a.offerId)
  );

  const totalViews = myOffers.reduce((s, o) => s + o.views, 0);
  const totalBoosts = state.transactions.filter((t) => t.type === "boost" && t.userId === currentUser.id).length;

  // Données pour les graphiques du tableau de bord.
  const appsByStatus = ["envoyée", "consultée", "retenue", "refusée"].map((st) => ({
    name: st,
    value: myApps.filter((a) => a.status === st).length,
  }));
  const offersByStatus = ["publiée", "en-attente", "clôturée"].map((st) => ({
    name: st,
    value: myOffers.filter((o) => o.status === st).length,
  }));
  const viewsData = myOffers.map((o) => ({ name: o.title.slice(0, 12), vues: o.views }));

  const boost = (offer: any) => {
    replace("offers", { ...offer, boost: true, views: offer.views + 50 });
    patch("transactions", {
      id: "tx-" + Math.random().toString(36).slice(2, 9),
      userId: currentUser.id,
      type: "boost",
      amount: 500,
      operator: "Orange Money",
      status: "réussi",
      createdAt: new Date().toISOString(),
    } as any);
  };
  const updateApplicationStatus = (appId: string, status: "consultée" | "retenue" | "refusée") => {
    update("applications", state.applications.map((a) => (a.id === appId ? { ...a, status } : a)));
    const app = state.applications.find((a) => a.id === appId);
    if (app) {
      patch("notifications", {
        id: "notif-" + Math.random().toString(36).slice(2, 9),
        userId: app.seekerId,
        type: "candidature",
        body:
          status === "retenue"
            ? `Votre candidature a été retenue par ${currentUser.name}.`
            : status === "refusée"
            ? `Votre candidature a été refusée par ${currentUser.name}.`
            : `Votre candidature a été consultée par ${currentUser.name}.`,
        createdAt: new Date().toISOString(),
        read: false,
      });
    }
  };



  const deleteOffer = (id: string) => {
    if (!window.confirm(lang === "fr" ? "Supprimer cette offre ?" : "Delete this offer?")) return;
    update("offers", state.offers.filter((o) => o.id !== id));
    update("applications", state.applications.filter((a) => a.offerId !== id));
  };

  const saveEdit = (data: Omit<Offer, "id">) => {
    if (!editingOffer) return;
    update("offers", state.offers.map((o) => (o.id === editingOffer.id ? { ...data, id: editingOffer.id } : o)));
    setEditingOffer(null);
  };


  if (editingOffer) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{lang === "fr" ? "Modifier l'offre" : "Edit offer"}</h2>
        <OfferForm
          initial={editingOffer}
          onSubmit={saveEdit}
          onCancel={() => setEditingOffer(null)}
        />
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t("employer", lang)} — {currentUser.name}</h2>
          <p className="text-sm text-muted-foreground">
            {state.employers.find((e) => e.userId === currentUser.id)?.orgName ?? ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/boulots-eclair">
            <Button variant="outline" size="sm"><Zap className="h-4 w-4 mr-1" /> {t("flash", lang)}</Button>
          </Link>
          <Link to="/offres/nouveau">
            <Button>{t("createOffer", lang)}</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{myOffers.length}</div><div className="text-xs text-muted-foreground flex items-center gap-1"><Briefcase className="h-3 w-3" /> {t("offers", lang)}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{myApps.length}</div><div className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> {t("applications", lang) ?? "Candidatures"}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{totalViews}</div><div className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="h-3 w-3" /> {t("views", lang) ?? "Vues"}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-brand-600">{totalBoosts}</div><div className="text-xs text-muted-foreground flex items-center gap-1"><Zap className="h-3 w-3" /> {t("boost", lang)}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">0</div><div className="text-xs text-muted-foreground flex items-center gap-1"><Banknote className="h-3 w-3" /> {t("transactions", lang) ?? "Transactions"}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>{t("offers", lang)}</CardTitle></CardHeader>
        <CardContent>
          {myOffers.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("noResults", lang)}</p>
          ) : (
            <div className="space-y-2">
              {myOffers.map((o) => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium">{o.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {o.location.city} · {o.contract} · {o.views} {t("views", lang) ?? "vues"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        o.status === "publiée" ? "default" : o.status === "en-attente" ? "secondary" : "outline"
                      }
                    >
                      {t("status" + o.status.charAt(0).toUpperCase() + o.status.slice(1), lang) ?? o.status}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => setEditingOffer(o)}>
                      {t("edit", lang)}
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => deleteOffer(o.id)}>
                      {t("delete", lang)}
                    </Button>
                    {!o.boost && (
                      <Button size="sm" variant="secondary" onClick={() => boost(o)}>
                        <Zap className="h-3 w-3 mr-1" /> {t("boost", lang)}
                      </Button>
                    )}
                    {o.boost && <Badge variant="default">{t("boostDone", lang)}</Badge>}
                    <Link to={`/offres/${o.id}`}>
                      <Button variant="ghost" size="sm">{t("review", lang)}</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>{t("stats", lang) ?? "Statistiques"}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="h-64">
              <p className="text-sm font-medium mb-2">{t("applications", lang)}</p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={10} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(20 80% 48%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="h-64">
              <p className="text-sm font-medium mb-2">{t("offers", lang)}</p>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={offersByStatus} dataKey="value" nameKey="name" outerRadius={80} label>
                    {offersByStatus.map((_, i) => (
                      <Cell key={i} fill={["#e8793a", "#f2a672", "#b8531f"][i % 3]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          {viewsData.length > 0 && (
            <div className="h-64 mt-4">
              <p className="text-sm font-medium mb-2">{t("views", lang) ?? "Vues par offre"}</p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={viewsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={10} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="vues" fill="hsl(20 60% 25%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>


      <Card>
        <CardHeader><CardTitle>{t("applications", lang) ?? "Candidatures reçues"}</CardTitle></CardHeader>
        <CardContent>
          {myApps.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("noResults", lang)}</p>
          ) : (
            <div className="space-y-2">
              {myApps.map((a) => {
                const seeker = state.users.find((u) => u.id === a.seekerId);
                const offer = state.offers.find((o) => o.id === a.offerId);
                return (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="font-medium">{seeker?.name ?? t("unknownUser", lang)}</div>
                      <div className="text-xs text-muted-foreground">
                        {offer?.title} · {a.status}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => updateApplicationStatus(a.id, "consultée")}>
                        {t("markRead", lang) ?? "Consultée"}
                      </Button>
                      <Button size="sm" onClick={() => updateApplicationStatus(a.id, "retenue")}>
                        {t("approve", lang)}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateApplicationStatus(a.id, "refusée")}>
                        {t("reject", lang)}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  );
}
