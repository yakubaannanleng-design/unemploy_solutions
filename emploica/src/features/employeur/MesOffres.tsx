import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useApplications } from "@/features/applications/hooks/useApplications";
import { useEmployerProfiles } from "@/features/employers/hooks/useEmployerProfiles";
import { useOffers } from "@/features/jobs/hooks/useOffers";
import { isOfferExpired } from "@/features/jobs/utils/filledOffers";
import { publishTelegramOffer } from "@/features/canaux/utils/publishTelegramOffer";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/i18n";
import type { Offer, User } from "@/types";
import CarteOffreEmployeur from "./components/CarteOffreEmployeur";
import ConfirmerPourvu from "./components/ConfirmerPourvu";

type OfferTab = "active" | "filled" | "expired";

interface MesOffresProps {
  currentUser: User;
}

export default function MesOffres({ currentUser }: MesOffresProps) {
  const { lang } = useLang();
  const queryClient = useQueryClient();
  const offersQuery = useOffers();
  const applicationsQuery = useApplications();
  const profilesQuery = useEmployerProfiles();
  const [tab, setTab] = useState<OfferTab>("active");
  const [offerToFill, setOfferToFill] = useState<Offer | null>(null);
  const offers = (offersQuery.data ?? []).filter((offer) => offer.employerId === currentUser.id);
  const applications = applicationsQuery.data ?? [];
  const companyName = profilesQuery.data?.find((profile) => profile.userId === currentUser.id)?.orgName ?? currentUser.name;

  const { mutate: triggerExpiration } = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("Connexion à Supabase indisponible.");
      const { error } = await supabase.rpc("expire_offers");
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : lang === "fr" ? "Impossible de mettre à jour les offres expirées." : "Could not update expired jobs.");
    },
  });
  const markFilled = useMutation({
    mutationFn: async (offerId: string) => {
      if (!supabase) throw new Error(lang === "fr" ? "Connexion à Supabase indisponible." : "Supabase is unavailable.");
      const { data, error } = await supabase.rpc("mark_offer_filled", { p_offer_id: offerId });
      if (error) throw error;
      if (data !== true) {
        throw new Error(lang === "fr"
          ? "Cette offre n'est plus active ou vous n'en êtes pas propriétaire."
          : "This job is no longer active or you do not own it.");
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["offers"] }),
        queryClient.invalidateQueries({ queryKey: ["applications"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      ]);
      setOfferToFill(null);
      toast.success(lang === "fr" ? "Le poste a été marqué comme pourvu." : "The job was marked as filled.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : lang === "fr" ? "Impossible de clôturer cette offre." : "Could not close this job.");
    },
  });
  const publishTelegram = useMutation({
    mutationFn: (offer: Offer) => publishTelegramOffer(offer.id),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["offers"] });
      toast.success(result.already_published
        ? lang === "fr" ? "Cette offre est déjà publiée sur Telegram." : "This job is already published on Telegram."
        : lang === "fr" ? "L'offre a été publiée sur Telegram." : "The job was published on Telegram.");
    },
    onError: (error) => {
      toast.error(error instanceof Error
        ? error.message
        : lang === "fr" ? "Impossible de publier l'offre sur Telegram." : "Could not publish the job on Telegram.");
    },
  });

  useEffect(() => {
    if (supabase) triggerExpiration();
  }, [triggerExpiration]);

  const visibleOffers = offers.filter((offer) => {
    if (tab === "filled") return offer.isFilled === true;
    if (tab === "expired") return !offer.isFilled && (isOfferExpired(offer) || offer.status === "clôturée");
    return !offer.isFilled && !isOfferExpired(offer) && offer.status !== "clôturée";
  });
  const counts = {
    active: offers.filter((offer) => !offer.isFilled && !isOfferExpired(offer) && offer.status !== "clôturée").length,
    filled: offers.filter((offer) => offer.isFilled === true).length,
    expired: offers.filter((offer) => !offer.isFilled && (isOfferExpired(offer) || offer.status === "clôturée")).length,
  };
  const loading = offersQuery.isLoading || applicationsQuery.isLoading || profilesQuery.isLoading;
  const error = !supabase
    ? lang === "fr" ? "Connexion à Supabase indisponible." : "Supabase is unavailable."
    : offersQuery.isError
      ? lang === "fr" ? "Impossible de charger vos offres." : "Could not load your jobs."
      : applicationsQuery.isError
        ? lang === "fr" ? "Impossible de charger les candidatures." : "Could not load applications."
        : profilesQuery.isError
          ? lang === "fr" ? "Impossible de charger le profil entreprise." : "Could not load the company profile."
          : undefined;

  const copyFilledMessage = async (offer: Offer) => {
    const message = lang === "fr"
      ? `Le poste « ${offer.title} » chez ${companyName} a été pourvu. Merci pour votre intérêt.`
      : `The position "${offer.title}" at ${companyName} has been filled. Thank you for your interest.`;
    try {
      await navigator.clipboard.writeText(message);
      toast.success(lang === "fr" ? "Message copié." : "Message copied.");
    } catch (copyError) {
      console.error("Could not copy the filled-job message:", copyError);
      toast.error(lang === "fr" ? "Impossible de copier le message sur cet appareil." : "Could not copy the message on this device.");
    }
  };

  const copyOfferMessage = async (offer: Offer) => {
    const message = [
      offer.title,
      companyName,
      [offer.location.city, offer.location.region].filter(Boolean).join(" · "),
      offer.pay,
      offer.description,
      `${window.location.origin}/offres/${encodeURIComponent(offer.id)}`,
    ].filter(Boolean).join("\n");
    try {
      await navigator.clipboard.writeText(message);
      toast.success(lang === "fr" ? "Message copié." : "Message copied.");
    } catch (copyError) {
      console.error("Could not copy the job message:", copyError);
      toast.error(lang === "fr" ? "Impossible de copier le message sur cet appareil." : "Could not copy the message on this device.");
    }
  };

  if (loading) {
    return <p role="status" className="py-10 text-center text-muted-foreground">
      {lang === "fr" ? "Chargement de vos offres…" : "Loading your jobs…"}
    </p>;
  }

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{lang === "fr" ? "Espace employeur" : "Employer space"}</p>
          <h1 className="text-2xl font-semibold">{lang === "fr" ? "Mes offres" : "My jobs"}</h1>
        </div>
        <Button asChild>
          <Link to="/offres/nouveau">{lang === "fr" ? "Nouvelle offre" : "New job"}</Link>
        </Button>
      </header>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      <div role="tablist" aria-label={lang === "fr" ? "Filtrer mes offres" : "Filter my jobs"} className="flex flex-wrap gap-2">
        {([
          ["active", lang === "fr" ? "Actives" : "Active"],
          ["filled", lang === "fr" ? "Pourvues" : "Filled"],
          ["expired", lang === "fr" ? "Expirées" : "Expired"],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`min-h-11 rounded-full px-4 text-sm ${
              tab === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {label} ({counts[value]})
          </button>
        ))}
      </div>

      {visibleOffers.length === 0 ? (
        <div className="rounded-xl border p-6 text-center">
          <p className="font-medium">
            {tab === "active"
              ? lang === "fr" ? "Aucune offre active." : "No active jobs."
              : tab === "filled"
                ? lang === "fr" ? "Aucun poste pourvu." : "No filled jobs."
                : lang === "fr" ? "Aucune offre expirée." : "No expired jobs."}
          </p>
          {tab === "active" && (
            <Button asChild variant="link" className="mt-2">
              <Link to="/offres/nouveau">{lang === "fr" ? "Publier une offre" : "Post a job"}</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {visibleOffers.map((offer) => (
            <CarteOffreEmployeur
              key={offer.id}
              offer={offer}
              applicationCount={applications.filter((application) => application.offerId === offer.id).length}
              lang={lang}
              onMarkFilled={setOfferToFill}
              onCopyFilledMessage={copyFilledMessage}
              onCopyOfferMessage={copyOfferMessage}
              onPublishTelegram={(selectedOffer) => publishTelegram.mutate(selectedOffer)}
              telegramPending={publishTelegram.isPending}
            />
          ))}
        </div>
      )}

      <ConfirmerPourvu
        offerTitle={offerToFill?.title ?? null}
        pending={markFilled.isPending}
        onOpenChange={(open) => {
          if (!open && !markFilled.isPending) setOfferToFill(null);
        }}
        onConfirm={() => {
          if (offerToFill) markFilled.mutate(offerToFill.id);
        }}
      />
    </section>
  );
}
