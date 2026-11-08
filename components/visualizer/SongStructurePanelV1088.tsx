'use client';
/** V1088: evidence-first, read-only recognition alongside V1018 Song Understanding. */
import {useRef} from 'react';
import {readEnergyV896} from './musicalEnergyIntelligenceV896';
import {getConcertTimelineV763} from './concertTimelineBridgeV763';
import {understandSongV1018} from '@/lib/songUnderstandingV1018';
import {advanceSongStructureV1088,type SongStructureStateV1088} from '@/lib/songStructureDetectionV1088';
const NAMES={verse:'Strophe',hook:'Hook',build:'Aufbau',drop:'Drop',break:'Break'} as const;
const CHAPTERS={opening:'Songanfang (Positionshinweis)',body:'Songmitte (Positionshinweis)',
 ending:'Songende (Positionshinweis)',unavailable:'Position unbekannt'} as const;
const fmt=(ms:number)=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;
export function SongStructurePanelV1088({trackId,durationMs,positionMs,playing,genre}:{
 trackId:string;durationMs:number;positionMs:number;playing:boolean;genre:string;
}){
 const history=useRef<SongStructureStateV1088|null>(null);
 const evidence=understandSongV1018({trackId,durationMs,positionMs,playing,genre,
  audio:readEnergyV896(trackId,durationMs,positionMs),timeline:getConcertTimelineV763()});
 const snapshot=advanceSongStructureV1088(history.current,{trackId,durationMs,positionMs,playing,evidence});
 history.current=snapshot.state;
 const r=snapshot.result;
 const label=r.label?NAMES[r.label]:null;
 return <fieldset className="song-structure-v1088" data-v1088-song-structure aria-label="V1088 Smart Song Structure Detection">
  <legend>V1088 · Smart Song Structure Detection</legend>
  <p><b>Erkennung:</b> {r.source==='verified-timeline'&&label
   ? `${label} · bestätigt · ${fmt(r.startMs??0)}–${fmt(r.endMs??0)}`
   :r.source==='audio-hypothesis'&&label?`${label} · vorläufig (${Math.round(r.confidence*100)} %)`
   :'Noch keine belastbare Abschnittserkennung'}</p>
  {r.nextLabel&&r.source==='verified-timeline'&&<p><small>Als Nächstes bestätigt: {NAMES[r.nextLabel]}</small></p>}
  <p><b>Songverlauf:</b> {CHAPTERS[r.chapter]}</p>
  <small>{r.reason}. Nur verifizierte Timeline-Abschnitte gelten als bestätigt. Gemessene Energie kann einen Aufbau
   oder Break nahelegen, aber ohne eindeutige Songanalyse keine Strophe, Hook oder einen Drop belegen.
   Keine Hardware-, Laser-, Govee- oder Pyrosteuerung; keine erfundenen Spotify-Audiofeatures.</small>
 </fieldset>;
}
