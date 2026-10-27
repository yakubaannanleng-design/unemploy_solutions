// Page des conditions d'utilisation.
import { useLang, t } from "../../lib/i18n";

export default function TermsView() {
  const { lang } = useLang();
  return (
    <div className="max-w-2xl space-y-4">
      <h2 className="text-xl font-semibold">{lang === "fr" ? "Conditions d'utilisation" : "Terms of use"}</h2>
      <p className="text-sm text-muted-foreground">
        {lang === "fr"
          ? "En utilisant Workca, vous acceptez de ne pas publier d'offres frauduleuses, de ne pas demander d'argent aux chercheurs d'emploi et de respecter les lois camerounaises."
          : "By using Workca, you agree not to post fraudulent offers, not to ask job seekers for money, and to comply with Cameroonian law."}
      </p>
      <p className="text-sm text-muted-foreground">
        {lang === "fr"
          ? "La plateforme est fournie \"en l'état\". L'éditeur ne saurait être tenu responsable des interactions entre utilisateurs."
          : "The platform is provided \"as is\". The publisher is not liable for interactions between users."}
      </p>
    </div>
  );
}