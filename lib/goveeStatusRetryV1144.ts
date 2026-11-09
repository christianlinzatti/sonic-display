/** V1144: bounded, observation-only retry for Govee LAN status.
 * NEVER retry /command or /devices/add; UDP sends cannot confirm hardware changes.
 */
import {goveeBridgeRequestV909,loadGoveeConfigV909,type GoveeConfigV909,type GoveeDeviceV909} from './goveeLanV909';
import {readGoveeStatusV1140,classifyGoveeStatusV1140,type GoveeConfirmedStatusV1140} from './goveeLiveStatusV1140';

export const GOVEE_STATUS_MAX_ATTEMPTS_V1144=2;
export type GoveeStatusRetryResultV1144={
 status:GoveeConfirmedStatusV1140;
 attempts:number;
 warning:string;
};
export function retryableGoveeStatusErrorV1144(error:unknown):boolean{
 if(!(error instanceof Error))return false;
 const message=error.message;
 return message.includes('(Timeout)')||/^HTTP (502|503|504)$/.test(message);
}
export function sameGoveeStatusConfigV1144(initial:GoveeConfigV909,current:GoveeConfigV909,ip:string):boolean{
 return initial.enabled===current.enabled&&initial.token===current.token&&initial.endpoint===current.endpoint&&
  initial.selectedIps.includes(ip)&&JSON.stringify(initial.selectedIps)===JSON.stringify(current.selectedIps);
}
export async function readGoveeStatusWithRetryV1144(config:GoveeConfigV909,ip:string,options:{
 signal?:AbortSignal;
 readFirst?:(config:GoveeConfigV909,ip:string)=>Promise<GoveeConfirmedStatusV1140>;
 readAgain?:(config:GoveeConfigV909,ip:string)=>Promise<GoveeConfirmedStatusV1140>;
 currentConfig?:()=>GoveeConfigV909;
}={}):Promise<GoveeStatusRetryResultV1144>{
 if(!config.enabled||!config.token.trim()||!config.selectedIps.includes(ip))
  throw Error('Govee-Gerät nicht ausgewählt oder Bridge nicht freigegeben.');
 const check=()=>{
  if(options.signal?.aborted)throw Error('Govee-Statusabfrage abgebrochen.');
  const fresh=options.currentConfig?.()??loadGoveeConfigV909();
  if(!sameGoveeStatusConfigV1144(config,fresh,ip))throw Error('Govee-Konfiguration während der Statusabfrage geändert.');
 };
 const readFirst=options.readFirst??readGoveeStatusV1140;
 const readAgain=options.readAgain??(async(cfg:GoveeConfigV909,target:string)=>{
  const response=await goveeBridgeRequestV909<{device:GoveeDeviceV909;fresh?:boolean}>(cfg,'/status','POST',{ip:target});
  return classifyGoveeStatusV1140(target,response);
 });
 check();
 let first:GoveeConfirmedStatusV1140|undefined,error:unknown;
 try{first=await readFirst(config,ip);}catch(e){error=e;if(!retryableGoveeStatusErrorV1144(e))throw e;}
 if(first?.confirmed){check();return {status:first,attempts:1,warning:''};}
 check();
 // One additional observation request only. No extra power, brightness, look or scan.
 try{
  const again=await readAgain(config,ip);
  check();
  return {status:again.confirmed?again:(first??again),attempts:2,
   warning:again.confirmed?'':'Keine aktuelle Govee-Geräteantwort nach zwei Statusabfragen.'};
 }catch(e){
  check();
  if(first)return {status:first,attempts:2,warning:'Wiederholte Statusabfrage fehlgeschlagen; Gerät nicht bestätigt.'};
  throw error??e;
 }
}
