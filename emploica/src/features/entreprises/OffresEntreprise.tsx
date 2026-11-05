// PROBLÈME RÉSOLU : affiche les offres actives rattachées à un profil entreprise public.
import { useNavigate } from "react-router-dom";
import { useLang } from "@/lib/i18n";
import type { EmployerProfile, Offer } from "@/types";
import CarteOffre from "@/features/jobs/components/CarteOffre";

interface OffresEntrepriseProps {
  company: EmployerProfile;
  offers: Offer[];
}

export default function OffresEntreprise({ company, offers }: OffresEntrepriseProps) {
  const { lang } = useLang();
  const navigate = useNavigate();

  if (offers.length === 0) {
    return <p className="rounded-xl border p-5 text-sm text-muted-foreground">
      {lang === "fr" ? "Cette entreprise n'a pas d'offre active pour le moment." : "This company has no active jobs at the moment."}
    </p>;
  }

  return (
    <section className="space-y-3" aria-labelledby="company-jobs-heading">
      <h2 id="company-jobs-heading" className="text-lg font-semibold">
        {lang === "fr" ? `Offres actives (${offers.length})` : `Active jobs (${offers.length})`}
      </h2>
      <div className="space-y-3">
        {offers.map((offer) => (
          <CarteOffre
            key={offer.id}
            offer={offer}
            employerName={company.orgName}
            saved={false}
            onOpen={() => navigate(`/offres/${encodeURIComponent(offer.id)}`)}
          />
        ))}
      </div>
    </section>
  );
}
