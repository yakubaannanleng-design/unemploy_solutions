import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLang } from "@/lib/i18n";
import type { OfferContactMode } from "@/types";
import type { PublicationDraft } from "./types";

interface Etape3ContactProps {
  draft: PublicationDraft;
  update: (values: Partial<PublicationDraft>) => void;
}

const choices: {
  value: OfferContactMode;
  label: string;
  labelEn: string;
  description: string;
  descriptionEn: string;
}[] = [
  {
    value: "profil",
    label: "Postuler avec son profil",
    labelEn: "Apply with a profile",
    description: "Les candidats envoient leur candidature dans Workca.",
    descriptionEn: "Candidates submit their application in Workca.",
  },
  {
    value: "whatsapp",
    label: "Contacter sur WhatsApp",
    labelEn: "Contact via WhatsApp",
    description: "Les candidats vous écrivent directement.",
    descriptionEn: "Candidates message you directly.",
  },
  {
    value: "appel",
    label: "Appeler",
    labelEn: "Call",
    description: "Les candidats vous contactent par téléphone.",
    descriptionEn: "Candidates contact you by phone.",
  },
];

export default function Etape3Contact({ draft, update }: Etape3ContactProps) {
  const { lang } = useLang();
  const needsPhone = draft.contactMode !== "profil";
  return (
    <section className="space-y-5" aria-labelledby="publication-step-title">
      <h2 id="publication-step-title" className="text-lg font-semibold">
        {lang === "fr" ? "Comment souhaitez-vous être contacté ?" : "How should candidates contact you?"}
      </h2>
      <RadioGroup
        value={draft.contactMode}
        onValueChange={(contactMode) => update({ contactMode: contactMode as OfferContactMode })}
        className="space-y-2"
      >
        {choices.map((choice) => (
          <Label
            key={choice.value}
            htmlFor={`contact-${choice.value}`}
            className="flex cursor-pointer items-start gap-3 rounded-lg border p-3"
          >
            <RadioGroupItem id={`contact-${choice.value}`} value={choice.value} className="mt-1" />
            <span>
              <span className="block font-medium">{lang === "fr" ? choice.label : choice.labelEn}</span>
              <span className="mt-1 block text-sm font-normal text-muted-foreground">
                {lang === "fr" ? choice.description : choice.descriptionEn}
              </span>
            </span>
          </Label>
        ))}
      </RadioGroup>

      {needsPhone && (
        <div className="space-y-2">
          <Label htmlFor="contact-phone">{lang === "fr" ? "Numéro de téléphone" : "Phone number"}</Label>
          <Input
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            value={draft.contactPhone}
            onChange={(event) => update({ contactPhone: event.target.value })}
            placeholder="+237 6XX XXX XXX"
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="contact-email">{lang === "fr" ? "Email de contact (facultatif)" : "Contact email (optional)"}</Label>
        <Input
          id="contact-email"
          type="email"
          autoComplete="email"
          value={draft.contactEmail}
          onChange={(event) => update({ contactEmail: event.target.value })}
          placeholder="recrutement@exemple.cm"
        />
      </div>

      <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
        <div>
          <Label htmlFor="share-telegram">{lang === "fr" ? "Partager aussi sur Telegram" : "Also share on Telegram"}</Label>
          <p className="mt-1 text-sm text-muted-foreground">
            {draft.shareTelegram
              ? lang === "fr"
                ? "L'offre sera publiée sur Telegram après validation."
                : "The job will be published on Telegram after approval."
              : lang === "fr" ? "Votre offre sera publiée dans Workca." : "Your job will be published on Workca."}
          </p>
        </div>
        <Switch
          id="share-telegram"
          checked={draft.shareTelegram}
          onCheckedChange={(shareTelegram) => update({ shareTelegram })}
        />
      </div>
    </section>
  );
}
