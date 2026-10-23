"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Bone, Euler, Quaternion, Vector3 } from "three";
import { diagnosticsForRig, proposeJointLimits, type AxisDiagnostic } from "./anatomicalAxisDiagnostics";
import { DEFAULT_JOINT_LIMITS, jointConstraintKey, normalizeConstraintMap, setJointAxis, type JointAxis, type JointConstraintMap, type JointLimits } from "./jointConstraintCalibration";
import { clone as cloneSkinnedScene } from "three/examples/jsm/utils/SkeletonUtils.js";

const SLOTS = ["head","neck","spine","chest","hips","leftArm","rightArm","leftForearm","rightForearm","leftHand","rightHand","leftLeg","rightLeg","leftFoot","rightFoot"] as const;
type Slot = typeof SLOTS[number];
type Overrides = Partial<Record<Slot, string>>;
export const skeletonCalibrationKey = (url: string) => `sonic-display:v152:skeleton:${url}`;

function RigScene({url, selected, onSelect, overrides, constraints, onDiagnostics, showAxes}: {url: string; selected: string; onSelect: (name: string) => void; overrides: Overrides; constraints: JointConstraintMap; onDiagnostics: (values: AxisDiagnostic[]) => void; showAxes: boolean}) {
  const gltf = useGLTF(url);
  const model = useMemo(() => cloneSkinnedScene(gltf.scene), [gltf.scene]);
  // Preview is applied to a cloned GLB, never to the source asset. Rest poses
  // are cached to prevent accumulating rotations on every slider change.
  const rest = useMemo(() => {
    const values = new Map<string, Quaternion>();
    model.traverse(node => { if (node instanceof Bone) values.set(node.uuid, node.quaternion.clone()); });
    return values;
  }, [model]);
  useEffect(() => {
    model.traverse(node => {
      if (!(node instanceof Bone)) return;
      const original = rest.get(node.uuid);
      if (!original) return;
      node.quaternion.copy(original);
      const angles = constraints[node.name];
      if (angles) node.quaternion.multiply(new Quaternion().setFromEuler(new Euler(angles.x.preview*Math.PI/180, angles.y.preview*Math.PI/180, angles.z.preview*Math.PI/180, "XYZ")));
    });
    model.updateWorldMatrix(true, true);
  }, [model, constraints, rest]);
  const bones = useMemo(() => {
    model.updateWorldMatrix(true, true);
    const rootPosition = model.getWorldPosition(new Vector3());
    const result: {name: string; position: [number,number,number]; parent: [number,number,number] | null}[] = [];
    model.traverse(node => {
      if (!(node instanceof Bone)) return;
      const position = node.getWorldPosition(new Vector3()).sub(rootPosition);
      const parent = node.parent instanceof Bone ? node.parent.getWorldPosition(new Vector3()).sub(rootPosition) : null;
      result.push({name: node.name, position: [position.x,position.y,position.z], parent: parent ? [parent.x,parent.y,parent.z] : null});
    });
    return result;
  }, [model, constraints]);
  const diagnostics = useMemo(() => diagnosticsForRig(model), [model]);
  useEffect(() => { onDiagnostics(diagnostics); }, [diagnostics, onDiagnostics]);
  const axisLines = useMemo(() => {
    model.updateWorldMatrix(true, true);
    const origin = model.getWorldPosition(new Vector3());
    const mapped = new Map<string, {start: Vector3; end: Vector3; confidence: number}>();
    model.traverse(node => {
      if (!(node instanceof Bone)) return;
      const d = diagnostics.find(value => value.bone === node.name);
      if (!d) return;
      const start = node.getWorldPosition(new Vector3()).sub(origin);
      const direction = new Vector3(...d.axis).transformDirection(node.matrixWorld);
      mapped.set(node.name, {start, end: start.clone().addScaledVector(direction, 0.3), confidence: d.confidence});
    });
    return mapped;
  }, [model, diagnostics, constraints]);
  const selectedNames = useMemo(() => new Set(Object.values(overrides)), [overrides]);
  return <>
    <ambientLight intensity={1.5}/><directionalLight position={[4,6,5]} intensity={2}/>
    <primitive object={model}/>
    {bones.map((bone,index) => <group key={`${bone.name}-${index}`}>
      {bone.parent && <line><bufferGeometry attach="geometry" onUpdate={geometry => geometry.setFromPoints([new Vector3(...bone.parent!),new Vector3(...bone.position)])}/><lineBasicMaterial attach="material" color="#fbbf24" depthTest={false} transparent opacity={0.85}/></line>}
      <mesh position={bone.position} onPointerDown={(event: ThreeEvent<PointerEvent>) => {event.stopPropagation(); onSelect(bone.name);}}>
        <sphereGeometry args={[selected === bone.name ? 0.055 : 0.035, 10, 8]}/>
        <meshBasicMaterial color={selected === bone.name ? "#f43f5e" : selectedNames.has(bone.name) ? "#22c55e" : "#38bdf8"} depthTest={false}/>
      </mesh>
    </group>)}
    {showAxes && [...axisLines.entries()].filter(([name]) => name === selected).map(([name, line]) => <group key={`axis-${name}`}>
      <line><bufferGeometry attach="geometry" onUpdate={geometry => geometry.setFromPoints([line.start,line.end])}/><lineBasicMaterial attach="material" color={line.confidence >= 0.5 ? "#22c55e" : "#fb923c"} depthTest={false}/></line>
      <mesh position={line.end}><sphereGeometry args={[0.035, 10, 8]}/><meshBasicMaterial color="#22c55e" depthTest={false}/></mesh>
    </group>)}
    <OrbitControls makeDefault enableDamping/>
  </>;
}

