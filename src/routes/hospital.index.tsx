import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Phone, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { emergencyAlerts, hospitalPatients, statusColor } from "@/lib/hospital-data";

export const Route = createFileRoute("/hospital/")({
  head: () => ({ meta: [{ title: "Hospital Dashboard — Mediremm" }] }),
  component: HospitalDashboard,
});

function HospitalDashboard() {
  const criticalCount = hospitalPatients.filter((p) => p.latestStatus === "Critical").length;
  return (
    <>
      <section className="mb-8 flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">Today</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Registered patients</h1>
        <p className="text-base text-muted-foreground">
          {hospitalPatients.length} patients · {criticalCount} active critical alert
          {criticalCount === 1 ? "" : "s"}
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/70 shadow-[var(--shadow-soft)] lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xl">Patient list</CardTitle>
            <Button asChild className="h-11 gap-2">
              <Link to="/hospital/upload">
                <Upload className="h-4 w-4" />
                Upload Report
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {hospitalPatients.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold sm:text-lg">{p.name}</h3>
                    <Badge
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        statusColor[p.latestStatus],
                      )}
                    >
                      {p.latestStatus}
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="h-4 w-4" />
                      {p.phone}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {p.address}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Last report: {new Date(p.lastReportDate).toLocaleDateString()}
                  </p>
                </div>
                <Button asChild variant="outline" className="h-11">
                  <Link to="/hospital/upload" search={{ patientId: p.id }}>
                    Upload report
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              Active alerts
              <Badge className="bg-emergency text-emergency-foreground">
                {emergencyAlerts.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {emergencyAlerts.length === 0 && (
              <p className="text-sm text-muted-foreground">No active alerts.</p>
            )}
            {emergencyAlerts.map((a) => (
              <div key={a.id} className="rounded-lg border border-emergency/30 bg-emergency/5 p-3">
                <p className="text-sm font-semibold">{a.patientName}</p>
                <p className="text-xs text-muted-foreground">{a.reportType}</p>
                <p className="mt-1 text-xs">Triggered {new Date(a.triggeredAt).toLocaleString()}</p>
              </div>
            ))}
            <Button asChild variant="outline" className="h-11 w-full">
              <Link to="/hospital/alerts">View all alerts</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
