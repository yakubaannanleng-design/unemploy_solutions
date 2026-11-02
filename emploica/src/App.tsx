// Composant principal de l'application Workca.
// Gestion de la navigation, de l'authentification et du routage entre les pages.
import { Suspense, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "./lib/store";
import { Skeleton } from "./components/ui/skeleton";
import { Toaster } from "./components/ui/sonner";
import { useLang, t } from "./lib/i18n";
import { supabase } from "./lib/supabase";
import Header from "./components/layout/Header";
import BottomNav from "./components/layout/BottomNav";
import AppRoutes from "./app/routes";
import type { User, Offer, Rating } from "./types";
import { DEMO_USERS } from "./data/mockData";

// Liste des routes qui nécessitent d'être connecté.
export default function App() {
  const { lang } = useLang();
  const { state, patch, replace, update, setCurrentUser, currentUser } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthed, setIsAuthed] = useState<boolean>(
    () => window.localStorage.getItem("workca:me") !== null
  );

  // Restaure l'utilisateur connecté depuis localStorage au chargement.
  useEffect(() => {
    if (supabase) {
      // 1) Session Supabase
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          setCurrentUser(data.session.user.id);
          setIsAuthed(true);
        } else {
          const saved = window.localStorage.getItem("workca:me");
          if (saved) { setCurrentUser(saved); setIsAuthed(true); }
        }
      });
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setCurrentUser(session.user.id);
          setIsAuthed(true);
          window.localStorage.setItem("workca:me", session.user.id);
        }
      });
      // 2) Chargement des donnees depuis Supabase
       (async () => {
         try {
            const [{ data: offers }, { data: applications }, { data: conversations }, { data: messages }, { data: notifications }, { data: users }, { data: seekerProfiles }, { data: employerProfiles }] = await Promise.all([
              supabase.from("offers").select("*"),
              supabase.from("applications").select("*"),
              supabase.from("conversations").select("*"),
              supabase.from("messages").select("*"),
              supabase.from("notifications").select("*"),
              supabase.from("users").select("*"),
              supabase.from("seeker_profiles").select("*"),
              supabase.from("employer_profiles").select("*"),
            ]);
           if (offers && offers.length > 0) {
             const mapped = offers.map((o: any) => ({
               id: o.id,
               employerId: o.employer_id,
               title: o.title,
               description: o.description,
               tasks: o.tasks ?? [],
               category: o.category,
               skills: o.skills ?? [],
               location: { region: o.location_region, city: o.location_city, quartier: o.location_quartier, lat: o.lat, lng: o.lng },
               contract: o.contract,
               duration: o.duration,
               schedule: o.schedule,
               pay: o.pay,
               payMode: o.pay_mode,
               createdAt: o.created_at,
               expiresAt: o.expires_at,
               status: o.status,
               boost: o.boost,
               views: o.views,
             }));
             update("offers", mapped);
           }
           if (applications && applications.length > 0) {
             const mapped = applications.map((a: any) => ({
               id: a.id,
               offerId: a.offer_id,
               seekerId: a.seeker_id,
               status: a.status,
               createdAt: a.created_at,
             }));
             update("applications", mapped);
           }
           if (conversations && conversations.length > 0) {
             const msgsByConv: Record<string, any[]> = {};
             (messages ?? []).forEach((m: any) => {
               if (!msgsByConv[m.conversation_id]) msgsByConv[m.conversation_id] = [];
               msgsByConv[m.conversation_id].push({
                 id: m.id,
                 senderId: m.sender_id,
                 receiverId: m.receiver_id,
                 body: m.body,
                 createdAt: m.created_at,
                 status: m.status,
               });
             });
             const mapped = conversations.map((c: any) => ({
               id: c.id,
               participants: c.participants,
               messages: msgsByConv[c.id] ?? [],
             }));
             update("conversations", mapped);
           }
           if (notifications && notifications.length > 0) {
             const mapped = notifications.map((n: any) => ({
               id: n.id,
               userId: n.user_id,
               type: n.type,
               body: n.body,
               createdAt: n.created_at,
               read: n.read,
             }));
             update("notifications", mapped);
           }
            if (users && users.length > 0) {
              const mapped = users.map((u: any) => ({
                id: u.id,
                role: u.role,
                name: u.name,
                phone: u.phone,
                email: u.email,
                passwordHash: u.password_hash ?? "",
                status: u.status,
                verification: u.verification === "verifie" ? "vérifié" : "déclaré",
                createdAt: u.created_at,
              }));
              update("users", mapped);
            }
            if (seekerProfiles && seekerProfiles.length > 0) {
              const mapped = seekerProfiles.map((s: any) => ({
                userId: s.user_id,
                bio: s.bio ?? "",
                skills: s.skills ?? [],
                categories: s.categories ?? [],
                contractWanted: s.contract_wanted ?? [],
                availability: s.availability ?? "immédiatement",
                zone: { region: s.zone_region, city: s.zone_city, quartier: s.zone_quartier, lat: s.lat, lng: s.lng },
                radiusKm: s.radius_km ?? 10,
                experience: s.experience ?? "",

                education: s.education,
                cvUrl: s.cv_url,
                languages: s.languages ?? [],
                photo: s.photo,
                missionsDone: s.missions_done ?? 0,
                rating: s.rating,
              }));
              update("seekers", mapped);
            }
            if (employerProfiles && employerProfiles.length > 0) {
              const mapped = employerProfiles.map((e: any) => ({
                userId: e.user_id,
                orgName: e.org_name,
                description: e.description ?? "",
                orgType: e.org_type,
                verification: e.verification === "verifie" ? "vérifié" : "déclaré",
                verifiedAt: e.verified_at,
                verificationRequested: e.verification_requested,
                verificationRequestedAt: e.verification_requested_at,
              }));
              update("employers", mapped);
            }

         } catch (e) {
           console.error("Supabase load error:", e);
         }
       })();
      return () => sub.subscription.unsubscribe();
    } else {
      const saved = window.localStorage.getItem("workca:me");
      if (saved) { setCurrentUser(saved); setIsAuthed(true); }
    }
  }, []);

  const login = (user: User) => {
    setCurrentUser(user.id);
    window.localStorage.setItem("workca:me", user.id);
    setIsAuthed(true);
    navigate("/" + user.role);
  };

  const logout = () => {
    if (supabase) supabase.auth.signOut();
    window.localStorage.removeItem("workca:me");
    setIsAuthed(false);
    navigate("/login");
  };

  const switchUser = (id: string) => {
    const u = state.users.find((x) => x.id === id);
    if (u) login(u);
  };

  const createOffer = (data: Omit<Offer, "id">) => {
    const id = "off-" + Math.random().toString(36).slice(2, 9);
    patch("offers", { ...data, id });
    if (supabase) {
      supabase.from("offers").insert({
        id,
        employer_id: data.employerId,
        title: data.title,
        description: data.description,
        tasks: data.tasks,
        category: data.category,
        skills: data.skills,
        location_region: data.location.region,
        location_city: data.location.city,
        location_quartier: data.location.quartier,
        lat: data.location.lat,
        lng: data.location.lng,
        contract: data.contract,
        duration: data.duration,
        schedule: data.schedule,
        pay: data.pay,
        pay_mode: data.payMode,
        created_at: data.createdAt,
        status: data.status,
        boost: data.boost,
        views: data.views,
      }).then(({ error }) => {
        if (error) console.error("Supabase insert offer error:", error);
      });
    }
    navigate("/" + (currentUser?.role ?? "chercheur"));
  };

  const boostOffer = (offer: Offer) => {
    const boosted: Offer = { ...offer, boost: true, views: offer.views + 50 };
    replace("offers", boosted);
    patch("transactions", {
      id: "tx-" + Math.random().toString(36).slice(2, 9),
      userId: offer.employerId,
      type: "boost",
      amount: 500,
      operator: "Orange Money",
      status: "réussi",
      createdAt: new Date().toISOString(),
    });
  };

  const addRating = (r: Omit<Rating, "id">) => {
    patch("ratings", { ...r, id: "rt-" + Math.random().toString(36).slice(2, 9) } as Rating);
  };

  // Si l'utilisateur est connecté et arrive sur la page d'accueil ou /login,
  // on le redirige vers son tableau de bord selon son rôle.
  if (isAuthed && currentUser && (location.pathname === "/" || location.pathname === "/login")) {
    return <Navigate to={"/" + currentUser.role} replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-3 focus:py-1 focus:rounded">
        {lang === "fr" ? "Aller au contenu principal" : "Skip to main content"}
      </a>
      <Header
        currentUser={isAuthed ? currentUser : null}
        onLogout={logout}
        onSwitchUser={switchUser}
        demoUsers={DEMO_USERS}
      />
      <main id="main-content" className="container px-4 py-6">
        <Suspense fallback={<div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>}>
          <AppRoutes onLogin={login} onSubmitOffer={createOffer} />
        </Suspense>
      </main>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        <div className="container px-4">
          <div>{t("antiScam", lang)} {"·"} {"©"} {new Date().getFullYear()} MADI OUMAROU YAKUBA {"—"} Workca</div>
          <div className="mt-1">
            <a href="mailto:yakubaannanleng@gmail.com" className="hover:underline">yakubaannanleng@gmail.com</a> {"·"} <a href="tel:+237694073533" className="hover:underline">+237 694-073-533</a> {"·"} <a href="https://wa.me/237672069569" target="_blank" rel="noreferrer" className="hover:underline">WhatsApp +237 672-069-569</a>
          </div>
        </div>
      </footer>
      {isAuthed && <BottomNav currentUser={currentUser} />}
      <Toaster />
    </div>
  );
}


