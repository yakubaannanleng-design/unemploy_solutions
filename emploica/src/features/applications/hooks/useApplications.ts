import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Application, ApplicationStatus } from "../types";

const applicationStatuses: Record<string, ApplicationStatus> = {
  envoyee: "envoyée",
  envoyée: "envoyée",
  consultee: "consultée",
  consultée: "consultée",
  retenue: "retenue",
  refusee: "refusée",
  refusée: "refusée",
  retiree: "retirée",
  retirée: "retirée",
};

function mapApplication(row: Record<string, unknown>): Application {
  const rawStatus = typeof row.status === "string" ? row.status : "";
  const status = applicationStatuses[rawStatus];
  if (!status) throw new Error(`Statut de candidature inconnu : ${rawStatus || "(vide)"}`);
  return {
    id: String(row.id),
    offerId: String(row.offer_id),
    seekerId: String(row.seeker_id),
    status,
    createdAt: String(row.created_at),
    coverMessage: typeof row.cover_message === "string" ? row.cover_message : undefined,
    cvPath: typeof row.cv_path === "string" ? row.cv_path : undefined,
  };
}

export function useApplications() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase.from("applications").select("*");
      if (error) throw error;
      return (data ?? []).map((row) => mapApplication(row as Record<string, unknown>));
    },
    enabled: !!supabase,
  });
}

export function useUserApplications(userId: string | null) {
  return useQuery({
    queryKey: ["applications", userId],
    queryFn: async () => {
      if (!supabase || !userId) return [];
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("seeker_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => mapApplication(row as Record<string, unknown>));
    },
    enabled: !!supabase && !!userId,
  });
}
