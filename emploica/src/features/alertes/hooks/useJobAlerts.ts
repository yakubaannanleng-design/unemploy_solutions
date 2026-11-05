import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/i18n";
import type { ContractType } from "@/types";
import type { JobAlert, NewJobAlert } from "../types";

const contracts: Record<string, ContractType> = {
  permanent: "permanent",
  temporaire: "temporaire",
  mission: "mission",
  stage: "stage",
  "temps-partiel": "temps-partiel",
  independant: "indépendant",
};

function mapAlert(row: Record<string, unknown>): JobAlert {
  const rawContract = typeof row.contract === "string" ? row.contract : "";
  return {
    id: typeof row.id === "string" ? row.id : "",
    userId: typeof row.user_id === "string" ? row.user_id : "",
    category: typeof row.category === "string" ? row.category : "",
    city: typeof row.city === "string" ? row.city : "",
    contract: contracts[rawContract] ?? "",
    frequency: row.frequency === "daily" ? "daily" : "immediate",
    active: row.active === true,
    createdAt: typeof row.created_at === "string" ? row.created_at : "",
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return fallback;
}

export function useJobAlerts(userId: string) {
  const { lang } = useLang();
  const queryClient = useQueryClient();
  const queryKey = ["job-alerts", userId];
  const alertsQuery = useQuery({
    queryKey,
    enabled: !!supabase && !!userId,
    queryFn: async () => {
      if (!supabase || !userId) throw new Error("Supabase et un compte utilisateur sont nécessaires.");
      const { data, error } = await supabase
        .from("job_alerts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => mapAlert(row as Record<string, unknown>));
    },
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey });
  };
  const fallback = lang === "fr" ? "Impossible d'enregistrer l'alerte." : "Could not save the alert.";
  const createMutation = useMutation({
    mutationFn: async (alert: NewJobAlert) => {
      if (!supabase) throw new Error(lang === "fr" ? "Connexion à Supabase indisponible." : "Supabase is unavailable.");
      const contract = alert.contract === "indépendant" ? "independant" : alert.contract || null;
      const { error } = await supabase.from("job_alerts").insert({
        id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        user_id: userId,
        category: alert.category || null,
        city: alert.city.trim() || null,
        contract,
        frequency: alert.frequency,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await refresh();
      toast.success(lang === "fr" ? "Alerte créée." : "Alert created.");
    },
    onError: (error) => toast.error(getErrorMessage(error, fallback)),
  });
  const activeMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      if (!supabase) throw new Error(lang === "fr" ? "Connexion à Supabase indisponible." : "Supabase is unavailable.");
      const { error } = await supabase.from("job_alerts").update({ active }).eq("id", id).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (error) => toast.error(getErrorMessage(
      error,
      lang === "fr" ? "Impossible de modifier l'alerte." : "Could not update the alert.",
    )),
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error(lang === "fr" ? "Connexion à Supabase indisponible." : "Supabase is unavailable.");
      const { error } = await supabase.from("job_alerts").delete().eq("id", id).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refresh();
      toast.success(lang === "fr" ? "Alerte supprimée." : "Alert deleted.");
    },
    onError: (error) => toast.error(getErrorMessage(
      error,
      lang === "fr" ? "Impossible de supprimer l'alerte." : "Could not delete the alert.",
    )),
  });

  return {
    alerts: alertsQuery.data ?? [],
    isLoading: alertsQuery.isLoading,
    error: alertsQuery.error,
    refetch: alertsQuery.refetch,
    create: (alert: NewJobAlert, onSuccess: () => void) => createMutation.mutate(alert, { onSuccess }),
    isCreating: createMutation.isPending,
    setActive: (id: string, active: boolean) => activeMutation.mutate({ id, active }),
    remove: (id: string) => deleteMutation.mutate(id),
  };
}
