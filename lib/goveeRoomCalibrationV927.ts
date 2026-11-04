/** V927 – Intelligent Room Light Calibration.
 * Configures manually observed *visible* fixture lag separately from diagnostic
 * HTTP/UDP status roundtrip. Govee LAN does NOT acknowledge visual output, so
 * status probes MUST NOT be mistaken for optical latency or auto-calibration.
 * Pure, bounded precompensation of existing V922/V923/V925/V926 wave planners;
 * no extra LAN dispatch, power changes, strobe or unverified drop forecast.
 */
import type {TrackAnalysisV318} from '@/services/musicAnalysis/trackAnalysisV318';

export const GOVEE_CALIBRATION_KEY_V927='sonic-display:govee-room-calibration-v927';
export const GOVEE_CALIBRATION_EVENT_V927='sonic-display:govee-room-calibration-changed-v927';
export type GoveeFixtureCalibrationV927={visualDelayMs:number;statusRoundtripMs?:number;statusSamples?:number;checkedAt?:number};
export type GoveeRoomCalibrationV927={schema:'govee-room-calibration-v927';enabled:boolean;maxAdvanceMs:number;
 fixtures:Record<string,GoveeFixtureCalibrationV927>};
export const DEFAULT_GOVEE_CALIBRATION_V927:GoveeRoomCalibrationV927={
 schema:'govee-room-calibration-v927',enabled:false,maxAdvanceMs:350,fixtures:{},
};
const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,Number.isFinite(v)?v:min));
const finite=(v:unknown,def:number,min:number,max:number,step=1)=>typeof v==='number'&&Number.isFinite(v)
 ?Math.round(clamp(v,min,max)/step)*step:def;
const privateIp=(ip:string)=>{const parts=ip.split('.');if(parts.length!==4||parts.some(p=>!/^(?:\d{1,3})$/.test(p)||+p>255))return false;
 const a=+parts[0],b=+parts[1];return a===10||(a===172&&b>=16&&b<=31)||(a===192&&b===168);};
export function normalizeGoveeCalibrationV927(raw:unknown):GoveeRoomCalibrationV927{
 const o=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<GoveeRoomCalibrationV927>:{};
 const fixtures:Record<string,GoveeFixtureCalibrationV927>={};
 if(o.fixtures&&typeof o.fixtures==='object'&&!Array.isArray(o.fixtures)){
  for(const [ip,entry] of Object.entries(o.fixtures).slice(0,32)){
   if(!privateIp(ip)||!entry||typeof entry!=='object'||Array.isArray(entry))continue;
   const v=entry as Partial<GoveeFixtureCalibrationV927>;
   const item:GoveeFixtureCalibrationV927={visualDelayMs:finite(v.visualDelayMs,0,0,500,10)};
   // Read-only diagnostic metadata; it MUST NOT affect computed advance.
   if(typeof v.statusRoundtripMs==='number'&&Number.isFinite(v.statusRoundtripMs)&&v.statusRoundtripMs>=0)
    item.statusRoundtripMs=finite(v.statusRoundtripMs,0,0,3000);
   if(typeof v.statusSamples==='number'&&Number.isFinite(v.statusSamples)&&v.statusSamples>=1)
    item.statusSamples=finite(v.statusSamples,1,1,5);
   if(typeof v.checkedAt==='number'&&Number.isSafeInteger(v.checkedAt)&&v.checkedAt>=0)
    item.checkedAt=v.checkedAt;
   fixtures[ip]=item;
  }
 }
 return {schema:'govee-room-calibration-v927',enabled:o.enabled===true,
  maxAdvanceMs:finite(o.maxAdvanceMs,350,0,500,10),fixtures};
}
export function loadGoveeCalibrationV927():GoveeRoomCalibrationV927{
 if(typeof window==='undefined')return normalizeGoveeCalibrationV927(null);
 try{return normalizeGoveeCalibrationV927(JSON.parse(localStorage.getItem(GOVEE_CALIBRATION_KEY_V927)||'null'));}
 catch{return normalizeGoveeCalibrationV927(null);}
}
export function saveGoveeCalibrationV927(value:GoveeRoomCalibrationV927):void{
 if(typeof window==='undefined')return;
 localStorage.setItem(GOVEE_CALIBRATION_KEY_V927,JSON.stringify(normalizeGoveeCalibrationV927(value)));
 window.dispatchEvent(new Event(GOVEE_CALIBRATION_EVENT_V927));
}
/** Visual lag is deliberately provided by the user, NOT inferred from UDP status. */
export function setGoveeVisualDelayV927(value:GoveeRoomCalibrationV927,ip:string,delayMs:number):GoveeRoomCalibrationV927{
 const s=normalizeGoveeCalibrationV927(value);
 if(!privateIp(ip))return s;
 const previous=s.fixtures[ip]??{visualDelayMs:0};
 return normalizeGoveeCalibrationV927({...s,fixtures:{...s.fixtures,[ip]:{...previous,visualDelayMs:delayMs}}});
}
/** A manually requested /status call includes 350ms bridge-side waiting!
 * This metric is for troubleshooting only; a status reply is not an optical ACK.
 */
