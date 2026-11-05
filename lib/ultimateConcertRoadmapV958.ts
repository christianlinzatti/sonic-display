/** V930–V958: conservative, deterministic concert policy layer.
 * No DOM, fetch, timers, LED commands, audio capture or storage side effects in this module.
 * Existing authored shows, manual controls and verified-track gates always win.
 */
import type {GoveeLookV909} from '@/lib/goveeLanV909';
import type {TrackAnalysisV318} from '@/services/musicAnalysis/trackAnalysisV318';
import type {ShowTimelineCueV354,ShowLaneV354} from '@/services/stageContent/showTimelineV354';

export const CONCERT_ROADMAP_KEY_V958='sonic-display:ultimate-concert-v958';
export const CONCERT_ROADMAP_EVENT_V958='sonic-display:ultimate-concert-settings-v958';
export const CONCERT_SIGNAL_EVENT_V933='sonic-display:concert-light-signal-v933';
export type ConcertPhaseV958='verse'|'hook'|'build'|'drop'|'break'|'outro';
export type ConcertGenreV947='deutschrap'|'hardtekk'|'hardstyle'|'deutschrock'|'other';
export type ConcertRoleV935='spotlight'|'rhythm'|'backdrop'|'audience'|'accent';
export type ConcertCameraV940='wide'|'medium'|'close'|'orbit';
export type ConcertDanceV941='solo'|'duet'|'sync'|'mirror';
export type ConcertWallV951='equalizer'|'geometry'|'pulse'|'starfield'|'ribbons';
export type ConcertFxV955='beams'|'lasers'|'sweep'|'bass-impact'|'fog'|'confetti'|'streamers';
export type ConcertTimelineCueV948={atMs:number;phase:ConcertPhaseV958;camera?:ConcertCameraV940;formation?:ConcertDanceV941;effect?:ConcertFxV955};
export type ConcertRoomPresetV936={id:string;name:string;roles:Record<string,ConcertRoleV935>;positions:Record<string,{x:number;y:number}>};
export type ConcertSettingsV958={schema:'ultimate-concert-v958';enabled:boolean;hardwareSync:boolean;virtualFx:boolean;strength:number;
  roleOverrides:Record<string,ConcertRoleV935>;presets:ConcertRoomPresetV936[];timeline:Record<string,ConcertTimelineCueV948[]>;
  transitionsV960:boolean;compactFxV960:boolean;lightGovernorV961:boolean;narrativeV962:boolean};
export const DEFAULT_CONCERT_V958:ConcertSettingsV958={schema:'ultimate-concert-v958',enabled:false,hardwareSync:false,virtualFx:false,
 strength:55,roleOverrides:{},presets:[],timeline:{},transitionsV960:false,compactFxV960:false,lightGovernorV961:false,narrativeV962:false};
export type ConcertInputV958={trackId:string;progressMs:number;durationMs:number;phase:ConcertPhaseV958;
 sectionIndex:number;sectionStartMs:number;verified:boolean;genre:string;energy:number;bass:number;lyricsVisible:boolean;
 reducedMotion:boolean;stageCamera?:ConcertCameraV940;stageFormation?:ConcertDanceV941;authoredStage?:boolean};
export type ConcertSceneV958={id:string;phase:ConcertPhaseV958;verified:boolean;genre:ConcertGenreV947;
 camera:ConcertCameraV940;formation:ConcertDanceV941;wall:ConcertWallV951;palette:[string,string];
 effects:ConcertFxV955[];intensity:number;transition:number;spotlight:number;lightGain:number;
 finale:boolean;reason:string;timelineOverride:boolean};
