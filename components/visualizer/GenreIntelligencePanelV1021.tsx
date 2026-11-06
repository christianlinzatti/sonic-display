'use client';
/** V1021: a read-only genre-specific storyboard (not a music classifier). */
import {readEnergyV896} from './musicalEnergyIntelligenceV896';
import {getConcertTimelineV763} from './concertTimelineBridgeV763';
import {planGenreConcertV1021,type GenreProfileV1021,
 type GenreLookV1021,type GenreEnergyV1021} from '@/lib/genreIntelligenceV1021';

const genreLabels:Record<GenreProfileV1021,string>={deutschrap:'Deutschrap',
 hardtekk:'Hardtekk',hardstyle:'Hardstyle',deutschrock:'Deutschrock / NDH',other:'Neutral'};
const camera:Record<GenreLookV1021['camera'],string>={close:'Nahaufnahme',tracking:'Folgefahrt',
 steady:'ruhige Kamera',rhythmic:'rhythmische Perspektive',wide:'Totale',sweep:'Schwenk'};
const stage:Record<GenreLookV1021['stage'],string>={cinematic:'Filmlook',geometry:'LED-Geometrie',
 festival:'Festival',arena:'Arena',minimal:'reduziert'};
const avatars:Record<GenreLookV1021['avatars'],string>={'lead-rap':'Rap-Performance',
 footwork:'Footwork',ensemble:'Ensemble',frontline:'Band-Front',hold:'ruhig'};
const lights:Record<GenreLookV1021['lights'],string>={'low-key':'dunkel',contrast:'Kontraste',
 broad:'breit',warm:'warm',soft:'weich'};
const energy:Record<GenreEnergyV1021,string>={intimate:'Intimer Einstieg',drive:'Spannung',
 anthem:'Höhepunkt',rest:'Atempause'};
const reasons={paused:'Wiedergabe pausiert',disabled:'Automatische Regie deaktiviert',
 manual:'Manuelle Regie hat Vorrang',seek:'Song-Sprung wird überprüft',
 blackout:'Blackout hat Vorrang','missing-evidence':'Keine bestätigte Songstruktur verfügbar',
 'incomplete-timeline':'Bestätigte Timeline ist unvollständig',
 'invalid-acts':'Ungültige bestätigte Songabschnitte',
 'no-current-act':'Aktueller Songabschnitt fehlt', 'verified-story':'Bestätigte Songstruktur'};
export function GenreIntelligencePanelV1021({trackId,durationMs,positionMs,playing,genre,
 enabled,manualOverride,seekBlocked,blackout,reducedMotion,lyricsProtected}: {
 trackId:string;durationMs:number;positionMs:number;playing:boolean;genre:string;
 enabled:boolean;manualOverride?:boolean;seekBlocked?:boolean;blackout?:boolean;
 reducedMotion?:boolean;lyricsProtected?:boolean;
}) {
 const plan=planGenreConcertV1021({trackId,durationMs,positionMs,playing,genre,
  enabled,manualOverride,seekBlocked,blackout,reducedMotion,lyricsProtected,
  audio:readEnergyV896(trackId,durationMs,positionMs),timeline:getConcertTimelineV763()});
 return <fieldset aria-label="V1021 Genre Intelligence 3.0" data-v1021-genre-intelligence
  data-v1021-status={plan.status}>
  <legend>V1021 · Genre Intelligence 3.0</legend>
  <p><b>Stilprofil:</b> {genreLabels[plan.profile]}
   <small> · {plan.profileSource==='genre-hint'?'Genre-Angabe, nicht akustisch erkannt':
    'Kein eindeutiger Genre-Hinweis – neutrale Vorschau'}</small></p>
  {plan.status!=='verified'||!plan.current?
   <p><small>{reasons[plan.reason]}. Keine ungeprüften Hook-, Beat- oder Drop-Aussagen.</small></p>:
   <>
    <p><b>Aktuelle Regieidee:</b> {energy[plan.current.energy]} ·
     {' '}vorgesehene Intensität {Math.round(plan.current.plannedIntensity*100)}%</p>
    <p><small>Kamera: {camera[plan.current.look.camera]} ·
     {' '}Bühne: {stage[plan.current.look.stage]} ·
     {' '}Avatare: {avatars[plan.current.look.avatars]} ·
     {' '}Licht: {lights[plan.current.look.lights]} ·
     {' '}Lyrics: {plan.current.look.lyrics==='foreground'?'Vorrang':'lesbar'}</small></p>
    <p><small>{plan.next?`Nächster bestätigter Akt: ${energy[plan.next.energy]}.`:
     'Letzter bestätigter Akt.'} Genreempfehlungen ändern keine Musikmessungen.</small></p>
   </>}
  <small>Nur Vorschau aus verifizierter Song-Timeline. Keine zusätzlichen Requests,
   {' '}keine automatischen Licht-, Kamera- oder Avatar-Kommandos.
   {' '}{reducedMotion?'Bewegungsarm. ':''}
   {' '}{lyricsProtected?'Lyrics-Schutz aktiv. ':''}Manuelle Regie und Blackout haben Vorrang.</small>
 </fieldset>;
}
