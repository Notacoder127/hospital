import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CalendarPlus, ChevronRight, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/app-header";
import {
  appointments,
  formatDate,
  statusStyles,
  type Appointment,
  getSavedAppointments,
} from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/appointments/")({
  head: () => ({
    meta: [
      { title: "Appointments — MediRemind" },
      { name: "description", content: "All your upcoming and past health appointments." },
    ],
  }),
  component: AppointmentsPage,
});

function AppointmentsPage() {
  const [allAppointments, setAllAppointments] = useState<Appointment[]>(appointments);
  const auth = useAuth();

  useEffect(() => {
    if (auth.loading) return;
    if (typeof window !== "undefined") {
      const userId = auth.user?.id || "anonymous";
      const local = getSavedAppointments(userId);
      const filteredMocks = appointments.filter(
        (mock) => !local.some((l: any) => l.id === mock.id),
      );
      setAllAppointments([...local, ...filteredMocks]);
    }
  }, [auth.user?.id, auth.loading]);

  const upcoming = allAppointments.filter((a) => a.status !== "Completed");
  const past = allAppointments.filter((a) => a.status === "Completed");

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold sm:text-4xl">Appointments</h1>
            <p className="mt-1 text-muted-foreground">Manage all scheduled visits.</p>
          </div>
          <Button asChild size="lg" className="h-11 gap-2">
            <Link to="/appointments/new">
              <CalendarPlus className="h-4 w-4" />
              New appointment
            </Link>
          </Button>
        </div>

        <Section title="Upcoming" items={upcoming} />
        <Section title="Past" items={past} muted />
      </main>
    </div>
  );
}

function Section({
  title,
  items,
  muted,
}: {
  title: string;
  items: typeof appointments;
  muted?: boolean;
}) {
  return (
    <Card className="mb-6 border-border/70 shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground">Nothing here yet.</p>
        ) : (
          items.map((a) => {
            const f = formatDate(a.date);
            return (
              <Link
                key={a.id}
                to="/appointments/$id"
                params={{ id: a.id }}
                className={cn(
                  "flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/40",
                  muted && "opacity-80",
                )}
              >
                <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <span className="text-xs font-semibold uppercase">{f.day}</span>
                  <span className="text-lg font-semibold leading-tight">
                    {f.date.split(" ")[1]}
                  </span>
                  <span className="text-[10px] uppercase">{f.date.split(" ")[0]}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-semibold sm:text-lg">{a.title}</h3>
                    <Badge
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium",
                        statusStyles[a.status],
                      )}
                    >
                      {a.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{a.doctor}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {f.time}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {a.location}
                    </span>
                  </div>
                </div>
                <ChevronRight className="hidden h-5 w-5 text-muted-foreground sm:block" />
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
