/** Bounds the whole operation (including body decoding), even if a provider ignores abort. */
export function withDeadlineV734<T>(operation:(signal:AbortSignal)=>Promise<T>,ms:number,parent?:AbortSignal,onLate?:(value:T)=>void):Promise<T>{
 return new Promise<T>((resolve,reject)=>{
  const controller=new AbortController();let done=false;
  const finish=(error:unknown,value?:T)=>{if(done)return;done=true;clearTimeout(timer);parent?.removeEventListener('abort',abort);if(error)reject(error);else resolve(value as T);};
  const cancel=(reason:unknown)=>{controller.abort(reason);finish(reason);};
  const abort=()=>cancel(parent?.reason??new Error('Request cancelled'));
  const timer=setTimeout(()=>cancel(new Error('Zeitlimit der Anfrage überschritten')),ms);
  if(parent?.aborted){abort();return;}
  parent?.addEventListener('abort',abort,{once:true});
  Promise.resolve().then(()=>{if(controller.signal.aborted)throw controller.signal.reason;return operation(controller.signal);}).then(value=>{if(done){onLate?.(value);return;}finish(null,value);},error=>finish(error||new Error('Request failed'))).catch(()=>{/* Late cleanup must not create an unhandled rejection. */});
 });
}
