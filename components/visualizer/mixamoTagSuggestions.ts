/** Conservative, user-confirmed labels for Mixamo motions.
 * Never infer BPM from a clip title or overwrite manually curated metadata.
 */
import type {InstalledCharacterMotion} from "./characterMotionLibrary";
import {suggestMotionCategoryV535} from "./motionLibraryIntelligenceV535";

export type MixamoSuggestedGenre = "deutschrap" | "hardtekk" | "hardstyle";
export type MixamoSuggestedCategory = "rap" | "energetic" | "dance";
export type MixamoMotionSuggestion = {
  genre: MixamoSuggestedGenre;
  category: MixamoSuggestedCategory;
  reason: string;
};

const contains = (name: string, terms: RegExp) => terms.test(name);

export function suggestMixamoMotionTags(name: string): MixamoMotionSuggestion | null {
  if (typeof name !== "string" || !/mixamo/i.test(name)) return null;
  // Normalize separators and mixed-case Mixamo exported names. Avoid matching
  // 'rap' inside unrelated words or confusing Hardtekk with Hardstyle.
  const words = name.replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const rap = contains(words, /\b(rap|deutschrap|hip hop|hiphop|boombap|boom bap|swagger|breakdance)\b/);
  const tekk = contains(words, /\b(hardtekk|hardtek|tekk|hakken|hakkuh|gabber|footwork)\b/);
  const hard = contains(words, /\b(hardstyle|jumpstyle|rawstyle|hard dance)\b/);
  // Neutral bounce, stomp, kick, groove, dance and shuffle may fit multiple
  // genres. If multiple explicit genres appear, don't guess.
  if (Number(rap) + Number(tekk) + Number(hard) !== 1) return null;
  if (rap) return {genre:"deutschrap",category:"rap",reason:"Rap-/Hip-Hop-Motiv im Dateinamen"};
  if (tekk) return {genre:"hardtekk",category:"energetic",reason:"Hakken-/Hardtekk-Footwork im Dateinamen"};
  return {genre:"hardstyle",category:"energetic",reason:"Jumpstyle-/Hardstyle-Motiv im Dateinamen"};
}

/** Apply only explicit, unambiguous hints to one avatar's untagged motions.
 * A copy is returned; saved user BPM/sections, category overrides and other
 * avatars are not modified.
 */
export function applyMixamoTagSuggestions(
  motions:readonly InstalledCharacterMotion[], avatarId:string,
):{motions:InstalledCharacterMotion[];changed:number}{
  let changed=0;
  const updated=motions.map(m=>{
    if(m.avatarId!==avatarId||m.genre)return m;
    const hint=suggestMixamoMotionTags(m.name);
    if(!hint)return m;
    changed++;
    const automaticCategory=suggestMotionCategoryV535(m.name);
    return {...m,genre:hint.genre,category:!m.category||m.category===automaticCategory?hint.category:m.category};
  });
  return {motions:updated,changed};
}
