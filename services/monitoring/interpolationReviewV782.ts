/** V782: evidence-only, paired legacy-hold vs GLB interpolation review.
 * No performance/visual claims without REAL V777/V781 browser measurements. */
import type {ConcertReportV777} from './concertBenchmarkV777';
import type {MotionReportV781,MotionSceneV781} from './motionSmoothnessV781';
export type V782Run={status:'ok'|'blocked';profileV779?:string;report?:ConcertReportV777;motionV781?:MotionReportV781;message?:string};
export type V782Row={id:string;profile:'balanced'|'economy';avatars:2|4;
 poseHoldOff:number;poseHoldOn:number;poseJerkOff:number;poseJerkOn:number;
 mouthHoldOff:number;mouthHoldOn:number;vocalErrorOff:number;vocalErrorOn:number;
 p95FrameOff:number;p95FrameOn:number;fpsOff:number;fpsOn:number;warnings:string[]};
export type V782Review={format:'sonic-pose-interpolation-review-v782';version:1;status:'ready'|'blocked';issues:string[];
 renderer:string|null;assetsMode:'reference'|'user-glb'|null;rows:V782Row[];notes:string[]};
export const V782_ORDER=[['balanced','off'],['balanced','on'],['economy','off'],['economy','on'],
 ['economy','on'],['economy','off'],['balanced','on'],['balanced','off']] as const;
const round=(n:number)=>Math.round(n*100)/100;
const finite=(n:unknown,min=0,max=1e8)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
const block=(issues:string[]):V782Review=>({format:'sonic-pose-interpolation-review-v782',version:1,status:'blocked',issues,
 renderer:null,assetsMode:null,rows:[],notes:['Keine Qualitäts- oder Hardwarebehauptung ohne vergleichbare echte Chromium/GLB-Messungen.']});
