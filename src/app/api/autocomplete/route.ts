import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 2) {
    return Response.json([]);
  }

  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
  if (!apiKey || apiKey === "YOUR_OPENWEATHERMAP_API_KEY") {
    return Response.json([]);
  }

  try {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q.trim())}&limit=5&appid=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return Response.json([]);

    const data = await res.json();
    const suggestions = data.map((item: { name: string; state?: string; country: string; lat: number; lon: number }) => ({
      label: item.state ? `${item.name}, ${item.state}, ${item.country}` : `${item.name}, ${item.country}`,
      value: item.name,
      lat: item.lat,
      lon: item.lon,
    }));

    return Response.json(suggestions);
  } catch {
    return Response.json([]);
  }
}
