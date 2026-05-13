"use client";

import { useEffect, useState } from "react";

interface RecentSearch {
  query: string;
  timestamp: number;
}

interface RecentSearchesProps {
  onSelect: (query: string) => void;
  visible: boolean;
}

export default function RecentSearches({ onSelect, visible }: RecentSearchesProps) {
  const [searches, setSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    const refreshSearches = () => {
      const stored = localStorage.getItem("weather-recent-searches");
      if (stored) {
        try {
          setSearches(JSON.parse(stored).slice(0, 5));
        } catch {}
      }
    };

    const frame = requestAnimationFrame(refreshSearches);
    return () => cancelAnimationFrame(frame);
  }, [visible]);

  if (!visible || searches.length === 0) return null;

  const handleSelect = (query: string) => {
    onSelect(query);
  };

  return (
    <div className="mt-2 animate-slideDown">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Recent</p>
      <div className="flex flex-wrap gap-1.5">
        {searches.map((s) => (
          <button
            key={s.query + s.timestamp}
            onClick={() => handleSelect(s.query)}
            className="rounded-xl bg-white/10 px-2.5 py-1 text-xs text-white/70 transition-all hover:bg-white/20 hover:text-white"
          >
            {s.query}
          </button>
        ))}
      </div>
    </div>
  );
}

export function saveRecentSearch(query: string) {
  if (typeof window === "undefined" || !query.trim()) return;
  const stored = localStorage.getItem("weather-recent-searches");
  let searches: RecentSearch[] = stored ? JSON.parse(stored) : [];
  searches = searches.filter((s) => s.query !== query.trim());
  searches.unshift({ query: query.trim(), timestamp: Date.now() });
  if (searches.length > 10) searches = searches.slice(0, 10);
  localStorage.setItem("weather-recent-searches", JSON.stringify(searches));
}
