/** One in-flight look and at least 900 ms after completion, per bridge/fixture.
 * Kept across sender effect restarts; no timers and no command queue.
 */
export type GoveeLookPacing=Map<string,{pending:boolean;completedAt:number}>;
export function beginGoveeLook(state:GoveeLookPacing,key:string,now:number):boolean{
 if(!Number.isFinite(now)||now<0||!key)return false;
 const old=state.get(key);
 if(old&&(old.pending||now-old.completedAt<900))return false;
 if(!old&&state.size>=64){
  const idle=[...state].find(([,value])=>!value.pending&&now-value.completedAt>=900);
  if(!idle)return false;state.delete(idle[0]);
 }
 state.set(key,{pending:true,completedAt:old?.completedAt??-Infinity});return true;
}
export function finishGoveeLook(state:GoveeLookPacing,key:string,now:number):void{
 const old=state.get(key);if(!old)return;
 state.set(key,{pending:false,completedAt:Number.isFinite(now)?Math.max(old.completedAt,now):Infinity});
}
