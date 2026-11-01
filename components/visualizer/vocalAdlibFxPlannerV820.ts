/** V820 – explicit vocal direction only. No speech recognition or inferred singer identities.
 * All visual cues inherit the verified musical act and manual override protections of V810. */
/** Minimal structural synced-lyrics view; production Lyrics implements this shape.
 * Avoid coupling a pure planner to UI/music types with GPU dependencies. */
export type VocalLyricsV820={synced:boolean;lines:readonly {
 startMs:number;endMs:number|null;text:string;words?:readonly {text:string;startMs:number;endMs:number|null}[]
}[]};
import type {VocalTimeSegmentV496} from './vocalTimeDirectorV496';
import {normalizeVocalTimeSegmentsV496} from './vocalTimeDirectorV496';
import {normalizeConcertFxV810} from './concertFxStudioV810';
import type {ConcertFxCueV810,ConcertFxSettingsV810} from './concertFxStudioV810';
export type VocalFxRoleV820='lead'|'feature'|'adlib'|'off';
export interface VocalAdlibFxCueV820{
 active:boolean;role:VocalFxRoleV820;leadSlot:number;adlibSlot:number|null;
 leadOpacity:number;adlibOpacity:number;adlibWord:string;
 primary:string;secondary:string;phase:number;reason:'music'|'off'|'unverified'|'guarded';
}
export const VOCAL_FX_OFF_V820:Readonly<VocalAdlibFxCueV820>=Object.freeze({
 active:false,role:'off',leadSlot:-1,adlibSlot:null,leadOpacity:0,adlibOpacity:0,
 adlibWord:'',primary:'#40e5ff',secondary:'#ef4ad8',phase:0,reason:'off'
});
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,min=0,max=1)=>Math.min(max,Math.max(min,n));
const round=(n:number)=>Math.round(n*100000)/100000;
const safeText=(s:string)=>s.normalize('NFKC').replace(/[\u0000-\u001f\u007f<>]/g,'').trim().slice(0,24);
export interface VocalAdlibFxInputV820{
 fx:ConcertFxCueV810;settings?:Partial<ConcertFxSettingsV810>|null;
 trackId:string;vocalTrackId:string;segments:readonly VocalTimeSegmentV496[]|null|undefined;
 vocalEnabled:boolean;progressMs:number;playing:boolean;reducedMotion:boolean;
 groupCount:number;tier:'low'|'balanced'|'high';budget:number;
 lyricsProtected:boolean;vocalFocus:boolean;manualCamera:boolean;manualLighting:boolean;
 lyrics?:VocalLyricsV820|null;lyricsVisible:boolean;
}
/** A timed adlib marker PLUS a real timed word are needed for text. No fallback to plain lyrics. */
function explicitAdlibWord(i:VocalAdlibFxInputV820,slot:number,adlib:VocalTimeSegmentV496):string{
 if(!i.lyricsVisible||!i.lyrics?.synced)return '';
 const now=i.progressMs,lines=i.lyrics.lines;
 let low=0,high=lines.length-1,index=-1;
 while(low<=high){const mid=(low+high)>>>1,ms=lines[mid]?.startMs;
  if(!finite(ms))return '';
  if(ms<=now){index=mid;low=mid+1;}else high=mid-1;
 }
 if(index<0)return '';
 const line=lines[index],next=lines[index+1]?.startMs;
 const lineEnd=Math.min(finite(line.endMs)?line.endMs:Infinity,finite(next)?next:Infinity);
 if(!finite(lineEnd)||now>=lineEnd||!new RegExp(`^\\s*\\[vocal:adlib:${slot+1}\\](?:\\s|$)`,'i').test(line.text))return '';
 // A timestamped, explicitly marked word must be INSIDE the authored adlib interval.
 const word=line.words?.find(w=>finite(w.startMs)&&finite(w.endMs)&&w.startMs<=now&&now<w.endMs&&
   w.endMs>w.startMs&&w.startMs>=adlib.startMs&&w.endMs<=adlib.endMs&&w.endMs<=lineEnd);
 if(!word)return '';
 const value=safeText(word.text).replace(/^\[vocal:[^\]]+\]/i,'').trim();
 return value&&!value.startsWith('[')?value.toLocaleUpperCase():'';
}
export function planVocalAdlibFxV820(i:VocalAdlibFxInputV820):VocalAdlibFxCueV820{
 const s=normalizeConcertFxV810(i.settings),fx=i.fx;
 const off=(reason:VocalAdlibFxCueV820['reason']):VocalAdlibFxCueV820=>({...VOCAL_FX_OFF_V820,reason});
 if(!s.enabled||!s.vocalFx||s.vocalFxIntensity<=0||s.intensity<=0||!i.playing||i.reducedMotion)return off('off');
 if(!fx?.active||fx.reason!=='music'||!i.vocalEnabled||!i.trackId||i.trackId!==i.vocalTrackId||
  !finite(i.progressMs)||i.progressMs<0||!i.segments?.length)return off('unverified');
 if(i.manualCamera||i.manualLighting||i.tier==='low'||!Number.isInteger(i.groupCount)||
  i.groupCount<1||i.groupCount>4||!finite(i.budget)||!finite(fx.phase))return off('guarded');
 const segments=normalizeVocalTimeSegmentsV496(i.segments);
 let base:VocalTimeSegmentV496|undefined,adlib:VocalTimeSegmentV496|undefined;
 for(const seg of segments){
  if(i.progressMs<seg.startMs||i.progressMs>=seg.endMs||seg.leadSlot>=i.groupCount||
    (seg.style==='duet'&&seg.partnerSlot>=i.groupCount)||
    (seg.singerSlotsV547??[]).some(slot=>slot>=i.groupCount))continue;
  if(seg.roleV547==='adlib')adlib=seg;else base=seg;
 }
 if(!base&&!adlib)return off('unverified');
 const role:VocalFxRoleV820=base?(base.roleV547==='feature'?'feature':'lead'):'adlib';
 const activeBase=!!base&&((role==='lead'&&s.vocalLeadAura)||(role==='feature'&&s.vocalFeatureAura));
 const activeAdlib=!!adlib&&s.vocalAdlibs;
 if(!activeBase&&!activeAdlib)return off('off');
 const envelope=(item:VocalTimeSegmentV496)=>clamp((i.progressMs-item.startMs)/240)*clamp((item.endMs-i.progressMs)/260);
 const quality=s.quality==='performance'?.35:s.quality==='balanced'?.67:1;
 const device=i.tier==='balanced'?.6:1;
 const lyricsGain=i.lyricsProtected?.44:1,faceGain=i.vocalFocus?.70:1;
 const castGain=i.groupCount>=4?.55:i.groupCount===3?.75:1;
 const genreGain=fx.genre==='rap'?.72:fx.genre==='hardtekk'||fx.genre==='hardstyle'?1:.8;
 const gain=s.intensity/100*s.vocalFxIntensity/100*quality*device*clamp(i.budget)*lyricsGain*faceGain*castGain*genreGain;
 const leadOpacity=activeBase&&base?clamp(round(gain*envelope(base)*(base.strength/100)*.32),0,.18):0;
 const adlibOpacity=activeAdlib&&adlib?clamp(round(gain*envelope(adlib)*(adlib.strength/100)*.42),0,.22):0;
 if(leadOpacity<=.0005&&adlibOpacity<=.0005)return off('guarded');
 const adlibWord=adlibOpacity>.005&&s.vocalAdlibWords&&adlib?
  explicitAdlibWord(i,adlib.leadSlot,adlib):'';
 return {active:true,role,leadSlot:base?.leadSlot??adlib?.leadSlot??-1,
   adlibSlot:activeAdlib&&adlib?adlib.leadSlot:null,leadOpacity,adlibOpacity,adlibWord,
   primary:fx.primary,secondary:fx.secondary,phase:round(fx.phase),reason:'music'};
}
