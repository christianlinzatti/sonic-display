/** V340: deterministic image ranking – no face recognition or external tracking. */
export type ImageSelectionModeV340 = 'balanced'|'quality'|'variety';
export interface ImageSelectionSettingsV340 {enabled:boolean;mode:ImageSelectionModeV340;minWidth:number;minHeight:number;aspectWeight:number;preferDistinct:boolean;}
export interface ImageCandidateV340 {url:string;width?:number;height?:number;quality?:number;}
export const IMAGE_SELECTION_KEY_V340='sonic-image-selection-v340';
export const IMAGE_SELECTION_EVENT_V340='sonic:image-selection-v340';
export const DEFAULT_IMAGE_SELECTION_V340:ImageSelectionSettingsV340={enabled:true,mode:'balanced',minWidth:360,minHeight:240,aspectWeight:65,preferDistinct:true};
export function sanitizeImageSelectionV340(value:unknown):ImageSelectionSettingsV340 {
 const v=value&&typeof value==='object'?value as Partial<ImageSelectionSettingsV340>:{};
 const bounded=(n:unknown,d:number,min:number,max:number)=>typeof n==='number'&&Number.isFinite(n)?Math.max(min,Math.min(max,Math.round(n))):d;
 return {enabled:v.enabled!==false,mode:v.mode==='quality'||v.mode==='variety'?v.mode:'balanced',minWidth:bounded(v.minWidth,360,0,1600),minHeight:bounded(v.minHeight,240,0,1000),aspectWeight:bounded(v.aspectWeight,65,0,100),preferDistinct:v.preferDistinct!==false};
}
export function readImageSelectionV340():ImageSelectionSettingsV340 {
 if(typeof window==='undefined')return {...DEFAULT_IMAGE_SELECTION_V340};
 try{return sanitizeImageSelectionV340(JSON.parse(localStorage.getItem(IMAGE_SELECTION_KEY_V340)||'null'));}catch{return {...DEFAULT_IMAGE_SELECTION_V340};}
}
export function saveImageSelectionV340(value:ImageSelectionSettingsV340):ImageSelectionSettingsV340 {
 const clean=sanitizeImageSelectionV340(value);
 if(typeof window!=='undefined'){try{localStorage.setItem(IMAGE_SELECTION_KEY_V340,JSON.stringify(clean));}catch{}window.dispatchEvent(new Event(IMAGE_SELECTION_EVENT_V340));}
 return clean;
}
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
/** Provider URLs often differ only by resizing parameters; use their canonical path for duplicate detection. */
export function imageIdentityV340(raw:string):string {
 try {const url=new URL(raw);let p=decodeURIComponent(url.pathname).toLowerCase();
 p=p.replace(/\/\d{2,5}x\d{2,5}\//g,'/').replace(/\b(width|height|resize|w|h)[=_-]\d{2,5}/g,'');
 return url.hostname.toLowerCase()+p.replace(/__+/g,'_');}catch{return raw.split('?')[0].toLowerCase();}
}
export function imageScoreV340(candidate:ImageCandidateV340,targetRatio:number,settings:ImageSelectionSettingsV340):number {
 const w=candidate.width||0,h=candidate.height||0;
 // Unknown dimensions are not treated as poor quality: remote metadata may be absent.
 const resolution=w&&h?clamp(Math.sqrt(w*h)/1100):.48;
 const minSize=w&&h?(w<settings.minWidth||h<settings.minHeight?-.45:0):0;
 const aspect=w&&h?Math.exp(-1.9*Math.abs(Math.log((w/h)/Math.max(.25,targetRatio)))):.55;
 const quality=typeof candidate.quality==='number'?clamp(candidate.quality):resolution;
 const weight=(settings.mode==='quality'? .4 :settings.mode==='variety'?.2:settings.aspectWeight/100);
 return weight*aspect+(1-weight)*(.7*resolution+.3*quality)+minSize;
}
/** Greedy diversity reranking avoids consecutive nearly identical crops, preserving all usable images. */
export function rankImagesV340(images:ImageCandidateV340[],targetRatio:number,settings:ImageSelectionSettingsV340):ImageCandidateV340[] {
 if(!settings.enabled)return images.slice();
 const seen=new Set<string>();const candidates=images.filter(img=>{if(!img.url)return false;const k=imageIdentityV340(img.url);if(seen.has(k))return false;seen.add(k);return true;});
 const chosen:ImageCandidateV340[]=[];
 while(candidates.length){let best=0,bestScore=-Infinity;
 for(let i=0;i<candidates.length;i++){
 const c=candidates[i];let score=imageScoreV340(c,targetRatio,settings);
 if(settings.preferDistinct&&chosen.length){const prev=chosen[chosen.length-1];const a=(c.url.split('/').pop()||'').replace(/\d+/g,'');const b=(prev.url.split('/').pop()||'').replace(/\d+/g,'');if(a&&b&&a===b)score-=.28;}
 if(score>bestScore){bestScore=score;best=i;}
 }chosen.push(candidates.splice(best,1)[0]);
 }
 return chosen;
}
