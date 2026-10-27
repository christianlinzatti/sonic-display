import {concertLipSongClockV561,concertLipTimingV561,type ConcertLipPreviewModeV561,type ConcertLipSongV561} from './concertLipPreviewV561';
import {isPreviewGlbUrlV563,type DuetPreviewRoleV563} from './realDuetPreviewV563';

/** V570 is an INPUT / PREVIEW readiness audit, not a WebGL, Spotify or Pi benchmark. */
export type ConcertAuditStatusV570='ok'|'limited'|'pending';
export type ConcertAuditCheckV570=Readonly<{id:string;label:string;status:ConcertAuditStatusV570;detail:string}>;
export type ConcertAuditRigV570=Readonly<{mouthSupported:boolean;morphs:number;jawBone:boolean}>;
export type ConcertExperienceAuditV570=Readonly<{
  context:'demo'|'selected-glb'|'real-song';checks:readonly ConcertAuditCheckV570[];
  ok:number;limited:number;pending:number;summary:string;
}>;
export type ConcertExperienceInputV570=Readonly<{
  previewMode:'verse'|'hook'|'dense'|'rapHook'|'duet';
  glbRequested:boolean;primaryUrl:string|null|undefined;partnerUrl?:string|null;
  primaryRig?:ConcertAuditRigV570|null;partnerRig?:ConcertAuditRigV570|null;
  tier:'low'|'balanced'|'high';playing:boolean;reducedMotion:boolean;
  lipMode:ConcertLipPreviewModeV561;song?:ConcertLipSongV561|null;
  duetRole?:DuetPreviewRoleV563|null;manualCastEnabled?:boolean;
  motionPreviewEnabled:boolean;motionClips?:readonly (number|null|undefined)[];
  nowMs:number;
}>;

