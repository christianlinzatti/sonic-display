/** Local music-conditioned choreography, without network calls or invented audio data. */
export const ENCORE_AVATARS_V1129 = [
 {id:'sonic-ember-rock',slug:'ember-rock',label:'Ember Rock',variant:0,genres:['Rock','Metal','Punk'],preset:'freestyle'},
 {id:'sonic-luna-flow',slug:'luna-flow',label:'Luna Flow',variant:1,genres:['Ambient','Trance','Classical'],preset:'freestyle'},
 {id:'sonic-sol-groove',slug:'sol-groove',label:'Sol Groove',variant:1,genres:['Latin','Afrobeat','Reggae','Funk'],preset:'freestyle'},
 {id:'sonic-velvet-jazz',slug:'velvet-jazz',label:'Velvet Jazz',variant:0,genres:['Jazz','Swing','Soul','Blues','Country'],preset:'freestyle'},
] as const;
export type MusicFamilyV1129='hard'|'electronic'|'urban'|'latin'|'afro'|'jazz'|'rock'|'classical'|'ambient'|'pop'|'global';
export function musicFamilyV1129(genre?:string|null):MusicFamilyV1129{
 const g=genre??'';
 if(/hardtekk|hardstyle|hardcore|gabber|tekk|drum.?and.?bass|\bdnb\b/i.test(g))return 'hard';
 if(/rap|hip.?hop|trap|drill|r.?&.?b|rnb/i.test(g))return 'urban';
 if(/latin|salsa|bachata|reggaeton|samba|bossa/i.test(g))return 'latin';
 if(/afro|amapiano|reggae|dancehall/i.test(g))return 'afro';
 if(/jazz|swing|blues|soul|country/i.test(g))return 'jazz';
 if(/rock|metal|punk|industrial/i.test(g))return 'rock';
 if(/classical|klassik|orchestra|waltz|walzer|soundtrack/i.test(g))return 'classical';
 if(/ambient|chill|lo.?fi|meditation|acoustic|akustik/i.test(g))return 'ambient';
 if(/techno|house|trance|electro|edm|dubstep/i.test(g))return 'electronic';
 if(/pop|disco|funk|schlager|k.?pop/i.test(g))return 'pop';
 return 'global';
}
const POOLS:Record<MusicFamilyV1129,readonly string[]>={
 hard:['Dance_Shuffle','Dance_Techno','Dance_FestivalBounce','Dance_Robot'],
 electronic:['Dance_House','Dance_Techno','Dance_Shuffle','Dance_LiquidWave'],
 urban:['Dance_HipHop','Dance_Robot','Dance_Groove','Dance_AfroPulse'],
 latin:['Dance_LatinSway','Dance_Disco','Dance_House','Dance_Groove'],
 afro:['Dance_AfroPulse','Dance_LatinSway','Dance_HipHop','Dance_Groove'],
 jazz:['Dance_JazzSwing','Dance_Disco','Dance_Groove','Dance_House'],
 rock:['Dance_RockDrive','Dance_FestivalBounce','Dance_HipHop','Dance_Groove'],
 classical:['Dance_Waltz','Dance_LiquidWave','Dance_Groove','Idle_Breathe'],
 ambient:['Dance_LiquidWave','Dance_Waltz','Idle_Breathe','Dance_Groove'],
 pop:['Dance_Disco','Dance_House','Dance_Groove','Dance_FestivalBounce'],
 global:['Dance_Groove','Dance_House','Dance_HipHop','Dance_Disco'],
};
export const genreClipsV1129=(genre?:string|null)=>POOLS[musicFamilyV1129(genre)];
/** A phrase index walks the pool; per-track offset keeps repeat songs recognizable. */
export function variedClipV1129(choices:readonly string[],available:ReadonlySet<string>,phrase:number,
 trackId:string,slot:number,previous:string|null):string|null{
 const pool=[...new Set(choices)].filter(x=>available.has(x));
 if(!pool.length)return available.has('Dance_Groove')?'Dance_Groove':null;
 if(phrase<=0)return pool[0];
 let seed=0;for(const c of trackId)seed=(Math.imul(seed,31)+c.charCodeAt(0))>>>0;
 const start=(Math.max(0,Math.floor(phrase))+seed+Math.max(0,slot))%pool.length;
 for(let n=0;n<pool.length;n++){const clip=pool[(start+n)%pool.length];if(clip!==previous||pool.length===1)return clip;}
 return pool[0];
}
const finite=(v:number)=>Number.isFinite(v)?v:0;
/** One stable entrance per lyric line. Never synthesizes word timestamps. */
export function lyricEntranceV1129(input:{genre?:string|null;elapsedMs:number;durationMs:number;
 playing:boolean;reducedMotion:boolean;highQuality:boolean}){
 const family=musicFamilyV1129(input.genre);
 if(!input.playing||input.reducedMotion||!input.highQuality)return {x:0,y:0,z:0,scale:1,opacity:1,family};
 const elapsed=Math.max(0,finite(input.elapsedMs)),duration=Math.max(200,finite(input.durationMs));
 const t=Math.min(1,elapsed/650),ease=1-Math.pow(1-t,3),remain=1-ease;
 const soft=family==='ambient'||family==='classical';
 const punch=family==='rock'||family==='hard'||family==='urban';
 return {x:soft?0:(punch?-.10:.10)*remain,y:(soft?-.045:.035)*remain,
 z:punch?.06*remain:0,scale:1+(punch?.045:.018)*Math.sin(t*Math.PI),
 opacity:Math.min(1,.68+.32*ease)*Math.min(1,.8+Math.max(0,duration-elapsed)/600),family};
}
