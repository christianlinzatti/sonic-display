import {clampStyle,DEFAULT_STYLE,type MotionStyle} from "./motionStyleTransfer";
export const STYLE_EVENT="sonic:motion-style-v203";
const KEY="sonic.motion.style.v203.";
export function readMotionStyle(id:string):MotionStyle{if(!id||typeof window==="undefined")return DEFAULT_STYLE;try{return clampStyle(JSON.parse(localStorage.getItem(KEY+id)||"null"));}catch{return DEFAULT_STYLE;}}
export function writeMotionStyle(id:string,style:MotionStyle):void{if(!id||typeof window==="undefined")return;try{localStorage.setItem(KEY+id,JSON.stringify(clampStyle(style)));window.dispatchEvent(new CustomEvent(STYLE_EVENT,{detail:id}));}catch{}}
