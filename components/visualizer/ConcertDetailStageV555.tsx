'use client';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, Line, LineBasicMaterial, ShaderMaterial, SpotLight, Vector3 } from 'three';
import { getActivePerformanceTier,useAdaptivePerformance } from './adaptivePerformance';
import {getVisualFactorsV640} from './adaptiveVisualBudgetV640';
import {usePiConcertBudgetV479,readPiConcertBudgetV479} from './piConcertRuntimeV479';
import {planPiConcertVisualQualityV602,planPiConcertStageFxV602} from './piConcertOptimizationV602';
import type { ConcertDetailSettingsV555,ConcertDetailsCueV555 } from './concertDetailEffectsV555';
import {planAdvancedConcertStageFxV601} from './advancedConcertStageFxV601';
import {planUltimateConcertDramaturgyV623,composeConcertLightingV623} from "./ultimateConcertDramaturgyV623";
import {planAdvancedStageLightingV621,composeStageFxV621} from './advancedStageLightingV621';
import {planProfessionalLightingV636,composeProfessionalStageFxV636} from './professionalLightingShowV636';
import {planDynamicStageTransformationV622} from './dynamicStageTransformationV622';
import {getLightingPlayback} from './lightingPlayback';
import type {NarrativePlanV604,NarrativeCueV604} from './fullSongConcertDramaturgyV604';
// V601 delegates the original shared additive budget to balanceConcertDetailsV556; shaders are unchanged in count.

