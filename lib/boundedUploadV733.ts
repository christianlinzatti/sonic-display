export class UploadLimitErrorV733 extends Error {}
/** Bound bytes while consuming the stream, including chunked requests without Content-Length. */
export async function boundedFormDataV733(req:Request,limit:number):Promise<FormData>{
 if(Number(req.headers.get('content-length'))>limit)throw new UploadLimitErrorV733('Datei zu groß.');
 if(!req.body)return new FormData();
 const reader=req.body.getReader();const chunks:Uint8Array<ArrayBuffer>[]=[];let size=0;
 try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw new UploadLimitErrorV733('Datei zu groß.');}chunks.push(new Uint8Array(value));}}
 finally{reader.releaseLock();}
 return new Response(new Blob(chunks),{headers:{'content-type':req.headers.get('content-type')??''}}).formData();
}
export function localHostV733(value:string|null):boolean{try{const u=new URL(`http://${value}`);return !u.username&&!u.password&&['localhost','127.0.0.1','[::1]'].includes(u.hostname);}catch{return false;}}
