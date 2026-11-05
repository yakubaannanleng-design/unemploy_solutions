// PROBLÈME RÉSOLU : regroupe les statuts persistés des candidatures pour les filtres du candidat.
import type { Application, ApplicationStatus } from "@/types";

export type ApplicationStatusFilter = "all" | "review" | "retained" | "rejected" | "withdrawn";

export const APPLICATION_STATUS_FILTERS: ApplicationStatusFilter[] = [
  "all",
  "review",
  "retained",
  "rejected",
  "withdrawn",
];

export function getApplicationStatusFilter(
  status: ApplicationStatus,
): Exclude<ApplicationStatusFilter, "all"> {
  switch (status) {
    case "envoyée":
    case "consultée":
      return "review";
    case "retenue":
      return "retained";
    case "refusée":
      return "rejected";
    case "retirée":
      return "withdrawn";
  }
}

export function filterApplications(
  applications: Application[],
  filter: ApplicationStatusFilter,
): Application[] {
  if (filter === "all") return applications;
  return applications.filter((application) => getApplicationStatusFilter(application.status) === filter);
}
