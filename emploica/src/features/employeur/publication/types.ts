import type { ContractType, OfferContactMode } from "@/types";

export interface PublicationDraft {
  title: string;
  category: string;
  description: string;
  skills: string;
  region: string;
  city: string;
  quartier: string;
  contract: ContractType;
  salaryMin: string;
  salaryMax: string;
  educationLevel: string;
  experienceLevel: string;
  cvRequired: boolean;
  expiresAt: string;
  contactMode: OfferContactMode;
  contactPhone: string;
  contactEmail: string;
  shareTelegram: boolean;
}
