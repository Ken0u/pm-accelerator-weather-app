"use client";

import type { ForecastDay } from "@/lib/types";
import WeatherIcon from "./WeatherIcon";

interface FiveDayForecastProps {
  forecast: ForecastDay[];
}

export default function FiveDayForecast({ forecast }: FiveDayForecastProps) {
  if (!forecast || forecast.length === 0) return null;

  return (
    <div className="w-full max-w-xl mx-auto mt-8 animate-fadeIn">
      <h3 className="text-lg font-semibold mb-4 opacity-90">5-Day Forecast</h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {forecast.map((day) => (
          <div
            key={day.date}
            className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all"
          >
            <span className="text-sm font-medium">{day.dayName}</span>
            <span className="text-xs opacity-60">{new Date(day.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            <WeatherIcon conditionCode={day.conditionCode} size="md" />
            <span className="text-xs capitalize opacity-70 text-center leading-tight">{day.description}</span>
            <div className="flex gap-2 text-sm mt-1">
              <span className="font-semibold">{day.tempMax}°</span>
              <span className="opacity-50">{day.tempMin}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
