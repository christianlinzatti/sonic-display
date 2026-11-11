import type {ConcertScoreV1134} from './concertScoreV1134';
import type {CrewPlan} from '../components/visualizer/sonicCrewDirector';
import type {Lyrics} from '../types/playbackCore';
import {activeConcertLyric,concertRefrainStarts} from './concertLyricTimeline';
import {SHOW_PRODUCTIONS} from './showProduction';
export type ConcertTier='low'|'balanced'|'high';
export type ConcertAccent={id:string;at:number;kind:'floor'|'rise'|'confetti'};
const clamp=(v:number,a=0,b=1)=>Number.isFinite(v)?Math.max(a,Math.min(b,v)):a;
const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
export function sceneryStrength(value:unknown){return typeof value==='number'&&Number.isFinite(value)?Math.round(clamp(value,0,100)):65;}
export type ConcertFxCadence={slow:number;good:number;pressure:number};
export const newConcertFxCadence=():ConcertFxCadence=>({slow:0,good:0,pressure:0});
/** Measured frame cadence only; quick shedding, deliberately slow recovery. */
export function advanceConcertFxCadence(state:ConcertFxCadence,dt:number,playing:boolean){
 if(!playing||!Number.isFinite(dt)||dt<=0||dt>1){state.slow=0;state.good=0;return state.pressure;}
 if(dt>.045){state.slow+=dt;state.good=0;if(state.slow>=1.5){state.pressure=Math.min(2,state.pressure+1);state.slow=0;}}
 else if(dt<.027){state.good+=dt;state.slow=Math.max(0,state.slow-dt);if(state.good>=12){state.pressure=Math.max(0,state.pressure-1);state.good=0;}}
 else{state.good=0;state.slow=Math.max(0,state.slow-dt*.5);}
 return state.pressure;
}
export function concertFxBudget(tier:ConcertTier,pressure:number,reducedMotion:boolean){
 const rank=Math.max(0,(tier==='high'?2:tier==='balanced'?1:0)-Math.ceil(Number.isFinite(pressure)?clamp(pressure,0,2):2));
 return {tier:(['low','balanced','high'] as const)[rank],lights:reducedMotion?0:rank===2?2:1,particles:reducedMotion?0:rank===2?32:rank===1?14:0,pulse:!reducedMotion&&rank>0};
}
export function placeConcertParticle(target:{position:{set:(x:number,y:number,z:number)=>unknown};rotation:{set:(x:number,y:number,z:number)=>unknown};scale:{setScalar:(value:number)=>unknown}},kind:'rise'|'confetti',index:number,age:number){
 const i=Number.isInteger(index)&&index>=0?index%32:0,seed=((i*73+19)%101)/101,side=i%2?-1:1,t=clamp(age,0,3);
 if(kind==='confetti')target.position.set((seed-.5)*5+Math.sin(i*1.7+t)*.22,2.4-t*(.75+seed*.55),-2.8+((i*31)%13)/24);
 else target.position.set(side*(1.1+seed*1.3)+Math.sin(i+t)*.09,-1.65+t*(.65+seed*.45),-2.55);
 target.rotation.set(t*.25+seed,t*.3+i,seed*6+t*(seed-.5));target.scale.setScalar(kind==='rise'?.7:1);
}
export function concertAccentSchedule(lyrics:Lyrics|null|undefined,durationMs:number):ConcertAccent[]{
 const duration=Number.isFinite(durationMs)&&durationMs>0?durationMs:0;
 const starts=concertRefrainStarts(lyrics),lastEnd=lyrics?.synced?lyrics.lines.at(-1)?.endMs:undefined;
 const tail=typeof lastEnd==='number'&&duration-lastEnd>=750&&duration-lastEnd<=6000?lastEnd:null;
 const final=duration?(tail??(starts.at(-1)?.start!>=duration*.72?starts.at(-1)!.start:duration*.97)):null;
 const accents:ConcertAccent[]=starts.filter(s=>final===null||s.start<final-2000).map(s=>({id:`chorus:${s.visit}:${s.start}`,at:s.start,kind:s.visit%2?'floor':'rise'}));
 if(final!==null)accents.push({id:`finale:${final}`,at:final,kind:'confetti'});
 return accents;
}
export type ConcertAccentState={source:string;armed:boolean;lastFired:number;last?:{position:number;now:number};fired:Set<string>;active?:{event:ConcertAccent;started:number};};
export const newConcertAccentState=():ConcertAccentState=>({source:'',armed:false,lastFired:-Infinity,fired:new Set()});
/** Fire only observed crossings. Loading, scrubbing, looping and resuming never replay a burst. */
export function advanceConcertAccent(state:ConcertAccentState,input:{source:string;position:number;now:number;playing:boolean;allowed:boolean;events:readonly ConcertAccent[]}){
 const sample={position:input.position,now:input.now};
 if(![input.position,input.now].every(Number.isFinite))return null;
 if(state.source!==input.source){state.source=input.source;state.lastFired=-Infinity;state.armed=input.playing&&input.allowed;state.fired.clear();state.active=undefined;state.last=sample;return null;}
 if(!input.playing||!input.allowed){state.armed=false;state.last=sample;state.active=undefined;return null;}
 if(!state.armed){state.armed=true;state.last=sample;return null;}
 const previous=state.last;
 if(!previous){state.last=sample;return null;}
 const dp=input.position-previous.position,dt=input.now-previous.now;
 if(dp< -180||dp>2500||dt<0||dt>2500||dp>0&&Math.abs(dp-dt)>450){state.last=sample;state.active=undefined;return null;}
 if(dp>0){
  state.last=sample;
  const event=input.events.find(e=>previous.position<e.at&&input.position>=e.at&&input.position-e.at<=350&&e.at>state.lastFired&&!state.fired.has(e.id));
  if(event){state.lastFired=event.at;state.fired.add(event.id);if(state.fired.size>16)state.fired.delete(state.fired.values().next().value!);state.active={event,started:input.now};}
 }
 if(!state.active)return null;
 const age=Math.max(0,(input.now-state.active.started)/1000),duration=state.active.event.kind==='floor'?1.6:3;
 if(age>duration){state.active=undefined;return null;}
 return {...state.active.event,age,duration,gain:Math.sin(Math.PI*age/duration)**2};
}
export function planConcertScenery(input:{cue:ConcertScoreV1134;lyrics?:Lyrics|null;enabled:boolean;playing:boolean;reducedMotion:boolean;manual:boolean;tier:ConcertTier;pressure:number;strength?:number;wallLyrics?:boolean}){
 const cue=input.cue,budget=concertFxBudget(input.tier,input.pressure,input.reducedMotion),active=input.enabled&&!input.manual;
 const profile=SHOW_PRODUCTIONS.find(p=>p.id===cue.production?.id),pattern=profile?SHOW_PRODUCTIONS.indexOf(profile):0;
 const protectedText=cue.reading||cue.lyricFocus,quiet=protectedText||cue.act==='breathe';
 const scale=sceneryStrength(input.strength)/100;
 const lineIndex=activeConcertLyric(input.lyrics,cue.positionMs),line=lineIndex<0?null:input.lyrics!.lines[lineIndex];
 const projected=active&&input.wallLyrics!==false&&!cue.reading&&(cue.act==='lift'||cue.act==='finale')&&line&&line.text.length<=180?line:null;
 const scene=cue.reading?'reading':cue.act==='finale'?'finale':cue.act==='lift'?'refrain':cue.act==='build'?'build':cue.staging==='instrumental'?'instrumental':cue.staging==='opening'?'opening':'verse';
 return {active:active&&scale>0,scene,pattern:scene==='refrain'?(pattern+1)%4:scene==='instrumental'?(pattern+2)%4:pattern,budget,primary:profile?.colors[0]??cue.palette,secondary:profile?.colors[1]??'#b59aff',
  brightness:scale*(quiet?.16:scene==='finale'?.68:scene==='refrain'?.52:.30)*(budget.tier==='low'?.8:1),
  motion:input.playing&&!input.reducedMotion&&!protectedText?1:0,openness:quiet?.15:scene==='refrain'||scene==='finale'?.9:.35+(cue.scenePlan?.prepare??0)*.2,
  text:projected?.text??'',textKey:projected?`${projected.startMs}:${projected.text}`:'',textOpacity:projected?(protectedText?.16:.34)*scale:0,
  lights:active&&!input.reducedMotion?Math.min(budget.lights,cue.interaction==='rest'?1:2):0,
  leader:cue.interaction==='unison'?0:cue.leader,partner:cue.interaction==='unison'?Math.max(0,(cue.relationship?.second??1)):cue.partner,
  accentAllowed:active&&scale>0&&input.playing&&!input.reducedMotion&&!protectedText&&cue.act!=='breathe'&&budget.tier!=='low',scale};
}
/** Small audience-facing upper-body cues. Feet, pelvis and manual clips retain their owners. */
export function concertCeremony(plan:CrewPlan){
 const cue=plan.story;if(!plan.active||plan.reaction==='none'||!cue?.scenery||cue.reading||cue.lyricFocus)return {hello:0,ready:0,finish:0};
 const age=cue.positionMs/1000;
 const hello=age>=0&&age<5?Math.sin(Math.PI*age/5)**2:0;
 const finish=cue.durationMs&&cue.act==='finale'?smooth((cue.positionMs/cue.durationMs-.965)/.035):0;
 const ready=plan.slot!==undefined&&cue.scenePlan?.next?.leader===plan.slot?(cue.scenePlan?.prepare??0):0;
 return {hello,ready,finish};
}
