/** V961: opt-in, pure per-lamp brightness/color slew control in the existing V909 sender.
 * Never starts timers, performs network access, enables lamps, or overrides V912/V354.
 */
import type {GoveeLookV909} from '@/lib/goveeLanV909';
export type ConcertGovernorPolicyV961={enabled:boolean;playing:boolean;verified:boolean;
 savedShowActive?:boolean;authoredStageActive?:boolean;recovering?:boolean};
export type ConcertGovernorResultV961={look:GoveeLookV909;active:boolean;limited:boolean;reason:string};
const channel=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(255,Math.round(n))):0;
const brightness=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(100,Math.round(n))):0;
const validLook=(look:GoveeLookV909|null|undefined):look is GoveeLookV909=>Boolean(look&&look.color&&
 Number.isFinite(look.brightness)&&['r','g','b'].every(c=>Number.isFinite(look.color[c as keyof GoveeLookV909['color']])));
/** A reduction is immediate; increases and color shifts are paced over existing auto-sync ticks.
 * Even during initial discovery the governor avoids a sudden 100% brightness command.
 * The planned look remains the ceiling, including existing group/master brightness caps.
 */
export function governConcertLookV961(previous:GoveeLookV909|undefined,
 target:GoveeLookV909,policy:ConcertGovernorPolicyV961):ConcertGovernorResultV961{
 const blocked=!policy.enabled||!policy.playing||!policy.verified||policy.savedShowActive===true||
  policy.authoredStageActive===true||policy.recovering===true;
 if(blocked||!validLook(target)||previous&&!validLook(previous))return {look:target,active:false,limited:false,
  reason:blocked?'Manuelle Show, Wiedergabe oder Einwilligung hat Vorrang':'Ungültige Quelldaten'};
 const nextBrightness=brightness(target.brightness);
 const prevBrightness=previous?brightness(previous.brightness):0;
 const newBrightness=Math.min(nextBrightness,prevBrightness+(previous?12:35));
 const color:GoveeLookV909['color']={r:0,g:0,b:0};
 for(const component of ['r','g','b'] as const){
  const requested=channel(target.color[component]);
  const prior=previous?channel(previous.color[component]):requested;
  color[component]=Math.max(prior-40,Math.min(prior+40,requested));
 }
 const newLook={brightness:newBrightness,color};
 const limited=newBrightness!==nextBrightness||color.r!==channel(target.color.r)||
  color.g!==channel(target.color.g)||color.b!==channel(target.color.b);
 return {look:limited?newLook:target,active:true,limited,
  reason:limited?'Begrenzte Lichtänderung ohne zusätzliche LAN-Ticks':'Lichtänderung innerhalb des sicheren Profils'};
}
