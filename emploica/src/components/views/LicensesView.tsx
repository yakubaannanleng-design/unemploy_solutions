// Page des licences open source.
import { useLang } from "../../lib/i18n";

export default function LicensesView() {
  const { lang } = useLang();
  const libs = ["React", "Vite", "Tailwind CSS", "shadcn/ui", "Radix UI", "Lucide", "Recharts", "React Router", "Zod", "React Hook Form"];
  return (
    <div className="max-w-2xl space-y-4">
      <h2 className="text-xl font-semibold">{lang === "fr" ? "Licences open source" : "Open source licenses"}</h2>
      <p className="text-sm text-muted-foreground">
        {lang === "fr" ? "Cette application utilise les bibliothèques suivantes :" : "This application uses the following libraries:"}
      </p>
      <ul className="list-disc list-inside text-sm text-muted-foreground">
        {libs.map((l) => <li key={l}>{l}</li>)}
      </ul>
    </div>
  );
}