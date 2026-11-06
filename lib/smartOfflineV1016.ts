import type {Track,Lyrics} from '../types/music';
/** Session-only offline fallback; never persists Spotify or third-party lyrics. */
export type LastKnownV1016={track:Track;lyrics:Lyrics|null;progressMs:number;fetchedAt:number;seenAt:number};
type RecordV1016=LastKnownV1016 & {lyricSeenAt:number};
export class SmartOfflineV1016 {
  private scope='anonymous';
  private readonly tracks=new Map<string,RecordV1016>();
  private latest:string|null=null;
  constructor(private readonly maxTracks=24,private readonly maxPlaybackAgeMs=20*60*1000,
    private readonly maxLyricsAgeMs=3*60*60*1000){}
  setScope(scope:string){
    if(!scope||scope===this.scope)return;
    this.clear();this.scope=scope;
  }
  clear(){this.tracks.clear();this.latest=null;}
  /** Track identity includes title and artist to reject stale/reused identifiers. */
  private key(track:Track){return JSON.stringify([track.id,track.title,track.artist,track.durationMs]);}
  rememberPlayback(track:Track,progressMs:number,fetchedAt:number,now=Date.now()){
    if(!track.id||!track.title||!track.artist)return;
    const key=this.key(track),old=this.tracks.get(key);
    if(old)this.tracks.delete(key);
    this.tracks.set(key,{track,progressMs,fetchedAt,seenAt:now,lyrics:old?.lyrics??null,
      lyricSeenAt:old?.lyricSeenAt??0});this.latest=key;
    while(this.tracks.size>this.maxTracks)this.tracks.delete(this.tracks.keys().next().value!);
  }
  rememberLyrics(track:Track,lyrics:Lyrics,now=Date.now()){
    const key=this.key(track),old=this.tracks.get(key);
    if(!old||!Array.isArray(lyrics.lines))return;
    this.tracks.delete(key);this.tracks.set(key,{...old,lyrics,lyricSeenAt:now});
  }
  lyricsFor(track:Track,now=Date.now()):Lyrics|null{
    const entry=this.tracks.get(this.key(track));
    return entry&&entry.lyrics&&now-entry.lyricSeenAt<=this.maxLyricsAgeMs ? entry.lyrics:null;
  }
  lastKnown(now=Date.now()):LastKnownV1016|null{
    const record=this.latest?this.tracks.get(this.latest):undefined;
    if(!record||now-record.seenAt>this.maxPlaybackAgeMs)return null;
    return {track:record.track,lyrics:this.lyricsFor(record.track,now),progressMs:record.progressMs,
      fetchedAt:record.fetchedAt,seenAt:record.seenAt};
  }
  stats(){return {tracks:this.tracks.size,hasSnapshot:!!this.lastKnown()};}
}
/** Browser-tab singleton. Clearing on auth failure, sign-out and account change is mandatory. */
export const smartOfflineV1016=new SmartOfflineV1016();
