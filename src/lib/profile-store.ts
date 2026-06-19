import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PatientProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  blood_group: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
}

export const profileQueryKey = (userId: string | undefined) => ["profile", userId] as const;

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: profileQueryKey(userId),
    enabled: !!userId,
    queryFn: async (): Promise<PatientProfile | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, phone, address, blood_group, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship",
        )
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return (data as PatientProfile) ?? null;
    },
  });
}
