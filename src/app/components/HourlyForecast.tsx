"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, CartesianGrid,
} from "recharts";
import WeatherIcon from "./WeatherIcon";

interface HourlyPoint {
  time: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  conditionCode: number;
}

interface HourlyForecastProps {
  lat: number;
  lon: number;
}

export default function HourlyForecast({ lat, lon }: HourlyForecastProps) {
  const [data, setData] = useState<HourlyPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<"temp" | "humidity" | "wind">("temp");

  useEffect(() => {
    if (!lat || !lon) return;
    let cancelled = false;

    const loadHourlyForecast = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/forecast/hourly?lat=${lat}&lon=${lon}`);
        const raw = await response.json();
        if (!cancelled) setData(Array.isArray(raw) ? raw : []);
      } catch {
        if (!cancelled) setData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadHourlyForecast();
    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  const chartData = useMemo(() => {
    if (selectedMetric === "temp") return data.map((d) => ({ time: d.time, value: d.temp, feelsLike: d.feelsLike }));
    if (selectedMetric === "humidity") return data.map((d) => ({ time: d.time, value: d.humidity }));
    return data.map((d) => ({ time: d.time, value: d.windSpeed }));
  }, [data, selectedMetric]);

  if (loading) {
    return (
      <div className="h-72 animate-pulse rounded-3xl bg-white/8" />
    );
  }

  if (data.length === 0) return null;

  const metrics = [
    { key: "temp" as const, label: "Temp" },
    { key: "humidity" as const, label: "Humidity" },
    { key: "wind" as const, label: "Wind" },
  ];

  return (
    <div className="space-y-5 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/48">Trendline</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight">Next 24 hours</h3>
        </div>
        <div className="control-surface flex gap-1 rounded-2xl p-1">
          {metrics.map((m) => (
            <button
              key={m.key}
              onClick={() => setSelectedMetric(m.key)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                selectedMetric === m.key
                  ? "bg-white/22 text-white"
                  : "text-white/52 hover:bg-white/10 hover:text-white/82"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-64 min-h-64 min-w-0 rounded-3xl border border-white/10 bg-slate-950/16 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="time"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(8, 17, 31, 0.92)",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: "16px",
                color: "#fff",
                fontSize: "12px",
                backdropFilter: "blur(16px)",
              }}
              labelStyle={{ color: "rgba(255,255,255,0.6)" }}
            />
            <defs>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.36} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" fill="url(#tempGrad)" strokeOpacity={0} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#22d3ee"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#22d3ee", stroke: "#fff", strokeWidth: 2 }}
            />
            {selectedMetric === "temp" && (
              <Line
                type="monotone"
                dataKey="feelsLike"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                activeDot={{ r: 3, fill: "#f59e0b", stroke: "#fff", strokeWidth: 1 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="scrollbar-soft flex gap-2 overflow-x-auto pb-1">
        {data.filter((_, i) => i % 4 === 0).map((point, i) => (
          <div
            key={i}
            className="glass-inner flex min-w-[74px] shrink-0 flex-col items-center gap-1 rounded-2xl p-3"
          >
            <span className="text-[10px] text-white/50">{point.time}</span>
            <WeatherIcon conditionCode={point.conditionCode} size="sm" className="text-white" />
            <span className="text-xs font-medium">{Math.round(point.temp)}°</span>
          </div>
        ))}
      </div>
    </div>
  );
}
