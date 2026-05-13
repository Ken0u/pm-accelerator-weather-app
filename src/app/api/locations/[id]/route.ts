import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const location = await prisma.location.findUnique({
      where: { id: parseInt(id) },
      include: {
        weathers: { orderBy: { date: "desc" } },
      },
    });
    if (!location) {
      return Response.json({ error: "Location not found" }, { status: 404 });
    }
    return Response.json(location);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch location";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { temperature, feelsLike, humidity, pressure, description, windSpeed } = body;

    const existing = await prisma.weatherRecord.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existing) {
      return Response.json({ error: "Record not found" }, { status: 404 });
    }

    const updated = await prisma.weatherRecord.update({
      where: { id: parseInt(id) },
      data: {
        ...(temperature !== undefined && { temperature: parseFloat(temperature) }),
        ...(feelsLike !== undefined && { feelsLike: parseFloat(feelsLike) }),
        ...(humidity !== undefined && { humidity: parseInt(humidity) }),
        ...(pressure !== undefined && { pressure: parseInt(pressure) }),
        ...(description !== undefined && { description }),
        ...(windSpeed !== undefined && { windSpeed: parseFloat(windSpeed) }),
      },
    });
    return Response.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update record";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const recordId = parseInt(id);
    const existing = await prisma.weatherRecord.findUnique({ where: { id: recordId } });
    if (!existing) {
      const location = await prisma.location.findUnique({ where: { id: recordId } });
      if (location) {
        await prisma.location.delete({ where: { id: recordId } });
        return Response.json({ message: "Location deleted" });
      }
      return Response.json({ error: "Record not found" }, { status: 404 });
    }

    await prisma.weatherRecord.delete({ where: { id: recordId } });
    return Response.json({ message: "Record deleted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete record";
    return Response.json({ error: message }, { status: 500 });
  }
}
