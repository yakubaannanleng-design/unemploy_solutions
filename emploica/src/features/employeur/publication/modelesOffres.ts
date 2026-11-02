export interface ModeleOffre {
  id: "vendeur" | "comptable" | "chauffeur" | "autre";
  label: string;
  labelEn: string;
  title: string;
  titleEn: string;
  category: string;
  description: string;
  descriptionEn: string;
}

export const modelesOffres: ModeleOffre[] = [
  {
    id: "vendeur",
    label: "Vendeur",
    labelEn: "Salesperson",
    title: "Vendeur(se)",
    titleEn: "Salesperson",
    category: "commerce",
    description: "Accueillir les clients, présenter les produits et contribuer aux ventes.",
    descriptionEn: "Welcome customers, present products, and contribute to sales.",
  },
  {
    id: "comptable",
    label: "Comptable",
    labelEn: "Accountant",
    title: "Comptable",
    titleEn: "Accountant",
    category: "administration",
    description: "Assurer le suivi des opérations comptables et préparer les documents financiers.",
    descriptionEn: "Track accounting operations and prepare financial documents.",
  },
  {
    id: "chauffeur",
    label: "Chauffeur",
    labelEn: "Driver",
    title: "Chauffeur",
    titleEn: "Driver",
    category: "transport",
    description: "Assurer les déplacements et livraisons dans le respect des consignes de sécurité.",
    descriptionEn: "Handle trips and deliveries while following safety instructions.",
  },
  {
    id: "autre",
    label: "Autre",
    labelEn: "Other",
    title: "",
    titleEn: "",
    category: "autres",
    description: "",
    descriptionEn: "",
  },
];
