/**
 * PROBLÈME RÉSOLU : présente le détail d'une offre sur une route partageable.
 * RESPONSABILITÉ  : charge l'offre depuis Supabase et permet de postuler ou partager.
 * NE FAIT PAS     : ne conserve aucune donnée métier dans le stockage local.
 * DÉPEND DE       : features/jobs/hooks, features/applications, lib/supabase, utils/partageWhatsApp.
 * UTILISÉ PAR     : app/routes (/offres/:id).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Mail, MapPin, MessageCircle, Phone, Share2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUserApplications } from "@/features/applications/hooks/useApplications";
import { useEmployerProfiles } from "@/features/employers/hooks/useEmployerProfiles";
import { useOffers } from "@/features/jobs/hooks/useOffers";
import BadgeVerifie from "@/features/jobs/components/BadgeVerifie";
import MessagePrevention from "@/features/jobs/components/MessagePrevention";
import SignalerOffre from "@/features/jobs/components/SignalerOffre";
import BadgePourvu from "@/features/jobs/components/BadgePourvu";
import BandeauOffrePourvue from "@/features/jobs/components/BandeauOffrePourvue";
import { isOfferExpired, isRecentlyFilledOffer } from "@/features/jobs/utils/filledOffers";
import { useRecordOfferView } from "@/features/employeur/hooks/useRecordOfferView";
import { useLang } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";
import { partagerOffre } from "@/utils/partageWhatsApp";
import type { Offer } from "@/types";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toLocaleUpperCase())
    .join("") || "W";
}

function contractLabel(contract: Offer["contract"], lang: string): string {
  if (contract === "permanent") return "CDI";
  if (contract === "stage") return lang === "fr" ? "Stage" : "Internship";
  if (contract === "temps-partiel") return lang === "fr" ? "Temps partiel" : "Part-time";
  if (contract === "indépendant") return lang === "fr" ? "Indépendant" : "Freelance";
  return contract;
}

export default function DetailOffre() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { lang } = useLang();
  const { currentUser, state } = useStore();
  const [coverMessage, setCoverMessage] = useState("");
  const offersQuery = useOffers();
  const employerProfilesQuery = useEmployerProfiles();
  const applicationsQuery = useUserApplications(currentUser.id);
  const offer = offersQuery.data?.find((item) => item.id === id);
  const employerProfile = employerProfilesQuery.data?.find((profile) => profile.userId === offer?.employerId);
  const employerName = employerProfile?.orgName ?? "";
  const isRecentlyFilled = offer ? isRecentlyFilledOffer(offer) : false;
  const isExpired = offer ? isOfferExpired(offer) : false;
  useRecordOfferView(offer, currentUser.id);
  const employerContactQuery = useQuery({
    queryKey: ["employerContact", offer?.employerId],
    enabled: !!supabase && !!offer?.employerId,
    queryFn: async () => {
      if (!supabase || !offer?.employerId) throw new Error("Les coordonnées de l'employeur sont indisponibles.");
      const { data, error } = await supabase
        .from("users")
        .select("phone")
        .eq("id", offer.employerId)
        .maybeSingle();
      if (error) throw error;
      return typeof data?.phone === "string" ? data.phone : "";
    },
  });
  const isOwner = currentUser.role === "employeur" && offer?.employerId === currentUser.id;
  const canApply = currentUser.role === "chercheur" && !isOwner && !isExpired;
  const isApplied = (applicationsQuery.data ?? []).some((application) => application.offerId === offer?.id);
  const seekerProfile = state.seekers.find((profile) => profile.userId === currentUser.id);

  const applyMutation = useMutation({
    mutationFn: async (target: Offer) => {
      if (!supabase) throw new Error(lang === "fr" ? "Le service des offres est indisponible." : "The jobs service is unavailable.");
      if (target.cvRequired && !seekerProfile?.cvUrl) {
        throw new Error(lang === "fr" ? "Cette offre exige un CV. Ajoutez-le dans votre profil avant de postuler." : "This job requires a resume. Add it to your profile before applying.");
      }
      const createdAt = new Date().toISOString();
      const { error } = await supabase.from("applications").insert({
        id: `app-${Math.random().toString(36).slice(2, 9)}`,
        offer_id: target.id,
        seeker_id: currentUser.id,
        status: "envoyee",
        created_at: createdAt,
        cover_message: coverMessage.trim() || null,
        cv_path: seekerProfile?.cvUrl ?? null,
      });
      if (error) throw error;

      const notificationResult = await supabase.from("notifications").insert({
        id: `notif-${Math.random().toString(36).slice(2, 9)}`,
        user_id: target.employerId,
        type: "candidature",
        body: `${currentUser.name} a candidaté à « ${target.title} ».`,
        created_at: createdAt,
        read: false,
      });
      if (notificationResult.error) {
        toast.error(notificationResult.error.message);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["applications", currentUser.id] });
      toast.success(lang === "fr" ? "Votre candidature a été envoyée." : "Your application was sent.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : lang === "fr" ? "Impossible d'envoyer la candidature." : "Could not submit application.");
    },
  });
  const reportMutation = useMutation({
    mutationFn: async (reason: string) => {
      if (!supabase) throw new Error(lang === "fr" ? "Le service de signalement est indisponible." : "The reporting service is unavailable.");
      if (!offer) throw new Error(lang === "fr" ? "Cette offre est introuvable." : "This job was not found.");
      const { error } = await supabase.from("signalements").insert({
        id: `sig-${Math.random().toString(36).slice(2, 9)}`,
        author_id: currentUser.id,
        target_type: "offre",
        target_id: offer.id,
        reason,
        created_at: new Date().toISOString(),
        status: "en-attente",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(lang === "fr" ? "Merci, votre signalement a été envoyé." : "Thank you, your report was submitted.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : lang === "fr" ? "Impossible d'envoyer le signalement." : "Could not submit report.");
    },
  });

  if (offersQuery.isLoading) {
    return <p role="status" className="py-10 text-center text-muted-foreground">
      {lang === "fr" ? "Chargement de l'offre…" : "Loading job…"}
    </p>;
  }
  if (offersQuery.isError) {
    return <p role="alert" className="py-10 text-center text-destructive">
      {offersQuery.error instanceof Error
        ? offersQuery.error.message
        : lang === "fr" ? "Impossible de charger l'offre." : "Could not load job."}
    </p>;
  }
  if (!offer || ((offer.status !== "publiée" || isExpired) && !isOwner && !isRecentlyFilled)) {
    return (
      <section className="space-y-4 py-10 text-center">
        <p role="alert" className="text-muted-foreground">
          {lang === "fr" ? "Cette offre est introuvable ou n'est plus disponible." : "This job was not found or is no longer available."}
        </p>
        <Button variant="outline" onClick={() => navigate("/offres")}>
          {lang === "fr" ? "Retour aux offres" : "Back to jobs"}
        </Button>
      </section>
    );
  }

  const companyLabel = employerName || (lang === "fr" ? "Employeur" : "Employer");
  const employerPhone = offer.contactPhone || employerContactQuery.data || "";
  const phoneDigits = employerPhone.replace(/\D/g, "");
  const phoneLink = employerPhone.replace(/[^\d+]/g, "");
  const legacyContact = offer.contactMode === undefined;
  const canContactByWhatsApp = !isExpired && (legacyContact || offer.contactMode === "whatsapp");
  const canContactByPhone = !isExpired && (legacyContact || offer.contactMode === "appel");
  const canApplyWithProfile = canApply && (legacyContact || offer.contactMode === "profil");
  const contactMessage = encodeURIComponent(
    lang === "fr"
      ? `Bonjour ${companyLabel}, je vous contacte au sujet de l'offre « ${offer.title} » à ${offer.location.city}.`
      : `Hello ${companyLabel}, I am contacting you about the job "${offer.title}" in ${offer.location.city}.`,
  );
  const unavailable = !supabase || applicationsQuery.isError || applicationsQuery.isLoading;
  const applyLabel = applicationsQuery.isError
    ? lang === "fr" ? "Candidature indisponible" : "Application unavailable"
    : offer.isFilled
      ? lang === "fr" ? "Poste pourvu" : "Position filled"
      : isApplied || applyMutation.isSuccess
      ? lang === "fr" ? "Candidature envoyée" : "Application sent"
      : lang === "fr" ? "Postuler" : "Apply";

  return (
    <article className="space-y-6 pb-24">
      <Button variant="ghost" className="-ml-3" onClick={() => navigate(-1)}>
        <ArrowLeft aria-hidden="true" />
        {lang === "fr" ? "Retour" : "Back"}
      </Button>

      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-semibold text-primary"
          >
            {initials(companyLabel)}
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold">{offer.title}</h1>
            <p className="truncate text-sm text-muted-foreground">
              {employerProfile ? (
                <Link
                  to={`/entreprises/${encodeURIComponent(offer.employerId)}`}
                  className="hover:text-primary hover:underline"
                >
                  {companyLabel}
                </Link>
              ) : companyLabel}
              {offer.location.city && ` · ${offer.location.city}`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[contractLabel(offer.contract, lang), offer.pay, offer.schedule]
            .filter(Boolean)
            .map((badge) => (
              <span key={badge} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                {badge}
              </span>
            ))}
        </div>
        <BadgeVerifie verification={employerProfile?.verification} />
        {offer.isFilled && <BadgePourvu filledAt={offer.filledAt} />}
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          {[offer.location.region, offer.location.city, offer.location.quartier].filter(Boolean).join(" · ")}
        </p>
      </header>

      {employerProfilesQuery.isError && (
        <p role="alert" className="text-sm text-destructive">
          {lang === "fr" ? "Impossible de charger les informations de l'entreprise." : "Could not load company information."}
        </p>
      )}
      {employerContactQuery.isError && (
        <p role="alert" className="text-sm text-destructive">
          {lang === "fr" ? "Impossible de charger les coordonnées de l'employeur." : "Could not load employer contact details."}
        </p>
      )}

      <MessagePrevention />

      {offer.isFilled && (
        <BandeauOffrePourvue
          offer={offer}
          offers={offersQuery.data ?? []}
          employerNames={new Map(
            (employerProfilesQuery.data ?? []).map((profile) => [profile.userId, profile.orgName]),
          )}
        />
      )}

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">{lang === "fr" ? "Description" : "Description"}</h2>
        <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">{offer.description}</p>
      </section>

      {offer.skills.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{lang === "fr" ? "Compétences" : "Skills"}</h2>
          <ul className="flex flex-wrap gap-2">
            {offer.skills.map((skill) => (
              <li key={skill} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {skill}
              </li>
            ))}
          </ul>
        </section>
      )}

      {offer.tasks.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{lang === "fr" ? "Missions" : "Responsibilities"}</h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            {offer.tasks.map((task, index) => <li key={`${index}-${task}`}>{task}</li>)}
          </ul>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3 rounded-xl border p-4 text-sm">
        <div>
          <p className="text-muted-foreground">{lang === "fr" ? "Durée" : "Duration"}</p>
          <p className="font-medium">{offer.duration || "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{lang === "fr" ? "Rémunération" : "Compensation"}</p>
          <p className="font-medium">{offer.pay || "—"}</p>
        </div>
      </section>

      <div className="space-y-3 pb-2">
        <div className="flex flex-wrap gap-2">
          {canContactByWhatsApp && phoneDigits && (
            offer.isFilled ? (
              <Button type="button" disabled className="bg-[#25D366] text-white opacity-60">
                <MessageCircle aria-hidden="true" />
                WhatsApp
              </Button>
            ) : (
              <a
                href={`https://wa.me/${phoneDigits}?text=${contactMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#25D366] px-4 text-sm font-medium text-white hover:bg-[#20bd5a]"
              >
                <MessageCircle aria-hidden="true" className="h-4 w-4" />
                WhatsApp
              </a>
            )
          )}
          {canContactByPhone && phoneLink && (
            <Button variant="outline" asChild={!offer.isFilled} disabled={offer.isFilled}>
              {offer.isFilled ? (
                <span>
                  <Phone aria-hidden="true" />
                  {lang === "fr" ? "Appeler" : "Call"}
                </span>
              ) : (
                <a href={`tel:${phoneLink}`}>
                  <Phone aria-hidden="true" />
                  {lang === "fr" ? "Appeler" : "Call"}
                </a>
              )}
            </Button>
          )}
          {offer.contactEmail && (
            <Button variant="outline" asChild>
              <a href={`mailto:${offer.contactEmail}`}>
                <Mail aria-hidden="true" />
                Email
              </a>
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => partagerOffre(offer, employerName)}>
            <Share2 aria-hidden="true" />
            {lang === "fr" ? "Partager l'offre" : "Share job"}
          </Button>
        </div>
        <SignalerOffre
          pending={reportMutation.isPending}
          submitted={reportMutation.isSuccess}
          onSubmit={(reason, onSuccess) => reportMutation.mutate(reason, { onSuccess })}
        />
      </div>

      <div className="fixed inset-x-0 bottom-16 z-40 border-t bg-background px-4 py-3">
        <div className="container flex gap-3">
          {canApplyWithProfile && (
            <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Textarea
              aria-label={lang === "fr" ? "Message de candidature (facultatif)" : "Application message (optional)"}
              value={coverMessage}
              onChange={(event) => setCoverMessage(event.target.value)}
              placeholder={lang === "fr" ? "Ajouter un message (facultatif)" : "Add an optional message"}
              rows={2}
              className="min-h-11 flex-1 resize-none bg-background"
            />
            <Button
              className="min-h-11 sm:min-w-36"
              onClick={() => applyMutation.mutate(offer)}
              disabled={
                isApplied ||
                offer.isFilled === true ||
                applyMutation.isPending ||
                applyMutation.isSuccess ||
                unavailable ||
                offer.status !== "publiée"
              }
            >
              {applyMutation.isPending
                ? lang === "fr" ? "Envoi…" : "Sending…"
                : applyLabel}
            </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