export type ConcertQualityV957={score:number;repetitions:number;overloaded:number;unsafeCues:number;notes:string[]};
export type ConcertSignalV933={fixture:number;cue:string;phase:ConcertPhaseV958;atMs:number;brightness:number;source:'ultimate-concert-v958'};
const clamp=(v:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,Number.isFinite(v)?v:lo));
const roles:ConcertRoleV935[]=['spotlight','rhythm','backdrop','audience','accent'];
const phases:ConcertPhaseV958[]=['verse','hook','build','drop','break','outro'];
const cameras:ConcertCameraV940[]=['wide','medium','close','orbit'];
const dances:ConcertDanceV941[]=['solo','duet','sync','mirror'];
const effects:ConcertFxV955[]=['beams','lasers','sweep','bass-impact','fog','confetti','streamers'];
const validIP=(s:string)=>/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)\d{1,3}\.\d{1,3}$/.test(s)&&s.split('.').every(o=>Number(o)<=255);
const cleanText=(x:unknown,max=50)=>typeof x==='string'?x.trim().replace(/[<>\u0000-\u001f]/g,'').slice(0,max):'';
export function normalizeConcertRoadmapV958(raw:unknown):ConcertSettingsV958{
 const o=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<ConcertSettingsV958>:{};
 const overrides:Record<string,ConcertRoleV935>={};
 for(const [ip,role] of Object.entries(o.roleOverrides&&typeof o.roleOverrides==='object'&&!Array.isArray(o.roleOverrides)?o.roleOverrides:{}).slice(0,32))
  if(validIP(ip)&&roles.includes(role))overrides[ip]=role;
 const normalizePositions=(x:unknown)=>{const out:Record<string,{x:number;y:number}>={};
  if(x&&typeof x==='object'&&!Array.isArray(x))for(const [ip,p] of Object.entries(x).slice(0,32)){
   if(!validIP(ip)||!p||typeof p!=='object')continue;
   const item=p as {x?:number;y?:number};if(Number.isFinite(item.x)&&Number.isFinite(item.y))out[ip]={x:clamp(item.x!,0,1),y:clamp(item.y!,0,1)};
  }return out;};
 const presets:ConcertRoomPresetV936[]=Array.isArray(o.presets)?o.presets.slice(0,12).flatMap((p,index)=>{
  if(!p||typeof p!=='object')return [];
  const rs:Record<string,ConcertRoleV935>={};for(const [ip,r] of Object.entries(p.roles??{}).slice(0,32))if(validIP(ip)&&roles.includes(r))rs[ip]=r;
  return [{id:cleanText(p.id,64)||`room-${index}`,name:cleanText(p.name,40)||'Raumaufstellung',roles:rs,positions:normalizePositions(p.positions)}];
 }):[];
 const timeline:Record<string,ConcertTimelineCueV948[]>={};
 for(const [trackId,cues] of Object.entries(o.timeline&&typeof o.timeline==='object'&&!Array.isArray(o.timeline)?o.timeline:{}).slice(0,24)){
  if(!/^[\w:.-]{1,160}$/.test(trackId)||!Array.isArray(cues))continue;
  timeline[trackId]=cues.slice(0,128).flatMap(c=>{
   if(!c||typeof c!=='object'||!Number.isFinite(c.atMs)||c.atMs<0||c.atMs>86400000||!phases.includes(c.phase))return [];
   return [{atMs:Math.round(c.atMs),phase:c.phase,
    ...(c.camera&&cameras.includes(c.camera)?{camera:c.camera}:{}),
    ...(c.formation&&dances.includes(c.formation)?{formation:c.formation}:{}),
    ...(c.effect&&effects.includes(c.effect)?{effect:c.effect}:{})}];
  }).sort((a,b)=>a.atMs-b.atMs);
 }
 return {schema:'ultimate-concert-v958',enabled:o.enabled===true,hardwareSync:o.hardwareSync===true,
  virtualFx:o.virtualFx===true,strength:Math.round(clamp(Number(o.strength??55),0,100)),roleOverrides:overrides,presets,timeline,
  transitionsV960:o.transitionsV960===true,compactFxV960:o.compactFxV960===true,lightGovernorV961:o.lightGovernorV961===true,
  narrativeV962:o.narrativeV962===true};
}
export function loadConcertRoadmapV958():ConcertSettingsV958{
 if(typeof window==='undefined')return normalizeConcertRoadmapV958(null);
 try{return normalizeConcertRoadmapV958(JSON.parse(localStorage.getItem(CONCERT_ROADMAP_KEY_V958)||'null'));}
 catch{return normalizeConcertRoadmapV958(null);}
}
export function saveConcertRoadmapV958(settings:ConcertSettingsV958):void{
 if(typeof window==='undefined')return;
 window.localStorage.setItem(CONCERT_ROADMAP_KEY_V958,JSON.stringify(normalizeConcertRoadmapV958(settings)));
 window.dispatchEvent(new Event(CONCERT_ROADMAP_EVENT_V958));
}
/** V930: exponential, bounded and deterministic backoff, calculated in an existing polling loop. */
export function recoveryDelayV930(consecutiveFailures:number,deviceOrdinal=0):number{
 const failures=Math.floor(clamp(consecutiveFailures,1,12));
 return Math.min(60000,2500*2**Math.min(4,failures-1))+Math.floor(clamp(deviceOrdinal,0,31))*17;
}
/** V932: network diagnostic and user-observed optical lag are deliberately independent. */
export function latencyAnalysisV932(opticalMs:number,roundtripMs:number|null){
 const optical=Math.round(clamp(opticalMs,0,500));const network=roundtripMs===null?null:Math.round(clamp(roundtripMs,0,3000));
 return {opticalMs:optical,diagnosticRoundtripMs:network,
  suggestion:optical>300?'Manuell gemessene Sichtverzögerung prüfen':'Optischen Versatz bei Bedarf manuell messen',
  autoCalibrated:false,roundtripIsOptical:false};
}
/** V934: simulated fallback only; never dispatches a lamp power or override command. */
export function safeFallbackV934(base:GoveeLookV909):GoveeLookV909{
 return {color:{r:Math.round(base.color.r*.5+36),g:Math.round(base.color.g*.5+36),b:Math.round(base.color.b*.5+38)},
  brightness:Math.round(clamp(base.brightness,1,40))};
}
export function genreConcertV947(genre:string):ConcertGenreV947{
 const g=String(genre||'').toLowerCase();
 return /hardtekk|hardtek/.test(g)?'hardtekk':/hardstyle|rawstyle/.test(g)?'hardstyle':
  /deutschrock|metal|industrial|ndh|rock/.test(g)?'deutschrock':/rap|hip.?hop|trap|drill/.test(g)?'deutschrap':'other';
}
const colorSets:Record<ConcertGenreV947,[string,string]>={deutschrap:['#bd2249','#4436a8'],hardtekk:['#00baff','#e12cc9'],
 hardstyle:['#ff641a','#6624e8'],deutschrock:['#ec901b','#bf263c'],other:['#40accb','#9464c7']};
