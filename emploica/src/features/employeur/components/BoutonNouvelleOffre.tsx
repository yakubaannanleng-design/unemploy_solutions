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
      className="flex h-full min-h-11 w-full flex-col items-center justify-center gap-0.5 text-[11px] text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
    >
      <Plus className="h-5 w-5" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
