import { useState } from "react";
import { useStore } from "../../lib/store";
import { useLang, t } from "../../lib/i18n";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import Messaging from "./Messaging";
import { MessageSquare } from "lucide-react";

export default function MessagesView() {
  const { lang } = useLang();
  const { state, currentUser } = useStore();
  const mine = currentUser.id;
  const [active, setActive] = useState<string | null>(null);

  const convs = state.conversations.filter((c) => c.participants.includes(mine));

  if (convs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center text-muted-foreground">
        <MessageSquare className="h-10 w-10 mb-2 opacity-50" />
        <p>{t("noResults", lang)}</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-4 h-[75vh]">
      <Card className="md:col-span-1">
        <CardContent className="p-2">
          <div className="space-y-1">
            {convs.map((c) => {
              const other = state.users.find((u) => u.id !== mine && c.participants.includes(u.id));
              const last = c.messages[c.messages.length - 1];
              const isActive = active === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  className={`w-full text-left p-2 rounded-lg flex items-center gap-2 hover:bg-accent ${isActive ? "bg-accent" : ""}`}
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                    {other?.name.charAt(0) ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{other?.name ?? t("unknownUser", lang)}</div>
                    <div className="text-xs text-muted-foreground truncate">{last?.body ?? ""}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <div className="md:col-span-2">
        <Messaging conversationId={active} otherId={active ? (state.conversations.find((c) => c.id === active)?.participants.find((p) => p !== mine) ?? null) : null} />
      </div>
    </div>
  );
}