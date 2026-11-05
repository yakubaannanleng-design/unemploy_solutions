import type { ContractType, OfferContactMode } from "@/types";

export interface PublicationDraft {
  title: string;
  category: string;
  description: string;
  region: string;
  city: string;
  quartier: string;
  contract: ContractType;
  salaryMin: string;
  salaryMax: string;
  educationLevel: string;
  experienceLevel: string;
  expiresAt: string;
  contactMode: OfferContactMode;
  contactPhone: string;
  shareTelegram: boolean;
}
