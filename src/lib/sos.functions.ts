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
    if (!key) throw new Error("GOOGLE_MAPS_API_KEY is not configured");

    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.set("location", `${data.lat},${data.lng}`);
    url.searchParams.set("rankby", "distance");
    url.searchParams.set("type", "hospital");
    url.searchParams.set("key", key);

    const res = await fetch(url.toString());
    const json = (await res.json()) as {
      status: string;
      results?: Array<{
        place_id: string;
        name: string;
        vicinity?: string;
        rating?: number;
        geometry: { location: { lat: number; lng: number } };
      }>;
      error_message?: string;
    };
    if (json.status !== "OK" && json.status !== "ZERO_RESULTS") {
      throw new Error(`Places API: ${json.status} ${json.error_message ?? ""}`);
    }
    const base = (json.results ?? []).slice(0, 8);

    // Fetch phone for each (Details API)
    const hospitals = await Promise.all(
      base.map(async (r) => {
        let phone: string | undefined;
        try {
          const d = new URL("https://maps.googleapis.com/maps/api/place/details/json");
          d.searchParams.set("place_id", r.place_id);
          d.searchParams.set("fields", "international_phone_number,formatted_phone_number");
          d.searchParams.set("key", key);
          const dr = await fetch(d.toString());
          const dj = (await dr.json()) as {
            result?: { international_phone_number?: string; formatted_phone_number?: string };
          };
          phone = dj.result?.international_phone_number ?? dj.result?.formatted_phone_number;
        } catch {
          /* ignore */
        }
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
