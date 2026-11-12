import type {AvatarModel} from '@/components/visualizer/avatarModels';
/** User-supplied originals; paths stay independent of the built-in Stage Crew. */
export const importedAvatarModels:AvatarModel[]=[
  ["nova-v1", "Nova V1", 20],
  ["jax-v1", "Jax V1", 20],
  ["rae-v1", "Rae V1", 20],
  ["nika-v1", "Nika V1", 20],
  ["kayo-v1", "Kayo V1", 20],
  ["chrome-v1", "Chrome V1", 26],
  ["luma-v1", "Luma V1", 23],
  ["orbit-v1", "Orbit V1", 23],
  ["sol-v1", "Sol V1", 23],
  ["performer-v2", "Performer V2", 12],
  ["vexa-v1", "Vexa V1", 23],
  ["performer-v3", "Performer V3", 20],
  ["pulsebot-v1", "Pulsebot V1", 20],
].map(([slug,label,clips])=>({
 id:`sonic-import-${slug}`,label:String(label),url:`/avatars/imported/sonic-${slug}.glb`,
 preview:`/avatars/imported/sonic-${slug}.png`,category:'Importierte Avatare',
 description:`Importierter Avatar · ${clips} eingebettete Animationen`,
 tags:['GLB',`${clips} Animationen`,'Importiert'],defaultDancePreset:'freestyle' as const,
}));
