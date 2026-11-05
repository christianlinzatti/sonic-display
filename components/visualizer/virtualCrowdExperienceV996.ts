/** V996 – Virtual Crowd Experience: an opt-in, strictly virtual audience overlay.
 * Reads only song-scoped verified V604 scenes and the V825-governed V815 crowd.
 * No devices, microphone, new crowd rigs, external AI, timers, or beat inventions.
 */
import type {VirtualCrowdCueV815} from './virtualConcertCrowdPlannerV815';
import type {ArenaCrowdPlanV893} from './arenaCrowdAtmosphereV893';
import type {ConcertFxCueV810} from './concertFxStudioV810';

export const CROWD_EXPERIENCE_KEY_V996='sonic.v996.virtual-crowd';
export type CrowdExperienceStyleV996='subtle'|'festival'|'arena';
export type CrowdExperienceSettingsV996=Readonly<{
 enabled:boolean;style:CrowdExperienceStyleV996;intensity:number;
 glowsticks:boolean;waves:boolean;reactions:boolean;protectLyrics:boolean;
}>;
export const DEFAULT_CROWD_EXPERIENCE_V996:CrowdExperienceSettingsV996=Object.freeze({
 enabled:false,style:'subtle',intensity:55,glowsticks:true,waves:true,
 reactions:true,protectLyrics:true,
});
const styles:readonly CrowdExperienceStyleV996[]=['subtle','festival','arena'];
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const unit=(n:number)=>Math.min(1,Math.max(0,n));
export function normalizeCrowdExperienceV996(raw:unknown):CrowdExperienceSettingsV996 {
 const r=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<CrowdExperienceSettingsV996>:{};
 const flag=(k:'enabled'|'glowsticks'|'waves'|'reactions'|'protectLyrics')=>
  typeof r[k]==='boolean'?r[k] as boolean:DEFAULT_CROWD_EXPERIENCE_V996[k];
 return {enabled:flag('enabled'),style:styles.includes(r.style as CrowdExperienceStyleV996)?r.style as CrowdExperienceStyleV996:'subtle',
  intensity:finite(r.intensity)?Math.round(Math.max(0,Math.min(100,r.intensity))):55,
  glowsticks:flag('glowsticks'),waves:flag('waves'),reactions:flag('reactions'),protectLyrics:flag('protectLyrics')};
}
export type CrowdExperienceCueV996=VirtualCrowdCueV815&Readonly<{
 crowdActiveV996:boolean;crowdModeV996:'off'|'calm'|'groove'|'wave'|'celebration';
 crowdWaveV996:number;crowdReactionV996:number;crowdGlowV996:number;
 crowdSticksV996:number;crowdPhaseV996:number;
}>;
export const CROWD_OFF_V996:Readonly<Pick<CrowdExperienceCueV996,
 'crowdActiveV996'|'crowdModeV996'|'crowdWaveV996'|'crowdReactionV996'|'crowdGlowV996'|'crowdSticksV996'|'crowdPhaseV996'>>=Object.freeze({
 crowdActiveV996:false,crowdModeV996:'off',crowdWaveV996:0,crowdReactionV996:0,
 crowdGlowV996:0,crowdSticksV996:0,crowdPhaseV996:0,
});
export type CrowdExperienceInputV996=Readonly<{
 base:VirtualCrowdCueV815;plan?:ArenaCrowdPlanV893|null;fx:ConcertFxCueV810;
 settings?:CrowdExperienceSettingsV996;trackId:string;durationMs:number;positionMs:number;
 playing:boolean;autoEnabled:boolean;tier:'low'|'balanced'|'high';
 reducedMotion:boolean;seekBlocked:boolean;blackout:boolean;manualLighting:boolean;
 manualFx:boolean;manualCamera:boolean;lyricsProtected:boolean;vocalFocus:boolean;
 energy:number;kick:number;
}>;
const sceneGains:Readonly<Record<string,number>>={
 intro:.16,verse:.36,hook:.80,build:.61,drop:1,break:.12,finale:.94,outro:.10,
};
/** Results can only add decorative motion/opacity to an already authorised crowd.
 * Never changes base count, head visibility, phone permissions or show timelines.
 */
export function planCrowdExperienceV996(i:CrowdExperienceInputV996):CrowdExperienceCueV996 {
 const b=i.base,s=normalizeCrowdExperienceV996(i.settings),p=i.plan;
 const off=():CrowdExperienceCueV996=>({...b,...CROWD_OFF_V996});
 if(!s.enabled||s.intensity<=0||!i.playing||!i.autoEnabled||i.tier==='low'||
  i.reducedMotion||i.seekBlocked||i.blackout||i.manualLighting||i.manualFx||i.manualCamera||
  (s.protectLyrics&&(i.lyricsProtected||i.vocalFocus))||
  !b.active||!Number.isInteger(b.count)||b.count<2||b.count>72||
  !i.fx.active||i.fx.reason!=='music'||!p||p.source!=='verified-v604'||
  !i.trackId||p.trackId!==i.trackId||p.durationMs!==i.durationMs||
  ![i.positionMs,i.durationMs,i.energy,i.kick,b.phase,b.movement,b.lightGain,b.phoneOpacity].every(finite)||
  i.durationMs<10000||i.durationMs>1800000||i.positionMs<0||i.positionMs>=i.durationMs||
  i.energy<0||i.energy>1||i.kick<0||i.kick>1)return off();
 const scene=p.scenes.find(sc=>
  finite(sc.startMs)&&finite(sc.endMs)&&sc.startMs>=0&&sc.endMs<=i.durationMs&&
  sc.endMs>sc.startMs&&i.positionMs>=sc.startMs&&i.positionMs<sc.endMs);
 if(!scene||!(scene.section in sceneGains)||scene.section!==i.fx.section)return off();
 const age=i.positionMs-scene.startMs;
 const fade=unit(age/1000)*unit((scene.endMs-i.positionMs)/900);
 const style=s.style==='subtle'?.55:s.style==='festival'?.84:1;
 const rhythm=.70+.18*i.energy+.12*i.kick;
 const gain=unit(s.intensity/100)*style*sceneGains[scene.section]*fade*rhythm*(i.tier==='balanced'?.6:1);
 if(gain<.002)return off();
 const celebration=scene.section==='drop'||scene.section==='finale'||scene.section==='hook';
 const mode=scene.section==='build'?'wave':celebration?'celebration':scene.section==='verse'?'groove':'calm';
 // No fake beat: reaction only if a measured kick is present. No full-screen flashes.
 const reaction=s.reactions&&celebration&&i.kick>=.35?Math.min(.03,gain*i.kick*.03):0;
 const wave=s.waves&&b.movement>.001?Math.min(.035,gain*.035):0;
 // New instanced sticks are a separate low-contrast overlay, not independent lamps.
 const sticks=s.glowsticks&&b.lightGain>.001?Math.min(i.tier==='balanced'?12:24,Math.floor(b.count/2)):0;
 const glow=sticks>0?Math.min(.32,gain*.32):0;
 return {...b,crowdActiveV996:true,crowdModeV996:mode,
  crowdWaveV996:wave,crowdReactionV996:reaction,crowdGlowV996:glow,
  crowdSticksV996:sticks,crowdPhaseV996:Math.min(1e7,age/1000)};
}
