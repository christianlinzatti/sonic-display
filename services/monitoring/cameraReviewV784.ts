/** V784: reject unpaired, stale, mixed-hardware, incomplete or simulated evidence. */
import type {ConcertReportV777} from './concertBenchmarkV777';
import type {CameraSceneV784} from './cameraSmoothnessV784';
export type CameraReportV784={format:'sonic-camera-smoothness-v784';version:1;mode:'on'|'off';environment:ConcertReportV777['environment'];
 assets:{hashes:string[];mode:'reference'|'user-glb'};config:{passes:number;sampleFrames:number;warmupFrames:number;timeline:'scripted-shots-240f-v784';sampling:'post-camera-projection-v784'};scenes:CameraSceneV784[]};
export type CameraRunV784={status:string;report?:ConcertReportV777;cameraV784?:CameraReportV784;message?:string};
export const CAMERA_ORDER_V784=['off','on','on','off'] as const;
export type CameraReviewV784={format:'sonic-camera-review-v784';status:'ready'|'blocked';issues:string[];assetMode:string|null;
 rows:{id:string;avatars:2|4;hardCutsOff:number;hardCutsOn:number;p95RotationJerkOff:number;p95RotationJerkOn:number;
 p95PositionJerkOff:number;p95PositionJerkOn:number;lyricSafeOff:number;lyricSafeOn:number;fpsOff:number;fpsOn:number;warnings:string[]}[];notes:string[]};
