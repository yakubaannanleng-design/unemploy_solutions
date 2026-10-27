import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../lib/store";
import { useLang, t } from "../../lib/i18n";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import OfferCard from "../offers/OfferCard";
import OfferDetailModal from "../offers/OfferDetailModal";
import RatingModal from "../common/RatingModal";
import LocationFilter from "../common/LocationFilter";
import CategoryGrid from "../home/CategoryGrid";
import type { Offer } from "../../types";

export default function OffersView() {
  const { lang } = useLang();
  const { state, patch, replace, update, currentUser } = useStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [quartier, setQuartier] = useState("");
  const [contractFilter, setContractFilter] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [selected, setSelected] = useState<Offer | null>(null);
  const [ratingOpen, setRatingOpen] = useState(false);

  const mine = currentUser.id;
  const seeker = state.seekers.find((s) => s.userId === mine);

  const filtered = state.offers
    .filter((o) => o.status === "publiée")
    .filter((o) => !q || o.title.toLowerCase().includes(q.toLowerCase()) || o.description.toLowerCase().includes(q.toLowerCase()))
    .filter((o) => !categories.length || categories.includes(o.category))
    .filter((o) => !region || o.location.region === region)
    .filter((o) => !city || o.location.city === city)
    .filter((o) => !quartier || o.location.quartier === quartier)
    .filter((o) => !contractFilter || o.contract === contractFilter)
    .sort((a, b) => {
      if (sortBy === "views") return b.views - a.views;
      if (sortBy === "pay") return (b.pay || "").localeCompare(a.pay || "");
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const apply = (offer: Offer) => {
    const exists = state.applications.some((a) => a.offerId === offer.id && a.seekerId === mine);
    if (exists) return;
    patch("applications", {
      id: "app-" + Math.random().toString(36).slice(2, 9),
      offerId: offer.id,
      seekerId: mine,
      status: "envoyÃ©e",
      createdAt: new Date().toISOString(),
    });
    patch("notifications", {
      id: "notif-" + Math.random().toString(36).slice(2, 9),
      userId: offer.employerId,
      type: "candidature",
      body: `${currentUser.name} a candidatÃ© Ã  Â« ${offer.title} Â».`,
      createdAt: new Date().toISOString(),
      read: false,
    });
    setSelected(offer);
  };

  const report = (offer: Offer) => {
    patch("signalements", {
      id: "sig-" + Math.random().toString(36).slice(2, 9),
      authorId: mine,
      targetType: "offre",
      targetId: offer.id,
      reason: "Offre suspecte / arnaque",
      createdAt: new Date().toISOString(),
      status: "en-attente",
    });
  };

  const boost = (offer: Offer) => {
    const boosted: Offer = { ...offer, boost: true, views: offer.views + 50 };
    replace("offers", boosted);
    patch("transactions", {
      id: "tx-" + Math.random().toString(36).slice(2, 9),
      userId: offer.employerId,
      type: "boost",
      amount: 500,
      operator: "Orange Money",
      status: "rÃ©ussi",
      createdAt: new Date().toISOString(),
    });
  };

  const rate = (score: number, comment: string) => {
    if (!selected) return;
    patch("ratings", {
      id: "rt-" + Math.random().toString(36).slice(2, 9),
      fromUserId: mine,
      toUserId: selected.employerId,
      toRole: "employeur",
      score,
      comment,
      createdAt: new Date().toISOString(),
    } as any);
  };

  const toggleFavorite = (id: string) => {
    const next = state.favorites.includes(id)
      ? state.favorites.filter((x) => x !== id)
      : [...state.favorites, id];
    update("favorites", next);
  };

  const isEmployer = currentUser.role === "employeur";
  const contactEmployer = (offer: Offer) => {
    const otherId = offer.employerId;
    let conv = state.conversations.find(
      (c) => c.participants.includes(currentUser.id) && c.participants.includes(otherId)
    );
    if (!conv) {
      conv = {
        id: "conv-" + Math.random().toString(36).slice(2, 9),
        participants: [currentUser.id, otherId],
        messages: [],
      };
      patch("conversations", conv);
    }
    navigate("/messages", { state: { conversationId: conv.id } });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`${t("search", lang)}...`}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">{t("category", lang)}</div>
            <CategoryGrid
              selected={categories}
              onToggle={(id) =>
                setCategories((c) =>
                  c.includes(id) ? c.filter((x) => x !== id) : [...c, id]
                )
              }
            />
          </div>
          <Separator />
          <LocationFilter
            region={region}
            city={city}
            quartier={quartier}
            onChange={(f, v) => {
              if (f === "region") { setRegion(v); setCity(""); setQuartier(""); }
              else if (f === "city") { setCity(v); setQuartier(""); }
              else setQuartier(v);
            }}
          />
          <Separator />
          <div className="space-y-2">
            <div className="text-sm font-medium">{t("contract", lang)}</div>
            <Select value={contractFilter || "all"} onValueChange={(v) => setContractFilter(v === "all" ? "" : v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all", lang) ?? "Tous"}</SelectItem>
                {["permanent", "temporaire", "mission", "stage", "temps-partiel", "indépendant"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">{lang === "fr" ? "Tri" : "Sort"}</div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="date">{lang === "fr" ? "Plus récents" : "Newest"}</SelectItem>
                <SelectItem value="views">{t("views", lang) ?? "Vues"}</SelectItem>
                <SelectItem value="pay">{t("pay", lang)}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {filtered.length} {t("offers", lang).toLowerCase()}
            </span>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>{t("noResults", lang)}</p>
              <p className="text-xs">{t("antiScam", lang)}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {filtered.map((o) => (
                <OfferCard
                  key={o.id}
                  offer={o}
                  onClick={() => { setSelected(o); }}
                  onApply={() => apply(o)}
                  alreadyApplied={state.applications.some((a) => a.offerId === o.id && a.seekerId === mine)}
                  isFavorite={state.favorites.includes(o.id)}
                  onToggleFavorite={() => toggleFavorite(o.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <OfferDetailModal
        offer={selected}
        open={!!selected}
        onOpenChange={(v) => !v && setSelected(null)}
        onApply={selected ? () => apply(selected) : undefined}
        onReport={selected ? () => report(selected) : undefined}
        onContact={selected ? () => contactEmployer(selected) : undefined}
        onBoost={selected && isEmployer && selected.employerId === mine && !selected.boost ? () => boost(selected) : undefined}
        onRate={selected && !isEmployer ? () => setRatingOpen(true) : undefined}
        alreadyApplied={selected ? state.applications.some((a) => a.offerId === selected.id && a.seekerId === mine) : false}
        isEmployer={isEmployer}
      />

      <RatingModal
        open={ratingOpen}
        onOpenChange={setRatingOpen}
        targetId={selected?.employerId ?? ""}
        targetName={state.users.find((u) => u.id === selected?.employerId)?.name ?? ""}
        role="employeur"
        onSubmit={rate}
      />
    </div>
  );
}
