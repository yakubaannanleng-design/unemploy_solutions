import { Zap, Clock, Users, MapPin } from "lucide-react";
import { useLang, t } from "../../lib/i18n";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useStore } from "../../lib/store";
import { categoryById } from "../../data/categories";
import { useState } from "react";

export default function FlashOffersView() {
  const { lang } = useLang();
  const { state, patch } = useStore();
  const [applied, setApplied] = useState<Record<string, boolean>>({});

  const mine = state.users[0].id;
  const active = state.flashOffers.filter((f) => new Date(f.endsAt) > new Date());

  const apply = (f: FlashOffer) => {
    if (f.takenCount >= f.maxCandidates) return;
    patch("flashOffers", { ...f, takenCount: f.takenCount + 1 });
    setApplied((p) => ({ ...p, [f.id]: true }));
  };

  if (active.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <Zap className="h-10 w-10 mx-auto mb-2 opacity-40" />
        <p>{t("flash", lang)} — {lang === "fr" ? "Aucune offre éclair pour le moment." : "No flash offers right now."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {active.map((f) => {
        const offer = state.offers.find((o) => o.id === f.offerId);
        if (!offer) return null;
        const cat = categoryById(offer.category);
        const remaining = Math.max(0, f.maxCandidates - f.takenCount);
        return (
<div key={f.id} className="rounded-lg border border-brand-200 bg-brand-50/40 dark:border-brand-900 dark:bg-brand-950/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-brand-600" />
                <div>
                  <div className="font-semibold">{offer.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {lang === "fr" ? cat?.name : cat?.nameEn} · {offer.location.city}, {offer.location.quartier}
                  </div>
                </div>
              </div>
              <Badge variant="secondary">{t("flashOffer", lang)}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{offer.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {lang === "fr" ? "Expire" : "Expires"} {new Date(f.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {remaining}/{f.maxCandidates} {lang === "fr" ? "places" : "spots"}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {offer.duration} · {offer.contract}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => apply(f)} disabled={applied[f.id] || remaining === 0}>
                {applied[f.id] ? t("flashApplied", lang) : remaining === 0 ? (lang === "fr" ? "Complet" : "Full") : t("applyFlash", lang)}
              </Button>
              <Link to={`/offres/${offer.id}`}>
                <Button size="sm" variant="outline">{t("review", lang)}</Button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}