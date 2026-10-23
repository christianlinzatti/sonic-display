import type { Lyrics, UiPreferences } from "@/types/music";
import { planCinematicLyricsV378, type CinematicLyricsShotV378 } from "./cinematicLyricsCompositionV378";

export type LyricsStudioTimingV379 = "word" | "line" | "plain" | "missing";
export type LyricsStudioSectionV379 = "verse" | "hook" | "drop";
export type LyricsStudioPresetV379 = "deutschrap" | "festival" | "cinematic";
const clamp = (n: number, low: number, high: number) => Number.isFinite(n) ? Math.max(low, Math.min(high, n)) : low;
export const DEMO_DURATION_V379 = 16000;
export const DEMO_LYRICS_V379: Lyrics = {
  provider: "lrclib", synced: true, plainText: null,
  lines: [
    {startMs:0,endMs:3500,text:"Jede Zeile trifft den Takt",words:[
      {text:"Jede",startMs:0,endMs:700},{text:"Zeile",startMs:700,endMs:1470},
      {text:"trifft",startMs:1470,endMs:2250},{text:"den",startMs:2250,endMs:2700},
      {text:"Takt",startMs:2700,endMs:3500}]},
    {startMs:3500,endMs:7000,text:"Zwei Stimmen auf der Bühne",words:[
      {text:"Zwei",startMs:3500,endMs:4150},{text:"Stimmen",startMs:4150,endMs:5050},
      {text:"auf",startMs:5050,endMs:5500},{text:"der",startMs:5500,endMs:5850},
      {text:"Bühne",startMs:5850,endMs:7000}]},
    {startMs:7000,endMs:10800,text:"Und das Licht folgt unserem Flow",words:[
      {text:"Und",startMs:7000,endMs:7600},{text:"das",startMs:7600,endMs:8070},
      {text:"Licht",startMs:8070,endMs:8720},{text:"folgt",startMs:8720,endMs:9330},
      {text:"unserem",startMs:9330,endMs:10050},{text:"Flow",startMs:10050,endMs:10800}]},
    {startMs:10800,endMs:16000,text:"Die ganze Crew singt jetzt mit",words:[
      {text:"Die",startMs:10800,endMs:11500},{text:"ganze",startMs:11500,endMs:12300},
      {text:"Crew",startMs:12300,endMs:13100},{text:"singt",startMs:13100,endMs:14000},
      {text:"jetzt",startMs:14000,endMs:14700},{text:"mit",startMs:14700,endMs:16000}]}
  ]
};
export function timingQualityV379(lyrics: Lyrics | null): LyricsStudioTimingV379 {
  if (!lyrics?.lines.length) return "missing";
  if (!lyrics.synced) return "plain";
  return lyrics.lines.some(line => line.words?.some(word => Number.isFinite(word.startMs))) ? "word" : "line";
}
export function activeStudioLineV379(lyrics: Lyrics | null, positionMs: number) {
  if (!lyrics?.lines.length || !Number.isFinite(positionMs)) return -1;
  let active = -1;
  for (let i=0; i<lyrics.lines.length; i++) {
    if (positionMs >= lyrics.lines[i].startMs) active=i;
    else break;
  }
  return active;
}
export function resolveStudioCompositionV379(args: {
  lyrics: Lyrics | null; progressMs: number; preferences: Pick<UiPreferences,
    "lyricsImmersiveSide" | "avatarLyricsCameraModeV378" | "avatarLyricsCameraStrengthV378" | "reducedMotion">;
  section: LyricsStudioSectionV379; playing: boolean; immersive: boolean;
}): {shot:CinematicLyricsShotV378;reason:string;safeZone:"left"|"right"|"bottom";timing:LyricsStudioTimingV379;activeLine:number} {
  const side = args.preferences.lyricsImmersiveSide ?? "right";
  const plan = planCinematicLyricsV378({
    mode:args.preferences.avatarLyricsCameraModeV378??"off",
    strength:clamp(args.preferences.avatarLyricsCameraStrengthV378??70,0,100),
    playing:args.playing,lyricsVisible:args.immersive,side:args.immersive?side:null,
    lyrics:args.lyrics,progressMs:args.progressMs,section:args.section,
    reducedMotion:args.preferences.reducedMotion,manualPriority:false
  });
  return {shot:plan.active?plan.shot:"none",reason:plan.reason,
    safeZone:args.immersive?side:"bottom",timing:timingQualityV379(args.lyrics),
    activeLine:activeStudioLineV379(args.lyrics,args.progressMs)};
}
export const STUDIO_PRESETS_V379: Record<LyricsStudioPresetV379, Partial<UiPreferences>> = {
  deutschrap:{lyricsStyle:"kinetic",lyricsFontFamilyV379:"bold",lyricsFontSize:115,lyricsGlow:45,
    lyricsPosition:"bottom",lyricsWordHighlight:true,lyricsAnimationIntensity:55,lyricsAnimationSpeed:115,lyricsKineticPresetV382:"rap",lyricsKineticStrengthV382:70,lyricsKineticDropsV382:false,
    lyricsGradientFrom:"#a2f5ff",lyricsGradientTo:"#ffd38b",avatarLyricsCameraModeV378:"readable",avatarLyricsContrastV378:true},
  festival:{lyricsStyle:"neon",lyricsFontFamilyV379:"rounded",lyricsFontSize:120,lyricsGlow:90,
    lyricsPosition:"center",lyricsWordHighlight:true,lyricsAnimationIntensity:90,lyricsAnimationSpeed:100,lyricsKineticPresetV382:"festival",lyricsKineticStrengthV382:90,lyricsKineticDropsV382:true,
    lyricsGradientFrom:"#79f7ff",lyricsGradientTo:"#d789ff",avatarLyricsCameraModeV378:"cinematic",avatarLyricsContrastV378:true},
  cinematic:{lyricsStyle:"cinematic",lyricsFontFamilyV379:"serif",lyricsFontSize:105,lyricsGlow:35,
    lyricsPosition:"bottom",lyricsWordHighlight:true,lyricsAnimationIntensity:35,lyricsAnimationSpeed:85,lyricsKineticPresetV382:"cinematic",lyricsKineticStrengthV382:35,lyricsKineticDropsV382:false,
    lyricsGradientFrom:"#ffdfab",lyricsGradientTo:"#ffedf4",avatarLyricsCameraModeV378:"readable",avatarLyricsContrastV378:true}
};
