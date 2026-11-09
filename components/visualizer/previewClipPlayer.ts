import { AnimationClip, AnimationMixer, InterpolateLinear, LoopOnce, PropertyBinding, type AnimationAction, type Object3D } from 'three';

/** Smooth preview changes from the pose actually on screen, including interrupted fades.
 * Snapshot clips are private to this player and released when their fade finishes.
 * Authored clips, the shared GLTF cache and the live stage mixer stay untouched.
 */
export class PreviewClipPlayer {
  private action: AnimationAction | null = null;
  private snapshot: { clip: AnimationClip; action: AnimationAction } | null = null;
  private elapsed = 0;
  private fadeSeconds = 0;

  constructor(private mixer: AnimationMixer, private root: Object3D) {}

  get transitioning() { return this.snapshot !== null; }

  select(clip: AnimationClip, start: number, fadeSeconds: number): AnimationAction {
    if(!Number.isFinite(clip.duration)||clip.duration<=0)throw new RangeError('Animation clip must have a finite positive duration');
    const safeStart=Number.isFinite(start)?Math.max(0,Math.min(clip.duration,start)):0;
    const duration = Number.isFinite(fadeSeconds) ? Math.max(0, Math.min(1.5, fadeSeconds)) : 0;
    // Read before stopping either action: this also captures a rapid A → B → C switch.
    const snapshot = this.action && duration > 0 ? this.capturePose(clip) : null;
    this.action?.stop();
    this.releaseSnapshot();
    this.action = this.mixer.clipAction(clip, this.root);
    this.action.reset().setLoop(LoopOnce, 1);
    this.action.clampWhenFinished = true;
    this.action.time = safeStart;
    this.action.play();
    this.elapsed = 0;
    this.fadeSeconds = duration;
    if (snapshot) {
      const action = this.mixer.clipAction(snapshot, this.root).reset().play();
      action.time = 0;
      this.snapshot = { clip: snapshot, action };
      this.action.setEffectiveWeight(0);
    }
    this.mixer.update(0);
    return this.action;
  }

  /** Set the selected clip clock without advancing or rewinding unrelated mixer actions. */
  update(time: number, delta: number) {
    if (!this.action || !Number.isFinite(time)) return;
    this.action.enabled = true;
    this.action.paused = false;
    this.action.time = Math.max(0, Math.min(this.action.getClip().duration, time));
    if (this.snapshot) {
      this.elapsed += Number.isFinite(delta) ? Math.max(0, delta) : 0;
      const u = Math.min(1, this.elapsed / this.fadeSeconds);
      const weight = u*u*(3-2*u); // zero slope at either end of the blend
      this.action.setEffectiveWeight(weight);
      this.snapshot.action.setEffectiveWeight(1-weight);
      if (u >= 1) this.releaseSnapshot();
    } else this.action.setEffectiveWeight(1);
    this.mixer.update(0);
  }

  seek(time: number) {
    if(!Number.isFinite(time))return;
    this.releaseSnapshot();
    this.update(time, 0);
  }

  dispose() {
    this.releaseSnapshot();
    this.action?.stop();
    this.action = null;
  }

  private capturePose(incoming: AnimationClip): AnimationClip {
    const channels = new Map([...(this.snapshot?.clip.tracks ?? []), ...(this.action?.getClip().tracks ?? []), ...incoming.tracks].map(track => [track.name, track]));
    const tracks = [...channels.values()].map(track => {
      // glTF cubic-spline tracks store tangent/value/tangent triples. The
      // interpolant knows the actual property width; the raw track width does not.
      const sampled = track as typeof track & { createInterpolant(): { valueSize: number } };
      const value = new Float32Array(sampled.createInterpolant().valueSize);
      // Three's runtime exposes getValue after bind; @types/three omits it.
      const binding = new PropertyBinding(this.root, track.name) as PropertyBinding & { getValue(buffer: Float32Array, offset: number): void };
      binding.bind();
      binding.getValue(value, 0);
      binding.unbind();
      const captured = track.clone();
      captured.times = new Float32Array([0, 1]);
      captured.values = new Float32Array([...value, ...value]);
      captured.setInterpolation(InterpolateLinear);
      return captured;
    });
    return new AnimationClip('PrivatePreviewTransitionPose', 1, tracks);
  }

  private releaseSnapshot() {
    if (!this.snapshot) return;
    const { action, clip } = this.snapshot;
    action.stop();
    this.mixer.uncacheAction(clip, this.root);
    this.mixer.uncacheClip(clip);
    this.snapshot = null;
  }
}
