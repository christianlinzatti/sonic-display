/** V395: bounded, visibility-aware recovery for the *existing* WebGL stage.
 * Pure transitions; no timers, browser objects, renderer creation or audio mutations.
 */
export type RecoveryPhaseV395 = 'ready' | 'lost' | 'waiting' | 'restarting' | 'manual';
export type RecoveryCauseV395 = 'context-loss' | 'render-error' | null;
export type RecoveryStateV395 = {
  phase: RecoveryPhaseV395;
  cause: RecoveryCauseV395;
  attempts: number;
  nextAttemptAt: number | null;
  healthySince: number | null;
};
export type RecoveryEventV395 =
  | {type:'lost'|'error'|'restored'|'manual'|'healthy';now:number;enabled:boolean}
  | {type:'tick';now:number;enabled:boolean;visible:boolean};
export const MAX_RECOVERY_ATTEMPTS_V395 = 3;
export const CONTEXT_LOSS_GRACE_MS_V395 = 12_000;
export const RECOVERY_DELAYS_MS_V395 = [2_000,5_000,12_000] as const;
export const RECOVERY_RESET_AFTER_MS_V395 = 120_000;
export const initialRecoveryV395 = ():RecoveryStateV395=>({phase:'ready',cause:null,attempts:0,nextAttemptAt:null,healthySince:null});
const safeTime = (n:number) => Number.isFinite(n)?Math.max(0,n):0;
function schedule(state:RecoveryStateV395, now:number, enabled:boolean, cause:RecoveryCauseV395, delay:number):RecoveryStateV395 {
  const maxed=state.attempts>=MAX_RECOVERY_ATTEMPTS_V395;
  return {phase:enabled&&!maxed?'waiting':'manual',cause,attempts:state.attempts,
    nextAttemptAt:enabled&&!maxed?now+delay:null,healthySince:null};
}
export function advanceRecoveryV395(state:RecoveryStateV395,event:RecoveryEventV395):RecoveryStateV395 {
  const now=safeTime(event.now);
  switch(event.type){
    case 'manual':return {...initialRecoveryV395(),phase:'restarting',cause:state.cause};
    case 'healthy':return {phase:'ready',cause:null,attempts:state.attempts,nextAttemptAt:null,healthySince:now};
    case 'lost':{
      // The browser may restore the original context: do not remount immediately.
      if(state.phase==='lost')return state;
      return {phase:event.enabled&&state.attempts<MAX_RECOVERY_ATTEMPTS_V395?'lost':'manual',cause:'context-loss',
        attempts:state.attempts,nextAttemptAt:event.enabled&&state.attempts<MAX_RECOVERY_ATTEMPTS_V395?now+CONTEXT_LOSS_GRACE_MS_V395:null,healthySince:null};
    }
    case 'restored':
      if(state.phase!=='lost'&&state.cause!=='context-loss')return state;
      return schedule(state,now,event.enabled,'context-loss',750);
    case 'error':
      return schedule(state,now,event.enabled,'render-error',RECOVERY_DELAYS_MS_V395[Math.min(state.attempts,2)]);
    case 'tick':
      if(state.phase==='ready'){
        if(state.attempts>0&&state.healthySince!==null&&now-state.healthySince>=RECOVERY_RESET_AFTER_MS_V395)
          return initialRecoveryV395();
        return state;
      }
      if(state.phase==='restarting'||state.phase==='manual')return state;
      if(!event.enabled)return {...state,phase:'manual',nextAttemptAt:null};
      // Background tabs must never accumulate retry attempts or trigger remounts.
      if(!event.visible||state.nextAttemptAt===null||now<state.nextAttemptAt)return state;
      if(state.attempts>=MAX_RECOVERY_ATTEMPTS_V395)return {...state,phase:'manual',nextAttemptAt:null};
      return {...state,phase:'restarting',attempts:state.attempts+1,nextAttemptAt:null};
  }
}
