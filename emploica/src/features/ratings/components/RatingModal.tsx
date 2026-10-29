/**
 * PROBLÈME RÉSOLU : affiche la modal de notation (étoiles + commentaire) pour un utilisateur cible.
 * RESPONSABILITÉ  : rendu de la modal et collecte de la note/commentaire, puis appel du callback onSubmit.
 * NE FAIT PAS     : n'enregistre pas la note (délégué à l'appelant via onSubmit) ; ne parle pas à Supabase.
 * DÉPEND DE       : lib/i18n, components/ui/*.
 * UTILISÉ PAR     : features/jobs (OffersView, temporaire) et features/profiles (ProfileView, temporaire).
 */
import { useState } from "react";
import { Star } from "lucide-react";
import { useLang, t } from "lib/i18n";
import { Button } from "components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "components/ui/dialog";

interface RatingModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  targetId: string;
  targetName: string;
  role: "employeur" | "chercheur";
  onSubmit: (score: number, comment: string) => void;
}

export default function RatingModal({ open, onOpenChange, targetId, targetName, role, onSubmit }: RatingModalProps) {
  const { lang } = useLang();
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const submit = () => {
    if (score === 0) return;
    onSubmit(score, comment);
    setScore(0);
    setComment("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {role === "employeur" ? t("rateEmployer", lang) : (lang === "fr" ? "Évaluer le travailleur" : "Rate the worker")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                onMouseEnter={() => setHover(i + 1)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setScore(i + 1)}
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    (hover || score) > i ? "text-brand-500 fill-brand-500" : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={lang === "fr" ? "Comment (optionnel)" : "Comment (optional)"}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>{t("cancel", lang)}</Button>
            <Button onClick={submit} disabled={score === 0}>{t("save", lang)}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}