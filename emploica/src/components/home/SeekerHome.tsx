// Composant de l interface utilisateur
import { useStore } from "../../lib/store";
import { useLang, t } from "../../lib/i18n";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Link } from "react-router-dom";
import { MessageSquare, Briefcase, MapPin, Star } from "lucide-react";
import { categoryById } from "../../data/categories";

export default function SeekerHome() {
  const { lang } = useLang();
  const { state, currentUser } = useStore();
  const seeker = state.seekers.find((s) => s.userId === currentUser.id);
  const cat = seeker ? categoryById(seeker.categories[0]) : null;

  const recommended = state.offers
    .filter((o) => o.status === "publiée")
    .filter((o) => !seeker || seeker.categories.length === 0 || seeker.categories.includes(o.category))
    .filter((o) => {
      if (!seeker?.zone?.lat || !seeker?.zone?.lng || !o.location?.lat || !o.location?.lng) return true;
      const R = 6371;
      const dLat = ((o.location.lat - seeker.zone.lat) * Math.PI) / 180;
      const dLng = ((o.location.lng - seeker.zone.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((seeker.zone.lat * Math.PI) / 180) *
          Math.cos((o.location.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      const d = 2 * R * Math.asin(Math.sqrt(a));
      return d <= (seeker.radiusKm || 50);
    })
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t("jobSeeker", lang)} — {currentUser.name}</h2>
          <p className="text-sm text-muted-foreground">
            {seeker ? `${seeker.missionsDone} ${lang === "fr" ? "missions terminées" : "jobs done"}` : ""}
          </p>
        </div>
        <Link to="/profil">
          <Button variant="outline" size="sm">{t("profile", lang)}</Button>
        </Link>
      </div>

      {seeker && (
        <Card>
          <CardHeader><CardTitle>{t("profile", lang)}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{currentUser.name}</span>
                  {seeker.rating && <Star className="h-4 w-4 text-brand-500" fill="currentColor" />}
                </div>
                <p className="text-sm text-muted-foreground">
                  {cat ? (lang === "fr" ? cat.name : cat.nameEn) : "—"} · {seeker.zone.city}
                </p>
                <p className="text-sm text-muted-foreground">{seeker.bio}</p>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">{t("availability", lang)} : </span>{seeker.availability}</div>
              <div><span className="text-muted-foreground">{t("distance", lang)} : </span>{seeker.radiusKm} {t("distanceKm", lang)}</div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {seeker.skills.map((s) => (
                <Badge key={s} variant="secondary">{s}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="font-semibold mb-2">
          {lang === "fr" ? "Offres compatibles à proximité" : "Compatible offers nearby"}
        </h3>
        {recommended.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t("noResults", lang)}</p>
        ) : (
          <div className="space-y-3">
            {recommended.map((o) => (
              <OfferPreview key={o.id} offer={o} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OfferPreview({ offer }: { offer: any }) {
  const { lang } = useLang();
  const cat = categoryById(offer.category);
  return (
    <Link to={`/offres/${offer.id}`} className="block">
      <div className="rounded-lg border p-3 hover:shadow-sm">
        <div className="flex items-center gap-2">
          <span>{cat?.icon}</span>
          <div>
            <div className="font-medium">{offer.title}</div>
            <div className="text-xs text-muted-foreground">
              {offer.location.city}, {offer.location.quartier} · {offer.duration}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
