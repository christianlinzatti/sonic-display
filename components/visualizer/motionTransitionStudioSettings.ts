export type MotionTransitionSettings = { version:1; avatarId:string; fromId:string; toId:string; duration:number; beatSync:boolean; bpm:number; beatsPerBar:number; beatOffset:number };
export const MOTION_TRANSITION_SETTINGS_KEY = 'sonic.motion.transition.studio.v192';
export const MOTION_TRANSITION_CHANGE_EVENT = 'sonic:motion-transition-settings-changed';
export function sanitizeMotionTransitionSettings(raw:unknown, avatarId:string):MotionTransitionSettings {
 const o = raw && typeof raw==='object' ? raw as Record<string,unknown> : {};
 const clamp=(value:unknown,lo:number,hi:number,fallback:number)=>typeof value==='number'&&Number.isFinite(value)?Math.min(hi,Math.max(lo,value)):fallback;
 return {version:1,avatarId:avatarId.slice(0,160),fromId:typeof o.fromId==='string'?o.fromId.slice(0,100):'',toId:typeof o.toId==='string'?o.toId.slice(0,100):'',duration:clamp(o.duration,0.1,4,0.6),beatSync:o.beatSync===true,bpm:clamp(o.bpm,60,240,160),beatsPerBar:clamp(o.beatsPerBar,1,16,4),beatOffset:clamp(o.beatOffset,0,1,0)};
}
export function readMotionTransitionSettings(avatarId:string):MotionTransitionSettings {
 if(typeof window==='undefined')return sanitizeMotionTransitionSettings(null,avatarId);
 try {const data=JSON.parse(localStorage.getItem(MOTION_TRANSITION_SETTINGS_KEY)||'{}');return sanitizeMotionTransitionSettings(data?.[avatarId],avatarId);}catch{return sanitizeMotionTransitionSettings(null,avatarId);}
}
export function saveMotionTransitionSettings(value:MotionTransitionSettings):MotionTransitionSettings {
 const safe=sanitizeMotionTransitionSettings(value,value.avatarId);
 if(typeof window==='undefined')return safe;
 let current:Record<string,unknown>={};try{const raw=JSON.parse(localStorage.getItem(MOTION_TRANSITION_SETTINGS_KEY)||'{}');if(raw&&typeof raw==='object'&&!Array.isArray(raw))current=raw;}catch{}
 current[safe.avatarId]=safe;
 const keys=Object.keys(current);if(keys.length>100){delete current[keys.find(k=>k!==safe.avatarId)!];}
 try{localStorage.setItem(MOTION_TRANSITION_SETTINGS_KEY,JSON.stringify(current));window.dispatchEvent(new Event(MOTION_TRANSITION_CHANGE_EVENT));}catch{}
 return safe;
}
export function nextBeatBoundary(nowSeconds:number,bpm:number,beatsPerBar:number,offset:number):number {
 const interval=60/Math.max(1,bpm)*Math.max(1,beatsPerBar);
 const origin=offset*interval;
 return origin+Math.ceil(Math.max(0,nowSeconds-origin+1e-7)/interval)*interval;
}
