import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Offer } from "../types";

export function useOffers() {
  return useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase.from("offers").select("*");
      if (error) throw error;
      return (data ?? []).map((o: Record<string, unknown>) => ({
        id: o.id,
        employerId: o.employer_id,
        title: o.title,
        description: o.description,
        tasks: o.tasks ?? [],
        category: o.category,
        skills: o.skills ?? [],
        location: { region: o.location_region, city: o.location_city, quartier: o.location_quartier, lat: o.lat, lng: o.lng },
        contract: o.contract,
        duration: o.duration,
        schedule: o.schedule,
        pay: o.pay,
        payMode: o.pay_mode,
        createdAt: o.created_at,
        expiresAt: o.expires_at,
        status: o.status,
        boost: o.boost,
        views: o.views,
      })) as Offer[];
    },
    enabled: !!supabase,
  });
}
