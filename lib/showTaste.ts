export const TASTE_MOTIFS=['Dance_RobotGroove','Dance_FluidArc','Dance_FrontmanDrive','Dance_JazzRebound','Dance_CrossStep','Dance_TurnPhrase'] as const;
export type MotifTaste=Partial<Record<typeof TASTE_MOTIFS[number],number>>;
export function normalizeShowTaste(value:unknown):MotifTaste{
 const out:MotifTaste={};if(!value||typeof value!=='object')return out;
 for(const name of TASTE_MOTIFS){const n=(value as Record<string,unknown>)[name];if(typeof n==='number'&&Number.isFinite(n)){const bounded=Math.max(-3,Math.min(3,Math.round(n)));if(bounded)out[name]=bounded;}}
 return out;
}
export function voteShowTaste(value:unknown,motif:string,direction:1|-1):MotifTaste{
 const next=normalizeShowTaste(value);if(!TASTE_MOTIFS.includes(motif as typeof TASTE_MOTIFS[number]))return next;
 const name=motif as typeof TASTE_MOTIFS[number],n=Math.max(-3,Math.min(3,(next[name]??0)+direction));
 if(n)next[name]=n;else delete next[name];return next;
}
export const tasteGain=(taste:MotifTaste|undefined,clip:string)=>{const n=taste?.[clip as keyof MotifTaste];return typeof n==='number'&&Number.isFinite(n)?Math.max(-3,Math.min(3,n))*.65:0;};
export const tasteKey=(taste?:MotifTaste)=>TASTE_MOTIFS.map(name=>taste?.[name]??0).join(',');
