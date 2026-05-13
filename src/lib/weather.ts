const API_BASE = "https://api.openweathermap.org";
const GEO_BASE = "https://api.openweathermap.org/geo/1.0";

function getApiKey(): string {
  const key = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
  if (!key || key === "YOUR_OPENWEATHERMAP_API_KEY") {
    throw new Error("OpenWeatherMap API key is not configured. Set NEXT_PUBLIC_OPENWEATHERMAP_API_KEY in .env.local");
  }
  return key;
}

export interface GeocodingMatch {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export async function geocodeLocation(query: string): Promise<GeocodingMatch> {
  const apiKey = getApiKey();

  const directUrl = `${GEO_BASE}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`;
  const directRes = await fetch(directUrl);
  if (!directRes.ok) {
    throw new Error(`Geocoding API error: ${directRes.status}`);
  }
  const directData = await directRes.json();

  if (directData.length === 0) {
    const zipMatch = query.match(/^(\d{5}(?:-\d{4})?)$/);
    if (zipMatch) {
      const zipUrl = `${GEO_BASE}/zip?zip=${encodeURIComponent(query)},US&appid=${apiKey}`;
      const zipRes = await fetch(zipUrl);
      if (zipRes.ok) {
        const zipData = await zipRes.json();
        return {
          name: zipData.name || zipData.zip,
          lat: zipData.lat,
          lon: zipData.lon,
          country: zipData.country || "US",
        };
      }
    }
    throw new Error(`Location "${query}" not found. Try a different search term.`);
  }

  const best = directData[0];
  return {
    name: best.name,
    lat: best.lat,
    lon: best.lon,
    country: best.country,
    state: best.state,
  };
}

export interface CurrentWeatherRaw {
  location: string;
  country: string;
  state?: string;
  coordinates: { lat: number; lon: number };
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  description: string;
  icon: string;
  conditionCode: number;
  sunrise: number;
  sunset: number;
  dt: number;
}

export async function fetchCurrentWeather(lat: number, lon: number): Promise<CurrentWeatherRaw> {
  const apiKey = getApiKey();
  const url = `${API_BASE}/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather API error: ${res.status}`);
  }
  const data = await res.json();

  return {
    location: data.name,
    country: data.sys.country || "",
    coordinates: { lat, lon },
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    windSpeed: Math.round(data.wind.speed * 10) / 10,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    conditionCode: data.weather[0].id,
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    dt: data.dt,
  };
}

export interface ForecastDayRaw {
  date: string;
  dayName: string;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
  conditionCode: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
}

export async function fetchFiveDayForecast(lat: number, lon: number): Promise<ForecastDayRaw[]> {
  const apiKey = getApiKey();
  const url = `${API_BASE}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Forecast API error: ${res.status}`);
  }
  const data = await res.json();

  const dailyMap = new Map<string, {
    temps: number[];
    descriptions: string[];
    icons: string[];
    conditionCodes: number[];
    humidity: number[];
    windSpeed: number[];
    pressure: number[];
  }>();

  for (const item of data.list) {
    const date = new Date(item.dt * 1000);
    const dateKey = date.toISOString().split("T")[0];

    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, {
        temps: [],
        descriptions: [],
        icons: [],
        conditionCodes: [],
        humidity: [],
        windSpeed: [],
        pressure: [],
      });
    }
    const day = dailyMap.get(dateKey)!;
    day.temps.push(item.main.temp);
    day.descriptions.push(item.weather[0].description);
    day.icons.push(item.weather[0].icon);
    day.conditionCodes.push(item.weather[0].id);
    day.humidity.push(item.main.humidity);
    day.windSpeed.push(item.wind.speed);
    day.pressure.push(item.main.pressure);
  }

  const today = new Date().toISOString().split("T")[0];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const forecast: ForecastDayRaw[] = [];

  for (const [dateKey, dayData] of dailyMap) {
    if (dateKey === today) continue;
    if (forecast.length >= 5) break;

    const dateObj = new Date(dateKey + "T12:00:00");
    const modeDescription = dayData.descriptions.sort((a, b) =>
      dayData.descriptions.filter(v => v === a).length -
      dayData.descriptions.filter(v => v === b).length
    ).pop() || dayData.descriptions[0];

    const modeIcon = dayData.icons.sort((a, b) =>
      dayData.icons.filter(v => v === a).length -
      dayData.icons.filter(v => v === b).length
    ).pop() || dayData.icons[0];

    const modeConditionCode = dayData.conditionCodes.sort((a, b) =>
      dayData.conditionCodes.filter(v => v === a).length -
      dayData.conditionCodes.filter(v => v === b).length
    ).pop() || dayData.conditionCodes[0];

    forecast.push({
      date: dateKey,
      dayName: dayNames[dateObj.getDay()],
      tempMin: Math.round(Math.min(...dayData.temps)),
      tempMax: Math.round(Math.max(...dayData.temps)),
      description: modeDescription,
      icon: modeIcon,
      conditionCode: modeConditionCode,
      humidity: Math.round(average(dayData.humidity)),
      windSpeed: Math.round(average(dayData.windSpeed) * 10) / 10,
      pressure: Math.round(average(dayData.pressure)),
    });
  }

  return forecast;
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export interface ThreeHourPoint {
  dt: number;
  time: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  description: string;
  icon: string;
  conditionCode: number;
  pop: number;
}

