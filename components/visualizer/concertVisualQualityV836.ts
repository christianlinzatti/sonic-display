/** V836: read-only concert composition review from the opt-in V466/V754 canvas probe.
 * A projection cannot establish physical visibility, pixel occlusion, real lip-sync,
 * objective contrast, or whether a camera cut was artistically justified.
 */
import type {VisualProbeSnapshotV754,VisualAnchorV754} from './visualQualityInspectorV754';
import type {ScreenRectV466,ProjectedAvatarV466} from '../../services/show/concertQualityInspectorV466';

export type VisualCheckStatusV836='clear'|'risk'|'unverified';
export type VisualCheckIdV836='framing'|'ensemble'|'body'|'lyrics'|'continuity';
export interface VisualCheckV836 {id:VisualCheckIdV836;status:VisualCheckStatusV836;title:string;detail:string}
export interface VisualReviewV836 {at:number;status:'review'|'incomplete'|'no-probe';checks:readonly VisualCheckV836[];
  evidenceCount:number;risks:number;unverified:number;method:'live-head-and-foot-projections';}
export const VISUAL_REVIEW_MAX_V836=24;
const finite=(n:number)=>Number.isFinite(n);
const rect=(r:ScreenRectV466|null|undefined):r is ScreenRectV466=>!!r&&[r.x,r.y,r.width,r.height].every(finite)&&r.width>0&&r.height>0;
const inRect=(p:{x:number;y:number;inFront:boolean},r:ScreenRectV466,pad=0)=>p.inFront&&finite(p.x)&&finite(p.y)&&p.x>=r.x+pad&&p.x<=r.x+r.width-pad&&p.y>=r.y+pad&&p.y<=r.y+r.height-pad;
const overlaps=(a:ScreenRectV466,b:ScreenRectV466)=>Math.min(a.x+a.width,b.x+b.width)>Math.max(a.x,b.x)&&Math.min(a.y+a.height,b.y+b.height)>Math.max(a.y,b.y);
const check=(id:VisualCheckIdV836,title:string,status:VisualCheckStatusV836,detail:string):VisualCheckV836=>({id,title,status,detail});
const unverified=(id:VisualCheckIdV836,title:string,detail:string)=>check(id,title,'unverified',detail);
const loaded=(a:ProjectedAvatarV466)=>a.loaded!==false;
const hasHead=(a:ProjectedAvatarV466)=>a.anchor==='head-bone'&&loaded(a)&&a.inFront&&finite(a.x)&&finite(a.y);
const VALID_PAIR_INTERVAL_MS_V836=4000;

