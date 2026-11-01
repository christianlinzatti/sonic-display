import { BufferGeometry, Color, Float32BufferAttribute } from "three";

/**
 * Deterministic, compact GPU star field. One geometry replaces hundreds of
 * separate SphereGeometry/Mesh/Material instances in the live Galaxy stage.
 * No random state, textures, frame-loop allocations or global GPU caches.
 */
export function createGalaxyStarfieldV766(count: number): BufferGeometry {
  const n = Math.max(0, Math.floor(Number.isFinite(count) ? count : 0));
  const positions = new Float32Array(n * 3);
  const colors = new Float32Array(n * 3);
  const sizes = new Float32Array(n);
  const palette = [new Color("#86b6ff"), new Color("#f9d1ff"), new Color("#ffffff")];

  for (let i = 0; i < n; i++) {
    const angle = i * 2.399963;
    const radius = 2.5 + Math.sqrt(i / n) * 11;
    const offset = i * 3;
    positions[offset] = Math.cos(angle) * radius;
    positions[offset + 1] = Math.sin(i * 19.17) * 5;
    positions[offset + 2] = Math.sin(angle) * radius - 5;
    const color = palette[i % 3];
    colors[offset] = color.r;
    colors[offset + 1] = color.g;
    colors[offset + 2] = color.b;
    sizes[i] = i % 9 === 0 ? 0.045 : 0.02;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.setAttribute("starSize", new Float32BufferAttribute(sizes, 1));
  geometry.computeBoundingSphere();
  return geometry;
}
