/** V1029 – AI Visual Director 5.0.
 * Deterministic, evidence-gated visual hierarchy on existing V810/V604/V761 cues.
 * Coordinates only reduction-only gains AFTER the existing performance governors;
 * no invented song segments, no hardware commands, no camera or rendering loops.
 */
export type VisualSceneV1029='off'|'portrait'|'duet'|'ensemble'|'rising'|'impact'|'breath';
export type VisualDirectorInputV1029={
 enabled:boolean;masterEnabled:boolean;strength:number;
 trackId:string|null|undefined;durationMs:number;positionMs:number;
 playing:boolean;reactive:boolean;reducedMotion:boolean;tier:'low'|'balanced'|'high';
 narrative:{source:string;trackId:string;durationMs:number;actIndex:number;
  section:string;startMs:number;endMs:number}|null;
 cinematic:{active:boolean;reason:string;actIndex:number;intent:string|null;blend:number}|null;
 fx:{active:boolean;reason:string;section:string;phase:number};
 groupCount:number;vocalFocus:boolean;focusSlot:number|null;partnerSlot:number|null;
 lyricsProtected:boolean;lyricsVisible:boolean;manualCamera:boolean;manualLighting:boolean;
 manualFx:boolean;authoredLanes:readonly string[];seekBlocked:boolean;blackout:boolean;
 energy:number;kick:number;budget:number;pressure:number;
};
export type VisualDirectorPlanV1029={
 active:boolean;reason:'verified'|'protected'|'unverified';scene:VisualSceneV1029;
 ledGain:number;fogGain:number;particleGain:number;beamGain:number;strength:number;
};
export const VISUAL_DIRECTOR_OFF_V1029:Readonly<VisualDirectorPlanV1029>=Object.freeze({
 active:false,reason:'protected',scene:'off',ledGain:1,fogGain:1,particleGain:1,
 beamGain:1,strength:0,
});
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
const sections=new Set(['verse','hook','build','drop','break']);
const intents=new Set(['portrait','dialogue','ensemble','wide','rise','pulse','breath']);
const off=(reason:'protected'|'unverified'):VisualDirectorPlanV1029=>({...VISUAL_DIRECTOR_OFF_V1029,reason});
export function planAiVisualDirectorV1029(i:VisualDirectorInputV1029):VisualDirectorPlanV1029{
 if(!i.enabled||!i.masterEnabled||!i.playing||!i.reactive||i.reducedMotion||i.tier==='low'||
   i.manualCamera||i.manualLighting||i.manualFx||i.seekBlocked||i.blackout||
   i.authoredLanes.length>0)return off('protected');
 const n=i.narrative,c=i.cinematic,f=i.fx;
 if(!n||!c?.active||c.reason!=='verified-act'||n.source!=='verified-v600'||
   !f.active||f.reason!=='music'||!i.trackId||n.trackId!==i.trackId||
   ![i.strength,i.durationMs,i.positionMs,n.durationMs,n.actIndex,n.startMs,
     n.endMs,c.actIndex,c.blend,f.phase,i.energy,i.kick,i.budget,i.pressure].every(finite)||
   i.durationMs<10000||i.durationMs>1800000||n.durationMs!==i.durationMs||
   !Number.isInteger(n.actIndex)||n.actIndex<0||n.actIndex>=160||
   c.actIndex!==n.actIndex||c.blend<=0||c.blend>1||
   n.startMs<0||n.endMs>i.durationMs||n.endMs-n.startMs<2600||
   i.positionMs<n.startMs||i.positionMs>=n.endMs||
   Math.abs(f.phase*1000-i.positionMs)>75||!sections.has(n.section)||
   n.section!==f.section||!c.intent||!intents.has(c.intent)||
   !Number.isInteger(i.groupCount)||i.groupCount<1||i.groupCount>4||
   i.energy<0||i.energy>1||i.kick<0||i.kick>1||
   i.strength<0||i.strength>100||i.budget<=0||i.budget>1||
   i.pressure<0||i.pressure>=.85)return off('unverified');
 if(i.strength===0)return off('protected');
 const hasSlot=(n:number|null)=>n!==null&&Number.isInteger(n)&&n>=0&&n<i.groupCount;
 const lead=i.vocalFocus&&hasSlot(i.focusSlot);
 const duet=lead&&hasSlot(i.partnerSlot)&&i.partnerSlot!==i.focusSlot&&
   (c.intent==='dialogue'||c.intent==='ensemble');
 const impact=(n.section==='drop'||n.section==='hook')&&
   i.energy>=.48&&i.kick>=.46&&
   (c.intent==='wide'||c.intent==='pulse'||c.intent==='ensemble');
 let scene:VisualSceneV1029='ensemble';
 if(n.section==='break')scene='breath';
 else if(n.section==='build'&&c.intent==='rise')scene='rising';
 else if(duet)scene='duet';
 else if(lead&&(c.intent==='portrait'||c.intent==='dialogue'))scene='portrait';
 else if(impact)scene='impact';
 else if(n.section==='verse'&&lead)scene='portrait';
 const targets:Record<Exclude<VisualSceneV1029,'off'>,readonly [number,number,number,number]>={
   portrait:[.54,.68,.49,.65],duet:[.64,.72,.54,.71],
   ensemble:[.80,.79,.75,.83],rising:[.79,.97,.62,.88],
   impact:[1,.78,1,1],breath:[.55,.88,.35,.57],
 };
 let [led,fog,particles,beam]=targets[scene];
 // Lyrics stay visible: no LED or decorative haze competing with readable words.
 if(i.lyricsProtected||i.lyricsVisible){led=Math.min(led,.42);fog=Math.min(fog,.68);
   particles=Math.min(particles,.43);beam=Math.min(beam,.66);}
 // Never form a large drop cue from structure alone. A verified section does not
 // imply a measured kick, nor does the camera intent certify an actual beat.
 const boundary=smooth(Math.min(i.positionMs-n.startMs,n.endMs-i.positionMs)/
   Math.min(2000,(n.endMs-n.startMs)*.25));
 const quality=clamp(i.budget)*clamp((.85-i.pressure)/.65)*(i.tier==='balanced'?.72:1);
 const strength=clamp(i.strength/100)*boundary*clamp(c.blend)*quality;
 if(strength<.005)return off('protected');
 const gain=(target:number)=>clamp(1-(1-target)*strength);
 return {active:true,reason:'verified',scene,ledGain:gain(led),fogGain:gain(fog),
   particleGain:gain(particles),beamGain:gain(beam),strength};
}
/** Apply after V889 and V1028; preserve disabled sources and all particle counts. */
export function mixAiVisualDirectorV1029<
 S extends {ringOpacity:number;beamGain:number},
 P extends {active:boolean;ringOpacity:number;confettiOpacity:number;sparkOpacity:number},
 F extends {active:boolean;opacity:number;power:number},
>(plan:VisualDirectorPlanV1029,stage:S,particles:P,foam:F):{stage:S;particles:P;foam:F}{
 if(!plan.active)return {stage,particles,foam};
 return {
  stage:{...stage,ringOpacity:stage.ringOpacity*plan.particleGain,
    beamGain:stage.beamGain*plan.beamGain},
  particles:particles.active?{...particles,
    ringOpacity:particles.ringOpacity*plan.particleGain,
    confettiOpacity:particles.confettiOpacity*plan.particleGain,
    sparkOpacity:particles.sparkOpacity*plan.particleGain}:particles,
  foam:foam.active?{...foam,opacity:foam.opacity*plan.particleGain,
    power:foam.power*plan.particleGain}:foam,
 };
}
/** All existing LED shader layers share the same conservative visual hierarchy. */
export const VISUAL_LED_UNIFORMS_V1029:readonly string[]=Object.freeze([
 'uLed21Power','uLed21Drop','uFxPower','uLed42Power','uLed70Power','uLed86Power','uLed90Power',
]);
