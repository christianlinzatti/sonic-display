/** V913 – deterministic, offline whole-lamp color harmony for saved V912 show drafts.
 * No network, storage, audio sampling, RGBIC segments or power/strobe commands.
 */
import type {GoveeColorV909} from '@/lib/goveeLanV909';
import type {GoveePhaseV911,GoveeRoleV911} from '@/lib/goveeConcertDirectorV911';
import {GOVEE_PHASES_V912,replaceGoveeShowCueV912,type GoveeShowV912} from '@/lib/goveeLightShowV912';

export const GOVEE_HARMONY_SCHEMES_V913=['analogous','complementary','triadic','split','monochrome'] as const;
export type GoveeHarmonySchemeV913=typeof GOVEE_HARMONY_SCHEMES_V913[number];
export type GoveeHarmonyFixtureV913={ip:string;role:GoveeRoleV911};
export type GoveeHarmonyOptionsV913={base:GoveeColorV909;scheme:GoveeHarmonySchemeV913;strength:number;masterBrightness:number};
export type GoveeHarmonyLookV913={color:GoveeColorV909;brightness:number};
const finite=(n:number,def:number)=>Number.isFinite(n)?n:def;
const clip=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,finite(n,min)));
const hue=(h:number)=>((h%360)+360)%360;
const roleOffsets:Record<GoveeHarmonySchemeV913,Record<GoveeRoleV911,number>>={
 analogous:{wall:0,rhythm:30,neon:-32,ambient:58},
 complementary:{wall:0,rhythm:180,neon:160,ambient:25},
 triadic:{wall:0,rhythm:120,neon:240,ambient:32},
 split:{wall:0,rhythm:150,neon:210,ambient:28},
 monochrome:{wall:0,rhythm:0,neon:0,ambient:0},
};
const phases:Record<GoveePhaseV911,{level:number;saturation:number;lightness:number;offset:number}>={
 ambient:{level:.53,saturation:.78,lightness:.86,offset:0},
 verse:{level:.65,saturation:.90,lightness:.92,offset:0},
 hook:{level:.82,saturation:1.02,lightness:1.04,offset:7},
 build:{level:.73,saturation:1.0,lightness:.98,offset:-6},
 drop:{level:.94,saturation:1.10,lightness:1.12,offset:12},
 break:{level:.39,saturation:.61,lightness:.72,offset:0},
};
const roles:Record<GoveeRoleV911,{level:number;saturation:number;lightness:number}>={
 wall:{level:1,saturation:1,lightness:1},
 rhythm:{level:.92,saturation:1.10,lightness:1.02},
 neon:{level:.98,saturation:1.2,lightness:1.08},
 ambient:{level:.66,saturation:.72,lightness:.85},
};
function fromRgb(c:GoveeColorV909):{h:number;s:number;l:number}{
 const r=clip(c.r,0,255)/255,g=clip(c.g,0,255)/255,b=clip(c.b,0,255)/255;
 const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,l=(max+min)/2;
 if(d===0)return {h:0,s:0,l};
 const s=d/(1-Math.abs(2*l-1));
 const h=max===r?60*(((g-b)/d)%6):max===g?60*((b-r)/d+2):60*((r-g)/d+4);
 return {h:hue(h),s,l};
}
function toRgb(h:number,s:number,l:number):GoveeColorV909{
 const ss=clip(s,0,1),ll=clip(l,0,1),hh=hue(h);
 const c=(1-Math.abs(2*ll-1))*ss,x=c*(1-Math.abs((hh/60)%2-1)),m=ll-c/2;
 const v=hh<60?[c,x,0]:hh<120?[x,c,0]:hh<180?[0,c,x]:hh<240?[0,x,c]:hh<300?[x,0,c]:[c,0,x];
 return {r:Math.round((v[0]+m)*255),g:Math.round((v[1]+m)*255),b:Math.round((v[2]+m)*255)};
}
/** Suggested starting color by genre; never takes over an existing user-defined show. */
export function suggestGoveeHarmonyBaseV913(genre:string):GoveeColorV909{
 const g=String(genre??'').toLowerCase();
 if(/hardtekk|hardtek|hardstyle|rawstyle|hardcore|techno/.test(g))return {r:34,g:70,b:202};
 if(/deutschrock|rock|metal|industrial|ndh/.test(g))return {r:193,g:53,b:31};
 if(/rap|hip.hop|trap|drill|grime/.test(g))return {r:137,g:29,b:74};
 return {r:67,g:92,b:189};
}
/** Strength 0 retains the user's base hue; 100 uses full palette offsets.
 * No intermediate flashing. Brightness is capped by the existing master brightness setting.
 */
export function generateGoveeHarmonyLookV913(options:GoveeHarmonyOptionsV913,role:GoveeRoleV911,phase:GoveePhaseV911):GoveeHarmonyLookV913{
 const {h,s,l}=fromRgb(options.base);
 const palette=roleOffsets[options.scheme]??roleOffsets.analogous;
 const p=phases[phase]??phases.ambient,r=roles[role]??roles.ambient;
 const resolvedRole: GoveeRoleV911=roles[role]?role:'ambient';
 const strength=clip(options.strength,0,100)/100;
 const outputHue=hue(h+strength*(palette[resolvedRole]+p.offset));
 // A grey or black selected as a base remains neutral, even at maximum strength.
 const outputS=clip(s*p.saturation*r.saturation*(1+.06*strength),0,1);
 const outputL=clip(l*p.lightness*r.lightness,.06,.8);
 const brightness=Math.round(clip(Math.min(100,clip(options.masterBrightness,20,100))*p.level*r.level,20,100));
 return {color:toRgb(outputHue,outputS,outputL),brightness};
}
/** Applies harmonious looks to a local V912 draft, preserving custom transition lengths.
 * All six phases are generated only on explicit request, not on every render or playback tick.
 */
export function applyGoveeHarmonyToShowV913(show:GoveeShowV912,fixtures:GoveeHarmonyFixtureV913[],options:GoveeHarmonyOptionsV913,phasesToUpdate:readonly GoveePhaseV911[]):GoveeShowV912{
 let next=show;
 const seen=new Set<string>();
 for(const fixture of fixtures.slice(0,32)){
  if(seen.has(fixture.ip))continue;
  seen.add(fixture.ip);
  for(const phase of phasesToUpdate){
   if(!GOVEE_PHASES_V912.includes(phase))continue;
   const value=generateGoveeHarmonyLookV913(options,fixture.role,phase);
   const previous=show.cues[fixture.ip]?.[phase];
   next=replaceGoveeShowCueV912(next,fixture.ip,phase,{...previous,...value,fadeMs:previous?.fadeMs??3200});
  }
 }
 return next;
}
