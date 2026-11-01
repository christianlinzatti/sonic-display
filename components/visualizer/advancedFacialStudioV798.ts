/** V798: evidence-bound, opt-in response tuning and inspectable GLB facial readiness.
 * No phoneme/speaker detection or additional render loops. V644/V662 and hand-authored
 * timing keep their ownership. The planner never creates a mouth target on its own.
 */
export type RapMouthPrecisionV798 = Readonly<{enabled:boolean; intensity:number}>;
export const DEFAULT_RAP_MOUTH_V798:RapMouthPrecisionV798={enabled:false,intensity:60};
export type MouthChannelV798='jaw'|'wide'|'round'|'lipsClosed';
const MOUTH_CHANNELS_V798:readonly MouthChannelV798[]=['jaw','wide','round','lipsClosed'];
const bounded=(value:unknown,fallback:number,min:number,max:number)=>
  typeof value==='number'&&Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;
export function normalizeRapMouthPrecisionV798(input:Partial<RapMouthPrecisionV798>|null|undefined):RapMouthPrecisionV798 {
  return {enabled:input?.enabled===true,intensity:bounded(input?.intensity,60,0,100)};
}
export type FacialTargetInfoV798={id:string;name:string;meshName:string;suggestion:string|null;confidence:string;normalizedRms?:number|null};
export type FacialProfileInfoV798={mapping?:Partial<Record<MouthChannelV798,string>>;gains?:Partial<Record<MouthChannelV798,number>>};
export type MouthStatusV798='ready'|'manual'|'bone'|'missing'|'disabled'|'stale'|'conflict';
export type MouthReadinessV798={
  covered:number;count:4;precisionSupported:boolean;status:'ready'|'limited'|'unavailable';
  channels:Readonly<Record<MouthChannelV798,MouthStatusV798>>;
  warnings:string[];
};
/** Scan-only diagnostic: morphological similarity and pronunciation quality cannot be certified by names. */
export function inspectMouthReadinessV798(
  targets:readonly FacialTargetInfoV798[],jawBone:boolean,profile:FacialProfileInfoV798={}
):MouthReadinessV798 {
  const known=new Set(targets.map(t=>t.id));
  const channels={} as Record<MouthChannelV798,MouthStatusV798>;
  const warnings:string[]=[];
  const usedMorphs=new Map<string,MouthChannelV798[]>();
  // Mirror V370's single-owner precedence when different channels choose the same morph.
  const ownerOf=(id:string)=>MOUTH_CHANNELS_V798.find(c=>profile.mapping?.[c]===id);
  for(const channel of MOUTH_CHANNELS_V798){
    const selection=profile.mapping?.[channel];
    const inferred=targets.filter(t=>t.suggestion===channel&&!ownerOf(t.id));
    const gain=profile.gains?.[channel];
    if(selection==='none'||gain!==undefined&&(!Number.isFinite(gain)||gain<=0))channels[channel]='disabled';
    else if(selection!==undefined)channels[channel]=!known.has(selection)?'stale':ownerOf(selection)===channel?'manual':'conflict';
    else if(inferred.length)channels[channel]='ready';
    else channels[channel]=channel==='jaw'&&jawBone?'bone':'missing';
    if(channels[channel]==='ready'||channels[channel]==='manual'){
      const bound=channels[channel]==='manual'?targets.filter(t=>t.id===selection):inferred;
      for(const t of bound)usedMorphs.set(t.id,[...(usedMorphs.get(t.id)??[]),channel]);
    }
    if(channels[channel]==='stale')warnings.push(`${channel}: gespeichertes Morph-Target fehlt in diesem Avatar.`);
    if(channels[channel]==='conflict')warnings.push(`${channel}: Morph wird bereits von einem anderen Mundkanal verwendet.`);
    if(channels[channel]==='missing')warnings.push(`${channel}: keine passende Mundform vorhanden oder erkannt.`);
    if(channels[channel]==='disabled')warnings.push(`${channel}: durch die manuelle Zuordnung deaktiviert.`);
    if(channels[channel]==='bone')warnings.push('Kieferöffnung über vorhandenen Kieferknochen statt Jaw-Morph.');
    if(channels[channel]==='ready' && inferred.every(t=>t.confidence!=='high'))
      warnings.push(`${channel}: automatische Namenszuordnung nur mit mittlerer Sicherheit.`);
    if(channels[channel]==='ready' || channels[channel]==='manual'){
      const active=channels[channel]==='manual'?targets.filter(t=>t.id===selection):inferred;
      if(active.length&&active.every(t=>t.normalizedRms===null))
        warnings.push(`${channel}: keine Positions-Morph-Geometrie messbar; Sichtprüfung erforderlich.`);
      if(active.length&&active.every(t=>typeof t.normalizedRms==='number'&&Number.isFinite(t.normalizedRms)&&t.normalizedRms<.0001))
        warnings.push(`${channel}: extrem geringe Verformung; Sichtprüfung erforderlich.`);
    }
  }
  const duplicated=[...usedMorphs].filter(([,channels])=>channels.length>1);
  for(const [id,channels] of duplicated)warnings.push(`Morph ${id} ist gleichzeitig mehreren Mundkanälen zugeordnet: ${channels.join(', ')}.`);
  const covered=MOUTH_CHANNELS_V798.filter(c=>['ready','manual','bone'].includes(channels[c])).length;
  const precisionSupported=duplicated.length===0&&covered>=2 && ['ready','manual','bone'].includes(channels.jaw) &&
    ['ready','manual'].includes(channels.lipsClosed);
  if(!precisionSupported)warnings.push('Rap-Präzisionsmodus benötigt einen Kieferkanal und ein steuerbares Lippenverschluss-Morph.');
  if(!targets.length&&!jawBone)warnings.push('Keine Mund-Morphs oder Kieferknochen erkannt. GLB prüfen.');
  return {covered,count:4,precisionSupported,status:covered===4&&duplicated.length===0?'ready':covered>0?'limited':'unavailable',channels,warnings};
}
export type RapMouthEvidenceV798=Readonly<{
  verifiedWord:boolean;rap:boolean;playing:boolean;authorisedSinger:boolean;
  manualPriority:boolean;authoredViseme:boolean;reducedMotion:boolean;lowTier:boolean;
  hasJaw:boolean;hasLipClosure:boolean;previewRap?:boolean;
}>;
export type RapMouthPlanV798=Readonly<{active:boolean;attack:number;release:number;reason:string}>;
export const RAP_MOUTH_OFF_V798:RapMouthPlanV798={active:false,attack:1,release:1,reason:'inactive'};
/** A *response rate* only. Existing source phoneme shapes remain the exclusive targets. */
export function planRapMouthPrecisionV798(settings:Partial<RapMouthPrecisionV798>|undefined,
  evidence:RapMouthEvidenceV798):RapMouthPlanV798 {
  const config=normalizeRapMouthPrecisionV798(settings);
  if(!config.enabled || config.intensity<=0 || evidence.reducedMotion || evidence.lowTier ||
    evidence.manualPriority || evidence.authoredViseme || !evidence.hasJaw || !evidence.hasLipClosure)
    return RAP_MOUTH_OFF_V798;
  if(!evidence.previewRap && !(evidence.verifiedWord&&evidence.rap&&evidence.playing&&evidence.authorisedSinger))
    return RAP_MOUTH_OFF_V798;
  const strength=config.intensity/100;
  return {active:true,attack:1+1.65*strength,release:1+.32*strength,reason:evidence.previewRap?'simulated-rap':'verified-rap-word'};
}
export function rapMouthRateV798(plan:RapMouthPlanV798,channel:string,attacking:boolean):number {
  if(!plan.active || !MOUTH_CHANNELS_V798.some(c=>c===channel))return 1;
  return attacking?plan.attack:plan.release;
}

