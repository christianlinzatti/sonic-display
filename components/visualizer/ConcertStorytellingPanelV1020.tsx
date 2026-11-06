'use client';
/** V1020: no dispatch, no effect, no storage; a verified-act dramaturgy preview. */
import {readEnergyV896} from './musicalEnergyIntelligenceV896';
import {getConcertTimelineV763} from './concertTimelineBridgeV763';
import {buildConcertStoryV1020,type StoryPhaseV1020,type StoryLookV1020} from
 '@/lib/aiConcertStorytellingV1020';

const phaseLabels:Record<StoryPhaseV1020,string>={opening:'Auftakt',focus:'Erzählung',
 build:'Spannungsaufbau',peak:'Höhepunkt',breather:'Atempause',finale:'Finale'};
const sectionLabels={verse:'Strophe',hook:'Hook',build:'Build-up',drop:'Drop',break:'Pause'};
const cameraLabels:Record<StoryLookV1020['camera'],string>={intimate:'Nahaufnahme',tracking:'Folgefahrt',
 wide:'Totale',steady:'stabile Kamera',sweep:'Kameraschwenk'};
const stageLabels:Record<StoryLookV1020['stage'],string>={silhouette:'Silhouetten',filmic:'Filmlook',
 rising:'steigende Kulisse',arena:'Arena',minimal:'reduziert',finale:'Finale-Look'};
const avatarLabels:Record<StoryLookV1020['avatars'],string>={lead:'Lead-Performance',ensemble:'Ensemble',
 minimal:'reduziert',hold:'ruhig'};
const lightLabels:Record<StoryLookV1020['lights'],string>={dim:'gedimmt',soft:'weich',
 rising:'steigend',big:'breit',finale:'Finale-Farben'};
const reasons={paused:'Wiedergabe pausiert',disabled:'Automatische Regie deaktiviert',
 manual:'Manuelle Eingabe hat Vorrang',seek:'Songposition wird überprüft',
 blackout:'Blackout hat Vorrang', 'missing-evidence':'Keine bestätigte Songstruktur verfügbar',
 'incomplete-timeline':'Bestätigte Timeline deckt nicht den ganzen Song ab',
 'invalid-acts':'Timeline-Akte sind nicht konsistent',
 'no-current-act':'Kein gültiger Akt an der aktuellen Songposition',
 'verified-story':'Bestätigte Songdramaturgie'};
const fmt=(ms:number)=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;
export function ConcertStorytellingPanelV1020({trackId,durationMs,positionMs,playing,genre,
 enabled,manualOverride,seekBlocked,blackout,reducedMotion}: {
 trackId:string;durationMs:number;positionMs:number;playing:boolean;genre:string;
 enabled:boolean;manualOverride?:boolean;seekBlocked?:boolean;blackout?:boolean;reducedMotion?:boolean;
}) {
 const story=buildConcertStoryV1020({trackId,durationMs,positionMs,playing,genre,
  enabled,manualOverride,seekBlocked,blackout,reducedMotion,
  audio:readEnergyV896(trackId,durationMs,positionMs),timeline:getConcertTimelineV763()});
 return <fieldset aria-label="V1020 AI Concert Storytelling" data-v1020-concert-storytelling
  data-v1020-story-status={story.status}>
  <legend>V1020 · AI Concert Storytelling</legend>
  {story.status!=='verified'||!story.current?
   <p><small>{reasons[story.reason]}. Keine künstlichen Songhöhepunkte oder Aktionen.</small></p>:
   <>
    <p><b>Aktuelle Dramaturgie:</b> {phaseLabels[story.current.phase]} ·
     {' '}{sectionLabels[story.current.section]} · Akt {story.current.ordinal+1} von {story.acts.length}</p>
    <div role="group" aria-label="Verifizierter Song-Spannungsbogen" style={{display:'flex',gap:3,alignItems:'stretch',height:34}}>
     {story.acts.map(act=><div key={act.actIndex}
      title={`${phaseLabels[act.phase]} · ${fmt(act.startMs)}–${fmt(act.endMs)} · geplante Intensität ${Math.round(act.intendedIntensity*100)}%`}
      aria-label={`Akt ${act.ordinal+1}: ${phaseLabels[act.phase]}${act.ordinal===story.currentOrdinal?' (aktuell)':''}`}
      aria-current={act.ordinal===story.currentOrdinal?'step':undefined}
      style={{flex:`${Math.max(1,act.endMs-act.startMs)} 1 0`, minWidth:2,
       background:act.ordinal===story.currentOrdinal?'var(--accent,#5c9ced)':'var(--border,#737373)',
       opacity:act.ordinal===story.currentOrdinal?1:.45,
       height:`${Math.max(18,act.intendedIntensity*100)}%`,alignSelf:'end',borderRadius:3}}/>)}</div>
    <p><small>Spannungsbogen aus {story.acts.length} bestätigten Akten;
     {' '}vorgesehene, nicht gemessene Intensität.
     {' '}{story.next?`Danach: ${phaseLabels[story.next.phase]} (${sectionLabels[story.next.section]}) ab ${fmt(story.next.startMs)}.`:
      'Letzter bestätigter Akt.'}</small></p>
    <p><b>Regievorschau:</b> Kamera {cameraLabels[story.current.look.camera]} ·
     {' '}Bühne {stageLabels[story.current.look.stage]} ·
     {' '}Avatare {avatarLabels[story.current.look.avatars]} ·
     {' '}Licht {lightLabels[story.current.look.lights]}</p>
   </>}
  <small>Nur Planung aus verifizierter Timeline. Keine eigenen Licht-, Kamera-, Avatar- oder FX-Kommandos.
   {' '}{reducedMotion?'Bewegungsarme Planung. ':''}
   {' '}Manuelle Regie, Blackout und Lyrics-Lesbarkeit behalten Vorrang.</small>
 </fieldset>;
}
