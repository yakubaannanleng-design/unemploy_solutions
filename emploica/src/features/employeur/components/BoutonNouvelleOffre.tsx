import { Plus } from "lucide-react";

interface BoutonNouvelleOffreProps {
  label: string;
  onClick: () => void;
}

export default function BoutonNouvelleOffre({ label, onClick }: BoutonNouvelleOffreProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="relative -top-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Plus className="h-6 w-6" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </button>
  );
}
