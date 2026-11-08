/** V1106 · Optional AI show remix for the existing V1040 360° timeline.
 * Proposals are DATA, never code or commands. No audio inference or device writes.
 * The existing V1040 timeline sampler remains the only playback integration.
 */
import {generateArenaShowPlanV1040,normalizeArenaShowPlanV1040,
 type ArenaShowPlanV1040,type ArenaShowSegmentV1040} from './arena360ShowDesignerV1040';

export const REMIX_SCENES_V1106=['intro','verse','build','hook','interlude','verse','finale'] as const;
export type RemixActV1106=Pick<ArenaShowSegmentV1040,'scene'|'deck'|'floating'|'lasers'|'camera'|'dance'|'intensity'> & {note:string};
export type AiShowRemixV1106={title:string;explanation:string;acts:RemixActV1106[]};
export type RemixGenreV1106='rap'|'hard'|'rock'|'pop';
const PICKS={deck:['fan','spiral','halo'],floating:['wave','orbit','rise'],
 lasers:['halo','tunnel','spiral'],camera:['wide','orbit','lead','group'],
 dance:['calm','groove','group','peak']} as const;
const clean=(value:unknown,max:number)=>typeof value==='string'
 ? value.replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max):'';
function choice<T extends readonly string[]>(value:unknown,options:T):value is T[number]{
 return typeof value==='string'&&options.includes(value);
}
export function normalizeAiShowRemixV1106(raw:unknown):AiShowRemixV1106|null{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const value=raw as Record<string,unknown>;
 const title=clean(value.title,75),explanation=clean(value.explanation,300);
 if(!title||!explanation||!Array.isArray(value.acts)||value.acts.length!==REMIX_SCENES_V1106.length)return null;
 const acts:RemixActV1106[]=[];
 for(let i=0;i<REMIX_SCENES_V1106.length;i++){
  const item=value.acts[i];
  if(!item||typeof item!=='object'||Array.isArray(item))return null;
  const a=item as Record<string,unknown>;
  if(a.scene!==REMIX_SCENES_V1106[i]||!choice(a.deck,PICKS.deck)||
   !choice(a.floating,PICKS.floating)||!choice(a.lasers,PICKS.lasers)||
   !choice(a.camera,PICKS.camera)||!choice(a.dance,PICKS.dance)||
   typeof a.intensity!=='number'||!Number.isInteger(a.intensity)||
   a.intensity<0||a.intensity>85)return null;
  const note=clean(a.note,145);
  if(!note)return null;
  acts.push({scene:REMIX_SCENES_V1106[i],deck:a.deck,floating:a.floating,
   lasers:a.lasers,camera:a.camera,dance:a.dance,intensity:a.intensity,note});
 }
 // Avoid abrupt, photosensitive intensity jumps between consecutive authored acts.
 if(acts.some((a,i)=>i>0&&Math.abs(a.intensity-acts[i-1].intensity)>45))return null;
 return {title,explanation,acts};
}
export function normalizeRemixRequestV1106(raw:unknown):{prompt:string;genre:RemixGenreV1106;intensityCap:number}|null{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const v=raw as Record<string,unknown>;
 const prompt=clean(v.prompt,401);
 if(prompt.length<4||prompt.length>400||!choice(v.genre,['rap','hard','rock','pop'] as const)||
  typeof v.intensityCap!=='number'||!Number.isInteger(v.intensityCap)||v.intensityCap<30||v.intensityCap>85)return null;
 return {prompt,genre:v.genre,intensityCap:v.intensityCap};
}
/** Preserve all user-authored time boundaries and IDs; only replace explicitly approved style fields. */
export function applyAiShowRemixV1106(base:unknown,remix:unknown,intensityCap:number):ArenaShowPlanV1040|null{
 const plan=normalizeArenaShowPlanV1040(base),safe=normalizeAiShowRemixV1106(remix);
 if(!plan||!safe||!Number.isInteger(intensityCap)||intensityCap<30||intensityCap>85)return null;
 const candidate:ArenaShowPlanV1040={...plan,segments:plan.segments.map((s,index)=>{
  const a=safe.acts[index];
  return {...s,deck:a.deck,floating:a.floating,lasers:a.lasers,camera:a.camera,
   dance:a.dance,intensity:Math.min(a.intensity,intensityCap)};
 })};
 return normalizeArenaShowPlanV1040(candidate);
}
/** Deterministic and clearly OFFLINE: never pretends to have detected song structure. */
export function localAiShowRemixV1106(prompt:string,genre:RemixGenreV1106,intensityCap:number):AiShowRemixV1106{
 const q=clean(prompt,400).toLocaleLowerCase('de');
 const cinematic=/filmisch|cinematic|story|dramatisch|mystisch|düster|dark|spannung/.test(q);
 const wide=/festival|groß|arena|stadion|publikum|episch|spektakul/.test(q);
 const soft=/sanft|ruhig|ballade|chill|dezent|emotional|slow/.test(q);
 const hard=genre==='hard'||/hardtekk|hardstyle|rave/.test(q);
 const rock=genre==='rock'&&!hard;
 const rap=genre==='rap'&&!hard&&!rock;
 const base=generateArenaShowPlanV1040({prompt,genre:hard?'hard':rock?'rock':rap?'rap':'pop'});
 const waves=soft?[24,33,40,49,26,42,55]:hard?[29,48,63,77,38,65,84]
   :rock?[25,41,54,71,34,57,81]:rap?[22,39,54,69,29,55,78]:[23,40,56,70,33,57,78];
 const scenes=['Bühne öffnet sich mit zurückhaltender Tiefenwirkung.',
  'Lead-Avatar und verständliche Lyrics stehen im Vordergrund.',
  'Spannung wächst durch schwebende Formationen und Lichtgeometrie.',
  'Breite Kamera und Gruppen-Choreografie für den geplanten Höhepunkt.',
  'Bewusster Kontrast und reduzierte Bewegungen als Atempause.',
  'Rückkehr zum Performer mit neuen Perspektiven.',
  'Finales Gesamtbild, anschließend kontrolliertes Ausblenden.'];
 const intensity=Math.max(30,Math.min(85,Number.isInteger(intensityCap)?intensityCap:65));
 const acts=base.segments.map((s,i)=>({
  scene:s.scene,
  deck:i===3||i===6?'fan':i===2||i===5?'spiral':'halo',
  floating:i===2||i===6?'rise':i===3||i===5?'orbit':'wave',
  lasers:soft?'halo':i===3||i===6?'tunnel':i===2||i===5?'spiral':'halo',
  camera:i===1||i===5?'lead':i===3||i===6?'group':wide&&i===0?'wide':cinematic&&i===2?'orbit':'wide',
  dance:i===0||i===4?'calm':i===3||i===6?'group':'groove',
  intensity:Math.min(intensity,waves[i]),
  note:scenes[i],
 }));
 return normalizeAiShowRemixV1106({title:(hard?'Rave-Reaktor':rock?'Arena-Rock':rap?'Cinematic Rap':'Prisma-Show')+' · Remix',
  explanation:'Lokaler, regelbasierter Entwurf. Sieben dramaturgische Abschnitte sind geplant, nicht aus Audio erkannt. Keine KI-Cloud-Abfrage.',
  acts})!;
}
