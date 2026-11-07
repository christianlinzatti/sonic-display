/** V1042 · Optional four-zone show-designer -> Govee overlay.
 * Pure, local and bounded. Never sends commands, creates timers, turns lamps on,
 * invents a downbeat, or bypasses V909/V915/V961/manual authority.
 */
import type {ArenaShowCueV1040} from './arena360ShowDesignerV1040';
import type {HologramGenreV1039} from './arena360HolographyV1039';
import {GOVEE_ZONES_V1027,normalizeGoveeSyncV1027,
 type GoveeSyncSettingsV1027,type GoveeZoneV1027,
 type GoveeLookV1027,type GoveePhaseCueV1027} from './goveeConcertSyncV1027';
export type GoveeShowDecisionV1042={active:boolean;reason:string;zone:GoveeZoneV1027|null;
 phase:string;mix:number;brightnessFactor:number;accent:{r:number;g:number;b:number}};
const OFF=(reason:string):GoveeShowDecisionV1042=>({active:false,reason,zone:null,phase:'ambient',mix:0,
 brightnessFactor:1,accent:{r:0,g:0,b:0}});
const clamp=(v:number,lo:number,hi:number)=>Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):lo;
const PAL:{[G in HologramGenreV1039]:readonly [number,number,number]}={
 rap:[75,80,185],hard:[40,215,230],rock:[235,115,45],pop:[190,90,220]
};
const ZONE_WEIGHT:Record<GoveeZoneV1027,number>={wall:.92,rhythm:1,neon:.85,ambient:.72};
export function planGoveeShowV1042(input:{enabled:boolean;strength:number;show:ArenaShowCueV1040|null;
 genre:HologramGenreV1039;phase:GoveePhaseCueV1027;settings:GoveeSyncSettingsV1027;
 ip:string;selectedIps:readonly string[];bridgeEnabled:boolean;autoSync:boolean;directorEnabled:boolean;
 playing:boolean;visible:boolean;stageIsArena:boolean;reducedMotion?:boolean;
 manualOverride?:boolean;savedShowActive?:boolean;authoredStageActive?:boolean;
 groupUnisonActive?:boolean;recovering?:boolean;voiceActive?:boolean;roomAtmosphereActive?:boolean;
 higherPrioritySyncActive?:boolean}):GoveeShowDecisionV1042{
 if(!input.enabled||!input.bridgeEnabled||!input.autoSync||!input.directorEnabled)
  return OFF('Separate Show-Govee-Freigabe oder bestehender LAN-Autosync fehlt');
 if(!input.playing||!input.visible||!input.stageIsArena||input.reducedMotion||
  input.manualOverride||input.savedShowActive||input.authoredStageActive||
  input.groupUnisonActive||input.recovering||input.voiceActive||
  input.roomAtmosphereActive||input.higherPrioritySyncActive)
  return OFF('Manuelle oder höher priorisierte Lichtregie, Pause oder Schutzmodus hat Vorrang');
 if(!input.show?.active||input.show.scene===null||!Number.isFinite(input.show.intensity)||
  input.show.intensity<=0||!Number.isFinite(input.show.fade)||input.show.fade<=0||input.show.fade>1)
  return OFF('Kein aktiver, gültiger V1040-Showplan');
 // The seven scenes are authored templates, not detected sections. Never infer a drop.
 const phase=input.phase;
 if(!phase?.verified||!['verse','hook','build','drop','break'].includes(phase.phase)||
  !Number.isFinite(phase.transition)||phase.transition<0||phase.transition>1)
  return OFF('Keine bestätigte V318-Musikphase');
 if(!['rap','hard','rock','pop'].includes(input.genre))return OFF('Musikrichtung ungültig');
 const safe=normalizeGoveeSyncV1027(input.settings);
 if(!Array.isArray(input.selectedIps)||input.selectedIps.length<1||input.selectedIps.length>4||
  new Set(input.selectedIps).size!==input.selectedIps.length||
  !input.selectedIps.includes(input.ip))return OFF('Nur maximal vier ausgewählte LAN-Leuchten');
 const zone=GOVEE_ZONES_V1027.find(z=>safe.fixtureIps[z]===input.ip);
 if(!zone)return OFF('Keine zugeordnete Govee-Zone');
 const strength=clamp(input.strength,0,65)/100;
 if(strength<=0)return OFF('Lichtregie ist auf 0 % gestellt');
 const intensity=clamp(input.show.intensity,0,100)/100;
 const sceneFactor=input.show.scene==='intro'?.43:input.show.scene==='interlude'?.38:
  input.show.scene==='build'?.64:input.show.scene==='finale'?.78:input.show.scene==='hook'?.84:.55;
 // A planned finale only gets a limited accent unless the actual V318 phase is drop.
 const confirmedPeak=phase.phase==='drop';
 const peakGate=input.show.scene==='finale'&&!confirmedPeak?.7:1;
 const progress=clamp(input.show.fade,0,1)*clamp(phase.transition,0,1);
 const mix=clamp(strength*intensity*sceneFactor*ZONE_WEIGHT[zone]*peakGate*(.3+.7*progress)*.16,0,.08);
 const attenuation=clamp(1-(strength*sceneFactor*ZONE_WEIGHT[zone]*(.05+.1*intensity)),.88,1);
 const [r,g,b]=PAL[input.genre];
 const accent={r:clamp(Math.round(r+(zone==='rhythm'?12:0)),0,255),
  g:clamp(Math.round(g+(zone==='wall'?-16:0)),0,255),
  b:clamp(Math.round(b+(zone==='ambient'?-25:0)),0,255)};
 return {active:true,reason:'V1040-Showplan plus bestätigte V318-Phase · vorhandener Govee-Takt',
  zone,phase:phase.phase,mix,brightnessFactor:attenuation,accent};
}
/** Keep all previous caps. Never increase commanded brightness even during crossfades.
 * Per-tick color delta is limited; outgoing V961 governor may restrict it further.
 */
export function applyGoveeShowV1042(look:GoveeLookV1027,previous:GoveeLookV1027|undefined,
 decision:GoveeShowDecisionV1042,masterCap:number):GoveeLookV1027{
 if(!decision.active||!Number.isFinite(masterCap)||masterCap<0||masterCap>100||
  !Number.isFinite(look?.brightness)||look.brightness<0||look.brightness>100||
  !['r','g','b'].every(k=>Number.isFinite(look?.color?.[k as keyof GoveeLookV1027['color']]))||
  !Number.isFinite(decision.mix)||decision.mix<0||decision.mix>.08||
  !Number.isFinite(decision.brightnessFactor)||decision.brightnessFactor<.88||decision.brightnessFactor>1||
  !['r','g','b'].every(k=>Number.isFinite(decision.accent?.[k as keyof GoveeLookV1027['color']])&&
   decision.accent[k as keyof GoveeLookV1027['color']]>=0&&decision.accent[k as keyof GoveeLookV1027['color']]<=255))return look;
 const brightness=Math.max(0,Math.min(Math.floor(look.brightness*decision.brightnessFactor),
  Math.floor(look.brightness),Math.floor(masterCap)));
 const color={r:0,g:0,b:0};
 for(const key of ['r','g','b'] as const){
  const now=clamp(Math.round(look.color[key]),0,255);
  const wanted=Math.round(now*(1-decision.mix)+decision.accent[key]*decision.mix);
  const prior=previous?.color&&Number.isFinite(previous.color[key])?clamp(previous.color[key],0,255):now;
  color[key]=Math.round(clamp(wanted,prior-12,prior+12));
 }
 return {brightness,color};
}
