// PROBLÈME RÉSOLU : centralise le chargement et la modification des offres enregistrées dans Supabase.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

export function useFavorites(userId: string | null) {
  const { lang } = useLang();
  const queryClient = useQueryClient();
  const favoritesQuery = useQuery({
    queryKey: ["favorites", userId],
    enabled: !!supabase && !!userId,
    queryFn: async () => {
      if (!supabase || !userId) throw new Error("Supabase et un compte utilisateur sont nécessaires.");
      const { data, error } = await supabase
        .from("favorites")
        .select("offer_id")
        .eq("user_id", userId);
      if (error) throw error;
      return (data ?? []).map((favorite) => favorite.offer_id);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ offerId, saved }: { offerId: string; saved: boolean }) => {
      if (!supabase || !userId) {
        throw new Error(lang === "fr" ? "Connexion à Supabase indisponible." : "Supabase is unavailable.");
      }
      const result = saved
        ? await supabase.from("favorites").delete().eq("user_id", userId).eq("offer_id", offerId)
        : await supabase.from("favorites").insert({ user_id: userId, offer_id: offerId });
      if (result.error) throw result.error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["favorites", userId] });
    },
    onError: (error) => {
      toast.error(error instanceof Error
        ? error.message
        : lang === "fr" ? "Impossible de modifier les offres enregistrées." : "Could not update saved jobs.",
      );
    },
  });

  const savedIds = favoritesQuery.data ?? [];
  return {
    savedIds,
    isLoading: favoritesQuery.isLoading,
    error: favoritesQuery.error,
    toggle: (offerId: string) => toggleMutation.mutate({
      offerId,
      saved: savedIds.includes(offerId),
    }),
    isPending: toggleMutation.isPending,
    refetch: favoritesQuery.refetch,
  };
}
