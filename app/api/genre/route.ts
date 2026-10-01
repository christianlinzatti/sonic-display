import { NextRequest, NextResponse } from "next/server";

const TAG_TO_GENRE: Record<string, string> = {
  hardstyle: "hardstyle", hardtek: "hardstyle", hardtekk: "hardstyle", hardcore: "hardstyle",
  techno: "techno", electronic: "techno", edm: "techno", house: "techno",
  hiphop: "hiphop", "hip-hop": "hiphop", rap: "hiphop", trap: "hiphop",
  rock: "rock", metal: "rock", "heavy metal": "rock", punk: "rock",
  ambient: "ambient", chillout: "ambient", drone: "ambient",
  pop: "pop", dance: "pop",
};
const normalize = (tag: string) => tag.toLowerCase().trim().replace(/\s+/g, " ");
async function tags(method: "track.getTopTags" | "artist.getTopTags", artist: string, track?: string) {
  const key = process.env.LASTFM_API_KEY;
  if (!key) throw new Error("Last.fm API key is not configured");
  const url = new URL("https://ws.audioscrobbler.com/2.0/");
  url.searchParams.set("method", method); url.searchParams.set("api_key", key); url.searchParams.set("format", "json"); url.searchParams.set("artist", artist);
  if (track) url.searchParams.set("track", track);
  const response = await fetch(url, { signal: AbortSignal.timeout(7000), next: { revalidate: 86400 } });
  if (!response.ok) throw new Error(`Last.fm HTTP ${response.status}`);
  const data = await response.json();
  if (data.error) throw new Error(data.message || `Last.fm error ${data.error}`);
  const value = data.toptags?.tag;
  return (Array.isArray(value) ? value : value ? [value] : []).map((t: {name?:string;count?:string|number}) => ({name:String(t.name || ""), count:Number(t.count || 0)})).filter((t: {name:string})=>t.name);
}
export async function GET(request: NextRequest) {
  const artist = request.nextUrl.searchParams.get("artist")?.trim();
  const track = request.nextUrl.searchParams.get("track")?.trim();
  if (!artist || !track || artist.length > 200 || track.length > 200) return NextResponse.json({error:"artist and track are required"},{status:400});
  try {
    let found = await tags("track.getTopTags", artist, track);
    let source: "track" | "artist" = "track";
    if (!found.length) { found = await tags("artist.getTopTags", artist); source = "artist"; }
    const genre = found.map(t=>({ ...t, genre: TAG_TO_GENRE[normalize(t.name)] })).find(t=>t.genre);
    return NextResponse.json({ genre: genre?.genre ?? null, matchedTag: genre?.name ?? null, tags: found.slice(0,10).map(t=>t.name), source, provider:"last.fm" }, { headers: {"Cache-Control":"public, s-maxage=86400, stale-while-revalidate=604800"} });
  } catch (error) {
    return NextResponse.json({genre:null, error:error instanceof Error?error.message:"Last.fm lookup failed", provider:"last.fm"},{status:200});
  }
}
