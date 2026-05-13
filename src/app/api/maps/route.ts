import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q");
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY") {
      return Response.json({ error: "Google Maps API key not configured" }, { status: 501 });
    }

    if (lat && lon) {
      const embedUrl = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lon}&zoom=12`;
      return Response.json({ embedUrl, lat: parseFloat(lat), lon: parseFloat(lon) });
    }

    if (q) {
      const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&key=${apiKey}`;
      const geoRes = await fetch(geoUrl);
      if (!geoRes.ok) {
        return Response.json({ error: "Geocoding API error" }, { status: geoRes.status });
      }
      const geoData = await geoRes.json();
      if (geoData.results && geoData.results.length > 0) {
        const location = geoData.results[0].geometry.location;
        const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(q)}&zoom=12`;
        return Response.json({ embedUrl, lat: location.lat, lon: location.lng, address: geoData.results[0].formatted_address });
      }
      return Response.json({ error: "Location not found" }, { status: 404 });
    }

    return Response.json({ error: "Provide a query (?q=...) or coordinates (?lat=...&lon=...)" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch map data";
    return Response.json({ error: message }, { status: 500 });
  }
}
