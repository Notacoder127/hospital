import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Siren,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppHeader } from "@/components/app-header";
import { useAuth } from "@/lib/auth-store";
import { useProfile } from "@/lib/profile-store";
import { patient } from "@/lib/mock-data";
import {
  findNearbyHospitals,
  sendSosSms,
  type NearbyHospital,
} from "@/lib/sos.functions";

export const Route = createFileRoute("/sos")({
  head: () => ({
    meta: [
      { title: "Emergency SOS — MediRemind" },
      {
        name: "description",
        content: "Find the nearest hospitals and alert your emergency contact instantly.",
      },
    ],
  }),
  component: SosPage,
});

type Status = "requesting" | "denied" | "error" | "ready";

function SosPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { data: profile } = useProfile(auth.user?.id);
  const findFn = useServerFn(findNearbyHospitals);
  const smsFn = useServerFn(sendSosSms);

  const [status, setStatus] = useState<Status>("requesting");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [hospitals, setHospitals] = useState<NearbyHospital[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.user) navigate({ to: "/auth" });
  }, [auth, navigate]);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setErrorMsg("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("ready");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setStatus("denied");
        else {
          setStatus("error");
          setErrorMsg(err.message);
        }
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, []);

  // Fetch hospitals and send SMS once we have coords
  useEffect(() => {
    if (!coords) return;
    setLoadingHospitals(true);
    findFn({ data: coords })
      .then((r) => setHospitals(r.hospitals))
      .catch((e: Error) => toast.error(`Couldn't load hospitals: ${e.message}`))
      .finally(() => setLoadingHospitals(false));
  }, [coords, findFn]);

  useEffect(() => {
    if (!coords || smsSent) return;
    const contactPhone =
      profile?.emergency_contact_phone || patient.emergencyContact.phone;
    const patientName = profile?.full_name || patient.name;
    if (!contactPhone) return;
    setSmsSent(true);
    smsFn({ data: { patientName, contactPhone, lat: coords.lat, lng: coords.lng } })
      .then(() => toast.success("Emergency contact alerted via SMS"))
      .catch((e: Error) => {
        setSmsSent(false);
        toast.error(`SMS failed: ${e.message}`);
      });
  }, [coords, profile, smsFn, smsSent]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6">
        <Button asChild variant="ghost" className="mb-4 gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>

        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emergency text-emergency-foreground">
            <Siren className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold">Emergency SOS</h1>
            <p className="text-sm text-muted-foreground">
              Finding the nearest hospitals and notifying your emergency contact.
            </p>
          </div>
        </div>

        {status === "requesting" && (
          <Card className="border-border/70">
            <CardContent className="flex items-center gap-3 py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-base font-medium">Requesting location…</p>
            </CardContent>
          </Card>
        )}

        {status === "denied" && (
          <Card className="border-emergency/40 bg-emergency/5">
            <CardContent className="space-y-3 py-6">
              <p className="text-base font-semibold text-emergency">
                Location access denied
              </p>
              <p className="text-sm text-muted-foreground">
                Please enable location in your browser settings, or call 108 directly.
              </p>
              <Button
                asChild
                className="h-12 w-full bg-emergency text-emergency-foreground hover:bg-emergency/90"
              >
                <a href="tel:108">
                  <Phone className="mr-2 h-5 w-5" /> Call 108
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {status === "error" && (
          <Card className="border-border/70">
            <CardContent className="py-6">
              <p className="text-base font-semibold">Location unavailable</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {errorMsg ?? "Something went wrong getting your location."}
              </p>
            </CardContent>
          </Card>
        )}

        {status === "ready" && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Nearest hospitals</h2>
              {loadingHospitals && (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </span>
              )}
            </div>
            {!loadingHospitals && hospitals.length === 0 && (
              <p className="text-sm text-muted-foreground">No hospitals found nearby.</p>
            )}
            {hospitals.map((h) => (
              <HospitalCard key={h.placeId} hospital={h} userCoords={coords!} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

function HospitalCard({
  hospital,
  userCoords,
}: {
  hospital: NearbyHospital;
  userCoords: { lat: number; lng: number };
}) {
  const km = haversineKm(userCoords.lat, userCoords.lng, hospital.lat, hospital.lng);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`;
  return (
    <Card className="border-border/70 shadow-[var(--shadow-soft)]">
      <CardContent className="space-y-3 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">{hospital.name}</h3>
            {hospital.vicinity && (
              <p className="mt-0.5 flex items-start gap-1 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {hospital.vicinity}
              </p>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            {km.toFixed(2)} km
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            asChild
            variant="outline"
            className="h-11"
            disabled={!hospital.phone}
          >
            {hospital.phone ? (
              <a href={`tel:${hospital.phone}`}>
                <Phone className="mr-2 h-4 w-4" /> Call
              </a>
            ) : (
              <span>
                <Phone className="mr-2 h-4 w-4" /> No number
              </span>
            )}
          </Button>
          <Button asChild className="h-11">
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
              <Navigation className="mr-2 h-4 w-4" /> Get directions
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
