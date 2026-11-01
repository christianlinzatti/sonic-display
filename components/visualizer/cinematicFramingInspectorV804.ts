/** V804: bounded, read-only projected-geometry audit for the isolated V803 A/B canvas.
 * Projected coordinates are normalized viewport x/y and NDC z, NOT pixels.
 * No occlusion, lyric glyphs, facial expression, or live camera is measured.
 */
export type ProjectedPointV804={x:number;y:number;z:number};
export type PerformerEvidenceV804={
  source:'glb'|'demo';bounds:readonly ProjectedPointV804[];
  head?:ProjectedPointV804|null;feet?:readonly ProjectedPointV804[];
  headBone:boolean;footBones:boolean;performerCount:number;
};
export type FramingStatusV804='clear'|'risk'|'unverified';
export type FramingCheckV804={id:'body'|'face'|'feet'|'ensemble'|'lyrics';status:FramingStatusV804;
  title:string;detail:string;source:'geometry'|'bone'|'proxy'|'unavailable'};
export type ScreenBoundsV804={left:number;top:number;right:number;bottom:number};
export type FramingAuditV804={source:'geometry-review'|'demo-only'|'unavailable';
  bounds:ScreenBoundsV804|null;head:ProjectedPointV804|null;feet:ProjectedPointV804[];
  checks:FramingCheckV804[];risks:number;verified:number;
};
const valid=(p:ProjectedPointV804|undefined|null):p is ProjectedPointV804=>!!p&&
  Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z)&&
  Math.abs(p.x)<1e4&&Math.abs(p.y)<1e4&&Math.abs(p.z)<1e4;
const inside=(p:ProjectedPointV804,mx:number,my:number)=>p.z>=-1&&p.z<=1&&
  p.x>=mx&&p.x<=1-mx&&p.y>=my&&p.y<=1-my;
const check=(id:FramingCheckV804['id'],title:string,status:FramingStatusV804,
  detail:string,source:FramingCheckV804['source']):FramingCheckV804=>({id,title,status,detail,source});
/** Must fail closed: missing render/GLB evidence is never turned into a pass. */
export function inspectProjectedFramingV804(e:PerformerEvidenceV804|null|undefined):FramingAuditV804{
  const empty=(source:FramingAuditV804['source'],reason:string):FramingAuditV804=>({
    source,bounds:null,head:null,feet:[],risks:0,verified:0,
    checks:[
      check('body','Körper im Bild','unverified',reason,'unavailable'),
      check('face','Gesicht','unverified',reason,'unavailable'),
      check('feet','Füße','unverified',reason,'unavailable'),
      check('ensemble','Gruppenbild','unverified','V803 rendert nur einen Performer. Weitere Künstler werden nicht gemessen.','unavailable'),
      check('lyrics','Lyrics-Schutzbereich','unverified',reason,'unavailable'),
    ]});
  if(!e)return empty('unavailable','Keine gerenderte Geometrie verfügbar.');
  if(e.source!=='glb')return empty('demo-only','Nur Demo-Performer: keine Aussage über deinen GLB-Avatar.');
  if(!Array.isArray(e.bounds)||e.bounds.length<8||e.bounds.some(p=>!valid(p)))
    return empty('unavailable','Keine gültigen GLB-Projektionspunkte vorhanden.');
  const b={left:Math.min(...e.bounds.map(p=>p.x)),top:Math.min(...e.bounds.map(p=>p.y)),
    right:Math.max(...e.bounds.map(p=>p.x)),bottom:Math.max(...e.bounds.map(p=>p.y))};
  if(!Object.values(b).every(Number.isFinite)||b.right-b.left<.001||b.bottom-b.top<.001)
    return empty('unavailable','Avatar-Projektion ist degeneriert.');
  const head=valid(e.head)?e.head:null;
  const feet=Array.isArray(e.feet)?e.feet.filter(valid):[];
  const bodyOk=e.bounds.every(p=>inside(p,.035,.035));
  const body=check('body','Körper im Bild',bodyOk?'clear':'risk',
    bodyOk?'Projektierte GLB-Gesamtgrenzen liegen mit Rand im Vorschaufenster.':'GLB-Gesamtgrenzen ragen an den Bildrand oder aus dem Sichtbereich.', 'geometry');
  const face=(!head||!e.headBone)?check('face','Gesicht','unverified',
    'Kein belastbarer Kopfknochen gefunden; eine geschätzte Kopfposition ist keine Gesichts-Sichtbarkeitsprüfung.',head?'proxy':'unavailable'):
    check('face','Kopfposition',inside(head,.085,.085)?'clear':'risk',
      inside(head,.085,.085)?'Kopfknochen mit Sicherheitsrand im Bild (Gesichts-Okklusion nicht geprüft).':
        'Kopfknochen liegt nahe am Bildrand oder außerhalb.', 'bone');
  const bothFeet=e.footBones&&feet.length>=2;
  const feetOk=bothFeet&&feet.every(p=>inside(p,.04,.04));
  const foot=check('feet','Fußpositionen',!bothFeet?'unverified':feetOk?'clear':'risk',
    !bothFeet?'Beide Fußknochen fehlen; Bodenkontakt ist in dieser Vorschau nicht bestätigt.':
      feetOk?'Beide Fußknochen im Bild (Fußkontakt und Verdeckung nicht geprüft).':
        'Mindestens ein Fußknochen liegt am Bildrand oder außerhalb.',bothFeet?'bone':'unavailable');
  // Do not fabricate a multi-performer verdict: V803's GLB scene is single avatar.
  const ensemble=check('ensemble','Gruppenbild','unverified',
    e.performerCount===1?'Die V803-Vorschau rendert nur einen Avatar; mehrfache Sängerabdeckung ist nicht messbar.':
    'Keine verlässliche Mehrpersonen-Bildmessung verfügbar.','unavailable');
  // Reserved lower third only: a geometrical intersection cannot establish lyric text overlap.
  const hitsLyricBand=b.right>.22&&b.left<.78&&b.bottom>.77&&b.top<.96;
  const lyrics=check('lyrics','Lyrics-Reserve',hitsLyricBand?'risk':'unverified',
    hitsLyricBand?'Avatar berührt die angenommene untere Text-Sicherheitszone (möglicher Konflikt, kein tatsächliches Lyrics-Overlay).':
      'Kein Konflikt mit der angenommenen unteren Textzone nachweisbar; tatsächliche Lyrics sind nicht gerendert.',
    hitsLyricBand?'geometry':'proxy');
  const checks=[body,face,foot,ensemble,lyrics];
  return {source:'geometry-review',bounds:b,head,feet,checks,
    risks:checks.filter(c=>c.status==='risk').length,
    verified:checks.filter(c=>c.status==='clear').length};
}
