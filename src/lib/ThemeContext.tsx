"use client";

import { createContext, useContext, useState, useMemo, type ReactNode } from "react";
import type { CurrentWeatherData, WeatherTheme } from "./types";
import { getWeatherTheme } from "./theme";

interface ThemeContextValue {
  theme: WeatherTheme;
  weather: CurrentWeatherData | null;
  setWeather: (w: CurrentWeatherData | null) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [weather, setWeather] = useState<CurrentWeatherData | null>(null);

  const theme = useMemo(() => getWeatherTheme(weather), [weather]);

  const value = useMemo(() => ({ theme, weather, setWeather }), [theme, weather]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
