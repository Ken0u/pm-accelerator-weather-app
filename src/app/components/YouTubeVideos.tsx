"use client";

import { useState, useEffect, type ReactNode } from "react";
import type { YouTubeVideo } from "@/lib/types";

interface YouTubeVideosProps {
  query: string;
}

interface YouTubeErrorResponse {
  error?: string;
  details?: string;
}

export default function YouTubeVideos({ query }: YouTubeVideosProps) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${query} weather travel`)}`;

  useEffect(() => {
    if (!query) return;
    let cancelled = false;

    const loadVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/youtube?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          let message = "Failed to load videos.";
          try {
            const body = (await response.json()) as YouTubeErrorResponse;
            message = formatYouTubeError(response.status, body);
          } catch {
            message = `Failed to load videos. YouTube returned HTTP ${response.status}.`;
          }
          throw new Error(message);
        }
        const nextVideos = await response.json();
        if (!cancelled) setVideos(nextVideos);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load videos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadVideos();
    return () => {
      cancelled = true;
    };
  }, [query]);

  if (error) {
    return (
      <VideoShell>
        <div className="relative rounded-3xl mt-4 border border-red-300/20 bg-red-500/10 p-5">
          <p className="text-sm font-semibold text-red-50">YouTube videos could not be loaded.</p>
          <p className="mt-2 text-sm leading-6 text-red-50/78">{error}</p>
          <a
            href={youtubeSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-2xl border border-white/14 bg-white/10 px-4 py-2 text-sm font-semibold text-white/86 transition-all hover:bg-white/18 hover:text-white"
          >
            Open YouTube
          </a>
        </div>
      </VideoShell>
    );
  }

  if (loading) {
    return (
      <VideoShell>
        <div className="relative mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-white/8">
              <div className="aspect-video bg-white/5" />
              <div className="p-3">
                <div className="h-3 bg-white/10 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </VideoShell>
    );
  }

  if (videos.length === 0) {
    return (
      <VideoShell>
        <div className="relative rounded-3xl mt-4 border border-white/10 bg-white/8 p-5">
          <p className="text-sm font-medium text-white/78">No matching videos found.</p>
          <a
            href={youtubeSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-2xl border border-white/14 bg-white/10 px-4 py-2 text-sm font-semibold text-white/82 transition-all hover:bg-white/18 hover:text-white"
          >
            Search YouTube
          </a>
        </div>
      </VideoShell>
    );
  }

  return (
    <VideoShell>
      <div className="relative mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {videos.map((video) => (
          <a
            key={video.id}
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group overflow-hidden rounded-2xl border border-white/10 bg-white/8 transition-all hover:-translate-y-0.5 hover:bg-white/14"
          >
            <div className="aspect-video bg-white/5 relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium line-clamp-2">{video.title}</p>
              <p className="mt-1 text-xs text-white/50">{video.channel}</p>
            </div>
          </a>
        ))}
      </div>
    </VideoShell>
  );
}

function VideoShell({ children }: { children: ReactNode }) {
  return (
    <div className="glass-panel rounded-[28px] p-5 text-white">
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/48">Local Lens</p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight">Videos</h3>
      </div>
      {children}
    </div>
  );
}

function formatYouTubeError(status: number, body: YouTubeErrorResponse) {
  const rawDetails = body.details || body.error || "";

  if (status === 501) {
    return "The YouTube API key is not configured. Add NEXT_PUBLIC_YOUTUBE_API_KEY to enable embedded video results.";
  }

  if (rawDetails.includes("quotaExceeded") || rawDetails.toLowerCase().includes("quota")) {
    return "The YouTube API quota has been exceeded. Video results will return after the quota resets or the API key is updated.";
  }

  if (status === 403) {
    return "YouTube rejected the request. Check the API key permissions, quota, and enabled YouTube Data API access.";
  }

  return body.error ? `${body.error} (HTTP ${status})` : `YouTube returned HTTP ${status}.`;
}
