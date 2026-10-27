/** V592: read-only quality envelope for the *real* VisualizerStage. Never sets show state. */
export interface V592Bounds {minX:number;maxX:number;minY:number;maxY:number}
export interface V592Actor {bounds:V592Bounds|null;meshes:number}
export interface V592CanvasSnapshot {sampledAt:number;webglVersion:string;actors:V592Actor[];drawCalls:number;triangles:number;camera:{x:number;y:number;z:number};contextLost:boolean}
export type V592Status='ready'|'no-track'|'paused'|'no-canvas'|'no-glb'|'no-lyrics'|'context-lost';
export function v592LoopbackAllowed(location:{hostname:string;search:string;protocol:string}):boolean{
 return (location.hostname==='localhost'||location.hostname==='127.0.0.1'||location.hostname==='::1')&&
  (location.protocol==='http:'||location.protocol==='https:')&&
  new URLSearchParams(location.search).get('benchmarkV592')==='1';
}
export function v592BoundsWarning(bounds:V592Bounds|null):string[]{
 if(!bounds||![bounds.minX,bounds.maxX,bounds.minY,bounds.maxY].every(Number.isFinite)||
  bounds.maxX<=bounds.minX||bounds.maxY<=bounds.minY)return ['Avatar-Projektion fehlt'];
 const notices:string[]=[];
 if(bounds.minX<-.97||bounds.maxX>.97||bounds.minY<-.97||bounds.maxY>.97)notices.push('Avatar möglicherweise angeschnitten');
 if(bounds.maxX-bounds.minX<.12||bounds.maxY-bounds.minY<.24)notices.push('Avatar möglicherweise zu klein');
 return notices;
}
export function v592Status(input:{trackId:string;playing:boolean;canvas:boolean;lyrics:boolean;glbActors:number;contextLost:boolean}):V592Status{
 if(!input.trackId)return 'no-track';
 if(!input.playing)return 'paused';
 if(!input.canvas)return 'no-canvas';
 if(input.contextLost)return 'context-lost';
 if(input.glbActors<1)return 'no-glb';
 if(!input.lyrics)return 'no-lyrics';
 return 'ready';
}
export function v592AdvanceIsReal(samples:{trackId:string;progressMs:number;timestamp:number}[]):boolean{
 if(samples.length<2)return false;
 const first=samples[0],last=samples[samples.length-1];
 return Boolean(first.trackId&&last.trackId===first.trackId&&last.timestamp-first.timestamp>=2000&&last.progressMs-first.progressMs>=1300);
}
