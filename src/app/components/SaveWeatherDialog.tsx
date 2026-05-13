"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Portal from "./Portal";

interface SaveWeatherDialogProps {
  onSaved: () => void;
  lastQuery?: string;
  currentLocation?: string;
}

export default function SaveWeatherDialog({ onSaved, lastQuery, currentLocation }: SaveWeatherDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => {
    setQuery(currentLocation || lastQuery || "");
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!query.trim()) { setError("Location is required"); return; }
    if (!startDate || !endDate) { setError("Date range is required"); return; }
    if (startDate > endDate) { setError("Start date must be before end date"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), startDate, endDate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setOpen(false);
      setStartDate("");
      setEndDate("");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save weather data");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="rounded-2xl border border-white/14 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/82 transition-all hover:bg-white/18 hover:text-white"
      >
        + Save Range
      </button>

      <AnimatePresence>
        {open && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/72 p-4 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-label="Save weather data"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="glass-panel w-full max-w-md rounded-[28px] p-6 text-white"
              >
                <div className="relative mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/48">Snapshot</p>
                    <h3 className="mt-1 text-xl font-semibold text-white">Save Weather Data</h3>
                  </div>
                  <button
                    onClick={() => { setOpen(false); setError(null); }}
                    className="rounded-xl p-2 text-white/55 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Close dialog"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="relative space-y-4">
                  <div>
                    <label htmlFor="save-location" className="mb-1.5 block text-sm font-medium text-white/72">Location</label>
                    <input
                      id="save-location"
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="City, zip code..."
                      className="w-full rounded-2xl border border-white/12 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-white/35 outline-none focus:border-cyan-200/40 focus:ring-2 focus:ring-cyan-200/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="start-date" className="mb-1.5 block text-sm font-medium text-white/72">Start Date</label>
                      <input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-2xl border border-white/12 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-200/40 focus:ring-2 focus:ring-cyan-200/20 [color-scheme:dark]"
                        max={endDate || undefined}
                      />
                    </div>
                    <div>
                      <label htmlFor="end-date" className="mb-1.5 block text-sm font-medium text-white/72">End Date</label>
                      <input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-2xl border border-white/12 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-200/40 focus:ring-2 focus:ring-cyan-200/20 [color-scheme:dark]"
                        min={startDate || undefined}
                      />
                    </div>
                  </div>
                  {error && (
                    <div className="rounded-2xl border border-red-400/30 bg-red-500/15 p-3 text-sm text-red-100" role="alert">
                      {error}
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setOpen(false); setError(null); }}
                      className="flex-1 rounded-2xl border border-white/12 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/75 transition-colors hover:bg-white/18 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="gradient-action flex-1 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
}
