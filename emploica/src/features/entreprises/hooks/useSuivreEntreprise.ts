// PROBLÈME RÉSOLU : permet de suivre une entreprise avec la session Supabase du candidat.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

export function useSuivreEntreprise(companyId: string, followerId: string | null) {
  const queryClient = useQueryClient();
  const { lang } = useLang();
  const sessionQuery = useQuery({
    queryKey: ["supabaseAuthUserId"],
    enabled: !!supabase && !!followerId,
    queryFn: async () => {
      if (!supabase) throw new Error("Supabase n'est pas configuré.");
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user?.id ?? null;
    },
  });
  const canFollow = !!followerId && sessionQuery.data === followerId;
  const followedQuery = useQuery({
    queryKey: ["employerFollow", followerId, companyId],
    enabled: !!supabase && canFollow && !!companyId,
    queryFn: async () => {
      if (!supabase || !followerId) throw new Error("Connexion nécessaire pour suivre une entreprise.");
      const { data, error } = await supabase
        .from("employer_follows")
        .select("company_id")
        .eq("follower_id", followerId)
        .eq("company_id", companyId)
        .maybeSingle();
      if (error) throw error;
      return data !== null;
    },
  });
  const toggleFollow = useMutation({
    mutationFn: async (shouldFollow: boolean) => {
      if (!supabase || !followerId || sessionQuery.data !== followerId) {
        throw new Error("Connectez-vous pour suivre une entreprise.");
      }
      if (shouldFollow) {
        const { error } = await supabase.from("employer_follows").insert({
          follower_id: followerId,
          company_id: companyId,
        });
        if (error) throw error;
        return;
      }
      const { error } = await supabase
        .from("employer_follows")
        .delete()
        .eq("follower_id", followerId)
        .eq("company_id", companyId);
      if (error) throw error;
    },
    onSuccess: async (_result, shouldFollow) => {
      await queryClient.invalidateQueries({ queryKey: ["employerFollow", followerId, companyId] });
      toast.success(
        shouldFollow
          ? lang === "fr" ? "Entreprise suivie." : "Company followed."
          : lang === "fr" ? "Entreprise retirée des suivis." : "Company unfollowed.",
      );
    },
    onError: (error) => {
      toast.error(error instanceof Error
        ? error.message
        : lang === "fr"
          ? "Impossible de modifier le suivi de cette entreprise."
          : "Could not update this company's follow status.",
      );
    },
  });

  return {
    isFollowing: followedQuery.data === true,
    isLoading: sessionQuery.isLoading || (canFollow && followedQuery.isLoading),
    canFollow,
    requiresSupabaseAuth: !!followerId && sessionQuery.isSuccess && !canFollow,
    error: sessionQuery.error ?? (canFollow ? followedQuery.error : undefined),
    toggle: () => toggleFollow.mutate(!followedQuery.data),
    isPending: toggleFollow.isPending,
  };
}
