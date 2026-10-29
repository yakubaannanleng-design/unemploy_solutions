/**
 * PROBLÈME RÉSOLU : affiche la recherche globale (offres, utilisateurs, messages) et filtre les résultats.
 * RESPONSABILITÉ  : rendu de l'écran Recherche et filtrage local des données du store.
 * NE FAIT PAS     : ne parle pas à Supabase ; ne gère pas la création/modification de données.
 * DÉPEND DE       : lib/store, lib/i18n, components/offers/OfferCard, react-router-dom.
 * UTILISÉ PAR     : app (route /recherche).
 */
// Vue de recherche globale : offres, utilisateurs, messages.
import { useState } from "react";
import { useStore } from "lib/store";
import { useLang, t } from "lib/i18n";
import { Search, Briefcase, User, MessageSquare } from "lucide-react";
import OfferCard from "components/offers/OfferCard";
import { useNavigate } from "react-router-dom";

export default function SearchView() {
  const { lang } = useLang();
  const { state } = useStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"offres" | "utilisateurs" | "messages">("offres");

  const ql = q.trim().toLowerCase();
  const offers = ql
    ? state.offers.filter(
        (o) =>
          o.status === "publiée" &&
          (o.title.toLowerCase().includes(ql) ||
            o.description.toLowerCase().includes(ql) ||
            o.skills.some((s) => s.toLowerCase().includes(ql)) ||
            o.location.city.toLowerCase().includes(ql))
      )
    : [];
  const users = ql
    ? state.users.filter(
        (u) =>
          u.name.toLowerCase().includes(ql) ||
          u.phone.includes(ql) ||
          (u.email ?? "").toLowerCase().includes(ql)
      )
    : [];
  const messages = ql
    ? state.conversations.flatMap((c) =>
        c.messages
          .filter((m) => m.body.toLowerCase().includes(ql))
          .map((m) => ({ ...m, convId: c.id }))
      )
    : [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Search className="h-5 w-5" /> {lang === "fr" ? "Recherche" : "Search"}
      </h2>
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={lang === "fr" ? "Rechercher des offres, utilisateurs, messages..." : "Search offers, users, messages..."}
          className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
          autoFocus
        />
      </div>
      <div className="flex gap-2">
        {(["offres", "utilisateurs", "messages"] as const).map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`px-3 py-1 rounded-full text-xs ${tab === tb ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            {tb === "offres" ? t("offers", lang) : tb === "utilisateurs" ? t("users", lang) : t("messages", lang)}
          </button>
        ))}
      </div>

      {tab === "offres" && (
        offers.length === 0 ? (
          <p className="text-muted-foreground text-sm">{ql ? t("noResults", lang) : (lang === "fr" ? "Tapez pour rechercher." : "Type to search.")}</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {offers.map((o) => (
              <OfferCard key={o.id} offer={o} onClick={() => navigate(`/offres/${o.id}`)} />
            ))}
          </div>
        )
      )}
      {tab === "utilisateurs" && (
        users.length === 0 ? (
          <p className="text-muted-foreground text-sm">{ql ? t("noResults", lang) : (lang === "fr" ? "Tapez pour rechercher." : "Type to search.")}</p>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg border">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.role} · {u.phone}</div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
      {tab === "messages" && (
        messages.length === 0 ? (
          <p className="text-muted-foreground text-sm">{ql ? t("noResults", lang) : (lang === "fr" ? "Tapez pour rechercher." : "Type to search.")}</p>
        ) : (
          <div className="space-y-2">
            {messages.map((m) => (
              <div key={m.id} className="p-3 rounded-lg border">
                <div className="text-sm">{m.body}</div>
                <div className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}