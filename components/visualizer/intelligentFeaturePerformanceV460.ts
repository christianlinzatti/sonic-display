/** V460: coordinated VISUAL performance direction for credited feature artists.
 * The featured names are Spotify credits, NOT recognized vocalists. No waveform,
 * lyrics or artist attribution is synthesized, and stored stage directions win. */
import type {SmartShowPlanV446,SmartShowCueV446} from './smartAutomaticRapShowV446';
import type {MotionSceneV438} from './automaticMotionIntelligenceV438';
import type {ArtistBubblePlanV441} from './artistNameBubblesV441';
import type {ArtistSpotlightV443} from './artistSpotlightV443';
import type {ArtistInteractionPlanV444} from './multiArtistInteractionV444';

export type FeatureMomentV460='off'|'solo'|'reply'|'hook'|'intro'|'outro';
export interface FeatureDirectionV460 {
  active:boolean;moment:FeatureMomentV460;lead:number;partner:number;
  group:boolean;eventId:string;responseGain:number;cameraCue:SmartShowCueV446|null;
}
const clamp=(n:number,a:number,b:number)=>Number.isFinite(n)?Math.min(b,Math.max(a,n)):a;
export function planIntelligentFeatureV460(input:{
  plan:SmartShowPlanV446;cue:SmartShowCueV446;progressMs:number;count:number;
  enabled:boolean;playing:boolean;reducedMotion:boolean;manualProtected:boolean;
}):FeatureDirectionV460{
  const off:FeatureDirectionV460={active:false,moment:'off',lead:0,partner:0,
    group:false,eventId:'',responseGain:0,cameraCue:null};
  const {plan,cue}=input;
  if(!input.enabled||!input.playing||input.reducedMotion||input.manualProtected||
    !cue.active||!cue.eventId||!plan.trackId||plan.count<2||plan.beats.length===0||
    !Number.isFinite(input.progressMs)||input.progressMs<0||!Number.isFinite(input.count)||
    input.count<2||input.count>4||Math.trunc(input.count)!==plan.count)return off;
  const count=plan.count;
  // V446 is an immutable bounded phrase score. Never extrapolate beyond its end.
  let left=0,right=plan.beats.length-1,index=-1;
  while(left<=right){const mid=(left+right)>>1;
    if(plan.beats[mid].atMs<=input.progressMs){index=mid;left=mid+1;}else right=mid-1;
  }
  if(index<0)return off;
  const beat=plan.beats[index];
  if(input.progressMs>=beat.untilMs||beat.untilMs<=beat.atMs)return off;
  const lead=Math.trunc(clamp(beat.focus<0?index%count:beat.focus,0,count-1));
  const partner=(lead+1)%count;
  // Hook is a conservative repeated-LYRICS candidate, not an identified chorus singer.
  const group=cue.group||cue.section==='hook';
  let moment:FeatureMomentV460=group?'hook':cue.section==='intro'?'intro':cue.section==='outro'?'outro':'solo';
  let responseGain=0;
  // Reply is visual choreography ONLY. Require real synced lyric phrase boundaries,
  // enough room for the pair, and at least 1.1s buffer before the next phrase.
  // This does not assign voice identity or alter mouth/lip-sync ownership.
  const phraseMs=beat.untilMs-beat.atMs;
  if(moment==='solo'&&plan.source==='synced-lyrics'&&phraseMs>=8500){
    const from=input.progressMs-beat.atMs;
    const responseStart=Math.max(3600,phraseMs-2900);
    const responseEnd=phraseMs-1050;
    if(from>=responseStart&&from<responseEnd){
      moment='reply';
      responseGain=clamp(Math.min((from-responseStart)/350,(responseEnd-from)/350),0,1);
    }
  }
  const ensemble=group||moment==='intro'||moment==='outro'||moment==='reply';
  const focus=group?-1:lead;
  const cameraCue:SmartShowCueV446={...cue,group:ensemble,focus,
    eventId:`${cue.eventId}:v460:${moment}:${lead}:${partner}`,
    motionScene:group?'hook':moment==='reply'?'duet':cue.motionScene};
  return {active:true,moment,lead,partner,group:ensemble,responseGain,
    eventId:cameraCue.eventId,cameraCue};
}

/** Add a paired visual reply to existing automatic motion, without changing GLB clips. */
export function featureMotionForSlotV460(direction:FeatureDirectionV460,slot:number,
  fallback:MotionSceneV438):MotionSceneV438{
  if(!direction.active||direction.moment!=='reply'||!Number.isInteger(slot))return fallback;
  if(slot===direction.partner)return 'reply';
  if(slot===direction.lead)return 'verse';
  return 'break';
}

/** Name badges describe credited stage slots. Authored and always-visible styles win. */
export function featureBubblesV460(plan:ArtistBubblePlanV441,
  direction:FeatureDirectionV460):ArtistBubblePlanV441{
  if(!direction.active||!plan.enabled||plan.source==='manual-stage'||plan.mode==='always'||
    direction.moment!=='reply')return plan;
  return {...plan,activeSlot:null,bubbles:plan.bubbles.map(b=>({...b,
    emphasized:b.slot===direction.lead||b.slot===direction.partner}))};
}

/** The original V443 spotlight still controls formations; gently include partner in visual reply. */
export function featureSpotlightV460(spotlight:ArtistSpotlightV443,
  direction:FeatureDirectionV460):ArtistSpotlightV443{
  if(!spotlight.enabled||!direction.active||direction.moment!=='reply'||spotlight.group)return spotlight;
  return {...spotlight,slots:spotlight.slots.map(item=>item.slot===direction.partner
    ?{...item,attention:Math.max(item.attention,.76),offsetZ:item.offsetZ-.035*direction.responseGain}
    :item)};
}

/** Accent the existing V444 gestures only for inferred visual scenes.
 * Never claim a partner is singing or interfere with manual vocal/stage roles. */
export function featureInteractionV460(interaction:ArtistInteractionPlanV444,
  direction:FeatureDirectionV460):ArtistInteractionPlanV444{
  if(!interaction.enabled||interaction.source!=='visual-stage'||!direction.active||
    direction.moment!=='reply'||direction.responseGain<=0)return interaction;
  return {...interaction,slots:interaction.slots.map(slot=>{
    if(slot.slot!==direction.partner)return slot;
    const amount=direction.responseGain;
    return {...slot,gesture:{...slot.gesture,
      rightLift:clamp(slot.gesture.rightLift+.07*amount,0,.24),
      shoulder:clamp(slot.gesture.shoulder+.025*amount,0,.085),
      intensity:clamp(slot.gesture.intensity+.18*amount,0,.9)}};
  })};
}
