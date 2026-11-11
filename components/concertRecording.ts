let recorder:MediaRecorder|null=null,stream:MediaStream|null=null,url:string|null=null,timer:ReturnType<typeof setTimeout>|null=null;
export function recordingState(){return {running:recorder?.state==='recording',url};}
const changed=()=>window.dispatchEvent(new Event('sonic:recording'));
export async function startConcertRecording(){
 if(recorder?.state==='recording')return;
 if(!navigator.mediaDevices?.getDisplayMedia||typeof MediaRecorder==='undefined')throw Error('Videoaufnahme wird hier nicht unterstützt.');
 const captured=await navigator.mediaDevices.getDisplayMedia({video:true,audio:false});
 try{
  const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(m=>MediaRecorder.isTypeSupported(m));
  if(!mime)throw Error('WebM-Aufnahme wird hier nicht unterstützt.');
  const next=new MediaRecorder(captured,{mimeType:mime,videoBitsPerSecond:4000000});const chunks:Blob[]=[];let bytes=0;
  if(url){URL.revokeObjectURL(url);url=null;}stream=captured;recorder=next;
  next.ondataavailable=e=>{if(e.data.size){chunks.push(e.data);bytes+=e.data.size;if(bytes>200000000&&next.state==='recording')next.stop();}};
  next.onstop=()=>{if(timer)clearTimeout(timer);timer=null;captured.getTracks().forEach(t=>t.stop());url=URL.createObjectURL(new Blob(chunks,{type:mime}));recorder=null;stream=null;changed();};
  captured.getVideoTracks()[0].onended=()=>{if(next.state==='recording')next.stop();};
  next.start(1000);timer=setTimeout(()=>{if(next.state==='recording')next.stop();},600000);changed();
 }catch(error){captured.getTracks().forEach(t=>t.stop());throw error;}
}
export function stopConcertRecording(){if(recorder?.state==='recording')recorder.stop();else stream?.getTracks().forEach(t=>t.stop());}
