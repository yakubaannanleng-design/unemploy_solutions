import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Offer } from "@/types";

type ViewableOffer = Pick<Offer, "id" | "employerId" | "status" | "isFilled">;

export function useRecordOfferView(offer: ViewableOffer | undefined, viewerId: string): void {
  const queryClient = useQueryClient();
  const { mutate: recordOfferView } = useMutation({
    mutationFn: async (offerId: string) => {
      if (!supabase) throw new Error("Connexion à Supabase indisponible.");
      const { error } = await supabase.rpc("record_offer_view", { p_offer_id: offerId });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["employerMonthlyViews"] });
    },
    onError: (error) => {
      console.error("Supabase record offer view error:", error);
    },
  });

  useEffect(() => {
    if (
      !supabase ||
      !offer ||
      offer.status !== "publiée" ||
      offer.isFilled === true ||
      offer.employerId === viewerId
    ) {
      return;
    }
    recordOfferView(offer.id);
  }, [offer, viewerId, recordOfferView]);
}
