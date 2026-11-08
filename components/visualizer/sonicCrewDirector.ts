/** Only the three bundled performers. Pure clock/clip planning; no scene or audio ownership. */
export const CREW_IDS = ['sonic-neon-pulse','sonic-festival-nova','sonic-chrome-beat'] as const;
export type CrewMode = 'individual'|'unison'|'canon'|'spotlight'|'story';
export type CrewSettings = { enabled:boolean; reactions:boolean; mode:CrewMode };
export const CREW_DEFAULT: CrewSettings = Object.freeze({enabled:true,reactions:true,mode:'individual'});
export type CrewInput = {
 modelId:string; clips:readonly {name:string;duration:number}[]; trackId?:string|null;
 progressMs?:number|null; bpm?:number|null; energy?:number|null; section?:string|null;
 genre?:string|null; slot:number; count:number; playing:boolean; reducedMotion:boolean;
 manualPriority:boolean; settings:CrewSettings;
};
export type CrewState = {key:string;position:number;beat:number;bpm:number;clip:string|null;switched:number;phrase:number};
export const newCrewState = ():CrewState => ({key:'',position:0,beat:0,bpm:120,clip:null,switched:-Infinity,phrase:-1});
export type CrewPlan = {active:boolean;clip:string|null;part:'quiet'|'verse'|'hook'|'drop';beat:number;bpm:number;
 offset:number;leader:number;reaction:'nod'|'welcome'|'led'|'none';reason:string};
