import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q");

    if (!q) {
      return Response.json({ error: "Missing search query (?q=...)" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    if (!apiKey || apiKey === "YOUR_YOUTUBE_API_KEY") {
      return Response.json({ error: "YouTube API key not configured" }, { status: 501 });
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${encodeURIComponent(q + " weather travel")}&type=video&key=${apiKey}`;
    const res = await fetch(url);

    if (!res.ok) {
      const errText = await res.text();
      return Response.json({ error: `YouTube API error: ${res.status}`, details: errText }, { status: res.status });
    }

    const data = await res.json();
    type YouTubeItem = {
      id: { videoId: string };
      snippet: { title: string; thumbnails: { medium: { url: string } }; channelTitle: string };
    };
    const videos = (data.items || []).map((item: YouTubeItem) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      channel: item.snippet.channelTitle,
    }));

    return Response.json(videos);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch YouTube data";
    return Response.json({ error: message }, { status: 500 });
  }
}
