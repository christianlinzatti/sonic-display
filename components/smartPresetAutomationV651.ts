/** V651: conservative, deterministic automatic preset recommendation policy.
 * Confidence is the heuristic 0..100 score returned by existing genre detection,
 * not a calibrated probability or an audio-derived classification.
 */
import {FACTORY_PRESETS_V650,type ConcertPresetV650} from "./concertPresetsV650";

export type SmartPresetModeV651="off"|"suggest"|"auto";
export const SMART_PRESET_MODE_KEY_V651="sonic-display:v651:smart-preset-mode";
export const SMART_PRESET_STABLE_MS_V651=900;
export const SMART_PRESET_AUTO_WINDOW_MS_V651=12000;
const genrePresets:Record<string,string>={
 deutschrap:"builtin:deutschrap",hiphop:"builtin:deutschrap",trap:"builtin:deutschrap",drill:"builtin:deutschrap",boombap:"builtin:deutschrap",rnb:"builtin:deutschrap",
 hardtekk:"builtin:hardtekk",uptempo:"builtin:hardtekk",
 hardstyle:"builtin:hardstyle",rawstyle:"builtin:hardstyle",hardcore:"builtin:hardstyle",
 rock:"builtin:rock",metal:"builtin:rock",poprock:"builtin:rock",indierock:"builtin:rock",alternativerock:"builtin:rock",punkrock:"builtin:rock",
 pop:"builtin:pop",indiepop:"builtin:pop",electropop:"builtin:pop",dancepop:"builtin:pop",
};
export type SmartPresetEvidenceV651={trackId:string|null|undefined;genre:string|null;
 genreStatus:"idle"|"loading"|"detected"|"unknown"|"error";genreSource:"track"|"artist"|"manual"|null;
 genreOverride:string|null;genreConfidence:number;isPlaying:boolean;progressMs:number;
 mode:SmartPresetModeV651;lockedTrackId?:string|null;alreadyAppliedTrackId?:string|null;autoSkipTrackId?:string|null};
export type SmartPresetDecisionV651={preset:ConcertPresetV650|null;canSuggest:boolean;canAutoApply:boolean;reason:string;score:number};
export function isSmartPresetModeV651(value:unknown):value is SmartPresetModeV651{
 return value==="off"||value==="suggest"||value==="auto";
}
export function decideSmartPresetV651(e:SmartPresetEvidenceV651):SmartPresetDecisionV651{
 const no=(reason:string,score=0):SmartPresetDecisionV651=>({preset:null,canSuggest:false,canAutoApply:false,reason,score});
 if(e.mode==="off")return no("Automatik ist ausgeschaltet.");
 if(!e.trackId)return no("Kein Song verfügbar.");
 if(e.lockedTrackId===e.trackId)return no("Manuelle Steuerung hat für diesen Song Vorrang.");
 if(e.alreadyAppliedTrackId===e.trackId)return no("Profil für diesen Song bereits angewendet.");
 if(e.genreOverride||e.genreSource==="manual")return no("Manuelle Genre-Korrektur: Profil selbst auswählen.");
 if(e.genreStatus!=="detected"||!e.genre||!e.genreSource)return no("Genre noch nicht zuverlässig erkannt.");
 if(!Number.isFinite(e.genreConfidence)||e.genreConfidence<0||e.genreConfidence>100)return no("Ungültiger Vertrauenswert.");
 const needed=e.genreSource==="track"?80:88;
 if(e.genreConfidence<needed)return no(`Genre-Hinweis zu unsicher (mindestens ${needed} Punkte erforderlich).`,e.genreConfidence);
 const presetId=Object.hasOwn(genrePresets,e.genre)?genrePresets[e.genre]:undefined;
 const preset=FACTORY_PRESETS_V650.find(p=>p.id===presetId)??null;
 if(!preset)return no("Für dieses Genre gibt es noch keine passende Konzertvorlage.",e.genreConfidence);
 const canAutoApply=e.mode==="auto"&&e.isPlaying&&Number.isFinite(e.progressMs)&&e.progressMs>=0&&e.progressMs<=SMART_PRESET_AUTO_WINDOW_MS_V651&&e.autoSkipTrackId!==e.trackId;
 return {preset,canSuggest:true,canAutoApply,reason:e.mode==="suggest"?"Vorschlag – nichts wird automatisch verändert.":canAutoApply?"Neuer Song · hoher Genre-Vertrauenswert.":"Nur Vorschlag: automatische Anwendung ausschließlich am Songanfang bei Wiedergabe.",score:e.genreConfidence};
}
