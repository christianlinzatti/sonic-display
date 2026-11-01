/** V783 – fail-closed paired *real* browser evidence. No simulated FPS or hardware promises. */
import type {ConcertReportV777} from './concertBenchmarkV777';
import type {MotionReportV781,MotionSceneV781} from './motionSmoothnessV781';
export type LipRunV783={status:'ok'|'blocked';profileV779?:string;report?:ConcertReportV777;motionV781?:MotionReportV781;message?:string};
export type LipRowV783={id:string;profile:'balanced'|'economy';avatars:2|4;mouthHoldsOff:number;mouthHoldsOn:number;
 vocalErrorOff:number;vocalErrorOn:number;poseJerkOff:number;poseJerkOn:number;fpsOff:number;fpsOn:number;p95MsOff:number;p95MsOn:number;warnings:string[]};
export type LipReviewV783={format:'sonic-lip-guard-review-v783';version:1;status:'ready'|'blocked';issues:string[];
 renderer:string|null;assetMode:'reference'|'user-glb'|null;rows:LipRowV783[];notes:string[]};
export const V783_ORDER=[['balanced','off'],['balanced','on'],['economy','on'],['economy','off'],
 ['economy','off'],['economy','on'],['balanced','on'],['balanced','off']] as const;
const stages=['cyberpunk','rock','galaxy'] as const;
const finite=(n:unknown,min=0,max=1e9)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
const rounded=(n:number)=>Math.round(n*1000)/1000;
const blocked=(issues:string[]):LipReviewV783=>({format:'sonic-lip-guard-review-v783',version:1,status:'blocked',issues,
 renderer:null,assetMode:null,rows:[],notes:['Nur vollständige reale Chromium/GLB-Messungen sind vergleichbar. Keine Hardware- oder echte Phonem-Qualitätszusage.']});
