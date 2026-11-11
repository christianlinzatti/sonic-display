import {ensembleBeat} from './concertEnsemble';
import type {CrewPlan} from '../components/visualizer/sonicCrewDirector';
/** Additive upper-body response; authored feet and formation ownership stay intact. */
export function crewConversation(plan:CrewPlan,beat:number){
 const neutral={gaze:0,answer:0,shoulder:0,style:'Ruhe'};
 if(!plan.active||!plan.persona||!plan.interaction||plan.interaction.role==='rest'||(plan.story?.reading||plan.story?.lyricFocus)||!Number.isFinite(beat))return neutral;
 const p=plan.persona,role=plan.interaction.role;
 const phase=((beat+plan.offset)%4+4)%4;
 const ensemble=plan.story?.scenery===true&&plan.ensemble!==false?ensembleBeat(beat,role==='lead'&&plan.story?.dialogue?.phase==='reply'?'partner':role):null;
 const wave=ensemble?.accent??Math.sin(Math.PI*Math.min(1,phase/1.5))**2;
 const replying=role==='partner'||role==='echo'||plan.story?.dialogue?.phase==='reply'&&role==='lead';
 const familiar=(plan.story?.relationship?.visit??0)>0;
 const style=p.flow<.4?'Präzise Antwort':p.flow>.9?'Fließende Antwort':'Federnde Antwort';
 return {gaze:role==='together'?0:(ensemble?.attention??1)*(plan.interaction.yaw??0)*(1.05+wave*(familiar?.18:.25)),
  answer:replying?wave*(p.flow<.4?.025:.014)*(familiar?.85:1):0,
  shoulder:replying&&!ensemble?.listen?Math.sin(phase*Math.PI/2+p.phase)*.012*Math.min(1.2,p.flow+.3):0,style:familiar?`Vertraut · ${style}`:style};
}
