"use client";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Line, OrbitControls, useGLTF } from "@react-three/drei";
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimationMixer, Box3, PerspectiveCamera, Vector3, type AnimationClip } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { retargetHumanoidClips, readRetargetCalibration } from "./avatarAnimationRetarget";
import { clone as cloneSkinnedScene } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { CameraPose } from "./stageCameraPoseHelpersV289";

export type MotionSeek = { seconds: number; revision: number };
type Props = { pathPoints?: CameraPose[]; pose: CameraPose; onPoseChange: (pose: CameraPose) => void; avatarUrl?: string | null; avatarLabel?: string; motionUrl?: string | null; playing?: boolean; speed?: number; seek?: MotionSeek; onMotionProgress?: (seconds: number, duration: number) => void };

/** Clone the rig: preview must never mutate the live avatar or its animations. */
function LoadedAvatar({ url, motionUrl, playing = false, speed = 1, seek, onMotionProgress }: { url: string; motionUrl?: string | null; playing?: boolean; speed?: number; seek?: MotionSeek; onMotionProgress?: (seconds: number, duration: number) => void }) {
  const { scene, animations } = useGLTF(url);
  const cloned = useMemo(() => {
    const rig = cloneSkinnedScene(scene);
    // Normalize height and floor contact, preserving model orientation.
    const box = new Box3().setFromObject(rig);
    const height = box.max.y - box.min.y;
    if (!Number.isFinite(height) || height <= 0.0001) return rig;
    const scale = Math.min(5, Math.max(0.01, 2.1 / height));
    const center = box.getCenter(new Vector3());
    rig.scale.multiplyScalar(scale);
    rig.position.set(-center.x * scale, -1.1 - box.min.y * scale, -center.z * scale);
    return rig;
  }, [scene]);
  const mixer = useMemo(() => new AnimationMixer(cloned), [cloned]);
  const [externalClips, setExternalClips] = useState<AnimationClip[]>([]);
  useEffect(() => {
    let cancelled = false;
    setExternalClips([]);
    if (!motionUrl) return;
    const loader = new GLTFLoader();
    loader.loadAsync(motionUrl).then(gltf => {
      if (cancelled) return;
      const converted = retargetHumanoidClips(gltf.animations, gltf.scene, cloned, readRetargetCalibration(url));
      setExternalClips(converted.clips);
    }).catch(error => {if (!cancelled) console.warn("V293: Motion unavailable", error);});
    return () => { cancelled = true; };
  }, [motionUrl, cloned, url]);
  const selectedClip = motionUrl ? externalClips[0] : animations[0];
  const progressCallback = useRef(onMotionProgress);
  useEffect(() => { progressCallback.current = onMotionProgress; }, [onMotionProgress]);
  const lastProgress = useRef(-Infinity);
  useEffect(() => {
    mixer.stopAllAction();
    if (!selectedClip) return;
    const action = mixer.clipAction(selectedClip);
    action.reset().play();
    lastProgress.current = -Infinity;
    progressCallback.current?.(0, selectedClip.duration);
    return () => { action.stop(); mixer.uncacheAction(selectedClip); };
  }, [mixer, selectedClip]);
  // Seek is a one-shot command; replaying it on each React render would freeze the animation.
  useEffect(() => {
    if (!selectedClip || !seek) return;
    const duration = selectedClip.duration;
    if (!(duration > 0)) return;
    const next = Math.max(0, Math.min(duration, seek.seconds));
    mixer.setTime(next);
    lastProgress.current = -Infinity;
    progressCallback.current?.(next, duration);
  }, [mixer, selectedClip, seek?.revision]);
  useFrame((state, delta) => {
    if (!selectedClip || !(selectedClip.duration > 0)) return;
    if (playing) mixer.update(Math.min(delta, .05) * Math.max(.25, Math.min(2, speed)));
    if (state.clock.elapsedTime - lastProgress.current >= .12) {
      lastProgress.current = state.clock.elapsedTime;
      const time = mixer.clipAction(selectedClip).time;
      progressCallback.current?.(time, selectedClip.duration);
    }
  });
  useEffect(() => () => { mixer.stopAllAction(); mixer.uncacheRoot(cloned); }, [mixer, cloned]);
  return <primitive object={cloned} dispose={null} />;
}

class PreviewErrorBoundary extends Component<{children:ReactNode; onError:()=>void},{failed:boolean}> {
  state = {failed:false};
  static getDerivedStateFromError() {return {failed:true};}
  componentDidCatch() {this.props.onError();}
  render(){ return this.state.failed ? <NeutralAvatar /> : this.props.children; }
}

