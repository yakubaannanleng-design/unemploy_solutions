/**
 * PROBLÈME RÉSOLU : crée le profil employeur associé au compte existant.
 * RESPONSABILITÉ  : valide et enregistre le profil d'entreprise dans Supabase.
 * NE FAIT PAS     : ne crée pas de nouveau compte ni d'offre.
 * DÉPEND DE       : features/employers, lib/supabase, components/ui/*.
 * UTILISÉ PAR     : app (route /profil-employeur).
 */
import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEmployerProfiles } from "@/features/employers/hooks/useEmployerProfiles";
import useTypeCompte from "@/features/compte/hooks/useTypeCompte";
import { useLang } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";
import type { EmployerProfile } from "@/types";

interface CompanyFields {
  orgName: string;
  sector: string;
  city: string;
  description: string;
  logoUrl: string;
}

export default function FormulaireProfilEntreprise() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { currentUser, state, update } = useStore();
  const { selectSpace } = useTypeCompte();
  const profilesQuery = useEmployerProfiles();
  const existing = profilesQuery.data?.find((profile) => profile.userId === currentUser.id);
  const [fields, setFields] = useState<CompanyFields>({
    orgName: existing?.orgName ?? "",
    sector: existing?.sector ?? "",
    city: existing?.city ?? "",
    description: existing?.description ?? "",
    logoUrl: existing?.logoUrl ?? "",
  });
  useEffect(() => {
    if (!existing) return;
    setFields({
      orgName: existing.orgName,
      sector: existing.sector ?? "",
      city: existing.city ?? "",
      description: existing.description,
      logoUrl: existing.logoUrl ?? "",
    });
  }, [existing]);
  const destination = searchParams.get("redirect") === "/offres/nouveau" ? "/offres/nouveau" : "/employeur";

  const saveProfile = useMutation({
    mutationFn: async (values: CompanyFields) => {
      if (!supabase) {
        throw new Error(lang === "fr" ? "Connexion à Supabase indisponible." : "Supabase is unavailable.");
      }
      const { error } = await supabase.from("employer_profiles").upsert({
        user_id: currentUser.id,
        org_name: values.orgName.trim(),
        org_type: "entreprise",
        sector: values.sector.trim(),
        city: values.city.trim(),
        description: values.description.trim(),
        logo_url: values.logoUrl.trim() || null,
      }, { onConflict: "user_id" });
      if (error) throw error;
      return values;
    },
    onSuccess: async (values) => {
      const profile: EmployerProfile = {
        userId: currentUser.id,
        orgName: values.orgName.trim(),
        sector: values.sector.trim(),
        city: values.city.trim(),
        description: values.description.trim(),
        logoUrl: values.logoUrl.trim() || undefined,
        orgType: "entreprise",
        verification: existing?.verification ?? "déclaré",
        verifiedAt: existing?.verifiedAt,
        verificationRequested: existing?.verificationRequested,
        verificationRequestedAt: existing?.verificationRequestedAt,
      };
      update("employers", [
        ...state.employers.filter((item) => item.userId !== currentUser.id),
        profile,
      ]);
      queryClient.setQueryData<EmployerProfile[]>(["employerProfiles"], (profiles) => [
        ...(profiles ?? []).filter((item) => item.userId !== currentUser.id),
        profile,
      ]);
      await queryClient.invalidateQueries({ queryKey: ["employerProfiles"] });
      selectSpace("employeur");
      navigate(destination, { replace: true });
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveProfile.mutate(fields);
  };

  const updateField = (field: keyof CompanyFields, value: string) => {
    setFields((previous) => ({ ...previous, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{lang === "fr" ? "Profil de l'entreprise" : "Company profile"}</h1>
        <p className="text-sm text-muted-foreground">
          {lang === "fr" ? "Ces informations seront visibles sur vos offres." : "This information will appear on your job posts."}
        </p>
      </header>

      <div className="space-y-2">
        <Label htmlFor="company-name">{lang === "fr" ? "Nom de l'entreprise" : "Company name"}</Label>
        <Input id="company-name" value={fields.orgName} onChange={(event) => updateField("orgName", event.target.value)} required maxLength={120} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company-sector">{lang === "fr" ? "Secteur" : "Industry"}</Label>
        <Input id="company-sector" value={fields.sector} onChange={(event) => updateField("sector", event.target.value)} required maxLength={100} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company-city">{lang === "fr" ? "Ville" : "City"}</Label>
        <Input id="company-city" value={fields.city} onChange={(event) => updateField("city", event.target.value)} required maxLength={100} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company-description">{lang === "fr" ? "Description" : "Description"}</Label>
        <Textarea id="company-description" value={fields.description} onChange={(event) => updateField("description", event.target.value)} rows={4} maxLength={2000} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company-logo">{lang === "fr" ? "Logo (URL, facultatif)" : "Logo (URL, optional)"}</Label>
        <Input id="company-logo" type="url" value={fields.logoUrl} onChange={(event) => updateField("logoUrl", event.target.value)} placeholder="https://…" />
      </div>

      {saveProfile.isError && (
        <p role="alert" className="text-sm text-destructive">
          {saveProfile.error instanceof Error
            ? saveProfile.error.message
            : lang === "fr" ? "Impossible d'enregistrer le profil." : "Could not save the profile."}
        </p>
      )}
      {profilesQuery.isError && (
        <p role="alert" className="text-sm text-destructive">
          {lang === "fr" ? "Impossible de charger le profil employeur." : "Could not load the employer profile."}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          {lang === "fr" ? "Annuler" : "Cancel"}
        </Button>
        <Button type="submit" disabled={saveProfile.isPending || profilesQuery.isLoading}>
          {saveProfile.isPending
            ? lang === "fr" ? "Enregistrement…" : "Saving…"
            : lang === "fr" ? "Enregistrer" : "Save"}
        </Button>
      </div>
    </form>
  );
}
