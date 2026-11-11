export type SongCostume={name:string;roughness:number;metalness:number;pattern:'original'|'neon-grid'|'stripes';color:string};
/** Stable per-song fabric and colour variants, independent of playback/tempo. */
export function songWardrobe(trackId:string,genre:string,slot:number):SongCostume{
 let hash=2166136261;for(const c of trackId)hash=Math.imul(hash^c.charCodeAt(0),16777619)>>>0;
 const variant=(hash+Math.max(0,Math.floor(Number.isFinite(slot)?slot:0)))%3;
 const family=/rock|metal|punk/i.test(genre)?'rock':/jazz|classical|soul|ambient/i.test(genre)?'gala':/rap|hip|trap/i.test(genre)?'street':/latin|afro|reggae/i.test(genre)?'festival':'neon';
 const preset={rock:{name:'Rock · Lederlook',roughness:.38,metalness:.18,pattern:'original' as const,colors:['#743b48','#354356','#5d416b']},gala:{name:'Gala · Satinlook',roughness:.25,metalness:.22,pattern:'original' as const,colors:['#3c5975','#704568','#466b63']},street:{name:'Street · Sportlook',roughness:.83,metalness:.02,pattern:'stripes' as const,colors:['#5c5592','#397e85','#97543d']},festival:{name:'Festival · Farbstoff',roughness:.68,metalness:.04,pattern:'stripes' as const,colors:['#c65a6b','#479d86','#b08a39']},neon:{name:'Club · Neonlook',roughness:.48,metalness:.12,pattern:'neon-grid' as const,colors:['#527ec7','#9b53c5','#3caaa7']}}[family];
 return {name:preset.name,roughness:preset.roughness,metalness:preset.metalness,pattern:preset.pattern,color:preset.colors[variant]};
}
