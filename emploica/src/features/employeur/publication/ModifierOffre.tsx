import { Navigate, useParams } from "react-router-dom";
import { useOffers } from "@/features/jobs/hooks/useOffers";
import { useLang } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { isOfferExpired } from "@/features/jobs/utils/filledOffers";
import PublicationOffre from "./PublicationOffre";

export default function ModifierOffre() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLang();
  const { currentUser } = useStore();
  const offersQuery = useOffers();

  if (offersQuery.isLoading) {
    return <p role="status" className="py-10 text-center text-muted-foreground">
      {lang === "fr" ? "Chargement de l'offre…" : "Loading job…"}
    </p>;
  }
  if (offersQuery.isError) {
    return <p role="alert" className="py-10 text-center text-destructive">
      {lang === "fr" ? "Impossible de charger l'offre à modifier." : "Could not load the job to edit."}
    </p>;
  }

  const offer = offersQuery.data?.find((item) => item.id === id);
  if (!offer || offer.employerId !== currentUser.id || offer.isFilled === true) {
    return <Navigate to="/employeur/offres" replace />;
  }
  if (offer.status === "clôturée" && !isOfferExpired(offer)) {
    return <Navigate to="/employeur/offres" replace />;
  }

  return (
    <PublicationOffre
      employerId={currentUser.id}
      employerPhone={currentUser.phone}
      initialOffer={offer}
    />
  );
}
