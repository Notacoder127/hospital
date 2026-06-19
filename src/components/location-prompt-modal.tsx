import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LocationPromptModalProps {
  onLocationSet: (locationData: {
    type: "gps" | "manual";
    coords?: { lat: number; lng: number };
    address?: string;
  }) => void;
}

export function LocationPromptModal({ onLocationSet }: LocationPromptModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isSet = sessionStorage.getItem("mediremind_location_set") === "true";
      if (!isSet) {
        setIsOpen(true);
      }
    }
  }, []);

  const handleDetectGPS = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        sessionStorage.setItem("mediremind_location_set", "true");
        sessionStorage.setItem("mediremind_location_type", "gps");
        sessionStorage.setItem("mediremind_gps_coords", JSON.stringify(coords));
        
        toast.success("GPS Location detected successfully!");
        setDetecting(false);
        setIsOpen(false);
        onLocationSet({ type: "gps", coords });
      },
      (err) => {
        console.error("GPS detection error:", err);
        toast.error(`GPS Location access failed: ${err.message}. Please enter your location manually.`);
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.error("Please enter a valid address or city.");
      return;
    }
    setSubmitting(true);
    try {
      // Resolve the address to coordinates using Nominatim OpenStreetMap API
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        address.trim()
      )}&format=json&limit=1`;
      
      const res = await fetch(url, {
        headers: {
          "User-Agent": "MediRemindApp/1.0 (shehbaaz@mediremind.app)",
        },
      });
      
      if (!res.ok) {
        throw new Error("Geocoding service unavailable.");
      }
      
      const data = await res.json();
      
      if (data && data[0]) {
        const coords = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
        sessionStorage.setItem("mediremind_location_set", "true");
        sessionStorage.setItem("mediremind_location_type", "manual");
        sessionStorage.setItem("mediremind_manual_address", address.trim());
        sessionStorage.setItem("mediremind_gps_coords", JSON.stringify(coords));
        
        toast.success(`Location set to "${address.trim()}"!`);
        setIsOpen(false);
        onLocationSet({ type: "manual", coords, address: address.trim() });
      } else {
        toast.error("Could not find coordinates for this address. Please try another address or city name.");
      }
    } catch (err) {
      console.error("Manual address geocoding error:", err);
      // Fallback: save address string anyway and use a default coordinate (San Francisco downtown)
      const fallbackCoords = { lat: 37.7749, lng: -122.4194 };
      sessionStorage.setItem("mediremind_location_set", "true");
      sessionStorage.setItem("mediremind_location_type", "manual");
      sessionStorage.setItem("mediremind_manual_address", address.trim());
      sessionStorage.setItem("mediremind_gps_coords", JSON.stringify(fallbackCoords));
      
      toast.success(`Location saved: "${address.trim()}" (Using default coordinates)`);
      setIsOpen(false);
      onLocationSet({ type: "manual", coords: fallbackCoords, address: address.trim() });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[420px] p-6 border-border/80 shadow-2xl rounded-2xl">
        <DialogHeader className="space-y-2 text-center sm:text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary mb-2">
            <MapPin className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">Set Your Location</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            To find the nearest hospitals within a 5km radius during an emergency, please set your current location.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Button
            type="button"
            className="w-full h-12 gap-2 text-base font-semibold transition-all shadow-[var(--shadow-soft)] hover:scale-[1.01]"
            onClick={handleDetectGPS}
            disabled={detecting || submitting}
          >
            {detecting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Detecting GPS...
              </>
            ) : (
              <>
                <Navigation className="h-5 w-5" /> Use Current GPS Location
              </>
            )}
          </Button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-xs text-muted-foreground uppercase font-semibold">Or enter manually</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Input
                id="manual-address"
                placeholder="e.g. Mission Bay, San Francisco"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={detecting || submitting}
                className="h-11 text-sm border-border/80"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              className="w-full h-11 text-sm font-semibold border-border hover:bg-muted/50"
              disabled={detecting || submitting}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Address
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
