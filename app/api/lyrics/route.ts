import { NextRequest, NextResponse } from "next/server";
import { findLyrics } from "@/services/lyrics/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const title = params.get("title")?.trim();
  const artist = params.get("artist")?.trim();
  const duration = Number(params.get("duration"));

  if (!title || !artist || !Number.isFinite(duration) || duration <= 0) {
    return NextResponse.json(
      { error: "title, artist and positive duration required" },
      { status: 400 },
    );
  }

  try {
    const lyrics = await findLyrics({
      title,
      artist,
      album: params.get("album") ?? "",
      duration,
    });
    return NextResponse.json(lyrics);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lyrics lookup failed" },
      { status: 502 },
    );
  }
}
