/** V1119 · AI Cinematic Camera Director 4.0.
 * A deterministic offline camera dramaturgy for existing V1040 show shots.
 * The V1043, V1053 and V1072 camera layers own the actual smooth interpolation,
 * singer/lyric safeguards and all real playback signals. This module never
 * identifies a vocalist, predicts a musical event, owns a Three.js camera,
 * accesses devices, or issues network requests.
 */
import {normalizeArenaShowPlanV1040,type ArenaShowSceneV1040} from './arena360ShowDesignerV1040';
import {normalizeAiShowRemixV1106,applyAiShowRemixV1106,type AiShowRemixV1106} from './arena360AiShowRemixV1106';

export const CAMERA_STYLES_V1119=['cinematic','festival','artist','immersive'] as const;
export type CameraStyleV1119=typeof CAMERA_STYLES_V1119[number];
export const CAMERA_STYLE_LABELS_V1119:Record<CameraStyleV1119,string>={
 cinematic:'Filmische 360°-Kamerafahrt',
 festival:'Große Festival-Arena',
 artist:'Künstlernah & Lyrics-freundlich',
 immersive:'Holografische Raumreise',
};
type Camera=AiShowRemixV1106['acts'][number]['camera'];
export type CameraOptionsV1119={style:CameraStyleV1119;strength:number;intensityCap:number};
export type CameraCueV1119={index:number;scene:ArenaShowSceneV1040;start:number;end:number;
 camera:Camera;chapter:string;transition:'continuous-v1072';shotDurationMinSeconds:10;
 focus:'ensemble'|'artist-unknown'|'stage';singerDetected:false;
 holographicContext:'existing-v1039-v1118';manualCameraPriority:true;source:'authored-timeline'};
export type CameraShowV1119={style:CameraStyleV1119;strength:number;
 remix:AiShowRemixV1106;cues:CameraCueV1119[];
 quality:{scenes:7;cameraLooks:number;quietBreak:boolean;ensembleFinale:boolean;
 smoothExistingCamera:true;preservedTimeline:boolean;manualCameraPriority:true;
 hardwareCommands:0;detectedVocals:0}};
export type CameraLivePresetV1119={
 arenaShowCameraEnabledV1043:true;arenaShowCameraStrengthV1043:number;
 arenaCinematicCameraEnabledV1053:true;arenaCinematicCameraStrengthV1053:number;
 arenaCameraDirectorEnabledV1072:true;arenaCameraDirectorStrengthV1072:number;
};
const PROFILES:Record<CameraStyleV1119,{shots:readonly Camera[];chapters:readonly string[]}>= {
 cinematic:{shots:['wide','lead','orbit','group','wide','lead','group'],chapters:[
  'Totale als filmischer Auftakt','Ruhige Künstlerfahrt','Weiche Orbit-Kurven im Aufbau',
  'Ensemble im weiten Showbild','Atempause: ruhige Totale','Künstlernähe mit neuer Perspektive','Weite Abschlussfahrt']},
 festival:{shots:['wide','group','orbit','group','wide','orbit','group'],chapters:[
  'Stadiontotale öffnet sich','Bühne und Ensemble','Rundfahrt um das Publikum',
  'Großes Ensemblebild','Totale schafft Kontrast','Zweite Arena-Rundfahrt','Festival-Finale für alle']},
 artist:{shots:['wide','lead','lead','group','wide','lead','group'],chapters:[
  'Bühne und Crew etablieren','Künstlernah ohne Sängerbehauptung','Sanfte Fahrt zum Lead',
  'Breites Hook-Bild','Ruhige Atempause','Zweite Künstler-Perspektive','Gemeinsamer Künstlerabschluss']},
 immersive:{shots:['wide','orbit','orbit','group','wide','orbit','group'],chapters:[
  'Holografischen Bühnenraum öffnen','Um die Bühne gleiten','Räumliche Lichtbahnen verfolgen',
  'Ensemble im Hologrammraum','Atempause ohne hektische Bewegung','Neue Raumfahrt','Großes 360°-Portal-Finale']},
};
export function normalizeCameraOptionsV1119(raw:unknown):CameraOptionsV1119|null{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const o=raw as Record<string,unknown>;
 if(!CAMERA_STYLES_V1119.includes(o.style as CameraStyleV1119)||
  typeof o.strength!=='number'||!Number.isInteger(o.strength)||o.strength<20||o.strength>80||o.strength%10!==0||
  typeof o.intensityCap!=='number'||!Number.isInteger(o.intensityCap)||o.intensityCap<30||o.intensityCap>85)return null;
 return {style:o.style as CameraStyleV1119,strength:o.strength,intensityCap:o.intensityCap};
}
/** Only touches the existing camera field, preserving every other authored cue.
 * Never uses fake section markers or overrides high-priority manual camera work. */
