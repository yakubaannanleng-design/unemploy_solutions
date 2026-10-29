// Logo de l'application Workca.
// Affiche l'icône "w" dans un cercle coloré, avec le nom "workca" en option.
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