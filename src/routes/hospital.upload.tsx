import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { hospitalPatients, type ReportStatus } from "@/lib/hospital-data";

const searchSchema = z.object({ patientId: z.string().optional() });

export const Route = createFileRoute("/hospital/upload")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Upload Report — MediRemind" }] }),
  component: UploadReport,
});

function UploadReport() {
  const navigate = useNavigate();
  const { patientId } = Route.useSearch();
  const [pid, setPid] = useState(patientId ?? hospitalPatients[0].id);
  const [type, setType] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState<ReportStatus>("Normal");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const patient = hospitalPatients.find((p) => p.id === pid);
    if (!patient) return;
    if (status === "Critical") {
      toast.error(`CRITICAL — SMS + voice call sent to ${patient.name} and emergency contact.`);
      navigate({ to: "/hospital/alerts" });
    } else {
      toast.success(`Report uploaded for ${patient.name}.`);
      navigate({ to: "/hospital" });
    }
  }

  return (
    <>
      <section className="mb-8">
        <h1 className="text-3xl font-semibold sm:text-4xl">Upload diagnostic report</h1>
        <p className="mt-1 text-muted-foreground">
          Critical results automatically trigger SMS + voice alerts.
        </p>
      </section>

      <Card className="max-w-2xl border-border/70 shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Upload className="h-5 w-5" /> Report details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="patient">Patient</Label>
              <Select value={pid} onValueChange={setPid}>
                <SelectTrigger id="patient" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hospitalPatients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="type">Report type</Label>
                <Input
                  id="type"
                  required
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="e.g. Blood panel"
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="summary">Result summary</Label>
              <Textarea
                id="summary"
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief summary of findings…"
                rows={4}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ReportStatus)}>
                <SelectTrigger id="status" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Needs Follow-up">Needs Follow-up</SelectItem>
                  <SelectItem value="Critical">Critical — trigger emergency</SelectItem>
                </SelectContent>
              </Select>
              {status === "Critical" && (
                <p className="rounded-lg border border-emergency/30 bg-emergency/5 p-3 text-sm text-emergency">
                  Marking this report as Critical will immediately notify the patient,
                  their emergency contact, and open the emergency escalation panel.
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="h-11 flex-1">
                Upload report
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => navigate({ to: "/hospital" })}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
