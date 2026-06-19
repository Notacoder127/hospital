import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { HospitalHeader } from "@/components/hospital-header";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/hospital")({
  component: HospitalLayout,
});

function HospitalLayout() {
  const navigate = useNavigate();
  const auth = useAuth();
  useEffect(() => {
    if (auth.loading) return;
    if (!auth.user) navigate({ to: "/auth" });
    else if (auth.role === "patient") navigate({ to: "/" });
  }, [auth, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <HospitalHeader />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
