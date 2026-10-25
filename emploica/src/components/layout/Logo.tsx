// Logo de l'application Workca.
// Affiche l'icône "w" dans un cercle coloré, avec le nom "workca" en option.
export default function Logo({ size = 40, className = "", showText = true }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className="flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg"
        style={{ width: size, height: size, lineHeight: size + "px" }}
      >
        w
      </span>
      {showText && (
        <span className="text-lg font-semibold tracking-tight text-foreground dark:text-muted-foreground">
          workca
        </span>
      )}
    </div>
  );
}