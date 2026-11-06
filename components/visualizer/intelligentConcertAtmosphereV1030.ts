/** V1030 – Intelligent Concert Atmosphere 5.0.
 * Existing crowd, ambient palette, fog and lighting only. A single verified
 * V604/V761 act supplies the timing; no invented beat or independent cue.
 * Gains are reduction-only and respect the existing V825/V999 budgets.
 */
export type ConcertAtmosphereSceneV1030='off'|'intimate'|'together'|'rising'|'celebration'|'breath'|'balanced';
export type ConcertAtmosphereInputV1030={
 enabled:boolean;masterEnabled:boolean;strength:number;trackId:string|null|undefined;
 durationMs:number;positionMs:number;playing:boolean;reactive:boolean;
 reducedMotion:boolean;tier:'low'|'balanced'|'high';
 narrative:{source:string;trackId:string;durationMs:number;actIndex:number;
  section:string;startMs:number;endMs:number}|null;
 cinematic:{active:boolean;reason:string;actIndex:number;intent:string|null;blend:number}|null;
 fx:{active:boolean;reason:string;section:string;phase:number};
 groupCount:number;vocalFocus:boolean;lyricsProtected:boolean;lyricsVisible:boolean;
 manualCamera:boolean;manualLighting:boolean;manualFx:boolean;
 authoredLanes:readonly string[];seekBlocked:boolean;blackout:boolean;
 energy:number;kick:number;budget:number;pressure:number;
};
export type ConcertAtmospherePlanV1030={
 active:boolean;reason:'verified'|'protected'|'unverified';scene:ConcertAtmosphereSceneV1030;
 crowdMovementGain:number;crowdPhoneGain:number;crowdLightGain:number;
 hazeGain:number;ambientGain:number;beamGain:number;fillColorBlend:number;
 strength:number;
};
export const ATMOSPHERE_OFF_V1030:Readonly<ConcertAtmospherePlanV1030>=Object.freeze({
 active:false,reason:'protected',scene:'off',crowdMovementGain:1,crowdPhoneGain:1,
 crowdLightGain:1,hazeGain:1,ambientGain:1,beamGain:1,fillColorBlend:0,strength:0,
});
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const smooth=(x:number)=>{const t=clamp(x);return t*t*(3-2*t);};
const allowedSections=new Set(['verse','hook','build','drop','break']);
const allowedIntents=new Set(['portrait','dialogue','ensemble','wide','rise','pulse','breath']);
const off=(reason:'protected'|'unverified'):ConcertAtmospherePlanV1030=>({...ATMOSPHERE_OFF_V1030,reason});
export function planIntelligentConcertAtmosphereV1030(i:ConcertAtmosphereInputV1030):ConcertAtmospherePlanV1030{
 if(!i.enabled||!i.masterEnabled||!i.playing||!i.reactive||i.reducedMotion||
  i.tier==='low'||i.manualCamera||i.manualLighting||i.manualFx||i.seekBlocked||
  i.blackout||i.authoredLanes.length>0)return off('protected');
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
  Math.abs(f.phase*1000-i.positionMs)>75||!allowedSections.has(n.section)||
  n.section!==f.section||!c.intent||!allowedIntents.has(c.intent)||
  !Number.isInteger(i.groupCount)||i.groupCount<1||i.groupCount>4||
  i.strength<0||i.strength>100||i.energy<0||i.energy>1||i.kick<0||i.kick>1||
  i.budget<=0||i.budget>1||i.pressure<0||i.pressure>=.85)return off('unverified');
 if(i.strength===0)return off('protected');
 let scene:ConcertAtmosphereSceneV1030='balanced';
 if(n.section==='break')scene='breath';
 else if(n.section==='build'&&c.intent==='rise')scene='rising';
 else if(n.section==='verse'&&i.vocalFocus&&c.intent==='portrait')scene='intimate';
 else if((c.intent==='dialogue'||c.intent==='ensemble')&&i.groupCount>1)scene='together';
 else if((n.section==='hook'||n.section==='drop')&&i.energy>=.5&&i.kick>=.45&&
   (c.intent==='wide'||c.intent==='pulse'||c.intent==='ensemble'))scene='celebration';
 // Profiles gently shape the existing scene; a verified section alone never
 // creates a kick or claims the audience is actually reacting.
 const levels:Record<Exclude<ConcertAtmosphereSceneV1030,'off'>,
  readonly [number,number,number,number,number,number,number]>={
  intimate:[.67,.62,.69,.76,.79,.82,.036],
  together:[.89,.86,.91,.89,.93,.92,.03],
  rising:[.82,.72,.83,.94,.91,.94,.022],
  celebration:[1,1,1,.96,1,1,.015],
  breath:[.62,.63,.70,.85,.77,.78,.028],
  balanced:[.84,.77,.86,.88,.89,.91,.025],
 };
 let [movement,phones,lights,haze,ambient,beam,fillBlend]=levels[scene];
 // Never compete with lyrics or a close-up vocalist.
 if(i.lyricsProtected||i.lyricsVisible){phones=Math.min(phones,.54);
  lights=Math.min(lights,.72);haze=Math.min(haze,.70);beam=Math.min(beam,.72);}
 const edge=smooth(Math.min(i.positionMs-n.startMs,n.endMs-i.positionMs)/
  Math.min(2000,(n.endMs-n.startMs)*.25));
 const quality=clamp(i.budget)*clamp((.85-i.pressure)/.65)*(i.tier==='balanced'?.7:1);
 const strength=clamp(i.strength/100)*edge*clamp(c.blend)*quality;
 if(strength<.005)return off('protected');
 const gain=(target:number)=>clamp(1-(1-target)*strength);
 return {active:true,reason:'verified',scene,
  crowdMovementGain:gain(movement),crowdPhoneGain:gain(phones),
  crowdLightGain:gain(lights),hazeGain:gain(haze),
  ambientGain:gain(ambient),beamGain:gain(beam),
  fillColorBlend:fillBlend*strength,strength};
}
/** Called after V999: never add instances or revive a disabled audience. */
export function applyConcertAtmosphereCrowdV1030<
 T extends {active:boolean;count:number;movement:number;phoneOpacity:number;lightGain:number}
>(base:T,plan:ConcertAtmospherePlanV1030):T{
 if(!plan.active||!base.active)return base;
 return {...base,movement:base.movement*plan.crowdMovementGain,
  phoneOpacity:base.phoneOpacity*plan.crowdPhoneGain,
  lightGain:base.lightGain*plan.crowdLightGain};
}
/** Only dims an already-authorized beam; never creates additional lights. */
export function applyConcertAtmosphereStageV1030<T extends {beamGain:number}>(
 base:T,plan:ConcertAtmospherePlanV1030):T{
 return plan.active?{...base,beamGain:base.beamGain*plan.beamGain}:base;
}
