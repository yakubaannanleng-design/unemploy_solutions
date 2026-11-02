import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CarteChiffreProps {
  label: string;
  value: number;
  icon: LucideIcon;
  description?: string;
}

export default function CarteChiffre({ label, value, icon: Icon, description }: CarteChiffreProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-2xl font-bold tabular-nums">{value.toLocaleString("fr-FR")}</p>
          <p className="mt-1 text-sm font-medium">{label}</p>
          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </div>
        <span className="rounded-full bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}
