/** V591: deterministic, conservative multi-GLB concert REVIEW protocol (not production show). */
import {safeLocalGlbV590,type V590Bounds} from './realConcertBenchmarkV590';
export type V591Camera='wide'|'lead'|'duet';
export type V591Fx='calm'|'gobo'|'led'|'hook';
export type V591Cue={id:string;at:number;line:string;focus:number;camera:V591Camera;fx:V591Fx};
export type V591Actor={model:string;clip:number};
export const V591_DEMO_CUES:readonly V591Cue[]=[
 {id:'intro',at:.15,line:'DEMO · Instrumental',focus:0,camera:'wide',fx:'calm'},
 {id:'lead',at:1.4,line:'DEMO · Rapper A übernimmt',focus:0,camera:'lead',fx:'gobo'},
 {id:'handoff',at:3.2,line:'DEMO · Rapper B antwortet',focus:1,camera:'duet',fx:'led'},
 {id:'hook',at:5.6,line:'DEMO · Gemeinsamer Hook',focus:0,camera:'wide',fx:'hook'},
 {id:'outro',at:8.4,line:'DEMO · ruhiger Übergang',focus:1,camera:'wide',fx:'calm'}
];
const plain=(s:unknown,max:number)=>typeof s==='string'&&s.length>0&&s.length<=max&&!/[\u0000-\u001f\u007f]/.test(s);
export function validV591Cues(value:unknown,actorCount:number):value is V591Cue[]{
 if(!Number.isInteger(actorCount)||actorCount<2||actorCount>4||!Array.isArray(value)||value.length<2||value.length>16)return false;
 let last=-1,ids=new Set<string>();
 for(const row of value){
  if(!row||typeof row!=='object')return false;
  const cue=row as Partial<V591Cue>;
  if(!plain(cue.id,40)||ids.has(cue.id!)||!Number.isFinite(cue.at)||cue.at!<0||cue.at!>600||cue.at!<=last||
   !plain(cue.line,180)||!Number.isInteger(cue.focus)||cue.focus!<0||cue.focus!>=actorCount||
   !['wide','lead','duet'].includes(cue.camera||'')||!['calm','gobo','led','hook'].includes(cue.fx||''))return false;
  ids.add(cue.id!);last=cue.at!;
 }
 return true;
}
export function safeV591AssetPath(value:string,extension:'.glb'|'.json'):boolean {
 if(typeof value!=='string'||value.length>240||!value.startsWith('/')||value.startsWith('//')||value.includes('\\')||/[?#]/.test(value))return false;
 try{const decoded=decodeURIComponent(value);
  return decoded.startsWith('/')&&!decoded.startsWith('//')&&!/\\|[\u0000-\u001f\u007f]/.test(decoded)&&
   !decoded.split('/').some(p=>p==='.'||p==='..')&&decoded.toLowerCase().endsWith(extension)&&
   (extension!=='.glb'||safeLocalGlbV590(value));
 }catch{return false;}
}
export function parseV591Actors(models:string,clips:string):V591Actor[]|null{
 if(typeof models!=='string'||models.length>1000||typeof clips!=='string'||clips.length>100)return null;
 const urls=models.split(',');const indices=clips.split(',');
 if(urls.length<2||urls.length>4||indices.length!==urls.length)return null;
 const actors=urls.map((model,i)=>({model,clip:Number(indices[i])}));
 return actors.every(a=>safeV591AssetPath(a.model,'.glb')&&Number.isInteger(a.clip)&&a.clip>=0&&a.clip<=999)?actors:null;
}
export function compositionV591(bounds:ReadonlyArray<V590Bounds>,lyricVisible:boolean){
 const warnings:string[]=[];let valid=0,lyricIntersections=0,clipped=0;
 for(let i=0;i<bounds.length;i++){
  const b=bounds[i];if(!b||![b.minX,b.maxX,b.minY,b.maxY].every(Number.isFinite)||b.maxX<=b.minX||b.maxY<=b.minY){warnings.push(`Avatar ${i+1}: keine messbaren Grenzen`);continue;}
  valid++;
  if(b.minX<-.96||b.maxX>.96||b.minY<-.96||b.maxY>.96){clipped++;warnings.push(`Avatar ${i+1}: möglicherweise angeschnitten`);}
  // Text area is bottom 27% of the actual stage, NDC y approximately [-1,-0.46].
  if(lyricVisible&&b.maxX>-.83&&b.minX<.83&&b.minY<-.46&&b.maxY>-1){lyricIntersections++;warnings.push(`Avatar ${i+1}: mögliche Lyrics-Überlagerung`);}
 }
 return {status:valid===0?'unmeasured':warnings.length?'review':'no-obvious-warning',actorsMeasured:valid,clipped,lyricIntersections,warnings};
}
export const V591_REVIEW_LIMIT='Technische Bildvergleiche, projizierte Bounding-Boxes und Browser-rAF beweisen keine natürliche Bewegung, keine Lippen-Synchronität und keine Konzertqualität. Menschliche Sichtabnahme ist erforderlich.';
