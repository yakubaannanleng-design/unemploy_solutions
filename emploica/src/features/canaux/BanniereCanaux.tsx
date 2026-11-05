/**
 * PROBLÈME RÉSOLU : rend visibles les canaux depuis la liste des offres.
 * RESPONSABILITÉ  : affiche un accès discret lorsque qu'au moins un canal est configuré.
 * NE FAIT PAS     : ne s'affiche pas si les liens des canaux ne sont pas définis.
 * DÉPEND DE       : config/canaux, react-router-dom.
 * UTILISÉ PAR     : features/jobs/OffersView.
 */
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { LIEN_CANAL_TELEGRAM, LIEN_CANAL_WHATSAPP } from "@/config/canaux";
import { useLang } from "@/lib/i18n";
import { isValidChannelLink } from "./utils/channelLink";

export default function BanniereCanaux() {
  const { lang } = useLang();
  if (!isValidChannelLink(LIEN_CANAL_WHATSAPP) && !isValidChannelLink(LIEN_CANAL_TELEGRAM)) return null;

  return (
    <aside className="flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <MessageCircle className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <p className="truncate text-sm">
          {lang === "fr" ? "Recevez les nouvelles offres sur nos canaux." : "Get new jobs on our channels."}
        </p>
      </div>
      <Link to="/canaux" className="shrink-0 text-sm font-medium text-primary hover:underline">
        {lang === "fr" ? "Découvrir" : "Explore"}
      </Link>
    </aside>
  );
}
