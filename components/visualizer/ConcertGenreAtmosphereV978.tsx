/** V978 – lightweight actual 3D atmosphere, reusing the current R3F Canvas.
 * Fixed mesh count (max 7), no lights/shadows/callbacks/frame loops.
 * Everything is virtual; voice zones and authored-scene guards live upstream.
 */
import type {AtmosphereCueV978} from '@/lib/concertAtmosphereV978';
export function ConcertGenreAtmosphereV978({cue,showStage,showAudience}:{
 cue:AtmosphereCueV978;showStage:boolean;showAudience:boolean;
}){
 if(!cue.active)return null;
 return <group name="SmartConcertAtmosphereV978">
  {showStage&&cue.fogOpacity>0&&[0,1,2].map((i)=><mesh key={`v978-fog-${i}`}
   rotation={[-Math.PI/2,0,0]} position={[(i-1)*1.3+cue.drift,-.8,-1.15+i*.42]}
   scale={[cue.spread,cue.spread,1]}>
   <circleGeometry args={[1.25,16]}/>
   <meshBasicMaterial color={cue.colorB} transparent opacity={cue.fogOpacity}
    depthWrite={false} side={2}/>
  </mesh>)}
  {showStage&&cue.beamOpacity>0&&[-1,1].map(side=><mesh key={`v978-beam-${side}`}
   position={[side*2.25,1.55,-2.1]} rotation={[0,0,side*(.31+cue.beamTilt)]}>
   <coneGeometry args={[.80,3.4,10,1,true]}/>
   <meshBasicMaterial color={cue.colorA} transparent opacity={cue.beamOpacity}
    depthWrite={false} side={2}/>
  </mesh>)}
  {showAudience&&cue.crowdOpacity>0&&[-1,0,1].map((i)=><mesh key={`v978-crowd-${i}`}
   position={[i*1.9,-.78+cue.crowdWave*.04,1.8]}>
   <planeGeometry args={[1.32,.18]}/>
   <meshBasicMaterial color={i%2?cue.colorB:cue.colorA} transparent
    opacity={cue.crowdOpacity*(.76+.24*cue.crowdWave)} depthWrite={false} side={2}/>
  </mesh>)}
 </group>;
}