const seed=(s:string)=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0;};
/** V939/V940/V941/V942/V943/V944/V945/V946/V947/V948/V949–V958.
 * Section index and progress provide stable variety: identical hooks use different shots.
 * Unverified phases can be rehearsed but are not eligible for physical-device updates.
 */
export function composeConcertSceneV958(input:ConcertInputV958,settings:ConcertSettingsV958):ConcertSceneV958{
 const s=normalizeConcertRoadmapV958(settings);const phase=phases.includes(input.phase)?input.phase:'verse';
 const genre=genreConcertV947(input.genre),index=Math.max(0,Math.floor(clamp(input.sectionIndex,0,10000)));
 const key=`${input.trackId}|${index}|${phase}`;const h=seed(key),isHook=phase==='hook',isDrop=phase==='drop';
 const finale=Boolean(input.verified&&input.durationMs>0&&input.progressMs>=input.durationMs-7000);
 const override=s.timeline[input.trackId]?.filter(x=>x.atMs<=input.progressMs).at(-1);
 // V945: vary even repeated hooks by section index, never fixed camera/formation for all hooks.
 const camera:ConcertCameraV940=override?.camera??cameras[(h+index+Math.floor(index/2))%cameras.length];
 const formation:ConcertDanceV941=override?.formation??dances[(Math.floor(h/7)+index+Math.floor(index/3))%dances.length];
 const wall:ConcertWallV951=(['equalizer','geometry','pulse','starfield','ribbons'] as ConcertWallV951[])[(h+index)%5];
 const base=phase==='verse'?.46:phase==='hook'?.77:phase==='build'?.65:phase==='drop'?.94:phase==='break'?.27:.36;
 const curve=.91+.09*Math.sin(Math.PI*clamp(input.progressMs/Math.max(1,input.durationMs),0,1));
 const intensity=clamp((base*.72+clamp(input.energy,0,1)*.28)*curve+(finale?.11:0),.12,.97);
 const edge=clamp((input.progressMs-input.sectionStartMs)/1600,0,1);
 const transition=edge*edge*(3-2*edge); // V944: ease on phase boundaries
 const shot=input.authoredStage&&input.stageCamera?input.stageCamera:camera;
 const dance=input.authoredStage&&input.stageFormation?input.stageFormation:formation;
 const spotlight=clamp((dance==='solo'?.88:dance==='duet'?.7:.45)*(input.lyricsVisible?.80:1),.1,1);
 const lightGain=clamp((shot==='close'?.75:shot==='wide'?1.07:1)*(input.lyricsVisible?.82:1),.45,1.1);
 const fx:ConcertFxV955[]=[];
 // Effects are virtual and bounded; no physical strobe, flashing laser or hardware laser commands.
 if(intensity>.36)fx.push('beams');
 if(!input.reducedMotion&&genre!=='deutschrap'&&(isHook||isDrop)&&input.verified)fx.push('lasers');
 if(!input.reducedMotion&&isHook)fx.push('sweep');
 if(!input.reducedMotion&&isDrop&&input.verified&&input.bass>.35)fx.push('bass-impact');
 if(!input.reducedMotion&&(phase==='break'||phase==='verse'))fx.push('fog');
 if(!input.reducedMotion&&finale)fx.push('confetti','streamers');
 if(override?.effect&&!input.reducedMotion&&!fx.includes(override.effect))fx.push(override.effect);
 // V957: cap simultaneous FX to prevent overload and protect low-end devices.
 const finalFx=fx.slice(0,3);
 return {id:key,phase,verified:input.verified,genre,camera:shot,formation:dance,wall,palette:colorSets[genre],
  effects:finalFx,intensity,transition,spotlight,lightGain,finale,
  timelineOverride:!!override,reason:input.verified?'Bestätigte Songphase aus V318':'Nur Vorschau – keine bestätigte Songphase'};
}
/** V937: conservative priority mixer; saved shows and authored cues are never replaced. */
export function mixConcertRoomLookV937(base:GoveeLookV909,scene:ConcertSceneV958,role:ConcertRoleV935,
 settings:ConcertSettingsV958,options:{savedShowActive:boolean;authoredStageActive:boolean}):GoveeLookV909{
 if(!settings.enabled||!settings.hardwareSync||!scene.verified||options.savedShowActive||options.authoredStageActive)return base;
 const roleWeight:Record<ConcertRoleV935,number>={spotlight:.7,rhythm:.85,backdrop:.65,audience:.45,accent:.6};
 const strength=clamp(settings.strength,0,100)/100*roleWeight[role];
 const target=scene.palette[role==='backdrop'||role==='audience'?1:0];const n=parseInt(target.slice(1),16);
 const targetRgb=[(n>>16)&255,(n>>8)&255,n&255];
 const colorMix=.20*strength*scene.transition;
 return {color:{r:Math.round(base.color.r*(1-colorMix)+targetRgb[0]*colorMix),
  g:Math.round(base.color.g*(1-colorMix)+targetRgb[1]*colorMix),b:Math.round(base.color.b*(1-colorMix)+targetRgb[2]*colorMix)},
  brightness:Math.round(clamp(base.brightness+(scene.intensity-.5)*12*strength*scene.lightGain*scene.transition,
   Math.max(1,base.brightness-8),Math.min(100,base.brightness+8)))};
}
export function qualityConcertV957(scenes:readonly ConcertSceneV958[]):ConcertQualityV957{
 let repetitions=0,overloaded=0,unsafeCues=0;
 for(let i=0;i<scenes.length;i++){
  const s=scenes[i];if(s.effects.length>3)overloaded++;
  if(!s.verified&&s.effects.some(f=>['bass-impact','confetti','lasers'].includes(f)))unsafeCues++;
  if(i&&scenes[i-1].camera===s.camera&&scenes[i-1].formation===s.formation&&scenes[i-1].wall===s.wall)repetitions++;
 }
 return {score:Math.round(clamp(100-repetitions*9-overloaded*12-unsafeCues*18,0,100)),repetitions,overloaded,unsafeCues,
  notes:[...(repetitions?['Ähnliche aufeinanderfolgende Szenen erkannt']:[]),
   ...(overloaded?['Zu viele simultane Effekte']:[]),...(unsafeCues?['Nicht bestätigte Abschnitts-Cues für Höhepunkte']:[]),
   ...(!scenes.length?['Keine auswertbaren Szenen']:[])]};
}
/** V938: isolated rehearsal; the result is not sent to any fixture. */
export function rehearseConcertV938(trackId:string,durationMs:number,genre:string,settings:ConcertSettingsV958){
 const duration=clamp(durationMs,30000,3600000),sectionDuration=duration/12;
 const sections:ConcertSceneV958[]=Array.from({length:12},(_,i)=>{
  const phase:ConcertPhaseV958=(['verse','verse','hook','verse','hook','build','drop','break','verse','hook','drop','outro'] as ConcertPhaseV958[])[i];
  return composeConcertSceneV958({trackId,progressMs:i===11?duration-3000:i*sectionDuration,durationMs:duration,phase,
   sectionIndex:i,sectionStartMs:i*sectionDuration,verified:true,genre,energy:.4+(i%4)*.14,bass:.6,
   lyricsVisible:i%3===1,reducedMotion:false},settings);
 });
 return {schema:'concert-rehearsal-v938',synthetic:true,scenes:sections,quality:qualityConcertV957(sections)};
}
export function resolveConcertRoleV935(ip:string,settings:ConcertSettingsV958,legacyRole:string):ConcertRoleV935{
 if(settings.roleOverrides[ip])return settings.roleOverrides[ip];
 return legacyRole==='rhythm'?'rhythm':legacyRole==='wall'?'backdrop':legacyRole==='ambient'?'audience':legacyRole==='neon'?'accent':'spotlight';
}
export function upsertRoomPresetV936(settings:ConcertSettingsV958,preset:ConcertRoomPresetV936):ConcertSettingsV958{
 return normalizeConcertRoadmapV958({...settings,presets:[...settings.presets.filter(p=>p.id!==preset.id),preset].slice(-12)});
}

