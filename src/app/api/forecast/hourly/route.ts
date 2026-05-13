import { NextRequest } from "next/server";
import { geocodeLocation, fetchThreeHourForecast } from "@/lib/weather";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q");
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!q && (!lat || !lon)) {
      return Response.json(
        { error: "Provide a location query (?q=...) or coordinates (?lat=...&lon=...)" },
        { status: 400 }
      );
    }

    let latitude: number;
    let longitude: number;

    if (lat && lon) {
      latitude = parseFloat(lat);
      longitude = parseFloat(lon);
    } else {
      const geo = await geocodeLocation(q!);
      latitude = geo.lat;
      longitude = geo.lon;
    }

    const hourly = await fetchThreeHourForecast(latitude, longitude);
    return Response.json(hourly);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch hourly forecast";
    return Response.json({ error: message }, { status: 500 });
  }
}
