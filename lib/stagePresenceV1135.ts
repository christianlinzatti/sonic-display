import type {ConcertScoreV1134} from './concertScoreV1134';
export const STAGE_FLOOR_V1135=-1.95;
export const SONIC_SOLE_V1135=-1;
/** Bundled rigs have a verified sole at -1. Imported/authored placements keep their origin. */
export function stagePlacementV1135(input:{bundled:boolean;adaptive:boolean;manual:boolean;scale:number;offsetY:number}){
 const enabled=input.bundled&&input.adaptive&&!input.manual&&Number.isFinite(input.scale)&&input.scale>=.1&&input.scale<=4&&Math.abs(input.offsetY)<.001;
 return {enabled,y:enabled?STAGE_FLOOR_V1135-SONIC_SOLE_V1135*input.scale:0,floor:SONIC_SOLE_V1135*input.scale};
}
/** Contact darkens as the sole approaches the floor; lifted feet soften and spread. */
export function footContactV1135(ankleY:number,floorY:number,scale:number){
 if(!Number.isFinite(ankleY)||!Number.isFinite(floorY)||!Number.isFinite(scale)||scale<=0)return {opacity:0,width:0};
 const height=Math.max(0,(ankleY-floorY)/scale-.12),contact=Math.max(0,1-height/.24);
 return {opacity:.32*contact*contact,width:(.32+Math.min(.35,height)*.65)*scale};
}
export function portraitContrastV1135(cue:ConcertScoreV1134|null,guard:{playing:boolean;reducedMotion:boolean;manual:boolean;blackout:boolean}){
 if(!cue||!guard.playing||guard.reducedMotion||guard.manual||guard.blackout)return {key:1,fill:1};
 if(cue.reading)return {key:1,fill:1};
 if(cue.staging==='anticipation')return {key:.96,fill:.88};
 if(cue.interaction==='solo'||cue.interaction==='duel')return {key:1.08,fill:.88};
 if(cue.staging==='chorus'||cue.staging==='finale')return {key:1.10,fill:.92};
 return {key:1,fill:1};
}