/** V939–V948 automatic R3F stage adapter: authorial V354 scores and explicit
 * manual multi-avatar/duet decisions always win. Only verified V318 scenes
 * may change the existing automatic V354 camera/dance cues. No new controller.
 */
export function overlayConcertStageV958(base:ShowTimelineCueV354,scene:ConcertSceneV958|null,
 options:{enabled:boolean;authored:boolean;manualFormation:boolean}):ShowTimelineCueV354{
 if(!scene||!scene.verified||!options.enabled||options.authored||options.manualFormation)return base;
 const lanes:ShowLaneV354[]=[...new Set([...base.activeLanes,'camera','dance'] as ShowLaneV354[])];
 return {...base,active:true,activeLanes:lanes,cameraShot:scene.camera,danceFormation:scene.formation};
}

/** V957: truthful analysis of user-imported V318 sections, not an invented song map.
 * Uses the exact same verified high-confidence markers as live concert mode.
 */
export function qualityImportedConcertV957(analysis:TrackAnalysisV318|null|undefined,
 genre:string,settings:ConcertSettingsV958){
 if(!analysis||!analysis.trackId||!Number.isFinite(analysis.durationMs)||analysis.durationMs<=0)
  return {available:false,scenes:[] as ConcertSceneV958[],quality:qualityConcertV957([])};
 const scenes:ConcertSceneV958[]=[];
 for(const [index,section] of analysis.sections.slice(0,160).entries()){
  if(!section.label||!['verse','hook','build','drop','break'].includes(section.label)||
    !Number.isFinite(section.startMs)||!Number.isFinite(section.durationMs)||
    section.startMs<0||section.durationMs<=0||section.confidence<.5||
    section.startMs+section.durationMs>analysis.durationMs+1000)continue;
  const progressMs=Math.min(analysis.durationMs-1,section.startMs+Math.max(1,Math.floor(section.durationMs/2)));
  scenes.push(composeConcertSceneV958({trackId:analysis.trackId,progressMs,durationMs:analysis.durationMs,
   phase:section.label,sectionIndex:index,sectionStartMs:section.startMs,verified:true,
   genre,energy:.5,bass:0,lyricsVisible:false,reducedMotion:false},settings));
 }
 return {available:scenes.length>0,scenes,quality:qualityConcertV957(scenes)};
}
