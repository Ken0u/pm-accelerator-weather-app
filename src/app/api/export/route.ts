import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const format = request.nextUrl.searchParams.get("format") || "json";

    const locations = await prisma.location.findMany({
      include: {
        weathers: { orderBy: { date: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = locations.flatMap((loc) =>
      loc.weathers.map((w) => ({
        location: loc.name,
        query: loc.query,
        date: w.date.toISOString().split("T")[0],
        temperature: w.temperature,
        feelsLike: w.feelsLike,
        humidity: w.humidity,
        pressure: w.pressure,
        description: w.description,
        windSpeed: w.windSpeed,
      }))
    );

    switch (format) {
      case "csv": {
        const header = "location,query,date,temperature,feelsLike,humidity,pressure,description,windSpeed\n";
        const rows = data
          .map((r) =>
            [
              `"${r.location}"`,
              `"${r.query}"`,
              r.date,
              r.temperature,
              r.feelsLike,
              r.humidity,
              r.pressure,
              `"${r.description}"`,
              r.windSpeed,
            ].join(",")
          )
          .join("\n");
        return new Response(header + rows, {
          headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=weather-export.csv" },
        });
      }
      case "xml": {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<weatherData>\n';
        for (const r of data) {
          xml += "  <record>\n";
          xml += `    <location>${escapeXml(r.location)}</location>\n`;
          xml += `    <query>${escapeXml(r.query)}</query>\n`;
          xml += `    <date>${r.date}</date>\n`;
          xml += `    <temperature>${r.temperature}</temperature>\n`;
          xml += `    <feelsLike>${r.feelsLike}</feelsLike>\n`;
          xml += `    <humidity>${r.humidity}</humidity>\n`;
          xml += `    <pressure>${r.pressure}</pressure>\n`;
          xml += `    <description>${escapeXml(r.description)}</description>\n`;
          xml += `    <windSpeed>${r.windSpeed}</windSpeed>\n`;
          xml += "  </record>\n";
        }
        xml += "</weatherData>";
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Content-Disposition": "attachment; filename=weather-export.xml" },
        });
      }
      case "markdown": {
        let md = "# Weather Data Export\n\n";
        md += "| Location | Query | Date | Temp (°F) | Feels Like | Humidity | Pressure | Description | Wind Speed |\n";
        md += "|---------|-------|------|-----------|------------|----------|----------|-------------|------------|\n";
        for (const r of data) {
          md += `| ${r.location} | ${r.query} | ${r.date} | ${r.temperature} | ${r.feelsLike} | ${r.humidity} | ${r.pressure} | ${r.description} | ${r.windSpeed} |\n`;
        }
        return new Response(md, {
          headers: { "Content-Type": "text/markdown", "Content-Disposition": "attachment; filename=weather-export.md" },
        });
      }
      default: {
        return Response.json(data, {
          headers: { "Content-Disposition": "attachment; filename=weather-export.json" },
        });
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to export data";
    return Response.json({ error: message }, { status: 500 });
  }
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
