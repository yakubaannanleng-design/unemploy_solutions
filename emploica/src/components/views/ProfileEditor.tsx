import { useState } from "react";
import { useStore } from "../../lib/store";
import { useLang, t } from "../../lib/i18n";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import type { SeekerProfile } from "../../types";

interface ProfileEditorProps {
  userId: string;
  initial?: SeekerProfile;
  onSave: (p: SeekerProfile) => void;
}

export default function ProfileEditor({ userId, initial, onSave }: ProfileEditorProps) {
  const { lang } = useLang();
  const { state } = useStore();
  const [form, setForm] = useState<SeekerProfile>(
    initial ?? {
      userId,
      bio: "",
      skills: [],
      categories: [],
      contractWanted: [],
      availability: "immédiatement",
      zone: { region: "Centre", city: "Yaoundé", quartier: "Mfoundi" },
      radiusKm: 10,
      experience: "",
      languages: [],
      missionsDone: 0,
    }
  );

  const set = <K extends keyof SeekerProfile>(key: K, value: SeekerProfile[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{t("profile", lang)}</h2>
        <p className="text-sm text-muted-foreground">
          {lang === "fr"
            ? "Complétez votre profil pour être mis en relation avec des offres à proximité."
            : "Complete your profile to be matched with nearby offers."}
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>{lang === "fr" ? "À propos" : "About"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>{t("description", lang)}</Label>
            <Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={3} />
          </div>
          <div>
            <Label>{t("skills", lang)}</Label>
            <Input
              value={form.skills.join(", ")}
              onChange={(e) => set("skills", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              placeholder="Ex: mécanique, diagnostic"
            />
          </div>
          <div>
            <Label>{t("availability", lang)}</Label>
            <Input value={form.availability} onChange={(e) => set("availability", e.target.value)} />
          </div>
          <div>
            <Label>{t("experience", lang)}</Label>
            <Input value={form.experience} onChange={(e) => set("experience", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t("filters", lang)}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>{t("region", lang)} / {t("city", lang)}</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <Select value={form.zone.region} onValueChange={(v) => set("zone", { ...form.zone, region: v, city: "", quartier: "" })}>
                <SelectTrigger><SelectValue placeholder={t("region", lang)} /></SelectTrigger>
                <SelectContent>
                  {["Centre", "Littoral", "Ouest", "Nord", "Sud", "Nord-Ouest", "Sud-Ouest", "Est", "Adamawa"].map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input value={form.zone.city} onChange={(e) => set("zone", { ...form.zone, city: e.target.value })} placeholder={t("city", lang)} />
              <Input value={form.zone.quartier} onChange={(e) => set("zone", { ...form.zone, quartier: e.target.value })} placeholder={t("quartier", lang)} />
            </div>
          </div>
          <div>
            <Label>{t("distance", lang)} : {form.radiusKm} {t("distanceKm", lang)}</Label>
            <Input type="number" value={form.radiusKm} onChange={(e) => set("radiusKm", Number(e.target.value) || 0)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => onSave(form)}>{t("save", lang)}</Button>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium mb-1 block">{children}</label>;
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${props.className ?? ""}`}
    />
  );
}
function Select({ children, value, onValueChange }: any) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
    >
      {children}
    </select>
  );
}