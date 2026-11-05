/**
 * PROBLÈME RÉSOLU : panneau de filtres détaillés pour les offres.
 * RESPONSABILITÉ  : collecte et réinitialise les critères avant de confirmer le nombre de résultats.
 * NE FAIT PAS     : ne charge pas les offres et ne modifie pas les données Supabase.
 * DÉPEND DE       : components/ui/*, data/locations, lib/i18n.
 * UTILISÉ PAR     : features/jobs/OffersView.
 */
import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { LOCATIONS } from "@/data/locations";
import { useLang } from "@/lib/i18n";
import { DEFAULT_OFFER_FILTERS, type CompleteOfferFilters } from "../utils/offerFilters";

interface PanneauFiltresProps {
  value: CompleteOfferFilters;
  resultCount: number;
  onChange: (filters: CompleteOfferFilters) => void;
}

const cityEntries = Object.values(LOCATIONS).flat();
const educationLevels = [
  { value: "bac", label: "BAC" },
  { value: "licence", label: "Licence" },
  { value: "master", label: "Master" },
];
const experienceLevels = [
  { value: "debutant", label: "Débutant" },
  { value: "1-3", label: "1 à 3 ans" },
  { value: "3+", label: "3 ans et +" },
];

export default function PanneauFiltres({ value, resultCount, onChange }: PanneauFiltresProps) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const isFrench = lang === "fr";
  const neighborhoodOptions = cityEntries.find((entry) => entry.city === value.city)?.quartiers ?? [];
  const hasInvalidSalary =
    (value.salaryMin !== undefined && value.salaryMin < 0) ||
    (value.salaryMax !== undefined && value.salaryMax < 0) ||
    (value.salaryMin !== undefined &&
      value.salaryMax !== undefined &&
      value.salaryMin > value.salaryMax);

  const update = <K extends keyof CompleteOfferFilters>(
    key: K,
    nextValue: CompleteOfferFilters[K],
  ) => onChange({ ...value, [key]: nextValue });

  const selectOptions = (
    label: string,
    valueKey: keyof CompleteOfferFilters,
    options: { value: string; label: string }[],
  ) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={value[valueKey] === ""}
          onClick={() => update(valueKey, "")}
          className={`rounded-full border px-3 py-1.5 text-sm ${
            value[valueKey] === "" ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50"
          }`}
        >
          {isFrench ? "Tous" : "All"}
        </button>
        {options.map((option) => {
          const active = value[valueKey] === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => update(valueKey, active ? "" : option.value)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                active ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" className="w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          {isFrench ? "Filtres complets" : "All filters"}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>{isFrench ? "Filtres" : "Filters"}</SheetTitle>
        </SheetHeader>
        <div className="mx-auto mt-5 grid max-w-3xl gap-5 pb-2 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="offer-filter-city">{isFrench ? "Ville" : "City"}</Label>
            <Select
              value={value.city || "all"}
              onValueChange={(city) => onChange({
                ...value,
                city: city === "all" ? "" : city,
                quartier: "",
              })}
            >
              <SelectTrigger id="offer-filter-city"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isFrench ? "Toutes les villes" : "All cities"}</SelectItem>
                {[...new Set(cityEntries.map((entry) => entry.city))].sort().map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="offer-filter-neighborhood">{isFrench ? "Quartier" : "Neighborhood"}</Label>
            <Select
              value={value.quartier || "all"}
              onValueChange={(quartier) => update("quartier", quartier === "all" ? "" : quartier)}
              disabled={!value.city}
            >
              <SelectTrigger id="offer-filter-neighborhood"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isFrench ? "Tous les quartiers" : "All neighborhoods"}</SelectItem>
                {neighborhoodOptions.map((quartier) => (
                  <SelectItem key={quartier} value={quartier}>{quartier}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectOptions(isFrench ? "Contrat" : "Contract", "contract", [
            { value: "permanent", label: "CDI" },
            { value: "temporaire", label: "CDD" },
            { value: "stage", label: isFrench ? "Stage" : "Internship" },
            { value: "indépendant", label: isFrench ? "Freelance" : "Freelance" },
          ])}
          {selectOptions(isFrench ? "Niveau d’études" : "Education level", "educationLevel", educationLevels)}
          {selectOptions(isFrench ? "Expérience" : "Experience", "experienceLevel", experienceLevels)}

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">{isFrench ? "Fourchette de salaire (FCFA)" : "Salary range (XAF)"}</legend>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                inputMode="numeric"
                aria-label={isFrench ? "Salaire minimum" : "Minimum salary"}
                placeholder={isFrench ? "Minimum" : "Minimum"}
                value={value.salaryMin ?? ""}
                onChange={(event) => update("salaryMin", event.target.value ? Number(event.target.value) : undefined)}
              />
              <Input
                type="number"
                min="0"
                inputMode="numeric"
                aria-label={isFrench ? "Salaire maximum" : "Maximum salary"}
                placeholder={isFrench ? "Maximum" : "Maximum"}
                value={value.salaryMax ?? ""}
                onChange={(event) => update("salaryMax", event.target.value ? Number(event.target.value) : undefined)}
              />
            </div>
            {hasInvalidSalary && (
              <p role="alert" className="text-sm text-destructive">
                {value.salaryMin !== undefined && value.salaryMin < 0 || value.salaryMax !== undefined && value.salaryMax < 0
                  ? isFrench ? "Le salaire doit être positif." : "Salary must be positive."
                  : isFrench ? "Le minimum doit être inférieur au maximum." : "Minimum salary must not exceed maximum."}
              </p>
            )}
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="offer-filter-date">{isFrench ? "Date de publication" : "Publication date"}</Label>
            <Select
              value={value.publishedWithinDays?.toString() ?? "all"}
              onValueChange={(days) => update("publishedWithinDays", days === "all" ? undefined : Number(days))}
            >
              <SelectTrigger id="offer-filter-date"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isFrench ? "Toutes les dates" : "Any time"}</SelectItem>
                <SelectItem value="1">{isFrench ? "Dernières 24 heures" : "Past 24 hours"}</SelectItem>
                <SelectItem value="7">{isFrench ? "7 derniers jours" : "Past 7 days"}</SelectItem>
                <SelectItem value="30">{isFrench ? "30 derniers jours" : "Past 30 days"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-3 sm:col-span-2">
            <Label htmlFor="hide-filled-offers" className="cursor-pointer">
              {isFrench ? "Masquer les offres pourvues" : "Hide filled jobs"}
            </Label>
            <Switch
              id="hide-filled-offers"
              checked={value.hideFilled}
              onCheckedChange={(checked) => update("hideFilled", checked)}
            />
          </div>

          <div className="flex gap-3 sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onChange(DEFAULT_OFFER_FILTERS)}
            >
              {isFrench ? "Réinitialiser" : "Reset"}
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={hasInvalidSalary}
              onClick={() => setOpen(false)}
            >
              {isFrench ? `Voir ${resultCount} offres` : `See ${resultCount} jobs`}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
