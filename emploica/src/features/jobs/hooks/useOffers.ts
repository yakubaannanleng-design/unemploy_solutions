import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { ContractType, Offer, OfferContactMode, OfferStatus } from "@/types";

const offerStatuses: Record<string, OfferStatus> = {
  brouillon: "brouillon",
  "en-attente": "en-attente",
  publiee: "publiée",
  publiée: "publiée",
  cloturee: "clôturée",
  clôturée: "clôturée",
  expiree: "expirée",
  expirée: "expirée",
};

const contracts: Record<string, ContractType> = {
  permanent: "permanent",
  temporaire: "temporaire",
  mission: "mission",
  stage: "stage",
  "temps-partiel": "temps-partiel",
  independant: "indépendant",
  indépendant: "indépendant",
};

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : [];
}

function mapOffer(row: Record<string, unknown>): Offer {
  const rawStatus = stringValue(row.status);
  const rawContract = stringValue(row.contract);
  const rawPayMode = stringValue(row.pay_mode);
  const rawContactMode = stringValue(row.contact_mode);
  const contactMode: OfferContactMode | undefined =
    rawContactMode === "profil" || rawContactMode === "whatsapp" || rawContactMode === "appel"
      ? rawContactMode
      : undefined;
  return {
    id: stringValue(row.id),
    employerId: stringValue(row.employer_id),
    title: stringValue(row.title),
    description: stringValue(row.description),
    tasks: stringArray(row.tasks),
    category: stringValue(row.category),
    skills: stringArray(row.skills),
    location: {
      region: stringValue(row.location_region),
      city: stringValue(row.location_city),
      quartier: stringValue(row.location_quartier),
      lat: typeof row.lat === "number" ? row.lat : undefined,
      lng: typeof row.lng === "number" ? row.lng : undefined,
    },
    contract: contracts[rawContract] ?? "mission",
    duration: stringValue(row.duration),
    schedule: stringValue(row.schedule),
    pay: stringValue(row.pay),
    payMode: rawPayMode === "negocier" || rawPayMode === "négocier" ? "négocier" : "fixe",
    createdAt: stringValue(row.created_at),
    expiresAt: typeof row.expires_at === "string" ? row.expires_at : undefined,
    status: offerStatuses[rawStatus] ?? "en-attente",
    boost: row.boost === true,
    views: typeof row.views === "number" ? row.views : 0,
    educationLevel: typeof row.education_level === "string" ? row.education_level : undefined,
    experienceLevel: typeof row.experience_level === "string" ? row.experience_level : undefined,
    cvRequired: row.cv_required === true,
    salaryMin: typeof row.salary_min === "number" ? row.salary_min : undefined,
    salaryMax: typeof row.salary_max === "number" ? row.salary_max : undefined,
    contactMode,
    contactPhone: typeof row.contact_phone === "string" ? row.contact_phone : undefined,
    contactEmail: typeof row.contact_email === "string" ? row.contact_email : undefined,
    shareTelegram: row.share_telegram === true,
    telegramMessageId: typeof row.telegram_message_id === "string" ? row.telegram_message_id : undefined,
    isFilled: row.is_filled === true,
    filledAt: typeof row.filled_at === "string" ? row.filled_at : undefined,
  };
}

export interface OfferFilters {
  search?: string;
  city?: string;
  quartier?: string;
  contract?: string;
  educationLevel?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  publishedWithinDays?: number;
  hideFilled?: boolean;
}

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}

export function filterOffers(
  offers: Offer[],
  filters: OfferFilters,
  employerNames: ReadonlyMap<string, string> = new Map(),
): Offer[] {
  const search = normalize(filters.search?.trim() ?? "");
  const city = normalize(filters.city ?? "");
  const quartier = normalize(filters.quartier ?? "");

  return offers.filter((offer) => {
    const company = employerNames.get(offer.employerId) ?? "";
    const searchable = normalize([
      offer.title,
      offer.description,
      offer.category,
      offer.location.city,
      offer.location.quartier ?? "",
      offer.pay,
      company,
      ...offer.skills,
    ].join(" "));
    const salaryMin = offer.salaryMin ?? offer.salaryMax;
    const salaryMax = offer.salaryMax ?? offer.salaryMin;
    const publishedAt = new Date(offer.createdAt).getTime();
    const maxAge = filters.publishedWithinDays
      ? filters.publishedWithinDays * 24 * 60 * 60 * 1000
      : undefined;
    return (
      (!search || searchable.includes(search)) &&
      (!city || normalize(offer.location.city) === city) &&
      (!quartier || normalize(offer.location.quartier ?? "") === quartier) &&
      (!filters.contract || offer.contract === filters.contract) &&
      (!filters.educationLevel || offer.educationLevel === filters.educationLevel) &&
      (!filters.experienceLevel || offer.experienceLevel === filters.experienceLevel) &&
      (filters.hideFilled !== true || offer.isFilled !== true) &&
      (filters.salaryMin === undefined || (salaryMax !== undefined && salaryMax >= filters.salaryMin)) &&
      (filters.salaryMax === undefined || (salaryMin !== undefined && salaryMin <= filters.salaryMax)) &&
      (!maxAge || (Number.isFinite(publishedAt) && Date.now() - publishedAt <= maxAge))
    );
  });
}

export function useOffers() {
  return useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      if (!supabase) throw new Error("Supabase n'est pas configuré.");
      const { data, error } = await supabase.from("offers").select("*");
      if (error) throw error;
      return (data ?? []).map((row) => mapOffer(row as Record<string, unknown>));
    },
    enabled: !!supabase,
  });
}
