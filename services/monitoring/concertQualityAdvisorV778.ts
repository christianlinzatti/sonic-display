/** V778 – evidence-aware recommendations from ACTUAL V777 browser reports.
 * Never manufactures FPS, extrapolates to other resolutions or certifies hardware.
 * Pure TypeScript so UI and offline CLI use precisely the same rules. */
import type {ConcertReportV777,ConcertCompareV777} from './concertBenchmarkV777';

export type TargetFpsV778=30|45|60;
export type QualityHintV778='high'|'balanced'|'low';
export type ConcertQualityCaseV778={
 id:string;stage:'cyberpunk'|'rock'|'galaxy';avatars:2|4;fps:number;p95Ms:number;
 drawCalls:number;triangles:number;frameBudgetMs:number;targetReached:boolean;
 frameBudgetMarginMs:number;qualityHint:QualityHintV778;
};
export type ConcertQualityGroupV778={avatars:2|4;targetReached:boolean;worstStage:string;minFps:number;maxP95Ms:number;maxCalls:number;recommendedQuality:QualityHintV778};
export type ConcertQualityAdviceV778={format:'sonic-concert-quality-advisor-v778';version:1;
 status:'ready'|'blocked';targetFps:TargetFpsV778;issues:string[];notes:string[];
 source:{label:string;mode:'reference'|'user-glb'|null;renderer:string|null;viewport:string|null;softwareRenderer:boolean|null};
 evidence:'unavailable'|'reference-only'|'software-only'|'fixture-only';
 cases:ConcertQualityCaseV778[];groups:ConcertQualityGroupV778[];
 recommendedAvatars:2|4|null;recommendedQuality:QualityHintV778|null;
 recommendations:string[];hardwareVerdict:string;
};
const STAGES=['cyberpunk','rock','galaxy'] as const;
const COUNTS=[2,4] as const;
const finite=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const pctRound=(v:number)=>Math.round(v*10)/10;
const name=(s:string)=>({cyberpunk:'Cyberpunk',rock:'Rock Arena',galaxy:'Galaxy'} as Record<string,string>)[s]||s;
const blocked=(targetFps:TargetFpsV778, issues:string[]):ConcertQualityAdviceV778=>({
 format:'sonic-concert-quality-advisor-v778',version:1,status:'blocked',targetFps,issues,notes:[],
 source:{label:'',mode:null,renderer:null,viewport:null,softwareRenderer:null},evidence:'unavailable',
 cases:[],groups:[],recommendedAvatars:null,recommendedQuality:null,recommendations:[],
 hardwareVerdict:'Keine Hardwareaussage: kein vollständig gültiger, echter V777-Browserbericht.'
});
/** Accepts either raw V777 report or the browser runner's {status:'ok', report} JSON.
 * Blocked CDP reports are never treated as successful measurements. */
