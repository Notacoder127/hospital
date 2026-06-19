import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "patient" | "hospital";

export interface AuthState {
  user: User | null;
  session: Session | null;
  role: Role | null;
  loading: boolean;
}

async function fetchRole(userId: string): Promise<Role | null> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("fetchRole error", error);
    return null;
  }
  return (data?.role as Role | undefined) ?? null;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    let active = true;

    // Initial load
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      const session = data.session;
      const user = session?.user ?? null;
      const role = user ? await fetchRole(user.id) : null;
      if (!active) return;
      setState({ user, session, role, loading: false });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      // Defer DB call to avoid deadlocking the auth callback
      setState((s) => ({ ...s, user, session, loading: false }));
      if (user) {
        setTimeout(async () => {
          const role = await fetchRole(user.id);
          setState((s) => ({ ...s, role }));
        }, 0);
      } else {
        setState((s) => ({ ...s, role: null }));
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export async function signOut() {
  await supabase.auth.signOut();
}
