// Point d'entrée de l'application Workca.
// Montre l'application React dans l'élément #root, enveloppée avec :
// - StrictMode (mode strict de React pour le développement)
// - BrowserRouter (routage côté client)
// - StoreProvider (gestion d'état global)
// - AppErrorBoundary (rattrapage des erreurs de rendu)
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { StoreProvider } from "./lib/store";
import AppErrorBoundary from "./components/layout/AppErrorBoundary";

// Applique le thème sauvegardé avant le rendu.
try {
  if (window.localStorage.getItem("workca:theme") === "dark") {
    document.documentElement.classList.add("dark");
  }
} catch {
  /* ignore */
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <StoreProvider>
          <App />
        </StoreProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  </StrictMode>,
);
