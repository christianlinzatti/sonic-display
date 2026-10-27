/** V576: conservative ground-contact safety on additive V545 channels.
 * Contact from the PREVIOUS animation frame, never an inferred new footstep.
 */
import type {AvatarRigMotion} from './avatarRigController';
const finite=(n:number|undefined)=>n===undefined||Number.isFinite(n);
export function protectFootworkV576<T extends AvatarRigMotion>(motion:T,options:{contactKnown:boolean;
 plantedLeft:boolean;plantedRight:boolean;enabled:boolean;manualPriority:boolean;reducedMotion:boolean}):T{
 if(!options.enabled||!options.contactKnown||options.manualPriority||options.reducedMotion||
    !finite(motion.footStep)||!finite(motion.legGroove)||!finite(motion.weightShift))return motion;
 if(!options.plantedLeft&&!options.plantedRight)return motion;
 // Two known grounded feet demand a stable stance, one grounded foot a pivot.
 const stance=options.plantedLeft&&options.plantedRight;
 return {...motion,
    footStep:Math.max(-.19,Math.min(.19,(motion.footStep??0)*(stance?.80:.94))),
    legGroove:Math.max(-.22,Math.min(.22,(motion.legGroove??0)*(stance?.92:.98))),
    weightShift:Math.max(-.34,Math.min(.34,(motion.weightShift??0)*(stance?.94:1)))};
}
