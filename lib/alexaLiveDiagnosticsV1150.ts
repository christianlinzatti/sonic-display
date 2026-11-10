/** V1150 · privacy-safe live diagnostic view model.
 * Pure computations only; never sends requests, changes a Govee state or reads secrets.
 * "Last seen online" is NOT an acknowledged physical on/off state.
 */
import type {DiagnosticV1149} from './alexaConnectionDiagnosticsV1149';

export const ALEXA_LIVE_INTERVAL_MS_V1150=60000;
export const ALEXA_LIVE_MAX_FIXTURES_V1150=4;
export const GOVEE_LIVE_MAX_AGE_MS_V1150=90000;
export type FixtureStateV1150='not-selected'|'unknown'|'seen-online'|'not-seen';
export type FixtureV1150={slot:number;state:FixtureStateV1150;label:string;description:string};
export type LiveSummaryV1150={ready:number;issues:number;unknown:number;description:string};

const asRecord=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};
export function deriveGoveeFixturesV1150(
 selectedIps:readonly string[],
 devices:unknown,
 observedAt:number
):FixtureV1150[]{
 const list=Array.isArray(devices)?devices:null;
 const byIp=new Map<string,Record<string,unknown>>();
 if(list)for(const raw of list){
  const device=asRecord(raw);
  if(typeof device.ip==='string'&&!byIp.has(device.ip))byIp.set(device.ip,device);
 }
 const slots:FixtureV1150[]=[];
 for(let i=0;i<ALEXA_LIVE_MAX_FIXTURES_V1150;i++){
  const slot=i+1,ip=selectedIps[i];
  if(!ip){slots.push({slot,state:'not-selected',label:`Govee ${slot}`,
   description:'Noch keine Leuchte für diesen Platz ausgewählt.'});continue;}
  const device=list?byIp.get(ip):null;
  if(!list){slots.push({slot,state:'unknown',label:`Govee ${slot}`,
   description:'Noch keine frische Bridge-Geräteliste vorliegend.'});continue;}
  const lastSeen=device?.lastSeen;
  const ageSafe=typeof lastSeen!=='number'||(
   Number.isFinite(lastSeen)&&lastSeen>0&&lastSeen<=observedAt&&observedAt-lastSeen<=GOVEE_LIVE_MAX_AGE_MS_V1150
  );
  const online=device?.online===true&&ageSafe;
  slots.push({slot,state:online?'seen-online':'not-seen',label:`Govee ${slot}`,
   description:online?'Von der Bridge kürzlich gesehen; Ein/Aus-Zustand nicht bestätigt.':
   'Nicht zuletzt erreichbar oder nicht in der Bridge registriert.'});
 }
 return slots;
}
export function summarizeLiveDiagnosticsV1150(
 spotify:DiagnosticV1149,relay:DiagnosticV1149,bridge:DiagnosticV1149,fixtures:readonly FixtureV1150[]
):LiveSummaryV1150{
 const states=[spotify.state,relay.state,bridge.state,...fixtures.filter(f=>f.state!=='not-selected').map(
  f=>f.state==='seen-online'?'ok':f.state==='not-seen'?'attention':'unknown')];
 const ready=states.filter(x=>x==='ok').length,
  issues=states.filter(x=>x==='attention'||x==='error').length,
  unknown=states.filter(x=>x==='unknown').length;
 return {ready,issues,unknown,description:`${ready} Teilprüfungen bestätigt · ${issues} Hinweise/Probleme · ${unknown} nicht bestätigt. Alexa-Skill und physische Lampenreaktionen bleiben ungetestet.`};
}
