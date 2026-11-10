/** V1151 · Read-only, fail-closed suggestions for authenticated Alexa voice help.
 * All inputs are local booleans; no browser, credentials, network or music metadata.
 */
import {classifyAlexaIntentV1148,type AlexaAvailabilityContextV1148} from './alexaCommandAvailabilityV1148';

export const isAlexaSpokenHelpCommandV1151=(v:unknown):v is 'voice-context-help'=>v==='voice-context-help';
export type AlexaSpokenHelpContextV1151=AlexaAvailabilityContextV1148&{
 visible:boolean;trackAvailable:boolean;concertActive:boolean;director?:boolean;
};
export type AlexaSpokenHelpV1151={examples:string[];text:string};
export function buildAlexaSpokenHelpV1151(c:AlexaSpokenHelpContextV1151):AlexaSpokenHelpV1151{
 if(!c.general||!c.visible)return {examples:[],text:'Die persönliche Sprachhilfe benötigt den freigegebenen Alexa-Empfang auf einem sichtbaren Sonic Display.'};
 // These are literal samples from the published German interaction model, never arbitrary speech.
 const examples:string[]=[];
 const add=(intent:string,phrase:string,usable=true)=>{
  if(usable&&classifyAlexaIntentV1148(intent,c).kind==='local-ready'&&!examples.includes(phrase))examples.push(phrase);
 };
 const spotifyTrack=c.spotifyConnected&&c.trackAvailable;
 if(c.concertActive){
  add('DirectorStageFestivalIntent','wechsle die Konzertbühne zur Festivalbühne',c.director===true&&c.spotifyPlaying&&spotifyTrack);
  add('DirectorEnergyIntenseIntent','mach die Konzertshow intensiver',c.director===true&&c.spotifyPlaying&&spotifyTrack);
  add('FullConcertStopIntent','beende die komplette Konzertshow',c.spotifyConnected);
 }else{
  add('FullConcertStartIntent','starte die komplette Konzertshow',spotifyTrack&&c.spotifyPlaying);
 }
 add('LyricsOnIntent','Lyrics einblenden',c.spotifyConnected);
 add('FollowPrimaryArtistIntent','like den Hauptkünstler',spotifyTrack);
 // Prefer a safe color over a power action. Music-sync examples depend on its actual state.
 add(c.goveeAutoSync?'GoveeMusicSyncPauseIntent':'GoveeMusicSyncStartIntent',
  c.goveeAutoSync?'pausiere Govee Musiksynchronisation':'starte Govee Musiksynchronisation');
 add('GoveeColorIntent','stelle Govee auf Blau');
 add('GoveeBrightnessIntent','dimme Govee auf 40 Prozent');
 add('GoveePowerOffIntent','schalte die Govee Lichter aus');
 // The status intent does not require the display-specific permission.
 add('StatusIntent','wie ist der Status',c.spotifyConnected);
 const selected=examples.slice(0,4);
 if(!selected.length)return {
  examples:[],
  text:'Derzeit ist kein weiterer Sprachbefehl lokal vorbereitet. Prüfe in Sonic Display unter Einstellungen, Alexa, die Freigaben und verbinde Spotify oder richte den Govee-Empfänger ein.'
 };
 return {
  examples:selected,
  text:'Auf diesem Display lokal vorbereitet sind zum Beispiel: '+selected.map(x=>'„'+x+'“').join('; ')+
   '. Alexa-Skill, Spotify-Berechtigungen und die Reaktion deiner Leuchten sind damit noch nicht live bestätigt.'
 };
}
