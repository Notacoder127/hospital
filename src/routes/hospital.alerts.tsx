import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Navigation, Phone, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { emergencyAlerts, hospitalPatients } from "@/lib/hospital-data";
import { NearestHospitalMap } from "@/components/nearest-hospital-map";

export const Route = createFileRoute("/hospital/alerts")({
  head: () => ({ meta: [{ title: "Emergency Alerts — MediRemind" }] }),
  component: AlertsPage,
});

function AlertsPage() {
  return (
    <>
      <section className="mb-8 flex items-start gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-emergency/15 text-emergency">
          <Siren className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">Emergency alerts</h1>
          <p className="mt-1 text-muted-foreground">
            Active escalations from critical diagnostic reports.
          </p>
        </div>
      </section>

      {emergencyAlerts.length === 0 ? (
        <Card className="border-border/70">
          <CardContent className="py-12 text-center text-muted-foreground">
            No active emergency alerts.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {emergencyAlerts.map((a) => {
            const patient = hospitalPatients.find((p) => p.id === a.patientId);
            return (
              <Card
                key={a.id}
                className="overflow-hidden border-emergency/40 shadow-[var(--shadow-soft)]"
              >
                <CardHeader className="bg-emergency/5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      {a.patientName}
                      <Badge className="bg-emergency text-emergency-foreground">CRITICAL</Badge>
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {new Date(a.triggeredAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{a.reportType}</p>
                </CardHeader>
                <CardContent className="grid gap-6 p-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Patient location
                      </p>
                      <p className="mt-1 inline-flex items-start gap-2 text-sm">
                        <MapPin className="mt-0.5 h-4 w-4 text-emergency" />
                        {a.address}
                      </p>
                    </div>
                    {patient && (
                      <div className="space-y-1 rounded-lg bg-muted/50 p-3 text-sm">
                        <p className="inline-flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          Patient: {patient.phone}
                        </p>
                        <p className="inline-flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          Emergency contact: {patient.emergencyContact.name} ·{" "}
                          {patient.emergencyContact.phone}
                        </p>
                      </div>
                    )}
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Nearest hospital
                      </p>
                      <p className="mt-1 text-sm font-medium">{a.nearestHospital.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.nearestHospital.distanceKm} km away
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Route to nearest hospital
                      </p>
                      <NearestHospitalMap
                        address={a.address}
                        hospitalName={a.nearestHospital.name}
                        height={240}
                      />
                      <Button
                        asChild
                        variant="outline"
                        className="mt-3 h-12 w-full gap-2 rounded-xl border-2 text-base font-medium"
                      >
                        <a href={a.nearestHospital.mapsUrl} target="_blank" rel="noreferrer">
                          <Navigation className="h-5 w-5" />
                          Take me to Google Maps
                        </a>
                      </Button>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Status log
                      </p>
                      <ol className="space-y-3 border-l-2 border-emergency/30 pl-4">
                        {a.log.map((entry, i) => (
                          <li key={i} className="relative">
                            <span className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full bg-emergency" />
                            <p className="text-sm">{entry.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(entry.timestamp).toLocaleString()}
                            </p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
