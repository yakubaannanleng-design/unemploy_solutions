import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecentCandidate } from "../hooks/useEmployerDashboard";

interface ListeCandidatsRecentsProps {
  candidates: RecentCandidate[];
  lang: "fr" | "en";
}

function statusLabel(status: RecentCandidate["status"], lang: "fr" | "en"): string {
  if (status === "envoyée") return lang === "fr" ? "Nouveau" : "New";
  if (status === "consultée") return lang === "fr" ? "En revue" : "In review";
  if (status === "retenue") return lang === "fr" ? "Retenue" : "Shortlisted";
  if (status === "refusée") return lang === "fr" ? "Refusée" : "Rejected";
  return lang === "fr" ? "Retirée" : "Withdrawn";
}

export default function ListeCandidatsRecents({ candidates, lang }: ListeCandidatsRecentsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{lang === "fr" ? "Candidatures récentes" : "Recent applications"}</CardTitle>
      </CardHeader>
      <CardContent>
        {candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {lang === "fr" ? "Aucune candidature reçue pour le moment." : "No applications received yet."}
          </p>
        ) : (
          <ul className="space-y-3">
            {candidates.map((candidate) => (
              <li key={candidate.applicationId} className="flex items-center gap-3 rounded-lg border p-3">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-semibold"
                >
                  {candidate.userName.trim().charAt(0).toUpperCase() || "?"}
                </span>
                <Link
                  to={`/employeur/candidatures/${encodeURIComponent(candidate.applicationId)}`}
                  className="min-w-0 flex-1"
                >
                  <p className="truncate font-medium">{candidate.userName}</p>
                  <p className="truncate text-sm text-muted-foreground">{candidate.offerTitle}</p>
                </Link>
                <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-xs">
                  {statusLabel(candidate.status, lang)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link
          to="/recherche?type=candidats"
          className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
        >
          {lang === "fr" ? "Voir les candidats" : "View candidates"}
        </Link>
      </CardContent>
    </Card>
  );
}
