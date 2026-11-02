/**
 * PROBLÈME RÉSOLU : regroupement des routes de l'application.
 * RESPONSABILITÉ  : définit PROTECTED_ROUTES et rend le composant AppRoutes avec toutes les routes.
 * NE FAIT PAS     : ne gère pas la session Supabase ni la création d'offres (reste dans App.tsx).
 * DÉPEND DE       : lib/store, lib/i18n, lib/supabase, components/layout/*, features/*.
 * UTILISÉ PAR     : App.tsx.
 */
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import type { JSX } from "react";
import { useStore } from "../lib/store";
import { useLang } from "../lib/i18n";
import { supabase } from "../lib/supabase";
import type { User } from "../types";

const SeekerHome = lazy(() => import("../features/dashboard").then((m) => ({ default: m.SeekerHome })));
const EmployerHome = lazy(() => import("../features/dashboard").then((m) => ({ default: m.EmployerHome })));
const AdminPanel = lazy(() => import("../features/admin"));
const OffersView = lazy(() => import("features/jobs").then((m) => ({ default: m.OffersView })));
const MessagesView = lazy(() => import("features/messaging"));
const ProfileView = lazy(() => import("features/seekers"));
const OfferForm = lazy(() => import("features/jobs").then((m) => ({ default: m.OfferForm })));
const NotificationsView = lazy(() => import("features/notifications"));
const FlashOffersView = lazy(() => import("features/jobs").then((m) => ({ default: m.FlashOffersView })));
const SettingsView = lazy(() => import("features/settings"));
const FavoritesView = lazy(() => import("features/favorites"));
const SearchView = lazy(() => import("features/search"));
const TermsView = lazy(() => import("features/legal").then((m) => ({ default: m.TermsView })));
const PrivacyView = lazy(() => import("features/legal").then((m) => ({ default: m.PrivacyView })));
const LicensesView = lazy(() => import("features/legal").then((m) => ({ default: m.LicensesView })));
const AuthPage = lazy(() => import("features/auth"));

export const PROTECTED_ROUTES = [
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

export default function AppRoutes({ onLogin, onSubmitOffer }: { onLogin: (user: User) => void; onSubmitOffer: (data: import("../types").Offer) => void }) {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/login" element={<AuthPage onLogin={onLogin} />} />
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
            <OfferForm onSubmit={onSubmitOffer} onCancel={() => navigate(-1)} />
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
