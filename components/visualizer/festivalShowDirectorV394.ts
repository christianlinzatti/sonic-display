/** V394 – deterministic, section-aware festival direction. No generated beat or extra audio access. */
import type { StageSection } from './stageDirectorV287';

export type FestivalModeV394 = 'off'|'cinematic'|'festival';
export type FestivalSectionV394 = 'break'|'build'|'verse'|'hook'|'drop';
export type FestivalShowCueV394 = {
  active:boolean; section:FestivalSectionV394; gain:number; lightGain:number; beamGain:number;
  hazeGain:number; sweepGain:number; laserGain:number; cameraZoom:number; cameraOrbit:number;
  dropAccent:number; electronic:boolean;
};
export type FestivalShowStateV394 = {trackId:string;lastMs:number;section:FestivalSectionV394;sinceMs:number;candidate:FestivalSectionV394;candidateSinceMs:number;cue:FestivalShowCueV394};
export type FestivalShowInputV394 = { trackId?:string; progressMs:number; playing:boolean; reducedMotion?:boolean;
  mode?:FestivalModeV394;strength?:number;section?:StageSection;genre?:string|null;
  energy?:number;beat?:number;performanceTier?:'low'|'balanced'|'high';};
const clamp=(n:number,min:number,max:number)=>Number.isFinite(n)?Math.max(min,Math.min(max,n)):min;
const smooth=(t:number)=>{const x=clamp(t,0,1);return x*x*(3-2*x);};
const blank=(section:FestivalSectionV394):FestivalShowCueV394=>({active:false,section,gain:0,lightGain:1,beamGain:1,hazeGain:1,
  sweepGain:1,laserGain:0,cameraZoom:0,cameraOrbit:0,dropAccent:0,electronic:false});
export function initialFestivalShowV394():FestivalShowStateV394{return {trackId:'',lastMs:-1,section:'verse',sinceMs:0,candidate:'verse',candidateSinceMs:0,cue:blank('verse')};}
export function advanceFestivalShowV394(previous:FestivalShowStateV394,input:FestivalShowInputV394):FestivalShowStateV394{
  const ms=Math.max(0,Number.isFinite(input.progressMs)?input.progressMs:0),trackId=input.trackId??'';
  const wanted:FestivalSectionV394=input.section==='break'?'break':input.section==='build'?'build':input.section==='hook'?'hook':input.section==='drop'?'drop':'verse';
  const reset=trackId!==previous.trackId||ms<previous.lastMs-350||ms>previous.lastMs+10000;
  const candidate=reset||wanted!==previous.candidate?wanted:previous.candidate;
  const candidateSinceMs=reset||wanted!==previous.candidate?ms:previous.candidateSinceMs;
  const section=reset?wanted:wanted===previous.section?previous.section:
    ms-candidateSinceMs>=250?wanted:previous.section;
  const sinceMs=reset||section!==previous.section?ms:previous.sinceMs;
  const base={trackId,lastMs:ms,section,sinceMs,candidate,candidateSinceMs,cue:blank(section)};
  if(!trackId||!input.playing||input.reducedMotion||input.mode===undefined||input.mode==='off'||(input.strength??65)<=0) return base;
  const electronic=/hardstyle|hardtekk|hardcore|techno|rave|trance/i.test(input.genre??'');
  const genreGain=electronic?1.09:.91;
  const tier=input.performanceTier??'balanced';
  const budget=tier==='low'?.60:tier==='balanced'?.80:1;
  const strength=clamp((input.strength??65)/100,0,1);
  const energy=clamp(input.energy??0,0,1),beat=clamp(input.beat??0,0,1);
  const duration=section==='drop'?380:section==='build'?850:650;
  const transition=smooth((ms-sinceMs)/duration);
  const levels:Record<FestivalSectionV394,number>={break:.09,verse:.27,build:.60,hook:.60,drop:.88};
  const gain=clamp(levels[section]*strength*budget*genreGain*(.62+.38*energy)*transition,0,.95);
  // A recognized drop alone may generate a short, bounded brightness accent. No strobing.
  const dropAccent=section==='drop'?clamp((1-smooth((ms-sinceMs)/760))*beat*strength*.16,0,.16):0;
  const festival=input.mode==='festival';
  const lightGain=clamp(1+gain*(section==='break'?-0.06:.24)+dropAccent, .9,1.30);
  const beamGain=clamp(1+gain*(festival?.44:.25)+dropAccent*.6,1,1.42);
  const hazeGain=clamp(1+gain*(section==='build'?.43:.27),1,1.35);
  const sweepGain=clamp(1+gain*(festival?.42:.26),1,1.40);
  const laserGain=festival&&electronic&&tier==='high'&&(section==='build'||section==='drop'||section==='hook')
    ?clamp(gain*(section==='drop'?.78:.44),0,.65):0;
  // Verse: subtle close-up. Hook/drop: group wide. Build: gentle anticipatory movement.
  const cameraZoom=clamp(section==='verse'?-.075*gain:section==='break'?-.045*gain:section==='build'?.055*gain:.17*gain,-.09,.17);
  const cameraOrbit=clamp((section==='hook'||section==='drop'||section==='build')?Math.sin(ms/2200)*gain*(festival?.12:.065):0,-.11,.11);
  return {...base,cue:{active:true,section,gain,lightGain,beamGain,hazeGain,sweepGain,laserGain,cameraZoom,cameraOrbit,dropAccent,electronic}};
}
export function composeFestivalCameraV394<T extends {x:number;z:number;fov:number}>(pose:T,cue:FestivalShowCueV394|undefined,
  options:{automatic:boolean;lyricsProtected?:boolean;authored?:boolean;enabled?:boolean}):T{
  if(!cue?.active||!options.automatic||options.lyricsProtected||options.authored||options.enabled===false)return pose;
  return {...pose,x:clamp(pose.x+cue.cameraOrbit,-12,12),z:clamp(pose.z*(1+cue.cameraZoom),1.2,50),
    fov:clamp(pose.fov+cue.cameraZoom*6,26,58)};
}
/** Existing V387 show retains ownership: only layer modest, bounded multiplicative gains. */
export function combineFestivalGainsV394(v387:{lightGain:number;beamGain:number;hazeGain:number;sweepGain:number}|undefined,
 cue:FestivalShowCueV394|undefined,{enabled=true,authored=false,blackout=false}:{enabled?:boolean;authored?:boolean;blackout?:boolean}={}){
 const base=v387??{lightGain:1,beamGain:1,hazeGain:1,sweepGain:1};
 if(!enabled||authored||blackout||!cue?.active)return base;
 return {lightGain:clamp(base.lightGain*cue.lightGain,.88,1.38),beamGain:clamp(base.beamGain*cue.beamGain,1,1.48),
   hazeGain:clamp(base.hazeGain*cue.hazeGain,1,1.42),sweepGain:clamp(base.sweepGain*cue.sweepGain,1,1.48)};
}
