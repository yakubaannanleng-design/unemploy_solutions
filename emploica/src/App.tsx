// Composant principal de l'application Workca.
// Gestion de la navigation, de l'authentification et du routage entre les pages.
import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "./lib/store";
import { useLang, t } from "./lib/i18n";
import Header from "./components/layout/Header";
import BottomNav from "./components/layout/BottomNav";
const SeekerHome = lazy(() => import("./components/home/SeekerHome"));
const EmployerHome = lazy(() => import("./components/home/EmployerHome"));
const AdminPanel = lazy(() => import("./components/home/AdminPanel"));
const OffersView = lazy(() => import("./components/views/OffersView"));
const MessagesView = lazy(() => import("./components/views/MessagesView"));
const ProfileView = lazy(() => import("./components/views/ProfileView"));
const OfferForm = lazy(() => import("./components/offers/OfferForm"));
const NotificationsView = lazy(() => import("./components/views/NotificationsView"));
const FlashOffersView = lazy(() => import("./components/home/FlashOffersView"));
const SettingsView = lazy(() => import("./components/views/SettingsView"));
const FavoritesView = lazy(() => import("./components/views/FavoritesView"));
const TermsView = lazy(() => import("./components/views/TermsView"));
const PrivacyView = lazy(() => import("./components/views/PrivacyView"));
const LicensesView = lazy(() => import("./components/views/LicensesView"));
import type { User, Offer, Rating } from "./types";
import { DEMO_USERS } from "./data/mockData";
const AuthPage = lazy(() => import("./pages/AuthPage"));

// Liste des routes qui nÃ©cessitent d'Ãªtre connectÃ©.
const PROTECTED_ROUTES = [
  "/chercheur",
  "/employeur",
  "/admin",
  "/offres",
  "/offres/nouveau",
  "/messages",
  "/profil",
  "/notifications",
  "/boulots-eclair",
  "/parametres",
  "/favoris",
];

// Wrapper qui protÃ¨ge une route : redirige vers /login si l'utilisateur n'est pas connectÃ©.
function RequireAuth({ children }: { children: JSX.Element }) {
  const isAuthed = window.localStorage.getItem("workca:me") !== null;
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthed) {
    navigate("/login", { state: { from: location }, replace: true });
    return null;
  }

  return children;
}

export default function App() {
  const { lang } = useLang();
  const { state, patch, replace, setCurrentUser, currentUser } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthed, setIsAuthed] = useState<boolean>(
    () => window.localStorage.getItem("workca:me") !== null
  );

  // Restaure l'utilisateur connectÃ© depuis localStorage au chargement.
  useEffect(() => {
    const saved = window.localStorage.getItem("workca:me");
    if (saved) {
      setCurrentUser(saved);
      setIsAuthed(true);
    }
  }, []);

  const login = (user: User) => {
    setCurrentUser(user.id);
    window.localStorage.setItem("workca:me", user.id);
    setIsAuthed(true);
    navigate("/" + user.role);
  };

  const logout = () => {
    window.localStorage.removeItem("workca:me");
    setIsAuthed(false);
    navigate("/login");
  };

  const switchUser = (id: string) => {
    const u = state.users.find((x) => x.id === id);
    if (u) login(u);
  };

  const createOffer = (data: Omit<Offer, "id">) => {
    patch("offers", { ...data, id: "off-" + Math.random().toString(36).slice(2, 9) });
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
      status: "rÃ©ussi",
      createdAt: new Date().toISOString(),
    });
  };

  const addRating = (r: Omit<Rating, "id">) => {
    patch("ratings", { ...r, id: "rt-" + Math.random().toString(36).slice(2, 9) } as Rating);
  };

  // Si l'utilisateur est connectÃ© et arrive sur la page d'accueil ou /login,
  // on le redirige vers son tableau de bord selon son rÃ´le.
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
      <main id="main-content" className="container py-6">
        <Suspense fallback={<div className="text-center py-10 text-muted-foreground">Chargement…</div>}>
        <Routes>
          <Route path="/login" element={<AuthPage onLogin={login} />} />
          <Route
            path="/chercheur"
            element={
              <RequireAuth>
                <SeekerHome />
              </RequireAuth>
            }
          />
          <Route
            path="/employeur"
            element={
              <RequireAuth>
                <EmployerHome />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminPanel />
              </RequireAuth>
            }
          />
          <Route
            path="/offres"
            element={
              <RequireAuth>
                <OffersView />
              </RequireAuth>
            }
          />
          <Route
            path="/offres/nouveau"
            element={
              <RequireAuth>
                <OfferForm onSubmit={createOffer} onCancel={() => navigate(-1)} />
              </RequireAuth>
            }
          />
          <Route
            path="/messages"
            element={
              <RequireAuth>
                <MessagesView />
              </RequireAuth>
            }
          />
          <Route
            path="/profil"
            element={
              <RequireAuth>
                <ProfileView />
              </RequireAuth>
            }
          />
          <Route
            path="/notifications"
            element={
              <RequireAuth>
                <NotificationsView />
              </RequireAuth>
            }
          />
          <Route
            path="/boulots-eclair"
            element={
              <RequireAuth>
                <FlashOffersView />
              </RequireAuth>
            }
          />
          <Route
            path="/parametres"
            element={
              <RequireAuth>
                <SettingsView />
              </RequireAuth>
            }
          />
          <Route
            path="/favoris"
            element={
              <RequireAuth>
                <FavoritesView />
              </RequireAuth>
}
            />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/conditions" element={<TermsView />} />
          <Route path="/confidentialite" element={<PrivacyView />} />
          <Route path="/licences" element={<LicensesView />} />
          <Route path="*" element={<AuthPage onLogin={login} />} />
        </Routes>
        </Suspense>
      </main>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        <div className="container">{t("antiScam", lang)} {"\u00B7"} {"\u00A9"} {new Date().getFullYear()} MADI OUMAROU YAKUBA {"\u2014"} Workca</div>
      </footer>
      {isAuthed && <BottomNav currentUser={currentUser} />}
    </div>
  );
}