export function directCinematicCameraV1119(baseRaw:unknown,remixRaw:unknown,optionsRaw:unknown):CameraShowV1119|null{
 const base=normalizeArenaShowPlanV1040(baseRaw),remix=normalizeAiShowRemixV1106(remixRaw),o=normalizeCameraOptionsV1119(optionsRaw);
 if(!base||!remix||!o||base.segments.length!==7||remix.acts.some((a,i)=>
  a.scene!==base.segments[i].scene||a.intensity>o.intensityCap))return null;
 const profile=PROFILES[o.style];
 const acts=remix.acts.map((a,i)=>({...a,
  camera:o.strength>=40?profile.shots[i]:a.camera,
  note:(a.note+' V1119: '+profile.chapters[i]+'.').slice(0,145)}));
 const staged=normalizeAiShowRemixV1106({...remix,acts,explanation:(
  'V1119: lokale Kamerapartitur für bestehende 360°-Automatik, keine erkannte Songstruktur, Sängeridentität oder neuen Render-Kameras. '+remix.explanation).slice(0,300)});
 if(!staged||!applyAiShowRemixV1106(base,staged,o.intensityCap))return null;
 const cues=staged.acts.map((a,i):CameraCueV1119=>({
  index:i,scene:a.scene,start:base.segments[i].start,end:base.segments[i].end,
  camera:a.camera,chapter:profile.chapters[i],transition:'continuous-v1072',shotDurationMinSeconds:10,
  focus:a.camera==='lead'?'artist-unknown':a.camera==='group'?'ensemble':'stage',
  singerDetected:false,holographicContext:'existing-v1039-v1118',manualCameraPriority:true,source:'authored-timeline'}));
 const quality={scenes:7 as const,cameraLooks:new Set(cues.map(c=>c.camera)).size,
  quietBreak:cues[4].scene==='interlude'&&cues[4].camera==='wide',
  ensembleFinale:cues[6].scene==='finale'&&cues[6].camera==='group',
  smoothExistingCamera:true as const,
  preservedTimeline:cues[0].start===0&&cues[6].end===1&&cues.every((c,i)=>i===0||c.start===cues[i-1].end),
  manualCameraPriority:true as const,hardwareCommands:0 as const,detectedVocals:0 as const};
 if(o.strength>=40&&(!quality.quietBreak||!quality.ensembleFinale||quality.cameraLooks<2))return null;
 if(!quality.preservedTimeline)return null;
 return {style:o.style,strength:o.strength,remix:staged,cues,quality};
}
/** A separate user approval enables ONLY the existing camera layers. Their
 * runtime guards block disabled/manual cameras, pause, reduced motion, low GPU,
 * invalid clock, no active song and protected vocal shots. */
export function cameraLivePresetV1119(raw:unknown):CameraLivePresetV1119|null{
 const o=normalizeCameraOptionsV1119(raw);if(!o)return null;
 const strength=Math.min(70,o.strength,o.intensityCap);
 return {arenaShowCameraEnabledV1043:true,arenaShowCameraStrengthV1043:strength,
  arenaCinematicCameraEnabledV1053:true,arenaCinematicCameraStrengthV1053:strength,
  arenaCameraDirectorEnabledV1072:true,arenaCameraDirectorStrengthV1072:strength};
}
export function sampleCameraCueV1119(show:CameraShowV1119|null,progress:unknown):CameraCueV1119|null{
 if(!show||show.cues.length!==7||typeof progress!=='number'||!Number.isFinite(progress)||progress<0||progress>1)return null;
 return show.cues.find(c=>progress<c.end)??show.cues[6];
}
