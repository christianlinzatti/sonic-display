"use client";
import { useEffect, useState } from "react";
import type { GenreDetectionStatus } from "@/types/music";
import type { MusicGenre } from "@/types/animation";
import type { Track } from "@/types/music";
type Result = { genre: MusicGenre | null; matchedTag?: string | null; source?: "track" | "artist"; error?: string };
export function useGenreDetection(track: Track | null) {
 const [detectedGenre,setDetectedGenre]=useState<MusicGenre|null>(null);
 const [genreStatus,setGenreStatus]=useState<GenreDetectionStatus>("idle");
 const [genreSource,setGenreSource]=useState<"track"|"artist"|null>(null);
 const [genreMatchedTag,setGenreMatchedTag]=useState<string|null>(null);
 const [genreError,setGenreError]=useState<string|null>(null);
 useEffect(()=>{
  if(!track){setDetectedGenre(null);setGenreStatus("idle");setGenreSource(null);setGenreMatchedTag(null);setGenreError(null);return;}
  const controller=new AbortController(); setGenreStatus("loading");setGenreError(null);
  const params=new URLSearchParams({artist:track.artist,track:track.title});
  fetch(`/api/genre?${params}`,{signal:controller.signal}).then(async response=>{if(!response.ok)throw new Error(`Genre lookup failed (${response.status})`);return response.json() as Promise<Result>;})
   .then(result=>{if(controller.signal.aborted)return;setDetectedGenre(result.genre??null);setGenreSource(result.genre?(result.source??null):null);setGenreMatchedTag(result.matchedTag??null);setGenreError(result.error??null);setGenreStatus(result.error?"error":result.genre?"detected":"unknown");})
   .catch(error=>{if(controller.signal.aborted)return;setDetectedGenre(null);setGenreSource(null);setGenreMatchedTag(null);setGenreError(error instanceof Error?error.message:"Genre lookup failed");setGenreStatus("error");});
  return ()=>controller.abort();
 },[track?.id,track?.artist,track?.title]);
 return {detectedGenre,genreStatus,genreSource,genreMatchedTag,genreError};
}
