/** V777 concert-like GLB benchmark: measured renderer stats, deterministic stimulus, strict comparison.
 * Synthetic beat/vocal cues are explicitly NOT real microphone/Spotify analysis. */
export const CONCERT_BENCHMARK_STAGES_V777 = ['cyberpunk','rock','galaxy'] as const;
export const CONCERT_BENCHMARK_AVATAR_COUNTS_V777 = [2,4] as const;
export const V777_REFERENCE_GLB = '/benchmark/v777-reference-performer.glb';
export type ConcertStageV777=typeof CONCERT_BENCHMARK_STAGES_V777[number];
export type ConcertCaseV777={id:string;stage:ConcertStageV777;avatarCount:2|4};
export const CONCERT_CASES_V777:readonly ConcertCaseV777[]=CONCERT_BENCHMARK_AVATAR_COUNTS_V777.flatMap(avatarCount=>
  CONCERT_BENCHMARK_STAGES_V777.map(stage=>({id:`${stage}-${avatarCount}glb`,stage,avatarCount})));
export type ConcertFrameV777={ms:number;calls:number;triangles:number;geometries:number;textures:number;programs:number|null;contextLost:boolean};
export type ConcertSceneV777={id:string;stage:ConcertStageV777;avatarCount:2|4;frames:number;fps:number;p95Ms:number;avgCalls:number;avgTriangles:number;maxGeometries:number;maxTextures:number;maxPrograms:number|null};
export type ConcertAssetsV777={urls:string[];hashes:string[];bytes:number[];animations:number;skinnedMeshes:number;mouthMorphs:number;mode:'reference'|'user-glb'};
export type ConcertReportV777={format:'sonic-concert-benchmark-v777';version:1;label:string;measuredAt:string;
  environment:{userAgent:string;renderer:string;viewport:string;dpr:number;antialias:boolean;softwareRenderer:boolean};
  config:{fixtureId:'v777-stages-glb-dance-lips-lyrics-fx-v1';profileV779?:'cinematic'|'balanced'|'economy';interpolationV782?:'on'|'off';lipGuardV783?:'on'|'off';cameraV784?:'on'|'off';lyricsV785?:'on'|'off';governorV788?:'on'|'off';targetV788?:30|45|60;stages:readonly ConcertStageV777[];counts:readonly (2|4)[];passes:number;warmupFrames:number;sampleFrames:number;audioMode:'deterministic-synthetic-beat-v1';lyricsMode:'synthetic-3d-text-v1';lipMode:'named-morph-v1'};
  assets:ConcertAssetsV777;scenes:ConcertSceneV777[]};
