"use client";

export default function GoogleMap({ lat, lon, locationName }: { lat: number; lon: number; locationName: string }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const isConfigured = apiKey && apiKey !== "YOUR_GOOGLE_MAPS_API_KEY";

  if (!isConfigured) {
    return (
      <div className="glass-panel rounded-[28px] p-5 text-white">
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/48">Location</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight">Map</h3>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/8 p-5 text-center text-sm text-white/50">
            Google Maps API key not configured.
          </div>
        </div>
      </div>
    );
  }

  const embedUrl = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lon}&zoom=12&maptype=satellite`;

  return (
    <div className="glass-panel rounded-[28px] p-5 text-white">
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/48">Location</p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight">Map</h3>
      </div>
      <div className="relative mt-4 overflow-hidden rounded-3xl border border-white/12">
        <iframe
          title={`Map of ${locationName}`}
          width="100%"
          height="330"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
          allowFullScreen
        />
      </div>
    </div>
  );
}