/** Select bones in the preview and save per-URL diagnostic overrides without changing GLB source files. */
export function AvatarSkeletonEditor({modelUrl}: {modelUrl: string | null}) {
  const [selected, setSelected] = useState("");
  const [slot, setSlot] = useState<Slot>("head");
  const [overrides, setOverrides] = useState<Overrides>({});
  const [error, setError] = useState("");
  const [constraints, setConstraints] = useState<JointConstraintMap>({});
  const [diagnostics, setDiagnostics] = useState<AxisDiagnostic[]>([]);
  const [showAxes, setShowAxes] = useState(true);
  useEffect(() => {
    setSelected(""); setError(""); setDiagnostics([]);
    if (!modelUrl) {setOverrides({});setConstraints({});return;}
    try {setConstraints(normalizeConstraintMap(JSON.parse(localStorage.getItem(jointConstraintKey(modelUrl)) || "{}")));} catch {setConstraints({});}
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(skeletonCalibrationKey(modelUrl)) || "{}");
      const safe: Overrides = {};
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        for (const name of SLOTS) {
          const candidate = (parsed as Record<string,unknown>)[name];
          if (typeof candidate === "string" && candidate.length < 256) safe[name] = candidate;
        }
      }
      setOverrides(safe);
    } catch {setOverrides({});}
  }, [modelUrl]);
  const save = (next: Overrides) => {
    if (!modelUrl) return;
    setOverrides(next);
    try {localStorage.setItem(skeletonCalibrationKey(modelUrl), JSON.stringify(next));}
    catch {setError("Kalibrierung konnte nicht lokal gespeichert werden.");}
  };
  const saveConstraints = (next: JointConstraintMap) => {
    if (!modelUrl) return;
    const safe = normalizeConstraintMap(next);
    setConstraints(safe);
    try { localStorage.setItem(jointConstraintKey(modelUrl), JSON.stringify(safe)); window.dispatchEvent(new Event("sonic:joint-constraints-changed")); }
    catch { setError("Gelenkgrenzen konnten nicht gespeichert werden."); }
  };
  const selectedDiagnostic = diagnostics.find(d => d.bone === selected);
  const current: JointLimits = selected ? constraints[selected] || DEFAULT_JOINT_LIMITS : DEFAULT_JOINT_LIMITS;
  const updateAxis = (axis: JointAxis, field: "min" | "max" | "preview", value: number) => {
    if (!selected) return;
    saveConstraints({...constraints, [selected]:setJointAxis(current, axis, field, value)});
  };
  return <section className="retargeting-studio">
    <p>V152: Klicke auf einen Bone-Punkt, wähle den anatomischen Slot und speichere die Zuordnung. Blau = Bone, Grün = zugeordnet, Rot = ausgewählt. Die GLB-Datei wird nicht geändert.</p>
    {!modelUrl ? <p>Bitte einen GLB-Avatar auswählen.</p> : <>
      <div style={{height:330,background:"#101323",borderRadius:10,overflow:"hidden"}}>
        <Canvas camera={{position:[0,1.1,3.7],fov:45}}>
          <Suspense fallback={null}>
            <RigScene key={modelUrl} url={modelUrl} selected={selected} onSelect={setSelected} overrides={overrides} constraints={constraints} onDiagnostics={setDiagnostics} showAxes={showAxes}/>
          </Suspense>
        </Canvas>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8,alignItems:"center"}}>
        <label><input type="checkbox" checked={showAxes} onChange={e => setShowAxes(e.target.checked)}/> Erkannte Gelenkachse anzeigen</label>
        <span>{diagnostics.length} automatisch erkannte Gelenkachsen</span>
      </div>
      <div style={{maxHeight:140,overflowY:"auto",marginTop:8}}><table><thead><tr><th>Gelenk</th><th>Typ</th><th>Sicherheit</th><th>Achse</th></tr></thead><tbody>{diagnostics.map(d => <tr key={d.bone} onClick={() => setSelected(d.bone)} style={{cursor:"pointer"}}><td>{d.bone}</td><td>{d.kind}</td><td>{Math.round(d.confidence * 100)}%</td><td>{d.suggestedAxis?.toUpperCase() ?? "unklar"}</td></tr>)}</tbody></table></div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:12,alignItems:"center"}}>
        <label>Landmark <select value={slot} onChange={e=>setSlot(e.target.value as Slot)}>{SLOTS.map(name=><option key={name} value={name}>{name}</option>)}</select></label>
        <span>Bone: {selected || "Bitte im 3D-Bild auswählen"}</span>
        <button type="button" disabled={!selected} onClick={()=>save({...overrides,[slot]:selected})}>Bone zuordnen</button>
        <button type="button" onClick={()=>{const next={...overrides};delete next[slot];save(next);}}>Slot zurücksetzen</button>
      </div>
      <div style={{maxHeight:170,overflowY:"auto",marginTop:10}}><table><thead><tr><th>Landmark</th><th>Manuell gewählter Bone</th></tr></thead><tbody>{SLOTS.map(name=><tr key={name}><td>{name}</td><td>{overrides[name] || "automatisch"}</td></tr>)}</tbody></table></div>
      <div style={{marginTop:14,padding:12,border:"1px solid #526078",borderRadius:8}}>
        <strong>V153 – Gelenkrotation und Winkelgrenzen (lokale XYZ-Achsen)</strong>
        {!selected ? <p>Wähle einen Bone in der 3D-Ansicht.</p> : <>
          <p>Gewählter Bone: <strong>{selected}</strong>. Winkel sind in Grad und beziehen sich auf die lokale Bone-Ruhepose.</p>
          {selectedDiagnostic && <div style={{padding:8,border:"1px solid #526078",borderRadius:6}}>
            <strong>V156 – automatische Gelenkachsen-Diagnose</strong>
            <p>{selectedDiagnostic.kind}: Achse [{selectedDiagnostic.axis.map(v => v.toFixed(2)).join(", ")}], Konfidenz {Math.round(selectedDiagnostic.confidence*100)}%, empfohlenes IK-Delta ±{selectedDiagnostic.maxDeltaDegrees}°.</p>
            {selectedDiagnostic.warning && <p role="status">{selectedDiagnostic.warning}</p>}
            <button type="button" disabled={!proposeJointLimits(selectedDiagnostic)} onClick={() => {
              const suggestion = proposeJointLimits(selectedDiagnostic);
              if (suggestion && window.confirm(`V156: Grenzen für ${selected} übernehmen? Vorhandene manuelle Grenzen dieses Gelenks werden ersetzt.`)) saveConstraints({...constraints,[selected]:suggestion});
            }}>Vorschlag für dieses Gelenk übernehmen</button>
            <p>Vorschläge werden erst nach Bestätigung gespeichert. Dies sind IK-Korrekturgrenzen, keine anatomisch validierten Gelenkgrenzen.</p>
          </div>}
          {(["x","y","z"] as JointAxis[]).map(axis => <div key={axis} style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginTop:8}}>
            <strong style={{width:20}}>{axis.toUpperCase()}</strong>
            {(["min","max","preview"] as const).map(field => <label key={field} style={{display:"flex",gap:4,alignItems:"center"}}>
              {field === "min" ? "Minimum" : field === "max" ? "Maximum" : "Vorschau"}
              <input type="number" min={-180} max={180} step={1} value={current[axis][field]} style={{width:72}} onChange={e=>updateAxis(axis,field,Number(e.target.value))}/>
            </label>)}
            <input aria-label={`${axis.toUpperCase()} Vorschau`} type="range" min={current[axis].min} max={current[axis].max} step={1} value={current[axis].preview} onChange={e=>updateAxis(axis,"preview",Number(e.target.value))}/>
          </div>)}
          <button type="button" onClick={()=>{const next={...constraints};delete next[selected];saveConstraints(next);}}>Gelenk zurücksetzen</button>
          <button type="button" onClick={()=>saveConstraints({})}>Alle Gelenkgrenzen zurücksetzen</button>
        </>}
        <p>Die Rotationsvorschau gilt nur im Editor. Die IK-Laufzeit-Solver berücksichtigen gespeicherte Grenzen bei zusätzlichen IK-Korrekturen; importierte Tanzclips bleiben unverändert.</p>
      </div>
      <button type="button" onClick={()=>save({})}>Alle Zuordnungen zurücksetzen</button>
      <button type="button" onClick={()=>{
        const blob = new Blob([JSON.stringify({version:156,modelUrl,overrides,constraints,anatomicalAxes:diagnostics},null,2)],{type:"application/json"});
        const href=URL.createObjectURL(blob); const link=document.createElement("a"); link.href=href;link.download="sonic-skeleton-calibration-v156.json";link.click();setTimeout(()=>URL.revokeObjectURL(href),1000);
      }}>Kalibrierung exportieren</button>
      {error && <p role="alert">{error}</p>}
      <p>Hinweis: Zuordnungen sind modellbezogene Diagnose-Einstellungen. Gelenkwinkel und IK-Ketten werden dadurch noch nicht automatisch verändert.</p>
    </>}
  </section>;
}
