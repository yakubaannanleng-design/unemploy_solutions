// PROBLÈME RÉSOLU : permet à l'employeur de consulter un candidat ayant postulé et de rendre une décision persistante.
import { useMemo } from "react";
import { ArrowLeft, FileText } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApplications } from "@/features/applications/hooks/useApplications";
import { useSeekerProfiles } from "@/features/seekers/hooks/useSeekerProfiles";
import { useUsers } from "@/features/auth/hooks/useUsers";
import { useOffers } from "@/features/jobs/hooks/useOffers";
import { useLang } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import type { ApplicationStatus, User } from "@/types";

interface DetailCandidatProps {
  currentUser: User;
}

function safeHttpsUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export default function DetailCandidat({ currentUser }: DetailCandidatProps) {
  const { id = "" } = useParams<{ id: string }>();
  const { lang } = useLang();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const applicationsQuery = useApplications();
  const offersQuery = useOffers();
  const usersQuery = useUsers();
  const seekerProfilesQuery = useSeekerProfiles();
  const application = applicationsQuery.data?.find((item) => item.id === id);
  const offer = offersQuery.data?.find((item) => item.id === application?.offerId);
  const isOwner = currentUser.role === "employeur" && offer?.employerId === currentUser.id;
  const candidate = usersQuery.data?.find((item) => item.id === application?.seekerId);
  const seekerProfile = seekerProfilesQuery.data?.find((profile) => profile.userId === application?.seekerId);

  const decisionMutation = useMutation({
    mutationFn: async (status: Extract<ApplicationStatus, "retenue" | "refusée">) => {
      if (!supabase) throw new Error(lang === "fr" ? "Connexion à Supabase indisponible." : "Supabase is unavailable.");
      if (!application || !isOwner) {
        throw new Error(lang === "fr" ? "Cette candidature ne vous est pas accessible." : "You cannot access this application.");
      }
      const { data, error } = await supabase.rpc("update_application_status", {
        p_application_id: application.id,
        p_status: status === "retenue" ? "retenue" : "refusee",
      });
      if (error) throw error;
      if (data !== true) throw new Error(lang === "fr" ? "La décision n'a pas été enregistrée." : "The decision was not saved.");
      return status;
    },
    onSuccess: async (status) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["applications"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      ]);
      toast.success(status === "retenue"
        ? lang === "fr" ? "Candidature retenue. Le candidat a été notifié." : "Candidate shortlisted and notified."
        : lang === "fr" ? "Candidature refusée. Le candidat a été notifié." : "Application rejected and candidate notified.",
      );
    },
    onError: (error) => {
      toast.error(error instanceof Error
        ? error.message
        : lang === "fr" ? "Impossible d'enregistrer la décision." : "Could not save the decision.",
      );
    },
  });

  const loading =
    applicationsQuery.isLoading ||
    offersQuery.isLoading ||
    usersQuery.isLoading ||
    seekerProfilesQuery.isLoading;
  const failedQuery = [
    applicationsQuery,
    offersQuery,
    usersQuery,
    seekerProfilesQuery,
  ].find((query) => query.isError);
  const detailsError = !supabase
    ? lang === "fr"
      ? "Connexion à Supabase indisponible."
      : "Supabase is unavailable."
    : failedQuery
      ? failedQuery.error instanceof Error
        ? failedQuery.error.message
        : lang === "fr" ? "Impossible de charger le dossier candidat." : "Could not load the candidate profile."
      : undefined;

  const skills = useMemo(
    () => (seekerProfile?.skills ?? []).filter((skill): skill is string => typeof skill === "string" && !!skill.trim()),
    [seekerProfile?.skills],
  );
  const avatarUrl = safeHttpsUrl(seekerProfile?.photo);
  const cvUrl = safeHttpsUrl(seekerProfile?.cvUrl);
  const candidateInitials = (candidate?.name ?? "?")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toLocaleUpperCase())
    .join("") || "?";
  const applicationIsReviewable = application?.status === "envoyée" || application?.status === "consultée";

  if (loading) {
    return <p role="status" className="py-10 text-center text-muted-foreground">
      {lang === "fr" ? "Chargement du dossier candidat…" : "Loading candidate profile…"}
    </p>;
  }

  if (detailsError || currentUser.role !== "employeur" || !application || !offer || !isOwner) {
    const message = detailsError
      ?? (currentUser.role !== "employeur"
        ? lang === "fr" ? "Cette page est réservée aux employeurs." : "This page is for employers only."
        : lang === "fr"
          ? "Cette candidature est introuvable ou ne vous appartient pas."
          : "This application was not found or does not belong to you.");
    return (
      <section className="space-y-4 py-6">
        <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft aria-hidden="true" />
          {lang === "fr" ? "Retour" : "Back"}
        </Button>
        <p role="alert" className="text-sm text-destructive">{message}</p>
      </section>
    );
  }

  return (
    <article className="space-y-5">
      <Button type="button" variant="ghost" className="-ml-3" onClick={() => navigate(-1)}>
        <ArrowLeft aria-hidden="true" />
        {lang === "fr" ? "Retour aux candidatures" : "Back to applications"}
      </Button>

      <header className="space-y-3 text-center">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="mx-auto h-16 w-16 rounded-full border object-cover"
          />
        ) : (
          <span aria-hidden="true" className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
            {candidateInitials}
          </span>
        )}
        <div>
          <h1 className="text-2xl font-semibold">{candidate?.name ?? (lang === "fr" ? "Candidat" : "Candidate")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {[seekerProfile?.education, offer.title].filter(Boolean).join(" · ")}
          </p>
          {(seekerProfile?.zone.city || seekerProfile?.zone.region) && (
            <p className="mt-1 text-sm text-muted-foreground">
              {[seekerProfile.zone.city, seekerProfile.zone.region].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </header>

      <section className="space-y-2" aria-labelledby="candidate-skills-heading">
        <h2 id="candidate-skills-heading" className="text-lg font-semibold">
          {lang === "fr" ? "Compétences" : "Skills"}
        </h2>
        {skills.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <li key={skill} className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {skill}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            {lang === "fr" ? "Aucune compétence renseignée." : "No skills provided."}
          </p>
        )}
      </section>

      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <FileText className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          {cvUrl ? (
            <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
              {lang === "fr" ? "Voir le CV" : "View résumé"}
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">
              {lang === "fr" ? "Aucun CV transmis." : "No résumé provided."}
            </p>
          )}
        </CardContent>
      </Card>

      {applicationIsReviewable ? (
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            className="flex-1"
            disabled={decisionMutation.isPending}
            onClick={() => decisionMutation.mutate("retenue")}
          >
            {lang === "fr" ? "Convoquer" : "Shortlist"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={decisionMutation.isPending}
            onClick={() => decisionMutation.mutate("refusée")}
          >
            {lang === "fr" ? "Refuser" : "Reject"}
          </Button>
        </div>
      ) : (
        <p className="rounded-lg bg-muted p-3 text-center text-sm text-muted-foreground">
          {lang === "fr"
            ? `Cette candidature a déjà été ${application.status}.`
            : `This application has already been ${application.status}.`}
        </p>
      )}
    </article>
  );
}
