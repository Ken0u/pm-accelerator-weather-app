"use client";

import { useMemo } from "react";
import type { CurrentWeatherData } from "@/lib/types";

interface SunriseTimelineProps {
  weather: CurrentWeatherData;
}

export default function SunriseTimeline({ weather }: SunriseTimelineProps) {
  const { sunrise, sunset, dt } = weather;

  const times = useMemo(() => {
    const sunriseDate = new Date(sunrise * 1000);
    const sunsetDate = new Date(sunset * 1000);

    const format = (d: Date) =>
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    const total = sunset - sunrise;
    const elapsed = Math.min(Math.max(dt - sunrise, 0), total);
    const progress = total > 0 ? elapsed / total : 0;

    const isDay = dt >= sunrise && dt <= sunset;

    return {
      sunriseStr: format(sunriseDate),
      sunsetStr: format(sunsetDate),
      progress,
      isDay,
    };
  }, [sunrise, sunset, dt]);

  return (
    <div className="space-y-3 text-white">
      <div className="flex items-center justify-between text-xs text-white/58">
        <span>↑ {times.sunriseStr}</span>
        <span>↓ {times.sunsetStr}</span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-200 via-cyan-200 to-violet-300 transition-all duration-500"
          style={{ width: `${times.progress * 100}%` }}
        />
        {times.isDay && (
          <div
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-lg shadow-cyan-200/40 transition-all duration-500"
            style={{ left: `${times.progress * 100}%` }}
          />
        )}
      </div>
      <p className="text-center text-xs text-white/55">
        {times.isDay ? "Daylight" : "Nighttime"}
      </p>
    </div>
  );
}
