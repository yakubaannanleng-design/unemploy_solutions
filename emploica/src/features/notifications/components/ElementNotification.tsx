import { Bell, BriefcaseBusiness, FileText, MessageSquare } from "lucide-react";
import type { Notification } from "../types";
import { useLang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

interface ElementNotificationProps {
  notification: Notification;
  onMarkRead: () => void;
}

function timeAgo(value: string, lang: "fr" | "en"): string {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "";
  const elapsedSeconds = Math.round((timestamp - Date.now()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];
  const formatter = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  for (const [unit, seconds] of units) {
    if (Math.abs(elapsedSeconds) >= seconds) {
      return formatter.format(Math.round(elapsedSeconds / seconds), unit);
    }
  }
  return formatter.format(elapsedSeconds, "second");
}

export default function ElementNotification({ notification, onMarkRead }: ElementNotificationProps) {
  const { lang } = useLang();
  const Icon = notification.type === "offre"
    ? BriefcaseBusiness
    : notification.type === "message"
      ? MessageSquare
      : notification.type === "candidature"
        ? FileText
        : Bell;

  return (
    <article className={`flex items-start gap-3 border-b p-4 ${notification.read ? "" : "bg-primary/5"}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{notification.body}</p>
        <time
          className="mt-1 block text-xs text-muted-foreground"
          dateTime={notification.createdAt}
        >
          {timeAgo(notification.createdAt, lang)}
        </time>
      </div>
      {!notification.read && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onMarkRead}
          aria-label={lang === "fr" ? "Marquer comme lu" : "Mark as read"}
          className="relative h-8 w-8 shrink-0"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500" aria-hidden="true" />
        </Button>
      )}
    </article>
  );
}
