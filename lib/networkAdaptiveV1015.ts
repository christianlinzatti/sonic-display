/** V1015: pure, tab-local AIMD-inspired concurrency governor.
 * It never sends requests, records identities or overrides Spotify Retry-After.
 * Deliberate actions and playback retain their dedicated fixed capacity.
 */
export type AdaptiveLaneV1015 = 'regular'|'optional';
export type AdaptiveObservationV1015 = {
  status:number; latencyMs:number; succeeded:boolean; cancelled?:boolean;
};
export type AdaptiveLaneSnapshotV1015 = {
  name:AdaptiveLaneV1015;configured:number;effective:number;
  increases:number;reductions:number;observations:number;lastReason:string;
};
export type AdaptiveSnapshotV1015 = {enabled:true;lanes:AdaptiveLaneSnapshotV1015[]};
type LaneState = AdaptiveLaneSnapshotV1015 & {healthyStreak:number;failureStreak:number;slowStreak:number};
const names:AdaptiveLaneV1015[]=['regular','optional'];
const clamp=(n:number)=>Number.isFinite(n)?Math.max(1,Math.min(12,Math.floor(n))):1;
export class AdaptiveCapacityV1015 {
  private readonly states:Record<AdaptiveLaneV1015,LaneState>;
  constructor(configured:{regular:number;optional:number}){
    this.states={regular:this.initial('regular',configured.regular),optional:this.initial('optional',configured.optional)};
  }
  private initial(name:AdaptiveLaneV1015,limit:number):LaneState{
    const configured=clamp(limit);
    return {name,configured,effective:configured,increases:0,reductions:0,
      observations:0,lastReason:'Konfigurierte Kapazität',healthyStreak:0,failureStreak:0,slowStreak:0};
  }
  reset(){for(const name of names)this.states[name]=this.initial(name,this.states[name].configured);}
  limit(name:AdaptiveLaneV1015){return this.states[name].effective;}
  snapshot():AdaptiveSnapshotV1015{return {enabled:true,lanes:names.map(name=>{
    const {healthyStreak:_,failureStreak:__,slowStreak:___,...publicState}=this.states[name];
    return {...publicState};
  })};}
  observe(name:AdaptiveLaneV1015,observation:AdaptiveObservationV1015){
    const s=this.states[name];
    if(observation.cancelled||observation.status===401||observation.status===403)return;
    s.observations++;
    // Spotify's provider-wide Retry-After is enforced by the coordinator separately.
    // This reduction limits only speculative parallelism, not user actions.
    if(observation.status===429){
      s.healthyStreak=0;s.failureStreak=0;s.slowStreak=0;
      this.lower(s,Math.max(1,Math.floor(s.effective/2)),'HTTP 429 / Spotify-Limit');
      return;
    }
    const transient=observation.status===0||observation.status===408||observation.status===425||observation.status>=500;
    if(!observation.succeeded){
      s.healthyStreak=0;s.slowStreak=0;
      if(!transient){s.failureStreak=0;return;}
      if(++s.failureStreak>=2){this.lower(s,s.effective-1,'Wiederholte Netzwerkfehler');s.failureStreak=0;}
      return;
    }
    s.failureStreak=0;
    // A slow but successful provider is often already overloaded.
    const threshold=name==='regular'?2200:4000;
    if(Math.max(0,observation.latencyMs)>threshold){
      s.healthyStreak=0;
      if(++s.slowStreak>=3){this.lower(s,s.effective-1,'Anhaltend hohe Antwortzeit');s.slowStreak=0;}
      return;
    }
    s.slowStreak=0;
    if(++s.healthyStreak>=6){
      if(s.effective<s.configured){s.effective++;s.increases++;s.lastReason='Stabile schnelle Antworten';}
      s.healthyStreak=0;
    }
  }
  private lower(s:LaneState,target:number,reason:string){
    const next=Math.max(1,Math.min(s.configured,target));
    if(next<s.effective){s.effective=next;s.reductions++;s.lastReason=reason;}
  }
}
