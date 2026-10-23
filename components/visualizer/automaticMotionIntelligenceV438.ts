import type {CharacterMotionStore,InstalledCharacterMotion} from "./characterMotionLibrary";
import type {MotionFeaturesV439} from "./glbMotionAnalyzerV439";
import {danceSectionAt,danceSlot,emptyDanceSequence} from "./intelligentDanceCombinationV242";
import type {DanceSection,DanceSequenceState} from "./intelligentDanceCombinationV242";

export type MotionSceneV438="verse"|"hook"|"reply"|"duet"|"build"|"drop"|"break";
export interface MotionProfileV438{
  id:string;name:string;url:string;explicitSection:boolean;
  recommended:MotionSceneV438[];energy:number;confidence:"configured"|"measured"|"name-hint"|"neutral";
}
export interface MotionShowResultV438{
  state:DanceSequenceState;url:string|undefined;section:DanceSection;
  chosen:MotionProfileV438|null;switched:boolean;reason:string;
}
const finite=(v:number|undefined,fallback:number)=>typeof v==="number"&&Number.isFinite(v)?v:fallback;
const bounded=(v:number,low:number,high:number)=>Math.max(low,Math.min(high,v));
const hook=/\b(hook|refrain|chorus|singalong|anthem|hymne)\b/iu;
const calm=/\b(idle|rest|relax|slow|soft|sway|chill|lofi|lo-fi|head\s?nod|nod|ruhig|break|intro|outro)\b/iu;
const groove=/\b(rap|hip.?hop|groove|bounce|flow|step|walk|shuffle|krump|popping|freestyle|bop|verse|verse1)\b/iu;
const intense=/\b(fast|strong|hard|jump|stomp|kick|power|energetic|energetisch|drop|intense|wild|tekk|rave|speed)\b/iu;
const group=/\b(duet|duo|partner|group|sync|ensemble|mirror|pair)\b/iu;

/** Cheap, offline motion *metadata* classification; no claim of 3D skeleton inspection. */
export function profileMotionV438(m:InstalledCharacterMotion,measured?:MotionFeaturesV439):MotionProfileV438{
  const name=(m.name+" "+m.url.split("/").pop()).slice(0,250);
  const hintedHook=hook.test(name),hintedCalm=calm.test(name),hintedGroove=groove.test(name);
  const hintedIntense=intense.test(name),hintedGroup=group.test(name);
  const energy=bounded(hintedCalm?.19:hintedIntense?.88:hintedHook?.76:hintedGroove?.52:.49,0,1);
  const section:MotionSceneV438[]=m.section!=="any"?[m.section]:hintedHook?["hook"]:
    hintedCalm?["break","verse"]:hintedIntense?["hook","drop"]:
    hintedGroup?["duet","reply","hook"]:hintedGroove?["verse","reply"]:["verse","hook"];
  if(m.section!=="any"&&m.section==="verse"&&hintedGroup)section.push("duet","reply");
  // Manually authored category always overrides measured/filename scene recommendations.
  // For unspecified sections use actual keyframes when evidence is sufficient.
  const useMeasured=!!measured&&measured.confidence>=.35;
  return {id:m.id,name:m.name,url:m.url,explicitSection:m.section!=="any",
    recommended:m.section!=="any"?section:useMeasured?measured.recommended:section,
    energy:useMeasured?measured.energy:energy,
    confidence:m.section!=="any"?"configured":useMeasured?"measured":
      hintedHook||hintedCalm||hintedIntense||hintedGroup||hintedGroove?"name-hint":"neutral"};
}
export function catalogAutoMotionsV438(store:CharacterMotionStore,avatarId:string,
  measured?:Record<string,MotionFeaturesV439>):MotionProfileV438[]{
  return store.motions.filter(m=>m.avatarId===avatarId).slice(0,250).map(m=>profileMotionV438(m,measured?.[m.id]));
}
const normalizeScene=(scene:MotionSceneV438):DanceSection=>
  scene==="reply"||scene==="duet"?"verse":scene;

