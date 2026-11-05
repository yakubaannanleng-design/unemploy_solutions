/**
 * PROBLÈME RÉSOLU : affiche la liste des offres avec filtres, candidature, favori, signalement, contact, boost et notation.
 * RESPONSABILITÉ  : rendu de l'écran Offres et orchestration des actions (logique non encore extraite).
 * NE FAIT PAS     : ne définit pas les composants de carte/détail (OfferCard, OfferDetailModal).
 * DÉPEND DE       : lib/store, lib/supabase, lib/i18n, components/ui/*, features/jobs (OfferCard, OfferDetailModal), features/ratings, components/common/LocationFilter, components/home/CategoryGrid.
 * UTILISÉ PAR     : app (route /offres), features/favorites, features/search (via OfferCard/OfferDetailModal).
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useStore } from "lib/store";
import { supabase } from "lib/supabase";
import { useLang, t } from "lib/i18n";
import { useOffers, filterOffers } from "../hooks/useOffers";
import { useFavorites } from "@/features/favorites/hooks";
import { useEmployerProfiles } from "features/employers/hooks/useEmployerProfiles";
import { useUserApplications } from "features/applications/hooks/useApplications";
import { HOME_CATEGORIES, matchesHomeCategory } from "@/features/categories/categories";
import BarreRecherche from "./BarreRecherche";
import FiltresOffres from "./FiltresOffres";
import PanneauFiltres from "./PanneauFiltres";
import { DEFAULT_OFFER_FILTERS, type CompleteOfferFilters } from "../utils/offerFilters";
import { isCandidateOfferVisible } from "../utils/filledOffers";
import BanniereCanaux from "@/features/canaux/BanniereCanaux";
import ListeOffres from "./ListeOffres";
import OfferDetailModal from "./OfferDetailModal";
import RatingModal from "features/ratings";
import type { Offer, Rating } from "@/types";

export default function OffersView() {
  const { lang } = useLang();
  const { state, patch, replace, currentUser } = useStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [q, setQ] = useState(() => searchParams.get("q") ?? "");
  const [filters, setFilters] = useState<CompleteOfferFilters>(DEFAULT_OFFER_FILTERS);
  const [selected, setSelected] = useState<Offer | null>(null);
  const [ratingOpen, setRatingOpen] = useState(false);
  const mineOnly = currentUser.role === "employeur" && searchParams.get("mine") === "true";
  const offerId = searchParams.get("offer");
  const offersQuery = useOffers();
  const employerProfilesQuery = useEmployerProfiles();
  const applicationsQuery = useUserApplications(currentUser.id);
  const favorites = useFavorites(currentUser.id);

  useEffect(() => {
    if (!offerId) return;
    const sharedOffer = offersQuery.data?.find((offer) => offer.id === offerId);
    if (sharedOffer) setSelected(sharedOffer);
  }, [offerId, offersQuery.data]);

  const mine = currentUser.id;
  const categoryFilter = HOME_CATEGORIES.find((category) => category.id === searchParams.get("category"));
  const employerNames = useMemo(
    () => new Map((employerProfilesQuery.data ?? []).map((profile) => [profile.userId, profile.orgName])),
    [employerProfilesQuery.data],
  );
  const filtered = useMemo(() => {
    const visibleOffers = (offersQuery.data ?? []).filter((offer) =>
      mineOnly
        ? offer.employerId === mine
        : isCandidateOfferVisible(offer, filters.hideFilled),
    );
    const categoryOffers = categoryFilter
      ? visibleOffers.filter((offer) => matchesHomeCategory(categoryFilter, offer))
      : visibleOffers;
    return filterOffers(categoryOffers, { search: q, ...filters, hideFilled: mineOnly ? false : filters.hideFilled }, employerNames)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [categoryFilter, employerNames, filters, mine, mineOnly, offersQuery.data, q]);

  const apply = async (offer: Offer) => {
    const exists = (applicationsQuery.data ?? []).some((application) => application.offerId === offer.id);
    if (exists) return;
    if (!supabase) {
      toast.error(lang === "fr" ? "Le service des offres est indisponible." : "The jobs service is unavailable.");
      return;
    }
    const appId = "app-" + Math.random().toString(36).slice(2, 9);
    const notifId = "notif-" + Math.random().toString(36).slice(2, 9);
    const createdAt = new Date().toISOString();
    const { error } = await supabase.from("applications").insert({
      id: appId,
      offer_id: offer.id,
      seeker_id: mine,
      status: "envoyee",
      created_at: createdAt,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["applications", mine] });
    const notificationResult = await supabase.from("notifications").insert({
      id: notifId,
      user_id: offer.employerId,
      type: "candidature",
      body: `${currentUser.name} a candidaté à « ${offer.title} ».`,
      created_at: createdAt,
      read: false,
    });
    if (notificationResult.error) toast.error(notificationResult.error.message);
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
      status: "réussi",
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
    } as Rating);
  };

  const isEmployer = currentUser.role === "employeur";
  const contactEmployer = (offer: Offer) => {
    navigate("/messages", { state: { otherId: offer.employerId } });
  };

  return (
    <div className="space-y-4">
      <header className="space-y-4">
        {!mineOnly && <BanniereCanaux />}
        <h1 className="text-2xl font-semibold">
          {mineOnly ? lang === "fr" ? "Mes offres" : "My jobs" : t("offers", lang)}
        </h1>
        <BarreRecherche value={q} onChange={setQ} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FiltresOffres
            value={{ city: filters.city, contract: filters.contract }}
            onChange={(quickFilters) => setFilters((previous) => ({ ...previous, ...quickFilters }))}
          />
          <PanneauFiltres
            value={filters}
            resultCount={filtered.length}
            onChange={setFilters}
          />
        </div>
      </header>

      <p className="text-sm text-muted-foreground">
        {filtered.length} {lang === "fr" ? "offre(s)" : "job(s)"}
      </p>
      <ListeOffres
        items={filtered.map((offer) => ({
          offer,
          employerName: employerNames.get(offer.employerId) ?? "",
        }))}
        savedIds={new Set(favorites.savedIds)}
        loading={offersQuery.isLoading}
        error={
          !supabase
            ? lang === "fr"
              ? "Connexion à Supabase indisponible. Les offres ne peuvent pas être chargées."
              : "Supabase is unavailable. Jobs cannot be loaded."
            : offersQuery.isError
              ? offersQuery.error instanceof Error
                ? offersQuery.error.message
                : lang === "fr" ? "Impossible de charger les offres." : "Could not load jobs."
              : employerProfilesQuery.isError
                ? lang === "fr" ? "Impossible de charger les entreprises." : "Could not load companies."
                : favorites.error
                  ? favorites.error instanceof Error
                    ? favorites.error.message
                    : lang === "fr" ? "Impossible de charger vos offres enregistrées." : "Could not load saved jobs."
                  : undefined
        }
        onOpen={setSelected}
        onToggleSaved={(offer) =>
          favorites.toggle(offer.id)
        }
      />

      <OfferDetailModal
        offer={selected}
        open={!!selected}
        onOpenChange={(v) => !v && setSelected(null)}
        onApply={selected ? () => apply(selected) : undefined}
        onReport={selected ? () => report(selected) : undefined}
        onContact={selected ? () => contactEmployer(selected) : undefined}
        onBoost={selected && isEmployer && selected.employerId === mine && !selected.boost ? () => boost(selected) : undefined}
        onRate={selected && !isEmployer ? () => setRatingOpen(true) : undefined}
        alreadyApplied={selected ? (applicationsQuery.data ?? []).some((application) => application.offerId === selected.id) : false}
        isEmployer={isEmployer}
      />

      <RatingModal
        open={ratingOpen}
        onOpenChange={setRatingOpen}
        targetName={state.users.find((u) => u.id === selected?.employerId)?.name ?? ""}
        role="employeur"
        onSubmit={rate}
      />
    </div>
  );
}
