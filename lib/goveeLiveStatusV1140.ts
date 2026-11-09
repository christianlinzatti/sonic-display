/** V1140 – distinguish a fresh LAN status reply from an earlier cached or inferred state. */
import {goveeBridgeRequestV909,type GoveeConfigV909,type GoveeDeviceV909} from './goveeLanV909';
export type GoveeConfirmedStatusV1140={ip:string;name:string;online:boolean;confirmed:boolean;on:boolean|null;brightness:number|null};
export function classifyGoveeStatusV1140(ip:string,response:{device:GoveeDeviceV909;fresh?:boolean}):GoveeConfirmedStatusV1140{
 const dev=response.device;
 const online=dev?.online===true;
 const confirmed=response.fresh===true&&online&&typeof dev?.status?.on==='boolean';
 return {ip,name:typeof dev?.name==='string'&&dev.name.trim()?dev.name.trim().slice(0,80):ip,
  online,confirmed,on:confirmed?dev.status!.on:null,
  brightness:confirmed&&typeof dev?.status?.brightness==='number'?dev.status.brightness:null};
}
export async function readGoveeStatusV1140(config:GoveeConfigV909,ip:string):Promise<GoveeConfirmedStatusV1140>{
 if(!config.selectedIps.includes(ip)||!config.enabled||!config.token.trim())
  throw Error('Govee-Gerät nicht ausgewählt oder Bridge nicht freigegeben.');
 await goveeBridgeRequestV909(config,'/devices/add','POST',{ip});
 const response=await goveeBridgeRequestV909<{device:GoveeDeviceV909;fresh?:boolean}>(config,'/status','POST',{ip});
 return classifyGoveeStatusV1140(ip,response);
}
