/**
 * PROBLÈME RÉSOLU : permet de signaler une offre avec un motif explicite.
 * RESPONSABILITÉ  : collecte le motif et délègue l'enregistrement au parent.
 * NE FAIT PAS     : ne conserve pas les signalements localement.
 * DÉPEND DE       : components/ui/button, components/ui/dialog, lib/i18n.
 * UTILISÉ PAR     : features/jobs/DetailOffre.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLang } from "@/lib/i18n";

const REASONS = [
  { value: "Arnaque ou demande d'argent", en: "Scam or request for money" },
  { value: "Fausse offre", en: "Fake job offer" },
  { value: "Contenu inapproprié", en: "Inappropriate content" },
  { value: "Autre", en: "Other" },
] as const;

interface SignalerOffreProps {
  pending: boolean;
  submitted: boolean;
  onSubmit: (reason: string, onSuccess: () => void) => void;
}

export default function SignalerOffre({ pending, submitted, onSubmit }: SignalerOffreProps) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("");

  return (
    <div className="text-center">
      <Button
        type="button"
        variant="link"
        className="text-destructive"
        disabled={submitted}
        onClick={() => {
          setReason("");
          setOpen(true);
        }}
      >
        {submitted
          ? lang === "fr" ? "Offre signalée" : "Job reported"
          : lang === "fr" ? "Signaler cette offre" : "Report this job"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{lang === "fr" ? "Signaler cette offre" : "Report this job"}</DialogTitle>
            <DialogDescription>
              {lang === "fr" ? "Choisissez le motif du signalement." : "Choose a reason for your report."}
            </DialogDescription>
          </DialogHeader>
          <fieldset className="space-y-3">
            <legend className="sr-only">{lang === "fr" ? "Motif" : "Reason"}</legend>
            {REASONS.map((item) => (
              <label key={item.value} className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="radio"
                  name="report-reason"
                  value={item.value}
                  checked={reason === item.value}
                  onChange={() => setReason(item.value)}
                  className="accent-primary"
                />
                {lang === "fr" ? item.value : item.en}
              </label>
            ))}
          </fieldset>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {lang === "fr" ? "Annuler" : "Cancel"}
            </Button>
            <Button
              type="button"
              disabled={!reason || pending}
              onClick={() => onSubmit(reason, () => setOpen(false))}
            >
              {pending
                ? lang === "fr" ? "Envoi…" : "Sending…"
                : lang === "fr" ? "Envoyer" : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
