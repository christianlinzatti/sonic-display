import type { Mesh, Object3D } from "three";
import type { FacialPoseV369 } from "./facialPerformanceV369";

/** Facial mappings are attached to an avatar's stable library ID, not to Three.js UUIDs. */
export type FacialChannelV370 = keyof FacialPoseV369;
export const FACIAL_CHANNELS_V370: FacialChannelV370[] = [
  "jaw", "wide", "round", "lipsClosed", "smile", "brow", "blink", "cheek", "squint",
];
export const FACIAL_LABELS_V370: Record<FacialChannelV370,string> = {
  jaw:"Kiefer öffnen / A",wide:"Breiter Mund / E, I",round:"Runde Lippen / O, U",
  lipsClosed:"Lippen schließen / M, B, P",smile:"Lächeln",brow:"Augenbrauen",
  blink:"Blinzeln",cheek:"Wangen",squint:"Augen zusammenkneifen",
};
export type FacialProfileV370 = {
  /** 'none' explicitly disables a channel, absence uses automatic matching. */
  mapping?: Partial<Record<FacialChannelV370,string>>;
  /** Per-channel multiplier 0–2 (0–200%). */
  gains?: Partial<Record<FacialChannelV370,number>>;
};
export type FacialTargetV370 = {
  id:string; name:string; meshName:string; mesh:Mesh; index:number;
  suggestion:FacialChannelV370|null; confidence:"high"|"medium"|"none";
};
export type FacialRigScanV370 = {
  targets:FacialTargetV370[];
  jawBone:Object3D|null;
  warnings:string[];
};

/** Recognizes ARKit, Oculus/ReadyPlayerMe, and common VRM-like names; never guesses phonemes from audio. */
export function suggestFacialChannelV370(name:string): {channel:FacialChannelV370|null;confidence:"high"|"medium"|"none"} {
  const n=name.replace(/(?:\.\d{3})$/,"").replace(/[^a-z0-9]/gi,"").toLowerCase();
  const rules: Array<[FacialChannelV370,RegExp]> = [
    ["lipsClosed", /^(?:mouthclose|lipspress|lipsclosed|viseme(?:pp|mbp)|vrcvpp|fclmthclose)$/],
    ["jaw", /^(?:jawopen|mouthopen|viseme(?:aa|ah)|vrcvaa|fclmtha|fclmthaa|aa|ah|open)$/],
    ["round", /^(?:mouthfunnel|mouthpucker|viseme(?:oh|ou|o|u)|vrcvoh|vrcvou|fclmtho|fclmthu)$/],
    ["wide", /^(?:mouthstretch(?:left|right)?|viseme(?:ee|e|i)|vrcvee|vrcvih|fclmthi|fclmthe)$/],
    ["smile", /^(?:mouthsmile(?:left|right)?|smile(?:left|right)?)$/],
    ["brow", /^(?:browinnerup|browouterup(?:left|right)?|eyebrowraise(?:left|right)?)$/],
    ["blink", /^(?:eyeblink(?:left|right)?|blink(?:left|right)?|fcleyeblink(?:left|right)?)$/],
    ["cheek", /^(?:cheeksquint(?:left|right)?|cheekraise(?:left|right)?)$/],
    ["squint", /^(?:eyesquint(?:left|right)?|eyessquint(?:left|right)?)$/],
  ];
  for (const [channel,matcher] of rules) if (matcher.test(n)) return {channel,confidence:"high"};
  // V383: extended VRM 0.x/1.x, Oculus silence, and exporter suffix variants.
  // Single vowels are only medium-confidence since ordinary mesh names may collide.
  const additional: Array<[FacialChannelV370,RegExp,"high"|"medium"]>=[
    ["jaw",/^(?:a|fclmthopen|mouthopenleft|mouthopenright|visemea|vrcva)$/, "medium"],
    ["wide",/^(?:i|e|visemeih|visemee|vrmexpressioni|vrmexpressione)$/, "medium"],
    ["round",/^(?:o|u|visemeu|vrmexpressiono|vrmexpressionu)$/, "medium"],
    ["lipsClosed",/^(?:visemesil|vrcvsil|mouthpressleft|mouthpressright)$/, "high"],
    ["blink",/^(?:blinkl|blinkr|eyeblinkl|eyeblinkr|fcleyeclosel|fcleyecloser|fcleyeclose)$/, "high"],
    ["smile",/^(?:mouthsmilel|mouthsmiler|smilel|smiler|fclmthsmile)$/, "high"],
  ];
  for(const [channel,matcher,confidence] of additional) if(matcher.test(n))return {channel,confidence};
  if (/^(?:viseme|vrcv|fclmth)/.test(n)) {
    if (/(?:aa|ah|jaw|open)/.test(n)) return {channel:"jaw",confidence:"medium"};
    if (/(?:oh|ou|round)/.test(n)) return {channel:"round",confidence:"medium"};
    if (/(?:ee|ih|wide)/.test(n)) return {channel:"wide",confidence:"medium"};
  }
  return {channel:null,confidence:"none"};
}

