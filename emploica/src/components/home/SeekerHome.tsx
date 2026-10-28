// Composant de l interface utilisateur
import { useState } from "react";
import { useStore } from "../../lib/store";
import { useLang, t } from "../../lib/i18n";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, Briefcase, MapPin, Star } from "lucide-react";
import { categoryById } from "../../data/categories";
import { getIcon } from "../../lib/iconMap";

export default function SeekerHome() {
  const { lang } = useLang();
  const { state, currentUser } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
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
            {seeker ? (seeker.missionsDone > 0 ? `${seeker.missionsDone} ${lang === "fr" ? "missions terminées" : "jobs done"}` : (lang === "fr" ? (<>Aucune pour l'instant. <Link to="/offres" className="text-primary hover:underline">Postule à ta première offre</Link></>) : (<>None yet. <Link to="/offres" className="text-primary hover:underline">Apply to your first offer</Link></>))) : ""}
          </p>
        </div>
        <Link to="/profil">
          <Button variant="outline" size="sm">{t("profile", lang)}</Button>
        </Link>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-brand-500 to-brand-700 p-6 text-white shadow-lg">
        <h3 className="text-xl font-bold mb-1">{lang === "fr" ? "Trouvez votre prochain emploi" : "Find your next job"}</h3>
        <p className="text-sm opacity-90 mb-4">{lang === "fr" ? "Des milliers d'offres près de chez vous, au Cameroun." : "Thousands of jobs near you, in Cameroon."}</p>
        <div className="flex gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === "fr" ? "Métier, compétence, ville..." : "Job, skill, city..."}
            className="bg-white/90 text-foreground placeholder:text-muted-foreground"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/offres" + (search ? "?q=" + encodeURIComponent(search) : ""))}
          >
            {lang === "fr" ? "Rechercher" : "Search"}
          </Button>
        </div>
      </div>

      {seeker && (
        <Card>
          <CardHeader><CardTitle>{t("profile", lang)}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden" style={{ backgroundColor: `hsl(${(currentUser.name.charCodeAt(0) * 37) % 360}, 60%, 45%)` }}>
                {seeker?.photo ? <img src={seeker.photo} alt={currentUser.name} className="h-full w-full object-cover" /> : <span className="text-white">{currentUser.name.charAt(0).toUpperCase()}</span>}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{currentUser.name}</span>
                  {seeker.rating && <Star className="h-4 w-4 text-brand-500" fill="currentColor" />}
                </div>
                <p className="text-sm text-muted-foreground">
                  {cat ? `${lang === "fr" ? cat.name : cat.nameEn} · ` : ""}{seeker.zone.city}
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
      <div className="pt-2">
        <Link to="/offres">
          <Button variant="outline" size="sm">{lang === "fr" ? "Voir toutes les offres" : "View all offers"}</Button>
        </Link>
      </div>
    </div>
  );
}

function OfferPreview({ offer }: { offer: any }) {
  const { lang } = useLang();
  const cat = categoryById(offer.category);
  const Icon = getIcon(cat?.icon ?? "briefcase");
  return (
    <Link to={`/offres/${offer.id}`} className="block">
      <div className="rounded-lg border p-3 hover:shadow-sm">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" aria-hidden />
          <div>
            <div className="font-medium">{offer.title}</div>
            <div className="text-xs text-muted-foreground">
              {offer.location.city}{offer.location.quartier ? `, ${offer.location.quartier}` : ""} · {offer.contract} · {offer.duration}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
