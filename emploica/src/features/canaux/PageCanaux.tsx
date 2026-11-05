/**
 * PROBLÈME RÉSOLU : fournit une page dédiée aux canaux Workca configurés.
 * RESPONSABILITÉ  : liste uniquement les canaux qui possèdent un lien web valide.
 * NE FAIT PAS     : ne crée pas ni ne publie de contenu sur les canaux.
 * DÉPEND DE       : config/canaux, features/canaux/CarteCanal.
 * UTILISÉ PAR     : app (route /canaux).
 */
import { MessageCircle } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { LIEN_CANAL_TELEGRAM, LIEN_CANAL_WHATSAPP } from "@/config/canaux";
import CarteCanal from "./CarteCanal";
import { isValidChannelLink } from "./utils/channelLink";

export default function PageCanaux() {
  const { lang } = useLang();
  const channels = [
    { channel: "whatsapp" as const, link: LIEN_CANAL_WHATSAPP },
    { channel: "telegram" as const, link: LIEN_CANAL_TELEGRAM },
  ].filter(({ link }) => isValidChannelLink(link));

  return (
    <main className="mx-auto max-w-2xl space-y-5 px-4 py-6">
      <header className="space-y-2">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <MessageCircle className="h-5 w-5" />
          {lang === "fr" ? "Nos canaux" : "Our channels"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {lang === "fr"
            ? "Recevez les nouvelles offres directement sur votre téléphone."
            : "Get new job opportunities directly on your phone."}
        </p>
      </header>
      {channels.length === 0 ? (
        <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
          {lang === "fr"
            ? "Les liens de nos canaux seront disponibles prochainement."
            : "Our channel links will be available soon."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {channels.map(({ channel, link }) => (
            <CarteCanal key={channel} channel={channel} link={link} />
          ))}
        </div>
      )}
    </main>
  );
}