const stages=['cyberpunk','rock','galaxy'];
function checkRun(record:V782Run|undefined,profile:string,mode:string,i:number):string[]{
 const issues:string[]=[],r=record?.report,m=record?.motionV781;
 const prefix=`Lauf ${i+1} (${profile}/${mode})`;
 if(record?.status!=='ok'||record.profileV779!==profile||!r||!m)return [prefix+': fehlender erfolgreicher Browserlauf/Bewegungsreport'];
 if(!r.environment||r.format!=='sonic-concert-benchmark-v777'||r.version!==1||r.config?.profileV779!==profile||r.config?.interpolationV782!==mode||r.config?.lipGuardV783!==undefined||
   r.config?.fixtureId!=='v777-stages-glb-dance-lips-lyrics-fx-v1'||r.environment.softwareRenderer||
   !r.assets?.hashes?.length||!r.assets.hashes.every(h=>/^[a-f0-9]{64}$/.test(h))||
   r.scenes?.length!==6||!Array.isArray(r.scenes)||
   ![2,4].every(avatars=>stages.every(stage=>r.scenes.some(s=>s.id===`${stage}-${avatars}glb`&&s.avatarCount===avatars&&s.stage===stage&&
    finite(s.fps,.1,1000)&&finite(s.p95Ms,.01,5000)&&finite(s.avgCalls,.01)&&s.frames>=89))))issues.push(prefix+': ungültiger FPS/GLB-Hardwarebeleg');
 if(m.format!=='sonic-motion-smoothness-v781'||m.version!==1||m.profile!==profile||
   JSON.stringify(m.assets?.hashes)!==JSON.stringify(r.assets?.hashes)||m.assets?.mode!==r.assets?.mode||
   JSON.stringify(m.environment)!==JSON.stringify(r.environment)||
   m.config?.passes!==r.config?.passes||m.config?.warmupFrames!==r.config?.warmupFrames||m.config?.sampleFrames!==r.config?.sampleFrames||
   m.scenes?.length!==12||!Array.isArray(m.scenes))issues.push(prefix+': inkonsistenter Motion/FPS-Nachweis');
 else {
  const keys=new Set<string>();
  for(const s of m.scenes){
   const key=`${s.id}/${s.pass}`;if(keys.has(key))issues.push(prefix+': doppelte Messszene '+key);keys.add(key);
   if(s.profile!==profile||![0,1].includes(s.pass)||![2,4].includes(s.avatars)||
    !stages.some(stage=>s.id===`${stage}-${s.avatars}glb`)||s.samples<s.avatars*80||s.frames<89||
    ![s.poseHoldPct,s.p95PoseJerkDeg,s.mouthHoldPct,s.vocalErrorMean,s.p95FrameMs].every(n=>finite(n)))issues.push(prefix+': ungültige Bewegungsdaten '+key);
  }
  if(keys.size!==12)issues.push(prefix+': unvollständige Szenenliste');
 }
 return issues;
}
const mean=(nums:number[])=>round(nums.reduce((a,b)=>a+b,0)/nums.length);
export function reviewInterpolationV782(input:unknown):V782Review{
 if(!Array.isArray(input)||input.length!==V782_ORDER.length)return block(['Es werden acht vollständige wechselnde Vergleichsläufe benötigt.']);
 const runs=input as V782Run[],issues=V782_ORDER.flatMap(([p,m],i)=>checkRun(runs[i],p,m,i));
 if(issues.length)return block(issues);
 const first=runs[0].report!;
 for(let i=1;i<runs.length;i++){
  const other=runs[i].report!;
  for(const field of ['userAgent','renderer','viewport','dpr','antialias','softwareRenderer'] as const)
   if(first.environment[field]!==other.environment[field])issues.push(`Lauf ${i+1}: Messumgebung weicht ab (${field})`);
  for(const field of ['fixtureId','stages','counts','passes','warmupFrames','sampleFrames','audioMode','lyricsMode','lipMode'] as const)
   if(JSON.stringify(first.config[field])!==JSON.stringify(other.config[field]))issues.push(`Lauf ${i+1}: Testszenario weicht ab (${field})`);
  for(const field of ['hashes','bytes','animations','skinnedMeshes','mouthMorphs','mode'] as const)
   if(JSON.stringify(first.assets[field])!==JSON.stringify(other.assets[field]))issues.push(`Lauf ${i+1}: GLB abweichend (${field})`);
  if(JSON.stringify(first.scenes.map(s=>s.id))!==JSON.stringify(other.scenes.map(s=>s.id)))issues.push(`Lauf ${i+1}: andere Bühnenreihenfolge`);
 }
 if(first.config.passes!==2||first.assets.mode!=='reference'&&first.assets.mode!=='user-glb')issues.push('Nur zwei vollständige Messpässe mit bekanntem Asset-Modus sind vergleichbar.');
 if(issues.length)return block(issues);
 const rows:V782Row[]=[];
 for(const profile of ['balanced','economy'] as const)for(const avatars of [2,4] as const)for(const stage of stages){
  const id=`${stage}-${avatars}glb`;
  const modeData=(mode:'on'|'off')=>{
   const a=runs.filter((run,i)=>V782_ORDER[i][0]===profile&&V782_ORDER[i][1]===mode);
   const samples:MotionSceneV781[]=a.flatMap(run=>run.motionV781!.scenes.filter(s=>s.id===id));
   const renders=a.map(run=>run.report!.scenes.find(s=>s.id===id)!);
   if(samples.length!==4||renders.length!==2)throw Error('Unvollständige Vergleichsszene');
   return {pose:mean(samples.map(s=>s.poseHoldPct)),jerk:mean(samples.map(s=>s.p95PoseJerkDeg)),
    mouth:mean(samples.map(s=>s.mouthHoldPct)),vocal:mean(samples.map(s=>s.vocalErrorMean)),
    frame:mean(samples.map(s=>s.p95FrameMs)),fps:mean(renders.map(s=>s.fps))};
  };
  const off=modeData('off'),on=modeData('on');const warnings:string[]=[];
  if(on.pose>off.pose+.1)warnings.push('Pose-Hold-Anteil ist trotz Interpolation gestiegen.');
  if(on.mouth>off.mouth+.1)warnings.push('Mund-Holds sind gestiegen.');
  if(on.frame>off.frame*1.15)warnings.push('P95-Framezeit ist um mehr als 15 % gestiegen.');
  if(on.jerk>off.jerk*1.2)warnings.push('Pose-Jerk ist um mehr als 20 % gestiegen.');
  rows.push({id,profile,avatars,poseHoldOff:off.pose,poseHoldOn:on.pose,poseJerkOff:off.jerk,poseJerkOn:on.jerk,
   mouthHoldOff:off.mouth,mouthHoldOn:on.mouth,vocalErrorOff:off.vocal,vocalErrorOn:on.vocal,
   p95FrameOff:off.frame,p95FrameOn:on.frame,fpsOff:off.fps,fpsOn:on.fps,warnings});
 }
 const notes=['Echte GLB-Knochen und Morphs aus der V777-Fixture; Musik und Lyrics bleiben synthetisch.',
  'SLERP/lineare Poseinterpolation kann CPU-Arbeit je Frame erhöhen: FPS/P95 unbedingt separat prüfen.',
  'Keine automatische Qualitätsfreigabe: Fußkontakt, reale Lip-Sync-Phoneme und sichtbare Übergänge benötigen weitere Prüfung.',
  'Interpolationsfunktion ist lokal und optional in der Benchmark-Fixture; der Live-Avatar-Director wurde nicht umgestellt.'];
 if(first.assets.mode==='reference')notes.push('Referenz-GLB ist zu klein für eine Hardware-Kaufentscheidung.');
 return {format:'sonic-pose-interpolation-review-v782',version:1,status:'ready',issues:[],renderer:first.environment.renderer,
  assetsMode:first.assets.mode,rows,notes};
}
