"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ForecastDay } from "@/lib/types";
import WeatherIcon from "./WeatherIcon";

interface ForecastTabsProps {
  forecast: ForecastDay[];
}

type Tab = "daily" | "details";

export default function ForecastTabs({ forecast }: ForecastTabsProps) {
  const [tab, setTab] = useState<Tab>("daily");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  if (!forecast || forecast.length === 0) return null;

  return (
    <div className="space-y-4 text-white">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/48">Outlook</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight">5-day forecast</h3>
        </div>
        <div className="control-surface flex gap-1 rounded-2xl p-1">
        {[
          { key: "daily" as Tab, label: "5-Day" },
          { key: "details" as Tab, label: "Details" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              tab === t.key
                ? "bg-white/22 text-white shadow-sm"
                : "text-white/52 hover:bg-white/10 hover:text-white/82"
            }`}
          >
            {t.label}
          </button>
        ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === "daily" ? (
          <motion.div
            key="daily"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid gap-2"
          >
            {forecast.map((day) => (
              <motion.button
                key={day.date}
                onClick={() => setExpandedDay(expandedDay === day.date ? null : day.date)}
                className="glass-inner flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-white/12"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <span className="w-11 text-sm font-semibold">{day.dayName}</span>
                <WeatherIcon conditionCode={day.conditionCode} size="sm" className="text-white" />
                <span className="flex-1 truncate text-xs capitalize text-white/62">{day.description}</span>
                <div className="flex gap-2 text-sm tabular-nums">
                  <span className="font-semibold">{day.tempMax}°</span>
                  <span className="text-white/40">{day.tempMin}°</span>
                </div>
                {expandedDay === day.date && (
                  <svg className="h-4 w-4 rotate-180 text-white/40 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="scrollbar-soft overflow-x-auto"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-white/40">
                  <th className="text-left py-2 pr-4 font-medium">Day</th>
                  <th className="text-right px-2 py-2 font-medium">High</th>
                  <th className="text-right px-2 py-2 font-medium">Low</th>
                  <th className="text-right px-2 py-2 font-medium">Humidity</th>
                  <th className="text-right px-2 py-2 font-medium">Wind</th>
                  <th className="text-right pl-2 py-2 font-medium">Pressure</th>
                </tr>
              </thead>
              <tbody>
                {forecast.map((day) => (
                  <tr key={day.date} className="border-b border-white/6 transition-colors hover:bg-white/8">
                    <td className="py-2.5 pr-4 font-medium">{day.dayName}</td>
                    <td className="py-2.5 px-2 text-right font-semibold">{day.tempMax}°</td>
                    <td className="py-2.5 px-2 text-right text-white/50">{day.tempMin}°</td>
                    <td className="py-2.5 px-2 text-right text-white/70">{formatMetric(day.humidity, "%")}</td>
                    <td className="py-2.5 px-2 text-right text-white/70">{formatMetric(day.windSpeed, " mph")}</td>
                    <td className="py-2.5 pl-2 text-right text-white/70">{formatMetric(day.pressure, " hPa")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatMetric(value: number | undefined, unit: string) {
  return value == null ? "-" : `${value}${unit}`;
}
