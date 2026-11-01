/** V788 independent evidence gate for four real-browser governor runs.
 * Never claims that fewer GPU resources imply smoother video without measured FPS. */
import type {GovernorModeV788,GovernorTraceV788,GovernorTargetV788,GovernorCaseV788} from './concertQualityGovernorV788';
import type {ConcertReportV777} from './concertBenchmarkV777';
export const GOVERNOR_ORDER_V788=['off','on','on','off'] as const;
export type GovernorRunV788={status:'ok'|'blocked';message?:string;report?:ConcertReportV777;governorV788?:GovernorTraceV788;browser?:{hidden:boolean;canvasCount:number}};
export type GovernorReviewV788={format:'sonic-concert-governor-review-v788';status:'ready'|'blocked';issues:string[];targetFps:GovernorTargetV788;
 rows:{id:string;avatars:2|4;fpsOff:number;fpsOn:number;p95Off:number;p95On:number;callsOff:number;callsOn:number;levelOneFrames:number;levelTwoFrames:number;switches:number;reachedTarget:boolean;notes:string[]}[];notes:string[]};
const SCENES=['cyberpunk','rock','galaxy'] as const,COUNTS=[2,4] as const;
const okNum=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const keysMatch=(a:object,b:object,keys:readonly string[])=>keys.every(key=>JSON.stringify((a as Record<string,unknown>)[key])===JSON.stringify((b as Record<string,unknown>)[key]));
const avg=(items:readonly number[])=>items.reduce((s,x)=>s+x,0)/items.length;
const rnd=(x:number)=>Math.round(x*100)/100;
export function reviewConcertGovernorV788(input:unknown,targetFps:GovernorTargetV788=45):GovernorReviewV788{
 const issues:string[]=[],rows:GovernorReviewV788['rows']=[];
 const runs=Array.isArray(input)?input as GovernorRunV788[]:[];
 if(![30,45,60].includes(targetFps))issues.push('FPS-Ziel ungültig');
 if(runs.length!==4)issues.push('Vier abwechselnde vollständige Browserläufe erforderlich (off/on/on/off)');
 for(let i=0;i<runs.length;i++){
  const r=runs[i],mode=GOVERNOR_ORDER_V788[i] as GovernorModeV788;
  if(i>=4||!r||r.status!=='ok'||!r.report||!r.governorV788){issues.push(`Messung ${i+1} fehlt oder ist blockiert`);continue}
  const a=r.report,g=r.governorV788;
  if(a.format!=='sonic-concert-benchmark-v777'||a.version!==1||g.format!=='sonic-concert-governor-v788'||g.version!==1||g.mode!==mode||g.target!==targetFps||a.config.governorV788!==mode||a.config.targetV788!==targetFps||a.config.profileV779!=='cinematic'||a.config.interpolationV782!=='on'||a.config.lipGuardV783!=='on'||a.config.cameraV784!=='on'||a.config.lyricsV785!=='on'||g.config.profile!=='cinematic'||g.config.protect!=='avatar-mouth-lyrics-camera-v1'||g.config.windowFrames!==24)issues.push(`Messung ${i+1}: Konfiguration/Schutzpriorität ungültig`);
  if(a.environment.softwareRenderer||!/^[0-9]+x[0-9]+$/.test(a.environment.viewport)||!a.environment.renderer||!a.environment.userAgent)issues.push(`Messung ${i+1}: GPU-/Viewport-Nachweis fehlt`);
  if(!r.browser||r.browser.hidden||r.browser.canvasCount!==1)issues.push(`Messung ${i+1}: unsichtbarer Tab oder falsche Canvas-Anzahl`);
  if(!keysMatch(g.environment,a.environment,['renderer','userAgent','viewport','dpr','antialias','softwareRenderer'])||!keysMatch(g.assets,a.assets,['hashes','mode'])||!keysMatch(g.config,a.config,['passes','warmupFrames','sampleFrames']))issues.push(`Messung ${i+1}: GPU/GLB/Frames des Governor-Berichts weichen ab`);
  if(a.scenes.length!==6||g.scenes.length!==a.config.passes*6||!okNum(a.config.sampleFrames,90,600)||!okNum(a.config.passes,1,4)||!okNum(a.config.warmupFrames,45,240)||JSON.stringify(a.config.stages)!==JSON.stringify(SCENES)||JSON.stringify(a.config.counts)!==JSON.stringify(COUNTS))issues.push(`Messung ${i+1}: sechs vollständige Szenen erforderlich`);
  for(const count of COUNTS)for(const stage of SCENES){const id=`${stage}-${count}glb`,s=a.scenes.find(c=>c.id===id);
   if(!s||s.stage!==stage||s.avatarCount!==count||!okNum(s.fps,.1,1000)||!okNum(s.p95Ms,.01,5000)||!okNum(s.avgCalls,.01,1e6)||!okNum(s.frames,60,5000))issues.push(`Messung ${i+1}: fehlerhafte FPS-Szene ${id}`);
   for(let pass=0;pass<a.config.passes;pass++){
    const found=g.scenes.filter(c=>c.id===id&&c.pass===pass);
    if(found.length!==1){issues.push(`Messung ${i+1}: fehlende/mehrfache Governor-Szene ${id} Pass ${pass}`);continue}
    const t=found[0];
    if(t.avatars!==count||(t.frames<a.config.sampleFrames-3||t.frames>a.config.sampleFrames+2)||!Array.isArray(t.levelFrames)||t.levelFrames.length!==3||t.levelFrames.some(n=>!Number.isInteger(n)||n<0)||t.levelFrames.reduce((v,n)=>v+n,0)!==t.frames||t.invalidFrames!==0||!Number.isInteger(t.windowCount)||t.windowCount!==Math.floor(t.frames/24)||![0,1,2].includes(t.finalLevel)||!Array.isArray(t.transitions))issues.push(`Messung ${i+1}: invalides Governor-Frameprotokoll ${id}`);
    if(mode==='off'&&(t.finalLevel!==0||t.levelFrames[1]!==0||t.levelFrames[2]!==0||t.transitions.length))issues.push('Governor-OFF hat dennoch die Qualität geändert');
    let level=0,frame=0;
    for(const transition of t.transitions){if(!Number.isInteger(transition.frame)||transition.frame<=frame||transition.frame>t.frames||transition.from!==level||Math.abs(transition.to-level)!==1||!okNum(transition.windowP95Ms,.001,5000)||!['frame-budget-exceeded','sustained-recovery'].includes(transition.reason)){issues.push(`Ungültige V788-Transition in ${id}`);break}frame=transition.frame;level=transition.to}
    if(level!==t.finalLevel)issues.push(`V788-Endlevel stimmt nicht mit Transitionen überein (${id})`);
   }
  }
 }
 const base=runs[0]?.report;
 if(base)for(let i=1;i<runs.length;i++){const r=runs[i]?.report;if(!r)continue;
  for(const [label,keys] of [['GPU',['userAgent','renderer','viewport','dpr','antialias','softwareRenderer']],['GLB',['hashes','bytes','mode','animations','skinnedMeshes','mouthMorphs']],['Test',['fixtureId','stages','counts','passes','warmupFrames','sampleFrames','audioMode','lyricsMode','lipMode','profileV779','interpolationV782','lipGuardV783','cameraV784','lyricsV785','targetV788']]] as const){
   const x=label==='GPU'?base.environment:label==='GLB'?base.assets:base.config,y=label==='GPU'?r.environment:label==='GLB'?r.assets:r.config;
   if(!keysMatch(x,y,keys))issues.push(`Messung ${i+1}: ${label}-Vergleich unzulässig`);
  }
 }
 if(!issues.length)for(const avatars of COUNTS)for(const stage of SCENES){const id=`${stage}-${avatars}glb`;
  const samples=(mode:GovernorModeV788)=>runs.filter(r=>r.governorV788?.mode===mode);
  const off=samples('off'),on=samples('on');
  const measured=(values:GovernorRunV788[],key:'fps'|'p95Ms'|'avgCalls')=>avg(values.map(v=>v.report!.scenes.find(s=>s.id===id)![key]));
  const traces=on.flatMap(r=>r.governorV788!.scenes.filter(s=>s.id===id));
  const fpsOn=measured(on,'fps'),p95On=measured(on,'p95Ms');
  rows.push({id,avatars,fpsOff:rnd(measured(off,'fps')),fpsOn:rnd(fpsOn),p95Off:rnd(measured(off,'p95Ms')),p95On:rnd(p95On),callsOff:rnd(measured(off,'avgCalls')),callsOn:rnd(measured(on,'avgCalls')),
   levelOneFrames:traces.reduce((n,s)=>n+s.levelFrames[1],0),levelTwoFrames:traces.reduce((n,s)=>n+s.levelFrames[2],0),switches:traces.reduce((n,s)=>n+s.transitions.length,0),
   reachedTarget:fpsOn>=targetFps&&p95On<=1000/targetFps,notes:traces.every(s=>s.transitions.length===0)?['Der Governor musste in dieser Szene nicht eingreifen.']:[]});
 }
 return {format:'sonic-concert-governor-review-v788',status:issues.length?'blocked':'ready',issues,targetFps,rows,
  notes:['Die Schutzpriorität ist als unveränderter Codepfad geprüft, keine unabhängige visuelle Lip-Sync-/Lyrics-Qualitätsgarantie.',
   'FPS/P95 basieren ausschließlich auf Browsermessungen mit synthetischem Audiosignal. Keine hardwareübergreifende Prognose.',
   'Ein Qualitätswechsel spart nicht automatisch Draw Calls; Änderungen an Licht/Shader können sich unterschiedlich auswirken.',
   'Keine automatische Übernahme in den produktiven Spotify-Konzertmodus.']};
}
