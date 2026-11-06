'use client';
/** Read-only overview from the current song, real V896 audio and verified V763 sections. */
import {readEnergyV896} from './musicalEnergyIntelligenceV896';
import {getConcertTimelineV763} from './concertTimelineBridgeV763';
import {understandSongV1018,type RecognizedSectionV1018} from '@/lib/songUnderstandingV1018';
const sectionLabel:Record<RecognizedSectionV1018,string>={verse:'Verse',hook:'Hook',build:'Build-up',drop:'Drop',break:'Break'};
const feelLabel={quiet:'Ruhige Passage',steady:'Gleichmäßige Energie',rising:'Ansteigende Energie',intense:'Hohe Energie'};
const directionLabel={rap:'Deutschrap-/Rap-Regiestil',rock:'Rock-/Arena-Regiestil',
 'hard-dance':'Hardtekk-/Rave-Regiestil',other:'Neutraler Regiestil'};
const fmt=(ms:number)=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;
export function SongUnderstandingPanelV1018({trackId,durationMs,positionMs,playing,genre}:{
 trackId:string;durationMs:number;positionMs:number;playing:boolean;genre:string;
}){
 const evidence=understandSongV1018({trackId,durationMs,positionMs,playing,genre,
  audio:readEnergyV896(trackId,durationMs,positionMs),timeline:getConcertTimelineV763()});
 return <fieldset className="song-understanding-v1018" aria-label="V1018 Song Understanding 2.0" data-v1018-song-understanding>
  <legend>V1018 · Song Understanding 2.0</legend>
  <p><b>Songlage:</b> {evidence.verifiedSection&&evidence.section
   ? `${sectionLabel[evidence.section]} · ${fmt(evidence.sectionStartMs??0)}–${fmt(evidence.sectionEndMs??0)}`
   : 'Keine bestätigte Passage verfügbar'}</p>
  {evidence.nextSection&&<p><small>Nächster bestätigter Abschnitt: {sectionLabel[evidence.nextSection]} (keine neue Vorhersage).</small></p>}
  <p><b>Gemessene Live-Energie:</b> {evidence.measuredAudio&&evidence.energy!==null&&evidence.feel
   ? `${Math.round(evidence.energy*100)} % · ${feelLabel[evidence.feel]} · Bass ${Math.round((evidence.bass??0)*100)} %`
   : 'Noch keine gültigen Live-Audiomessungen'}</p>
  {evidence.measuredAudio&&evidence.energy!==null&&<progress aria-label="Gemessene Live-Energie" max={100} value={Math.round(evidence.energy*100)}/>}
  <p><b>Genre-Regiehinweis:</b> {directionLabel[evidence.genreDirection]}</p>
  <small>Belege: {evidence.verifiedSection?'bestätigte V604-Song-Timeline':'keine bestätigte Timeline'};
   {' '}{evidence.measuredAudio?'normierte Live-Audiomessung':'keine verwertbare Audiomessung'}.
   {' '}Der Regiestil ist nur ein Genre-Hinweis. Rap-Stimmen, BPM und neue Drops werden nicht erraten.
   Diese Ansicht sendet keine KI-Anfragen und steuert weder Govee noch Bühneneffekte.</small>
 </fieldset>;
}
