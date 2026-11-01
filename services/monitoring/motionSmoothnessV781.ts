import type {ConcertReportV777} from './concertBenchmarkV777';

/** V781: read-only temporal evidence from the actual V777 GLB fixture.
 * Pose orientation, mouth morph and named foot-bone world positions are sampled
 * AFTER the animation mixer callback on rendered frames. Foot contact is an
 * approximate height heuristic, not IK contact/force ground truth.
 */
export type MotionVec3V781=[number,number,number];
export type MotionQuatV781=[number,number,number,number];
export type MotionSampleV781={frame:number;slot:number;hip:MotionQuatV781;upper:MotionQuatV781|null;
 mouth:number;vocal:number;leftFoot:MotionVec3V781|null;rightFoot:MotionVec3V781|null};
export type MotionSceneV781={id:string;pass:number;profile:string;avatars:2|4;frames:number;samples:number;
 poseHoldPct:number;p95PoseStepDeg:number;p95PoseJerkDeg:number;mouthHoldPct:number;vocalErrorMean:number;
 p95FrameMs:number;p95FrameDeltaMs:number;feetTracked:number;footContactSamples:number;footSlipEvents:number|null;
 notes:string[]};
export type MotionReportV781={format:'sonic-motion-smoothness-v781';version:1;profile:string;
 environment:{userAgent:string;renderer:string;viewport:string;dpr:number;softwareRenderer:boolean};
 assets:{hashes:string[];mode:'reference'|'user-glb'};
 config:{passes:number;sampleFrames:number;warmupFrames:number;cue:'deterministic-synthetic-beat-v1';sampling:'post-mixer-world-bones-v1';frameRateHint:number};
 scenes:MotionSceneV781[]};
