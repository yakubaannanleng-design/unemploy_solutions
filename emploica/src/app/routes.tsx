/**
 * PROBLÈME RÉSOLU : regroupement des routes de l'application.
 * RESPONSABILITÉ  : rend le composant AppRoutes avec toutes les routes.
 * NE FAIT PAS     : ne gère pas la session Supabase ni la création d'offres (reste dans App.tsx).
 * DÉPEND DE       : lib/store, components/layout/*, features/*.
 * UTILISÉ PAR     : App.tsx.
 */
import { lazy } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import type { JSX } from "react";
import { useStore } from "../lib/store";
import { useEmployerProfiles } from "../features/employers/hooks/useEmployerProfiles";
import { useLang } from "../lib/i18n";
import type { User } from "../types";

const SeekerHome = lazy(() => import("../features/dashboard/components/PageAccueil"));
const PageEntreprise = lazy(() => import("../features/entreprises/PageEntreprise"));
const EmployerHome = lazy(() => import("../features/dashboard").then((m) => ({ default: m.EmployerHome })));
const DashboardEmployeur = lazy(() => import("../features/employeur").then((m) => ({ default: m.DashboardEmployeur })));
const MesOffres = lazy(() => import("../features/employeur").then((m) => ({ default: m.MesOffres })));
const DetailCandidat = lazy(() => import("../features/employeur/DetailCandidat"));
const AdminPanel = lazy(() => import("../features/admin"));
const OffersView = lazy(() => import("features/jobs").then((m) => ({ default: m.OffersView })));
const DetailOffre = lazy(() => import("features/jobs").then((m) => ({ default: m.DetailOffre })));
const SeekerApplicationsView = lazy(() => import("../features/applications"));
const MessagesView = lazy(() => import("features/messaging"));
const ProfileView = lazy(() => import("features/seekers"));
const FormulaireProfilEntreprise = lazy(() => import("../features/compte/components/FormulaireProfilEntreprise"));
const PublicationOffre = lazy(() => import("../features/employeur/publication/PublicationOffre"));
const ModifierOffre = lazy(() => import("../features/employeur/publication/ModifierOffre"));
const NotificationsView = lazy(() => import("features/notifications"));
const FlashOffersView = lazy(() => import("features/jobs").then((m) => ({ default: m.FlashOffersView })));
const SettingsView = lazy(() => import("features/settings"));
const FavoritesView = lazy(() => import("features/favorites"));
const SearchView = lazy(() => import("features/search"));
const TermsView = lazy(() => import("features/legal").then((m) => ({ default: m.TermsView })));
const PrivacyView = lazy(() => import("features/legal").then((m) => ({ default: m.PrivacyView })));
const LicensesView = lazy(() => import("features/legal").then((m) => ({ default: m.LicensesView })));
const AuthPage = lazy(() => import("features/auth"));

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

function RequireEmployerProfile({ children }: { children: JSX.Element }) {
  const { currentUser, state } = useStore();
  const { lang } = useLang();
  const profilesQuery = useEmployerProfiles();

  if (profilesQuery.isLoading) {
    return <p role="status" className="py-10 text-center text-muted-foreground">
      {lang === "fr" ? "Chargement du profil employeur…" : "Loading employer profile…"}
    </p>;
  }
  if (profilesQuery.isError) {
    return <p role="alert" className="py-10 text-center text-destructive">
      {lang === "fr" ? "Impossible de vérifier le profil employeur." : "Could not check the employer profile."}
    </p>;
  }
  const profiles = profilesQuery.data ?? state.employers;
  if (!profiles.some((profile) => profile.userId === currentUser.id)) {
    return <Navigate to="/profil-employeur?redirect=%2Foffres%2Fnouveau" replace />;
  }
  return children;
}

export default function AppRoutes({ onLogin }: { onLogin: (user: User) => void }) {
  const { currentUser } = useStore();

  return (
    <Routes>
      <Route path="/login" element={<AuthPage onLogin={onLogin} />} />
      <Route
        path="/entreprises/:id"
        element={
          <PageEntreprise
            followerId={
              window.localStorage.getItem("workca:me") === currentUser.id
                ? currentUser.id
                : null
            }
          />
        }
      />
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
            <DashboardEmployeur currentUser={currentUser} />
          </RequireAuth>
        }
      />
      <Route
        path="/employeur/offres"
        element={
          <RequireAuth>
            <MesOffres currentUser={currentUser} />
          </RequireAuth>
        }
      />
      <Route
        path="/employeur/candidatures/:id"
        element={
          <RequireAuth>
            <DetailCandidat currentUser={currentUser} />
          </RequireAuth>
        }
      />
      <Route
        path="/employeur/gestion"
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
        path="/offres/:id"
        element={
          <RequireAuth>
            <DetailOffre />
          </RequireAuth>
        }
      />
      <Route
        path="/candidatures"
        element={
          <RequireAuth>
            <SeekerApplicationsView currentUser={currentUser} />
          </RequireAuth>
        }
      />
      <Route
        path="/offres/nouveau"
        element={
          <RequireAuth>
            <RequireEmployerProfile>
              <PublicationOffre employerId={currentUser.id} employerPhone={currentUser.phone} />
            </RequireEmployerProfile>
          </RequireAuth>
        }
      />
      <Route
        path="/offres/:id/modifier"
        element={
          <RequireAuth>
            <RequireEmployerProfile>
              <ModifierOffre />
            </RequireEmployerProfile>
          </RequireAuth>
        }
      />
      <Route
        path="/profil-employeur"
        element={
          <RequireAuth>
            <FormulaireProfilEntreprise />
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
      <Route path="/recherche" element={<SearchView />} />
      <Route path="/conditions" element={<TermsView />} />
      <Route path="/confidentialite" element={<PrivacyView />} />
      <Route path="/licences" element={<LicensesView />} />
      <Route path="*" element={<AuthPage onLogin={onLogin} />} />
    </Routes>
  );
}
