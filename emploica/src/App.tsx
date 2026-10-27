// Composant principal de l'application Workca.
// Gestion de la navigation, de l'authentification et du routage entre les pages.
import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "./lib/store";
import { useLang, t } from "./lib/i18n";
import Header from "./components/layout/Header";
import SeekerHome from "./components/home/SeekerHome";
import EmployerHome from "./components/home/EmployerHome";
import AdminPanel from "./components/home/AdminPanel";
import OffersView from "./components/views/OffersView";
import MessagesView from "./components/views/MessagesView";
import ProfileView from "./components/views/ProfileView";
import OfferForm from "./components/offers/OfferForm";
import NotificationsView from "./components/views/NotificationsView";
import FlashOffersView from "./components/home/FlashOffersView";
import SettingsView from "./components/views/SettingsView";
import FavoritesView from "./components/views/FavoritesView";
import type { User, Offer, Rating } from "./types";
import { DEMO_USERS } from "./data/mockData";
import AuthPage from "./pages/AuthPage";

// Liste des routes qui nécessitent d'être connecté.
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

// Wrapper qui protège une route : redirige vers /login si l'utilisateur n'est pas connecté.
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

  // Restaure l'utilisateur connecté depuis localStorage au chargement.
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
      <Header
        currentUser={isAuthed ? currentUser : null}
        onLogout={logout}
        onSwitchUser={switchUser}
        demoUsers={DEMO_USERS}
      />
      <main className="container py-6">
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
          <Route path="*" element={<AuthPage onLogin={login} />} />
        </Routes>
      </main>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        <div className="container">{t("antiScam", lang)} · © {new Date().getFullYear()} MADI OUMAROU YAKUBA — Workca</div>
      </footer>
    </div>
  );
}