export function assessConcertQualityV778(input:unknown, targetFps:TargetFpsV778=60):ConcertQualityAdviceV778{
 if(![30,45,60].includes(targetFps))return blocked(60,['Ungültiges FPS-Ziel.']);
 if(!input||typeof input!=='object')return blocked(targetFps,['JSON-Bericht fehlt.']);
 const wrapper=input as {status?:unknown;report?:unknown};
 if(wrapper.status!==undefined&&wrapper.status!=='ok')return blocked(targetFps,['Browserlauf war blockiert oder fehlgeschlagen.']);
 const r=(wrapper.report??input) as ConcertReportV777;
 if(!r||typeof r!=='object'||r.format!=='sonic-concert-benchmark-v777'||r.version!==1)
  return blocked(targetFps,['Kein V777-Konzert-Benchmarkbericht (Version 1).']);
 const issues:string[]=[];
 if(!r.environment||typeof r.environment.renderer!=='string'||!r.environment.renderer.trim()||
    typeof r.environment.userAgent!=='string'||!r.environment.userAgent.trim()||
    typeof r.environment.viewport!=='string'||!/^\d+x\d+$/.test(r.environment.viewport)||
    !finite(r.environment.dpr,.5,4)||typeof r.environment.softwareRenderer!=='boolean')issues.push('Messumgebung fehlt oder ist unplausibel.');
 if(!r.config||r.config.fixtureId!=='v777-stages-glb-dance-lips-lyrics-fx-v1'||
    JSON.stringify(r.config.stages)!==JSON.stringify(STAGES)||JSON.stringify(r.config.counts)!==JSON.stringify(COUNTS)||
    !finite(r.config.passes,1,4)||!finite(r.config.warmupFrames,45,240)||!finite(r.config.sampleFrames,90,600)||
    r.config.audioMode!=='deterministic-synthetic-beat-v1'||r.config.lyricsMode!=='synthetic-3d-text-v1'||r.config.lipMode!=='named-morph-v1')
  issues.push('V777-Fixture oder Testeinstellungen unvollständig/inkompatibel.');
 if(!r.assets||!['reference','user-glb'].includes(r.assets.mode)||!Array.isArray(r.assets.hashes)||
    !r.assets.hashes.length||r.assets.hashes.length>2||r.assets.hashes.some(x=>typeof x!=='string'||!/^[0-9a-f]{64}$/i.test(x))||
    !Array.isArray(r.assets.bytes)||r.assets.bytes.length!==r.assets.hashes.length||r.assets.bytes.some(n=>!finite(n,1,2e9))||
    !finite(r.assets.animations,1,10000)||!finite(r.assets.skinnedMeshes,1,10000)||!finite(r.assets.mouthMorphs,1,10000))
  issues.push('GLB-Herkunft, SHA-256 oder Rig-Metadaten fehlen.');
 const expected=COUNTS.flatMap(c=>STAGES.map(s=>`${s}-${c}glb`));
 if(!Array.isArray(r.scenes)||r.scenes.length!==expected.length||
    new Set(r.scenes.map(x=>x?.id)).size!==expected.length||expected.some(id=>!r.scenes.some(x=>x?.id===id)))
  issues.push('Sechs eindeutige Testszenen (2 und 4 GLBs) erforderlich.');
 if(Array.isArray(r.scenes))for(const s of r.scenes){
  if(!s||!STAGES.includes(s.stage)||!COUNTS.includes(s.avatarCount)||s.id!==`${s.stage}-${s.avatarCount}glb`||
     !finite(s.frames,60,10000)||!finite(s.fps,.1,1000)||!finite(s.p95Ms,.01,5000)||
     !finite(s.avgCalls,.01,1000000)||!finite(s.avgTriangles,0,1e12)||
     !finite(s.maxGeometries,0,1e7)||!finite(s.maxTextures,0,1e7)||
     !(s.maxPrograms===null||finite(s.maxPrograms,0,1e7)))issues.push('Ungültige oder fehlende Render-Metriken: '+(s?.id||'?'));
 }
 if(issues.length)return blocked(targetFps,issues);
 const budget=1000/targetFps;
 const ordered=expected.map(id=>r.scenes.find(s=>s.id===id)!);
 const cases:ConcertQualityCaseV778[]=ordered.map(s=>{
  const targetReached=s.fps>=targetFps*.9&&s.p95Ms<=budget;
  return {id:s.id,stage:s.stage,avatars:s.avatarCount,fps:s.fps,p95Ms:s.p95Ms,
   drawCalls:s.avgCalls,triangles:s.avgTriangles,frameBudgetMs:pctRound(budget),targetReached,
   frameBudgetMarginMs:pctRound(budget-s.p95Ms),
   qualityHint:targetReached&&(s.p95Ms<=budget*.8&&s.fps>=targetFps*.95)?'high':targetReached?'balanced':'low'};
 });
 const groups:ConcertQualityGroupV778[]=COUNTS.map(avatars=>{
  const list=cases.filter(s=>s.avatars===avatars),worst=list.reduce((a,b)=>a.p95Ms>=b.p95Ms?a:b);
  const targetReached=list.every(s=>s.targetReached);
  return {avatars,targetReached,worstStage:name(worst.stage),minFps:Math.min(...list.map(s=>s.fps)),
   maxP95Ms:Math.max(...list.map(s=>s.p95Ms)),maxCalls:Math.max(...list.map(s=>s.drawCalls)),
   recommendedQuality:targetReached&&list.every(s=>s.qualityHint==='high')?'high':targetReached?'balanced':'low'};
 });
 const four=groups[1],two=groups[0];
 const recommendedAvatars:2|4|null=four.targetReached?4:two.targetReached?2:null;
 const recommendedQuality:QualityHintV778=recommendedAvatars===4?four.recommendedQuality:recommendedAvatars===2?two.recommendedQuality:'low';
 const mode=r.assets.mode;
 const evidence=r.environment.softwareRenderer?'software-only':mode==='reference'?'reference-only':'fixture-only';
 const notes=[
  'Nur die V777-Konzert-Fixture: vorgegebene Beats/Vocals und 3D-Testlyrics; kein Spotify, keine reale Audioanalyse oder vollständige Show-Regie.',
  'Geometrien, Texturen und Shader sind WebGL-Objektzahlen, keine VRAM-Messung. Draw Calls/Dreiecke erlauben keine sichere CPU-/GPU-Engpassdiagnose.',
  'Empfohlene Einstellungen sind ein Ausgangspunkt. Ihre konkrete FPS-Wirkung wurde nicht gemessen; nach jeder Änderung erneut benchmarken.',
 ];
 if(mode==='reference')notes.push('Nur die sehr kleine Referenz-GLB gemessen. Nicht repräsentativ für aufwendige Tänzer-Rigs.');
 if(r.environment.softwareRenderer)notes.push('Software-/SwiftShader-Rendering: keine Aussage über echte Grafikhardware.');
 if(r.environment.viewport!=='960x540'||r.environment.dpr!==1)notes.push('Abweichende Auflösung oder DPR; andere Testläufe sind nicht ohne Prüfung vergleichbar.');
 if(r.config.sampleFrames<180)notes.push('Kurzer Messdurchlauf: mehr Frames und wiederholte Läufe erhöhen die Aussagekraft.');
 const recommendations:string[]=[];
 if(recommendedAvatars===4)recommendations.push(`In dieser Fixture erreichen vier GLBs auf allen drei Bühnen das ${targetFps}-FPS-Ziel (FPS und P95).`);
 else if(recommendedAvatars===2)recommendations.push(`Zwei GLBs erreichen das ${targetFps}-FPS-Ziel; mit vier GLBs verfehlt mindestens eine Bühne den Grenzwert. Für vier zunächst Effekte/Lichter reduzieren und erneut messen.`);
 else recommendations.push(`Selbst mit zwei GLBs wurde das ${targetFps}-FPS-Ziel nicht durchgängig erreicht. Zuerst ein Low-Profil erproben oder ein niedrigeres FPS-Ziel wählen.`);
 const stageScalings=STAGES.map(stage=>{
  const a=cases.find(c=>c.stage===stage&&c.avatars===2)!,b=cases.find(c=>c.stage===stage&&c.avatars===4)!;
  return {stage,change:b.p95Ms-a.p95Ms,drawCalls:b.drawCalls-a.drawCalls,triangles:b.triangles-a.triangles};
 });
 const biggest=stageScalings.reduce((a,b)=>a.change>=b.change?a:b);
 if(biggest.change>budget*.25)recommendations.push(`Beim Wechsel von zwei auf vier GLBs steigt P95 auf ${name(biggest.stage)} um ${biggest.change.toFixed(1)} ms; dort zuerst Avatar-LOD und Animationslast prüfen.`);
 const busiest=cases.reduce((a,b)=>a.drawCalls>=b.drawCalls?a:b);
 if(busiest.drawCalls>150)recommendations.push(`${name(busiest.stage)} (${busiest.avatars} GLBs) erreicht ${busiest.drawCalls.toFixed(0)} Draw Calls: Batching-/LOD-Kandidaten prüfen, ohne ein GPU-Limit zu behaupten.`);
 if(cases.some(x=>!x.targetReached))recommendations.push('Als Versuch zuerst Visual-FX-Profil „low“, reduzierte Nebelschichten und optionale Spotlights testen; Lyrics und Vocal-Sync möglichst beibehalten.');
 if(!recommendations.some(x=>x.includes('erneut messen')))recommendations.push('Gewähltes Qualitätsprofil mit denselben GLBs, derselben Auflösung und einem weiteren Browserdurchlauf prüfen.');
 // Do not infer a Raspberry Pi/mini-PC model from a desktop fixture, even at 60 FPS.
 const hardwareVerdict=evidence==='fixture-only'
   ?'Eigene GLBs auf realer GPU gemessen. Aussage nur über diese Hardware, Auflösung und Fixture; kein belastbares Raspberry-Pi-/Mini-PC-Modell ableitbar.'
   :evidence==='reference-only'
   ?'Referenz-GLB ist zu klein für eine Hardware-Kaufentscheidung. Mit produktiven GLBs, Zielauflösung und Zielgerät erneut testen.'
   :'Software-Renderer-Test ist nicht als Hardware-Benchmark geeignet. Auf einer realen GPU mit eigenen GLBs erneut messen.';
 return {format:'sonic-concert-quality-advisor-v778',version:1,status:'ready',targetFps,issues:[],notes,
  source:{label:String(r.label||'V777').slice(0,80),mode,renderer:r.environment.renderer,
    viewport:r.environment.viewport,softwareRenderer:r.environment.softwareRenderer},evidence,cases,groups,
  recommendedAvatars,recommendedQuality,recommendations,hardwareVerdict};
}

export type ConcertQualityComparisonV778={status:'comparable'|'incompatible';summary:string;improved:number;regressed:number;neutral:number;warnings:string[]};
/** A comparison is a release-fixture delta, NOT a guarantee for any other song, GPU or device. */
export function summarizeConcertQualityComparisonV778(compare:ConcertCompareV777):ConcertQualityComparisonV778{
 if(!compare||compare.status!=='comparable'||compare.rows.length!==6||compare.warnings.length)
  return {status:'incompatible',summary:'Die Berichte sind nicht streng vergleichbar.',improved:0,regressed:0,neutral:0,warnings:compare?.warnings??['Kein Vergleich']};
 let improved=0,regressed=0,neutral=0;
 for(const row of compare.rows){
  if(row.fpsPct>3&&row.p95Pct< -3)improved++;
  else if(row.fpsPct< -3&&row.p95Pct>3)regressed++;
  else neutral++;
 }
 return {status:'comparable',summary:`In der V777-Fixture: ${improved} deutlich bessere, ${regressed} deutlich schlechtere und ${neutral} uneindeutige/ähnliche Szenen (Schwelle ±3 % bei FPS und P95).`,improved,regressed,neutral,warnings:[]};
}
