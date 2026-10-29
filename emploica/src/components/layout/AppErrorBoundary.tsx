/**
 * PROBLÈME RÉSOLU : capture d'erreurs (Error Boundary) pour Workca.
 * RESPONSABILITÉ  : intercepter les erreurs de rendu et afficher un message lisible.
 * NE FAIT PAS     : ne parle pas à Supabase.
 * DÉPEND DE       : React.
 * UTILISÉ PAR     : App.tsx.
 */
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erreur pendant l’affichage de Workca", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ maxWidth: 720, margin: "64px auto", padding: 24, fontFamily: "system-ui, sans-serif", color: "var(--foreground)" }}>
          <h1 style={{ fontSize: 24, marginBottom: 12 }}>Workca n’a pas pu afficher cette page.</h1>
          <p style={{ marginBottom: 16 }}>Une erreur est survenue dans l’application. Voici le détail à transmettre pour la corriger :</p>
          <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", padding: 16, borderRadius: 8, background: "var(--muted)", color: "var(--destructive)" }}>
            {this.state.error.message || String(this.state.error)}
          </pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ marginTop: 12, padding: "10px 16px", border: 0, borderRadius: 6, background: "var(--primary)", color: "var(--primary-foreground)", cursor: "pointer" }}
          >
            Recharger la page
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