const finite=(n:unknown)=>typeof n==='number'&&Number.isFinite(n);
const round=(n:number)=>Math.round(n*10000)/10000;
const percentile=(a:number[],p:number)=>{if(!a.length)return 0;const v=[...a].sort((x,y)=>x-y);return v[Math.max(0,Math.ceil(p*v.length)-1)]};
const angle=(a:MotionQuatV781,b:MotionQuatV781)=>{
 const dot=Math.abs(a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3]);
 return 2*Math.acos(Math.min(1,Math.max(0,dot)))*180/Math.PI;
};
const d2=(a:MotionVec3V781,b:MotionVec3V781)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
const validQuat=(q:unknown):q is MotionQuatV781=>Array.isArray(q)&&q.length===4&&q.every(finite)&&Math.abs(Math.hypot(...q)-1)<.03;
const validFoot=(p:unknown):p is MotionVec3V781=>Array.isArray(p)&&p.length===3&&p.every(finite)&&p.every((n:number)=>Math.abs(n)<100000);
/** Multiple slots are kept independent. Samples from separate passes must never be concatenated. */
export function summarizeMotionSceneV781(id:string,pass:number,profile:string,avatars:2|4,raw:readonly MotionSampleV781[],frameMs:readonly number[]):MotionSceneV781{
 if(!id||!Number.isInteger(pass)||pass<0||!['cinematic','balanced','economy'].includes(profile)||![2,4].includes(avatars))throw Error('Ungültige Bewegungs-Szenenkennung');
 if(frameMs.length<89||frameMs.some(ms=>!finite(ms)||ms<=0||ms>5000))throw Error('Unvollständige echte Framezeiten');
 if(raw.length<avatars*80||raw.some(s=>!Number.isInteger(s.frame)||s.frame<0||!Number.isInteger(s.slot)||s.slot<0||s.slot>=avatars||
  !validQuat(s.hip)||(s.upper!==null&&!validQuat(s.upper))||!finite(s.mouth)||s.mouth<0||s.mouth>1||!finite(s.vocal)||s.vocal<0||s.vocal>1||
  (s.leftFoot!==null&&!validFoot(s.leftFoot))||(s.rightFoot!==null&&!validFoot(s.rightFoot))))throw Error('Ungültige GLB-Bewegungs-Samples');
 const bySlot=new Map<number,MotionSampleV781[]>();for(let i=0;i<avatars;i++)bySlot.set(i,[]);
 for(const s of raw)bySlot.get(s.slot)!.push(s);
 const poseStep:number[]=[],poseJerk:number[]=[],vocalError:number[]=[],frameDelta:number[]=[];
 let hold=0,posePairs=0,mouthHold=0,mouthMovingCue=0,feetTracked=0,contactPairs=0,slips=0;
 for(const [slot,unsorted] of bySlot){
  const samples=[...unsorted].sort((a,b)=>a.frame-b.frame);
  if(samples.length<80)throw Error('Fehlende Samples von Avatar '+slot);
  if(new Set(samples.map(s=>s.frame)).size!==samples.length)throw Error('Doppelte Frame-Samples von Avatar '+slot);
  let lastStep:number|null=null;
  for(let i=0;i<samples.length;i++){
   const cur=samples[i];vocalError.push(Math.abs(cur.mouth-cur.vocal));if(i===0)continue;
   const prev=samples[i-1];if(cur.frame-prev.frame!==1)throw Error('Nicht zusammenhängende Animations-Samples');
   const step=Math.max(angle(prev.hip,cur.hip),prev.upper&&cur.upper?angle(prev.upper,cur.upper):0);
   poseStep.push(step);if(step<.015)hold++;posePairs++;
   if(lastStep!==null)poseJerk.push(Math.abs(step-lastStep));lastStep=step;
   if(Math.abs(cur.vocal-prev.vocal)>.045){mouthMovingCue++;if(Math.abs(cur.mouth-prev.mouth)<.005)mouthHold++}
  }
  for(const side of ['leftFoot','rightFoot'] as const){
   const points=samples.filter(s=>s[side]!==null);
   if(points.length<80)continue;
   feetTracked++;
   const ground=percentile(points.map(s=>s[side]![1]),.05);
   const heights=points.map(s=>s[side]![1]-ground);
   const extent=Math.max(.1,percentile(heights,.95));
   // Near the lowest sampled foot height on both adjacent frames. This detects
   // motion in *probable* contact, not actual collisions / Foot-IK state.
   const maxContact=Math.max(.025,Math.min(.12,extent*.12));
   for(let i=1;i<samples.length;i++){
    const a=samples[i-1][side],b=samples[i][side];if(!a||!b)continue;
    if(a[1]-ground>maxContact||b[1]-ground>maxContact)continue;
    contactPairs++;
    if(d2(a,b)>.012)slips++;
   }
  }
 }
 for(let i=1;i<frameMs.length;i++)frameDelta.push(Math.abs(frameMs[i]-frameMs[i-1]));
 const notes:string[]=[];
 if(!feetTracked)notes.push('Keine benannten Fußknochen erkannt: Fußrutschen nicht auswertbar.');
 else if(contactPairs<20)notes.push('Zu wenige vermutete Bodenkontakte: Fußrutschen nicht belastbar auswertbar.');
 notes.push('Pose-Jitter/Pose-Holds sind zeitliche Heuristiken, keine automatische Bewertung der Tanzästhetik.');
 notes.push('Vokalfehler vergleicht Mund-Morph gegen synthetisches Testsignal, nicht echte Phoneme.');
 return {id,pass,profile,avatars,frames:frameMs.length,samples:raw.length,
  poseHoldPct:round(100*hold/Math.max(1,posePairs)),p95PoseStepDeg:round(percentile(poseStep,.95)),p95PoseJerkDeg:round(percentile(poseJerk,.95)),
  mouthHoldPct:round(100*mouthHold/Math.max(1,mouthMovingCue)),vocalErrorMean:round(vocalError.reduce((a,b)=>a+b,0)/vocalError.length),
  p95FrameMs:round(percentile([...frameMs],.95)),p95FrameDeltaMs:round(percentile(frameDelta,.95)),feetTracked,
  footContactSamples:contactPairs,footSlipEvents:contactPairs>=20?slips:null,notes};
}
export type MotionReviewV781={format:'sonic-motion-review-v781';version:1;status:'ready'|'blocked';issues:string[];
 rows:{id:string;profile:string;avatars:2|4;worstP95FrameMs:number;worstPoseHoldPct:number;worstP95PoseJerkDeg:number;worstMouthHoldPct:number;worstVocalErrorMean:number;footSlipEvents:number|null;warnings:string[]}[];
 recommendation:string;limitations:string[]};