/** Three shared shader programs, four small planes, one reusable 13-segment connection. No textures/shadows/particles. */
export function ConcertDetailStageV555({cue,settings,playing,reducedMotion,section,manualLighting,reactive,lyricsProtected,genre,avatarCount=1,cameraNarrativeV605,vocalFocusV621=false,kickV621=0,energyV621=0}:{cue:ConcertDetailsCueV555;
  settings:ConcertDetailSettingsV555;playing:boolean;reducedMotion:boolean;avatarCount?:number;cameraNarrativeV605?:{plan:NarrativePlanV604;cue:NarrativeCueV604};vocalFocusV621?:boolean;kickV621?:number;energyV621?:number;section?:string|null;manualLighting?:boolean;reactive?:boolean;lyricsProtected?:boolean;genre?:string|null}){
  const {tier,mode:performanceModeV602}=useAdaptivePerformance();
  const piBudgetV602=usePiConcertBudgetV479();
  const gobo=useRef<ShaderMaterial>(null),pixels=useRef<ShaderMaterial>(null),mist=useRef<ShaderMaterial>(null);
  const sweepSpot=useRef<SpotLight>(null);
  const arcGeometry=useMemo(()=>{
    const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(new Float32Array(13*3),3));
    g.setDrawRange(0,0);return g;
  },[]);
  // R3F's lowercase <line> resolves to an SVG element in these React typings.
  // Reuse a real Three.js line primitive; no additional geometry per frame.
  const arc=useMemo(()=>{
    const line=new Line(arcGeometry,new LineBasicMaterial({color:'#83e4ff',transparent:true,opacity:0,
      depthWrite:false,blending:AdditiveBlending}));
    line.visible=false;
    line.renderOrder=8;
    return line;
  },[arcGeometry]);
  const origin=useRef(new Vector3()),target=useRef(new Vector3());
  const warmTintV622=useMemo(()=>new Color('#ffd4ae'),[]);
  const coolTintV622=useMemo(()=>new Color('#b3e5ff'),[]);
  const neutralTintV622=useMemo(()=>new Color('#ffffff'),[]);
  const moodTargetV622=useMemo(()=>new Color(),[]);
  const common=useMemo(()=>({uTime:{value:0},uIntensity:{value:0},uHook:{value:0},uDensity:{value:0},uPattern:{value:0},uSweep:{value:0},uShape:{value:0},uGoboVariant:{value:0},uGoboMix:{value:0},uTint:{value:new Color('#ffffff')}}),[]);
  const wallUniforms=useMemo(()=>({uTime:{value:0},uIntensity:{value:0},uHook:{value:0},uDensity:{value:0},uPattern:{value:0},uSweep:{value:0},uShape:{value:0},uTint:{value:new Color('#ffffff')}}),[]);
  const mistUniforms=useMemo(()=>({uTime:{value:0},uIntensity:{value:0},uTint:{value:new Color('#ffffff')}}),[]);
  useEffect(()=>()=>{arc.material.dispose();arcGeometry.dispose();},[arc,arcGeometry]);
  useFrame((state,dt)=>{
    const frameTier=getActivePerformanceTier();
    const baselineV601=planAdvancedConcertStageFxV601({cue,settings,playing,reducedMotion,tier:frameTier,section,manualLighting,reactive,lyricsProtected,genre});
    const piQualityV602=planPiConcertVisualQualityV602({budget:readPiConcertBudgetV479(),avatarCount,autoQuality:performanceModeV602==='auto',manualLighting:manualLighting===true,reactive:reactive!==false});
    // V621 follows precisely the same verified song cue/clock as the main rig.
    // The Pi limiter V602 runs first; V621 cannot create new stage elements.
    const playbackV621=getLightingPlayback();
    const lightingV621=composeConcertLightingV623(planAdvancedStageLightingV621({narrative:cameraNarrativeV605,
      trackId:playbackV621.trackId,positionMs:playbackV621.positionMs,durationMs:playbackV621.durationMs,
      section:(['intro','verse','build','hook','drop','break'].includes(section??'')?section:'intro') as 'intro'|'verse'|'build'|'hook'|'drop'|'break',genre,
      energy:energyV621,kick:kickV621,playing:playing&&playbackV621.playing,
      reactive:reactive!==false,reducedMotion,tier:frameTier,
      authored:manualLighting===true,blackout:false,lyricsProtected:lyricsProtected===true,
      vocalFocus:vocalFocusV621,groupCount:avatarCount,
     }),planUltimateConcertDramaturgyV623({
      narrative:cameraNarrativeV605,trackId:playbackV621.trackId,durationMs:playbackV621.durationMs,positionMs:playbackV621.positionMs,
      section:(['intro','verse','build','hook','drop','break'].includes(section??'')?section:'intro'),playing:playing&&playbackV621.playing,reducedMotion,tier:frameTier,
      energy:energyV621,kick:kickV621,lyricsProtected:lyricsProtected===true,vocalFocus:vocalFocusV621,
      manualLighting:manualLighting===true,
    }));
    const professionalLightV636=planProfessionalLightingV636({
      narrative:cameraNarrativeV605,trackId:playbackV621.trackId,
      positionMs:playbackV621.positionMs,durationMs:playbackV621.durationMs,
      section:(['intro','verse','build','hook','drop','break'].includes(section??'')?section:'intro') as 'intro'|'verse'|'build'|'hook'|'drop'|'break',
      genre,energy:energyV621,kick:kickV621,playing:playing&&playbackV621.playing,
      reactive:reactive!==false,reducedMotion,tier:frameTier,
      authored:manualLighting===true,blackout:false,enabled:settings.enabled,
      lyricsProtected:lyricsProtected===true,vocalFocus:vocalFocusV621,groupCount:avatarCount,
    });
    const balance=composeProfessionalStageFxV636(
      composeStageFxV621(planPiConcertStageFxV602(baselineV601,piQualityV602),lightingV621),
      professionalLightV636);

    // V640: scale optional procedural planes only; keep portraits, lyric projection,
    // duet arcs and manually authored light programming intact.
    const decorationV640=manualLighting?{led:1,gobo:1,haze:1,beams:1}:getVisualFactorsV640();
    const visualV640={...balance,gobo:balance.gobo*decorationV640.gobo,
      pixelWall:balance.pixelWall*decorationV640.led,
      floorFog:balance.floorFog*decorationV640.haze};
    const transformationV622=planDynamicStageTransformationV622({
      narrative:cameraNarrativeV605,trackId:playbackV621.trackId,
      positionMs:playbackV621.positionMs,durationMs:playbackV621.durationMs,
      section,genre,playing:playing&&playbackV621.playing,reactive:reactive!==false,
      reducedMotion,tier:frameTier,authored:manualLighting===true,
      blackout:false,lyricsProtected:lyricsProtected===true,vocalFocus:vocalFocusV621,
    });
    const easing=1-Math.exp(-Math.max(0,Math.min(.12,dt))*5);
    moodTargetV622.copy(coolTintV622).lerp(warmTintV622,(transformationV622.tone+1)/2);
    const tintAmountV622=transformationV622.accent*.30;
    moodTargetV622.lerp(neutralTintV622,1-tintAmountV622);
    const tintEaseV622=1-Math.exp(-Math.max(0,Math.min(.12,dt))*2.8);
    common.uTint.value.lerp(moodTargetV622,tintEaseV622);
    wallUniforms.uTint.value.lerp(moodTargetV622,tintEaseV622);
    mistUniforms.uTint.value.lerp(moodTargetV622,tintEaseV622);
    const move=(actual:number,target:number)=>actual+(target-actual)*easing;
    const motion=!reducedMotion&&frameTier!=='low';
    const step=motion&&playing?Math.min(.08,Math.max(0,dt)):0;
    common.uTime.value+=step*(.16+balance.speed*.43);
    wallUniforms.uTime.value+=step*(.18+balance.speed*.6);
    mistUniforms.uTime.value+=step*.12;
    common.uIntensity.value=move(common.uIntensity.value,visualV640.gobo);
    common.uSweep.value=move(common.uSweep.value,balance.sweep);
    common.uShape.value=move(common.uShape.value,balance.ledShape/2);
    common.uGoboVariant.value=professionalLightV636.goboVariant;
    common.uGoboMix.value=move(common.uGoboMix.value,professionalLightV636.goboMix);
    common.uHook.value=manualLighting?(cue.hook?1:0):balance.mode==='hook'||balance.mode==='drop'?1:0;
    common.uDensity.value=Number.isFinite(cue.density)?Math.max(0,Math.min(1,cue.density)):0;
    common.uPattern.value=cue.pattern??0;
    wallUniforms.uIntensity.value=move(wallUniforms.uIntensity.value,visualV640.pixelWall);
    wallUniforms.uSweep.value=move(wallUniforms.uSweep.value,balance.sweep);
    wallUniforms.uShape.value=move(wallUniforms.uShape.value,balance.ledShape/2);
    wallUniforms.uHook.value=manualLighting?(cue.hook?1:0):balance.mode==='hook'||balance.mode==='drop'?1:0;
    wallUniforms.uDensity.value=Number.isFinite(cue.density)?Math.max(0,Math.min(1,cue.density)):0;
    wallUniforms.uPattern.value=cue.pattern??0;
    mistUniforms.uIntensity.value=move(mistUniforms.uIntensity.value,visualV640.floorFog);
    if(sweepSpot.current){
      sweepSpot.current.intensity=move(sweepSpot.current.intensity,balance.spotlight);
      sweepSpot.current.position.x=Math.sin(common.uTime.value*.8)*balance.sweep*1.45;
    }
    if(gobo.current)gobo.current.visible=common.uIntensity.value>.001;
    if(pixels.current)pixels.current.visible=wallUniforms.uIntensity.value>.001;
    if(mist.current)mist.current.visible=mistUniforms.uIntensity.value>.001;
    const line=arc;
    if(line){
      const slots=cue.arcSlots;
      const a=slots?state.scene.getObjectByName(`v377-vocal-stage-slot-${slots[0]}`):null;
      const b=slots?state.scene.getObjectByName(`v377-vocal-stage-slot-${slots[1]}`):null;
      const visible=!!(settings.duetArc&&playing&&!reducedMotion&&frameTier!=='low'&&a?.visible&&b?.visible&&cue.arcOpacity>.01);
      line.visible=visible;
      if(visible&&a&&b){
        a.getWorldPosition(origin.current);b.getWorldPosition(target.current);
        if(![origin.current.x,origin.current.y,target.current.x,target.current.y].every(Number.isFinite)){
          line.visible=false;
        }else{
          const attr=arcGeometry.getAttribute('position') as Float32BufferAttribute;
          for(let i=0;i<13;i++){
            const t=i/12,curve=Math.sin(Math.PI*t)*.55;
            attr.setXYZ(i,origin.current.x+(target.current.x-origin.current.x)*t,
              origin.current.y+(target.current.y-origin.current.y)*t+1.15+curve,
              origin.current.z+(target.current.z-origin.current.z)*t+.16);
          }
          attr.needsUpdate=true;
          arcGeometry.setDrawRange(0,13);
          // Absolute reference positions can move with choreography; keep bounding check out.
          line.frustumCulled=false;
          const mat=line.material;
          if(!Array.isArray(mat))mat.opacity=cue.arcOpacity*.55;
        }
      }
    }
  });
  const qualityV602=planPiConcertVisualQualityV602({budget:piBudgetV602,avatarCount,autoQuality:performanceModeV602==='auto',manualLighting:manualLighting===true,reactive:reactive!==false});
  const layer=planPiConcertStageFxV602(planAdvancedConcertStageFxV601({cue,settings,playing,reducedMotion,tier,section,manualLighting,reactive,lyricsProtected,genre}),qualityV602);
  const stageVertex='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
  return <group name="SonicConcertDetailsV555">
    {settings.enabled&&settings.gobo&&settings.avatarLight!==false&&!reducedMotion&&tier!=='low'&& !manualLighting &&qualityV602.spotlightGain>0 && <spotLight ref={sweepSpot} position={[0,3.4,1]} angle={.32} penumbra={.96} distance={8} decay={2} castShadow={false} intensity={0} color="#aedcff"/>}
    <mesh position={[0,.15,-3.6]} renderOrder={-2}><planeGeometry args={[9,5.2]}/>
      <shaderMaterial ref={pixels} visible={false} transparent depthWrite={false} depthTest={true} blending={AdditiveBlending}
        uniforms={wallUniforms} vertexShader={stageVertex}
        fragmentShader={`varying vec2 vUv;uniform float uTime,uIntensity,uHook,uDensity,uPattern,uSweep,uShape;uniform vec3 uTint;
          void main(){vec2 q=floor(vUv*vec2(36.,20.));vec2 p=fract(vUv*vec2(36.,20.))-.5;
            float point=1.-smoothstep(.28,.43,length(p));
            float stripe=.5+.5*sin(q.x*.45+q.y*.35+uTime*2.);
            float diamond=step(.72,abs(sin((q.x+q.y)*.17+uTime)));
            float waves=.5+.5*sin(q.x*.2-q.y*.16+uTime*2.2);
            float pattern=mix(.28+.3*stripe,.38+.58*diamond,max(uHook,uShape));
            pattern=mix(pattern,.25+.53*waves,uShape*.38);
            pattern=mix(pattern,.3+.5*abs(sin(q.x*.19-q.y*.22+uTime)),step(.5,uPattern));
            float calm=mix(1.,.48,step(.75,uDensity));
            vec3 color=mix(vec3(.19,.5,.68),vec3(.64,.31,.75),stripe);
            gl_FragColor=vec4(color*uTint,point*pattern*uIntensity*calm);}`}/>
    </mesh>
    <mesh position={[0,-1.67,-.45]} rotation={[-Math.PI/2,0,0]} renderOrder={-1}>
      <planeGeometry args={[8,6]}/>
      <shaderMaterial ref={gobo} visible={false} transparent depthWrite={false} depthTest={true}
        blending={AdditiveBlending} uniforms={common} vertexShader={stageVertex}
        fragmentShader={`varying vec2 vUv;uniform float uTime,uIntensity,uHook,uDensity,uPattern,uSweep,uShape,uGoboVariant,uGoboMix;uniform vec3 uTint;
          void main(){vec2 p=vUv*vec2(5.,4.);vec2 q=p+vec2(uTime*.27,uTime*.19);
            float lines=pow(.5+.5*cos(q.x*7.0+sin(q.y*2.8+uSweep)*.6),9.);
            float grid=pow(.5+.5*cos(q.x*5.),12.)*pow(.5+.5*cos(q.y*5.),12.);
            float rings=pow(.5+.5*cos(length(q-vec2(2.5,2.))*11.-uTime*1.4),10.);
            float mask=mix(lines,grid,uHook*.6);
            mask=mix(mask,rings,uShape*.38);
            float dots=pow(.5+.5*cos(q.x*6.)*cos(q.y*6.),8.);
            mask=mix(mask,dots,step(1.5,uPattern)*.65);
            // V636 reuses existing procedural floor patterns, no new texture.
            float preferred=uGoboVariant<.5?lines:uGoboVariant<1.5?grid:rings;
            mask=mix(mask,preferred,uGoboMix);
            float falloff=smoothstep(.02,.3,vUv.x)*smoothstep(.02,.3,vUv.y)*smoothstep(.02,.3,1.-vUv.x)*smoothstep(.02,.3,1.-vUv.y);
            gl_FragColor=vec4(vec3(.31,.73,1.)*uTint,mask*falloff*uIntensity*(1.-uDensity*.35));}`}/>
    </mesh>
    <mesh position={[0,-1.43,.36]} renderOrder={1}>
      <planeGeometry args={[6.3,.52]}/>
      <shaderMaterial ref={mist} visible={false} transparent depthWrite={false} depthTest={true} blending={AdditiveBlending}
        uniforms={mistUniforms} vertexShader={stageVertex}
        fragmentShader={`varying vec2 vUv;uniform float uTime,uIntensity;uniform vec3 uTint;
          void main(){float a=pow(sin(vUv.y*3.14159),1.7)*smoothstep(0.,.12,vUv.x)*smoothstep(0.,.12,1.-vUv.x);
          float mist=.78+.22*sin(vUv.x*13.+uTime*1.6)+.12*sin(vUv.x*31.-uTime);
          gl_FragColor=vec4(vec3(.38,.63,.85)*uTint,a*mist*uIntensity);}`}/>
    </mesh>
    <primitive object={arc}/>
    {layer.projectedWord&&
      <Text position={[0,1.22,-3.2]} fontSize={.57} color="#a8dfff" fillOpacity={layer.projection}
        anchorX="center" anchorY="middle" maxWidth={5} renderOrder={-1} material-depthWrite={false}>
        {cue.projectedWord}
      </Text>}
  </group>;
}
