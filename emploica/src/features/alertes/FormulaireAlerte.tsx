import { useState, type FormEvent } from "react";
import { CATEGORIES } from "@/data/categories";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import type { ContractType } from "@/types";
import type { NewJobAlert } from "./types";

const contracts: { value: ContractType; label: string; labelEn: string }[] = [
  { value: "permanent", label: "CDI", labelEn: "Permanent" },
  { value: "temporaire", label: "Temporaire", labelEn: "Temporary" },
  { value: "mission", label: "Mission", labelEn: "Contract assignment" },
  { value: "stage", label: "Stage", labelEn: "Internship" },
  { value: "temps-partiel", label: "Temps partiel", labelEn: "Part-time" },
  { value: "indépendant", label: "Indépendant", labelEn: "Freelance" },
];

interface FormulaireAlerteProps {
  onSubmit: (alert: NewJobAlert) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export default function FormulaireAlerte({ onSubmit, onCancel, isSaving }: FormulaireAlerteProps) {
  const { lang } = useLang();
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [contract, setContract] = useState<ContractType | "">("");
  const [frequency, setFrequency] = useState<NewJobAlert["frequency"]>("immediate");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ category, city: city.trim(), contract, frequency });
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border bg-card p-4">
      <div>
        <h3 className="font-semibold">{lang === "fr" ? "Nouvelle alerte emploi" : "New job alert"}</h3>
        <p className="text-sm text-muted-foreground">
          {lang === "fr" ? "Choisissez les critères qui vous intéressent." : "Choose the criteria you are interested in."}
        </p>
      </div>
      <label className="block space-y-1">
        <span className="text-sm font-medium">{lang === "fr" ? "Catégorie" : "Category"}</span>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">{lang === "fr" ? "Toutes les catégories" : "All categories"}</option>
          {CATEGORIES.map((item) => (
            <option key={item.id} value={item.id}>{lang === "fr" ? item.name : item.nameEn}</option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">{lang === "fr" ? "Ville" : "City"}</span>
        <input
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder={lang === "fr" ? "Toutes les villes" : "All cities"}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">{lang === "fr" ? "Type de contrat" : "Contract type"}</span>
        <select
          value={contract}
          onChange={(event) => setContract(event.target.value as ContractType | "")}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">{lang === "fr" ? "Tous les contrats" : "All contracts"}</option>
          {contracts.map((item) => (
            <option key={item.value} value={item.value}>{lang === "fr" ? item.label : item.labelEn}</option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">{lang === "fr" ? "Fréquence" : "Frequency"}</span>
        <select
          value={frequency}
          onChange={(event) => setFrequency(event.target.value as NewJobAlert["frequency"])}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="immediate">{lang === "fr" ? "Immédiate" : "Immediate"}</option>
          <option value="daily">{lang === "fr" ? "Une fois par jour" : "Once a day"}</option>
        </select>
      </label>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          {lang === "fr" ? "Annuler" : "Cancel"}
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving
            ? lang === "fr" ? "Enregistrement…" : "Saving…"
            : lang === "fr" ? "Créer l'alerte" : "Create alert"}
        </Button>
      </div>
    </form>
  );
}
