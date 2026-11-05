import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";

interface ConfirmerPourvuProps {
  offerTitle: string | null;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function ConfirmerPourvu({
  offerTitle,
  pending,
  onOpenChange,
  onConfirm,
}: ConfirmerPourvuProps) {
  const { lang } = useLang();
  return (
    <AlertDialog open={offerTitle !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {lang === "fr" ? "Marquer ce poste comme pourvu ?" : "Mark this position as filled?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {lang === "fr"
              ? `Les candidats ne pourront plus postuler${offerTitle ? ` à « ${offerTitle} »` : ""}.`
              : `Candidates will no longer be able to apply${offerTitle ? ` for "${offerTitle}"` : ""}.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{lang === "fr" ? "Annuler" : "Cancel"}</AlertDialogCancel>
          <Button type="button" onClick={onConfirm} disabled={pending}>
            {pending
              ? lang === "fr" ? "Enregistrement…" : "Saving…"
              : lang === "fr" ? "Confirmer" : "Confirm"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
