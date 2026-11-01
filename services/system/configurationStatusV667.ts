/** V667: allowlisted server configuration snapshot. No secret values, network probes or credentials. */
export type ServiceConfigurationV667 = {
  id:string; label:string; configured:boolean; enabled:boolean; note:string;
};
export type ConfigurationSnapshotV667 = { version:667; services:ServiceConfigurationV667[] };
const present=(value:string|undefined):boolean=>typeof value==="string"&&value.trim().length>0
  && !/^(your_|replace-with-|example|changeme)/i.test(value.trim());
export function getConfigurationSnapshotV667(env:Readonly<Record<string,string|undefined>>):ConfigurationSnapshotV667{
  const spotify=present(env.SPOTIFY_CLIENT_ID)&&present(env.SPOTIFY_CLIENT_SECRET)&&present(env.SPOTIFY_REDIRECT_URI)&&present(env.SESSION_SECRET);
  const genius=present(env.GENIUS_ACCESS_TOKEN);
  const lastfm=present(env.LASTFM_API_KEY);
  const photo=env.STAGE_FLICKR_ENABLED!=="false";
  const musicbrainz=env.MUSICBRAINZ_ENABLED!=="false";
  const theaudiodb=env.THEAUDIODB_ENABLED!=="false";
  const push=present(env.UPSTASH_REDIS_REST_URL)&&present(env.UPSTASH_REDIS_REST_TOKEN)&&present(env.PUSH_ENCRYPTION_KEY)&&present(env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)&&present(env.VAPID_PRIVATE_KEY)&&present(env.VAPID_SUBJECT);
  return {version:667,services:[
    {id:"spotify",label:"Spotify",configured:spotify,enabled:spotify,note:"OAuth-Konfiguration; Verbindungsstatus separat aus Live-Wiedergabe"},
    {id:"lrclib",label:"LRCLIB",configured:true,enabled:true,note:"Kein API-Schlüssel erforderlich; Erreichbarkeit nicht geprüft"},
    {id:"lyrics-ovh",label:"Lyrics.ovh",configured:true,enabled:true,note:"Öffentlicher Lyrics-Fallback; Erreichbarkeit nicht geprüft"},
    {id:"genius",label:"Genius",configured:genius,enabled:genius,note:"Token vorhanden oder fehlt; Erreichbarkeit nicht geprüft"},
    {id:"spotify-lyrics",label:"Spotify Color Lyrics",configured:spotify,enabled:spotify&&env.SPOTIFY_INTERNAL_LYRICS_ENABLED==="true",note:"Optionale, undokumentierte Spotify-Schnittstelle"},
    {id:"musixmatch",label:"Musixmatch",configured:false,enabled:false,note:"Zurzeit kein aktiver Provider in der Lyrics-Pipeline"},
    {id:"lastfm",label:"Last.fm",configured:lastfm,enabled:lastfm,note:"Genre-Metadaten, Schlüsselstatus"},
    {id:"musicbrainz",label:"MusicBrainz",configured:true,enabled:musicbrainz,note:"Metadaten ohne API-Schlüssel; Erreichbarkeit nicht geprüft"},
    {id:"theaudiodb",label:"TheAudioDB",configured:present(env.THEAUDIODB_API_KEY),enabled:theaudiodb&&present(env.THEAUDIODB_API_KEY),note:"Metadaten-Schlüssel und Feature-Schalter"},
    {id:"flickr",label:"Flickr-Bilder",configured:present(env.FLICKR_API_KEY),enabled:photo&&present(env.FLICKR_API_KEY),note:"Optionale Künstlerfotos; Lizenzhinweise beachten"},
    {id:"blob",label:"Vercel Blob",configured:present(env.BLOB_READ_WRITE_TOKEN),enabled:present(env.BLOB_READ_WRITE_TOKEN),note:"Uploads und Asset-Speicherung"},
    {id:"admin",label:"Avatar-Administration",configured:present(env.SONIC_ADMIN_PASSWORD)&&present(env.SONIC_ADMIN_SESSION_SECRET),enabled:present(env.SONIC_ADMIN_PASSWORD)&&present(env.SONIC_ADMIN_SESSION_SECRET),note:"Konfiguration, keine Aussage über Login"},
    {id:"push",label:"Web-Push",configured:push,enabled:push,note:"Serverkonfiguration; Browser-Berechtigung separat"},
  ]};
}
