"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider, useTheme } from "@/lib/ThemeContext";
import type { CurrentWeatherData, ForecastDay, SavedLocation } from "@/lib/types";
import WeatherSearch from "./components/WeatherSearch";
import CurrentWeather from "./components/CurrentWeather";
import ForecastTabs from "./components/ForecastTabs";
import HourlyForecast from "./components/HourlyForecast";
import ErrorAlert from "./components/ErrorAlert";
import LocationHistory from "./components/LocationHistory";
import SaveWeatherDialog from "./components/SaveWeatherDialog";
import DataExport from "./components/DataExport";
import YouTubeVideos from "./components/YouTubeVideos";
import GoogleMap from "./components/GoogleMap";
import WindCompass from "./components/WindCompass";
import SunriseTimeline from "./components/SunriseTimeline";
import WeatherParticles from "./components/WeatherParticles";

function HomeContent() {
  const { theme, setWeather } = useTheme();
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [lastQuery, setLastQuery] = useState<string>("");
  const [weather, setLocalWeather] = useState<CurrentWeatherData | null>(null);
  const [showData, setShowData] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const updateWeather = useCallback((w: CurrentWeatherData | null) => {
    setLocalWeather(w);
    setWeather(w);
  }, [setWeather]);

  const fetchWeather = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    setShowData(false);
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`/api/weather?q=${encodeURIComponent(query)}`),
        fetch(`/api/forecast?q=${encodeURIComponent(query)}`),
      ]);
      if (!weatherRes.ok) {
        const errData = await weatherRes.json();
        throw new Error(errData.error || "Failed to fetch weather");
      }
      const weatherData = await weatherRes.json();
      updateWeather(weatherData);
      setLastQuery(query);
      if (forecastRes.ok) {
        const data = await forecastRes.json();
        setForecast(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      updateWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  }, [updateWeather]);

  const fetchByCoords = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    setShowData(false);
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`/api/weather?lat=${lat}&lon=${lon}`),
        fetch(`/api/forecast?lat=${lat}&lon=${lon}`),
      ]);
      if (!weatherRes.ok) {
        const errData = await weatherRes.json();
        throw new Error(errData.error || "Failed to fetch weather");
      }
      const weatherData = await weatherRes.json();
      updateWeather(weatherData);
      if (forecastRes.ok) {
        const data = await forecastRes.json();
        setForecast(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      updateWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  }, [updateWeather]);

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) { setError("Geolocation is not supported"); return; }
    setGeolocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => { fetchByCoords(pos.coords.latitude, pos.coords.longitude); setGeolocating(false); },
      (err) => {
        let msg = "Unable to retrieve your location";
        if (err.code === err.PERMISSION_DENIED) msg = "Location access denied";
        else if (err.code === err.TIMEOUT) msg = "Location request timed out";
        setError(msg);
        setGeolocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [fetchByCoords]);

  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch("/api/locations");
      if (res.ok) setLocations(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchLocations);
  }, [fetchLocations]);

  return (
    <div className={`relative min-h-screen overflow-hidden bg-gradient-to-br ${theme.gradient} text-white transition-all duration-700`}>
      <WeatherParticles />
      <div className="ambient-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(45,212,191,0.24),transparent_28%),radial-gradient(circle_at_78%_5%,rgba(167,139,250,0.28),transparent_32%),linear-gradient(to_bottom,rgba(2,6,23,0.05),rgba(2,6,23,0.78))]" />

      <div className="relative z-10 min-h-screen px-4 py-5 sm:px-6 lg:px-8">
        <header className="relative z-40 mx-auto max-w-7xl">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/65">Ken Ou</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Weather App</h1>
            </div>
            <div className="flex items-center gap-2">
              <SaveWeatherDialog onSaved={fetchLocations} lastQuery={lastQuery} currentLocation={weather ? `${weather.location}, ${weather.country}` : undefined} />
              <button
                onClick={() => setShowInfo(!showInfo)}
                className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                  showInfo
                    ? "border-cyan-200/35 bg-cyan-200/20 text-white"
                    : "border-white/14 bg-white/10 text-white/72 hover:bg-white/18 hover:text-white"
                }`}
                aria-label="Toggle info"
              >
                Info
              </button>
              <button
                onClick={() => setShowData(!showData)}
                className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                  showData
                    ? "border-cyan-200/35 bg-cyan-200/20 text-white"
                    : "border-white/14 bg-white/10 text-white/72 hover:bg-white/18 hover:text-white"
                }`}
                aria-label="Toggle saved data"
              >
                {showData ? "Weather" : "Data"}
              </button>
            </div>
          </div>
          <div className="relative z-50 max-w-4xl">
            <WeatherSearch
              onSearch={fetchWeather}
              onSearchCoords={(lat, lon, label) => { setLastQuery(label); fetchByCoords(lat, lon); }}
              onGeolocate={handleGeolocate}
              isLoading={loading}
              geolocating={geolocating}
            />
          </div>
        </header>

        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-30 mx-auto mt-4 max-w-7xl"
          >
            <div className="glass-panel rounded-[28px] p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold tracking-tight text-white">About PM Accelerator</h2>
                  <p className="max-w-3xl text-sm leading-relaxed text-white/72">
                    The Product Manager Accelerator Program is designed to support PM professionals through every stage of their careers. From students looking for entry-level jobs to Directors looking to take on a leadership role, our program has helped over hundreds of students fulfill their career aspirations.
				  </p>
					
				  <p className="max-w-3xl text-sm leading-relaxed text-white/72">
					Our Product Manager Accelerator community are ambitious and committed. Through our program they have learnt, honed and developed new PM and leadership skills, giving them a strong foundation for their future endeavors.
				  </p>
				
				  <p className="max-w-3xl text-sm leading-relaxed text-white/72">
					Here are the examples of services we offer. Check out our website (link under my profile) to learn more about our services.
				  </p>
				  
				  <p className="max-w-3xl text-sm leading-relaxed text-white/72">
					🚀 PMA Pro
					End-to-end product manager job hunting program that helps you master FAANG-level Product Management skills, conduct unlimited mock interviews, and gain job referrals through our largest alumni network. 25% of our offers came from tier 1 companies and get paid as high as $800K/year.
				  </p>
				
				  <p className="max-w-3xl text-sm leading-relaxed text-white/72">
					🚀 AI PM Bootcamp
					Gain hands-on AI Product Management skills by building a real-life AI product with a team of AI Engineers, data scientists, and designers. We will also help you launch your product with real user engagement using our 100,000+ PM community and social media channels.
				  </p>
					
				  <p className="max-w-3xl text-sm leading-relaxed text-white/72">
					🚀 PMA Power Skills
					Designed for existing product managers to sharpen their product management skills, leadership skills, and executive presentation skills
				  </p>
					
				  <p className="max-w-3xl text-sm leading-relaxed text-white/72">
					🚀 PMA Leader
					We help you accelerate your product management career, get promoted to Director and product executive levels, and win in the board room.
				  </p>
					
				  <p className="max-w-3xl text-sm leading-relaxed text-white/72">
					🚀 1:1 Resume Review
					We help you rewrite your killer product manager resume to stand out from the crowd, with an interview guarantee.  Get started by using our FREE killer PM resume template used by over 14,000 product managers. https://www.drnancyli.com/pmresume
				  </p>
					
				  <p className="max-w-3xl text-sm leading-relaxed text-white/72">
					🚀 We also published over 500+ free training and courses. Please go to my YouTube channel https://www.youtube.com/c/drnancyli and Instagram @drnancyli to start learning for free today.
                  </p>
                  <p className="max-w-3xl text-sm leading-relaxed text-white/58">
                    Built with Next.js, TypeScript, Tailwind CSS, and Prisma. Powered by OpenWeatherMap,
                    Google Maps, and YouTube APIs.
                  </p>
                </div>
                <button
                  onClick={() => setShowInfo(false)}
                  className="shrink-0 rounded-full border border-white/14 bg-white/10 p-2 text-white/58 transition-all hover:bg-white/18 hover:text-white"
                  aria-label="Close info"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <main className="relative z-10 mx-auto max-w-7xl pb-14 pt-6">
          <AnimatePresence>
            {error && (
              <motion.div key="error" className="max-w-4xl">
                <ErrorAlert message={error} onDismiss={() => setError(null)} />
              </motion.div>
            )}
          </AnimatePresence>

          {loading && !weather && (
            <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
              <div className="glass-panel h-[520px] animate-pulse rounded-[28px]" />
              <div className="space-y-5">
                <div className="glass-panel h-48 animate-pulse rounded-[28px]" />
                <div className="glass-panel h-64 animate-pulse rounded-[28px]" />
              </div>
            </div>
          )}

          {showData ? (
            <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
              <LocationHistory locations={locations} onRefresh={fetchLocations} />
              <DataExport />
            </div>
          ) : (
            <>
              {weather && !loading && (
                <motion.div
                  key="weather-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4"
                >
                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
                    <CurrentWeather weather={weather} />

                    <div className="grid gap-5">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="glass-panel rounded-[24px] p-5">
                          <div className="relative">
                            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-white/52">Wind</h4>
                            <WindCompass weather={weather} />
                          </div>
                        </div>
                        <div className="glass-panel rounded-[24px] p-5">
                          <div className="relative">
                            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-white/52">Daylight</h4>
                            <SunriseTimeline weather={weather} />
                          </div>
                        </div>
                      </div>

                      {forecast.length > 0 && (
                        <section className="glass-panel rounded-[28px] p-5">
                          <div className="relative">
                            <ForecastTabs forecast={forecast} />
                          </div>
                        </section>
                      )}
                    </div>
                  </div>

                  {weather && (
                    <section className="glass-panel mt-5 rounded-[28px] p-5">
                      <div className="relative">
                        <HourlyForecast lat={weather.coordinates.lat} lon={weather.coordinates.lon} />
                      </div>
                    </section>
                  )}

                  <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(360px,0.85fr)_minmax(0,1.15fr)]">
                    {weather && <GoogleMap lat={weather.coordinates.lat} lon={weather.coordinates.lon} locationName={weather.location} />}
                    {weather && <YouTubeVideos query={`${weather.location} ${weather.country}`} />}
                  </div>
                </motion.div>
              )}

              {!weather && !loading && !error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12 grid min-h-[480px] place-items-center"
                >
                  <div className="glass-panel w-full max-w-3xl rounded-[32px] p-8 text-center sm:p-12">
                    <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full border border-white/14 bg-white/10">
                      <div className="orbital-ring absolute inset-0 rounded-full opacity-70" />
                      <svg className="relative z-10 h-14 w-14 text-white/78" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                      </svg>
                    </div>
                    <div className="relative">
                      <p className="text-2xl font-semibold tracking-tight text-white">Start with a location</p>
                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/58">Search a city, zip code, or use your current position to load the live weather console.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </main>

        <footer className="mx-auto max-w-7xl pb-4 text-xs text-white/34">
          Powered by OpenWeatherMap / YouTube / Google Maps
        </footer>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <ThemeProvider>
      <HomeContent />
    </ThemeProvider>
  );
}