export const normalizeCrewSettings = (v:unknown):CrewSettings => {
 const x=v && typeof v==='object'?v as Partial<CrewSettings>:{};
 return {enabled:typeof x.enabled==='boolean'?x.enabled:true,reactions:typeof x.reactions==='boolean'?x.reactions:true,
 mode:x.mode==='unison'||x.mode==='canon'||x.mode==='spotlight'||x.mode==='story'?x.mode:'individual'};
};
const clamp=(x:number,a:number,b:number)=>Math.min(b,Math.max(a,x));
const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
export function crewPart(section?:string|null,energy?:number|null):CrewPlan['part'] {
 const s=(section??'').toLowerCase();
 if(/intro|outro|break|quiet|interlude|ambient/.test(s))return 'quiet';
 if(/drop|peak|climax|finale/.test(s))return 'drop';
 if(/hook|chorus|refrain/.test(s))return 'hook';
 if(/verse|build|bridge/.test(s))return 'verse';
 if(finite(energy)&&energy<.22)return 'quiet';
 return 'verse';
}
export function stepCrew(previous:CrewState,input:CrewInput):{state:CrewState;plan:CrewPlan} {
 const part=crewPart(input.section,input.energy);
 const off=(reason:string)=>({state:newCrewState(),plan:{active:false,clip:null,part,beat:0,bpm:120,offset:0,leader:0,reaction:'none',reason} as CrewPlan});
 if(!CREW_IDS.some(id=>id===input.modelId))return off('other-model');
 if(!input.settings.enabled)return off('disabled');
 if(input.manualPriority)return off('manual');
 if(!input.playing||input.reducedMotion)return off(input.reducedMotion?'reduced-motion':'paused');
 if(!input.trackId?.trim()||!finite(input.progressMs)||input.progressMs<0)return off('no-song-clock');
 const pos=input.progressMs,knownBpm=finite(input.bpm)&&input.bpm>=55&&input.bpm<=210;
 const requestedBpm=knownBpm?input.bpm!:120;
 const key=`${input.trackId}|${input.modelId}|${input.settings.mode}|${input.count}|${input.slot}`;
 const reset=previous.key!==key||pos<previous.position-500||pos>previous.position+5000;
 const dt=reset?0:Math.max(0,(pos-previous.position)/1000);
 // A smoothed tempo estimate integrates elapsed song time; tempo updates do not teleport poses.
 const bpm=reset?requestedBpm:previous.bpm+(requestedBpm-previous.bpm)*(1-Math.exp(-dt/3));
 const beat=reset?pos*bpm/60000:previous.beat+dt*(previous.bpm+bpm)/120;
 const phrase=Math.floor((beat+1e-7)/16),count=clamp(Math.round(input.count)||1,1,4),slot=clamp(Math.round(input.slot)||0,0,count-1);
 const leader=phrase%count,model=CREW_IDS.indexOf(input.modelId as typeof CREW_IDS[number]);
 const signatures=[['Dance_NeonCircuit','Dance_LaserStep'],['Dance_FestivalFlow','Dance_DiscoStar'],['Dance_PopLock','Dance_Clockwork']];
 // V1114: a single user-enabled mode switches the ACTUAL embedded GLB
 // choreography by the observed song section. This does not detect the
 // section itself. Manual clip/timeline/reduced-motion rules still win.
 const effectiveMode:CrewMode=input.settings.mode==='story'
   ?part==='quiet'?'individual':part==='verse'?'spotlight':part==='hook'?'canon':'unison'
   :input.settings.mode;
 const ensemble=count>1&&effectiveMode!=='individual';
 let choices:string[];
 const greet=input.settings.reactions && pos<3000 && part==='quiet' && model===1 && !ensemble;
 if(greet)choices=['Gesture_Wave','Idle_Breathe'];
 else if(part==='quiet')choices=['Idle_Breathe','Dance_Groove'];
 else if(ensemble && effectiveMode==='canon')choices=['Dance_House','Dance_Groove'];
 else if(ensemble && effectiveMode==='spotlight' && slot===leader)choices=[signatures[model][phrase%2],'Dance_Groove'];
 else if(ensemble && (effectiveMode!=='spotlight'||slot!==leader))
   choices=part==='drop'?['Dance_FestivalBounce','Dance_Techno']:part==='hook'?['Dance_House','Dance_Groove']:['Dance_Groove','Dance_House'];
 else if(part==='hook')choices=[signatures[model][phrase%2],'Dance_Disco','Dance_Groove'];
 else if(part==='drop')choices=model===0?['Dance_Shuffle','Dance_Techno']:model===1?['Dance_FestivalBounce','Dance_Disco']:['Dance_Robot','Dance_Techno'];
 else if(/rap|hip.?hop|trap|rnb/i.test(input.genre??''))choices=['Dance_HipHop','Dance_Groove'];
 else if(/house|disco|funk|pop/i.test(input.genre??''))choices=['Dance_House','Dance_Disco','Dance_Groove'];
 else choices=model===0?['Dance_Techno','Dance_Groove']:model===2?['Dance_Robot','Dance_Groove']:['Dance_Groove','Dance_House'];
 const available=new Set(input.clips.filter(c=>finite(c.duration)&&c.duration>.1).map(c=>c.name));
 const candidate=choices.find(name=>available.has(name))??(available.has('Dance_Groove')?'Dance_Groove':null);
 if(!candidate)return off('missing-clips');
 const old=reset?newCrewState():previous;
 // Switch on a bar and hold >=8 seconds. Quiet sections may settle after one bar; greetings may finish after their own clip.
 const barBoundary=Math.floor((beat+1e-7)/4)!==Math.floor((old.beat+1e-7)/4);
 const hold=old.clip==='Gesture_Wave'?3000:part==='quiet'?2000:8000;
 const roleChanged=ensemble&&effectiveMode==='spotlight'&&!!old.key&&old.phrase!==phrase&&(slot===leader||slot===old.phrase%count);
 const keep=!!old.clip&&available.has(old.clip)&&!roleChanged&&(!barBoundary||pos-old.switched<hold-.001);
 const clip=keep?old.clip!:candidate;
 const state={key,position:pos,beat,bpm,clip,switched:clip!==old.clip?pos:old.switched,phrase};
 return {state,plan:{active:true,clip,part,beat,bpm,offset:ensemble&&effectiveMode==='canon'?-slot*2:0,leader,
 reaction:input.settings.reactions?(['nod','welcome','led'] as const)[model]:'none',reason:knownBpm?'music':'tempo-fallback'}};
}
/** Original clips are authored at 120 BPM. A 12s signature retains all 24 beats. */
export function crewClipTime(plan:CrewPlan,duration:number,progressDeltaMs=0):number {
 if(!plan.active||!finite(duration)||duration<=0)return 0;
 const seconds=(plan.beat+plan.offset+clamp(progressDeltaMs,0,1000)*plan.bpm/60000)/2;
 return ((seconds%duration)+duration)%duration;
}
