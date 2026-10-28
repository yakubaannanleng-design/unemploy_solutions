// Page de politique de confidentialité.
import { useLang } from "../../lib/i18n";

export default function PrivacyView() {
  const { lang } = useLang();
  return (
    <div className="max-w-2xl space-y-4">
      <h2 className="text-xl font-semibold">{lang === "fr" ? "Politique de confidentialité" : "Privacy policy"}</h2>
      <p className="text-sm text-muted-foreground">
        {lang === "fr"
          ? "Workca collecte uniquement les données nécessaires au fonctionnement du service (nom, téléphone, profil). Ces données sont stockées localement dans cette version de démonstration."
          : "Workca collects only the data necessary for the service (name, phone, profile). In this demo version, data is stored locally."}
      </p>
      <p className="text-sm text-muted-foreground">
        {lang === "fr"
          ? "Vous pouvez supprimer votre compte et vos données à tout moment depuis les paramètres."
          : "You can delete your account and data at any time from settings."}
      </p>
      <h3 className="font-semibold mt-4">{lang === "fr" ? "Politique relative aux cookies" : "Cookie policy"}</h3>
      <p className="text-sm text-muted-foreground">
        {lang === "fr"
          ? "Workca utilise le stockage local et des cookies techniques pour maintenir la session, mémoriser la langue et le thème, et stocker les données de démonstration. Aucun cookie publicitaire ou de suivi tiers n'est utilisé dans cette version."
          : "Workca uses local storage and technical cookies to maintain the session, remember language and theme, and store demo data. No advertising or third-party tracking cookies are used in this version."}
      </p>
    </div>
  );
}