export function inspectConcertVisualV836(current:VisualProbeSnapshotV754|null|undefined,now:number,
 previous:VisualProbeSnapshotV754|null=null):VisualReviewV836{
 const invalid=():VisualReviewV836=>({at:current?.at??0,status:'no-probe',evidenceCount:0,risks:0,unverified:5,
  method:'live-head-and-foot-projections',checks:[
   unverified('framing','Kamera / Köpfe','Keine aktuelle gültige WebGL-Projektion'),
   unverified('ensemble','Gruppenkomposition','Keine aktuelle gültige WebGL-Projektion'),
   unverified('body','Körper / Bildrand','Keine aktuelle gültige Knochenprojektion'),
   unverified('lyrics','Lyrics-Schutz','Keine aktuelle gültige Lyrics-Projektion'),
   unverified('continuity','Szenenwechsel','Kein vergleichbares zweites Messfenster'),
  ]});
 if(!current||!rect(current.canvas)||!Number.isSafeInteger(now)||now<=0||
  !Number.isSafeInteger(current.at)||current.at<=0||current.at>now+500||now-current.at>5000||
  !Array.isArray(current.avatars)||current.avatars.length<1||current.avatars.length>4||
  new Set(current.avatars.map(a=>a.slot)).size!==current.avatars.length||
  current.avatars.some(a=>!Number.isInteger(a.slot)||a.slot<0||a.slot>3))return invalid();
 const c=current.canvas,heads=current.avatars,visible=heads.filter(hasHead);
 const checks:VisualCheckV836[]=[];
 const margin=Math.min(c.width,c.height)*.07;
 if(heads.some(a=>!loaded(a)||a.anchor!=='head-bone'||!finite(a.x)||!finite(a.y))){
  checks.push(unverified('framing','Kamera / Köpfe',
   'Nicht alle Performer haben einen geladenen, eindeutig erkannten Kopfknochen; keine Gesamtfreigabe möglich.'));
 }else if(heads.some(a=>!inRect(a,c,margin))){
  checks.push(check('framing','Kamera / Köpfe','risk','Mindestens ein projizierter Kopf liegt am Bildrand oder außerhalb.'));
 }else checks.push(check('framing','Kamera / Köpfe','clear',
  'Alle erkannten Kopfknochen mit Sicherheitsrand im Canvas; tatsächliche Sichtbarkeit ist nicht geprüft.'));

 if(heads.length===1){
  checks.push(unverified('ensemble','Gruppenkomposition','Nur ein Performer: Mehrpersonenaufstellung nicht prüfbar.'));
 }else if(visible.length!==heads.length){
  checks.push(unverified('ensemble','Gruppenkomposition','Nicht alle Kopfknochen sind eindeutig gemessen.'));
 }else{
  let crowded=false;
  for(let i=0;i<visible.length;i++)for(let j=i+1;j<visible.length;j++){
   const dx=(visible[i].x-visible[j].x)/c.width,dy=(visible[i].y-visible[j].y)/c.height;
   if(Math.hypot(dx,dy)<.09)crowded=true;
  }
  checks.push(check('ensemble','Gruppenkomposition',crowded?'risk':'clear',crowded?
   'Projizierte Kopfpositionen stehen sehr nah beieinander; mögliches Überdeckungsrisiko prüfen.':
   'Projizierte Kopfpositionen sind getrennt; tatsächliche Überdeckung nicht messbar.'));
 }
 const bones=new Map((current.bodyV754??[]).map(b=>[b.slot,b]));
 const bodyVerified=heads.every(a=>{
  const b=bones.get(a.slot);return hasHead(a)&&b?.headSource==='head-bone'&&!!b.leftFoot&&!!b.rightFoot&&
   [b.leftFoot,b.rightFoot].every(p=>!!p&&[p.x,p.y].every(finite));
 });
 if(!bodyVerified){
  checks.push(unverified('body','Körper / Bildrand','Für mindestens einen Performer fehlen echte Kopf- oder Fußknochen.'));
 }else{
  const footMargin=Math.min(c.width,c.height)*.035;
  const clipped=heads.some(a=>{
   const b=bones.get(a.slot)!;
   return !inRect(b.leftFoot as VisualAnchorV754,c,footMargin)||!inRect(b.rightFoot as VisualAnchorV754,c,footMargin);
  });
  const tiny=heads.some(a=>{
   const b=bones.get(a.slot)!;
   const feet=((b.leftFoot as VisualAnchorV754).y+(b.rightFoot as VisualAnchorV754).y)/2;
   return Math.abs(feet-a.y)/c.height<.12;
  });
  checks.push(check('body','Körper / Bildrand',clipped||tiny?'risk':'clear',clipped?
   'Fußknochen am/außerhalb des Bildrands; Bildausschnitt prüfen.':tiny?
   'Projizierte Körperhöhe sehr klein; Totale auf Lesbarkeit prüfen.':
   'Projizierte Kopf- und Fußknochen innerhalb der Bildgrenzen; reale Okklusion unbekannt.'));
 }
 const l=current.lyrics;
 if(!rect(l)||!overlaps(c,l)){
  checks.push(unverified('lyrics','Lyrics-Schutz','Kein aktives Lyrics-Rechteck im Canvas; Lesbarkeit nicht bestätigt.'));
 }else{
  const clipped=l.x<c.x-1||l.y<c.y-1||l.x+l.width>c.x+c.width+1||l.y+l.height>c.y+c.height+1;
  const collision=visible.some(a=>inRect(a,l))||heads.some(a=>{
   const hip=bones.get(a.slot)?.hips;
   return !!hip&&inRect(hip,l);
  });
  checks.push(check('lyrics','Lyrics-Schutz',clipped||collision?'risk':'clear',clipped?
   'Das Lyrics-Rechteck ragt aus der Bühnenfläche; DOM-Layout prüfen.':collision?
   'Kopf-/Hüftprojektion liegt im Lyrics-Rechteck; mögliche Überdeckung prüfen.':
   'Keine projizierten Kopf-/Hüftpunkte im Lyrics-Rechteck; Textkontrast und echte Verdeckung nicht geprüft.'));
 }
 // The camera is not measured directly, only successive screen-space head positions.
 // A camera cut is legitimate; a jump is a review hint, never an automatic failure.
 const comparable=previous&&rect(previous.canvas)&&previous.at<current.at&&
  current.at-previous.at<=VALID_PAIR_INTERVAL_MS_V836&&current.at-previous.at>=400&&
  Math.abs(previous.canvas.width-c.width)/c.width<.02&&
  Math.abs(previous.canvas.height-c.height)/c.height<.02&&
  previous.avatars.length===heads.length&&visible.length===heads.length&&
  previous.avatars.every(a=>hasHead(a)&&visible.some(b=>b.slot===a.slot));
 if(!comparable)checks.push(unverified('continuity','Szenenwechsel','Keine zwei zeitlich vergleichbaren Projektionsfenster mit denselben Kopfknochen.'));
 else{
  const abrupt=visible.some(a=>{
   const old=previous.avatars.find(b=>b.slot===a.slot)!;
   return Math.hypot((a.x-old.x)/c.width,(a.y-old.y)/c.height)>.24;
  });
  checks.push(check('continuity','Szenenwechsel',abrupt?'risk':'clear',abrupt?
   'Großer Positionssprung zwischen Messungen: Kamera-Schnitt, Bewegung oder Trackerwechsel manuell beurteilen.':
   'Keine große Kopfpositionsänderung in diesen zwei Messfenstern; Übergangsqualität nicht nachgewiesen.'));
 }
 const risks=checks.filter(x=>x.status==='risk').length;
 const unverifiedCount=checks.filter(x=>x.status==='unverified').length;
 return {at:current.at,status:risks?'review':'incomplete',checks,evidenceCount:5-unverifiedCount,
  risks,unverified:unverifiedCount,method:'live-head-and-foot-projections'};
}

export function appendConcertVisualV836(history:readonly VisualReviewV836[],next:VisualReviewV836):readonly VisualReviewV836[]{
 if(next.status==='no-probe'||next.at<=0||history.length>0&&next.at<=history[history.length-1].at)return history;
 const contiguous=history.length>0&&next.at-history[history.length-1].at>10000?[]:history;
 return [...contiguous,next].slice(-VISUAL_REVIEW_MAX_V836);
}
