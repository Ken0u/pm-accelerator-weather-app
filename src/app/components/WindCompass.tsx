"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { CurrentWeatherData } from "@/lib/types";

interface WindCompassProps {
  weather: CurrentWeatherData;
}

export default function WindCompass({ weather }: WindCompassProps) {
  const deg = weather.windDeg || 0;
  const speed = weather.windSpeed;

  const direction = useMemo(() => {
    const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const index = Math.round(deg / 22.5) % 16;
    return dirs[index];
  }, [deg]);

  return (
    <div className="flex items-center gap-4 text-white">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/8">
        <svg className="h-14 w-14 text-white/26" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="0.5" />
          <text x="24" y="6" textAnchor="middle" fontSize="5" fill="currentColor" opacity="0.4">N</text>
          <text x="24" y="44" textAnchor="middle" fontSize="5" fill="currentColor" opacity="0.4">S</text>
          <text x="6" y="25" textAnchor="middle" fontSize="5" fill="currentColor" opacity="0.4">W</text>
          <text x="42" y="25" textAnchor="middle" fontSize="5" fill="currentColor" opacity="0.4">E</text>
        </svg>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: deg }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        >
          <svg className="h-6 w-6 text-cyan-100" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <polygon points="10,2 6,14 10,11 14,14" />
          </svg>
        </motion.div>
      </div>
      <div>
        <p className="text-2xl font-semibold">{speed} mph</p>
        <p className="mt-1 text-xs text-white/55">{direction} ({deg}°)</p>
      </div>
    </div>
  );
}
