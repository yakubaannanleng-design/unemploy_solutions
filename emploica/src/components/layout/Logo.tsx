/**
 * PROBLÈME RÉSOLU : logo de l'application Workca.
 * RESPONSABILITÉ  : affichage du logo.
 * NE FAIT PAS     : aucune logique métier.
 * DÉPEND DE       : aucun.
 * UTILISÉ PAR     : Header, LoginView.
 */
export default function Logo({ className = "", showText = true }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showText && (
        <span className="text-lg font-semibold tracking-tight text-foreground dark:text-muted-foreground">
          workca
        </span>
      )}
    </div>
  );
}