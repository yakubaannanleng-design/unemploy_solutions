/**
 * PROBLÈME RÉSOLU : explique la création du profil employeur avant une première publication.
 * RESPONSABILITÉ  : propose de créer le profil ou de fermer la fenêtre.
 * NE FAIT PAS     : ne crée pas le profil et ne publie pas d'offre.
 * DÉPEND DE       : components/ui/button, components/ui/dialog, lib/i18n.
 * UTILISÉ PAR     : components/navigation/BottomNav.
 */
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

interface FenetrePublierProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProfile: () => void;
}

export default function FenetrePublier({
  open,
  onOpenChange,
  onCreateProfile,
}: FenetrePublierProps) {
  const { lang } = useLang();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {lang === "fr" ? "Pour publier, créez votre profil employeur" : "Create an employer profile to publish"}
          </DialogTitle>
          <DialogDescription>
            {lang === "fr" ? "Même compte, rien à refaire. Cela prend 1 minute." : "Use the same account. It only takes a minute."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {lang === "fr" ? "Plus tard" : "Later"}
          </Button>
          <Button type="button" onClick={onCreateProfile}>
            {lang === "fr" ? "Créer mon profil employeur" : "Create my employer profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
