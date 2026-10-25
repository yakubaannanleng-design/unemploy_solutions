import { useLang, t } from "../../lib/i18n";
import { useStore } from "../../lib/store";
import { useState } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import CategoryGrid from "../home/CategoryGrid";
import LocationFilter from "../common/LocationFilter";
import type { ContractType, Offer } from "../../types";
import { makeId } from "../../data/mockData";

const CONTRACTS: { value: ContractType; key: string }[] = [
  { value: "permanent", key: "permanent" },
  { value: "temporaire", key: "temporaire" },
  { value: "mission", key: "mission" },
  { value: "stage", key: "stage" },
  { value: "temps-partiel", key: "temps-partiel" },
  { value: "indépendant", key: "indépendant" },
];

interface OfferFormProps {
  initial?: Partial<Offer>;
  onSubmit: (offer: Omit<Offer, "id">) => void;
  onCancel: () => void;
}

export default function OfferForm({ initial, onSubmit, onCancel }: OfferFormProps) {
  const { lang } = useLang();
  const { state, currentUser } = useStore();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [tasks, setTasks] = useState(initial?.tasks?.join("\n") ?? "");
  const [categories, setCategories] = useState<string[]>(initial?.category ? [initial.category] : []);
  const [skills, setSkills] = useState(initial?.skills?.join(", ") ?? "");
  const [region, setRegion] = useState(initial?.location?.region ?? "");
  const [city, setCity] = useState(initial?.location?.city ?? "");
  const [quartier, setQuartier] = useState(initial?.location?.quartier ?? "");
  const [contract, setContract] = useState<ContractType>(initial?.contract ?? "permanent");
  const [duration, setDuration] = useState(initial?.duration ?? "");
  const [schedule, setSchedule] = useState(initial?.schedule ?? "");
  const [pay, setPay] = useState(initial?.pay ?? "");
  const [payMode, setPayMode] = useState<"fixe" | "négocier">(initial?.payMode ?? "fixe");

  const employerId = currentUser?.id ?? "u-employer";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !categories.length || !region || !city) return;
    onSubmit({
      employerId,
      title,
      description,
      tasks: tasks.split("\n").map((t) => t.trim()).filter(Boolean),
      category: categories[0],
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      location: { region, city, quartier },
      contract,
      duration,
      schedule,
      pay,
      payMode,
      createdAt: new Date().toISOString(),
      status: "en-attente",
      boost: false,
      views: 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>{t("title", lang)}</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Mécanicien automobile" required />
      </div>
      <div>
        <Label>{t("description", lang)}</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>
      <div>
        <Label>{t("tasks", lang)}</Label>
        <Textarea value={tasks} onChange={(e) => setTasks(e.target.value)} placeholder="Une tâche par ligne" rows={3} />
      </div>
      <div>
        <Label>{t("skills", lang)}</Label>
        <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Compétence1, Compétence2" />
      </div>
      <div>
        <Label>{t("category", lang)}</Label>
        <CategoryGrid
          selected={categories}
          onToggle={(id) =>
            setCategories((c) =>
              c.includes(id) ? c.filter((x) => x !== id) : [...c, id]
            )
          }
        />
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-3">
        <div className="sm:col-span-3">
          <Label>{t("region", lang)}</Label>
          <LocationFilter
            region={region}
            city={city}
            quartier={quartier}
            onChange={(f, v) => {
              if (f === "region") { setRegion(v); setCity(""); setQuartier(""); }
              else if (f === "city") { setCity(v); setQuartier(""); }
              else setQuartier(v);
            }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{t("contract", lang)}</Label>
          <Select value={contract} onValueChange={(v) => setContract(v as ContractType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CONTRACTS.map((c) => (
                <SelectItem key={c.value} value={c.value}>{t(c.key, lang)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{t("duration", lang)}</Label>
          <Input value={duration} onChange={(e) => setDuration(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{t("schedule", lang)}</Label>
          <Input value={schedule} onChange={(e) => setSchedule(e.target.value)} />
        </div>
        <div>
          <Label>{t("pay", lang)}</Label>
          <Input value={pay} onChange={(e) => setPay(e.target.value)} placeholder="Ex: 120 000 FCFA" />
        </div>
      </div>
      <div>
        <Label>Rémunération</Label>
        <Select value={payMode} onValueChange={(v) => setPayMode(v as "fixe" | "négocier")}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="fixe">{t("pay", lang)} fixe</SelectItem>
            <SelectItem value="négocier">À négocier</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Separator />
      <p className="text-xs text-muted-foreground">{t("antiScam", lang)}</p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>{t("cancel", lang)}</Button>
        <Button type="submit">{t("publish", lang)}</Button>
      </div>
    </form>
  );
}
