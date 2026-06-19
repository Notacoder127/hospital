interface NearestHospitalMapProps {
  address: string;
  hospitalName?: string;
  height?: number;
}

/**
 * Embeds a Google Map showing driving directions from the patient's address
 * to the nearest hospital. Uses the Maps Embed API (no JS loader required).
 */
export function NearestHospitalMap({
  address,
  hospitalName,
  height = 320,
}: NearestHospitalMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  if (!apiKey) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        Google Maps API key not configured.
      </div>
    );
  }

  // If a specific hospital is named, route there; otherwise search hospitals near the address.
  const src = hospitalName
    ? `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${encodeURIComponent(
        address,
      )}&destination=${encodeURIComponent(hospitalName)}&mode=driving`
    : `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${encodeURIComponent(
        `hospital near ${address}`,
      )}`;

  return (
    <div className="overflow-hidden rounded-lg border border-border" style={{ height }}>
      <iframe
        title={`Map to ${hospitalName ?? "nearest hospital"}`}
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