export function scanFacialRigV370(model:Object3D):FacialRigScanV370 {
  const targets:FacialTargetV370[]=[];
  const warnings:string[]=[];
  const meshCounts=new Map<string,number>();
  let jawBone:Object3D|null=null;
  model.traverse(object=>{
    if (!jawBone && /(?:^|[_.:-])(?:jaw|mandible)(?:$|[_.:-])/i.test(object.name)) jawBone=object;
    const mesh=object as Mesh;
    if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
    const meshName=mesh.name||"unbenannt";
    const occurrence=meshCounts.get(meshName)??0;
    meshCounts.set(meshName,occurrence+1);
    for (const [name,index] of Object.entries(mesh.morphTargetDictionary)) {
      if (!Number.isInteger(index) || index<0 || index>=mesh.morphTargetInfluences.length) continue;
      const suggestion=suggestFacialChannelV370(name);
      // Mesh occurrence is stable across clones from the same asset; unlike mesh.uuid.
      targets.push({id:`${meshName}#${occurrence}::${name}`,name,meshName,mesh,index,
        suggestion:suggestion.channel,confidence:suggestion.confidence});
    }
  });
  if (!targets.length) warnings.push("Dieses Modell enthält keine Morph-Targets.");
  if (!targets.some(t=>t.suggestion==="jaw")&&!jawBone) warnings.push("Kein Mundöffnungs-Morph und kein Kieferknochen erkannt.");
  return {targets,jawBone,warnings};
}
export function bindingsForFacialProfileV370(scan:FacialRigScanV370, profile?:FacialProfileV370) {
  return scan.targets.flatMap(target=>{
    // An explicit remap takes precedence over an automatically guessed channel.
    const selected=FACIAL_CHANNELS_V370.find(c=>profile?.mapping?.[c]===target.id);
    const inferred=target.suggestion;
    const channel=selected ?? (inferred && profile?.mapping?.[inferred]===undefined ? inferred : null);
    return channel ? [{...target,channel,delta:0}] : [];
  });
}
export function facialGainV370(profile:FacialProfileV370|undefined,channel:FacialChannelV370):number {
  const gain=profile?.gains?.[channel];
  return typeof gain==="number"&&Number.isFinite(gain)?Math.min(2,Math.max(0,gain)):1;
}

/** Studio-only simulated articulation. Not speech recognition or a replacement for lyric timing. */
export function sampleFacialDemoV370(seconds:number,style:"rap"|"singing"):Partial<FacialPoseV369> {
  if (!Number.isFinite(seconds)) return {};
  const syllablesPerSecond=style==="rap"?4.1:1.65;
  const phase=Math.max(0,seconds)*syllablesPerSecond;
  const shape=Math.floor(phase)%4;
  const pulse=style==="rap" ? Math.max(0,Math.sin((phase%1)*Math.PI)) : .65+.30*Math.sin(phase*Math.PI*2);
  const blink=Math.max(0,1-Math.abs((Math.max(0,seconds)%4.3)-2.1)*16);
  return {
    jaw: shape===3?0:pulse*(style==="rap"?.72:.86),
    wide:shape===1?pulse*.85:0,
    round:shape===2?pulse*.9:0,
    lipsClosed:shape===3?Math.min(1,pulse+.15):0,
    smile:style==="singing"?.22:.08,
    brow:style==="rap"?.25:.15,
    blink,
  };
}
