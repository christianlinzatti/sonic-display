/** V805: conservative projected multi-GLB review, using the same frozen stage/pose.
 * No facial occlusion, live-vocal identity, scene depth occlusion or GPU measurements.
 */
import {inspectProjectedFramingV804,type PerformerEvidenceV804,
 type FramingAuditV804,type ScreenBoundsV804} from './cinematicFramingInspectorV804';
export type PerformerPreviewV805={id:string;label:string;url:string};
export type PerformerSampleV805={id:string;label:string;evidence:PerformerEvidenceV804|null};
export type MultiCheckV805={id:string;status:'clear'|'risk'|'unverified';detail:string};
export type IndividualAuditV805={id:string;label:string;audit:FramingAuditV804};
export type MultiAuditV805={status:'clear'|'risk'|'unverified';checks:MultiCheckV805[];
 performers:IndividualAuditV805[];groupBounds:ScreenBoundsV804|null;verifiedCount:number};
const finite=(x:number)=>Number.isFinite(x)&&Math.abs(x)<1e4;
const validBounds=(b:ScreenBoundsV804|null)=>!!b&&Object.values(b).every(finite)&&
  b.left<b.right&&b.top<b.bottom;
const intersect=(a:ScreenBoundsV804,b:ScreenBoundsV804)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*
  Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
/** Never certify groups from a demo, a loading GLB, repeated IDs or a single model. */
export function inspectMultiPerformerVisibilityV805(samples:readonly PerformerSampleV805[]|null|undefined,
 expectedCount:number):MultiAuditV805{
 const unavailable=(detail:string,performers:IndividualAuditV805[]=[]):MultiAuditV805=>({
   status:'unverified',checks:[{id:'group',status:'unverified',detail}],performers,groupBounds:null,verifiedCount:0});
 if(!Number.isInteger(expectedCount)||expectedCount<2||expectedCount>3)return unavailable('Gruppenprüfung benötigt zwei oder drei ausdrücklich ausgewählte GLB-Performer.');
 if(!samples||samples.length!==expectedCount)return unavailable('Nicht alle ausgewählten Performer sind in der 3D-Vorschau vorhanden.');
 const ids=samples.map(s=>s.id);
 if(ids.some(id=>!id)||new Set(ids).size!==ids.length)return unavailable('Performer-Identitäten sind nicht eindeutig.');
 const performers=samples.map(s=>({id:s.id,label:s.label,audit:inspectProjectedFramingV804(s.evidence)}));
 if(performers.some(p=>p.audit.source!=='geometry-review'||!validBounds(p.audit.bounds)))
   return unavailable('Mindestens ein GLB ist noch nicht geladen oder hat keine auswertbaren 3D-Körpergrenzen.',performers);
 const boxes=performers.map(p=>p.audit.bounds!);
 const groupBounds={left:Math.min(...boxes.map(b=>b.left)),top:Math.min(...boxes.map(b=>b.top)),
 right:Math.max(...boxes.map(b=>b.right)),bottom:Math.max(...boxes.map(b=>b.bottom))};
 const checks:MultiCheckV805[]=[];
 const outside=performers.filter(p=>p.audit.checks.find(c=>c.id==='body')?.status!=='clear');
 checks.push({id:'group',status:outside.length?'risk':'clear',detail:outside.length?
  `${outside.map(p=>p.label).join(', ')}: Körpergrenzen zu nah am Rand oder außerhalb.`:
  `Alle ${expectedCount} GLB-Körpergrenzen liegen im Kamerabild (geometrische Projektion).`});
 const heads=performers.map(p=>p.audit.checks.find(c=>c.id==='face')?.status);
 checks.push({id:'heads',status:heads.some(s=>s==='risk')?'risk':heads.some(s=>s!=='clear')?'unverified':'clear',
   detail:heads.every(s=>s==='clear')?'Alle vorhandenen Kopfknochen liegen im Bild; tatsächliche Gesichtsverdeckung ungeprüft.':
    'Mindestens ein Kopf liegt außerhalb der Sicherheitszone oder besitzt keinen nachweisbaren Kopfknochen.'});
 let heavyOverlap=0;let pairCount=0;
 for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
  pairCount++;
  const common=intersect(boxes[i],boxes[j]);
  const areaA=(boxes[i].right-boxes[i].left)*(boxes[i].bottom-boxes[i].top);
  const areaB=(boxes[j].right-boxes[j].left)*(boxes[j].bottom-boxes[j].top);
  if(common/Math.max(.00001,Math.min(areaA,areaB))>.26)heavyOverlap++;
 }
 checks.push({id:'spacing',status:heavyOverlap?'risk':'clear',detail:heavyOverlap?
  `${heavyOverlap} von ${pairCount} Avatar-Paaren überschneiden sich stark im projizierten Körperrechteck; reale Verdeckung ist nicht nachgewiesen.`:
  'Projizierte Avatar-Rechtecke überschneiden sich nicht stark; reale Verdeckung und Sichtlinie sind nicht geprüft.'});
 const feet=performers.map(p=>p.audit.checks.find(c=>c.id==='feet')?.status);
 checks.push({id:'feet',status:feet.some(s=>s==='risk')?'risk':feet.some(s=>s!=='clear')?'unverified':'clear',
  detail:feet.every(s=>s==='clear')?'Alle nachgewiesenen Fußknochen im Kamerabild.':'Mindestens ein Fuß ist am Rand oder nicht nachweisbar.'});
 // The lyric band is assumed; intersection is a warning, non-intersection is NEVER proof.
 const lyricRisk=performers.some(p=>p.audit.checks.find(c=>c.id==='lyrics')?.status==='risk');
 checks.push({id:'lyrics',status:lyricRisk?'risk':'unverified',detail:lyricRisk?
  'Mindestens ein GLB reicht in die angenommene Lyrics-Reserve hinein (keine Pixelmessung).':
  'Keine geometrische Überschneidung mit der angenommenen Lyrics-Reserve belegt; tatsächliche Lyrics ungeprüft.'});
 return {status:checks.some(c=>c.status==='risk')?'risk':checks.some(c=>c.status==='unverified')?'unverified':'clear',
  checks,performers,groupBounds,verifiedCount:performers.length};
}