export function reviewMotionRunsV781(records:unknown):MotionReviewV781{
 const result:MotionReviewV781={format:'sonic-motion-review-v781',version:1,status:'blocked',issues:[],rows:[],recommendation:'Keine automatische Freigabe ohne vergleichbare Browsermessungen.',limitations:[
  'Synthetische Testsignale und dieselbe GLB-Test-Funktion wie V777; keine vollständige Spotify-Show.',
  'Pose-/Mund-/Fuß-Indikatoren sind Heuristiken, keine Garantie natürlicher Bewegung oder Lippensynchronität.',
  'Die kleine mitgelieferte GLB ist nur ein Funktionstest; reale Hardwareeinschätzung erfordert eigene komplexe GLBs.']};
 if(!Array.isArray(records)||records.length!==6){result.issues.push('Zwei vollständige, gegenläufige Runden mit drei Profilen sind erforderlich.');return result;}
 const order=['cinematic','balanced','economy','economy','balanced','cinematic'];
 const reports:MotionReportV781[]=[];
 for(let i=0;i<records.length;i++){
  const row=records[i] as {status?:string;profileV779?:string;motionV781?:MotionReportV781;report?:ConcertReportV777};
  if(row?.status!=='ok'||row.profileV779!==order[i]||!row.motionV781){result.issues.push('Browserlauf fehlt/blockiert oder Profilreihenfolge falsch: '+(i+1));continue}
  const r=row.motionV781,performance=row.report;
  if(!performance||performance.format!=='sonic-concert-benchmark-v777'||performance.version!==1||
     performance.config?.profileV779!==order[i]||performance.config?.interpolationV782!==undefined||performance.config?.fixtureId!=='v777-stages-glb-dance-lips-lyrics-fx-v1'||
     performance.scenes?.length!==6||performance.scenes.some(c=>c.fps<=0||c.frames<89||c.avgCalls<=0)||
     JSON.stringify(performance.assets?.hashes)!==JSON.stringify(r.assets?.hashes)||
     performance.assets?.mode!==r.assets?.mode||
     performance.config.passes!==r.config?.passes||performance.config.sampleFrames!==r.config?.sampleFrames||
     performance.config.warmupFrames!==r.config?.warmupFrames||
     performance.environment.renderer!==r.environment?.renderer||
     performance.environment.viewport!==r.environment?.viewport||
     performance.environment.userAgent!==r.environment?.userAgent){
    result.issues.push('V777-FPS-Beleg fehlt oder widerspricht V781-Daten: '+(i+1));continue;
  }
  if(r.format!=='sonic-motion-smoothness-v781'||r.version!==1||r.profile!==order[i]||!r.environment||!r.assets||!r.config||!Array.isArray(r.scenes)||r.scenes.length!==12||
   r.config.passes!==2||!Number.isInteger(r.config.sampleFrames)||r.config.sampleFrames<90||r.config.sampleFrames>600||
   !Number.isInteger(r.config.warmupFrames)||r.config.warmupFrames<45||r.config.warmupFrames>240||
   r.assets.mode!=='reference'&&r.assets.mode!=='user-glb'||!Array.isArray(r.assets.hashes)||!r.assets.hashes.length||
   r.assets.hashes.some(h=>typeof h!=='string'||!/^[a-f0-9]{64}$/.test(h))||r.config.cue!=='deterministic-synthetic-beat-v1'||r.config.sampling!=='post-mixer-world-bones-v1'||
   r.scenes.some(s=>s.profile!==r.profile||s.frames<89||s.samples<s.avatars*80||![0,1].includes(s.pass)||
    ![2,4].includes(s.avatars)||!['cyberpunk','rock','galaxy'].some(stage=>s.id===`${stage}-${s.avatars}glb`)||
    ![s.p95FrameMs,s.p95FrameDeltaMs,s.poseHoldPct,s.p95PoseJerkDeg,s.mouthHoldPct,s.vocalErrorMean].every(n=>finite(n)&&n>=0)||
    s.footSlipEvents!==null&&(!Number.isInteger(s.footSlipEvents)||s.footSlipEvents<0))){result.issues.push('Ungültige / fehlende Bewegungsframes: '+(i+1));continue}
  const keys=r.scenes.map(s=>`${s.pass}/${s.id}`);
  if(new Set(keys).size!==12){result.issues.push('Doppelte oder unvollständige Szenen: '+(i+1));continue}
  reports.push(r);
 }
 if(result.issues.length)return result;
 const baseline=reports[0];
 for(const r of reports.slice(1)){
  if(JSON.stringify(r.environment)!==JSON.stringify(baseline.environment))result.issues.push('GPU/Browser/Viewport unterscheiden sich.');
  if(JSON.stringify(r.assets)!==JSON.stringify(baseline.assets))result.issues.push('GLB-Hashes oder Asset-Modus unterscheiden sich.');
  if(JSON.stringify(r.config)!==JSON.stringify(baseline.config))result.issues.push('Framezahl, Sampling oder Testparameter unterscheiden sich.');
 }
 if(baseline.environment.softwareRenderer)result.issues.push('Software-Rendering ist nicht als Hardwarevergleich geeignet.');
 if(result.issues.length)return result;
 for(const profile of ['cinematic','balanced','economy'])for(const avatars of [2,4] as const)for(const stage of ['cyberpunk','rock','galaxy']){
  const id=`${stage}-${avatars}glb`;
  const items=reports.filter(r=>r.profile===profile).flatMap(r=>r.scenes.filter(s=>s.id===id));
  if(items.length!==4){result.issues.push('Fehlende Wiederholung: '+id+'/'+profile);continue}
  const worst=(key:keyof MotionSceneV781)=>Math.max(...items.map(s=>s[key] as number));
  const footData=items.every(s=>s.footSlipEvents!==null);
  const warnings:string[]=[];
  if(worst('poseHoldPct')>40)warnings.push('Viele unveränderte Posen; mögliches Stottern.');
  if(worst('mouthHoldPct')>40)warnings.push('Mundmorph hält trotz veränderter Vokaleingabe.');
  if(worst('p95FrameDeltaMs')>10)warnings.push('Ungleichmäßige Framezeiten.');
  if(!footData)warnings.push('Fußkontaktanalyse nicht verfügbar / keine sicheren Bodenkontakte.');
  result.rows.push({id,profile,avatars,worstP95FrameMs:round(worst('p95FrameMs')),
   worstPoseHoldPct:round(worst('poseHoldPct')),worstP95PoseJerkDeg:round(worst('p95PoseJerkDeg')),
   worstMouthHoldPct:round(worst('mouthHoldPct')),worstVocalErrorMean:round(worst('vocalErrorMean')),
   footSlipEvents:footData?items.reduce((n,s)=>n+s.footSlipEvents!,0):null,warnings});
 }
 if(result.issues.length){result.rows=[];return result}
 result.status='ready';result.recommendation='Bewegungs- und Mund-Haltephasen zwischen Profilen vergleichen; keine automatische Qualitätsfreigabe allein auf Basis der Kennzahlen.';
 return result;
}
