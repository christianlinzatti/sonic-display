/** V785 paired quality review. Fail closed for invalid/mixed browser evidence. */
import type {ConcertReportV777} from './concertBenchmarkV777';
import type {LyricsReportV785,LyricsModeV785,LyricsSceneV785} from './lyricsProtectionV785';
export const LYRICS_ORDER_V785=['off','on','on','off'] as const;
export type LyricsRunV785={status:string;report?:ConcertReportV777;lyricsV785?:LyricsReportV785};
export type LyricsReviewV785={format:'sonic-lyrics-review-v785';status:'ready'|'blocked';issues:string[];assetMode:string|null;
 rows:{id:string;avatars:2|4;clipOff:number;clipOn:number;proxyOverlapOff:number;proxyOverlapOn:number;lagOff:number;lagOn:number;jumpsOff:number;jumpsOn:number;fpsOff:number;fpsOn:number;p95Off:number;p95On:number;warnings:string[]}[];notes:string[]};
const stages=['cyberpunk','rock','galaxy'] as const;
const finite=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<1e8;
const mean=(a:number[])=>Math.round(a.reduce((x,y)=>x+y,0)/a.length*1000)/1000;
export function reviewLyricsRunsV785(input:unknown):LyricsReviewV785{
 const issues:string[]=[],out:LyricsReviewV785={format:'sonic-lyrics-review-v785',status:'blocked',issues,assetMode:null,rows:[],notes:[
  'Only measured browser/WebGL results with matching real GLBs, environment and timing are comparable.',
  'Performer-proxy overlap estimates are NOT actual face/collision detections. Review screenshots for real readability.',
  'Synthetic lyrics and camera shots do NOT establish true Spotify lyric timing or production-show performance.',
  'Reference GLB is insufficient for a hardware decision. The live stage and live camera remain unchanged.']};
 if(!Array.isArray(input)||input.length!==4){issues.push('Vier vollständige Gegenläufe off/on/on/off benötigt.');return out;}
 const runs=input as LyricsRunV785[];
 for(let index=0;index<4;index++){
  const r=runs[index],p=r?.report,l=r?.lyricsV785,mode:LyricsModeV785=LYRICS_ORDER_V785[index];
  if(r?.status!=='ok'||!p||!l){issues.push('Browser-/Lyrics-Bericht fehlt: '+(index+1));continue;}
  const ids=new Set([2,4].flatMap(n=>stages.map(s=>`${s}-${n}glb`)));
  if(p.format!=='sonic-concert-benchmark-v777'||p.version!==1||!p.environment||!p.environment.renderer||!p.environment.userAgent||p.environment.softwareRenderer||
    p.config?.fixtureId!=='v777-stages-glb-dance-lips-lyrics-fx-v1'||JSON.stringify(p.config?.stages)!==JSON.stringify(stages)||JSON.stringify(p.config?.counts)!=='[2,4]'||p.config?.lyricsV785!==mode||p.config?.cameraV784!=='on'||
    p.config?.profileV779!=='balanced'||p.config?.passes!==2||p.config?.warmupFrames!==60||p.config?.sampleFrames!==240||
    !p.assets?.hashes?.length||p.assets.hashes.some(h=>!/^[a-f0-9]{64}$/.test(h))||
    p.scenes?.length!==6||p.scenes.some(s=>!s||typeof s.id!=='string'||!ids.delete(s.id)||s.stage!==s.id.split('-')[0]||s.avatarCount!==(s.id.endsWith('2glb')?2:4)||s.frames<474||!finite(s.fps)||s.fps===0||!finite(s.p95Ms)||!finite(s.avgCalls)||s.avgCalls===0)||ids.size){
    issues.push('FPS-/GLB-/Konfigurationsnachweis fehlt: '+(index+1));continue;}
  const keys=new Set<string>();
  if(l.format!=='sonic-lyrics-protection-v785'||l.version!==1||l.mode!==mode||
    JSON.stringify(l.environment)!==JSON.stringify(p.environment)||JSON.stringify(l.assets?.hashes)!==JSON.stringify(p.assets.hashes)||l.assets?.mode!==p.assets.mode||
    l.config?.passes!==2||l.config?.warmupFrames!==60||l.config?.sampleFrames!==240||
    l.config?.timeline!=='scripted-shots-240f-v784'||l.config?.sampling!=='projected-3d-glyph-bounds-v785'||
    !Array.isArray(l.scenes)||l.scenes.length!==12||l.scenes.some((s:LyricsSceneV785)=>{
      if(!s||typeof s.id!=='string')return true;const key=`${s.pass}/${s.id}`;if(keys.has(key))return true;keys.add(key);
      return ![0,1].includes(s.pass)||![2,4].includes(s.avatars)||!stages.some(stage=>s.id===`${stage}-${s.avatars}glb`)||
       s.frames<237||![s.clipPct,s.proxyOverlapPct,s.lineLagPct,s.maxConsecutiveLag,s.largePositionJumps].every(finite)||
       s.clipPct>100||s.proxyOverlapPct>100||s.lineLagPct>100||!Number.isInteger(s.maxConsecutiveLag)||!Number.isInteger(s.largePositionJumps)||
       s.maxConsecutiveLag>s.frames||s.largePositionJumps>s.frames;
    })||keys.size!==12)issues.push('Glyph-/Frames-/Szenennachweis unvollständig: '+(index+1));
 }
 if(issues.length)return out;
 const ref=runs[0].report!;
 for(let i=1;i<runs.length;i++){
  const p=runs[i].report!;
  for(const key of ['userAgent','renderer','viewport','dpr','antialias','softwareRenderer'] as const)
    if(p.environment[key]!==ref.environment[key])issues.push(`GPU/Browser abweichend: ${i+1}/${key}`);
  for(const key of ['fixtureId','profileV779','interpolationV782','lipGuardV783','cameraV784','stages','counts','passes','warmupFrames','sampleFrames','audioMode','lyricsMode','lipMode'] as const)
    if(JSON.stringify(p.config[key])!==JSON.stringify(ref.config[key]))issues.push(`Konfiguration abweichend: ${i+1}/${key}`);
  for(const key of ['hashes','bytes','animations','skinnedMeshes','mouthMorphs','mode'] as const)
    if(JSON.stringify(p.assets[key])!==JSON.stringify(ref.assets[key]))issues.push(`GLB abweichend: ${i+1}/${key}`);
 }
 if(issues.length)return out;
 for(const avatars of [2,4] as const)for(const stage of stages){
  const id=`${stage}-${avatars}glb`,measure=(mode:LyricsModeV785)=>{
    const selected=runs.filter((_,i)=>LYRICS_ORDER_V785[i]===mode);
    const scenes=selected.flatMap(r=>r.lyricsV785!.scenes.filter(s=>s.id===id));
    const frameStats=selected.map(r=>r.report!.scenes.find(s=>s.id===id)!);
    if(scenes.length!==4||frameStats.length!==2||frameStats.some(f=>!f))throw Error('Szenennachweis fehlt: '+id);
    return {clip:mean(scenes.map(s=>s.clipPct)),proxy:mean(scenes.map(s=>s.proxyOverlapPct)),lag:mean(scenes.map(s=>s.lineLagPct)),
      jumps:mean(scenes.map(s=>s.largePositionJumps)),fps:mean(frameStats.map(s=>s.fps)),p95:mean(frameStats.map(s=>s.p95Ms))};
  };
  const off=measure('off'),on=measure('on'),warnings:string[]=[];
  if(on.clip>0)warnings.push('Texte verlassen weiterhin den sicheren Bildbereich.');
  if(on.proxy>off.proxy+1)warnings.push('Häufigere Überlappung mit geschätzter Darstellerposition.');
  if(on.lag>off.lag+1)warnings.push('Mehr verspätete Lyrics-Zeilenwechsel.');
  if(on.fps<off.fps*.90)warnings.push('FPS-Einbruch über 10 % durch Schutzmodus.');
  if(on.p95>off.p95*1.12)warnings.push('P95-Framezeit über 12 % schlechter.');
  out.rows.push({id,avatars,clipOff:off.clip,clipOn:on.clip,proxyOverlapOff:off.proxy,proxyOverlapOn:on.proxy,
    lagOff:off.lag,lagOn:on.lag,jumpsOff:off.jumps,jumpsOn:on.jumps,fpsOff:off.fps,fpsOn:on.fps,p95Off:off.p95,p95On:on.p95,warnings});
 }
 out.status='ready';out.assetMode=ref.assets.mode;return out;
}
