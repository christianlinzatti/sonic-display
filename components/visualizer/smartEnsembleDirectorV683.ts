/** V683 – verified-section ensemble staging for EXISTING automatic 3/4-avatar groups.
 * This module does not assign singers, create dancers, modify choreography clips,
 * add timestamps, move the camera, or rewrite the user's group timeline.
 */
import type {SectionPlanV681,SectionMomentV681} from './verseHookDropDirectionV681';
import type {GroupStudioV326,GroupCueV326,GroupFormationV326,GroupPointV326} from './multiAvatarStageDirectorV326';
import {layoutV326,protectGroupSpacingV326} from './multiAvatarStageDirectorV326';

export type EnsembleModeV683='solo-focus'|'dialogue'|'ensemble'|'build'|'respite';
export type EnsembleMomentV683={index:number;startMs:number;endMs:number;section:SectionMomentV681['section'];
  mode:EnsembleModeV683;formation:GroupFormationV326;reason:string};
export type EnsemblePlanV683={trackId:string;durationMs:number;count:3|4;
  source:'verified-v681'|'unavailable';moments:readonly EnsembleMomentV683[]};
const valid=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const allowedSections=['verse','hook','build','drop','break'] as const;
const empty=(trackId:string,durationMs:number,count:3|4):EnsemblePlanV683=>({trackId,durationMs,count,source:'unavailable',moments:[]});

/** Preview and staging use the SAME plan; sections are never inferred from BPM,
 * artist credits, synthetic beats, time percentages or unsynchronised lyrics. */
export function planSmartEnsembleV683(plan:SectionPlanV681,count:3|4):EnsemblePlanV683{
  const unavailable=empty(plan.trackId,plan.durationMs,count);
  if((count!==3&&count!==4)||plan.source!=='verified-v604-v671-v679'||!plan.trackId||
    !valid(plan.durationMs)||plan.durationMs<2600||plan.durationMs>7_200_000||
    !Array.isArray(plan.moments)||plan.moments.length<3||plan.moments.length>160)return unavailable;
  let previousEnd=0;
  const moments:EnsembleMomentV683[]=[];
  for(const [index,m] of plan.moments.entries()){
    if(!m||m.index!==index||!valid(m.startMs)||!valid(m.endMs)||m.startMs<previousEnd||
      m.endMs-m.startMs<2600||m.endMs>plan.durationMs||
      !allowedSections.includes(m.section)||!Number.isInteger(m.repetition)||m.repetition<0)return unavailable;
    previousEnd=m.endMs;
    const mode:EnsembleModeV683=m.section==='verse'?'solo-focus':
      m.section==='hook'?(m.arcRole==='main-peak'||m.repetition%2===0?'ensemble':'dialogue'):
      m.section==='drop'?'ensemble':m.section==='build'?'build':'respite';
    const formation:GroupFormationV326=mode==='ensemble'?'wide':mode==='dialogue'||mode==='build'?'arc':
      mode==='solo-focus'?'stagger':'line';
    moments.push({index,startMs:m.startMs,endMs:m.endMs,section:m.section,mode,formation,
      reason:mode==='solo-focus'?'Solofokus ohne neue Sängerzuordnung':
        mode==='dialogue'?'Dialogartige Aufstellung, keine Stimmen-Erkennung':
        mode==='ensemble'?'Breites Gruppenbild für belegten Höhepunkt':
        mode==='build'?'Gestaffelter Gruppenaufbau':'Zurückgenommene Gruppenformation'});
  }
  return {...unavailable,source:'verified-v681',moments};
}

export function ensembleMomentAtV683(plan:EnsemblePlanV683,progressMs:number):EnsembleMomentV683|null{
  if(plan.source!=='verified-v681'||!valid(progressMs)||progressMs<0||progressMs>=plan.durationMs)return null;
  let low=0,high=plan.moments.length;
  while(low<high){const mid=(low+high)>>1;if(plan.moments[mid].startMs<=progressMs)low=mid+1;else high=mid;}
  const m=plan.moments[low-1];return m&&progressMs<m.endMs?m:null;
}

/** Small stage-space adjustments, never new positions beyond V326's limits.
 * Focus is the EXISTING group cue's visual focus, NOT a detected singer. */
function ensemblePositions(mode:EnsembleModeV683,focus:number,count:3|4,minimum:number):GroupPointV326[]{
  const kind:GroupFormationV326=mode==='ensemble'?'wide':mode==='dialogue'||mode==='build'?'arc':
    mode==='solo-focus'?'stagger':'line';
  const base=layoutV326(kind,count);
  if((mode==='solo-focus'||mode==='dialogue')&&Number.isInteger(focus)&&focus>=0&&focus<count){
    const partner=(focus+1)%count;
    for(let i=0;i<count;i++){
      // Subtle front/back emphasis only; preserve the safe lateral V326 lanes.
      base[i]=[base[i][0],0,mode==='solo-focus'?(i===focus?.24:-.24):
        (i===focus||i===partner?.28:-.24)];
    }
  }
  return protectGroupSpacingV326(base,minimum).points;
}

/** Only transforms already automatically generated, song-synced V442/V446 group
 * cues and only when the imported V681 plan matches the same song. Other lanes,
 * singer focus, drop flag, timestamps, model selection and clip URLs are untouched. */
export function refineSmartEnsembleV683(group:GroupStudioV326|null,plan:EnsemblePlanV683,opts:{
  enabled:boolean;reducedMotion:boolean;tier:'low'|'balanced'|'high';
  manualProtected:boolean;
}):GroupStudioV326|null{
  if(!group||!opts.enabled||opts.reducedMotion||opts.tier==='low'||opts.manualProtected||
    plan.source!=='verified-v681'||!group.enabled||!group.songSync||!group.trackId||
    group.trackId!==plan.trackId||group.count!==plan.count||
    group.cues.length<2||group.cues.length>64||
    !group.cues.every(c=>/^(auto-v442-|v446-)/.test(c.id)))return group;
  let changed=false;
  const cues:GroupCueV326[]=group.cues.map((c,i)=>{
    if(!valid(c.at)||c.at<0||!valid(c.transition)||c.transition<0||
      (i>0&&c.transition===0)||!Number.isInteger(c.focus)||c.focus< -1||c.focus>=group.count||
      !Array.isArray(c.positions)||c.positions.length!==group.count)return c;
    const m=ensembleMomentAtV683(plan,c.at*1000);
    if(!m||c.drop&&(m.section!=='hook'&&m.section!=='drop'))return c;
    // Do not alter a cue precisely on an act boundary: V609 remains in charge
    // of smooth transitions, with no sudden V683 layout jumps at a cut.
    if(i>0&&(c.at*1000-m.startMs<800||m.endMs-c.at*1000<800))return c;
    const positions=ensemblePositions(m.mode,c.focus,group.count,group.minSpacing);
    if(c.formation===m.formation&&c.positions.every((p,j)=>p.every((n,k)=>Math.abs(n-positions[j][k])<.001)))return c;
    changed=true;
    return {...c,formation:m.formation,positions};
  });
  return changed?{...group,cues}:group;
}
