/**
 * PROBLÈME RÉSOLU : filtre de localisation (région/ville/quartier).
 * RESPONSABILITÉ  : sélection de région, ville et quartier.
 * NE FAIT PAS     : ne parle pas à Supabase.
 * DÉPEND DE       : lib/i18n, @/data/locations, components/ui/select.
 * UTILISÉ PAR     : features/jobs, features/search.
 */
import { MapPin } from "lucide-react";
import { regions, cities, quartiers } from "@/data/locations";
import { useLang, t } from "lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";

interface LocationFilterProps {
  region: string;
  city: string;
  quartier: string;
  onChange: (field: string, value: string) => void;
}

export default function LocationFilter({ region, city, quartier, onChange }: LocationFilterProps) {
  const { lang } = useLang();
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("region", lang)}</label>
        <Select value={region} onValueChange={(v) => { onChange("region", v); onChange("city", ""); onChange("quartier", ""); }}>
          <SelectTrigger><SelectValue placeholder={t("region", lang)} /></SelectTrigger>
          <SelectContent>
            {regions().map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("city", lang)}</label>
        <Select value={city} onValueChange={(v) => { onChange("city", v); onChange("quartier", ""); }} disabled={!region}>
          <SelectTrigger><SelectValue placeholder={t("city", lang)} /></SelectTrigger>
          <SelectContent>
            {cities(region).map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("quartier", lang)}</label>
        <Select value={quartier} onValueChange={(v) => onChange("quartier", v)} disabled={!city}>
          <SelectTrigger><SelectValue placeholder={t("quartier", lang)} /></SelectTrigger>
          <SelectContent>
            {quartiers(region, city).map((q) => (
              <SelectItem key={q} value={q}>{q}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}