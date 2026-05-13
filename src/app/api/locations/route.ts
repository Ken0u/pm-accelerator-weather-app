import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { geocodeLocation, fetchHistoricWeather } from "@/lib/weather";

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      include: {
        weathers: {
          orderBy: { date: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return Response.json(locations);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch locations";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, startDate, endDate } = body;

    if (!query || !startDate || !endDate) {
      return Response.json(
        { error: "Missing required fields: query, startDate, endDate" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return Response.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
    }
    if (start > end) {
      return Response.json({ error: "Start date must be before end date." }, { status: 400 });
    }

    const geo = await geocodeLocation(query);

    let location = await prisma.location.findFirst({
      where: { query: query.toLowerCase().trim() },
    });

    if (!location) {
      location = await prisma.location.create({
        data: {
          name: geo.name,
          query: query.toLowerCase().trim(),
          latitude: geo.lat,
          longitude: geo.lon,
        },
      });
    }

    const weatherData = await fetchHistoricWeather(geo.lat, geo.lon, startDate, endDate);

    const records = [];
    for (const day of weatherData) {
      const record = await prisma.weatherRecord.create({
        data: {
          locationId: location.id,
          date: new Date(day.date + "T12:00:00Z"),
          temperature: day.temperature,
          feelsLike: day.feelsLike,
          humidity: day.humidity,
          pressure: 0,
          description: day.description,
          icon: day.icon,
          windSpeed: day.windSpeed,
        },
      });
      records.push(record);
    }

    return Response.json({ location, records }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save weather data";
    return Response.json({ error: message }, { status: 500 });
  }
}
