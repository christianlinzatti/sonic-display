import type {CrewPlan} from '../components/visualizer/sonicCrewDirector';
export type JointSpringV1135={value:number;velocity:number};
/** Exact critically damped spring: stable across frame rates, no random jitter or undamped oscillation. */
export function jointSpringV1135(value:number,velocity:number,target:number,dt:number,frequency:number):JointSpringV1135{
 if(!Number.isFinite(value)||!Number.isFinite(velocity))return {value:Number.isFinite(target)?target:0,velocity:0};
 if(!Number.isFinite(target))return {value,velocity:0};
 const t=Number.isFinite(dt)?Math.max(0,Math.min(.1,dt)):0,w=Math.max(5,Math.min(30,frequency||12));
 const displacement=value-target,c=velocity+w*displacement,decay=Math.exp(-w*t);
 return {value:target+(displacement+c*t)*decay,velocity:(velocity-w*c*t)*decay};
}
/** Small upper-body anticipation/recovery only. The baked pelvis, knees and feet stay untouched. */
export function performerDynamicsV1135(plan:CrewPlan,beat:number){
 const p=plan.persona;
 if(!p||!plan.active||plan.reaction==='none')return {breath:0,prepare:0,settle:0,frequency:12};
 const b=Number.isFinite(beat)?Math.max(0,beat):0,phase=((b+plan.offset)%8+8)%8;
 const role=plan.interaction?.role,roleGain=role==='echo'?.55:role==='rest'?.3:role==='partner'?.9:1;
 const reading=plan.story?.reading?.3:1,flow=Math.max(.1,Math.min(1.3,p.flow));
 const gain=roleGain*reading;
 const ease=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
 return {breath:Math.sin(b*Math.PI/8+p.phase)*(.003+.003*flow)*gain,
 prepare:ease((phase-7.1)/.9)*.018*gain,
 settle:(phase<1.5?Math.sin(Math.PI*phase/1.5)*Math.exp(-phase*1.5):0)*.024*gain,
 frequency:20-flow*6};
}
