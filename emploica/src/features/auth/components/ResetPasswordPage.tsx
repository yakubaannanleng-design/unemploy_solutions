// PROBLÈME RÉSOLU : permet de définir un nouveau mot de passe depuis le lien email sécurisé.
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("passwordConfirmation") ?? "");
    if (password.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirmation) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (!supabase) {
      setError("Le service de connexion est indisponible. Réessayez plus tard.");
      return;
    }

    setSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      toast.success("Mot de passe modifié avec succès.");
      navigate("/login", { replace: true });
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Impossible de modifier le mot de passe.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto my-10 w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Réinitialiser le mot de passe</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Choisissez un nouveau mot de passe pour votre compte Workca.
      </p>
      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="reset-password">Nouveau mot de passe</Label>
          <Input id="reset-password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="reset-password-confirmation">Confirmer le mot de passe</Label>
          <Input id="reset-password-confirmation" name="passwordConfirmation" type="password" autoComplete="new-password" minLength={8} required />
        </div>
        {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Enregistrement…" : "Enregistrer le nouveau mot de passe"}
        </Button>
      </form>
    </section>
  );
}
