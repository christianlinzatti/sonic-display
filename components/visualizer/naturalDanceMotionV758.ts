/** V758 - Natural Dance Motion 4.0: measured-contact-aware, bounded *additive*
 * stage motion. Uses existing V738/V743 hip motion and V740 secondary-body
 * channels, never invents beats, retargets clips, modifies the root or writes IK.
 * Applied in live rendering and in the GLB Studio preview before final V492 IK.
 */
import type {HipDanceChannelsV735,HipDanceModeV735} from './hipDanceV735';
import type {NaturalBodyChannelsV740} from './naturalBodyDynamicsV740';
export type NaturalDanceSettingsV758={enabled:boolean;strength:number;balance:number;followThrough:number;transition:number};
export const DEFAULT_NATURAL_DANCE_V758:Readonly<NaturalDanceSettingsV758>=Object.freeze({
 enabled:true,strength:65,balance:75,followThrough:65,transition:70
});
export type NaturalDanceStateV758={trackId:string|null;seconds:number|null;left:number;right:number;torso:number};
export const createNaturalDanceStateV758=():NaturalDanceStateV758=>({trackId:null,seconds:null,left:0,right:0,torso:0});
export function resetNaturalDanceV758(s:NaturalDanceStateV758):void{s.trackId=null;s.seconds=null;s.left=0;s.right=0;s.torso=0;}
const valid=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const bound=(x:number,a:number,b:number)=>Math.max(a,Math.min(b,x));
export function normalizeNaturalDanceV758(raw:Partial<NaturalDanceSettingsV758>|null|undefined):NaturalDanceSettingsV758{
 const percent=(v:unknown,def:number)=>valid(v)?Math.round(bound(v,0,100)):def;
 return {enabled:typeof raw?.enabled==='boolean'?raw.enabled:true,
  strength:percent(raw?.strength,65),balance:percent(raw?.balance,75),
  followThrough:percent(raw?.followThrough,65),transition:percent(raw?.transition,70)};
}
export type NaturalDanceInputV758={settings?:Partial<NaturalDanceSettingsV758>|null;
 hip:HipDanceChannelsV735;body:NaturalBodyChannelsV740;mode:HipDanceModeV735;
 trackId?:string|null;seconds:number;delta:number;playing:boolean;reducedMotion:boolean;manualPriority:boolean;
 footIKEnabled:boolean;contactKnown:boolean;plantedLeft?:boolean;plantedRight?:boolean;qualityGain?:number};
export type NaturalDanceOutputV758={active:boolean;hip:HipDanceChannelsV735;body:NaturalBodyChannelsV740;
 support:'unknown'|'double'|'left'|'right'|'flight';level:number};
/** Only a VALID/known pair of contact sensors can trigger support-dependent movement.
 * Both support feet must be untouched, even during transitions from a swing.
 */
export function directNaturalDanceV758(state:NaturalDanceStateV758,input:NaturalDanceInputV758):NaturalDanceOutputV758{
 const s=normalizeNaturalDanceV758(input.settings),hip=input.hip,body=input.body;
 const known=input.footIKEnabled&&input.contactKnown;
 const left=known&&input.plantedLeft===true,right=known&&input.plantedRight===true;
 const support:NaturalDanceOutputV758['support']=!known?'unknown':left&&right?'double':left?'left':right?'right':'flight';
 const neutral=():NaturalDanceOutputV758=>({active:false,hip,body,support,level:0});
 const values=[hip.hipRoll,hip.hipPitch,hip.hipLateral,hip.hipVertical,
  body.chestRoll,body.chestTwist,body.leftArm,body.rightArm,body.leftLeg,body.rightLeg];
 if(!s.enabled||s.strength===0||input.mode==='off'||!input.playing||input.reducedMotion||input.manualPriority||
  !valid(input.seconds)||input.seconds<0||!values.every(valid)||!valid(input.delta)||input.delta<=0){
  resetNaturalDanceV758(state);return neutral();
 }
 const trackId=input.trackId??'';
 const seek=state.seconds!==null&&(input.seconds<state.seconds-.18||input.seconds-state.seconds>2.5);
 const trackChanged=state.trackId!==null&&state.trackId!==trackId;
 if(seek||trackChanged)resetNaturalDanceV758(state);
 state.trackId=trackId;state.seconds=input.seconds;
 const quality=valid(input.qualityGain)?bound(input.qualityGain,0,1):1;
 const strength=s.strength/100*quality;
 // No independent metronome or root displacement. The source envelope is the
 // already blended motion and therefore follows the song and its section.
 const roll=hip.hipRoll!,pitch=hip.hipPitch!,lateral=hip.hipLateral!,vertical=hip.hipVertical!;
 const envelope=bound(Math.max(Math.abs(roll)/.12,Math.abs(pitch)/.10,
  Math.abs(lateral)/.018,Math.abs(vertical)/.022),0,1);
 if(envelope<.000001||strength===0){state.left=0;state.right=0;state.torso=0;return neutral();}
 // Weight shifts stay symmetrical when both feet are down, and subtle when a
 // single foot supports the body. When there is no contact tracking, do NOT
 // introduce one-sided leg or pelvis movement.
 const lean=known&&left!==right?(left?-1:1):0;
 const blend=bound(1-Math.exp(-bound(input.delta,0,.1)*(3.5+7.5*(s.transition/100))),0,1);
 const desired=lean*envelope*strength*(s.balance/100);
 // reset on track jump without keeping a stale supporting foot bias.
 state.left+=((lean<0?desired:0)-state.left)*blend;
 state.right+=((lean>0?desired:0)-state.right)*blend;
 const side=known&&left!==right?bound(state.left+state.right,-1,1):0;
 const desiredTorso=-roll*envelope*strength*(s.followThrough/100);
 state.torso+=(desiredTorso-state.torso)*blend;
 // Pelvis remains on the same centre and at the same height; V492 Foot-IK
 // remains the only mechanism correcting world-space foot placement.
 const hipRoll=bound(roll+side*.008,-.12,.12);
 const outHip:HipDanceChannelsV735={...hip,hipRoll,spineCounter:hip.spineCounter-side*.005};
 const outBody:NaturalBodyChannelsV740={...body,
  chestRoll:bound(body.chestRoll+state.torso*.20-side*.006,-.04,.04),
  chestTwist:bound(body.chestTwist-side*.008,-.035,.035),
  leftArm:bound(body.leftArm+side*.012*(s.followThrough/100),-.05,.05),
  rightArm:bound(body.rightArm-side*.012*(s.followThrough/100),-.05,.05),
  // Never add a single degree of secondary motion to planted support legs.
  leftLeg:left?0:bound(body.leftLeg+Math.max(0,side)*.007,-.032,.032),
  rightLeg:right?0:bound(body.rightLeg+Math.max(0,-side)*.007,-.032,.032),
  leftAnkle:!known||left?0:body.leftAnkle,
  rightAnkle:!known||right?0:body.rightAnkle,
 };
 return {active:true,hip:outHip,body:outBody,support,level:envelope*strength};
}