/** Select a new motion only at phrase/scene events. Never mutates the user's library. */
export function nextAutomaticRapShowV438(state:DanceSequenceState,store:CharacterMotionStore,input:{
  enabled:boolean;manualProtected:boolean;playing:boolean;reducedMotion:boolean;
  trackId:string;avatarId:string;genre:string;bpm?:number;progressMs:number;durationMs:number;
  energy:number;scene?:MotionSceneV438;phraseSlot?:number;eventSlot?:string;
  variety?:number;fallback?:string;motionProfilesV439?:Record<string,MotionFeaturesV439>;avoidMotionId?:string;
}):MotionShowResultV438{
  const scene=input.scene??danceSectionAt(input.progressMs,input.durationMs,input.energy);
  const section=normalizeScene(scene);
  const plain={state:emptyDanceSequence(),url:input.fallback,section,chosen:null,switched:false,reason:"Automatik inaktiv"};
  if(!input.enabled||!store.automatic||input.manualProtected||!input.playing||input.reducedMotion||
    !input.trackId||input.trackId.length>250||!input.avatarId||!Number.isFinite(input.progressMs)||input.progressMs<0)return plain;
  const slot=Number.isFinite(input.phraseSlot)&&finite(input.phraseSlot,0)>=0?Math.floor(input.phraseSlot!):danceSlot(input.progressMs,input.bpm);
  // Scene identity is the implicit event marker when a caller has no explicit cue.
  // A verse-to-hook switch must not silently keep the previous clip forever.
  const eventSlot=input.eventSlot??scene;
  const same=state.trackId===input.trackId&&state.avatarId===input.avatarId;
  // Absolute same-event fast path: no expensive re-ranking at every Spotify progress tick.
  if(same&&slot===state.slot&&eventSlot===state.eventSlot&&state.motionId){
    const motion=store.motions.find(m=>m.id===state.motionId&&m.avatarId===input.avatarId);
    const bpmNow=finite(input.bpm,0);
    const genreNow=input.genre.toLowerCase();
    if(motion&&(!motion.genre||motion.genre.toLowerCase()===genreNow||genreNow===""||genreNow==="unknown")&&
      (bpmNow<=0||(bpmNow>=motion.bpmMin&&bpmNow<=motion.bpmMax)))
      return {state,url:motion.url,section,chosen:profileMotionV438(motion,input.motionProfilesV439?.[motion.id]),switched:false,reason:"Vorhandene Szene halten"};
  }
  const bpm=finite(input.bpm,0),energy=bounded(finite(input.energy,.5),0,1),variety=bounded(finite(input.variety,70),0,100)/100;
  const genre=input.genre.toLowerCase();
  const eligible=store.motions.filter(m=>m.avatarId===input.avatarId&&
    (!m.genre||m.genre.toLowerCase()===genre||genre===""||genre==="unknown")&&
    (bpm<=0||(bpm>=m.bpmMin&&bpm<=m.bpmMax)));
  if(!eligible.length)return {...plain,reason:"Keine geeigneten installierten Clips"};
  const recent=same&&slot>=state.slot?state.recent:[];
  const previous=same&&slot>=state.slot?state.motionId:null;
  const ranked=eligible.map(m=>{
    const profile=profileMotionV438(m,input.motionProfilesV439?.[m.id]);
    const matches=profile.recommended.includes(scene)||profile.recommended.includes(section);
    // Explicit user section is authoritative; name-only guesses cannot beat a configured exact match.
    const exact=m.section===scene||m.section===section;
    const sceneScore=exact?75:m.section!=="any"?(matches?17:-28):matches?(profile.confidence==="measured"?26:20):3;
    const energyScore=(1-Math.abs(profile.energy-energy))*(profile.confidence==="measured"?22:16);
    const bpmScore=bpm>0&&m.bpmMax-m.bpmMin<105?5:0;
    const genreScore=m.genre?10:0;
    const repetitionPenalty=(recent.includes(m.id)?24:0)*variety+(previous===m.id?21:0)*variety;
    // Explicit incompatibilities never receive an artificially high score.
    return {motion:m,profile,score:sceneScore+energyScore+bpmScore+genreScore-repetitionPenalty-(m.id===input.avoidMotionId&&!exact?24:0)};
  }).sort((a,b)=>b.score-a.score||a.motion.id.localeCompare(b.motion.id));
  const top=ranked[0];
  const cap=Math.min(4,Math.max(1,eligible.length-1));
  const history=[...recent,top.motion.id].slice(-cap);
  return {state:{trackId:input.trackId,avatarId:input.avatarId,slot,motionId:top.motion.id,recent:history,eventSlot},
    url:top.motion.url,section,chosen:top.profile,switched:top.motion.id!==previous,
    reason:top.profile.confidence==="configured"?"Manuelle Clip-Kennzeichnung":top.profile.confidence==="measured"?"Aus GLB-Keyframes gemessen":"Automatisch aus Namen und Tempo bewertet"};
}
