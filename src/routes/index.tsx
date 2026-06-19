import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  CalendarPlus,
  ChevronRight,
  Clock,
  MapPin,
  Navigation,
  Phone,
  Siren,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AppHeader, EmergencyDialog } from "@/components/app-header";
import { useAuth } from "@/lib/auth-store";
import { useProfile } from "@/lib/profile-store";
import {
  appointments,
  formatDate,
  patient,
  statusStyles,
  type Appointment,
  getSavedAppointments,
} from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — MediRemind" },
      {
        name: "description",
        content:
          "Your MediRemind dashboard: profile summary, upcoming appointments, and one-tap Emergency SOS.",
      },
      { property: "og:title", content: "Dashboard — MediRemind" },
      {
        property: "og:description",
        content: "Stay on top of appointments and reach help fast with Emergency SOS.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { data: profile } = useProfile(auth.user?.id);
  const [greeting, setGreeting] = useState("Good morning");
  const [allAppointments, setAllAppointments] = useState<Appointment[]>(appointments);

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.user) navigate({ to: "/auth" });
    else if (auth.role === "hospital") navigate({ to: "/hospital" });
  }, [auth, navigate]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 17) {
      setGreeting("Good afternoon");
    } else if (hour >= 17 || hour < 5) {
      setGreeting("Good evening");
    }
  }, []);

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
  const displayName = (profile?.full_name?.trim() || patient.name).split(" ")[0];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <section className="mb-8 flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Today</p>
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
            {greeting}, {displayName}.
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            You have {upcoming.length} upcoming appointment{upcoming.length === 1 ? "" : "s"}.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <UpcomingList items={upcoming} />
            <PastList items={past} />
          </div>
          <div className="space-y-6">
            <EmergencyCard />
            <ProfileCard />
            <QuickActions />
          </div>
        </div>
      </main>
    </div>
  );
}

function UpcomingList({ items }: { items: Appointment[] }) {
  return (
    <Card className="border-border/70 shadow-[var(--shadow-soft)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl">Upcoming appointments</CardTitle>
        <Button asChild size="lg" className="h-11 gap-2">
          <Link to="/appointments/new">
            <CalendarPlus className="h-4 w-4" />
            <span className="hidden sm:inline">New appointment</span>
            <span className="sm:hidden">New</span>
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No upcoming appointments.</p>
        ) : (
          items.map((a) => <AppointmentRow key={a.id} appt={a} />)
        )}
      </CardContent>
    </Card>
  );
}

function PastList({ items }: { items: Appointment[] }) {
  return (
    <Card className="border-border/70 shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle className="text-xl">Past appointments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((a) => (
          <AppointmentRow key={a.id} appt={a} muted />
        ))}
      </CardContent>
    </Card>
  );
}

function AppointmentRow({ appt, muted }: { appt: Appointment; muted?: boolean }) {
  const f = formatDate(appt.date);
  return (
    <Link
      to="/appointments/$id"
      params={{ id: appt.id }}
      className={cn(
        "flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        muted && "opacity-80",
      )}
    >
      <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
        <span className="text-xs font-semibold uppercase tracking-wide">{f.day}</span>
        <span className="text-lg font-semibold leading-tight">{f.dateVal}</span>
        <span className="text-[10px] uppercase">{f.monthVal}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-semibold sm:text-lg">{appt.title}</h3>
          <Badge
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium",
              statusStyles[appt.status],
            )}
          >
            {appt.status}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{appt.doctor}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {f.time}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {appt.location}
          </span>
        </div>
      </div>
      <ChevronRight className="hidden h-5 w-5 text-muted-foreground sm:block" />
    </Link>
  );
}

function ProfileCard() {
  const auth = useAuth();
  const { data: profile } = useProfile(auth.user?.id);
  const name = profile?.full_name?.trim() || patient.name;
  const address = profile?.address?.trim() || patient.address;
  const phone = profile?.phone?.trim() || patient.phone;
  const bloodGroup = profile?.blood_group?.trim() || "";
  const ecName = profile?.emergency_contact_name?.trim() || patient.emergencyContact.name;
  const ecPhone = profile?.emergency_contact_phone?.trim() || patient.emergencyContact.phone;
  const ecRel = profile?.emergency_contact_relationship?.trim() || "";
  return (
    <Card className="border-border/70 shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle className="text-lg">Patient profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
            <User className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">{name}</p>
            <p className="text-sm text-muted-foreground">{address}</p>
          </div>
        </div>
        <div className="space-y-2 rounded-lg bg-muted/60 p-3 text-sm">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{phone}</span>
          </div>
          {bloodGroup && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Blood
              </span>
              <span>{bloodGroup}</span>
            </div>
          )}
        </div>
        <div className="space-y-1.5 rounded-lg border border-dashed border-border p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Emergency contact
          </p>
          <p className="text-sm font-medium">
            {ecName}
            {ecRel && <span className="text-muted-foreground"> · {ecRel}</span>}
          </p>
          <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            {ecPhone}
          </p>
        </div>
        <Button asChild variant="outline" className="h-11 w-full">
          <Link to="/profile">Edit profile</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function EmergencyCard() {
  const auth = useAuth();
  const { data: profile } = useProfile(auth.user?.id);
  const contactName = profile?.emergency_contact_name?.trim() || patient.emergencyContact.name;
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // ignore, fallback to patient.address
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }
  }, []);

  const queryStr = coords
    ? `hospital near ${coords.lat},${coords.lng}`
    : `hospital near ${profile?.address || patient.address}`;

  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    queryStr,
  )}`;
  return (
    <Card
      className="overflow-hidden border-transparent text-emergency-foreground shadow-[var(--shadow-emergency)]"
      style={{ background: "var(--gradient-emergency)" }}
    >
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Siren className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-widest opacity-90">
            Emergency
          </span>
        </div>
        <h2 className="font-display text-2xl font-semibold leading-tight">Need help right now?</h2>
        <p className="mt-1 text-sm opacity-90">
          Share your location with {contactName} and find nearby hospitals.
        </p>
        <EmergencyDialog
          trigger={
            <Button
              size="lg"
              className="mt-5 h-14 w-full bg-white text-base font-semibold text-[oklch(0.5_0.22_22)] shadow-lg hover:bg-white/95"
            >
              <Siren className="mr-2 h-5 w-5" />
              Activate SOS
            </Button>
          }
        />
        <Button
          asChild
          variant="outline"
          className="mt-3 h-12 w-full gap-2 rounded-xl border-2 border-white/40 bg-white/10 text-base font-medium text-white backdrop-blur hover:bg-white/20 hover:text-white"
        >
          <a href={mapsSearchUrl} target="_blank" rel="noreferrer">
            <Navigation className="h-5 w-5" />
            Take me to Google Maps
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  return (
    <Card className="border-border/70 shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle className="text-lg">Quick actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Button asChild variant="outline" className="h-12 justify-start gap-3">
          <Link to="/appointments/new">
            <CalendarPlus className="h-4 w-4" />
            New appointment
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12 justify-start gap-3">
          <Link to="/appointments">
            <Activity className="h-4 w-4" />
            View all appointments
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12 justify-start gap-3">
          <Link to="/profile">
            <User className="h-4 w-4" />
            Edit profile
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
