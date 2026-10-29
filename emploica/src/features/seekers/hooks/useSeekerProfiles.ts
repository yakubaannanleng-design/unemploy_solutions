import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { SeekerProfile } from "../types";

export function useSeekerProfiles() {
  return useQuery({
    queryKey: ["seekerProfiles"],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase.from("seeker_profiles").select("*");
      if (error) throw error;
      return (data ?? []).map((s: Record<string, unknown>) => ({
        userId: s.user_id,
        bio: s.bio ?? "",
        skills: s.skills ?? [],
        categories: s.categories ?? [],
        contractWanted: s.contract_wanted ?? [],
        availability: s.availability ?? "immédiatement",
        zone: { region: s.zone_region, city: s.zone_city, quartier: s.zone_quartier, lat: s.lat, lng: s.lng },
        radiusKm: s.radius_km ?? 10,
        experience: s.experience ?? "",
        education: s.education,
        cvUrl: s.cv_url,
        languages: s.languages ?? [],
        photo: s.photo,
        missionsDone: s.missions_done ?? 0,
        rating: s.rating,
      })) as SeekerProfile[];
    },
    enabled: !!supabase,
  });
}
