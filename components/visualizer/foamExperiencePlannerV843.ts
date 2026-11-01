/** V843 – perceptual foam jet trajectories. Pure deterministic planning and zero-allocation sampling.
 * Reuses V817's existing two instanced meshes and stage-wing particle seeds.
 * Simulated ground froth is a brief stage-wing phase of the same instances, not persistent debris.
 */
import type {ConcertFxCueV810,ConcertFxSettingsV810} from './concertFxStudioV810';
import type {FoamCannonCueV817} from './foamCannonPlannerV817';
import type {createFoamLayoutV817} from './foamCannonPlannerV817';
export type FoamStyleV843='natural'|'soft'|'festival';
export interface FoamExperienceV843 {
 active:boolean;style:FoamStyleV843;arc:number;flutter:number;settle:number;burst:number;
}
export const FOAM_EXPERIENCE_OFF_V843:Readonly<FoamExperienceV843> =Object.freeze({
 active:false,style:'natural',arc:0,flutter:0,settle:0,burst:0,
});
const clamp=(v:number)=>Math.min(1,Math.max(0,v));
/** Planning happens after authored/timeline V823 and hardware-budget V825 decisions.
 * Never increases particle count, source cue power or opacity. */
export function planFoamExperienceV843(input:{
 cue:FoamCannonCueV817;fx:ConcertFxCueV810;settings:ConcertFxSettingsV810;
 tier:'low'|'balanced'|'high';lyricsProtected:boolean;vocalFocus:boolean;groupCount:number;
}):FoamExperienceV843 {
 const {cue,fx,settings:s}=input;
 if(!s.enabled||!s.foamCannon||!s.foamExperienceV843||!cue.active||
    !fx.active||fx.reason!=='music'||input.tier==='low'||
    !Number.isInteger(input.groupCount)||input.groupCount<1||input.groupCount>4||
    ![cue.phase,cue.power,cue.opacity,s.foamRealismV843].every(Number.isFinite)||
    cue.power<=0||cue.opacity<=0||cue.bubbles<2||cue.mist<2||
    !['hook','build','drop','finale'].includes(fx.section)||
    s.foamRealismV843<=0)return FOAM_EXPERIENCE_OFF_V843;
 const mode=s.foamStyleV843==='soft'||s.foamStyleV843==='festival'?s.foamStyleV843:'natural';
 const intensity=clamp(s.foamRealismV843/100);
 const contrast=fx.section==='drop'?1:fx.section==='finale'?.86:fx.section==='hook'?.57:.30;
 const genre=fx.genre==='hardtekk'||fx.genre==='hardstyle'?1:fx.genre==='rock'?.76:fx.genre==='rap'?.45:.60;
 const safety=(s.protectLyrics&&input.lyricsProtected?.58:1)*(input.vocalFocus?.64:1)*(input.groupCount>=3?.78:1);
 const amount=clamp(cue.power)*intensity*contrast*genre*safety;
 const motion=mode==='soft'?.65:mode==='festival'?1.2:1;
 return {active:true,style:mode,arc:clamp(.32+amount*.60),
   flutter:clamp(amount*.42*motion),settle:s.foamLandingV843?clamp(.36+amount*.42):0,
   burst:clamp(amount*(mode==='festival'?1.0:mode==='soft'?.45:.72))};
}
export type FoamSeedV843=ReturnType<typeof createFoamLayoutV817>[number];
export interface FoamParticlePoseV843 {x:number;y:number;z:number;scale:number;}
/** Write into caller-provided pose to avoid allocations in React Three Fiber useFrame.
 * Shapes remain within stage wings: abs(x)-radius >= 3.25, y >= -.20. */
export function sampleFoamParticleV843(seed:FoamSeedV843,phase:number,tiny:boolean,
 motion:FoamExperienceV843,out:FoamParticlePoseV843):FoamParticlePoseV843 {
 if(!Number.isFinite(phase)||!Number.isFinite(seed.phase)||!motion.active){
  out.x=seed.side*3.65;out.y=-.16;out.z=2.5;out.scale=0;return out;
 }
 const life=((phase*(tiny?.85:.62)+seed.phase)%1+1)%1;
 const jet=Math.min(1,life/.76);
 const landing=Math.max(0,Math.min(1,(life-.72)/.28));
 const rise=4.5*jet*(1-jet)*(.73+motion.arc*.55);
 const flutter=Math.sin(life*16+seed.skew*23)*motion.flutter*.30*(.25+jet*.75);
 const xWing=Math.max(3.55,3.65+1.9*jet+Math.abs(seed.skew)*.24+flutter);
 const sizeBase=(tiny?.034:.083)*seed.size;
 const settling=motion.settle*landing;
 out.x=seed.side*xWing;
 out.y=Math.max(-.18,-.12+rise+seed.rise*.25*(1-landing)-settling*.055);
 out.z=2.5+2.9*jet+seed.skew*.26+motion.burst*.30*Math.sin(jet*Math.PI);
 // The same bubbles briefly resemble settled froth. No new mesh or persistent accumulation.
 const froth=motion.settle*(tiny?.12:.45)*landing;
 const growth=(.73+jet*.48+froth)*(1-.40*landing*(1-motion.settle));
 out.scale=Math.min(tiny?.12:.23,Math.max(0,sizeBase*growth));
 return out;
}
