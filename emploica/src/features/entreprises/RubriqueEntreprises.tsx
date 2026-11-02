// PROBLÈME RÉSOLU : présente les entreprises qui recrutent dans une rangée horizontale.
import { Link } from "react-router-dom";
import { useLang } from "@/lib/i18n";

export interface RecruitingCompany {
  id: string;
  name: string;
  logoUrl?: string;
  activeOfferCount: number;
}

interface RubriqueEntreprisesProps {
  companies: RecruitingCompany[];
  loading: boolean;
  error?: string;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toLocaleUpperCase())
    .join("") || "W";
}

export default function RubriqueEntreprises({ companies, loading, error }: RubriqueEntreprisesProps) {
  const { lang } = useLang();
  return (
    <section className="space-y-3" aria-labelledby="recruiting-companies-heading">
      <h2 id="recruiting-companies-heading" className="text-lg font-semibold">
        {lang === "fr" ? "Entreprises qui recrutent" : "Companies hiring"}
      </h2>
      {loading ? (
        <p role="status" className="text-sm text-muted-foreground">
          {lang === "fr" ? "Chargement des entreprises…" : "Loading companies…"}
        </p>
      ) : error ? (
        <p role="alert" className="text-sm text-destructive">{error}</p>
      ) : companies.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {lang === "fr" ? "Aucune entreprise ne recrute pour le moment." : "No companies are hiring right now."}
        </p>
      ) : (
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2" aria-label={lang === "fr" ? "Entreprises" : "Companies"}>
          {companies.map((company) => (
            <Link
              key={company.id}
              to={`/entreprises/${encodeURIComponent(company.id)}`}
              className="flex min-w-28 max-w-36 shrink-0 flex-col items-center gap-1 rounded-xl border bg-card p-3 text-center transition-colors hover:border-primary/50"
            >
              {company.logoUrl ? (
                <img src={company.logoUrl} alt="" className="h-11 w-11 rounded-xl border object-cover" />
              ) : (
                <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                  {initials(company.name)}
                </span>
              )}
              <span className="w-full truncate text-sm font-medium">{company.name}</span>
              <span className="text-xs text-muted-foreground">
                {company.activeOfferCount} {lang === "fr" ? "offre(s)" : "job(s)"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
