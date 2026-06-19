import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, HeartPulse, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type Role } from "@/lib/auth-store";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — MediRemind" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [role, setRole] = useState<Role>("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect already-signed-in users to the right dashboard
  useEffect(() => {
    if (auth.loading || !auth.user) return;
    navigate({ to: auth.role === "hospital" ? "/hospital" : "/" });
  }, [auth, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const cleanEmail = email.trim().toLowerCase();

    // 1. General email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    // 2. Gmail specific validation
    if (cleanEmail.endsWith("@gmail.com")) {
      const username = cleanEmail.split("@")[0];
      if (username.length < 6 || username.length > 30) {
        toast.error("Gmail username must be between 6 and 30 characters.");
        return;
      }
      const gmailUsernameRegex = /^[a-z0-9.]+$/;
      if (!gmailUsernameRegex.test(username)) {
        toast.error("Gmail usernames can only contain letters (a-z), numbers (0-9), and periods (.).");
        return;
      }
      if (username.startsWith(".") || username.endsWith(".") || username.includes("..")) {
        toast.error("Gmail usernames cannot start/end with periods or contain consecutive periods.");
        return;
      }
    }

    // 3. Password validation
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: name || (role === "hospital" ? "Hospital Staff" : "Patient"),
              role,
            },
          },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Check your email to confirm your account, then sign in.");
          setMode("signin");
          return;
        }
        toast.success("Account created!");
        navigate({ to: role === "hospital" ? "/hospital" : "/" });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        // Fetch role to route
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user!.id)
          .maybeSingle();
        const userRole = (roleRow?.role as Role | undefined) ?? "patient";
        toast.success("Signed in");
        navigate({ to: userRole === "hospital" ? "/hospital" : "/" });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-[var(--gradient-header)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <Link to="/auth" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <HeartPulse className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">MediRemind</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12 sm:px-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-muted-foreground">Choose your role to continue.</p>
        </div>

        <Card className="border-border/70 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="text-base">I am a…</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <RoleCard
                active={role === "patient"}
                icon={<User className="h-5 w-5" />}
                title="Patient"
                desc="Manage appointments & reminders"
                onClick={() => setRole("patient")}
              />
              <RoleCard
                active={role === "hospital"}
                icon={<Building2 className="h-5 w-5" />}
                title="Hospital / Diagnostic"
                desc="Upload reports & alerts"
                onClick={() => setRole("hospital")}
              />
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">
                    {role === "hospital" ? "Staff / center name" : "Full name"}
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === "hospital" ? "Dr. Anjali Rao" : "Eleanor Whitaker"}
                    className="h-11"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11"
                />
              </div>
              <Button type="submit" disabled={submitting} className="h-11 w-full">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {mode === "signin" ? "New to MediRemind?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              >
                {mode === "signin" ? "Create one" : "Sign in"}
              </button>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function RoleCard({
  active,
  icon,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all",
        active
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40 hover:bg-muted/40",
      )}
    >
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-lg",
          active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
        )}
      >
        {icon}
      </span>
      <span className="text-sm font-semibold">{title}</span>
      <span className="text-xs text-muted-foreground">{desc}</span>
    </button>
  );
}
