/** V998 – small, auditable command language for a LIVE virtual concert.
 * Neither AI nor offline parser can execute code, change devices or bypass enabled flags.
 * Results are suggestions until a person approves a song-bound diff.
 */
export type LiveTargetV998='atmosphere'|'stage'|'camera'|'fx';
export type LiveFieldV998='palette'|'look'|'mode'|'intensity'|'cap';
export interface LiveActionV998 {target:LiveTargetV998;field:LiveFieldV998;value:string}
export interface LivePlanV998 {title:string;explanation:string;actions:LiveActionV998[]}
export interface LiveSnapshotV998 {
 atmosphere:{enabled:boolean;palette:string;intensity:number};
 stage:{enabled:boolean;look:string;intensity:number};
 camera:{enabled:boolean;mode:string;intensity:number};
 fx:{enabled:boolean;auto:boolean;intensity:number};
}
export interface LiveDiffV998 {target:LiveTargetV998;field:LiveFieldV998;before:string|number;after:string|number}
const accepted:Record<LiveTargetV998,Record<string,readonly string[]|null>>={
 atmosphere:{palette:['noir','electric','arena','dream'],intensity:null},
 stage:{look:['noir','reactor','rock-arena','prism'],intensity:null},
 camera:{mode:['story','performer','festival'],intensity:null},
 fx:{cap:null},
};
const tidy=(x:unknown,max:number)=>typeof x==='string'?x.replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max):'';
export function normalizeLivePlanV998(value:unknown):LivePlanV998|null {
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const r=value as Record<string,unknown>;
 const title=tidy(r.title,72),explanation=tidy(r.explanation,290);
 if(!title||!explanation||!Array.isArray(r.actions)||r.actions.length>4)return null;
 const actions:LiveActionV998[]=[],seen=new Set<string>();
 for(const x of r.actions){
  if(!x||typeof x!=='object'||Array.isArray(x))return null;
  const a=x as Record<string,unknown>;
  if(typeof a.target!=='string'||!Object.hasOwn(accepted,a.target))return null;
  const target=a.target as LiveTargetV998;
  if(typeof a.field!=='string'||!Object.hasOwn(accepted[target],a.field)||typeof a.value!=='string')return null;
  const field=a.field as LiveFieldV998,value=a.value;
  const choices=accepted[target][field];
  if(choices){if(!choices.includes(value))return null;}
  else if(!/^(?:0|[1-9][0-9]?)$/.test(value)||Number(value)>75)return null;
  const identity=`${target}.${field}`;
  if(seen.has(identity))return null;
  seen.add(identity);actions.push({target,field,value});
 }
 return {title,explanation,actions};
}
/** Deterministic, clearly non-AI fallback. Unknown requests produce zero actions. */
export function localLivePlanV998(prompt:string):LivePlanV998 {
 const q=prompt.toLocaleLowerCase('de');
 const actions:LiveActionV998[]=[];
 const add=(target:LiveTargetV998,field:LiveFieldV998,value:string)=>{
  if(actions.length<4&&!actions.some(x=>x.target===target&&x.field===field))actions.push({target,field,value});
 };
 const rock=/\b(rock|metal|warm|stadion|arena|deutschrock)\b/.test(q);
 const neon=/hardtekk|hardstyle|neon|cyberpunk|rave/.test(q);
 const dark=/düster|dunkl|noir|schatten/.test(q);
 const bright=/prism|bunt|pastell|farbenfroh|popshow/.test(q);
 if(dark){add('atmosphere','palette','noir');add('stage','look','noir');}
 else if(neon){add('atmosphere','palette','electric');add('stage','look','reactor');}
 else if(rock){add('atmosphere','palette','arena');add('stage','look','rock-arena');}
 else if(bright){add('atmosphere','palette','dream');add('stage','look','prism');}
 if(/nahaufnahme|nahaufnahmen|close.?up|sänger.*fokus|rapper.*fokus|gesicht.*fokus/.test(q))add('camera','mode','performer');
 else if(/weitwinkel|totale|mehr publikum|festival.*kamera|kamera.*arena/.test(q))add('camera','mode','festival');
 else if(/filmische kamera|filmische perspektive|cineastische kamera/.test(q))add('camera','mode','story');
 const quiet=/ruhiger|sanfter|weniger|reduzier|zurückhaltend|leiser/.test(q);
 if(/keine (?:fx|effekte)|effekte aus/.test(q))add('fx','cap','0');
 else if(/weniger (?:fx|effekte|partikel)|fx reduzier/.test(q))add('fx','cap','25');
 if(quiet&&actions.length<4)add('camera','intensity','25');
 if(/weniger licht|licht sanfter|licht reduzieren/.test(q))add('atmosphere','intensity','30');
 if(/stärkeres bühnenbild|bühne intensiver|bühne kräftiger/.test(q))add('stage','intensity','65');
 return {title:actions.length?'Live-Regievorschlag':'Keine sichere virtuelle Änderung erkannt',
  explanation:actions.length?
   'Lokaler regelbasierter Entwurf. Nur bereits aktivierte virtuelle Regler werden nach Freigabe verändert.':'Diese Bitte kann der lokale Regieplaner nicht sicher einem virtuellen Regler zuordnen. Keine Änderung.',actions};
}
/** Pure dry run, used for BOTH preview and commit. Never enables any disabled feature. */
export function resolveLiveChangesV998(raw:unknown,before:LiveSnapshotV998):{after:LiveSnapshotV998;diffs:LiveDiffV998[]}|null{
 const plan=normalizeLivePlanV998(raw);
 if(!plan)return null;
 const after:LiveSnapshotV998={
  atmosphere:{...before.atmosphere},stage:{...before.stage},
  camera:{...before.camera},fx:{...before.fx},
 };
 const diffs:LiveDiffV998[]=[];
 for(const a of plan.actions){
  const unit=after[a.target];
  if(!unit.enabled||(a.target==='fx'&&!after.fx.auto))continue;
  let previous:string|number,next:string|number;
  switch(a.target){
   case 'atmosphere':
    previous=a.field==='palette'?after.atmosphere.palette:after.atmosphere.intensity;
    if(a.field==='palette')after.atmosphere.palette=a.value;
    else after.atmosphere.intensity=Number(a.value);
    next=a.field==='palette'?after.atmosphere.palette:after.atmosphere.intensity;break;
   case 'stage':
    previous=a.field==='look'?after.stage.look:after.stage.intensity;
    if(a.field==='look')after.stage.look=a.value;
    else after.stage.intensity=Number(a.value);
    next=a.field==='look'?after.stage.look:after.stage.intensity;break;
   case 'camera':
    previous=a.field==='mode'?after.camera.mode:after.camera.intensity;
    if(a.field==='mode')after.camera.mode=a.value;
    else after.camera.intensity=Number(a.value);
    next=a.field==='mode'?after.camera.mode:after.camera.intensity;break;
   case 'fx':
    previous=after.fx.intensity;
    after.fx.intensity=Math.min(after.fx.intensity,Number(a.value));
    next=after.fx.intensity;break;
  }
  if(previous!==next)diffs.push({target:a.target,field:a.field,before:previous,after:next});
 }
 return {after,diffs};
}