export function normalizeGlbPathV777(value:unknown):string {
  if(typeof value!=='string'||value.length>500||!value.startsWith('/')||value.startsWith('//')||value.includes('\\')||value.includes('#')||value.includes('?')||/%2f|%5c|%2e/i.test(value)||value.split('/').some(s=>s==='.'||s==='..')||!(/\.glb$/i.test(value)))
    throw new Error('Nur lokale GLB-Pfade unter /…/*.glb erlaubt');
  return value;
}
/** Stable frame-index signal; no microphone, network music or personal account involved. */
export function syntheticConcertCueV777(frame:number){
  const f=Math.max(0,Math.floor(Number.isFinite(frame)?frame:0));
  const beat=f%26===0,phrase=Math.floor(f/104)%4;
  const vocal=phrase===3?0:Math.max(0,Math.sin(2*Math.PI*(f%11)/11))*.78;
  return {beat,kick:beat?1:.09,beatStrength:beat?1:.08,volume:.38+.18*vocal,
    bass:beat?.9:.32,mids:.4+.2*vocal,highs:.23,energyEnvelope:.56,
    attack:beat?.85:.19,decay:.26,snare:f%52===26?.8:.1,hiHat:f%13===0?.6:.1,vocal};
}
function average(v:readonly number[]){return v.reduce((a,b)=>a+b,0)/v.length}
export function summarizeConcertCaseV777(c:ConcertCaseV777,frames:readonly ConcertFrameV777[]):ConcertSceneV777{
  if(frames.length<30||frames.some(f=>!Number.isFinite(f.ms)||f.ms<=0||f.ms>5000||!Number.isFinite(f.calls)||f.calls<0||!Number.isFinite(f.triangles)||f.triangles<0||!Number.isFinite(f.geometries)||f.geometries<0||!Number.isFinite(f.textures)||f.textures<0||f.contextLost))throw Error('Ungültige echte Renderframes: '+c.id);
  if(!frames.some(f=>f.calls>0))throw Error('Keine Draw Calls: '+c.id);
  const sorted=frames.map(f=>f.ms).sort((a,b)=>a-b);
  const programs=frames.map(f=>f.programs).filter((n):n is number=>n!==null&&Number.isFinite(n));
  return {...c,frames:frames.length,fps:+(frames.length*1000/frames.reduce((s,f)=>s+f.ms,0)).toFixed(2),
    p95Ms:+sorted[Math.ceil(.95*sorted.length)-1].toFixed(2),
    avgCalls:+average(frames.map(f=>f.calls)).toFixed(2),avgTriangles:+average(frames.map(f=>f.triangles)).toFixed(2),
    maxGeometries:Math.max(...frames.map(f=>f.geometries)),maxTextures:Math.max(...frames.map(f=>f.textures)),
    maxPrograms:programs.length?Math.max(...programs):null};
}
export type ConcertCompareV777={status:'comparable'|'incompatible';warnings:string[];rows:{id:string;fpsBefore:number;fpsAfter:number;fpsPct:number;p95Before:number;p95After:number;p95Pct:number;callsBefore:number;callsAfter:number;callsPct:number;trianglesPct:number;geometriesDelta:number;texturesDelta:number;programsDelta:number|null}[]};
const pct=(a:number,b:number)=>a===0?0:+((b-a)/a*100).toFixed(1);
export function compareConcertReportsV777(before:ConcertReportV777,after:ConcertReportV777):ConcertCompareV777{
  const warnings:string[]=[];
  if(before.format!=='sonic-concert-benchmark-v777'||after.format!=='sonic-concert-benchmark-v777'||before.version!==1||after.version!==1)warnings.push('Berichtsformat inkompatibel');
  for(const key of ['userAgent','renderer','viewport','dpr','antialias','softwareRenderer'] as const)if(before.environment[key]!==after.environment[key])warnings.push('Messumgebung unterschiedlich: '+key);
  for(const key of ['fixtureId','profileV779','interpolationV782','lipGuardV783','cameraV784','lyricsV785','governorV788','targetV788','stages','counts','passes','warmupFrames','sampleFrames','audioMode','lyricsMode','lipMode'] as const)if(JSON.stringify(before.config[key])!==JSON.stringify(after.config[key]))warnings.push('Testkonfiguration unterschiedlich: '+key);
  for(const key of ['hashes','bytes','animations','skinnedMeshes','mouthMorphs','mode'] as const)if(JSON.stringify(before.assets[key])!==JSON.stringify(after.assets[key]))warnings.push('GLB-Assets unterschiedlich: '+key);
  // URL paths are allowed to differ across two local servers if bytes/hash match.
  if(before.scenes.length!==after.scenes.length||before.scenes.length!==CONCERT_CASES_V777.length)warnings.push('Anzahl Szenen abweichend');
  const bMap=new Map(after.scenes.map(s=>[s.id,s]));const ids=new Set<string>();
  const rows=before.scenes.flatMap(s=>{
    if(ids.has(s.id))warnings.push('Doppelte Szene: '+s.id);ids.add(s.id);
    const t=bMap.get(s.id);if(!t){warnings.push('Fehlende Szene: '+s.id);return []}
    if(s.stage!==t.stage||s.avatarCount!==t.avatarCount||s.frames!==t.frames)warnings.push('Messpunkte/Szene unterschiedlich: '+s.id);
    return [{id:s.id,fpsBefore:s.fps,fpsAfter:t.fps,fpsPct:pct(s.fps,t.fps),p95Before:s.p95Ms,p95After:t.p95Ms,p95Pct:pct(s.p95Ms,t.p95Ms),
      callsBefore:s.avgCalls,callsAfter:t.avgCalls,callsPct:pct(s.avgCalls,t.avgCalls),trianglesPct:pct(s.avgTriangles,t.avgTriangles),
      geometriesDelta:t.maxGeometries-s.maxGeometries,texturesDelta:t.maxTextures-s.maxTextures,
      programsDelta:t.maxPrograms!==null&&s.maxPrograms!==null?t.maxPrograms-s.maxPrograms:null}];
  });
  if(rows.length!==CONCERT_CASES_V777.length)warnings.push('Unvollständige Szenenliste');
  return {status:warnings.length?'incompatible':'comparable',warnings,rows};
}
