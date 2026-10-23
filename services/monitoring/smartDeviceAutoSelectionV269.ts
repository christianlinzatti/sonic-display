import {validProfile,type DevicePerformanceProfile} from './adaptivePerformanceProfilesV267';
import type {ExperimentConfig} from './performanceExperimentsV266';

export type ProfileSuggestion=Readonly<{
 profile:DevicePerformanceProfile;
 status:'ready'|'already-active';
 reason:string;
}>;

/** No cross-device fallback: browser fingerprint must match exactly. */
export function selectDeviceProfile(
 profiles:readonly DevicePerformanceProfile[],
 fingerprint:string,
 current:ExperimentConfig,
):ProfileSuggestion|null {
 if(!fingerprint||fingerprint==='server')return null;
 const candidates=profiles.filter(p=>validProfile(p)&&p.fingerprint===fingerprint);
 if(!candidates.length)return null;
 candidates.sort((a,b)=>b.score-a.score||b.createdAt-a.createdAt||a.id.localeCompare(b.id));
 const profile=candidates[0];
 const status=profile.config.mode===current.mode&&profile.config.director===current.director?'already-active':'ready';
 return {profile,status,reason:status==='already-active'
  ?'Das beste gespeicherte Profil ist bereits aktiv.'
  :'Beste gespeicherte Messung für die exakt erkannte Gerätekennung.'};
}
