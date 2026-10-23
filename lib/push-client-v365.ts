/** Public browser-only helpers: no server secrets. */
export type PushGenreV365='deutschrap'|'hardstyle'|'hardtekk';
export const PUSH_GENRES_V365:PushGenreV365[]=['deutschrap','hardstyle','hardtekk'];
export function decodeVapidPublicKey(publicKey:string):Uint8Array<ArrayBuffer>{
 if(!/^[A-Za-z0-9_-]{70,100}$/.test(publicKey))throw new Error('Ungültiger öffentlicher VAPID-Schlüssel.');
 const padding='='.repeat((4-publicKey.length%4)%4);
 const raw=atob((publicKey+padding).replace(/-/g,'+').replace(/_/g,'/'));
 const key=new Uint8Array(new ArrayBuffer(raw.length));for(let i=0;i<raw.length;i++)key[i]=raw.charCodeAt(i);
 if(key.length!==65)throw new Error('Ungültige VAPID-Key-Länge.');return key;
}
