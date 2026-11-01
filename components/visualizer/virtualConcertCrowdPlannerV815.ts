/** V815 – seek-stable and bounded virtual crowd driven by verified V810 show cues.
 * No audio source, WebGL or wall-clock access; invalid data always fails closed.
 */
import type {ConcertFxCueV810,ConcertFxSettingsV810} from './concertFxStudioV810';

export const CROWD_MAX_V815=72;
export type VirtualCrowdCueV815={
 active:boolean;count:number;movement:number;phoneOpacity:number;lightGain:number;
 phase:number;primary:string;secondary:string;
};
export const CROWD_OFF_V815:Readonly<VirtualCrowdCueV815>={
 active:false,count:0,movement:0,phoneOpacity:0,lightGain:0,phase:0,
 primary:'#ffffff',secondary:'#ffffff'
};
const clamp=(v:number)=>Math.min(1,Math.max(0,v));
export function planVirtualConcertCrowdV815(i:{
 fx:ConcertFxCueV810;settings:ConcertFxSettingsV810;
 tier:'low'|'balanced'|'high';lyricsProtected:boolean;vocalFocus:boolean;
 groupCount:number;energy:number;kick:number;crowdBudget:number;
}):VirtualCrowdCueV815 {
 const {fx,settings:s}=i;
 if(!fx.active||fx.reason!=='music'||!s.enabled||!s.virtualCrowd||
  i.tier==='low'||!Number.isInteger(i.groupCount)||i.groupCount<1||i.groupCount>4||
  ![i.energy,i.kick,i.crowdBudget,s.intensity,s.crowdIntensity].every(Number.isFinite)||
  s.intensity<=0||s.crowdIntensity<=0||i.crowdBudget<=0)return CROWD_OFF_V815;
 const budget=clamp(i.crowdBudget)*(i.tier==='balanced'?.7:1);
 const quality=s.quality==='performance'?.34:s.quality==='balanced'?.7:1;
 const density=s.crowdDensity==='sparse'?.4:s.crowdDensity==='arena'?1:.7;
 const count=Math.min(CROWD_MAX_V815,Math.floor(CROWD_MAX_V815*density*
  (s.quality==='performance'?.5:1)*(i.tier==='balanced'?.67:1)*budget));
 if(count<2)return CROWD_OFF_V815;
 const section=fx.section==='drop'?1:fx.section==='finale'?.9:fx.section==='hook'?.8:
  fx.section==='build'?.6:fx.section==='verse'?.33:fx.section==='intro'?.23:.1;
 const genre=fx.genre==='hardtekk'||fx.genre==='hardstyle'?1:fx.genre==='rock'?.85:
  fx.genre==='rap'?.63:.58;
 const protect=(i.lyricsProtected&&s.protectLyrics?.65:1)*(i.vocalFocus?.7:1)*
  (i.groupCount>=3?.8:1);
 const gain=clamp(s.intensity/100)*clamp(s.crowdIntensity/100)*quality*budget*
  genre*section*protect;
 const beat=clamp(clamp(i.kick)*.72+clamp(i.energy)*.28);
 return {active:true,count,movement:Math.min(.22,gain*(.06+beat*.16)),
  phoneOpacity:s.crowdPhones?Math.min(.34,gain*(.09+beat*.25)):0,
  lightGain:Math.min(.25,gain*(.07+beat*.18)),phase:Number.isFinite(fx.phase)?fx.phase:0,
  primary:fx.primary,secondary:fx.secondary};
}

/** Intentionally empty center lane: the performer camera/lyrics remain unobstructed. */
export type CrowdPersonV815={x:number;y:number;z:number;phase:number;phone:boolean;scale:number};
export function createVirtualCrowdLayoutV815():CrowdPersonV815[]{
 const persons:CrowdPersonV815[]=[];
 for(let row=0;row<4;row++)for(let col=0;col<9;col++)for(const side of [-1,1]){
  const index=persons.length;
  const noise=((index*17+row*11+col*23)%29)/29;
  persons.push({x:side*(3.05+col*.43+row*.12),y:-1.85+noise*.15,
   z:2.95+row*.45+noise*.1,scale:.83+noise*.35,
   phase:index*.61+noise*2.5,phone:(index*7+row)%5===0});
 }
 return persons;
}
