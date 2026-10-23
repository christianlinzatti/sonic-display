"use client";
import { useEffect, useState } from "react";
import type { GenreDetectionStatus } from "@/types/music";
import type { MusicGenre } from "@/types/animation";
import type { Track } from "@/types/music";
import type { GenreFusion } from "@/services/genre/genreIntelligence";
type Result = { fusion?:GenreFusion|null; genre: MusicGenre | null; matchedTag?: string | null; source?: "track" | "artist"; error?: string; confidence?:number;reason?:string };
export function useGenreDetection(track: Track | null) {
 const [detectedGenre,setDetectedGenre]=useState<MusicGenre|null>(null);
 const [genreStatus,setGenreStatus]=useState<GenreDetectionStatus>("idle");
 const [genreSource,setGenreSource]=useState<"track"|"artist"|null>(null);
 const [genreMatchedTag,setGenreMatchedTag]=useState<string|null>(null);
 const [genreConfidence,setGenreConfidence]=useState(0);
 const [detectedFusion,setDetectedFusion]=useState<GenreFusion|null>(null);
 const [genreReason,setGenreReason]=useState<string|null>(null);
 const [genreBpmHint,setGenreBpmHint]=useState<number|null>(null);
 const [genreError,setGenreError]=useState<string|null>(null);
 useEffect(()=>{
  if(!track){setDetectedGenre(null);setGenreStatus("idle");setGenreSource(null);setGenreMatchedTag(null);setGenreError(null);setGenreConfidence(0);setDetectedFusion(null);setGenreReason(null);return;}
  const controller=new AbortController(); setGenreStatus("loading");setGenreError(null);
  const params=new URLSearchParams({artist:track.artist,track:track.title});if(genreBpmHint!==null)params.set("bpm",String(genreBpmHint));
  fetch(`/api/genre?${params}`,{signal:controller.signal}).then(async response=>{if(!response.ok)throw new Error(`Genre lookup failed (${response.status})`);return response.json() as Promise<Result>;})
   .then(result=>{if(controller.signal.aborted)return;setDetectedGenre(result.genre??null);setDetectedFusion(result.fusion?.primary===result.genre?result.fusion:null);setGenreSource(result.genre?(result.source??null):null);setGenreMatchedTag(result.matchedTag??null);setGenreError(result.error??null);setGenreConfidence(result.confidence??0);setGenreReason(result.reason??null);setGenreStatus(result.error?"error":result.genre?"detected":"unknown");})
   .catch(error=>{if(controller.signal.aborted)return;setDetectedGenre(null);setGenreSource(null);setGenreMatchedTag(null);setGenreConfidence(0);setDetectedFusion(null);setGenreReason(null);setGenreError(error instanceof Error?error.message:"Genre lookup failed");setGenreStatus("error");});
  return ()=>controller.abort();
 },[track?.id,track?.artist,track?.title,genreBpmHint]);
 return {detectedGenre,detectedFusion,genreStatus,genreSource,genreMatchedTag,genreError,genreConfidence,genreReason,genreBpmHint,setGenreBpmHint};
}
