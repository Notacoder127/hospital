import { Link, useNavigate } from "@tanstack/react-router";
import { Building2, LogOut, Siren, Upload, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, setRoleOverride } from "@/lib/auth-store";

const nav = [
  { label: "Patients", to: "/hospital", icon: Users, exact: true },
  { label: "Upload Report", to: "/hospital/upload", icon: Upload, exact: false },
  { label: "Emergency Alerts", to: "/hospital/alerts", icon: Siren, exact: false },
] as const;

export function HospitalHeader() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-[var(--gradient-header)] backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/hospital" className="flex items-center gap-2">
          <img src="/logo.png" alt="Mediremm" className="h-9 w-9 rounded-xl object-contain bg-white p-1 border border-border/40 shadow-sm" />
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold tracking-tight">Mediremm</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Hospital Portal
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              className="inline-flex h-11 items-center gap-2 rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-secondary-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <Button
            variant="outline"
            className="ml-2 h-11 border-dashed border-primary/50 text-primary hover:bg-primary/5"
            onClick={async () => {
              await signOut();
              navigate({ to: "/auth", search: { role: "patient", mode: "signin" } });
            }}
          >
            Switch to Patient
          </Button>
          <Button
            variant="ghost"
            className="ml-2 h-11 gap-2"
            onClick={async () => {
              await signOut();
              navigate({ to: "/auth" });
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <Button
            size="icon"
            variant="outline"
            className="h-11 w-11 border-dashed border-primary/50 text-primary"
            onClick={async () => {
              await signOut();
              navigate({ to: "/auth", search: { role: "patient", mode: "signin" } });
            }}
            aria-label="Switch to Patient"
          >
            <User className="h-4 w-4" />
          </Button>
          {nav.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              aria-label={item.label}
              className="grid h-11 w-11 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-secondary-foreground"
            >
              <item.icon className="h-5 w-5" />
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
