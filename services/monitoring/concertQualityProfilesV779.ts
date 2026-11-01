/** V779: reproducible, evidence-only quality profiles for the REAL V777 GLB fixture.
 * The profiles deliberately do not claim mesh/triangle LOD: avatarStride throttles
 * skeleton + mouth animation updates while preserving elapsed animation time.
 * This is NOT an automatic Spotify show optimizer or hardware certification. */
import type {ConcertReportV777,ConcertSceneV777} from './concertBenchmarkV777';

export type QualityProfileIdV779='cinematic'|'balanced'|'economy';
export type TargetFpsV779=30|45|60;
export type AvatarCountV779=2|4;
export const QUALITY_PROFILE_IDS_V779=['cinematic','balanced','economy'] as const;
export type ConcertProfileV779={label:string;stageStrength:number;stageReactive:boolean;stageReducedMotion:boolean;
  danceFx:{enabled:boolean;strength:number;shockwaves:boolean;footprints:boolean;trails:boolean};animationStride:number};
export const QUALITY_PROFILES_V779:Record<QualityProfileIdV779,ConcertProfileV779>={
 cinematic:{label:'Cinematic – volle Konzertoptik',stageStrength:72,stageReactive:true,stageReducedMotion:false,
   danceFx:{enabled:true,strength:80,shockwaves:true,footprints:true,trails:true},animationStride:1},
 balanced:{label:'Balanced – reduzierte Zusatz-FX',stageStrength:52,stageReactive:true,stageReducedMotion:false,
   danceFx:{enabled:true,strength:55,shockwaves:true,footprints:false,trails:true},animationStride:2},
 economy:{label:'Economy – Fokus auf Darsteller und Lyrics',stageStrength:30,stageReactive:false,stageReducedMotion:true,
   danceFx:{enabled:false,strength:0,shockwaves:false,footprints:false,trails:false},animationStride:3},
};
export function resolveConcertProfileV779(value:unknown):QualityProfileIdV779{
 if(value===null||value===undefined||value==='')return 'cinematic';
 if(QUALITY_PROFILE_IDS_V779.includes(value as QualityProfileIdV779))return value as QualityProfileIdV779;
 throw Error('Ungültiges V779-Qualitätsprofil');
}
/** Counterbalances shader/cache warming and clock drift across the repeat rounds. */
export function plannedProfileOrderV779(rounds:number):QualityProfileIdV779[]{
 if(!Number.isInteger(rounds)||rounds<2||rounds>6)throw Error('2–6 komplette Messrunden erforderlich');
 const result:QualityProfileIdV779[]=[];
 for(let i=0;i<rounds;i++)result.push(...(i%2===0?QUALITY_PROFILE_IDS_V779:[...QUALITY_PROFILE_IDS_V779].reverse()));
 return result;
}
export type ProfileRunV779={status:'ok'|'blocked';profileV779:QualityProfileIdV779;report?:ConcertReportV777;message?:string;browser?:{hidden:boolean;canvasCount:number}};
export type ProfileRowV779={profile:QualityProfileIdV779;avatars:AvatarCountV779;stage:string;
 minFps:number;worstP95Ms:number;medianFps:number;medianP95Ms:number;medianCalls:number;passed:boolean;unstable:boolean};
export type ProfileSweepV779={format:'sonic-quality-sweep-v779';version:1;status:'ready'|'blocked';issues:string[];
 targetFps:TargetFpsV779;targetAvatars:AvatarCountV779;rounds:number;recommendedProfile:QualityProfileIdV779|null;
 twoAvatarAlternative:QualityProfileIdV779|null;rows:ProfileRowV779[];renderer:string|null;assetsMode:'reference'|'user-glb'|null;
 notes:string[]};
