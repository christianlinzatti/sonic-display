/** Server-only verification. Separate secret from the signed AWS Lambda bridge.
 * The receiver token authorizes only Govee power claims, never Spotify commands.
 */
import {timingSafeEqual} from 'node:crypto';
import {spotifyCallbackUrl} from './spotify-origin';
export function authorizedAlexaGoveeReceiverV1139(request:Request):boolean{
 const token=process.env.ALEXA_GOVEE_RECEIVER_TOKEN||'';
 const supplied=request.headers.get('x-sonic-govee-receiver-token')||'';
 const site=request.headers.get('sec-fetch-site');
 if(token.length<32||token.length>256||token===process.env.ALEXA_BRIDGE_SECRET||
  !/^[a-zA-Z0-9_-]{32,256}$/.test(token)||supplied.length!==token.length||
  site==='cross-site')return false;
 const origin=request.headers.get('origin');
 if(request.method!=='GET'&&origin!==spotifyCallbackUrl().origin)return false;
 if(origin&&origin!==spotifyCallbackUrl().origin)return false;
 return timingSafeEqual(Buffer.from(supplied),Buffer.from(token));
}
