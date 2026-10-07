/** Clip-name matching rules. Patterns are matched case-insensitively against GLTF animation names. */
export const animationMapping: Record<string, { playing: RegExp[]; idle: RegExp[] }> = {
  default: { playing: [/dance/i, /move/i, /groove/i], idle: [/idle/i, /stand/i, /rest/i] },
  hardstyle: { playing: [/head.?bang/i, /hardstyle/i, /dance/i, /stomp/i], idle: [/idle/i, /rest/i] },
  techno: { playing: [/techno/i, /groove/i, /dance/i, /move/i], idle: [/idle/i, /rest/i] },
  hiphop: { playing: [/hip.?hop/i, /break/i, /bounce/i, /dance/i], idle: [/idle/i, /rest/i] },
  rock: { playing: [/head.?bang/i, /rock/i, /air.?guitar/i, /dance/i], idle: [/idle/i, /rest/i] },
  ambient: { playing: [/sway/i, /breath/i, /float/i], idle: [/idle/i, /rest/i] },
  pop: { playing: [/pop/i, /dance/i, /groove/i], idle: [/idle/i, /rest/i] },
};
