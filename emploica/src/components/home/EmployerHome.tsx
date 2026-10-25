// Composant de l interface utilisateur\nimport { useStore } from "../../lib/store";
import { useLang, t } from "../../lib/i18n";
import { Link } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Briefcase, Users, Eye, MessageSquare, Banknote, Zap, BookOpen, Star } from "lucide-react";
import { categoryById } from "../../data/categories";

export default function EmployerHome() {
  const { lang } = useLang();
  const { state, replace } = useStore();
  const myOffers = state.offers.filter((o) => o.employerId === currentUser.id);
  const myApps = state.applications.filter((a) =>
    myOffers.some((o) => o.id === a.offerId)
  );

  const totalViews = myOffers.reduce((s, o) => s + o.views, 0);
  const totalBoosts = state.transactions.filter((t) => t.type === "boost" && t.userId === currentUser.id).length;

  const boost = (offer: any) => {
    replace("offers", { ...offer, boost: true, views: offer.views + 50 });
    replace("transactions", {
      id: "tx-" + Math.random().toString(36).slice(2, 9),
      userId: currentUser.id,
      type: "boost",
      amount: 500,
      operator: "Orange Money",
      status: "réussi",
      createdAt: new Date().toISOString(),
    } as any);
  };

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
    </div>
  );
}
