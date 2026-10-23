/** V341 – music-driven gallery scheduling; deterministic, no extra audio capture. */
export type GallerySectionV341 = 'verse'|'hook'|'build'|'drop'|'break'|'intro'|'outro'|'unknown';
export interface MusicGallerySettingsV341 { enabled:boolean; intensity:number; beatSync:boolean; beatThreshold:number; minGapSeconds:number; transition:'fade'|'slide'|'zoom'; }
export const MUSIC_GALLERY_EVENT_V341='sonic:music-gallery-v341';
export const MUSIC_GALLERY_KEY_V341='sonic-music-gallery-v341';
export const DEFAULT_MUSIC_GALLERY_V341:MusicGallerySettingsV341={enabled:false,intensity:65,beatSync:true,beatThreshold:.68,minGapSeconds:2.5,transition:'fade'};
const bound=(x:unknown,f:number,l:number,h:number)=>typeof x==='number'&&Number.isFinite(x)?Math.min(h,Math.max(l,x)):f;
export function sanitizeMusicGalleryV341(raw:unknown):MusicGallerySettingsV341{
 const v=raw&&typeof raw==='object'?raw as Partial<MusicGallerySettingsV341>:{};
 return {enabled:v.enabled===true,intensity:Math.round(bound(v.intensity,65,0,100)),beatSync:v.beatSync!==false,beatThreshold:bound(v.beatThreshold,.68,.1,1),minGapSeconds:bound(v.minGapSeconds,2.5,1,10),transition:v.transition==='slide'||v.transition==='zoom'?v.transition:'fade'};
}
export function readMusicGalleryV341():MusicGallerySettingsV341{
 if(typeof window==='undefined')return {...DEFAULT_MUSIC_GALLERY_V341};
 try{return sanitizeMusicGalleryV341(JSON.parse(localStorage.getItem(MUSIC_GALLERY_KEY_V341)||'null'));}catch{return {...DEFAULT_MUSIC_GALLERY_V341};}
}
export function saveMusicGalleryV341(raw:MusicGallerySettingsV341):MusicGallerySettingsV341{
 const value=sanitizeMusicGalleryV341(raw);
 if(typeof window!=='undefined'){try{localStorage.setItem(MUSIC_GALLERY_KEY_V341,JSON.stringify(value));}catch{}window.dispatchEvent(new Event(MUSIC_GALLERY_EVENT_V341));}
 return value;
}
export function normalizeGallerySectionV341(value:unknown):GallerySectionV341{
 const key=typeof value==='string'?value.toLowerCase().trim():'';
 if(key==='chorus')return 'hook';if(key==='buildup'||key==='build-up')return 'build';
 if(key==='verse'||key==='hook'||key==='build'||key==='drop'||key==='break'||key==='intro'||key==='outro')return key;
 return 'unknown';
}
/** Maintain relatively long reading time through quieter sections; increases at hooks/drops. */
export function musicGalleryIntervalV341(baseSeconds:number,section:unknown,settings:MusicGallerySettingsV341):number{
 const base=Math.max(3,Math.min(30,Number.isFinite(baseSeconds)?baseSeconds:7));
 if(!settings.enabled)return base;
 const multipliers:Record<GallerySectionV341,number>={intro:1.3,verse:1.55,hook:.85,build:1,drop:.58,break:1.8,outro:1.45,unknown:1};
 const strength=settings.intensity/100;
 return Math.max(settings.minGapSeconds,Math.min(45,Math.round(base*(1+(multipliers[normalizeGallerySectionV341(section)]-1)*strength)*10)/10));
}
/** Pure rising-edge gate; caller owns the last-trigger clock, prevents kick storms. */
export function shouldBeatAdvanceV341(beat:number,previousBeat:number,elapsedSeconds:number,section:unknown,settings:MusicGallerySettingsV341):boolean{
 if(!settings.enabled||!settings.beatSync||settings.intensity===0)return false;
 const s=normalizeGallerySectionV341(section);
 if(s!=='hook'&&s!=='drop'&&s!=='build')return false;
 return beat>=settings.beatThreshold&&previousBeat<settings.beatThreshold&&elapsedSeconds>=settings.minGapSeconds;
}
