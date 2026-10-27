import { MapPin, Star } from "lucide-react";
import { useLang, t } from "../../lib/i18n";
import { useStore } from "../../lib/store";
import { categoryById } from "../../data/categories";
import { getIcon } from "../../lib/iconMap";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Separator } from "../ui/separator";
import type { Offer } from "../../types";

interface OfferDetailModalProps {
  offer: Offer | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onApply?: () => void;
  onReport?: () => void;
  onContact?: () => void;
  onBoost?: () => void;
  onRate?: () => void;
  alreadyApplied?: boolean;
  isEmployer?: boolean;
}

export default function OfferDetailModal({
  offer,
  open,
  onOpenChange,
  onApply,
  onReport,
  onContact,
  onBoost,
  onRate,
  alreadyApplied,
  isEmployer,
}: OfferDetailModalProps) {
  const { lang } = useLang();
  const { state, currentUser } = useStore();
  if (!offer) return null;
  const cat = categoryById(offer.category);
  const Icon = getIcon(cat?.icon ?? "briefcase");
  const payLabel = offer.payMode === "négocier" ? t("contact", lang) : offer.pay;
  const mine = currentUser;
  const isMine = isEmployer ?? offer.employerId === mine.id;
  const employer = state.users.find((u) => u.id === offer.employerId);
  const rating = state.ratings.filter((r) => r.toUserId === offer.employerId && r.toRole === "employeur");
  const avgRating = rating.length ? rating.reduce((s, r) => s + r.score, 0) / rating.length : null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" aria-hidden />
            <div>
              <DialogTitle>{offer.title}</DialogTitle>
              <span className="text-xs text-muted-foreground">
                {lang === "fr" ? cat?.name : cat?.nameEn}
              </span>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin_ /> {offer.location.region}, {offer.location.city}, {offer.location.quartier}
            {offer.location.lat && offer.location.lng && (
              <a
                href={`https://www.google.com/maps?q=${offer.location.lat},${offer.location.lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline text-xs ml-2"
              >
                {lang === "fr" ? "Voir sur la carte" : "View on map"}
              </a>
            )}
          </div>
          {employer && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{lang === "fr" ? "Employeur" : "Employer"} : </span>
              <span className="font-medium">{employer.name}</span>
              {employer.verification === "vérifié" && <Badge variant="secondary">{t("verifiedEmployer", lang)}</Badge>}
              {avgRating && (
                <span className="flex items-center gap-1 text-brand-600">
                  <Star_ /> {avgRating.toFixed(1)}
                </span>
              )}
            </div>
          )}
          <div>
            <span className="font-semibold">{t("description", lang)} : </span>
            {offer.description}
          </div>
          {offer.tasks.length > 0 && (
            <div>
              <span className="font-semibold">{t("tasks", lang)} : </span>
              <ul className="list-disc list-inside mt-1">
                {offer.tasks.map((tk, i) => (
                  <li key={i}>{tk}</li>
                ))}
              </ul>
            </div>
          )}
          {offer.skills.length > 0 && (
            <div>
              <span className="font-semibold">{t("skills", lang)} : </span>
              {offer.skills.join(", ")}
            </div>
          )}
          <Separator />
          <div className="grid grid-cols-2 gap-2">
            <div><span className="font-semibold">{t("contract", lang)} : </span>{offer.contract}</div>
            <div><span className="font-semibold">{t("duration", lang)} : </span>{offer.duration}</div>
            <div><span className="font-semibold">{t("schedule", lang)} : </span>{offer.schedule}</div>
            <div><span className="font-semibold">{t("pay", lang)} : </span>{payLabel}</div>
          </div>
        </div>
        <Separator />
        <p className="text-xs text-muted-foreground">{t("antiScam", lang)}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          {!isMine && onApply && (
            <Button onClick={onApply} disabled={alreadyApplied}>
              {alreadyApplied ? t("applied", lang) : t("apply", lang)}
            </Button>
          )}
          {!isMine && onContact && <Button variant="outline" onClick={onContact}>{t("contact", lang)}</Button>}
          {isMine && !offer.boost && onBoost && (
            <Button variant="secondary" onClick={onBoost}>{t("boost", lang)}</Button>
          )}
          {isMine && offer.boost && <Badge variant="default">{t("boostDone", lang)}</Badge>}
          {!isMine && onRate && (
            <Button variant="outline" onClick={onRate}>
              <Star className="h-3.5 w-3.5 mr-1" /> {t("rateEmployer", lang)}
            </Button>
          )}
          {onReport && (
            <Button variant="ghost" className="text-red-600" onClick={onReport}>
              {t("report", lang)}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MapPin_() {
  return <MapPin className="h-4 w-4 inline mr-1" />;
}
function Star_() {
  return <Star className="h-3.5 w-3.5 inline mr-1" />;
}