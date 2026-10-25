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
