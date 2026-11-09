import type { ContractType } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LocationFilter from "@/components/common/LocationFilter";
import { useLang } from "@/lib/i18n";
import type { PublicationDraft } from "./types";

const contracts: { value: ContractType; label: string; labelEn: string }[] = [
  { value: "permanent", label: "CDI", labelEn: "Permanent" },
  { value: "temporaire", label: "CDD", labelEn: "Fixed-term" },
  { value: "mission", label: "Mission", labelEn: "Contract" },
  { value: "stage", label: "Stage", labelEn: "Internship" },
  { value: "temps-partiel", label: "Temps partiel", labelEn: "Part-time" },
  { value: "indépendant", label: "Indépendant", labelEn: "Freelance" },
];

const levels: { value: string; fr: string; en: string }[] = [
  { value: "Sans diplôme", fr: "Sans diplôme", en: "No diploma" },
  { value: "BEPC", fr: "BEPC", en: "Middle school certificate" },
  { value: "Baccalauréat", fr: "Baccalauréat", en: "High school diploma" },
  { value: "Bac +2", fr: "Bac +2", en: "2-year degree" },
  { value: "Bac +3", fr: "Bac +3", en: "3-year degree" },
  { value: "Bac +5", fr: "Bac +5", en: "5-year degree" },
];
const experienceLevels: { value: string; fr: string; en: string }[] = [
  { value: "Débutant", fr: "Débutant", en: "Entry level" },
  { value: "1 à 2 ans", fr: "1 à 2 ans", en: "1 to 2 years" },
  { value: "3 à 5 ans", fr: "3 à 5 ans", en: "3 to 5 years" },
  { value: "Plus de 5 ans", fr: "Plus de 5 ans", en: "Over 5 years" },
];

interface Etape2ConditionsProps {
  draft: PublicationDraft;
  update: (values: Partial<PublicationDraft>) => void;
  minDate: string;
}

export default function Etape2Conditions({ draft, update, minDate }: Etape2ConditionsProps) {
  const { lang } = useLang();
  return (
    <section className="space-y-5" aria-labelledby="publication-step-title">
      <h2 id="publication-step-title" className="text-lg font-semibold">
        {lang === "fr" ? "Conditions du poste" : "Job requirements"}
      </h2>
      <div className="space-y-2">
        <Label>{lang === "fr" ? "Lieu de travail" : "Location"}</Label>
        <LocationFilter
          region={draft.region}
          city={draft.city}
          quartier={draft.quartier}
          onChange={(field, value) => {
            if (field === "region") update({ region: value, city: "", quartier: "" });
            else if (field === "city") update({ city: value, quartier: "" });
            else update({ quartier: value });
          }}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="offer-contract">{lang === "fr" ? "Type de contrat" : "Contract type"}</Label>
          <Select value={draft.contract} onValueChange={(contract) => update({ contract: contract as ContractType })}>
            <SelectTrigger id="offer-contract"><SelectValue /></SelectTrigger>
            <SelectContent>
              {contracts.map((contract) => (
                <SelectItem key={contract.value} value={contract.value}>{lang === "fr" ? contract.label : contract.labelEn}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="offer-deadline">{lang === "fr" ? "Date limite" : "Deadline"}</Label>
          <Input id="offer-deadline" type="date" min={minDate} value={draft.expiresAt} onChange={(event) => update({ expiresAt: event.target.value })} required />
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
        <div>
          <Label htmlFor="offer-cv-required">{lang === "fr" ? "CV obligatoire" : "Resume required"}</Label>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "fr" ? "Les candidats devront avoir un CV enregistrÃ© pour postuler." : "Candidates must have a saved resume to apply."}
          </p>
        </div>
        <Switch id="offer-cv-required" checked={draft.cvRequired} onCheckedChange={(cvRequired) => update({ cvRequired })} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="offer-salary-min">{lang === "fr" ? "Salaire minimum (FCFA)" : "Minimum salary (FCFA)"}</Label>
          <Input id="offer-salary-min" type="number" min="0" inputMode="numeric" value={draft.salaryMin} onChange={(event) => update({ salaryMin: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="offer-salary-max">{lang === "fr" ? "Salaire maximum (FCFA)" : "Maximum salary (FCFA)"}</Label>
          <Input id="offer-salary-max" type="number" min="0" inputMode="numeric" value={draft.salaryMax} onChange={(event) => update({ salaryMax: event.target.value })} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="offer-education">{lang === "fr" ? "Niveau d'études" : "Education level"}</Label>
          <Select value={draft.educationLevel} onValueChange={(educationLevel) => update({ educationLevel })}>
            <SelectTrigger id="offer-education"><SelectValue placeholder={lang === "fr" ? "Facultatif" : "Optional"} /></SelectTrigger>
            <SelectContent>
              {levels.map((level) => <SelectItem key={level.value} value={level.value}>{lang === "fr" ? level.fr : level.en}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="offer-experience">{lang === "fr" ? "Expérience" : "Experience"}</Label>
          <Select value={draft.experienceLevel} onValueChange={(experienceLevel) => update({ experienceLevel })}>
            <SelectTrigger id="offer-experience"><SelectValue placeholder={lang === "fr" ? "Facultatif" : "Optional"} /></SelectTrigger>
            <SelectContent>
              {experienceLevels.map((level) => <SelectItem key={level.value} value={level.value}>{lang === "fr" ? level.fr : level.en}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}
