import type {ConcertScoreV1134} from './concertScoreV1134';
/** Shared phrase clock: partners listen first, then answer; reunions land together. */
export function ensembleBeat(beat:number,role:string){
 const phase=Number.isFinite(beat)?((beat%4)+4)%4:0;
 const response=role==='partner'||role==='echo';
 const t=Math.max(0,Math.min(1,(phase-(response?.65:0))/1.15));
 const accent=Math.sin(t*Math.PI)**2;
 return {accent,listen:response&&phase<.65,attention:phase<2.5?1:Math.max(0,(4-phase)/1.5)};
}
export type EnsembleLightCue={source:string;position:number;capturedAt:number;playing:boolean;protected:boolean;interaction:string;color:string};
let current:EnsembleLightCue|null=null;
export function publishEnsembleLight(score:ConcertScoreV1134,playing:boolean,allowed:boolean,now=Date.now()){
 current=allowed?{source:score.sourceKey,position:score.positionMs,capturedAt:now,playing,
 protected:score.reading||score.lyricFocus,interaction:score.interaction,color:score.production?.color??score.palette??'#8eeaff'}:null;
}
export function getEnsembleLight(){return current;}
export function clearEnsembleLight(){current=null;}
/** Dim-only whole-lamp looks; same LAN sender, no inferred beat, no extra commands. */
export function ensembleLightLook<T extends {brightness:number;color:{r:number;g:number;b:number}}>(look:T,cue:EnsembleLightCue|null,input:{trackId:string;position:number;now:number;enabled:boolean;manual:boolean;role:string;reduced:boolean}):T{
 if(!input.enabled||input.manual||input.reduced||!cue?.playing||cue.source!==`track:${input.trackId}`||
 ![cue.position,cue.capturedAt,input.position,input.now,look.brightness].every(Number.isFinite)||
 input.now<cue.capturedAt||input.now-cue.capturedAt>2500||Math.abs(input.position-cue.position)>2000||
 !/^#[0-9a-f]{6}$/i.test(cue.color)||!Object.values(look.color).every(Number.isFinite))return look;
 const focus=cue.protected,unison=cue.interaction==='unison';
 const factor=focus?.78:unison?.98:input.role==='ambient'?.80:input.role==='rhythm'?.88:.94;
 const mix=focus?.015:unison?.07:.035;
 const hex=cue.color.slice(1),color={...look.color};
 for(const [i,key] of (['r','g','b'] as const).entries())color[key]=Math.round(Math.max(0,Math.min(255,look.color[key]*(1-mix)+parseInt(hex.slice(i*2,i*2+2),16)*mix)));
 return {...look,brightness:Math.max(0,Math.min(look.brightness,Math.floor(look.brightness*factor))),color};
}
