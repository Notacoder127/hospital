import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AppHeader } from "@/components/app-header";
import { toast } from "sonner";

export const Route = createFileRoute("/appointments/new")({
  head: () => ({
    meta: [{ title: "New appointment — MediRemind" }],
  }),
  component: NewAppointment,
});

const defaultDocs = [
  "Insurance card",
  "Photo ID",
  "Medication list",
  "Previous test results",
  "Referral letter",
];

function NewAppointment() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<string[]>(["Insurance card"]);

  const toggle = (d: string) =>
    setDocs((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" className="mb-4 h-10 gap-2">
          <Link to="/appointments">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="mb-6 text-3xl font-semibold sm:text-4xl">New appointment</h1>

        <Card className="border-border/70 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Appointment saved", {
                  description: "We'll send SMS & call reminders before the visit.",
                });
                navigate({ to: "/appointments" });
              }}
            >
              <Field label="Title" id="title">
                <Input id="title" required placeholder="e.g. Cardiology check-up" className="h-12" />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Date" id="date">
                  <Input id="date" type="date" required className="h-12" />
                </Field>
                <Field label="Time" id="time">
                  <Input id="time" type="time" required className="h-12" />
                </Field>
              </div>
              <Field label="Location" id="location">
                <Input id="location" required placeholder="Clinic name & address" className="h-12" />
              </Field>
              <Field label="Type" id="type">
                <Input id="type" placeholder="Check-up, Specialist, Lab…" className="h-12" />
              </Field>

              <div>
                <p className="mb-2 text-sm font-medium">Documents to bring</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {defaultDocs.map((d) => (
                    <label
                      key={d}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 bg-card p-3 hover:bg-muted/40"
                    >
                      <Checkbox checked={docs.includes(d)} onCheckedChange={() => toggle(d)} />
                      <span>{d}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" size="lg" className="h-12 flex-1">
                  Save appointment
                </Button>
                <Button asChild type="button" size="lg" variant="outline" className="h-12">
                  <Link to="/appointments">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      {children}
    </div>
  );
}
