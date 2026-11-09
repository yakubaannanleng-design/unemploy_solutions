import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { isOfferExpired } from "@/features/jobs/utils/filledOffers";
import type { Offer } from "@/types";
import Etape1Poste from "./Etape1Poste";
import Etape2Conditions from "./Etape2Conditions";
import Etape3Contact from "./Etape3Contact";
import type { PublicationDraft } from "./types";

interface PublicationOffreProps {
  employerId: string;
  employerPhone: string;
  initialOffer?: Offer;
}

function localDateValue(date: Date): string {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function initialDraft(phone: string): PublicationDraft {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 30);
  return {
    title: "",
    category: "",
    description: "",
    skills: "",
    region: "",
    city: "",
    quartier: "",
    contract: "permanent",
    salaryMin: "",
    salaryMax: "",
    educationLevel: "",
    experienceLevel: "",
    cvRequired: false,
    expiresAt: localDateValue(deadline),
    contactMode: "profil",
    contactPhone: phone,
    contactEmail: "",
    shareTelegram: false,
  };
}

function draftFromOffer(offer: Offer, employerPhone: string): PublicationDraft {
  const expiry = offer.expiresAt ? new Date(offer.expiresAt) : new Date();
  if (!offer.expiresAt) expiry.setDate(expiry.getDate() + 30);
  return {
    title: offer.title,
    category: offer.category,
    description: offer.description,
    skills: offer.skills.join(", "),
    region: offer.location.region,
    city: offer.location.city,
    quartier: offer.location.quartier ?? "",
    contract: offer.contract,
    salaryMin: offer.salaryMin === undefined ? "" : String(offer.salaryMin),
    salaryMax: offer.salaryMax === undefined ? "" : String(offer.salaryMax),
    educationLevel: offer.educationLevel ?? "",
    experienceLevel: offer.experienceLevel ?? "",
    cvRequired: offer.cvRequired ?? false,
    expiresAt: localDateValue(Number.isFinite(expiry.getTime()) ? expiry : new Date()),
    contactMode: offer.contactMode ?? "profil",
    contactPhone: offer.contactPhone ?? employerPhone,
    contactEmail: offer.contactEmail ?? "",
    shareTelegram: offer.shareTelegram ?? false,
  };
}

