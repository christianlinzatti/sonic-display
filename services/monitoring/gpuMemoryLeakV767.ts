/** V767: Renderer.info measures GPU object COUNTS, not GPU bytes or a proof of leak freedom.
 * Compare the SAME anchor scene after the full finite workload is warmed up.
 */
export type GpuSampleV767 = {
  cycle: number;
  step: number;
  stage: string;
  avatar: string;
  phase: 'warmup' | 'measure';
  geometries: number;
  textures: number;
  programs: number | null;
  drawCalls: number;
  triangles: number;
  contextLost: boolean;
  jsHeapBytes: number | null;
};
export type GpuAssessmentV767 = {
  status: 'stable' | 'suspect' | 'inconclusive';
  comparisons: number;
  first: {geometries:number;textures:number;programs:number|null};
  last: {geometries:number;textures:number;programs:number|null};
  growth: {geometries:number;textures:number;programs:number|null};
  warnings: string[];
};
const median = (numbers: readonly number[]): number => {
  const sorted = [...numbers].sort((a,b)=>a-b);
  return sorted.length % 2 ? sorted[(sorted.length-1)/2] : (sorted[sorted.length/2-1]+sorted[sorted.length/2])/2;
};
export function assessGpuMemoryV767(checkpoints: readonly GpuSampleV767[]): GpuAssessmentV767 {
  const warnings: string[] = [];
  const valid = checkpoints.filter(s => s.phase === 'measure' && s.stage === 'classic' && s.avatar === 'procedural-a');
  const empty = {geometries:0,textures:0,programs:null};
  if (valid.length < 8 || checkpoints.some(s => s.contextLost) || valid.some(s => ![s.geometries,s.textures,s.drawCalls,s.triangles].every(n => Number.isFinite(n) && n >= 0))) {
    warnings.push(valid.length < 8 ? 'Mindestens acht echte Messzyklen an derselben Ankerszene erforderlich.' : 'Kontextverlust oder ungültige WebGL-Messung.');
    return {status:'inconclusive',comparisons:valid.length,first:empty,last:empty,growth:{...empty},warnings};
  }
  const firstWindow=valid.slice(0,3), lastWindow=valid.slice(-4);
  const reference = (samples:GpuSampleV767[], key:'geometries'|'textures')=>median(samples.map(s=>s[key]));
  const initial = {geometries:reference(firstWindow,'geometries'),textures:reference(firstWindow,'textures'),programs:null as number|null};
  const final = {geometries:reference(lastWindow,'geometries'),textures:reference(lastWindow,'textures'),programs:null as number|null};
  const progFirst=firstWindow.map(s=>s.programs).filter((x):x is number=>x!==null);
  const progLast=lastWindow.map(s=>s.programs).filter((x):x is number=>x!==null);
  if(progFirst.length===firstWindow.length && progLast.length===lastWindow.length){
    initial.programs=median(progFirst);final.programs=median(progLast);
  }
  const growth={geometries:final.geometries-initial.geometries,textures:final.textures-initial.textures,
    programs:initial.programs!==null && final.programs!==null ? final.programs-initial.programs : null};
  // Growth must persist in every late checkpoint, not just the final draw.
  const persisted=(key:'geometries'|'textures',limit:number)=> lastWindow.every(s=>s[key]>initial[key]+limit);
  if(growth.geometries>2 && persisted('geometries',2))warnings.push(`Verdächtiger Geometrie-Anstieg an derselben Ankerszene: +${growth.geometries}.`);
  if(growth.textures>1 && persisted('textures',1))warnings.push(`Verdächtiger Textur-Anstieg an derselben Ankerszene: +${growth.textures}.`);
  if(growth.programs!==null && growth.programs>2 && lastWindow.every(s=>s.programs!==null && s.programs>initial.programs!+2)) warnings.push(`Shader-Programme sind nach Warm-up um ${growth.programs} gewachsen.`);
  return {status:warnings.length?'suspect':'stable',comparisons:valid.length,first:initial,last:final,growth,warnings};
}
