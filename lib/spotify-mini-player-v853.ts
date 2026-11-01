/** V853: strict command allowlist and presentational helpers for Spotify Connect control. */
export const SPOTIFY_MINI_PLAYER_ACTIONS_V853 = ["pause","resume","next","previous"] as const;
export type SpotifyMiniPlayerActionV853 = typeof SPOTIFY_MINI_PLAYER_ACTIONS_V853[number];
export function parseMiniPlayerActionV853(raw:unknown):SpotifyMiniPlayerActionV853|null{
 if(!raw||typeof raw!=="object"||Array.isArray(raw))return null;
 const action=(raw as Record<string,unknown>).action;
 return typeof action==="string"&&SPOTIFY_MINI_PLAYER_ACTIONS_V853.some(item=>item===action)?action as SpotifyMiniPlayerActionV853:null;
}
export function playbackPathV853(action:SpotifyMiniPlayerActionV853):{path:string;method:"PUT"|"POST"}{
 switch(action){
  case "pause":return {path:"/me/player/pause",method:"PUT"};
  case "resume":return {path:"/me/player/play",method:"PUT"};
  case "next":return {path:"/me/player/next",method:"POST"};
  case "previous":return {path:"/me/player/previous",method:"POST"};
 }
}
export function formatPlayerTimeV853(value:number){
 const seconds=Math.floor(Math.max(0,Number.isFinite(value)?value:0)/1000);
 return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,"0")}`;
}
export function playerProgressV853(progress:number,duration:number){
 return duration>0?Math.min(100,Math.max(0,100*Math.max(0,progress)/duration)):0;
}
