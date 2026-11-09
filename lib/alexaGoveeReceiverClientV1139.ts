/** V1139: independent, opt-in browser credential for Govee-only Alexa receiver.
 * Never expose the AWS Lambda signing secret to browser clients.
 */
export const ALEXA_GOVEE_RECEIVER_TOKEN_KEY_V1139='sonic-display:alexa-govee-receiver-token-v1139';
export const ALEXA_GOVEE_RECEIVER_EVENT_V1139='sonic-display:alexa-govee-receiver-token-changed-v1139';
export function readAlexaGoveeReceiverTokenV1139():string{
 if(typeof window==='undefined')return '';
 try{const token=localStorage.getItem(ALEXA_GOVEE_RECEIVER_TOKEN_KEY_V1139)||'';
  return token.length>=32&&token.length<=256?token:'';}catch{return '';}
}
export function saveAlexaGoveeReceiverTokenV1139(value:string):void{
 const token=value.trim();
 if(token&&(!/^[a-zA-Z0-9_\-]{32,256}$/.test(token)))throw Error('Der Empfänger-Token muss 32–256 Zeichen aus Buchstaben, Zahlen, Bindestrich oder Unterstrich haben.');
 if(token)localStorage.setItem(ALEXA_GOVEE_RECEIVER_TOKEN_KEY_V1139,token);
 else localStorage.removeItem(ALEXA_GOVEE_RECEIVER_TOKEN_KEY_V1139);
 window.dispatchEvent(new Event(ALEXA_GOVEE_RECEIVER_EVENT_V1139));
}
export function alexaGoveeReceiverHeadersV1139():Record<string,string>{
 const token=readAlexaGoveeReceiverTokenV1139();
 return token?{'x-sonic-govee-receiver-token':token}:{};
}