const SCENES=['cyberpunk','rock','galaxy'] as const;
const counts=[2,4] as const;
const finite=(n:unknown,min:number,max:number)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
function valid(report:unknown):report is ConcertReportV777{
 const r=report as ConcertReportV777;
 if(!r||r.format!=='sonic-concert-benchmark-v777'||r.version!==1||!r.environment||!r.config||!r.assets||!Array.isArray(r.scenes))return false;
 if(typeof r.environment.userAgent!=='string'||!r.environment.userAgent||typeof r.environment.renderer!=='string'||!r.environment.renderer||
   !/^\d+x\d+$/.test(r.environment.viewport)||!finite(r.environment.dpr,.5,4)||typeof r.environment.antialias!=='boolean'||typeof r.environment.softwareRenderer!=='boolean')return false;
 if(r.config.interpolationV782!==undefined||r.config.fixtureId!=='v777-stages-glb-dance-lips-lyrics-fx-v1'||
   JSON.stringify(r.config.stages)!==JSON.stringify(SCENES)||JSON.stringify(r.config.counts)!==JSON.stringify(counts)||
   !finite(r.config.passes,1,4)||!finite(r.config.warmupFrames,45,240)||!finite(r.config.sampleFrames,90,600)||
   r.config.audioMode!=='deterministic-synthetic-beat-v1'||r.config.lyricsMode!=='synthetic-3d-text-v1'||r.config.lipMode!=='named-morph-v1')return false;
 const a=r.assets;
 if(!['reference','user-glb'].includes(a.mode)||!Array.isArray(a.hashes)||a.hashes.length<1||a.hashes.length>2||
   !a.hashes.every(x=>typeof x==='string'&&/^[a-f0-9]{64}$/i.test(x))||!Array.isArray(a.bytes)||a.bytes.length!==a.hashes.length||!a.bytes.every(x=>finite(x,1,2e9))||
   !finite(a.animations,1,10000)||!finite(a.skinnedMeshes,1,10000)||!finite(a.mouthMorphs,1,10000))return false;
 if(r.scenes.length!==6||new Set(r.scenes.map(s=>s?.id)).size!==6)return false;
 return counts.every(avatarCount=>SCENES.every(stage=>{
  const s=r.scenes.find(c=>c.id===`${stage}-${avatarCount}glb`);
  return !!s&&s.stage===stage&&s.avatarCount===avatarCount&&finite(s.frames,60,10000)&&
   finite(s.fps,.1,1000)&&finite(s.p95Ms,.01,5000)&&finite(s.avgCalls,.01,1e6)&&
   finite(s.avgTriangles,0,1e12)&&finite(s.maxGeometries,0,1e7)&&finite(s.maxTextures,0,1e7)&&
   (s.maxPrograms===null||finite(s.maxPrograms,0,1e7));
 }));
}
function midpoint(numbers:readonly number[]){const s=[...numbers].sort((a,b)=>a-b);const i=Math.floor(s.length/2);return s.length%2?s[i]:(s[i-1]+s[i])/2}
const rnd=(x:number)=>Math.round(x*100)/100;
const blocked=(issues:string[],fps:TargetFpsV779,avatars:AvatarCountV779,rounds:number):ProfileSweepV779=>({
 format:'sonic-quality-sweep-v779',version:1,status:'blocked',issues,targetFps:fps,targetAvatars:avatars,rounds,
 recommendedProfile:null,twoAvatarAlternative:null,rows:[],renderer:null,assetsMode:null,
 notes:['Keine Hardware- oder Performanceaussage ohne vollständige echte Browsermessungen.']});

/** Strict evidence gate. Even one failed, missing, software, mismatched, or unstable run
 * blocks a strong recommendation. Differences across different profiles are intentional;
 * hardware, GLBs, resolution and measurement settings must match exactly. */
