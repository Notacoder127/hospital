import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, ClipboardList, Loader2, MapPin, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/app-header";
import { appointments, formatDate, statusStyles, type Appointment } from "@/lib/mock-data";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/appointments/$id")({
  loader: async ({ params }) => {
    let appt: Appointment | null = null;
    if (typeof window !== "undefined") {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id || "anonymous";
      const stored = localStorage.getItem(`mediremind_appointments_${userId}`);
      const list = stored ? JSON.parse(stored) : [];
      appt = list.find((a: any) => a.id === params.id) || null;
    }
    if (!appt) {
      appt = appointments.find((a) => a.id === params.id) || null;
    }
    if (!appt) {
      if (typeof window === "undefined") {
        return { appt: null };
      }
      throw notFound();
    }
    return { appt };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.appt?.title ?? "Appointment"} — MediRemind` },
      { name: "description", content: loaderData?.appt?.location ?? "" },
    ],
  }),
  notFoundComponent: NotFound,
  errorComponent: () => <ErrorView />,
  component: AppointmentDetail,
});

function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Appointment not found</h1>
        <Button asChild className="mt-4">
          <Link to="/appointments">Back to appointments</Link>
        </Button>
      </div>
    </div>
  );
}

function ErrorView() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <Button className="mt-4" onClick={() => router.invalidate()}>Retry</Button>
      </div>
    </div>
  );
}

function AppointmentDetail() {
  const { appt: loaderAppt } = Route.useLoaderData() as { appt: Appointment | null };
  const [localAppt, setLocalAppt] = useState<Appointment | null>(loaderAppt);
  const params = Route.useParams();
  const auth = useAuth();

  useEffect(() => {
    if (auth.loading) return;
    if (!localAppt && typeof window !== "undefined") {
      const userId = auth.user?.id || "anonymous";
      const stored = localStorage.getItem(`mediremind_appointments_${userId}`);
      const list = stored ? JSON.parse(stored) : [];
      const found = list.find((a: any) => a.id === params.id);
      if (found) {
        setLocalAppt(found);
      } else {
        // Force notFound if truly not found on client mount
        throw notFound();
      }
    }
  }, [localAppt, params.id, auth.user?.id, auth.loading]);

  if (!localAppt) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="mx-auto max-w-2xl px-4 py-16 text-center flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading appointment details…</p>
        </div>
      </div>
    );
  }

  const appt = localAppt;
  const f = formatDate(appt.date);
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" className="mb-4 h-10 gap-2">
          <Link to="/appointments">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>

        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold sm:text-4xl">{appt.title}</h1>
            <p className="mt-1 text-muted-foreground">{appt.doctor}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              className={cn(
                "rounded-full px-3 py-1 text-sm font-medium",
                statusStyles[appt.status],
              )}
            >
              {appt.status}
            </Badge>
            {appt.status !== "Completed" && (
              <Button
                size="sm"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    const userId = auth.user?.id || "anonymous";
                    const key = `mediremind_appointments_${userId}`;
                    const stored = localStorage.getItem(key);
                    let list = stored ? JSON.parse(stored) : [];
                    const index = list.findIndex((a: any) => a.id === appt.id);
                    if (index !== -1) {
                      list[index].status = "Completed";
                      localStorage.setItem(key, JSON.stringify(list));
                      setLocalAppt({ ...list[index] });
                    } else {
                      const updated = { ...appt, status: "Completed" as const };
                      list.unshift(updated);
                      localStorage.setItem(key, JSON.stringify(list));
                      setLocalAppt(updated);
                    }
                    toast.success("Appointment marked as completed");
                  }
                }}
              >
                Mark as Completed
              </Button>
            )}
          </div>
        </div>

        <Card className="border-border/70 shadow-[var(--shadow-soft)]">
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <Info icon={Calendar} label="When" value={f.full} />
            <Info icon={MapPin} label="Where" value={appt.location} />
            <Info icon={Stethoscope} label="Type" value={appt.type ?? "—"} />
          </CardContent>
        </Card>

        <Card className="mt-6 border-border/70 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5" />
              Documents to bring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(appt.documents ?? []).map((doc) => (
                <li
                  key={doc}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 p-3"
                >
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-border accent-primary"
                  />
                  <span className="text-base">{doc}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-base">{value}</p>
      </div>
    </div>
  );
}
