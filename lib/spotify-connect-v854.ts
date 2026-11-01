/** V854: strict Spotify Connect requests and small, browser-safe state parser. */
import {validSpotifyDeviceIdV851} from "./spotify-playlists-v851";
export type SpotifyRepeatV854="off"|"context"|"track";
export type SpotifyConnectCommandV854 =
 | {action:"transfer";deviceId:string;play:boolean}
 | {action:"volume";volume:number;deviceId:string}
 | {action:"shuffle";enabled:boolean;deviceId:string}
 | {action:"repeat";mode:SpotifyRepeatV854;deviceId:string};
export type SpotifyConnectStateV854={
 activeDeviceId:string|null;activeDeviceName:string|null;supportsVolume:boolean;
 volumePercent:number|null;shuffle:boolean;repeat:SpotifyRepeatV854;isPlaying:boolean;
};
const asObject=(input:unknown):Record<string,unknown>|null=>
 input!==null && typeof input==="object"&&!Array.isArray(input)?input as Record<string,unknown>:null;
const onlyKeys=(record:Record<string,unknown>,allowed:readonly string[])=>
 Object.keys(record).every(key=>allowed.includes(key));
export function parseConnectCommandV854(raw:unknown):SpotifyConnectCommandV854|null{
 const record=asObject(raw);if(!record||!validSpotifyDeviceIdV851(record.deviceId))return null;
 const deviceId=record.deviceId;
 switch(record.action){
  case "transfer":
   return onlyKeys(record,["action","deviceId","play"])&&typeof record.play==="boolean"?{action:"transfer",deviceId,play:record.play}:null;
  case "volume":
   return onlyKeys(record,["action","deviceId","volume"])&&typeof record.volume==="number"&&Number.isInteger(record.volume)&&record.volume>=0&&record.volume<=100?{action:"volume",deviceId,volume:record.volume}:null;
  case "shuffle":
   return onlyKeys(record,["action","deviceId","enabled"])&&typeof record.enabled==="boolean"?{action:"shuffle",deviceId,enabled:record.enabled}:null;
  case "repeat":
   return onlyKeys(record,["action","deviceId","mode"])&&(record.mode==="off"||record.mode==="context"||record.mode==="track")?{action:"repeat",deviceId,mode:record.mode}:null;
  default:return null;
 }
}
export function spotifyConnectRequestV854(command:SpotifyConnectCommandV854):{path:string;method:"PUT";body?:{device_ids:string[];play:boolean}}{
 if(command.action==="transfer")return {path:"/me/player",method:"PUT",body:{device_ids:[command.deviceId],play:command.play}};
 const query=new URLSearchParams({device_id:command.deviceId});
 if(command.action==="volume"){query.set("volume_percent",String(command.volume));return {path:`/me/player/volume?${query}`,method:"PUT"};}
 if(command.action==="shuffle"){query.set("state",String(command.enabled));return {path:`/me/player/shuffle?${query}`,method:"PUT"};}
 query.set("state",command.mode);return {path:`/me/player/repeat?${query}`,method:"PUT"};
}
export function normalizeConnectStateV854(raw:unknown):SpotifyConnectStateV854{
 const data=asObject(raw)??{},device=asObject(data.device)??{};
 const volume=device.volume_percent;
 const volumePercent=typeof volume==="number"&&Number.isInteger(volume)&&volume>=0&&volume<=100?volume:null;
 const id=validSpotifyDeviceIdV851(device.id)?device.id:null;
 return {
  activeDeviceId:id,activeDeviceName:id&&typeof device.name==="string"?device.name:null,
  supportsVolume:!!id&&device.supports_volume===true&&device.is_restricted!==true,
  volumePercent,shuffle:data.shuffle_state===true,
  repeat:data.repeat_state==="track"||data.repeat_state==="context"?data.repeat_state:"off",
  isPlaying:data.is_playing===true
 };
}
