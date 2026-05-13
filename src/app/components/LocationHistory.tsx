"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SavedLocation, WeatherRecord } from "@/lib/types";

interface LocationHistoryProps {
  locations: SavedLocation[];
  onRefresh: () => void;
}

export default function LocationHistory({ locations, onRefresh }: LocationHistoryProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<WeatherRecord>>({});
  const [deleting, setDeleting] = useState<number | null>(null);

  if (locations.length === 0) return null;

  const handleEdit = (record: WeatherRecord) => {
    setEditingId(record.id);
    setEditForm({
      temperature: record.temperature,
      feelsLike: record.feelsLike,
      humidity: record.humidity,
      description: record.description,
      windSpeed: record.windSpeed,
    });
  };

  const handleSave = async (id: number) => {
    try {
      const res = await fetch(`/api/locations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Update failed");
      setEditingId(null);
      onRefresh();
    } catch {
      alert("Failed to update record");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this record?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/locations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      onRefresh();
    } catch {
      alert("Failed to delete record");
    } finally {
      setDeleting(null);
    }
  };

  const allRecords = locations.flatMap((loc) =>
    loc.weathers.map((w) => ({
      ...w,
      location: { name: loc.name, query: loc.query, latitude: loc.latitude, longitude: loc.longitude },
    }))
  );

  if (allRecords.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-[28px] p-5 text-white"
    >
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/48">Archive</p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight">Saved Records</h3>
      </div>
      <div className="scrollbar-soft relative mt-4 max-h-[30rem] space-y-2 overflow-y-auto pr-1">
        <AnimatePresence>
          {allRecords.map((record) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="glass-inner flex items-center justify-between gap-4 rounded-2xl p-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{record.location.name}</p>
                {editingId === record.id ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <input
                      type="number"
                      value={editForm.temperature || ""}
                      onChange={(e) => setEditForm({ ...editForm, temperature: parseFloat(e.target.value) })}
                      className="w-20 rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-xs text-white outline-none focus:border-cyan-200/40"
                      placeholder="Temp"
                      aria-label="Temperature"
                    />
                    <input
                      type="number"
                      value={editForm.humidity || ""}
                      onChange={(e) => setEditForm({ ...editForm, humidity: parseInt(e.target.value) })}
                      className="w-16 rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-xs text-white outline-none focus:border-cyan-200/40"
                      placeholder="Humidity"
                      aria-label="Humidity"
                    />
                    <input
                      type="text"
                      value={editForm.description || ""}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-28 rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-xs text-white outline-none focus:border-cyan-200/40"
                      placeholder="Description"
                      aria-label="Description"
                    />
                    <button
                      onClick={() => handleSave(record.id)}
                      className="rounded-lg bg-cyan-300/20 px-2 py-1 text-xs transition-colors hover:bg-cyan-300/30"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-lg bg-white/10 px-2 py-1 text-xs transition-colors hover:bg-white/20"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/58">
                    <span>{record.temperature}°F</span>
                    <span>Humidity: {record.humidity}%</span>
                    <span className="capitalize">{record.description}</span>
                    <span>{new Date(record.date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              {editingId !== record.id && (
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(record)}
                    className="rounded-xl p-2 transition-colors hover:bg-white/10"
                    aria-label="Edit record"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
                    disabled={deleting === record.id}
                    className="rounded-xl p-2 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                    aria-label="Delete record"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
