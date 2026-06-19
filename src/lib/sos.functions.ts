import { createServerFn } from "@tanstack/react-start";

export interface NearbyHospital {
  placeId: string;
  name: string;
  lat: number;
  lng: number;
  vicinity?: string;
  phone?: string;
  rating?: number;
}

export const findNearbyHospitals = createServerFn({ method: "POST" })
  .inputValidator((data: { lat: number; lng: number }) => data)
  .handler(async ({ data }): Promise<{ hospitals: NearbyHospital[] }> => {
    const key = process.env.GOOGLE_MAPS_API_KEY;

    if (key) {
      try {
        const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
        url.searchParams.set("location", `${data.lat},${data.lng}`);
        url.searchParams.set("radius", "5000"); // 5km range
        url.searchParams.set("keyword", "hospital|diagnostic|clinic|laboratory");
        url.searchParams.set("key", key);

        const res = await fetch(url.toString());
        const json = (await res.json()) as any;

        if (json.status === "OK" || json.status === "ZERO_RESULTS") {
          const base = (json.results ?? []).slice(0, 8);
          const hospitals = await Promise.all(
            base.map(async (r: any) => {
              let phone: string | undefined;
              try {
                const d = new URL("https://maps.googleapis.com/maps/api/place/details/json");
                d.searchParams.set("place_id", r.place_id);
                d.searchParams.set("fields", "international_phone_number,formatted_phone_number");
                d.searchParams.set("key", key);
                const dr = await fetch(d.toString());
                const dj = (await dr.json()) as any;
                phone = dj.result?.international_phone_number ?? dj.result?.formatted_phone_number;
              } catch {}
              return {
                placeId: r.place_id,
                name: r.name,
                lat: r.geometry.location.lat,
                lng: r.geometry.location.lng,
                vicinity: r.vicinity,
                rating: r.rating,
                phone,
              };
            }),
          );
          return { hospitals };
        } else {
          console.warn(`Google Places API returned status: ${json.status}. Falling back to OpenStreetMap.`);
        }
      } catch (err) {
        console.error("Google Places API error, falling back to OpenStreetMap:", err);
      }
    }

    // Fallback: OpenStreetMap Overpass QL Query
    try {
      const overpassQuery = `
        [out:json];
        (
          node["amenity"="hospital"](around:5000, ${data.lat}, ${data.lng});
          node["amenity"="clinic"](around:5000, ${data.lat}, ${data.lng});
          way["amenity"="hospital"](around:5000, ${data.lat}, ${data.lng});
          way["amenity"="clinic"](around:5000, ${data.lat}, ${data.lng});
        );
        out center 15;
      `;

      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "MediRemindApp/1.0 (shehbaaz@mediremind.app)",
        },
        body: new URLSearchParams({ data: overpassQuery }).toString(),
      });

      if (!res.ok) {
        throw new Error(`OSM Overpass API error: ${res.status}`);
      }

      const json = (await res.json()) as any;
      const elements = json.elements ?? [];

      const hospitals = elements.slice(0, 8).map((el: any) => {
        const tags = el.tags ?? {};
        const name = tags.name || (tags.amenity === "clinic" ? "Specialist Clinic" : "Specialist Hospital");
        const latVal = el.lat ?? el.center?.lat ?? data.lat;
        const lngVal = el.lon ?? el.center?.lon ?? data.lng;
        const phone = tags.phone ?? tags["contact:phone"] ?? undefined;
        const street = tags["addr:street"] ?? "";
        const suburb = tags["addr:suburb"] ?? "";
        const city = tags["addr:city"] ?? "";
        const vicinity = [street, suburb, city].filter(Boolean).join(", ") || tags["addr:full"] || "Nearby Area";

        return {
          placeId: String(el.id),
          name,
          lat: latVal,
          lng: lngVal,
          vicinity,
          rating: tags.rating ? parseFloat(tags.rating) : undefined,
          phone,
        };
      });

      return { hospitals };
    } catch (e: any) {
      console.error("All place finders failed:", e);
      throw new Error(`Failed to find hospitals: ${e.message}`);
    }
  });

export const sendSosSms = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      patientName: string;
      contactPhone: string;
      lat: number;
      lng: number;
    }) => data,
  )
  .handler(async ({ data }) => {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_NUMBER;
    if (!sid || !token || !from) {
      throw new Error("Twilio credentials not configured");
    }
    const mapsLink = `https://maps.google.com/?q=${data.lat},${data.lng}`;
    const body = `${data.patientName} has triggered an emergency alert. Current location: ${mapsLink}. Please help them reach the nearest hospital immediately.`;

    const params = new URLSearchParams({
      To: data.contactPhone,
      From: from,
      Body: body,
    });
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      },
    );
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Twilio: ${res.status} ${txt}`);
    }
    return { ok: true as const };
  });
