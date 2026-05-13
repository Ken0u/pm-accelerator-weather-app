"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import RecentSearches, { saveRecentSearch } from "./RecentSearches";

interface Suggestion {
  label: string;
  value: string;
  lat: number;
  lon: number;
}

interface WeatherSearchProps {
  onSearch: (query: string) => void;
  onSearchCoords?: (lat: number, lon: number, label: string) => void;
  onGeolocate: () => void;
  isLoading: boolean;
  geolocating: boolean;
}

export default function WeatherSearch({ onSearch, onSearchCoords, onGeolocate, isLoading, geolocating }: WeatherSearchProps) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [fetching, setFetching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const suppressAutocompleteRef = useRef(false);

  const triggerSearch = useCallback(
    (q: string) => {
      suppressAutocompleteRef.current = true;
      saveRecentSearch(q);
      onSearch(q);
      setShowDropdown(false);
      setShowRecent(false);
    },
    [onSearch]
  );

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const value = input.trim();
      if (value) triggerSearch(value);
    },
    [input, triggerSearch]
  );

  const selectSuggestion = useCallback(
    (suggestion: Suggestion) => {
      suppressAutocompleteRef.current = true;
      setInput(suggestion.label);
      setShowDropdown(false);
      setShowRecent(false);
      saveRecentSearch(suggestion.label);
      if (onSearchCoords) {
        onSearchCoords(suggestion.lat, suggestion.lon, suggestion.label);
      } else {
        onSearch(suggestion.value);
      }
    },
    [onSearch, onSearchCoords]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const val = input.trim();
    if (isLoading || suppressAutocompleteRef.current || val.length < 2) {
      debounceRef.current = setTimeout(() => {
        if (isLoading || suppressAutocompleteRef.current) setSuggestions([]);
        else if (val.length < 2) setSuggestions([]);
        setShowDropdown(false);
        setShowRecent(!isLoading && !suppressAutocompleteRef.current && val.length === 0);
        setFetching(false);
      }, 0);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setShowRecent(false);
      setFetching(true);
      try {
        const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(val)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setShowDropdown(data.length > 0);
          setActiveIndex(-1);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setFetching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, isLoading]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setShowRecent(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === "Enter") handleSubmit();
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          selectSuggestion(suggestions[activeIndex]);
        } else {
          handleSubmit();
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setShowRecent(false);
        break;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative z-[80] w-full" role="search">
      <div className="control-surface relative z-[80] flex flex-col gap-3 overflow-visible rounded-[24px] p-2 sm:flex-row sm:items-start">
        <div className="relative z-[90] flex-1">
          <svg
            className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-white/48"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => { suppressAutocompleteRef.current = false; setInput(e.target.value); }}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (!suppressAutocompleteRef.current && suggestions.length > 0) setShowDropdown(true); if (input.trim().length === 0) setShowRecent(true); }}
            placeholder="Search city, zip code, or place"
            className="h-14 w-full rounded-[18px] border border-white/10 bg-white/10 pl-11 pr-10 text-base text-white placeholder-white/42 outline-none transition-all focus:border-cyan-200/40 focus:bg-white/14 focus:ring-2 focus:ring-cyan-200/20 disabled:opacity-60"
            disabled={isLoading}
            aria-label="Search location"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            autoComplete="off"
          />
          {fetching && (
            <svg className="absolute right-4 top-5 h-4 w-4 animate-spin text-white/48" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {showDropdown && suggestions.length > 0 && (
            <div
              ref={dropdownRef}
              id="search-suggestions"
              role="listbox"
              className="absolute left-0 right-0 top-full z-[999] mt-2 overflow-hidden rounded-2xl border border-white/15 bg-slate-950/95 shadow-2xl shadow-black/40 backdrop-blur-2xl"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.label}-${suggestion.lat}-${suggestion.lon}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onClick={() => selectSuggestion(suggestion)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                    index === activeIndex
                      ? "bg-cyan-300/15 text-white"
                      : "text-white/72 hover:bg-white/8"
                  }`}
                >
                  <svg className="h-3.5 w-3.5 shrink-0 text-cyan-100/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>{suggestion.label}</span>
                </button>
              ))}
            </div>
          )}
          <RecentSearches onSelect={(q) => { setInput(q); triggerSearch(q); }} visible={showRecent} />
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="gradient-action flex h-14 items-center justify-center rounded-[18px] px-6 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-45 sm:min-w-28"
          aria-label="Search weather"
        >
          {isLoading ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            "Search"
          )}
        </button>
        <button
          type="button"
          onClick={onGeolocate}
          disabled={geolocating}
          className="flex h-14 items-center justify-center rounded-[18px] border border-white/14 bg-white/10 px-4 text-white transition-all hover:bg-white/18 disabled:cursor-not-allowed disabled:opacity-50 sm:w-14 sm:px-0"
          aria-label="Use current location"
          title="Use current location"
        >
          {geolocating ? (
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}
