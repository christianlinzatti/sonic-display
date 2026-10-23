/** V324 — conservative two-dancer stage-space formation coordinator.
 * Pure calculations: no mutation of GLB clips, bones, IK, authored keyframes or camera.
 * This does not track world-space feet or implement collision physics. */
export type EnsemblePointV324 = [number, number, number];
export type EnsembleRoleV324 = 'together' | 'lead-solo' | 'partner-solo';
export interface EnsembleBalanceSettingsV324 {
  enabled: boolean;
  minSpacing: number;          // 1.4..2.6 stage units
  transitionSmoothness: number; // 0..100, high = slower
  soloFocus: number;           // 0..100
  dropExpansion: number;       // 0..100
  laneSafety: boolean;
}
export const ENSEMBLE_BALANCE_KEY_V324 = 'sonic-ensemble-balance-v324';
export const ENSEMBLE_BALANCE_EVENT_V324 = 'sonic:ensemble-balance-settings-v324';
export const ENSEMBLE_BALANCE_DIAGNOSTIC_V324 = 'sonic:ensemble-balance-diagnostics-v324';
export const DEFAULT_ENSEMBLE_BALANCE_V324: EnsembleBalanceSettingsV324 = {
  enabled: false, minSpacing: 1.75, transitionSmoothness: 70, soloFocus: 50, dropExpansion: 55, laneSafety: true,
};
const finite = (n: unknown, fallback: number): number => typeof n === 'number' && Number.isFinite(n) ? n : fallback;
const clamp = (n: number, a: number, b: number): number => Math.min(b, Math.max(a, n));
const copyPoint = (p: EnsemblePointV324): EnsemblePointV324 => [finite(p[0],0),finite(p[1],0),finite(p[2],0)];
export function normalizeEnsembleBalanceV324(value: unknown): EnsembleBalanceSettingsV324 {
  const p = value && typeof value === 'object' && !Array.isArray(value) ? value as Partial<EnsembleBalanceSettingsV324> : {};
  return {
    enabled: p.enabled === true,
    minSpacing: Math.round(clamp(finite(p.minSpacing, 1.75), 1.4, 2.6)*100)/100,
    transitionSmoothness: Math.round(clamp(finite(p.transitionSmoothness,70),0,100)),
    soloFocus: Math.round(clamp(finite(p.soloFocus,50),0,100)),
    dropExpansion: Math.round(clamp(finite(p.dropExpansion,55),0,100)),
    laneSafety: p.laneSafety !== false,
  };
}
let cached: EnsembleBalanceSettingsV324 | null = null;
export function refreshEnsembleBalanceV324(): EnsembleBalanceSettingsV324 {cached = null;return readEnsembleBalanceV324();}
export function readEnsembleBalanceV324(): EnsembleBalanceSettingsV324 {
  if (cached) return cached;
  if (typeof window === 'undefined') return {...DEFAULT_ENSEMBLE_BALANCE_V324};
  try { cached = normalizeEnsembleBalanceV324(JSON.parse(window.localStorage.getItem(ENSEMBLE_BALANCE_KEY_V324) || 'null')); }
  catch {cached = {...DEFAULT_ENSEMBLE_BALANCE_V324};}
  return cached;
}
export function writeEnsembleBalanceV324(value: unknown): EnsembleBalanceSettingsV324 {
  cached = normalizeEnsembleBalanceV324(value);
  if (typeof window !== 'undefined') {
    try {window.localStorage.setItem(ENSEMBLE_BALANCE_KEY_V324,JSON.stringify(cached));} catch { /* private mode */ }
    window.dispatchEvent(new Event(ENSEMBLE_BALANCE_EVENT_V324));
  }
  return cached;
}
export interface EnsembleStateV324 {
  trackId: string;
  initialized: boolean;
  lead: EnsemblePointV324;
  partner: EnsemblePointV324;
  previousRole: EnsembleRoleV324;
  separation: number;
  protectionActive: boolean;
}
export const createEnsembleStateV324 = (): EnsembleStateV324 => ({
  trackId:'',initialized:false,lead:[0,0,0],partner:[1.9,0,-.5],previousRole:'together',separation:1.9,protectionActive:false,
});
export interface EnsembleInputV324 {
  trackId: string;
  lead: EnsemblePointV324;
  partner: EnsemblePointV324;
  role?: EnsembleRoleV324;
  dropAccent?: boolean;
  beatStrength?: number;
  delta: number;
  playing: boolean;
  reducedMotion: boolean;
  duo: boolean;
  footLockEnabled?: boolean;
  settings: EnsembleBalanceSettingsV324;
}
export interface EnsembleResultV324 {
  lead: EnsemblePointV324;
  partner: EnsemblePointV324;
  separation: number;
  protectionActive: boolean;
  active: boolean;
  role: EnsembleRoleV324;
}
/** Maintain left/right lanes and a minimum XZ gap, without swapping avatars or touching Y. */
export function protectEnsembleLanesV324(
  lead: EnsemblePointV324, partner: EnsemblePointV324, gap: number, laneSafety: boolean,
): {lead: EnsemblePointV324; partner: EnsemblePointV324; corrected: boolean} {
  const a = copyPoint(lead), b = copyPoint(partner);
  const minimum = clamp(finite(gap,1.75),1.4,2.6);
  let corrected = false;
  if (laneSafety && b[0]-a[0]<minimum) {
    const mid=(a[0]+b[0])/2;
    a[0]=mid-minimum/2;b[0]=mid+minimum/2;corrected=true;
  }
  const dx=b[0]-a[0],dz=b[2]-a[2],distance=Math.hypot(dx,dz);
  if(distance<minimum) {
    const ux=distance>.0001?dx/distance:1,uz=distance>.0001?dz/distance:0;
    const adjustment=(minimum-distance)/2;
    a[0]-=ux*adjustment;a[2]-=uz*adjustment;
    b[0]+=ux*adjustment;b[2]+=uz*adjustment;corrected=true;
  }
  return {lead:a,partner:b,corrected};
}
function easedPosition(from:number,to:number,dt:number,smoothness:number,maxSpeed:number):number {
  const easing=(2.8-(smoothness/100)*1.8)*clamp(maxSpeed/.85,.20,1.5);
  const requested=(to-from)*(1-Math.exp(-easing*dt));
  return from+clamp(requested,-maxSpeed*dt,maxSpeed*dt);
}
/** Uses one shared frame clock for both stage groups; position safety always wins over decorative motion.
 * A pause holds the last positions. Track swaps re-seed instead of animating across unrelated songs. */