const valid=(n:number)=>Number.isFinite(n);
const unit=(n:number)=>valid(n)?Math.max(0,Math.min(1,n)):0;
const mix=(a:number,b:number,t:number)=>a+(b-a)*unit(t);
const easing=(t:number)=>{const x=unit(t);return x*x*(3-2*x);};
/** Pure synthetic V798 preview; does NOT represent transcribed speech. It
 * deliberately alternates closure and three vowel shapes every ~140ms,
 * using smooth transitions so one can visibly test the mapped GLB face. */
const DEMO_SEQUENCE:readonly Readonly<{jaw:number;wide:number;round:number;lipsClosed:number}>[]=[
 {jaw:0,wide:0,round:0,lipsClosed:1},
 {jaw:.82,wide:.18,round:0,lipsClosed:0},
 {jaw:.32,wide:.87,round:0,lipsClosed:0},
 {jaw:0,wide:0,round:0,lipsClosed:1},
 {jaw:.34,wide:0,round:.95,lipsClosed:0},
 {jaw:.42,wide:.68,round:0,lipsClosed:0},
 {jaw:.18,wide:.22,round:0,lipsClosed:0},
 {jaw:.54,wide:0,round:.82,lipsClosed:0},
];
export function sampleRapidRapDemoV798(seconds:number):Record<MouthChannelV798,number>&{brow:number;cheek:number;blink:number}{
 if(!valid(seconds)||seconds<0)return {jaw:0,wide:0,round:0,lipsClosed:0,brow:0,cheek:0,blink:0};
 const beat=seconds*1000/142;
 const index=Math.floor(beat)%DEMO_SEQUENCE.length;
 const next=DEMO_SEQUENCE[(index+1)%DEMO_SEQUENCE.length];
 const current=DEMO_SEQUENCE[index];
 const fraction=beat-Math.floor(beat);
 // Short co-articulation at the end of each 142ms event.
 const transition=easing((fraction-.72)/.28);
 const lipSeal=mix(current.lipsClosed,next.lipsClosed,transition);
 return {jaw:Math.min(1-lipSeal,mix(current.jaw,next.jaw,transition)),
  wide:mix(current.wide,next.wide,transition)*(1-lipSeal*.25),
  round:mix(current.round,next.round,transition)*(1-lipSeal*.2),
  lipsClosed:lipSeal,brow:.13,cheek:.12,blink:seconds%4.2>4.12?1:0};
}
