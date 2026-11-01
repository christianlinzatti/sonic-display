#!/usr/bin/env node
'use strict';
/** V786 standalone CLI: reads local GLBs, produces read-only structured and human report. */
const fs=require('node:fs'),path=require('node:path');
const {profileGlbV786,matchConcertBenchmarkV786}=require('../services/monitoring/avatarComplexityV786.cjs');
const args=process.argv.slice(2);
const option=(key)=>args.find(x=>x.startsWith(`--${key}=`))?.slice(key.length+3);
const sources=args.filter(x=>x.startsWith('--glb=')).map(x=>x.slice(6));
const out=path.resolve(option('out')||'artifacts/v786/avatar-complexity.json');
const fmt=(n)=>new Intl.NumberFormat('de-DE').format(n);
function reportMarkdownV786(report){
 const lines=['# V786 – GLB-Komplexitätsanalyse','',`Status: ${report.status}. Kein GPU-Benchmark, keine Hardware-Freigabe.`,`GLB-Dateien: ${report.avatars.length}.`,''];
 for(const p of report.avatars){lines.push(`## ${p.fileName}`,'',`SHA-256: \`${p.sha256}\``,
  `- Quelldatei: ${fmt(p.sourceBytes)} Bytes`,`- Dreiecke je GLB-Standardszene: ${fmt(p.scene.triangles)}`,
  `- Ungefähre Mesh-Draw-Calls: ${fmt(p.scene.estimatedMeshDrawCalls)}`,
  `- Skin-Joints: ${p.scene.usedSkinJoints}, verwendete Materialien: ${p.resources.usedMaterialCount}`,
  `- Morph-Targets: ${p.morph.namedTargets.length}, Mund-Kandidaten: ${p.morph.mouthCandidates.join(', ')||'keine'}`,
  `- Animationsclips: ${p.animations.clips}, Kanäle: ${p.animations.channels}`,
  `- RGBA8+Mip-Szenario (nicht gemessener VRAM): ${fmt(p.resources.estimatedRgba8MipBytes)} Bytes; unbekannte Bilder: ${p.resources.unknownTextureEstimates}`,
  '', '### Geometrie-Hotspots','');
  for(const h of p.hotspots.slice(0,10))lines.push(`- ${h.name}: ${fmt(h.sceneTriangles)} Dreiecke (${h.instances} Instanzen, ${h.estimatedDrawCalls} Draw-Calls-Schaetzung)`);
  lines.push('', '### Hinweise','');for(const r of p.risks)lines.push(`- **${r.severity} · ${r.type}**: ${r.message}`);
  if(p.risks.length===0)lines.push('- Keine Schwellenwert-Hinweise (keine Garantie fuer Performance).');lines.push('');
 }
 lines.push('## Gemessener Konzertbenchmark','');if(report.benchmark?.status==='measured'){
  lines.push('Hash- und Fixture-Abgleich bestanden. Real gemessene Daten aus dem importierten V777-Bericht:','');
  for(const s of report.benchmark.scenes)lines.push(`- ${s.id}: FPS ${s.fps}, P95 ${s.p95Ms} ms, Draw Calls ${s.avgCalls}`);
 }else lines.push('**Keine belastbaren FPS-Daten verknuepft.** '+(report.benchmark?.warnings?.join('; ')||'Kein --benchmark angegeben.'));
 lines.push('','## Hinweise zur Interpretation','',
  'Die GLB-Statik umfasst die Standard-Szene; externe Animationen, Texture-Streaming, Shader und Live-Szene sind nicht abgebildet.',
  'Ein 2x/4x Avatar-Wert ist kein automatischer FPS-Wert. Gemeinsame WebGL-Assets duerfen nicht einfach vierfach als VRAM gerechnet werden.',
  'Daten alleine rechtfertigen keine Raspberry-Pi-/Mini-PC-Kaufentscheidung.');return lines.join('\n')+'\n';
}
function run(argv=args){
 if(argv.includes('--help')||!sources.length){console.log('Usage: npm run benchmark:v786:avatar -- --glb=public/benchmark/v777-reference-performer.glb [--glb=path/to/another.glb] [--benchmark=artifacts/v777/report.json] [--out=artifacts/v786/avatar-complexity.json]');return sources.length?0:2}
 if(sources.length>12)throw Error('Maximal 12 GLBs je Durchlauf');
 const avatars=sources.map(src=>{const file=path.resolve(src),stat=fs.statSync(file);if(!stat.isFile())throw Error('Kein GLB: '+src);
  return profileGlbV786(fs.readFileSync(file),path.basename(file));});
 const benchmarkFile=option('benchmark');let benchmark=null;
 if(benchmarkFile){let value=JSON.parse(fs.readFileSync(path.resolve(benchmarkFile),'utf8'));
  benchmark=matchConcertBenchmarkV786(avatars,value?.report||value);}
 const report={format:'sonic-avatar-complexity-batch-v786',version:1,status:'ready',avatars,benchmark,
  measuredGpu:false,notes:['Statische GLB-Geometriedaten; keine Laufzeit-FPS ohne optionalen kompatiblen V777-Bericht','Modelle werden nicht geaendert']};
 fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
 const md=out.replace(/\.json$/i,'')+'.md';fs.writeFileSync(md,reportMarkdownV786(report));
 console.log(`V786: ${avatars.length} GLB(s) untersucht. JSON ${out} | Markdown ${md}`);
 if(benchmark?.status==='blocked')console.warn('Benchmark NICHT verknuepft: '+benchmark.warnings.join('; '));
 return benchmark?.status==='blocked'?2:0;
}
if(require.main===module){try{process.exitCode=run();}catch(error){console.error('V786 FEHLER: '+error.message);process.exitCode=1;}}
module.exports={run,reportMarkdownV786};