export function auditConcertExperienceV570(input:ConcertExperienceInputV570):ConcertExperienceAuditV570 {
  const checks:ConcertAuditCheckV570[]=[];
  const add=(id:string,label:string,status:ConcertAuditStatusV570,detail:string)=>checks.push({id,label,status,detail});
  const duet=input.previewMode==='duet';
  const selected=input.glbRequested;
  const primaryValid=isPreviewGlbUrlV563(input.primaryUrl);
  const partnerValid=isPreviewGlbUrlV563(input.partnerUrl);
  const realDuet=duet&&selected&&input.tier!=='low'&&primaryValid&&partnerValid;
  const glbActive=selected&&primaryValid&&(!duet||realDuet);
  const source=input.lipMode==='song'?'real-song':glbActive?'selected-glb':'demo';
  const rigCheck=(id:string,label:string,rig:ConcertAuditRigV570|null|undefined)=>{
    if(!rig){add(id,label,'pending','GLB-Ladevorgang / Rig-Scan noch nicht bestätigt.');return;}
    if(!rig.mouthSupported){add(id,label,'limited',`${Math.max(0,rig.morphs)} Morph-Ziele, aber kein nutzbarer Mundkanal erkannt; Lip-Sync nicht bestätigt.`);return;}
    add(id,label,'ok',`Geladenes GLB gescannt: ${Math.max(0,rig.morphs)} Morph-Ziele${rig.jawBone?', Kieferknochen':''}; Mund-Rig vorhanden.`);
  };
  if(!selected)add('model','3D-Avatare','limited','Neutrale Demofiguren; noch kein echtes GLB für die Prüfung aktiviert.');
  else if(!primaryValid)add('model','3D-Avatare','limited','Ausgewähltes GLB fehlt oder besitzt keine gültige Modell-URL.');
  else if(duet&&input.tier==='low')add('model','3D-Avatare','limited','Low-Tier: bewusst zwei Demofiguren statt zweier zusätzlicher GLB-Instanzen.');
  else if(duet&&!partnerValid)add('model','3D-Avatare','limited','Zweiten GLB-Avatar für das echte Duett auswählen.');
  else {
    add('model','3D-Avatare','ok',duet?'Zwei gültige GLB-Quellen gewählt – Ladebestätigung separat prüfen.':'GLB-Quelle gewählt – Ladebestätigung separat prüfen.');
    rigCheck('rig-1','GLB 1 / Mund-Rig',input.primaryRig);
    if(duet)rigCheck('rig-2','GLB 2 / Mund-Rig',input.partnerRig);
  }
  if(input.lipMode==='off')add('vocal','Lip-Sync','limited','Mundanimation ist in dieser Vorschau ausgeschaltet.');
  else if(input.reducedMotion||!input.playing)add('vocal','Lip-Sync','limited','Reduzierte Bewegung oder pausierte Vorschau; keine aktive Animation.');
  else if(input.lipMode==='rap'||input.lipMode==='singing'){
    add('vocal','Lip-Sync','limited',`Simulierte ${input.lipMode==='rap'?'Deutschrap-':'Gesangs-'}Artikulation – kein nachgewiesener Live-Phonem-Sync.`);
  } else {
    const timing=concertLipTimingV561(input.song?.lyrics??null);
    const clock=concertLipSongClockV561(input.song,input.nowMs);
    if(!input.song?.trackId||!input.song.connected||!clock.playing||timing==='none')
      add('vocal','Song-Synchronität','limited','Keine aktuelle, spielende Spotify-Zeit mit überprüfbaren Lyrics-Timestamps.');
    else add('vocal','Song-Synchronität',timing==='word'?'ok':'limited',
      timing==='word'?'Song-Zeit und Wort-Timestamps vorhanden (noch kein akustischer Abgleich).':'Nur Zeilen-Timestamps: kein überprüfter Wort-Lip-Sync.');
  }
  if(duet){
    const role=input.duetRole;
    const castClock=concertLipSongClockV561(input.song,input.nowMs);
    const sourceIsValid=castClock.playing&&!!role&&Math.abs(role.progressMs-castClock.progressMs)<750&&role.source==='authored'&&input.lipMode==='song'&&input.manualCastEnabled===true&&
      input.song?.connected===true&&input.song?.isPlaying===true&&!!input.song?.trackId&&
      Number.isFinite(role.progressMs)&&Number.isFinite(role.cueStartMs)&&Number.isFinite(role.cueEndMs)&&
      role.cueStartMs>=0&&role.cueEndMs>role.cueStartMs&&role.progressMs>=role.cueStartMs&&role.progressMs<role.cueEndMs&&
      role.leadSlot!==null&&Number.isInteger(role.leadSlot)&&role.leadSlot>=0&&role.leadSlot<=1&&
      role.singingSlots.length>0&&role.singingSlots.includes(role.leadSlot)&&
      role.singingSlots.every(slot=>Number.isInteger(slot)&&slot>=0&&slot<=1)&&new Set(role.singingSlots).size===role.singingSlots.length;
    add('cast','Duett-Besetzung',sourceIsValid?'ok':'limited',sourceIsValid?
      `Für diesen Song bestätigte manuelle Zuordnung: Avatar ${(role?.leadSlot??0)+1}.`:
      'Nur gekennzeichnete Demo-Rollen oder derzeit keine bestätigte Song-Zuordnung; Sänger werden nicht geschätzt.');
  }
  if(!input.motionPreviewEnabled)add('motion','Tanzüberblendung','limited','A/B-Clipvorschau nicht aktiviert; Übergänge nicht visuell geprüft.');
  else if(input.tier==='low'||input.reducedMotion||!input.playing)add('motion','Tanzüberblendung','limited','Tanzdemo wegen Low-Tier, reduzierter Bewegung oder Pause deaktiviert.');
  else if(!glbActive)add('motion','Tanzüberblendung','limited','Ohne aktiviertes echtes GLB keine eingebetteten Tanzclips testbar.');
  else {
    const counts=duet?[input.motionClips?.[0],input.motionClips?.[1]]:[input.motionClips?.[0]];
    if(counts.some(count=>count===null||count===undefined))add('motion','Tanzüberblendung','pending','Clip-Scan des geladenen GLB noch offen.');
    else if(counts.some(count=>!Number.isFinite(count)||Number(count)<2))add('motion','Tanzüberblendung','limited','Mindestens ein GLB besitzt keine zwei geeigneten eingebetteten Tanzclips.');
    else add('motion','Tanzüberblendung','ok',duet?'Beide GLBs enthalten mindestens zwei geeignete eingebettete Tanzclips.':'Mindestens zwei geeignete eingebettete Tanzclips gefunden.');
  }
  add('lyrics','Lyrics-Lesbarkeit','pending','Lyrics-Schutzregeln vorhanden; tatsächliche Schriftgröße, Kontrast und Sichtbarkeit visuell prüfen.');
  add('runtime','WebGL / Raspberry Pi','pending','WebGL-Bild, FPS und Speicherentwicklung sind hier nicht automatisch vermessen.');
  const ok=checks.filter(c=>c.status==='ok').length;
  const limited=checks.filter(c=>c.status==='limited').length;
  const pending=checks.length-ok-limited;
  return {context:source,checks,ok,limited,pending,summary:
    `V570 · ${ok} Eingangsprüfungen positiv, ${limited} eingeschränkt, ${pending} manuell/offen – kein Produktionsfreigabe-Nachweis.`};
}