function NeutralAvatar() {
  return <group position={[0,-.14,0]}>
    <mesh position={[0,.2,0]}><capsuleGeometry args={[.23,.66,8,16]}/><meshStandardMaterial color="#82c7f2" roughness={.55}/></mesh>
    <mesh position={[0,.99,0]}><sphereGeometry args={[.22,20,16]}/><meshStandardMaterial color="#cfdbec"/></mesh>
    {[-1,1].map(side=><group key={side}>
      <mesh position={[side*.33,.20,0]} rotation={[0,0,side*.15]}><capsuleGeometry args={[.08,.61,6,12]}/><meshStandardMaterial color="#d4a9ea"/></mesh>
      <mesh position={[side*.13,-.75,0]}><capsuleGeometry args={[.105,.63,6,12]}/><meshStandardMaterial color="#708eb5"/></mesh>
    </group>)}
  </group>;
}

/** This is a separate *on-demand* preview canvas; the live music canvas remains untouched. */
function PreviewCamera({ pose, onPoseChange }: Props) {
  const { camera, invalidate } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);
  useEffect(() => {
    camera.position.set(pose.x, pose.y, pose.z);
    if (camera instanceof PerspectiveCamera) {
      camera.fov = pose.fov;
      camera.updateProjectionMatrix();
    }
    controls.current?.target.set(pose.targetX??0, pose.targetY, pose.targetZ??0);
    controls.current?.update();
    invalidate();
  }, [camera, pose.x, pose.y, pose.z, pose.targetX, pose.targetY, pose.targetZ, pose.fov, invalidate]);
  const capture = () => {
    const orbit = controls.current;
    if (!orbit) return;
    onPoseChange({
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
      targetX: orbit.target.x,
      targetY: orbit.target.y,
      targetZ: orbit.target.z,
      fov: camera instanceof PerspectiveCamera ? camera.fov : pose.fov,
    });
  };
  return <OrbitControls ref={controls} makeDefault enablePan enableZoom enableRotate
    minDistance={1.2} maxDistance={15} onEnd={capture} />;
}

export function CameraLivePreviewV291(props: Props) {
  const [error, setError] = useState(false);
  useEffect(()=>setError(false),[props.avatarUrl]);
  return <div className="camera-live-preview-v291">
    <div style={{height:300,background:"radial-gradient(circle at 50% 25%,#283657,#060b18 80%)",borderRadius:12,overflow:"hidden"}}>
      <Canvas camera={{position:[props.pose.x,props.pose.y,props.pose.z],fov:props.pose.fov}} dpr={[1,1.5]}>
        <color attach="background" args={["#0a1020"]}/>
        <ambientLight intensity={.8}/>
        <directionalLight position={[3,5,4]} intensity={2.2}/>
        <pointLight position={[-3,2,2]} color="#55def5" intensity={14}/>
        <pointLight position={[3,3,-2]} color="#f260da" intensity={10}/>
        <gridHelper args={[12,12,"#314b79","#18283c"]} position={[0,-1.25,0]}/>
        <mesh position={[0,-1.18,0]}><cylinderGeometry args={[1.55,1.8,.14,48]}/><meshStandardMaterial color="#273958" metalness={.6} roughness={.35}/></mesh>
        {props.avatarUrl && !error ? <PreviewErrorBoundary key={props.avatarUrl} onError={()=>setError(true)}>
          <Suspense fallback={<NeutralAvatar />}><LoadedAvatar url={props.avatarUrl} motionUrl={props.motionUrl} playing={props.playing} speed={props.speed} seek={props.seek} onMotionProgress={props.onMotionProgress}/></Suspense>
        </PreviewErrorBoundary> : <NeutralAvatar />}
        {props.pathPoints && props.pathPoints.length > 1 && <group>
          <Line points={props.pathPoints.map(p=>[p.x,p.y,p.z] as [number,number,number])} color="#ffbd70" lineWidth={2.5} transparent opacity={.85} />
          <mesh position={[props.pathPoints[0].x, props.pathPoints[0].y, props.pathPoints[0].z]}>
            <sphereGeometry args={[.075,12,12]}/><meshBasicMaterial color="#59e0b8"/>
          </mesh>
          <mesh position={[props.pathPoints[props.pathPoints.length-1].x,props.pathPoints[props.pathPoints.length-1].y,props.pathPoints[props.pathPoints.length-1].z]}>
            <sphereGeometry args={[.075,12,12]}/><meshBasicMaterial color="#ff9a87"/>
          </mesh>
        </group>}
        <PreviewCamera pose={props.pose} onPoseChange={props.onPoseChange}/>
      </Canvas>
    </div>
    <small>Maus ziehen: drehen · Mausrad: zoomen · Rechtsklick ziehen: verschieben. {error ? "Avatar konnte nicht geladen werden; neutrales Modell als Fallback." : props.avatarUrl ? `Vorschau: ${props.avatarLabel || "installierter Avatar"}${props.playing ? " · Motion läuft" : " · pausiert"}.` : "Neutrales Vorschaumodell."}</small>
  </div>;
}