function validateRun(run:LipRunV783|undefined,profile:string,mode:string,index:number){
 const prefix=`Lauf ${index+1} (${profile}/${mode})`,issues:string[]=[],r=run?.report,m=run?.motionV781;
 if(run?.status!=='ok'||run.profileV779!==profile||!r||!m)return [prefix+': Browserlauf oder Bewegungsbericht fehlt'];
 const requiredIds=new Set([2,4].flatMap(n=>stages.map(s=>`${s}-${n}glb`)));
 if(r.format!=='sonic-concert-benchmark-v777'||r.version!==1||!r.environment||!r.assets||
  r.environment.softwareRenderer||r.config?.fixtureId!=='v777-stages-glb-dance-lips-lyrics-fx-v1'||
  r.config.profileV779!==profile||r.config.interpolationV782!=='on'||r.config.lipGuardV783!==mode||
  r.config.passes!==2||r.config.warmupFrames<45||r.config.sampleFrames<90||
  !['reference','user-glb'].includes(r.assets.mode)||!r.assets.hashes?.length||
  !r.assets.hashes.every(h=>/^[a-f0-9]{64}$/.test(h))||r.assets.mouthMorphs<r.assets.hashes.length||
  !Array.isArray(r.scenes)||r.scenes.length!==6||
  r.scenes.some(s=>!requiredIds.delete(s.id)||s.id!==`${s.stage}-${s.avatarCount}glb`||s.frames<r.config.sampleFrames*2-6||
   !finite(s.fps,.1,1000)||!finite(s.p95Ms,.01,5000)||!finite(s.avgCalls,.01))||requiredIds.size)
  issues.push(prefix+': FPS-/GLB-Bericht ungültig oder unvollständig');
 const motionIds=new Set<string>();
 if(m.format!=='sonic-motion-smoothness-v781'||m.version!==1||m.profile!==profile||
  JSON.stringify(m.environment)!==JSON.stringify(r.environment)||JSON.stringify(m.assets?.hashes)!==JSON.stringify(r.assets.hashes)||
  m.assets?.mode!==r.assets.mode||m.config?.passes!==r.config.passes||
  m.config?.sampleFrames!==r.config.sampleFrames||m.config?.warmupFrames!==r.config.warmupFrames||
  !Array.isArray(m.scenes)||m.scenes.length!==12)issues.push(prefix+': Motion/FPS-Bindung ungültig');
 else{
  for(const x of m.scenes){const key=`${x.id}/${x.pass}`;
   if(motionIds.has(key)||!requiredCase(x,profile)||x.samples<x.avatars*80||x.frames<r.config.sampleFrames-3||
    ![x.mouthHoldPct,x.vocalErrorMean,x.p95PoseJerkDeg,x.p95FrameMs].every(n=>finite(n)))
    issues.push(prefix+': ungültige Motion-Szene '+key);
   motionIds.add(key);
  }
  if(motionIds.size!==12)issues.push(prefix+': fehlende Motion-Szenen');
 }
 return issues;
}
function requiredCase(s:MotionSceneV781,profile:string){return s.profile===profile&&[0,1].includes(s.pass)&&[2,4].includes(s.avatars)&&stages.some(stage=>s.id===`${stage}-${s.avatars}glb`);}
export function reviewLipSyncGuardV783(input:unknown):LipReviewV783{
 if(!Array.isArray(input)||input.length!==V783_ORDER.length)return blocked(['Acht gegenläufige vollständige Real-Browser-Läufe notwendig.']);
 const records=input as LipRunV783[],issues:string[]=[];
 V783_ORDER.forEach(([p,mode],i)=>{issues.push(...validateRun(records[i],p,mode,i));});
 if(issues.length)return blocked(issues);
 const baseline=records[0].report!;
 for(let i=1;i<records.length;i++){
  const r=records[i].report!;
  for(const field of ['userAgent','renderer','viewport','dpr','antialias','softwareRenderer'] as const)
   if(baseline.environment[field]!==r.environment[field])issues.push(`Lauf ${i+1}: abweichende GPU-/Browserumgebung: ${field}`);
  for(const field of ['fixtureId','stages','counts','passes','warmupFrames','sampleFrames','audioMode','lyricsMode','lipMode','interpolationV782'] as const)
   if(JSON.stringify(baseline.config[field])!==JSON.stringify(r.config[field]))issues.push(`Lauf ${i+1}: unterschiedliche Messkonfiguration: ${field}`);
  for(const field of ['hashes','bytes','animations','skinnedMeshes','mouthMorphs','mode'] as const)
   if(JSON.stringify(baseline.assets[field])!==JSON.stringify(r.assets[field]))issues.push(`Lauf ${i+1}: andere GLB-Dateien oder Rigparameter: ${field}`);
  if(JSON.stringify(baseline.scenes.map(s=>s.id))!==JSON.stringify(r.scenes.map(s=>s.id)))issues.push(`Lauf ${i+1}: Bühnenreihenfolge anders`);
 }
 if(issues.length)return blocked(issues);
 const rows:LipRowV783[]=[];
 for(const profile of ['balanced','economy'] as const)for(const avatars of [2,4] as const)for(const stage of stages){
  const id=`${stage}-${avatars}glb`;
  const calc=(mode:'on'|'off')=>{
   const runs=records.filter((r,i)=>V783_ORDER[i][0]===profile&&V783_ORDER[i][1]===mode);
   const motion=runs.flatMap(r=>r.motionV781!.scenes.filter(s=>s.id===id));
   const frame=runs.map(r=>r.report!.scenes.find(s=>s.id===id)!);
   if(motion.length!==4||frame.length!==2)throw Error('V783: unvollständige Messdaten');
   const mean=(v:number[])=>rounded(v.reduce((a,b)=>a+b,0)/v.length);
   return {holds:mean(motion.map(s=>s.mouthHoldPct)),error:mean(motion.map(s=>s.vocalErrorMean)),
    pose:mean(motion.map(s=>s.p95PoseJerkDeg)),fps:mean(frame.map(s=>s.fps)),p95:mean(frame.map(s=>s.p95Ms))};
  };
  const off=calc('off'),on=calc('on'),warnings:string[]=[];
  if(on.holds>off.holds+.1)warnings.push('Mehr eingefrorene Mundframes als ohne Guard.');
  if(on.error>off.error+.01)warnings.push('Größere Abweichung vom synthetischen Vokalsignal.');
  if(on.p95>off.p95*1.10)warnings.push('P95-Framezeit stieg um über 10 %.');
  if(on.fps<off.fps*.90)warnings.push('FPS sank um mehr als 10 %.');
  if(on.pose>off.pose*1.2)warnings.push('Körperbewegungs-Jitter stieg um über 20 %.');
  rows.push({id,profile,avatars,mouthHoldsOff:off.holds,mouthHoldsOn:on.holds,
   vocalErrorOff:off.error,vocalErrorOn:on.error,poseJerkOff:off.pose,poseJerkOn:on.pose,
   fpsOff:off.fps,fpsOn:on.fps,p95MsOff:off.p95,p95MsOn:on.p95,warnings});
 }
 const notes=['Der Guard ist NUR in der lokalen GLB-Benchmark-Fixture aktiv, nicht in der produktiven Show.',
  'Vokalsignal und Lyrics sind synthetisch; reale Phoneme, Latenz und Feature-Voice-Handoffs werden damit nicht validiert.',
  'Ein technischer Vergleich ist KEINE automatische qualitative Freigabe. GLB und echte GPU sollten zusätzlich visuell geprüft werden.'];
 if(baseline.assets.mode==='reference')notes.push('Die mitgelieferte kleine GLB-Figur erlaubt keine Hardware-Kaufempfehlung.');
 return {format:'sonic-lip-guard-review-v783',version:1,status:'ready',issues:[],renderer:baseline.environment.renderer,
  assetMode:baseline.assets.mode,rows,notes};
}
