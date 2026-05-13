"use client";

import { motion } from "framer-motion";
import type { CurrentWeatherData } from "@/lib/types";
import WeatherIcon from "./WeatherIcon";

interface CurrentWeatherProps {
  weather: CurrentWeatherData;
}

export default function CurrentWeather({ weather }: CurrentWeatherProps) {
  const now = new Date(weather.dt * 1000);
  const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const night = weather.dt < weather.sunrise || weather.dt > weather.sunset;
  const visibility = weather.visibility ? `${(weather.visibility / 1000).toFixed(1)} km` : "Live";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel rounded-[28px] p-5 sm:p-7 text-white"
    >
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70"
            >
              Current Conditions
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              {weather.location}{weather.state ? `, ${weather.state}` : ""}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-2 text-sm text-white/58"
            >
              {weather.country} / {dateStr} / {timeStr}
            </motion.p>
          </div>

          <div className="control-surface rounded-2xl px-3 py-2 text-right">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Visibility</p>
            <p className="mt-1 text-sm font-semibold">{visibility}</p>
          </div>
        </div>

        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="mt-8 grid items-center gap-6 md:grid-cols-[1fr_auto]"
        >
          <div>
            <div className="flex items-start">
              <span className="text-[7rem] font-semibold leading-none tracking-tight sm:text-[8.5rem]">
                {weather.temperature}
              </span>
              <span className="mt-5 text-3xl font-medium text-white/65">°F</span>
            </div>
            <p className="text-xl font-medium capitalize">{weather.description}</p>
            <p className="mt-1 text-sm text-white/55">Feels like {weather.feelsLike}°F</p>
          </div>

          <div className="relative mx-auto flex aspect-square w-44 items-center justify-center sm:w-52">
            <div className="orbital-ring absolute inset-0 rounded-full opacity-70 blur-[1px]" />
            <div className="absolute inset-3 rounded-full bg-slate-950/25 backdrop-blur-xl" />
            <div className="absolute inset-8 rounded-full border border-white/15" />
            <WeatherIcon conditionCode={weather.conditionCode} size="xl" isNight={night} className="relative z-10 text-white drop-shadow-2xl" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          <DetailCard label="Humidity" value={`${weather.humidity}%`} delay={0.4} />
          <DetailCard label="Wind" value={`${weather.windSpeed} mph`} delay={0.45} />
          <DetailCard label="Pressure" value={`${weather.pressure} hPa`} delay={0.5} />
          <DetailCard label="Clouds" value={`${weather.clouds ?? 0}%`} delay={0.55} />
        </motion.div>
      </div>
    </motion.div>
  );
}

function DetailCard({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="glass-inner flex min-h-24 flex-col justify-between rounded-2xl p-3"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">{label}</span>
      <span className="text-base font-semibold">{value}</span>
    </motion.div>
  );
}
