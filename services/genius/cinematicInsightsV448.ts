import {selectGeniusInsightV447,type GeniusInsightV447,type GeniusSongInsightsV447} from "./songInsightsV447";

/** V448 is strictly a presentation planner: no fabricated sample dates, lyric timings or artist IDs. */
export type CinematicInsightV448 = {
  id: string;
  mode: "story"|"credits"|"sample-timeline"|"artist-photo"|"annotation";
  card: GeniusInsightV447;
  credits: string[];
  relationships: GeniusInsightV447[];
  imageKind: "artist"|"album"|null;
};

export function planCinematicInsightV448(
  data: GeniusSongInsightsV447|null,
  progressMs: number,
  lyrics: {synced:boolean;lines:{text:string}[]}|null,
  activeLine: number,
  playing: boolean,
  hasAlbumCover: boolean,
): CinematicInsightV448|null {
  const card = selectGeniusInsightV447(data,progressMs,lyrics,activeLine,playing);
  if(!data||!card)return null;
  // Image choices are from validated Genius primary_artist.image_url or existing Spotify cover only.
  const imageKind = data.artistImageUrl ? "artist" as const : hasAlbumCover ? "album" as const : null;
  let mode:CinematicInsightV448["mode"]="story";
  if(card.kind==="annotation")mode="annotation";
  else if(card.kind==="sample")mode="sample-timeline";
  else if(card.kind==="credit"||card.kind==="feature")mode="credits";
  else if(imageKind && (Math.max(0,progressMs-12000)%28000)<4000)mode="artist-photo";
  // Labels are already bounded and cleaned on the server. Never infer unknown dates/relationships.
  const relationships = data.insights.filter(item=>item.kind==="sample").slice(0,2);
  const credits = mode==="credits" ? card.text.split(" · ").filter(Boolean).slice(0,4) : [];
  return {
    id:`${card.id}-${mode}`,
    mode,card,credits,relationships,imageKind,
  };
}
