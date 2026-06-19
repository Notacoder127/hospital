import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppHeader } from "@/components/app-header";
import { useAuth } from "@/lib/auth-store";
import { profileQueryKey, useProfile } from "@/lib/profile-store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "Profile — MediRemind" }],
  }),
  component: ProfilePage,
});

interface FormState {
  full_name: string;
  phone: string;
  address: string;
  blood_group: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
}

const empty: FormState = {
  full_name: "",
  phone: "",
  address: "",
  blood_group: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  emergency_contact_relationship: "",
};

const countries = [
  { code: "+1", name: "United States / Canada", flag: "🇺🇸" },
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "+971", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "+33", name: "France", flag: "🇫🇷" },
  { code: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "+86", name: "China", flag: "🇨🇳" },
  { code: "+55", name: "Brazil", flag: "🇧🇷" },
  { code: "+27", name: "South Africa", flag: "🇿🇦" },
  { code: "+52", name: "Mexico", flag: "🇲🇽" },
  { code: "+7", name: "Russia", flag: "🇷🇺" },
  { code: "+39", name: "Italy", flag: "🇮🇹" },
  { code: "+34", name: "Spain", flag: "🇪🇸" },
  { code: "+82", name: "South Korea", flag: "🇰🇷" },
  { code: "+92", name: "Pakistan", flag: "🇵🇰" },
  { code: "+880", name: "Bangladesh", flag: "🇧🇩" },
  { code: "+60", name: "Malaysia", flag: "🇲🇾" },
  { code: "+62", name: "Indonesia", flag: "🇮🇩" },
  { code: "+63", name: "Philippines", flag: "🇵🇭" },
  { code: "+64", name: "New Zealand", flag: "🇳🇿" },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+90", name: "Turkey", flag: "🇹🇷" },
  { code: "+20", name: "Egypt", flag: "🇪🇬" },
  { code: "+234", name: "Nigeria", flag: "🇳🇬" },
  { code: "+54", name: "Argentina", flag: "🇦🇷" },
];

const parsePhone = (fullPhone: string) => {
  if (!fullPhone) return { code: "+91", number: "" };
  // Sort country codes by length of code descending to match longest first (+971 before +9)
  const sortedCountries = [...countries].sort((a, b) => b.code.length - a.code.length);
  for (const c of sortedCountries) {
    if (fullPhone.startsWith(c.code)) {
      return { code: c.code, number: fullPhone.slice(c.code.length).trim() };
    }
  }
  if (fullPhone.startsWith("+")) {
    const match = fullPhone.match(/^\+(\d{1,4})/);
    if (match) {
      const code = "+" + match[1];
      return { code, number: fullPhone.slice(code.length).trim() };
    }
  }
  return { code: "+91", number: fullPhone };
};

function ProfilePage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useProfile(auth.user?.id);

  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [phoneCode, setPhoneCode] = useState("+91");
  const [ecPhoneCode, setEcPhoneCode] = useState("+91");

  useEffect(() => {
    if (!auth.loading && !auth.user) navigate({ to: "/auth" });
  }, [auth, navigate]);

  // Pre-fill once profile loads
  useEffect(() => {
    if (!profile) return;
    const parsedPhone = parsePhone(profile.phone ?? "");
    const parsedEcPhone = parsePhone(profile.emergency_contact_phone ?? "");

    setForm({
      full_name: profile.full_name ?? "",
      phone: parsedPhone.number,
      address: profile.address ?? "",
      blood_group: profile.blood_group ?? "",
      emergency_contact_name: profile.emergency_contact_name ?? "",
      emergency_contact_phone: parsedEcPhone.number,
      emergency_contact_relationship: profile.emergency_contact_relationship ?? "",
    });
    setPhoneCode(parsedPhone.code);
    setEcPhoneCode(parsedEcPhone.code);
  }, [profile]);

  const update =
    <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) return;
    setSaving(true);

    const finalPhone = form.phone ? `${phoneCode}${form.phone.trim()}` : "";
    const finalEcPhone = form.emergency_contact_phone
      ? `${ecPhoneCode}${form.emergency_contact_phone.trim()}`
      : "";

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        phone: finalPhone,
        address: form.address,
        blood_group: form.blood_group,
        emergency_contact_name: form.emergency_contact_name,
        emergency_contact_phone: finalEcPhone,
        emergency_contact_relationship: form.emergency_contact_relationship,
      })
      .eq("id", auth.user.id);
    setSaving(false);
    if (error) {
      toast.error("Could not save profile", { description: error.message });
      return;
    }
    await queryClient.invalidateQueries({ queryKey: profileQueryKey(auth.user.id) });
    toast.success("Profile updated");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" className="mb-4 h-10 gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="mb-6 text-3xl font-semibold sm:text-4xl">Patient profile</h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-border/70 shadow-[var(--shadow-soft)]">
              <CardHeader>
                <CardTitle className="text-lg">Personal details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <Field label="Full name" id="name">
                  <Input
                    id="name"
                    value={form.full_name}
                    onChange={update("full_name")}
                    className="h-12"
                  />
                </Field>
                <Field label="Phone number" id="phone">
                  <div className="flex gap-2">
                    <Select value={phoneCode} onValueChange={setPhoneCode}>
                      <SelectTrigger className="w-[110px] h-12">
                        <SelectValue placeholder="Code" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            <span className="mr-1.5">{c.flag}</span>
                            <span>{c.code}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={update("phone")}
                      className="h-12 flex-1"
                      placeholder="Phone number"
                    />
                  </div>
                </Field>
                <Field label="Address" id="address">
                  <Textarea
                    id="address"
                    value={form.address}
                    onChange={update("address")}
                    rows={3}
                  />
                </Field>
                <Field label="Blood group" id="blood">
                  <Input
                    id="blood"
                    value={form.blood_group}
                    onChange={update("blood_group")}
                    placeholder="e.g. O+"
                    className="h-12"
                  />
                </Field>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-[var(--shadow-soft)]">
              <CardHeader>
                <CardTitle className="text-lg">Emergency contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <Field label="Contact name" id="ec-name">
                  <Input
                    id="ec-name"
                    value={form.emergency_contact_name}
                    onChange={update("emergency_contact_name")}
                    className="h-12"
                  />
                </Field>
                <Field label="Contact phone" id="ec-phone">
                  <div className="flex gap-2">
                    <Select value={ecPhoneCode} onValueChange={setEcPhoneCode}>
                      <SelectTrigger className="w-[110px] h-12">
                        <SelectValue placeholder="Code" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            <span className="mr-1.5">{c.flag}</span>
                            <span>{c.code}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="ec-phone"
                      type="tel"
                      value={form.emergency_contact_phone}
                      onChange={update("emergency_contact_phone")}
                      className="h-12 flex-1"
                      placeholder="Phone number"
                    />
                  </div>
                </Field>
                <Field label="Relationship" id="ec-rel">
                  <Input
                    id="ec-rel"
                    value={form.emergency_contact_relationship}
                    onChange={update("emergency_contact_relationship")}
                    placeholder="e.g. Daughter"
                    className="h-12"
                  />
                </Field>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" size="lg" className="h-12 flex-1" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
              </Button>
              <Button asChild type="button" size="lg" variant="outline" className="h-12">
                <Link to="/">Cancel</Link>
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      {children}
    </div>
  );
}
