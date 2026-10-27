import type {ConcertDetailsCueV555, ConcertDetailSettingsV555} from './concertDetailEffectsV555';

export type ConcertBalanceV556 = {
  gobo:number; pixelWall:number; floorFog:number; projection:number;
  projectedWord:string; isDense:boolean; quality:'low'|'balanced'|'high';
};
export type ConcertQualityV556 = 'low'|'balanced'|'high';
const clamp01=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;

/** One bounded, deterministic budget for additive stage decorations.
 * The live scene and the preview both consume this result; none of the values
 * affects the primary karaoke renderer or vocal/beat timing.
 */
export function balanceConcertDetailsV556(input:{
  cue:ConcertDetailsCueV555;
  settings:ConcertDetailSettingsV555;
  playing:boolean;
  reducedMotion:boolean;
  tier:ConcertQualityV556;
}):ConcertBalanceV556{
  const {cue,settings,tier,playing,reducedMotion}=input;
  const zero:ConcertBalanceV556={gobo:0,pixelWall:0,floorFog:0,projection:0,projectedWord:'',isDense:false,quality:tier};
  if(!playing||!settings.enabled)return zero;
  const strength=clamp01(settings.strength/100);
  const density=clamp01(cue.density);
  const isDense=density>=.70;
  const projectedWord=!!(settings.hookProjection&&!reducedMotion&&tier!=='low'&&cue.hook&&
    !isDense&&cue.projectedWord.trim())?cue.projectedWord.slice(0,18):'';
  // Projection is readable precisely because the other lights step back.
  const projection=projectedWord?strength*.155:0;
  const hookGain=cue.hook?1.05:1;
  const densityGain=isDense?.43:1;
  let pixelWall=settings.pixelWall?strength*(tier==='low'?.115:.285)*hookGain*densityGain:0;
  let gobo=settings.gobo&&tier!=='low'?strength*.14*(isDense?.75:1):0;
  const floorFog=settings.floorFog&&tier!=='low'?strength*.095:0;
  if(projectedWord){pixelWall*=.68;gobo*=.75;}
  if(reducedMotion){pixelWall*=.42;gobo*=.4;}
  // The additive light sum stays restrained even with every slider at maximum.
  const maxLight=tier==='low'?.12:.35;
  const sum=pixelWall+gobo+projection;
  if(sum>maxLight){const lights=pixelWall+gobo;
    const ratio=lights>0?Math.max(0,maxLight-projection)/lights:0;pixelWall*=ratio;gobo*=ratio;}
  return {gobo,pixelWall,floorFog,projection,projectedWord,isDense,quality:tier};
}
