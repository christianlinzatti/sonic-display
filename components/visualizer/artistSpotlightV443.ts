/** V443: bounded stage-root directions for inferred V442 groups only.
 * Artist credits are not speaker recognition; never modify GLB animation tracks. */
import type {GroupPoseV326} from './multiAvatarStageDirectorV326';
export interface ArtistSpotlightSlotV443 {slot:number;offsetZ:number;turnY:number;attention:number;}
export interface ArtistSpotlightV443 {enabled:boolean;cueId:string;group:boolean;focus:number|null;strength:number;
  showEntry:boolean;slots:ArtistSpotlightSlotV443[];}
const clamp=(v:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,v));
export function planArtistSpotlightV443(input:{pose:GroupPoseV326|null;count:number;seconds:number;
  enabled:boolean;playing:boolean;reducedMotion:boolean;manualPriority:boolean;strength?:number;
  cueAt?:number}):ArtistSpotlightV443 {
  const count=Number.isFinite(input.count)?clamp(Math.trunc(input.count),0,4):0;
  const empty:ArtistSpotlightV443={enabled:false,cueId:'',group:false,focus:null,strength:0,showEntry:false,slots:[]};
  if(!input.enabled||input.reducedMotion||input.manualPriority||!input.pose||count<3||
     !input.playing||input.pose.positions.length<count)return empty;
  const pose=input.pose;
  const seconds=Number.isFinite(input.seconds)?Math.max(0,input.seconds):0;
  const at=Number.isFinite(input.cueAt)?Math.max(0,input.cueAt!):0;
  const strength=clamp(Number.isFinite(input.strength)?input.strength!:65,0,100)/100;
  if(strength<=0)return empty;
  const group=pose.drop||pose.focus<0;
  const focus=group?null:clamp(Math.trunc(pose.focus),0,count-1);
  const showEntry=seconds-at>=0&&seconds-at<1.3;
  const slots=Array.from({length:count},(_,slot):ArtistSpotlightSlotV443=>{
    // The forward direction of the existing stage is -Z. Never move X (safe spacing).
    const offsetZ=group?-.24*strength:slot===focus?-.3*strength:.09*strength;
    let turnY=0;
    if(focus!==null&&slot!==focus){
      const dx=pose.positions[focus][0]-pose.positions[slot][0];
      // Small respectful torso orientation, not full head/eye tracking.
      turnY=clamp(Math.atan2(dx,2.8),-.42,.42)*strength;
    }
    return {slot,offsetZ,turnY,attention:group||slot===focus?1:.35};
  });
  return {enabled:true,cueId:pose.cueId,group,focus,strength:strength*100,showEntry,slots};
}
