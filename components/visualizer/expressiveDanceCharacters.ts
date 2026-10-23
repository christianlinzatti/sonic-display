import type { AudioFeatures } from "../../types/audio";
export type ExpressivePersona = "auto" | "hard" | "fluid" | "playful" | "subtle";
export type ExpressiveSettings = { enabled:boolean; persona:ExpressivePersona; strength:number; headResponse:number; torsoResponse:number };
export type ExpressiveCue = { headNod:number; headTurn:number; headTilt:number; shoulderRoll:number; chestPulse:number; spineSway:number; expressionJaw:number; expressionBrow:number; expressionEyeNarrow:number };
export const DEFAULT_EXPRESSIVE_SETTINGS:ExpressiveSettings={enabled:false,persona:"auto",strength:0.55,headResponse:0.8,torsoResponse:0.65};
export function clampUnit(value:number):number {return Number.isFinite(value)?Math.max(0,Math.min(1,value)):0;}
export function chooseExpressivePersona(selected:ExpressivePersona, genre?:string|null):Exclude<ExpressivePersona,"auto"> {
 if(selected!=="auto")return selected;
 const text=(genre??"").toLowerCase();
 if(/hardtekk|hardstyle|hardcore|gabber|uptempo/.test(text))return "hard";
 if(/techno|trance|ambient|house/.test(text))return "fluid";
 if(/pop|funk|disco|hip.hop/.test(text))return "playful";
 return "subtle";
}
export function computeExpressiveCue(input:{audio:Pick<AudioFeatures,"bpm"|"bass"|"mids"|"beatStrength"|"volume"> & Partial<AudioFeatures>;genre?:string|null;phase?:string;playing:boolean;reducedMotion:boolean;elapsed:number;settings:ExpressiveSettings}):ExpressiveCue {
 const empty:ExpressiveCue={headNod:0,headTurn:0,headTilt:0,shoulderRoll:0,chestPulse:0,spineSway:0,expressionJaw:0,expressionBrow:0,expressionEyeNarrow:0};
 if(!input.settings.enabled||!input.playing||input.reducedMotion)return empty;
 const p=chooseExpressivePersona(input.settings.persona,input.genre);
 const audio=input.audio, energy=clampUnit((audio.bass??0)*0.45+(audio.volume??0)*0.35+(audio.mids??0)*0.2);
 const beat=clampUnit(Math.max(audio.beatStrength??0,audio.kickAccentIntensity??0));
 const phrase=input.phase==="drop"?1.25:input.phase==="build"?1.1:input.phase==="break"?0.45:0.75;
 const head=clampUnit(input.settings.strength)*clampUnit(input.settings.headResponse)*phrase;
 const torso=clampUnit(input.settings.strength)*clampUnit(input.settings.torsoResponse)*phrase;
 const bpm=Math.max(55,Math.min(240,Number.isFinite(audio.bpm??0)?audio.bpm??120:120));
 const wave=Math.sin(input.elapsed*bpm*Math.PI/120);
 const sway=Math.sin(input.elapsed*bpm*Math.PI/240+0.4);
 const style=p==="hard"?1.2:p==="fluid"?0.75:p==="playful"?1:0.4;
 const smooth=p==="fluid"?1.1:0.55;
 return {
 headNod:Math.max(-0.11,Math.min(0.11,head*(beat*0.065+wave*0.026)*style)),
 headTurn:head*sway*0.065*smooth,
 headTilt:head*sway*0.035*smooth,
 shoulderRoll:torso*(beat*0.055+wave*0.018)*style,
 chestPulse:torso*(energy*0.032+beat*0.055)*style,
 spineSway:torso*sway*0.035*smooth,
 expressionJaw:head*(p==="hard"?beat*0.055:p==="playful"?beat*0.028:0),
 expressionBrow:head*(p==="hard"?energy*0.075:p==="playful"?energy*0.025:0),
 expressionEyeNarrow:head*(p==="hard"?-energy*0.06:0),
 };
}
