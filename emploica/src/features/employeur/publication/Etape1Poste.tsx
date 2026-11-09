import { CATEGORIES } from "@/data/categories";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLang } from "@/lib/i18n";
import { modelesOffres } from "./modelesOffres";
import type { PublicationDraft } from "./types";

interface Etape1PosteProps {
  draft: PublicationDraft;
  update: (values: Partial<PublicationDraft>) => void;
}

export default function Etape1Poste({ draft, update }: Etape1PosteProps) {
  const { lang } = useLang();
  return (
    <section className="space-y-5" aria-labelledby="publication-step-title">
      <div>
        <h2 id="publication-step-title" className="text-lg font-semibold">
          {lang === "fr" ? "Choisis un modèle" : "Choose a template"}
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {modelesOffres.map((model) => (
            <button
              key={model.id}
              type="button"
              aria-pressed={draft.category === model.category && draft.title === model.title}
              onClick={() => update({
                title: lang === "fr" ? model.title : model.titleEn,
                category: model.category,
                description: lang === "fr" ? model.description : model.descriptionEn,
              })}
              className={`min-h-11 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                draft.category === model.category && draft.title === model.title
                  ? "border-primary bg-primary/10 text-primary"
                  : "hover:bg-muted"
              }`}
            >
              {lang === "fr" ? model.label : model.labelEn}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="offer-title">{lang === "fr" ? "Titre du poste" : "Job title"}</Label>
        <Input id="offer-title" value={draft.title} onChange={(event) => update({ title: event.target.value })} maxLength={120} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="offer-category">{lang === "fr" ? "Catégorie" : "Category"}</Label>
        <Select value={draft.category} onValueChange={(category) => update({ category })}>
          <SelectTrigger id="offer-category"><SelectValue placeholder={lang === "fr" ? "Choisir une catégorie" : "Choose a category"} /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category.id} value={category.id}>{lang === "fr" ? category.name : category.nameEn}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="offer-description">{lang === "fr" ? "Description" : "Description"}</Label>
        <Textarea
          id="offer-description"
          value={draft.description}
          onChange={(event) => update({ description: event.target.value })}
          rows={5}
          maxLength={4000}
          placeholder={lang === "fr" ? "Décris les missions et le profil recherché." : "Describe the responsibilities and candidate profile."}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="offer-skills">{lang === "fr" ? "Compétences recherchées" : "Required skills"}</Label>
        <Input
          id="offer-skills"
          value={draft.skills}
          onChange={(event) => update({ skills: event.target.value })}
          placeholder={lang === "fr" ? "Ex. vente, caisse, accueil (séparer par des virgules)" : "e.g. sales, cashier, customer service (comma separated)"}
          maxLength={500}
        />
      </div>
    </section>
  );
}
