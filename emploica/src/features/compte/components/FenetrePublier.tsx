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
            {lang === "fr" ? "Pour publier, créez votre profil professionnel" : "Create your professional profile to post a job"}
          </DialogTitle>
          <DialogDescription>
            {lang === "fr" ? "Indiquez si vous publiez au nom d'une entreprise, d'une association ou comme particulier." : "Choose whether you are posting for a company, an association, or as an individual."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {lang === "fr" ? "Plus tard" : "Later"}
          </Button>
          <Button type="button" onClick={onCreateProfile}>
            {lang === "fr" ? "Créer mon profil professionnel" : "Create my professional profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
