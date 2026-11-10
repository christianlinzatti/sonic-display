/** V1148 · Local-only Alexa command readiness. Never claims AWS Skill delivery.
 * Pure classification: no localStorage, network, Spotify calls or side effects.
 */
export type AlexaAvailabilityKindV1148='local-ready'|'needs-setup'|'skill-only'|'unclassified';
export type AlexaAvailabilityV1148={kind:AlexaAvailabilityKindV1148;label:string;reason:string};
export type AlexaAvailabilityContextV1148={
 general:boolean;artist:boolean;display:boolean;power:boolean;sync:boolean;look:boolean;show:boolean;roomLooks:boolean;
 spotifyConnected:boolean;spotifyPlaying:boolean;goveeConfigured:boolean;goveeAutoSync:boolean;receiverToken:boolean;
};
const SKILL_ONLY=new Set(['AllCommandsIntent','LastVoiceResultIntent','AMAZON.HelpIntent','AMAZON.CancelIntent','AMAZON.StopIntent']);
const ARTIST=new Set(['LikeArtistIntent','UnlikeArtistIntent','FollowAllArtistsIntent','ArtistStatusIntent','UndoArtistIntent','FollowPrimaryArtistIntent','UnfollowPrimaryArtistIntent','SelectFirstArtistIntent','SelectSecondArtistIntent','SelectThirdArtistIntent','SelectArtistIntent']);
const DISPLAY=new Set(['LyricsOnIntent','LyricsOffIntent','NextAvatarIntent','CalmDisplayIntent','NormalDisplayIntent']);
const FULL_SHOW=new Set(['FullConcertStartIntent','FullConcertStopIntent','ConcertSceneCalmIntent','ConcertSceneIntenseIntent','ConcertSceneFinaleIntent']);
const STUDIO=new Set(['ArenaIntent','FestivalIntent','ClubIntent','CalmIntent','StopShowIntent',
 'RapPresetIntent','HardtekkPresetIntent','RockPresetIntent','CinemaPresetIntent','AutoPresetIntent',
 'StageZoneIntent','BackdropZoneIntent','AudienceZoneIntent','AllZonesIntent','WarmMoodIntent','CoolMoodIntent','NeonMoodIntent','AutoMoodIntent',
 'VirtualFxOnIntent','VirtualFxOffIntent','BeamsEffectIntent','FogEffectIntent','ConfettiEffectIntent','StreamersEffectIntent','AutoEffectIntent','EffectsOffIntent']);
const POWER=new Set(['GoveePowerOnIntent','GoveePowerOffIntent','GoveeFixtureOnIntent','GoveeFixtureOffIntent','GoveeGroupOnIntent','GoveeGroupOffIntent']);
const SYNC=new Set(['GoveeMusicSyncStartIntent','GoveeMusicSyncPauseIntent']);
const LOOK=new Set(['GoveeBrightnessIntent','GoveeColorIntent']);
const ROOM_LOOK=new Set(['GoveeArenaIntent','GoveeFestivalIntent','GoveeClubIntent','GoveeCalmIntent','GoveeDimIntent','GoveeAutoIntent']);

const make=(missing:string[],readyNote:string):AlexaAvailabilityV1148=>missing.length?{
 kind:'needs-setup',label:'Nicht lokal vorbereitet',reason:missing.join(' · ')}:{
 kind:'local-ready',label:'Lokal vorbereitet',reason:readyNote};
const requireGeneral=(c:AlexaAvailabilityContextV1148)=>c.general?[]:['Alexa-Empfang einschalten'];
const requireSpotify=(c:AlexaAvailabilityContextV1148)=>c.spotifyConnected?[]:['Spotify verbinden'];
const requireGovee=(c:AlexaAvailabilityContextV1148)=>c.goveeConfigured?[]:['LAN-Bridge und ausgewählte Leuchten einrichten'];
const requireReceiver=(c:AlexaAvailabilityContextV1148)=>c.spotifyConnected||c.receiverToken?[]:['Spotify verbinden oder Govee-Empfänger-Token hinterlegen'];
export function classifyAlexaIntentV1148(intent:string,c:AlexaAvailabilityContextV1148):AlexaAvailabilityV1148{
 if(SKILL_ONLY.has(intent))return {kind:'skill-only',label:'Alexa-Skill erforderlich',
  reason:'Funktion wird durch den Alexa-Skill verarbeitet; dessen Veröffentlichung und Erreichbarkeit sind hier nicht überprüfbar.'};
 if(intent==='StatusIntent')return make([...requireGeneral(c),...requireSpotify(c)],
  'Statusabfrage lokal möglich; der Alexa-Skill und die Relay-Verbindung müssen separat funktionieren.');
 if(ARTIST.has(intent))return make([...requireGeneral(c),...requireSpotify(c),...(c.artist?[]:['Künstlersteuerung freigeben'])],
  'Künstlersteuerung freigegeben; erforderliche Spotify-Berechtigungen und AWS-Verbindung sind nicht live geprüft.');
 if(DISPLAY.has(intent))return make([...requireGeneral(c),...requireSpotify(c),...(c.display?[]:['Anzeigesteuerung freigeben'])],
  'Anzeigesteuerung lokal freigegeben; Alexa-Skill muss separat veröffentlicht sein.');
 if(FULL_SHOW.has(intent))return make([...requireGeneral(c),...requireSpotify(c),
  ...(c.show?[]:['V1145 Konzertshow freigeben']),
  ...((intent==='FullConcertStopIntent'||c.spotifyPlaying)?[]:['Spotify-Titel abspielen'])],
  '360°-Show lokal freigegeben; ein bereits laufender Titel und der veröffentlichte Alexa-Skill bleiben erforderlich.');
 if(STUDIO.has(intent))return make([...requireGeneral(c),...requireSpotify(c)],
  'Konzertstudio muss sichtbar geöffnet sein; AWS-Alexa-Skill ist nicht geprüft.');
 if(POWER.has(intent))return make([...requireGeneral(c),...requireReceiver(c),...requireGovee(c),
  ...(c.power?[]:['Govee Ein/Aus freigeben'])],
  'Nur ausgewählte Lampen; Einzelgeräte und Gruppen benötigen passende Zuordnung. Hardwarezustand nicht geprüft.');
 if(SYNC.has(intent))return make([...requireGeneral(c),...requireReceiver(c),...requireGovee(c),
  ...(c.sync?[]:['V1143 Musik-Sync freigeben'])],
  'Musik-Sync darf umgestellt werden; Leuchten werden nicht eingeschaltet.');
 if(LOOK.has(intent))return make([...requireGeneral(c),...requireReceiver(c),...requireGovee(c),
  ...(c.look?[]:['V1146 Farben und Helligkeit freigeben'])],
  'Nur erlaubte Farben und Helligkeit 1–100%; Gerätezustand nicht geprüft.');
 if(ROOM_LOOK.has(intent))return make([...requireGeneral(c),...requireSpotify(c),...requireGovee(c),
  ...(c.roomLooks?[]:['Govee-Raumlicht freigeben']),
  ...(c.goveeAutoSync?[]:['Musik-Sync einschalten'])],
  'Konzertstudio und laufende Musik erforderlich; vorhandene Shows haben Vorrang.');
 return {kind:'unclassified',label:'Bitte prüfen',reason:'Noch keine lokale Freigabebewertung für diesen Skill-Befehl vorhanden.'};
}