const stages=['cyberpunk','rock','galaxy'] as const;
const finite=(n:unknown)=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<1e8;
const mean=(v:number[])=>Math.round(v.reduce((a,b)=>a+b,0)/v.length*1000)/1000;
export function reviewCameraRunsV784(input:unknown):CameraReviewV784{
 const issues:string[]=[],result:CameraReviewV784={format:'sonic-camera-review-v784',status:'blocked',issues,assetMode:null,rows:[],notes:[
 'Nur echte GLB/Chromium-Messungen, gleiche Hardware und gleiche Testparameter sind vergleichbar.',
 'Feste Testkamerafahrten sind kein Ersatz für die vollständige Live-Konzertregie. Lyrics- und Darsteller-Sichtbarkeit beruhen auf Projektionspunkten.',
 'Referenz-GLB ist nur zum Funktionstest geeignet; keine Raspberry-Pi- oder Hardware-Zusage.']};
 if(!Array.isArray(input)||input.length!==4){issues.push('Vier vollständige Gegenläufe off/on/on/off erforderlich.');return result;}
 const runs=input as CameraRunV784[];
 for(let i=0;i<runs.length;i++){
  const r=runs[i],perf=r?.report,cam=r?.cameraV784,mode=CAMERA_ORDER_V784[i];
  if(r?.status!=='ok'||!perf||!cam){issues.push('Browser-/Kamerabericht fehlt: '+(i+1));continue;}
  const ids=new Set([2,4].flatMap(n=>stages.map(s=>`${s}-${n}glb`)));
  if(perf.format!=='sonic-concert-benchmark-v777'||perf.version!==1||perf.environment?.softwareRenderer||
   perf.config?.fixtureId!=='v777-stages-glb-dance-lips-lyrics-fx-v1'||perf.config?.cameraV784!==mode||
   perf.config?.profileV779!=='balanced'||perf.config?.passes!==2||perf.config?.sampleFrames!==240||perf.config?.warmupFrames!==60||
   perf.scenes?.length!==6||perf.scenes.some(s=>!ids.delete(s.id)||s.frames<474||!finite(s.fps)||s.fps===0||!finite(s.p95Ms)||!finite(s.avgCalls)||s.avgCalls===0)||ids.size||
   !perf.assets?.hashes?.length||perf.assets.hashes.some(h=>!/^[a-f0-9]{64}$/.test(h))){issues.push('FPS-/GLB-/Konfigurationsbeleg unvollständig: '+(i+1));continue;}
  const keys=new Set<string>();
  if(cam.format!=='sonic-camera-smoothness-v784'||cam.version!==1||cam.mode!==mode||
   JSON.stringify(cam.environment)!==JSON.stringify(perf.environment)||JSON.stringify(cam.assets?.hashes)!==JSON.stringify(perf.assets.hashes)||cam.assets?.mode!==perf.assets.mode||
   cam.config?.passes!==2||cam.config?.sampleFrames!==240||cam.config?.warmupFrames!==60||
   cam.config?.timeline!=='scripted-shots-240f-v784'||cam.config?.sampling!=='post-camera-projection-v784'||
   !Array.isArray(cam.scenes)||cam.scenes.length!==12||cam.scenes.some(s=>{
    const key=`${s.pass}/${s.id}`;if(keys.has(key))return true;keys.add(key);
    return ![0,1].includes(s.pass)||![2,4].includes(s.avatars)||!stages.some(st=>s.id===`${st}-${s.avatars}glb`)||s.frames<237||
     ![s.p95PositionStep,s.p95RotationStepDeg,s.p95PositionJerk,s.p95RotationJerkDeg,s.hardCuts,s.lyricOutOfSafePct].every(finite)||
     s.lyricOutOfSafePct>100||!Number.isInteger(s.minVisiblePerformers)||s.minVisiblePerformers>s.avatars||s.minVisiblePerformers<0;
   })||keys.size!==12)issues.push('Kameraframe-/Messnachweis unvollständig: '+(i+1));
 }
 if(issues.length)return result;
 const ref=runs[0].report!;
 for(const [index,r] of runs.entries()){
  if(index===0)continue;const p=r.report!;
  for(const key of ['userAgent','renderer','viewport','dpr','antialias','softwareRenderer'] as const)if(p.environment[key]!==ref.environment[key])issues.push(`Lauf ${index+1}: GPU/Browser unterscheiden sich: ${key}`);
  for(const key of ['fixtureId','profileV779','interpolationV782','lipGuardV783','stages','counts','passes','warmupFrames','sampleFrames','audioMode','lyricsMode','lipMode'] as const)
   if(JSON.stringify(p.config[key])!==JSON.stringify(ref.config[key]))issues.push(`Lauf ${index+1}: Konfiguration anders: ${key}`);
  for(const key of ['hashes','bytes','animations','skinnedMeshes','mouthMorphs','mode'] as const)
   if(JSON.stringify(p.assets[key])!==JSON.stringify(ref.assets[key]))issues.push(`Lauf ${index+1}: GLB unterschiedlich: ${key}`);
 }
 if(issues.length)return result;
 for(const avatars of [2,4] as const)for(const stage of stages){
  const id=`${stage}-${avatars}glb`;
  const stat=(mode:'off'|'on')=>{
   const selected=runs.filter((_,i)=>CAMERA_ORDER_V784[i]===mode);
   const scenes=selected.flatMap(r=>r.cameraV784!.scenes.filter(s=>s.id===id));
   const frames=selected.map(r=>r.report!.scenes.find(s=>s.id===id)!);
   if(scenes.length!==4||frames.some(f=>!f)||frames.length!==2)throw Error('Kamera-Szenen unvollständig');
   return {cuts:mean(scenes.map(s=>s.hardCuts)),rotation:mean(scenes.map(s=>s.p95RotationJerkDeg)),position:mean(scenes.map(s=>s.p95PositionJerk)),
    lyric:mean(scenes.map(s=>s.lyricOutOfSafePct)),fps:mean(frames.map(s=>s.fps))};
  };
  const off=stat('off'),on=stat('on'),warnings:string[]=[];
  if(on.cuts>off.cuts)warnings.push('Mehr abrupte Schnitte mit Glättung.');
  if(on.rotation>off.rotation)warnings.push('Mehr Drehungsruckler mit Glättung.');
  if(on.lyric>off.lyric+1)warnings.push('Lyrics verlassen häufiger den geschützten Bildbereich.');
  if(on.fps<off.fps*.90)warnings.push('FPS-Abfall über 10 % gegenüber direkter Kameraregie.');
  result.rows.push({id,avatars,hardCutsOff:off.cuts,hardCutsOn:on.cuts,p95RotationJerkOff:off.rotation,p95RotationJerkOn:on.rotation,
   p95PositionJerkOff:off.position,p95PositionJerkOn:on.position,lyricSafeOff:off.lyric,lyricSafeOn:on.lyric,
   fpsOff:off.fps,fpsOn:on.fps,warnings});
 }
 result.status='ready';result.assetMode=ref.assets.mode;return result;
}
