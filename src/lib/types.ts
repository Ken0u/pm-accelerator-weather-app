export interface Coordinates {
  lat: number;
  lon: number;
}

export interface GeocodingResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface CurrentWeatherData {
  location: string;
  country: string;
  state?: string;
  coordinates: Coordinates;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDeg?: number;
  description: string;
  icon: string;
  conditionCode: number;
  sunrise: number;
  sunset: number;
  dt: number;
  visibility?: number;
  uvi?: number;
  clouds?: number;
}

export interface ForecastDay {
  date: string;
  dayName: string;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
  conditionCode: number;
  humidity?: number;
  windSpeed?: number;
  pressure?: number;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  conditionCode: number;
  pop?: number;
}

export interface WeatherRecord {
  id: number;
  locationId: number;
  location: {
    name: string;
    query: string;
    latitude: number;
    longitude: number;
  };
  date: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  description: string;
  icon: string;
  windSpeed: number;
  createdAt: string;
}

export interface SavedLocation {
  id: number;
  name: string;
  query: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  weathers: WeatherRecord[];
}

export type WeatherCondition =
  | "clear-day"
  | "clear-night"
  | "cloudy"
  | "rainy"
  | "snowy"
  | "thunderstorm"
  | "foggy";

export interface ThemeColors {
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  heading: string;
  accent: string;
  accentHover: string;
  icon: string;
  inputBg: string;
  inputBorder: string;
  tabActive: string;
  tabInactive: string;
}

export interface WeatherTheme {
  condition: WeatherCondition;
  gradient: string;
  colors: ThemeColors;
  particles: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
}

export type ExportFormat = "json" | "csv" | "xml" | "markdown";
