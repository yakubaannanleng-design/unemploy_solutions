/**
 * PROBLÈME RÉSOLU : présente un canal configuré avec un lien externe sûr.
 * RESPONSABILITÉ  : affiche le nom, la description et le bouton pour rejoindre un canal.
 * NE FAIT PAS     : ne publie pas d'offre et ne gère aucun backend.
 * DÉPEND DE       : config/canaux, lib/i18n, components/ui/button.
 * UTILISÉ PAR     : features/canaux.
 */
import { ExternalLink, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { isValidChannelLink } from "./utils/channelLink";

export type ChannelName = "whatsapp" | "telegram";

interface CarteCanalProps {
  channel: ChannelName;
  link: string;
}

const channelDetails = {
  whatsapp: {
    fr: { name: "Canal WhatsApp", description: "Les nouvelles offres et conseils emploi." },
    en: { name: "WhatsApp channel", description: "New job opportunities and career advice." },
    color: "bg-[#25D366] text-[#073B1A]",
  },
  telegram: {
    fr: { name: "Canal Telegram", description: "Offres d'emploi et conseils pratiques." },
    en: { name: "Telegram channel", description: "Job opportunities and practical advice." },
    color: "bg-[#229ED9] text-white",
  },
} as const;

export default function CarteCanal({ channel, link }: CarteCanalProps) {
  const { lang } = useLang();
  if (!isValidChannelLink(link)) return null;

  const details = channelDetails[channel][lang];
  return (
    <article className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${channelDetails[channel].color}`}>
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="font-semibold">{details.name}</h2>
          <p className="text-sm text-muted-foreground">{details.description}</p>
        </div>
      </div>
      <Button asChild className="mt-4 w-full">
        <a href={link} target="_blank" rel="noopener noreferrer">
          {lang === "fr" ? "Rejoindre le canal" : "Join the channel"}
          <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
        </a>
      </Button>
    </article>
  );
}
