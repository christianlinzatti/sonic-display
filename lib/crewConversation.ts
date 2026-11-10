import type {CrewPlan} from '../components/visualizer/sonicCrewDirector';
/** Additive upper-body response; authored feet and formation ownership stay intact. */
export function crewConversation(plan:CrewPlan,beat:number){
 const neutral={gaze:0,answer:0,shoulder:0,style:'Ruhe'};
 if(!plan.active||!plan.persona||!plan.interaction||plan.interaction.role==='rest'||plan.story?.reading||!Number.isFinite(beat))return neutral;
 const p=plan.persona,role=plan.interaction.role;
 const phase=((beat+plan.offset)%4+4)%4;
 const wave=Math.sin(Math.PI*Math.min(1,phase/1.5))**2;
 const replying=role==='partner'||role==='echo'||plan.story?.dialogue?.phase==='reply'&&role==='lead';
 const style=p.flow<.4?'Präzise Antwort':p.flow>.9?'Fließende Antwort':'Federnde Antwort';
 return {gaze:role==='together'?0:(plan.interaction.yaw??0)*(1.05+wave*.25),
  answer:replying?wave*(p.flow<.4?.025:.014):0,
  shoulder:replying?Math.sin(phase*Math.PI/2+p.phase)*.012*Math.min(1.2,p.flow+.3):0,style};
}