export function advanceEnsembleBalanceV324(state:EnsembleStateV324,input:EnsembleInputV324):EnsembleResultV324 {
  const rawA=copyPoint(input.lead),rawB=copyPoint(input.partner);
  const role:EnsembleRoleV324=input.role==='lead-solo'||input.role==='partner-solo'?input.role:'together';
  const isActive=input.settings.enabled && input.duo && !input.reducedMotion;
  if (!isActive) {
    state.initialized=false;
    state.trackId=input.trackId;
    state.protectionActive=false;
    state.separation=Math.hypot(rawB[0]-rawA[0],rawB[2]-rawA[2]);
    return {lead:rawA,partner:rawB,separation:state.separation,protectionActive:false,active:false,role};
  }
  const s=normalizeEnsembleBalanceV324(input.settings);
  const protectedBase=protectEnsembleLanesV324(rawA,rawB,s.minSpacing,s.laneSafety);
  const targetA=protectedBase.lead,targetB=protectedBase.partner;
  const focus=s.soloFocus/100*.23;
  const expansion=input.dropAccent && input.playing ? s.dropExpansion/100*.30 : 0;
  const accent=clamp(finite(input.beatStrength,0),0,1);
  // Subtle depth focus only; never move the lead/partner through each other's lanes.
  if (input.playing) {
    if (role==='lead-solo') {targetA[2]+=focus;targetB[2]-=focus*.35;}
    if (role==='partner-solo') {targetB[2]+=focus;targetA[2]-=focus*.35;}
    targetA[0]-=expansion/2;targetB[0]+=expansion/2;
  }
  const safeTargets=protectEnsembleLanesV324(targetA,targetB,s.minSpacing,s.laneSafety);
  if (!state.initialized || state.trackId!==input.trackId) {
    state.lead=[...protectedBase.lead];state.partner=[...protectedBase.partner];
    state.initialized=true;state.trackId=input.trackId;state.previousRole=role;
  }
  if (input.playing) {
    const dt=clamp(finite(input.delta,0),0,.10);
    const speed=(input.footLockEnabled?.28:.85)*(1+accent*.10);
    const update=(start:EnsemblePointV324,target:EnsemblePointV324):EnsemblePointV324 => [
      easedPosition(start[0],target[0],dt,s.transitionSmoothness,speed),
      target[1],
      easedPosition(start[2],target[2],dt,s.transitionSmoothness,speed),
    ];
    state.lead=update(state.lead,safeTargets.lead);
    state.partner=update(state.partner,safeTargets.partner);
  }
  const protectedCurrent=protectEnsembleLanesV324(state.lead,state.partner,s.minSpacing,s.laneSafety);
  state.lead=protectedCurrent.lead;state.partner=protectedCurrent.partner;
  state.previousRole=role;
  state.separation=Math.hypot(state.partner[0]-state.lead[0],state.partner[2]-state.lead[2]);
  state.protectionActive=protectedBase.corrected||safeTargets.corrected||protectedCurrent.corrected;
  return {lead:[...state.lead],partner:[...state.partner],separation:state.separation,
    protectionActive:state.protectionActive,active:true,role};
}
