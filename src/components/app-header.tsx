import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, CalendarPlus, HeartPulse, LayoutDashboard, LogOut, Siren, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { patient } from "@/lib/mock-data";
import { signOut, setRoleOverride } from "@/lib/auth-store";


const nav = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Appointments", to: "/appointments", icon: CalendarPlus },
  { label: "Profile", to: "/profile", icon: User },
] as const;

export function AppHeader() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-[var(--gradient-header)] backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <HeartPulse className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">MediRemind</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="inline-flex h-11 items-center gap-2 rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-secondary-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <Button
            variant="outline"
            className="ml-2 h-11 border-dashed border-primary/50 text-primary hover:bg-primary/5"
            onClick={() => {
              setRoleOverride("hospital");
              navigate({ to: "/hospital" });
            }}
          >
            Dev: Switch to Hospital
          </Button>
          <EmergencyDialog
            trigger={
              <Button className="ml-2 h-11 gap-2 bg-emergency text-emergency-foreground hover:bg-emergency/90">
                <Siren className="h-4 w-4" />
                SOS
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11"
            aria-label="Sign out"
            onClick={async () => {
              await signOut();
              navigate({ to: "/auth" });
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Button
            size="icon"
            variant="outline"
            className="h-11 w-11 border-dashed border-primary/50 text-primary"
            onClick={() => {
              setRoleOverride("hospital");
              navigate({ to: "/hospital" });
            }}
            aria-label="Switch to Hospital"
          >
            <Building2 className="h-4 w-4" />
          </Button>
          {nav.slice(1).map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="grid h-11 w-11 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-secondary-foreground"
              aria-label={item.label}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          ))}
          <EmergencyDialog
            trigger={
              <Button size="icon" className="h-11 w-11 bg-emergency text-emergency-foreground hover:bg-emergency/90">
                <Siren className="h-5 w-5" />
                <span className="sr-only">Emergency SOS</span>
              </Button>
            }
          />
        </div>
      </div>
    </header>
  );
}

export function EmergencyDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-emergency">
            <Siren className="h-5 w-5" />
            Activate Emergency SOS?
          </AlertDialogTitle>
          <AlertDialogDescription>
            We'll share your current location with{" "}
            <span className="font-medium text-foreground">{patient.emergencyContact.name}</span>{" "}
            via SMS and show the nearest hospitals.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-11">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="h-11 bg-emergency text-emergency-foreground hover:bg-emergency/90"
            onClick={() => navigate({ to: "/sos" })}
          >
            Send SOS now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