export function assessProfileSweepV779(input:unknown,targetFps:TargetFpsV779=60,targetAvatars:AvatarCountV779=4):ProfileSweepV779{
 const raw=Array.isArray(input)?input:[];
 const rounds=raw.length/3;
 if(![30,45,60].includes(targetFps)||![2,4].includes(targetAvatars))return blocked(['Ungültiges FPS-Ziel oder Darstellerzahl.'],60,4,0);
 const issues:string[]=[];
 if(!Number.isInteger(rounds)||rounds<2||rounds>6)issues.push('Es werden zwei bis sechs komplette Profilrunden benötigt.');
 const expected=Number.isInteger(rounds)&&rounds>=2&&rounds<=6?plannedProfileOrderV779(rounds):[];
 const runs=raw as ProfileRunV779[];
 for(let i=0;i<runs.length;i++){
  const r=runs[i];
  if(!r||r.status!=='ok'||r.profileV779!==expected[i]||!valid(r.report)||r.report?.config?.profileV779!==expected[i])issues.push(`Messung ${i+1} unvollständig, fehlerhaft oder in falscher Reihenfolge.`);
  if(r?.browser&&(r.browser.hidden||r.browser.canvasCount!==1))issues.push(`Messung ${i+1}: Browserfenster nicht sichtbar oder zusätzliche Canvas.`);
 }
 if(issues.length)return blocked(issues,targetFps,targetAvatars,rounds);
 const first=runs[0].report!;
 if(first.environment.softwareRenderer)issues.push('Software-/SwiftShader-Rendering kann keine Hardware-Qualitätswahl belegen.');
 for(let i=1;i<runs.length;i++){
  const r=runs[i].report!;
  for(const key of ['renderer','userAgent','viewport','dpr','antialias','softwareRenderer'] as const)
   if(r.environment[key]!==first.environment[key])issues.push(`Umgebung weicht ab (${key}) in Messung ${i+1}.`);
  for(const key of ['fixtureId','stages','counts','passes','warmupFrames','sampleFrames','audioMode','lyricsMode','lipMode'] as const)
   if(JSON.stringify(r.config[key])!==JSON.stringify(first.config[key]))issues.push(`Testablauf weicht ab (${key}) in Messung ${i+1}.`);
  for(const key of ['hashes','bytes','animations','skinnedMeshes','mouthMorphs','mode'] as const)
   if(JSON.stringify(r.assets[key])!==JSON.stringify(first.assets[key]))issues.push(`GLB-Modelle weichen ab (${key}) in Messung ${i+1}.`);
 }
 if(issues.length)return blocked(issues,targetFps,targetAvatars,rounds);
 const rows:ProfileRowV779[]=[];
 for(const profile of QUALITY_PROFILE_IDS_V779)for(const avatars of counts)for(const stage of SCENES){
  const id=`${stage}-${avatars}glb`;
  const samples=runs.filter(r=>r.profileV779===profile).map(r=>r.report!.scenes.find(x=>x.id===id)!);
  const fps=samples.map(s=>s.fps),p95=samples.map(s=>s.p95Ms);
  const unstable=Math.max(...p95)>Math.min(...p95)*1.25||Math.max(...fps)>Math.min(...fps)*1.25;
  rows.push({profile,avatars,stage,minFps:rnd(Math.min(...fps)),worstP95Ms:rnd(Math.max(...p95)),
   medianFps:rnd(midpoint(fps)),medianP95Ms:rnd(midpoint(p95)),medianCalls:rnd(midpoint(samples.map(s=>s.avgCalls))),
   passed:!unstable&&samples.every(s=>s.fps>=targetFps&&s.p95Ms<=1000/targetFps),unstable});
 }
 const best=(avatars:AvatarCountV779)=>QUALITY_PROFILE_IDS_V779.find(profile=>rows.filter(r=>r.profile===profile&&r.avatars===avatars).every(r=>r.passed))??null;
 const recommendedProfile=best(targetAvatars),twoAvatarAlternative=targetAvatars===4?best(2):null;
 const notes=[
  'Profilvergleich nur innerhalb der V777-Fixture mit synthetischen Audio-/Lyrics-Signalen. Keine vollständige Spotify-Show.',
  'V779 verändert reale Bühnenaktivität, DanceFX und das Aktualisierungsintervall der Knochen-/Mundanimationen. Keine GLB-Polygonreduktion, keine VRAM-Messung.',
  'Empfehlung ist die optisch aufwendigste Variante, die das Ziel in jeder Bühne und jeder Wiederholung erfüllt. Instabile Szenen gelten als nicht bestanden.',
  'FPS/P95 sind Messwerte des verwendeten Browsers und Geräts, keine allgemeingültige Hardwarezusage.',
 ];
 if(first.assets.mode==='reference')notes.push('Nur die kleine Referenz-GLB: Ergebnis nicht geeignet für eine Hardware-Kaufentscheidung.');
 if(!recommendedProfile)notes.push('Kein getestetes Qualitätsprofil erfüllt dieses Ziel mit der gewünschten Avatarzahl; gegebenenfalls 30/45 FPS oder zwei Avatare prüfen.');
 return {format:'sonic-quality-sweep-v779',version:1,status:'ready',issues:[],targetFps,targetAvatars,rounds,
  recommendedProfile,twoAvatarAlternative,rows,renderer:first.environment.renderer,assetsMode:first.assets.mode,notes};
}
