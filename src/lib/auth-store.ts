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

export function setRoleOverride(role: Role | null) {
  if (typeof window !== "undefined") {
    if (role) {
      localStorage.setItem("dev_role_override", role);
    } else {
      localStorage.removeItem("dev_role_override");
    }
    window.dispatchEvent(new Event("auth-role-change"));
  }
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    loading: true,
  });

  const getRole = (dbRole: Role | null): Role | null => {
    if (typeof window !== "undefined") {
      const override = localStorage.getItem("dev_role_override") as Role | null;
      if (override) return override;
    }
    return dbRole;
  };

  useEffect(() => {
    let active = true;

    // Initial load
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      const session = data.session;
      const user = session?.user ?? null;
      const dbRole = user ? await fetchRole(user.id) : null;
      if (!active) return;
      setState({ user, session, role: getRole(dbRole), loading: false });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      // Defer DB call to avoid deadlocking the auth callback
      setState((s) => ({ ...s, user, session, loading: false }));
      if (user) {
        setTimeout(async () => {
          const dbRole = await fetchRole(user.id);
          setState((s) => ({ ...s, role: getRole(dbRole) }));
        }, 0);
      } else {
        setState((s) => ({ ...s, role: null }));
      }
    });

    // Listen for manual role changes in dev mode
    const handleRoleChange = () => {
      setState((s) => ({ ...s, role: getRole(s.role) }));
    };
    window.addEventListener("auth-role-change", handleRoleChange);

    return () => {
      active = false;
      sub.subscription.unsubscribe();
      window.removeEventListener("auth-role-change", handleRoleChange);
    };
  }, []);

  return state;
}

export async function signOut() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("dev_role_override");
    sessionStorage.clear();
  }
  await supabase.auth.signOut();
}