export function recordGoveeStatusRoundtripV927(value:GoveeRoomCalibrationV927,ip:string,
 samples:readonly number[],checkedAt:number):GoveeRoomCalibrationV927{
 const s=normalizeGoveeCalibrationV927(value);
 if(!privateIp(ip)||!Number.isSafeInteger(checkedAt)||checkedAt<0||samples.length<1||samples.length>5||
   samples.some(v=>!Number.isFinite(v)||v<0||v>3000))return s;
 const mean=Math.round(samples.reduce((sum,v)=>sum+v,0)/samples.length);
 const previous=s.fixtures[ip]??{visualDelayMs:0};
 return normalizeGoveeCalibrationV927({...s,fixtures:{...s.fixtures,[ip]:{...previous,
  statusRoundtripMs:mean,statusSamples:samples.length,checkedAt}}});
}
/** Advance an existing slow wave at command-planning time to offset visible lag.
 * This is a phase shift only – it never schedules earlier hardware commands.
 */
export function goveeVisualAdvanceV927(ip:string,selectedIps:readonly string[],value:GoveeRoomCalibrationV927):number{
 if(!value.enabled||!selectedIps.includes(ip)||!privateIp(ip))return 0;
 const s=normalizeGoveeCalibrationV927(value);
 return Math.min(s.maxAdvanceMs,s.fixtures[ip]?.visualDelayMs??0);
}
export function compensatedGoveeWaveTimeV927(timeMs:number,ip:string,selectedIps:readonly string[],
 value:GoveeRoomCalibrationV927):number{
 if(!Number.isFinite(timeMs)||timeMs<0)return timeMs;
 return timeMs+goveeVisualAdvanceV927(ip,selectedIps,value);
}
/** Verified V318 phases must NEVER be moved into the next section/drop.
 * When an advance would cross a section edge, return original progress instead.
 */
export function compensatedGoveeVerifiedTimeV927(
 analysis:TrackAnalysisV318|null|undefined,trackId:string,progressMs:number,ip:string,
 selectedIps:readonly string[],value:GoveeRoomCalibrationV927):number{
 const advance=goveeVisualAdvanceV927(ip,selectedIps,value);
 if(advance<=0||!Number.isFinite(progressMs)||progressMs<0||!analysis||analysis.trackId!==trackId||
  !Array.isArray(analysis.sections)||!Number.isFinite(analysis.durationMs)||progressMs>=analysis.durationMs)return progressMs;
 const current=analysis.sections.find(sec=>Number.isFinite(sec.startMs)&&Number.isFinite(sec.durationMs)&&
   sec.durationMs>0&&sec.startMs<=progressMs&&progressMs<sec.startMs+sec.durationMs);
 if(!current||!['verse','hook','build','drop','break'].includes(String(current.label??''))||
  current.confidence<.7||!Number.isFinite(current.confidence)||
  progressMs+advance>=Math.min(analysis.durationMs,current.startMs+current.durationMs))return progressMs;
 return progressMs+advance;
}
/** Pure preview; labels/indices are not permission to control LAN fixtures. */
export function previewGoveeCalibrationV927(ips:readonly string[],value:GoveeRoomCalibrationV927,
 progressMs=5000){
 const s={...normalizeGoveeCalibrationV927(value),enabled:true};
 return ips.slice(0,32).filter(privateIp).map((ip,index)=>({ip,index,
  visibleDelayMs:s.fixtures[ip]?.visualDelayMs??0,
  appliedAdvanceMs:goveeVisualAdvanceV927(ip,ips,s),
  currentMs:progressMs,compensatedMs:compensatedGoveeWaveTimeV927(progressMs,ip,ips,s),
  statusRoundtripMs:s.fixtures[ip]?.statusRoundtripMs??null}));
}
