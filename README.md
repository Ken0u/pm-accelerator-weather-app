# Weather App

A full-stack weather application with dynamic weather-reactive theming, 5-day forecast, CRUD data persistence, and multi-API integration.

Built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, **Prisma + SQLite**.

## Features

### Frontend (Tech Assessment 1)
- Location search (city, zip code, landmark, coordinates)
- Current location geolocation
- Current weather display with detailed metrics
- **5-day forecast** with daily highs/lows
- **Weather-reactive theme system** — background gradients, colors, and icons adapt to current conditions (sunny, rainy, snowy, thunderstorm, foggy, night mode)
- Smooth CSS animations and transitions
- Loading skeletons and error states
- Responsive design

### Backend (Tech Assessment 2)
- **CRUD** — Create, Read, Update, Delete weather records persisted in SQLite via Prisma
- **Date range validation** and **location validation** via OpenWeatherMap Geocoding API
- **API Integration** — YouTube video search and Google Maps embed for queried locations
- **Data Export** — Export saved weather data as JSON, CSV, XML, or Markdown
- Proper error handling with user-friendly messages

## Prerequisites

- Node.js >= 18
- npm

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up API keys

Copy the template and fill in your keys:

```bash
cp .env.local .env.local
```

Edit `.env.local` with your API keys:

| Variable | Service | How to Get |
|----------|---------|------------|
| `NEXT_PUBLIC_OPENWEATHERMAP_API_KEY` | OpenWeatherMap | Sign up at [openweathermap.org](https://home.openweathermap.org/users/sign_up), then get your free API key at [API Keys](https://home.openweathermap.org/api_keys) |
| `NEXT_PUBLIC_YOUTUBE_API_KEY` | YouTube Data API v3 | Get from [Google Cloud Console](https://console.cloud.google.com/apis/credentials). Enable "YouTube Data API v3". |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps Embed API | Get from [Google Cloud Console](https://console.cloud.google.com/apis/credentials). Enable "Maps Embed API". |

### 3. Set up the database

```bash
npx prisma migrate dev --name init
```

This creates the SQLite database and applies the schema.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production

```bash
npm run build
npm start
```

## Project Structure

```
weather-app/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── weather/route.ts    # Current weather endpoint
│   │   │   ├── forecast/route.ts   # 5-day forecast endpoint
│   │   │   ├── locations/route.ts  # CRUD list & create
│   │   │   ├── locations/[id]/route.ts  # CRUD read/update/delete
│   │   │   ├── export/route.ts     # Data export (JSON/CSV/XML/MD)
│   │   │   ├── youtube/route.ts    # YouTube video search
│   │   │   └── maps/route.ts       # Google Maps embed
│   │   ├── page.tsx                # Main page (client component)
│   │   ├── layout.tsx              # Root layout
│   │   ├── globals.css             # Global styles + animations
│   │   └── components/
│   │       ├── WeatherSearch.tsx        # Location input + geolocate
│   │       ├── CurrentWeather.tsx       # Current conditions display
│   │       ├── FiveDayForecast.tsx      # 5-day forecast grid
│   │       ├── WeatherIcon.tsx          # SVG weather icons
│   │       ├── ErrorAlert.tsx           # Error display component
│   │       ├── LocationHistory.tsx      # CRUD table (RUD)
│   │       ├── SaveWeatherDialog.tsx    # CRUD create dialog
│   │       ├── DataExport.tsx           # Export format buttons
│   │       ├── YouTubeVideos.tsx        # YouTube results grid
│   │       └── GoogleMap.tsx            # Map embed
│   └── lib/
│       ├── prisma.ts               # Prisma client singleton
│       ├── weather.ts              # OWM API helpers
│       ├── theme.ts                # Weather theme system
│       └── types.ts                # TypeScript types
└── .env.local                      # API keys (not committed)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | SQLite via Prisma ORM v7 |
| Weather API | OpenWeatherMap (current + forecast + geocoding) |
| Video API | YouTube Data API v3 |
| Maps API | Google Maps Embed API |

## Theme System

The UI dynamically adapts to weather conditions:

| Condition | Background | Card Style |
|-----------|-----------|------------|
| ☀️ Clear Day | Blue gradient | White translucent |
| 🌙 Clear Night | Dark indigo gradient | Dark translucent |
| ☁️ Cloudy | Gray gradient | White translucent |
| 🌧️ Rainy | Deep blue gradient | Dark translucent |
| ❄️ Snowy | Light slate gradient | White semi-opaque |
| ⛈️ Thunderstorm | Dark purple gradient | Dark translucent |
| 🌫️ Foggy | Gray gradient | White translucent |
