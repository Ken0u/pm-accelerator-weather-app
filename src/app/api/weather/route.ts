import { NextRequest } from "next/server";
import { geocodeLocation, fetchCurrentWeather } from "@/lib/weather";

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

    if (lat && lon) {
      const weather = await fetchCurrentWeather(parseFloat(lat), parseFloat(lon));
      return Response.json({ ...weather, location: weather.location || "Unknown" });
    }

    const geo = await geocodeLocation(q!);
    const weather = await fetchCurrentWeather(geo.lat, geo.lon);
    return Response.json({
      ...weather,
      location: geo.name,
      country: geo.country,
      state: geo.state,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch weather data";
    return Response.json({ error: message }, { status: 500 });
  }
}
