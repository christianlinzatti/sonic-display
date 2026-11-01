/** V776 deterministic summary/comparison, intentionally independent of React and Three.js. */
export const BENCHMARK_STAGES_V776 = ['classic','galaxy','cyberpunk','white','rock','vaporwave'] as const;
export type StageNameV776 = typeof BENCHMARK_STAGES_V776[number];
export type FrameV776 = {ms:number;calls:number;triangles:number;geometries:number;textures:number;programs:number|null;contextLost:boolean};
export type SceneV776 = {stage:StageNameV776;frames:number;fps:number;p95Ms:number;avgCalls:number;avgTriangles:number;maxGeometries:number;maxTextures:number;maxPrograms:number|null};
export type ReportV776 = {format:'sonic-stage-benchmark-v776';version:1;label:string;measuredAt:string;environment:{userAgent:string;renderer:string;viewport:string;dpr:number;antialias:boolean;softwareRenderer:boolean};config:{fixtureId:'v776-fixed-stages-two-actors-v1';stages:readonly StageNameV776[];passes:number;warmupFrames:number;sampleFrames:number;avatarCount:number;audioMode:string};scenes:SceneV776[];raw?:Record<string,FrameV776[]>};
const avg=(values:number[])=>values.reduce((sum,v)=>sum+v,0)/values.length;
const valid=(f:FrameV776)=>Number.isFinite(f.ms)&&f.ms>0&&f.ms<5000&&Number.isFinite(f.calls)&&f.calls>=0&&Number.isFinite(f.triangles)&&f.triangles>=0&&Number.isFinite(f.geometries)&&f.geometries>=0&&Number.isFinite(f.textures)&&f.textures>=0&&!f.contextLost;
export function summarizeSceneV776(stage:StageNameV776,frames:readonly FrameV776[]):SceneV776{
  if(!frames.length||frames.some(f=>!valid(f)))throw new Error('Ungültige WebGL-Messpunkte: '+stage);
  if(!frames.some(f=>f.calls>0))throw new Error('Keine realen Draw Calls: '+stage);
  const times=frames.map(f=>f.ms).sort((a,b)=>a-b);
  // Measured delivered frame rate, not a theoretical estimate from a single frame.
  const totalMs=times.reduce((a,b)=>a+b,0);
  const programs=frames.map(f=>f.programs).filter((x):x is number=>x!==null&&Number.isFinite(x));
  return {stage,frames:frames.length,fps:Number((frames.length*1000/totalMs).toFixed(2)),p95Ms:Number(times[Math.ceil(.95*times.length)-1].toFixed(2)),
    avgCalls:Number(avg(frames.map(f=>f.calls)).toFixed(2)),avgTriangles:Number(avg(frames.map(f=>f.triangles)).toFixed(2)),
    maxGeometries:Math.max(...frames.map(f=>f.geometries)),maxTextures:Math.max(...frames.map(f=>f.textures)),
    maxPrograms:programs.length?Math.max(...programs):null};
}
export type CompareV776={status:'comparable'|'incompatible';warnings:string[];rows:{stage:string;fpsBefore:number;fpsAfter:number;fpsPct:number;p95Before:number;p95After:number;p95Pct:number;callsBefore:number;callsAfter:number;callsPct:number;trianglesPct:number;geometriesDelta:number;texturesDelta:number;programsDelta:number|null}[]};
const pct=(before:number,after:number)=>before===0?0:Number(((after-before)/before*100).toFixed(1));
export function compareStageReportsV776(before:ReportV776,after:ReportV776):CompareV776{
  const warnings:string[]=[];
  if(before.format!=='sonic-stage-benchmark-v776'||after.format!=='sonic-stage-benchmark-v776'||before.version!==1||after.version!==1)warnings.push('Inkompatibles Berichtsformat');
  for(const key of ['userAgent','renderer','viewport','dpr','antialias','softwareRenderer'] as const){if(before.environment[key]!==after.environment[key])warnings.push('Andere Messumgebung: '+key);}
  for(const key of ['fixtureId','stages','passes','warmupFrames','sampleFrames','avatarCount','audioMode'] as const){if(JSON.stringify(before.config[key])!==JSON.stringify(after.config[key]))warnings.push('Andere Testkonfiguration: '+key);}
  const a=new Map(after.scenes.map(s=>[s.stage,s]));
  if(before.scenes.length!==after.scenes.length||before.scenes.some(s=>!a.has(s.stage)))warnings.push('Bühnen unterscheiden sich');
  const rows=before.scenes.flatMap(b=>{const n=a.get(b.stage);if(!n)return [];
    if(b.frames!==n.frames)warnings.push('Unterschiedliche Stichproben: '+b.stage);
    return [{stage:b.stage,fpsBefore:b.fps,fpsAfter:n.fps,fpsPct:pct(b.fps,n.fps),p95Before:b.p95Ms,p95After:n.p95Ms,p95Pct:pct(b.p95Ms,n.p95Ms),
      callsBefore:b.avgCalls,callsAfter:n.avgCalls,callsPct:pct(b.avgCalls,n.avgCalls),trianglesPct:pct(b.avgTriangles,n.avgTriangles),
      geometriesDelta:n.maxGeometries-b.maxGeometries,texturesDelta:n.maxTextures-b.maxTextures,
      programsDelta:n.maxPrograms!==null&&b.maxPrograms!==null?n.maxPrograms-b.maxPrograms:null}];});
  return {status:warnings.length?'incompatible':'comparable',warnings,rows};
}