export async function fetchThreeHourForecast(lat: number, lon: number): Promise<ThreeHourPoint[]> {
  const apiKey = getApiKey();
  const url = `${API_BASE}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Forecast API error: ${res.status}`);
  }
  const data = await res.json();

  const now = Math.floor(Date.now() / 1000);
  const next24 = now + 86400;

  return data.list
    .filter((item: { dt: number }) => item.dt >= now && item.dt < next24)
    .slice(0, 8)
    .map((item: { dt: number; dt_txt: string; main: { temp: number; feels_like: number; humidity: number }; weather: { id: number; description: string; icon: string }[]; wind: { speed: number; deg: number }; pop: number }) => ({
      dt: item.dt,
      time: new Date(item.dt_txt).toLocaleTimeString("en-US", { hour: "numeric" }),
      temp: Math.round(item.main.temp),
      feelsLike: Math.round(item.main.feels_like),
      humidity: item.main.humidity,
      windSpeed: Math.round(item.wind.speed * 10) / 10,
      windDeg: item.wind.deg,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      conditionCode: item.weather[0].id,
      pop: Math.round(item.pop * 100),
    }));
}

export async function fetchHistoricWeather(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string
): Promise<{ date: string; temperature: number; feelsLike: number; humidity: number; description: string; icon: string; windSpeed: number }[]> {
  const apiKey = getApiKey();
  const results: { date: string; temperature: number; feelsLike: number; humidity: number; description: string; icon: string; windSpeed: number }[] = [];

  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const dt = Math.floor(d.getTime() / 1000);
    const url = `${API_BASE}/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${dt}&units=imperial&appid=${apiKey}`;

    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          const point = data.data[0];
          results.push({
            date: dateStr,
            temperature: Math.round(point.temp),
            feelsLike: Math.round(point.feels_like),
            humidity: point.humidity,
            description: point.weather[0].description,
            icon: point.weather[0].icon,
            windSpeed: Math.round(point.wind_speed * 10) / 10,
          });
          continue;
        }
      }
    } catch {
    }

    const forecastUrl = `${API_BASE}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
    const forecastRes = await fetch(forecastUrl);
    if (forecastRes.ok) {
      const forecastData = await forecastRes.json();
      const dayStart = d.getTime() / 1000;
      const dayEnd = dayStart + 86400;
      const dayPoints = forecastData.list.filter(
        (item: { dt: number }) => item.dt >= dayStart && item.dt < dayEnd
      );
      if (dayPoints.length > 0) {
        const temps = dayPoints.map((p: { main: { temp: number } }) => p.main.temp);
        const descs = dayPoints.map((p: { weather: { description: string }[] }) => p.weather[0].description);
        const icons = dayPoints.map((p: { weather: { icon: string }[] }) => p.weather[0].icon);
        const windSpeeds = dayPoints.map((p: { wind: { speed: number } }) => p.wind.speed);
        const humidities = dayPoints.map((p: { main: { humidity: number } }) => p.main.humidity);

        results.push({
          date: dateStr,
          temperature: Math.round(temps.reduce((a: number, b: number) => a + b, 0) / temps.length),
          feelsLike: Math.round(temps.reduce((a: number, b: number) => a + b, 0) / temps.length),
          humidity: Math.round(humidities.reduce((a: number, b: number) => a + b, 0) / humidities.length),
          description: descs[0],
          icon: icons[0],
          windSpeed: Math.round(windSpeeds.reduce((a: number, b: number) => a + b, 0) / windSpeeds.length * 10) / 10,
        });
        continue;
      }
    }

    results.push({
      date: dateStr,
      temperature: 0,
      feelsLike: 0,
      humidity: 0,
      description: "No data available",
      icon: "01d",
      windSpeed: 0,
    });
  }

  return results;
}
