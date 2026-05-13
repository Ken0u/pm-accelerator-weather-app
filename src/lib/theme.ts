import type { WeatherCondition, WeatherTheme, ThemeColors, CurrentWeatherData } from "./types";

export function getWeatherCondition(code: number, isNight: boolean): WeatherCondition {
  if (isNight && code === 800) return "clear-night";
  if (code === 800) return "clear-day";
  if (code >= 801 && code <= 804) return "cloudy";
  if (code >= 300 && code < 600) return "rainy";
  if (code >= 500 && code < 600) return "rainy";
  if (code >= 600 && code < 700) return "snowy";
  if (code >= 200 && code < 300) return "thunderstorm";
  if (code >= 700 && code < 800) return "foggy";
  return "cloudy";
}

export function isNightTime(dt: number, sunrise: number, sunset: number): boolean {
  return dt < sunrise || dt > sunset;
}

export function getParticlesType(condition: WeatherCondition): string {
  switch (condition) {
    case "clear-day": return "sun";
    case "clear-night": return "stars";
    case "cloudy": return "clouds";
    case "rainy": return "rain";
    case "snowy": return "snow";
    case "thunderstorm": return "lightning";
    case "foggy": return "fog";
  }
}

function getThemeColors(condition: WeatherCondition): ThemeColors {
  const isDark =
    condition === "clear-night" ||
    condition === "thunderstorm" ||
    condition === "rainy" ||
    condition === "snowy";

  if (isDark) {
    return {
      card: "bg-white/10 backdrop-blur-md",
      cardBorder: "border-white/15",
      text: "text-gray-50",
      textSecondary: "text-gray-300/80",
      heading: "text-white",
      accent: "text-blue-300",
      accentHover: "bg-white/15",
      icon: "text-white/90",
      inputBg: "bg-white/15 backdrop-blur-md",
      inputBorder: "border-white/20",
      tabActive: "bg-white/25 text-white",
      tabInactive: "text-white/70 hover:bg-white/10",
    };
  }

  return {
    card: "bg-white/70 backdrop-blur-md",
    cardBorder: "border-white/60",
    text: "text-gray-800",
    textSecondary: "text-gray-600",
    heading: "text-gray-900",
    accent: "text-blue-600",
    accentHover: "bg-gray-900/10",
    icon: "text-gray-900/80",
    inputBg: "bg-white/60 backdrop-blur-md",
    inputBorder: "border-white/50",
    tabActive: "bg-gray-900/90 text-white",
    tabInactive: "text-gray-700/80 hover:bg-white/40",
  };
}

const weatherGradients: Record<WeatherCondition, string> = {
  "clear-day": "from-blue-500 via-blue-400 to-sky-300",
  "clear-night": "from-gray-900 via-indigo-950 to-blue-950",
  cloudy: "from-gray-400 via-gray-300 to-slate-200",
  rainy: "from-blue-800 via-blue-600 to-slate-500",
  snowy: "from-slate-100 via-blue-50 to-white",
  thunderstorm: "from-gray-800 via-purple-900 to-slate-800",
  foggy: "from-gray-300 via-gray-200 to-slate-100",
};

export function getWeatherTheme(
  weather: CurrentWeatherData | null
): WeatherTheme {
  if (!weather) {
    return {
      condition: "clear-day",
      gradient: weatherGradients["clear-day"],
      colors: getThemeColors("clear-day"),
      particles: "none",
    };
  }

  const night = isNightTime(weather.dt, weather.sunrise, weather.sunset);
  const condition = getWeatherCondition(weather.conditionCode, night);

  return {
    condition,
    gradient: weatherGradients[condition],
    colors: getThemeColors(condition),
    particles: getParticlesType(condition),
  };
}

export { weatherGradients };
