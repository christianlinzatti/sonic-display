'use strict';
/** V771: Conservative comparison of identical, warmed-up WebGL anchor scenes.
 * These are renderer.info counters, NOT VRAM measurements or proof of leak freedom.
 * Works on serialized V767 browser-run batches; has no browser/React dependency.
 */
const STAGES=['classic','galaxy','cyberpunk','white','rock','vaporwave'];
const isFiniteNonNegative=value=>typeof value==='number'&&Number.isFinite(value)&&value>=0;
const median=values=>{
  const sorted=[...values].sort((a,b)=>a-b),n=sorted.length;
  return n===0?null:n%2?sorted[(n-1)/2]:(sorted[n/2-1]+sorted[n/2])/2;
};
const round=value=>value==null?null:Math.round(value*100)/100;
function assessLongRunV771(batches,{minimumCycles=24}={}){
  const problems=[],warnings=[],anchors=[],summary=[];
  if(!Array.isArray(batches)||batches.length<3){
    return {status:'inconclusive',totalCycles:0,transitions:0,checkpoints:0,warnings:[],problems:['Mindestens drei unabhängige Testblöcke erforderlich.'],growth:null,batches:[]};
  }
  let totalCycles=0,transitions=0,previousModels;
  for(let batchIndex=0;batchIndex<batches.length;batchIndex++){
    const batch=batches[batchIndex];
    if(!batch||batch.format!=='sonic-v767-gpu-memory'||batch.version!==1){problems.push(`Block ${batchIndex+1}: unbekanntes Reportformat`);continue;}
    const models=batch.models,cycles=batch.cycles;
    if(!Array.isArray(models)||!Number.isSafeInteger(cycles)||cycles<8||cycles>100||batch.warmupCycles!==2){problems.push(`Block ${batchIndex+1}: ungültige Zykluskonfiguration`);continue;}
    if(previousModels!==undefined&&JSON.stringify(models)!==previousModels){problems.push('Die GLB-Modellliste hat sich zwischen Blöcken verändert.');continue;}
    previousModels=JSON.stringify(models);
    const stride=STAGES.length*(models.length+2)+1;
    if(!Array.isArray(batch.samples)||batch.samples.length!==(cycles+2)*stride){problems.push(`Block ${batchIndex+1}: unvollständige Messdaten`);continue;}
    const checkpoints=batch.samples.filter(s=>s.phase==='measure'&&s.step%stride===0);
    if(checkpoints.length!==cycles||checkpoints.some(s=>s.stage!=='classic'||s.avatar!=='procedural-a')){
      problems.push(`Block ${batchIndex+1}: Ankerszene nicht eindeutig`);continue;
    }
    if(batch.samples.some(s=>!isFiniteNonNegative(s.geometries)||!isFiniteNonNegative(s.textures)||
        !isFiniteNonNegative(s.drawCalls)||!isFiniteNonNegative(s.triangles)||
        (s.programs!==null&&!isFiniteNonNegative(s.programs))||s.contextLost)){
      problems.push(`Block ${batchIndex+1}: ungültige Messwerte oder verlorener WebGL-Kontext`);continue;
    }
    const stageIds=new Set(batch.samples.map(s=>s.stage));
    if(STAGES.some(stage=>!stageIds.has(stage))||!batch.samples.some(s=>s.drawCalls>0)){
      problems.push(`Block ${batchIndex+1}: Bühne oder echte Draw Calls fehlen`);continue;
    }
    totalCycles+=cycles;
    transitions+=cycles*STAGES.length*(models.length+2);
    anchors.push(...checkpoints);
    summary.push({batch:batchIndex+1,cycles,medianGeometry:median(checkpoints.map(x=>x.geometries)),
      medianTextures:median(checkpoints.map(x=>x.textures)),medianPrograms:median(checkpoints.map(x=>x.programs).filter(x=>x!==null))});
  }
  if(problems.length||totalCycles<minimumCycles||anchors.length<minimumCycles){
    if(totalCycles<minimumCycles)problems.push(`Mindestens ${minimumCycles} Messzyklen nötig, vorhanden: ${totalCycles}.`);
    return {status:'inconclusive',totalCycles,transitions,checkpoints:anchors.length,warnings,problems,growth:null,batches:summary};
  }
  const count=Math.min(8,Math.max(4,Math.floor(anchors.length/4)));
  const early=anchors.slice(0,count),late=anchors.slice(-count);
  const growth={};
  for(const [key,tolerance] of [['geometries',2],['textures',1],['programs',2]]){
    const initial=median(early.map(s=>s[key]).filter(v=>v!==null));
    const final=median(late.map(s=>s[key]).filter(v=>v!==null));
    const delta=initial!==null&&final!==null?final-initial:null;
    growth[key]={first:round(initial),last:round(final),delta:round(delta)};
    if(delta!==null&&delta>tolerance&&late.filter(s=>s[key]!=null&&s[key]>initial+tolerance).length>=count-1){
      warnings.push(`WebGL-${key}: anhaltender Anstieg an gleicher Ankerszene (+${round(delta)}).`);
    }
  }
  // Heap data is optional and should be taken after a forced, settled GC at each block boundary.
  const heaps=batches.map(b=>b?.afterGc?.jsHeapUsedBytes);
  const validHeaps=heaps.every(isFiniteNonNegative);
  if(validHeaps&&heaps.length>=4){
    const first=median(heaps.slice(0,2)),last=median(heaps.slice(-2)),delta=last-first;
    growth.jsHeapBytes={first,last,delta};
    if(delta>Math.max(24*1048576,first*.20)&&heaps.slice(-2).every(v=>v>first+Math.max(24*1048576,first*.20))){
      warnings.push(`JavaScript-Heap nach GC wächst zwischen den Blöcken weiter (+${round(delta/1048576)} MiB).`);
    }
  }else growth.jsHeapBytes=null;
  for(const [index,b] of batches.entries()){
    const cache=b?.afterGc?.cache;
    if(cache&&isFiniteNonNegative(cache.idleEstimatedBytes)&&isFiniteNonNegative(cache.idleByteBudget)&&
        cache.idleEstimatedBytes>cache.idleByteBudget){
      warnings.push(`GLB-Cache-Budget in Block ${index+1} überschritten.`);
    }
  }
  return {status:warnings.length?'suspect':'stable',totalCycles,transitions,checkpoints:anchors.length,
    warnings,problems,growth,batches:summary};
}
module.exports={assessLongRunV771,median,STAGES};
