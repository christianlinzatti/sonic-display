export const MOTION_DEBUG_EVENT = 'sonic:motion-debug-controls';
export type MotionDebugLayer = 'head' | 'torso' | 'arms' | 'legs' | 'expression' | 'physics';
export type MotionDebugSettings = { skeleton: boolean; layers: Record<MotionDebugLayer, boolean>; weights?: Record<MotionDebugLayer, number> };
export const DEFAULT_MOTION_DEBUG: MotionDebugSettings = { skeleton: false, layers: {head:true,torso:true,arms:true,legs:true,expression:true,physics:true} };
export const DEFAULT_LAYER_WEIGHTS: Record<MotionDebugLayer, number> = {head:1,torso:1,arms:1,legs:1,expression:1,physics:1};
let current: MotionDebugSettings = {skeleton:false,layers:{...DEFAULT_MOTION_DEBUG.layers},weights:{...DEFAULT_LAYER_WEIGHTS}};
export function readMotionDebugSettings(): MotionDebugSettings { return { skeleton: current.skeleton, layers: {...current.layers}, weights: {...DEFAULT_LAYER_WEIGHTS,...current.weights} }; }
export function setMotionDebugSettings(settings: MotionDebugSettings) {
  const weights = {...DEFAULT_LAYER_WEIGHTS};
  for (const layer of Object.keys(weights) as MotionDebugLayer[]) {
    const input = settings.weights?.[layer];
    weights[layer] = typeof input === 'number' && Number.isFinite(input) ? Math.max(0,Math.min(1.5,input)) : 1;
  }
  cancelMotionPresetMorph();
  current = {skeleton:!!settings.skeleton,layers:{...settings.layers},weights};
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(MOTION_DEBUG_EVENT));
}
/** Render-loop access avoids allocating a settings clone on every animation frame. */
export function getRuntimeMotionSettings(): Readonly<MotionDebugSettings> { return current; }
export function filterMotionDebugLayers<T extends Record<string, number>>(motion: T, settings: MotionDebugSettings): T {
  const result = {...motion};
  const keys: Record<MotionDebugLayer,string[]> = {
    head:['headNod','headTurn','headLag'],torso:['spineSway','hipSway','shoulderRoll','chestPulse','weightShift'],
    arms:['armSwing','followThrough','leftArmAccent','rightArmAccent'],legs:['legGroove','footStep','kneeFollow'],
    expression:['expressionJaw','expressionBrow','expressionEyeNarrow','expressionHeadTilt'],
    physics:['torsoTwist','counterArm','hipCounter','headCounter']
  };
  // Each channel has one owner to avoid multiplying overlapping effects twice.
  for (const layer of Object.keys(keys) as MotionDebugLayer[]) {
    const gain = settings.layers[layer] ? (settings.weights?.[layer] ?? 1) : 0;
    for (const key of keys[layer]) if (key in result) {
      const value = (result as Record<string, number>)[key];
      (result as Record<string, number>)[key] = Number.isFinite(value) ? value * gain : 0;
    }
  }
  return result;
}

/** V120: time-based, interruptible transitions shared by manual and automatic presets. */
let runtimePresets: import("./motionLayerPresets").MotionLayerPreset[] = [];
let autoPresetEnabled = false;
let currentTrackGenre = "";
let activePresetId = "";
let morphDuration = 2.5;
let morphElapsed = 0;
let morphStart: Record<MotionDebugLayer, number> = {...DEFAULT_LAYER_WEIGHTS};
let morphTarget: Record<MotionDebugLayer, number> = {...DEFAULT_LAYER_WEIGHTS};
let morphing = false;
export const MORPH_DURATION_STORAGE_KEY = "sonic-motion-morph-duration-v120";
export function configureMotionMorphDuration(seconds: number) {
  morphDuration = Number.isFinite(seconds) ? Math.min(12, Math.max(0, seconds)) : 2.5;
}
export function motionMorphStatus() {
  return { active: morphing, duration: morphDuration, progress: morphing ? Math.min(1, morphElapsed / Math.max(.001, morphDuration)) : 1, presetId: activePresetId };
}
export function transitionToMotionPreset(preset: import("./motionLayerPresets").MotionLayerPreset, duration = morphDuration) {
  const normalized = Number.isFinite(duration) ? Math.max(0, Math.min(12, duration)) : morphDuration;
  const next = {...DEFAULT_LAYER_WEIGHTS, ...preset.weights};
  const weights = current.weights ?? DEFAULT_LAYER_WEIGHTS;
  if (activePresetId === preset.id && Object.keys(next).every(k => next[k as MotionDebugLayer] === morphTarget[k as MotionDebugLayer])) return;
  activePresetId = preset.id;
  morphStart = {...weights};
  morphTarget = next;
  morphElapsed = 0;
  morphDuration = normalized;
  morphing = normalized > 0;
  if (!morphing) setMotionDebugSettings({...current,weights:{...next}});
}
/** Called only from the avatar render loop, so interpolation is independent of React rerenders. */
export function updateMotionPresetMorph(delta: number) {
  if (!morphing || !Number.isFinite(delta) || delta <= 0) return;
  morphElapsed = Math.min(morphDuration, morphElapsed + Math.min(delta, .1));
  const t = Math.min(1, morphElapsed / Math.max(.001, morphDuration));
  const eased = t * t * (3 - 2 * t);
  const weights = {...DEFAULT_LAYER_WEIGHTS};
  for (const k of Object.keys(weights) as MotionDebugLayer[]) weights[k] = morphStart[k] + (morphTarget[k] - morphStart[k]) * eased;
  current = {...current,weights}; // no DOM event on each frame
  if (t >= 1) morphing = false;
}
export function cancelMotionPresetMorph() { morphing = false; activePresetId = ""; }
export function configureMotionAutoPresets(presets: import("./motionLayerPresets").MotionLayerPreset[], enabled: boolean) {
  runtimePresets = presets;
  autoPresetEnabled = enabled;
  if (enabled) applyMotionPresetForGenre(currentTrackGenre);
}
export function applyMotionPresetForGenre(genre: string | null | undefined) {
  currentTrackGenre = genre ?? "";
  if (!autoPresetEnabled) return;
  const g=currentTrackGenre.toLowerCase();
  const key = /hardtekk|hard.?tekk/.test(g) ? "hardtekk" : /hardstyle|hardcore|rawstyle/.test(g) ? "hardstyle" : /trap|drill/.test(g) ? "trap" : /deutschrap|german rap|deutsch.?hip.?hop/.test(g) ? "deutschrap" : /hip.?hop|rap/.test(g) ? "hiphop" : /techno/.test(g) ? "techno" : "any";
  const chosen = key === "any" ? null : runtimePresets.find(p=>p.genre===key);
  if (chosen) transitionToMotionPreset(chosen);
}
