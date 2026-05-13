"use client";

import { useState } from "react";
import type { ExportFormat } from "@/lib/types";

export default function DataExport() {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formats: { format: ExportFormat; label: string }[] = [
    { format: "json", label: "JSON" },
    { format: "csv", label: "CSV" },
    { format: "xml", label: "XML" },
    { format: "markdown", label: "Markdown" },
  ];

  const handleExport = async (format: ExportFormat) => {
    setExporting(format);
    setError(null);
    try {
      const res = await fetch(`/api/export?format=${format}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `weather-export.${format === "markdown" ? "md" : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="glass-panel rounded-[28px] p-5 text-white">
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/48">Portable</p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight">Export Data</h3>
      </div>
      <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
        {formats.map(({ format, label }) => (
          <button
            key={format}
            onClick={() => handleExport(format)}
            disabled={exporting !== null}
            className="control-surface rounded-2xl px-4 py-3 text-sm font-semibold transition-all hover:bg-white/18 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Export as ${label}`}
          >
            {exporting === format ? "Exporting..." : label}
          </button>
        ))}
      </div>
      {error && (
        <div className="relative mt-3 rounded-2xl border border-red-400/30 bg-red-500/15 p-3 text-sm text-red-100" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
