/** Browser-boundary mocks only. No production API branch, credentials or real song text. */
const originalLines=[
 [0,5000,'Unter Sternen wächst ein leiser Klang'],
 [7000,12000,'Wir gehen weiter Schritt für Schritt'],
 [14000,19000,'Die Stadt erwacht und nimmt uns mit'],
 [24000,29000,'Ein Licht ein Beat wir heben ab'],
 [32000,37000,'Ein Licht ein Beat wir heben ab'],
 [39000,44000,'Wir tanzen bis der Himmel lacht'],
 [52000,57000,'Noch einmal klingt die ganze Nacht'],
 [64000,69000,'Ein Licht ein Beat wir heben ab'],
 [76000,81000,'Der letzte Funke trägt uns weit'],
 [92000,99000,'Ein Licht ein Beat wir heben ab'],
];
const lyrics={provider:'spotify',synced:true,plainText:originalLines.map(x=>x[2]).join('\n'),
 lines:originalLines.map(([startMs,endMs,text])=>({startMs,endMs,text,words:text.split(' ').map((word,i,all)=>({text:word,startMs:Math.round(startMs+(endMs-startMs)*i/all.length),endMs:Math.round(startMs+(endMs-startMs)*(i+1)/all.length)}))}))};
async function installConcertMocksV1130(page,initial={}){
 const state={position:8000,playing:true,trackId:'MockConcertV1130TrackA',missingLyrics:false,genre:'pop',advancing:false,spotifyStatus:200,lyricsStatus:200,durationMs:100000,...initial};
 let anchor=Date.now();const calls={spotify:0,lyrics:0,genre:0};
 const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
 await page.route('**/api/**',route=>{
  const pathname=new URL(route.request().url()).pathname;
  if(pathname==='/api/avatars'||pathname==='/api/system/status')return route.continue();
  return json(route,{items:[],artists:[],releases:[],playlists:[],enabled:false,configured:false});
 });
 await page.route('**/api/spotify/**',route=>{
  if(new URL(route.request().url()).pathname!=='/api/spotify/current')return json(route,{items:[],connected:true});
  calls.spotify++;
  if(state.spotifyStatus!==200)return json(route,{error:'Mock Spotify unavailable'},state.spotifyStatus);
  return json(route,{connected:true,accountScope:'aaaaaaaaaaaaaaaaaaaaaaaa',track:{id:state.trackId,
   title:state.title??(state.missingLyrics?'Silent Mock Concert':'Aurora Mock Concert'),artist:'Sonic Test Ensemble',artists:['Sonic Test Ensemble'],album:'Original Test Show',
   albumCoverUrl:Object.hasOwn(state,'albumCoverUrl')?state.albumCoverUrl:'/avatars/sonic/aurora-synth.png',spotifyUrl:'https://open.spotify.com/track/mock',durationMs:state.durationMs},
   progressMs:Math.min(state.durationMs,state.position+(state.playing&&state.advancing?Date.now()-anchor:0)),isPlaying:state.playing,fetchedAt:Date.now()});
 });
 await page.route('**/api/lyrics?*',route=>{calls.lyrics++;return state.lyricsStatus!==200?json(route,{error:'Mock lyrics unavailable'},state.lyricsStatus):json(route,state.missingLyrics?null:state.lyricPayload??lyrics);});
 await page.route('**/api/genre?*',route=>{calls.genre++;return json(route,{genre:state.genre,source:'track',confidence:.98,reason:'Controlled test fixture'});});
 return {calls,lyrics,setPlayback(patch){Object.assign(state,patch);anchor=Date.now();},state};
}
module.exports={installConcertMocksV1130,lyrics};
