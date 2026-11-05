// Composant principal de l'application Workca.
// Gestion de la navigation, de l'authentification et du routage entre les pages.
import { Suspense, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import { useStore } from "./lib/store";
import { toast } from "sonner";
import { Skeleton } from "./components/ui/skeleton";
import { Toaster } from "./components/ui/sonner";
import { useLang } from "./lib/i18n";
import { supabase } from "./lib/supabase";
import Header from "./components/layout/Header";
import AppRoutes from "./app/routes";
import AppLayout from "./layouts/AppLayout";
import type { Message, User } from "./types";
import { DEMO_USERS } from "./data/mockData";
import { resolveWorkcaUser } from "./features/auth/utils/authProfile";

// Liste des routes qui nécessitent d'être connecté.
export default function App() {
  const { lang } = useLang();
  const { state, update, upsertUser, setCurrentUser, currentUser } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthed, setIsAuthed] = useState<boolean>(
    () => !supabase && window.localStorage.getItem("workca:me") !== null
  );

  useEffect(() => {
    if (supabase) {
      let active = true;
      const activateSession = async (authUser: SupabaseAuthUser) => {
        try {
          const user = await resolveWorkcaUser(authUser);
          if (!active) return;
          if (user.status === "suspendu") {
            await supabase.auth.signOut();
            throw new Error("Ce compte est suspendu. Contactez l'assistance Workca.");
          }
          upsertUser(user);
          setCurrentUser(user.id);
          window.localStorage.setItem("workca:me", user.id);
          setIsAuthed(true);
        } catch (error) {
          if (!active) return;
          window.localStorage.removeItem("workca:me");
          setIsAuthed(false);
          toast.error(error instanceof Error ? error.message : "Impossible de charger votre compte.");
        }
      };

      void supabase.auth.getSession().then(({ data, error }) => {
        if (error) throw error;
        if (data.session?.user) {
          return activateSession(data.session.user);
        }
        window.localStorage.removeItem("workca:me");
        setIsAuthed(false);
      }).catch((error: unknown) => {
        if (!active) return;
        setIsAuthed(false);
        toast.error(error instanceof Error ? error.message : "Impossible de restaurer votre session.");
      });

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) return;
        window.localStorage.removeItem("workca:me");
        setIsAuthed(false);
      });

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
             const mapped = offers.map((o) => ({
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
               status: o.status === "publiee" || o.status === "publiée"
                 ? "publiée"
                 : o.status === "cloturee" || o.status === "clôturée"
                   ? "clôturée"
                   : o.status,
               boost: o.boost,
               views: o.views,
               isFilled: o.is_filled === true,
               filledAt: o.filled_at,
             }));
             update("offers", mapped);
           }
           if (applications && applications.length > 0) {
             const mapped = applications.map((a) => ({
               id: a.id,
               offerId: a.offer_id,
               seekerId: a.seeker_id,
               status: a.status,
               createdAt: a.created_at,
             }));
             update("applications", mapped);
           }
           if (conversations && conversations.length > 0) {
             const msgsByConv: Record<string, Message[]> = {};
             (messages ?? []).forEach((m) => {
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
             const mapped = conversations.map((c) => ({
               id: c.id,
               participants: c.participants,
               messages: msgsByConv[c.id] ?? [],
             }));
             update("conversations", mapped);
           }
           if (notifications && notifications.length > 0) {
             const mapped = notifications.map((n) => ({
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
              const mapped = users.map((u) => ({
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
              const mapped = seekerProfiles.map((s) => ({
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
              const mapped = employerProfiles.map((e) => ({
                userId: e.user_id,
                orgName: e.org_name,
                description: e.description ?? "",
                sector: e.sector,
                city: e.city,
                logoUrl: e.logo_url,
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
      return () => {
        active = false;
        sub.subscription.unsubscribe();
      };
    } else {
      const saved = window.localStorage.getItem("workca:me");
      if (saved) { setCurrentUser(saved); setIsAuthed(true); }
    }
  }, [setCurrentUser, update, upsertUser]);

  const login = async (user: User) => {
    if (supabase) {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!data.session?.user || data.session.user.id !== user.id) {
        throw new Error("La session n'est pas valide. Reconnectez-vous.");
      }
      user = await resolveWorkcaUser(data.session.user);
      if (user.status === "suspendu") {
        await supabase.auth.signOut();
        throw new Error("Ce compte est suspendu. Contactez l'assistance Workca.");
      }
    }
    upsertUser(user);
    setCurrentUser(user.id);
    window.localStorage.setItem("workca:me", user.id);
    setIsAuthed(true);
    navigate("/" + user.role);
  };

  const logout = () => {
    if (supabase) {
      void supabase.auth.signOut().then(({ error }) => {
        if (error) toast.error(error.message);
      });
    }
    window.localStorage.removeItem("workca:me");
    setIsAuthed(false);
    navigate("/login");
  };

  const switchUser = (id: string) => {
    const u = state.users.find((x) => x.id === id);
    if (u) login(u);
  };

  // Si l'utilisateur est connecté et arrive sur la page d'accueil ou /login,
  // on le redirige vers son tableau de bord selon son rôle.
  if (isAuthed && currentUser && (location.pathname === "/" || location.pathname === "/login")) {
    return <Navigate to={"/" + currentUser.role} replace />;
  }
  const pageContent = (
    <>
      <main id="main-content" className="container px-4 py-6">
        <Suspense fallback={<div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>}>
          <AppRoutes onLogin={login} />
        </Suspense>
      </main>
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-3 focus:py-1 focus:rounded">
        {lang === "fr" ? "Aller au contenu principal" : "Skip to main content"}
      </a>
      {isAuthed && currentUser ? (
        <AppLayout currentUser={currentUser} onLogout={logout}>
          {pageContent}
        </AppLayout>
      ) : (
        <>
          <Header
            currentUser={null}
            onLogout={logout}
            onSwitchUser={switchUser}
            demoUsers={DEMO_USERS}
          />
          {pageContent}
        </>
      )}
      <Toaster />
    </div>
  );
}
