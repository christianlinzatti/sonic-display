/** V775: static transforms, expressed in the original stage-local coordinates.
 * One draw batch per shape/material family; no per-frame allocation or updates.
 */
export type StageInstanceV775 = Readonly<{
  position: readonly [number, number, number];
  scale?: readonly [number, number, number];
  rotationZ?: number;
}>;

export const VAPORWAVE_BARS_V775: readonly StageInstanceV775[] = Array.from({length: 9}, (_, i) => ({
  position: [0, -.9 + i * .24, -6.9] as const,
  scale: [5, .05, .06] as const,
}));

export const VAPORWAVE_PALM_TRUNKS_V775: readonly StageInstanceV775[] = [-4, 4].map(x => ({
  position: [x, -.85, -3] as const,
}));

export const VAPORWAVE_PALM_LEAVES_V775: readonly StageInstanceV775[] = [-4, 4].flatMap(x =>
  [-.5, 0, .5].map(a => ({
    position: [x + a, .35, -3.15] as const,
    rotationZ: -a * .65,
  })));

export const ROCK_AMP_PANELS_V775: readonly StageInstanceV775[] = [-3.7, 3.7].flatMap(x =>
  [-1.3, .3, 1.9].map(y => ({
    position: [x, y, -1.8] as const,
    scale: [1, .7, .25] as const,
  })));

export const ROCK_TRUSS_POSTS_V775: readonly StageInstanceV775[] = [-3.7, 3.7].map(x => ({
  position: [x, .7, -2] as const,
  scale: [.22, 5.2, .22] as const,
}));

export const ROCK_TRUSS_HOUSINGS_V775: readonly StageInstanceV775[] = [-2.6, 0, 2.6].map(x => ({
  position: [x, 2.72, -1.8] as const,
}));

export const CYBERPUNK_TOWER_LEDS_V775: readonly StageInstanceV775[] = [0, .8, 1.6].map(y => ({
  position: [0, y - 1, .15] as const,
  scale: [.28, .06, .09] as const,
}));

export const CYBERPUNK_SIDE_NEONS_V775: readonly StageInstanceV775[] = [-2.5, 2.5].map(x => ({
  position: [x, .2, -2.65] as const,
  scale: [.065, 4.1, .1] as const,
}));