export default function PublicationOffre({
  employerId,
  employerPhone,
  initialOffer,
}: PublicationOffreProps) {
  const { lang } = useLang();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setActiveSpace } = useStore();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState(() =>
    initialOffer ? draftFromOffer(initialOffer, employerPhone) : initialDraft(employerPhone),
  );
  const minDate = localDateValue(new Date());
  const publication = useMutation({
    mutationFn: async () => {
      if (!supabase) {
        throw new Error(lang === "fr" ? "Connexion à Supabase indisponible." : "Supabase is unavailable.");
      }
      const salaryMin = draft.salaryMin === "" ? null : Number(draft.salaryMin);
      const salaryMax = draft.salaryMax === "" ? null : Number(draft.salaryMax);
      const salary = salaryMin !== null && salaryMax !== null
        ? `${salaryMin.toLocaleString("fr-FR")} – ${salaryMax.toLocaleString("fr-FR")} FCFA`
        : salaryMin !== null
          ? `À partir de ${salaryMin.toLocaleString("fr-FR")} FCFA`
          : salaryMax !== null
            ? `Jusqu'à ${salaryMax.toLocaleString("fr-FR")} FCFA`
            : "";
      const offerId = initialOffer?.id ?? `off-${crypto.randomUUID()}`;
      const deadline = new Date(`${draft.expiresAt}T23:59:59.999`);
      if (!Number.isFinite(deadline.getTime())) {
        throw new Error(lang === "fr" ? "La date limite est invalide." : "The deadline is invalid.");
      }
      const values = {
        title: draft.title.trim(),
        description: draft.description.trim(),
        tasks: initialOffer?.tasks ?? [],
        category: draft.category,
        skills: draft.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
        location_region: draft.region,
        location_city: draft.city,
        location_quartier: draft.quartier || null,
        contract: draft.contract === "indépendant" ? "independant" : draft.contract,
        duration: initialOffer?.duration ?? "",
        schedule: initialOffer?.schedule ?? "",
        pay: salary || initialOffer?.pay || "",
        pay_mode: initialOffer?.payMode === "négocier" ? "negocier" : "fixe",
        salary_min: salaryMin,
        salary_max: salaryMax,
        education_level: draft.educationLevel || null,
        experience_level: draft.experienceLevel || null,
        cv_required: draft.cvRequired,
        contact_mode: draft.contactMode,
        contact_phone: draft.contactMode === "profil" ? null : draft.contactPhone.trim(),
        contact_email: draft.contactEmail.trim() || null,
        share_telegram: draft.shareTelegram,
        expires_at: deadline.toISOString(),
      };
      if (initialOffer) {
        const updateValues = isOfferExpired(initialOffer)
          ? { ...values, status: "en-attente" }
          : values;
        const { data, error } = await supabase
          .from("offers")
          .update(updateValues)
          .eq("id", offerId)
          .eq("employer_id", employerId)
          .select("id")
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error(lang === "fr" ? "Cette offre n'est plus modifiable." : "This job can no longer be edited.");
      } else {
        const { error } = await supabase.from("offers").insert({
          ...values,
          id: offerId,
          employer_id: employerId,
          created_at: new Date().toISOString(),
          status: "en-attente",
          boost: false,
          views: 0,
        });
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["offers"] });
      await queryClient.invalidateQueries({ queryKey: ["employerMonthlyViews", employerId] });
      setActiveSpace("employeur");
      toast.success(initialOffer
        ? lang === "fr" ? "L'offre a été mise à jour." : "The job was updated."
        : lang === "fr" ? "Votre offre a été envoyée pour validation." : "Your job was submitted for review.");
      navigate("/offres?mine=true", { replace: true });
    },
  });

  const update = (values: Partial<PublicationDraft>) => {
    setDraft((previous) => ({ ...previous, ...values }));
  };

  const next = () => {
    if (step === 1 && (!draft.title.trim() || !draft.category)) {
      toast.error(lang === "fr" ? "Indiquez un titre et une catégorie." : "Enter a title and category.");
      return;
    }
    if (step === 2) {
      if (!draft.region || !draft.city || !draft.expiresAt) {
        toast.error(lang === "fr" ? "Indiquez le lieu et la date limite." : "Enter the location and deadline.");
        return;
      }
      const salaryMin = draft.salaryMin === "" ? undefined : Number(draft.salaryMin);
      const salaryMax = draft.salaryMax === "" ? undefined : Number(draft.salaryMax);
      if (
        (salaryMin !== undefined && !Number.isFinite(salaryMin)) ||
        (salaryMax !== undefined && !Number.isFinite(salaryMax)) ||
        (salaryMin !== undefined && salaryMax !== undefined && salaryMin > salaryMax)
      ) {
        toast.error(lang === "fr" ? "Vérifiez la fourchette de salaire." : "Check the salary range.");
        return;
      }
      if (draft.expiresAt < minDate) {
        toast.error(lang === "fr" ? "La date limite doit être aujourd'hui ou plus tard." : "The deadline must be today or later.");
        return;
      }
    }
    setStep((current) => Math.min(current + 1, 3));
  };

  const submit = () => {
    if (draft.contactMode !== "profil") {
      const digits = draft.contactPhone.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) {
        toast.error(lang === "fr" ? "Indiquez un numéro de téléphone valide." : "Enter a valid phone number.");
        return;
      }
    }
    publication.mutate();
  };

  return (
    <section className="mx-auto max-w-2xl space-y-5">
      <header className="space-y-3">
        <Button type="button" variant="ghost" className="-ml-3" onClick={() => step === 1 ? navigate(-1) : setStep((current) => current - 1)}>
          <ArrowLeft aria-hidden="true" />
          {step === 1 ? (lang === "fr" ? "Retour" : "Back") : (lang === "fr" ? "Étape précédente" : "Previous step")}
        </Button>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">
            {initialOffer
              ? lang === "fr" ? "Modifier l'offre" : "Edit job"
              : lang === "fr" ? "Publier une offre" : "Post a job"}
          </h1>
          <span className="text-sm text-muted-foreground">{step} / 3</span>
        </div>
        <div
          role="progressbar"
          aria-label={lang === "fr" ? "Progression de la publication" : "Posting progress"}
          aria-valuemin={1}
          aria-valuemax={3}
          aria-valuenow={step}
          className="h-2 overflow-hidden rounded-full bg-muted"
        >
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      </header>

      {step === 1 && <Etape1Poste draft={draft} update={update} />}
      {step === 2 && <Etape2Conditions draft={draft} update={update} minDate={minDate} />}
      {step === 3 && <Etape3Contact draft={draft} update={update} />}

      {publication.isError && (
        <p role="alert" className="text-sm text-destructive">
          {publication.error instanceof Error
            ? publication.error.message
            : lang === "fr" ? "Impossible d'enregistrer l'offre." : "Could not save the job."}
        </p>
      )}

      <footer className="flex justify-end border-t pt-4">
        {step < 3 ? (
          <Button type="button" onClick={next}>
            {lang === "fr" ? "Continuer" : "Continue"}
          </Button>
        ) : (
          <Button type="button" onClick={submit} disabled={publication.isPending}>
            {publication.isPending
              ? lang === "fr" ? "Publication…" : "Publishing…"
                : initialOffer
                  ? lang === "fr" ? "Enregistrer les modifications" : "Save changes"
                  : lang === "fr" ? "Envoyer l'offre" : "Submit job"}
          </Button>
        )}
      </footer>
    </section>
  );
}
