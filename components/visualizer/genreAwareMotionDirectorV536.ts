/** V536: deterministic, allocation-bounded genre director over ALREADY AVAILABLE actions.
 * Takes optional V535 metadata, never creates or rewrites a clip/GLB, never infers the singer.
 */
import {mixamoGenreBias,isMixamoMotion} from "./mixamoMotionDirector";
import {mixamoShowCue,mixamoShowCueBias} from "./mixamoShowChoreography";

export type GenreMotionCategoryV536 = 'idle' | 'rap' | 'dance' | 'energetic' | 'gesture' | 'locomotion' | 'other';
export type GenreMotionCandidateV536 = {
  name: string; label: string; duration: number; trackCount: number;
  source: 'embedded' | 'shared' | 'library';
  category: GenreMotionCategoryV536;
  favorite?: boolean;
  // Optional user-defined eligibility from the existing Motion Library.
  // Embedded/shared clips have no such metadata and keep legacy behavior.
  taggedGenre?: string; bpmMin?: number; bpmMax?: number;
  assignedSection?: 'any'|'build'|'drop'|'verse'|'hook';
};
export type GenreMotionInputV536 = {
  clips: readonly GenreMotionCandidateV536[];
  trackId: string | null | undefined; modelKey: string;
  progressMs: number | null | undefined;
  section: string | null | undefined; genre: string | null | undefined;
  bpm: number | null | undefined; energy: number | null | undefined;
  slot: number; ensembleCount?: number; playing: boolean; reducedMotion: boolean; manualPriority: boolean;
};
export type GenreMotionStateV536 = {
  trackId: string; modelKey: string; selectedName: string | null;
  lastPositionMs: number; lastSwitchMs: number; lastPhrase: string;
  recent: readonly string[];
};
export const newGenreMotionStateV536 = (): GenreMotionStateV536 => ({
  trackId:'',modelKey:'',selectedName:null,lastPositionMs:0,lastSwitchMs:-Infinity,lastPhrase:'',recent:[],
});
const clamp = (n:number|null|undefined,fallback:number,min:number,max:number) =>
  typeof n==='number' && Number.isFinite(n) ? Math.max(min,Math.min(max,n)) : fallback;
function hash(input:string):number {
  let h=2166136261;
  for(let i=0;i<input.length;i++)h=Math.imul(h^input.charCodeAt(i),16777619);
  return h>>>0;
}
export type GenreMotionFamilyV536 = 'rap'|'hardstyle'|'hardtekk'|'rock'|'pop'|'general';
export type GenreMotionSectionV536 = 'quiet'|'verse'|'hook'|'drop';
export function motionFamilyV536(value:string|null|undefined):GenreMotionFamilyV536 {
  const s=(value??'').toLowerCase();
  if(/hardtekk|hard.?tekk|tekk|tekno/.test(s))return 'hardtekk';
  if(/hardstyle|rawstyle|hardcore|gabber|hard.?dance|uptempo|hard.?techno|rave/.test(s))return 'hardstyle';
  if(/deutschrap|hip[\s_-]?hop|trap|drill|boom.?bap|rap|r[&n]b|cloudrap/.test(s))return 'rap';
  if(/rock|metal|punk/.test(s))return 'rock';
  if(/pop/.test(s))return 'pop';
  return 'general';
}
export function motionSectionV536(value:string|null|undefined):GenreMotionSectionV536 {
  const s=(value??'').toLowerCase();
  if(/intro|outro|break|bridge|ambient|quiet|interlude|pause/.test(s))return 'quiet';
  if(/drop|climax|peak|build.?up/.test(s))return 'drop';
  if(/hook|chorus|refrain/.test(s))return 'hook';
  return 'verse';
}
export function validGenreCandidateV536(c:GenreMotionCandidateV536):boolean {
  return !!c && typeof c.name==='string' && !!c.name.trim() &&
    typeof c.label==='string' && !!c.label.trim() &&
    Number.isFinite(c.duration) && c.duration>=0.35 && c.duration<=180 &&
    Number.isFinite(c.trackCount) && c.trackCount>0 &&
    (c.source==='embedded'||c.source==='shared'||c.source==='library');
}
const norm=(value:string)=>value.toLowerCase().replace(/[\s_-]+/g,'');
/** Never let automatic V536 selection bypass the user's library constraints. */
export function libraryMotionEligibleV536(c:GenreMotionCandidateV536,input:Pick<GenreMotionInputV536,'bpm'|'genre'|'section'>):boolean {
  if(c.source!=='library')return true;
  const bpm=input.bpm;
  if(typeof bpm==='number'&&Number.isFinite(bpm)){
    if(typeof c.bpmMin==='number'&&Number.isFinite(c.bpmMin)&&bpm<c.bpmMin)return false;
    if(typeof c.bpmMax==='number'&&Number.isFinite(c.bpmMax)&&bpm>c.bpmMax)return false;
  }
  const tag=c.taggedGenre?.trim();
  if(tag){
    const wanted=motionFamilyV536(input.genre),configured=motionFamilyV536(tag);
    if(wanted!==configured)return false;
    if(configured==='general'&&tag.toLowerCase()!==(input.genre??'').trim().toLowerCase())return false;
  }
  const assigned=c.assignedSection;
  if(assigned&&assigned!=='any'){
    const section=(input.section??'').toLowerCase();
    const current=/(?:build|pre.?drop)/.test(section)?'build':
      /(?:drop|climax|peak)/.test(section)?'drop':
      /(?:hook|chorus|refrain)/.test(section)?'hook':
      /(?:intro|outro|break|bridge|ambient|quiet|interlude|pause)/.test(section)?'quiet':'verse';
    if(assigned!==current&&!(assigned==='verse'&&current==='hook'))return false;
  }
  return true;
}
export type RankedGenreMotionV536={name:string;score:number};
/** Evaluate a short, already-loaded list; name tokens are hints only, library category overrides name heuristic. */
export function rankGenreMotionsV536(input:GenreMotionInputV536,phrase:string,recent:readonly string[]=[]):RankedGenreMotionV536[] {
  const section=motionSectionV536(input.section),family=motionFamilyV536(input.genre);
  const energy=clamp(input.energy,.5,0,1),slot=Math.floor(clamp(input.slot,0,0,15));
  const seen=new Set<string>();
  return input.clips.filter(c=>validGenreCandidateV536(c)&&libraryMotionEligibleV536(c,input)&&!seen.has(c.name)&&!!seen.add(c.name))
    .map(c=>{
      const n=norm(c.label),category=c.category;
      const idle=category==='idle'||/idle|breath|standby/.test(n);
      const rap=category==='rap'||/rap|twostep|fingerflow|headnod|shoulderroll/.test(n);
      const dance=category==='dance'||/dance|groove|bounce|sidestep|shuffle|sway|roll/.test(n);
      const energetic=category==='energetic'||/stomp|jump|armsup|punch|hardtekk|hardstyle|rawstyle|hakken|hakkuh|footwork|gabber/.test(n);
      const gesture=category==='gesture'||/gesture|point|finger|nod|shoulder/.test(n);
      let score=0;
      if(section==='quiet')score+=idle?6:dance?1:gesture?.7:-.3;
      else if(section==='verse')score+=dance?3.3:rap?2.4:gesture?1.3:-.6;
      else if(section==='hook')score+=dance?4:rap?2.5:energetic?1.8:gesture?.5:-.5;
      else score+=energetic?4.6:dance?3.1:rap?1.3:-.6;
      if(family==='rap') {
        score+=rap?(section==='verse'?3.1:section==='hook'?2.4:1.1):0;
        if(section==='hook'&&dance)score+=1.2;
        if(section==='verse'&&gesture)score+=.75;
      }
      if(family==='hardstyle'||family==='hardtekk') {
        if(energetic)score+=section==='drop'?3.5:section==='hook'?2.1:energy>.75?1.1:0;
        if(dance&&section==='verse')score+=1.2;
        if(family==='hardtekk'&&/tekk|hakken|hakkuh|footwork|gabber|shuffle|bounce|step/.test(n))score+=1.2;
        if(family==='hardstyle'&&/stomp|jump|hardstyle|armsup/.test(n))score+=.95;
      }
      // V666: Rock and Pop must not fall back to the same generic choreography.
      // These are preferences among real installed clips, never eligibility claims.
      if(family==='rock') {
        if(/rock|guitar|headbang|power|stomp|punk|metal/.test(n))score+=section==='hook'?3.0:2.2;
        if(energetic&&section==='drop')score+=2;
        if(/sway|soft|flow/.test(n)&&section==='verse')score+=.3;
        if(/pop|ballad|disco/.test(n)&&!/rock/.test(n))score-=.8;
      }
      if(family==='pop') {
        if(/pop|dance|sway|groove|sidestep|step|flow|disco/.test(n))score+=section==='hook'?2.8:2;
        if(dance&&section==='hook')score+=1.4;
        if(/headbang|metal|guitar|hardstyle|tekk/.test(n))score-=1.5;
      }
      if(section!=='quiet'&&idle)score-=5.8;
      if(section!=='quiet'&&/greeting|wavehello|salute/.test(n))score-=4;
      if(section==='quiet'&&energetic)score-=3.2;
      if(energy<.33&&energetic)score-=2.5;
      if(energy>.78&&energetic&&section!=='quiet')score+=.8;
      if(c.favorite)score+=.7; // never overrules gross genre/section incompatibility
      if(c.source==='library')score+=.12; // tiny tie-break: favor added repertoire
      // Mixamo-only hints supplement V536's existing category, section, and
      // history scoring; never override manual selection or rig eligibility.
      score+=mixamoGenreBias(c.label,family,section,energy);
      // Section-specific Mixamo show cues; only real, loaded library actions.
      // Hard eligibility, user-defined metadata and manual ownership stay above this preference.
      if(c.source==="library")score+=mixamoShowCueBias({name:c.label,family,section:input.section,energy,slot,ensembleCount:input.ensembleCount??1});
      const wasRecent=recent.lastIndexOf(c.name);
      if(wasRecent>=0)score-=wasRecent===recent.length-1?2.5:1.1;
      // Stable per musical phrase and avatar slot, not per render/frame.
      const together=c.source==="library"&&isMixamoMotion(c.label)&&mixamoShowCue(input.section,slot,input.ensembleCount??1).commonPhrase;
      // Dancers sharing a model/library use identical phrase tie-breaks on
      // hook/drop, while verses retain per-performer variety. User group-clock
      // and manually authored timing are still managed by V328/V327/V492.
      const performerSeed=together?"ensemble":String(slot);
      score+=(hash(`${input.trackId}:${input.modelKey}:${phrase}:${performerSeed}:${c.name}`)%997)/997*.82;
      return {name:c.name,score};
    }).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
}
/** At most one switch per 4-bar phrase, and no change in under 8 seconds.
 * Preserve a 3-item rotation history; only vary among near-best genre-compatible actions.
 */
export function stepGenreMotionV536(previous:GenreMotionStateV536,input:GenreMotionInputV536):GenreMotionStateV536 {
  const trackId=input.trackId??'',position=clamp(input.progressMs,0,0,1_000_000_000);
  const changed=previous.trackId!==trackId||previous.modelKey!==input.modelKey||
    position<previous.lastPositionMs-1_500||position>previous.lastPositionMs+60_000;
  const state=changed?newGenreMotionStateV536():previous;
  const base:GenreMotionStateV536={...state,trackId,modelKey:input.modelKey,lastPositionMs:position};
  if(!trackId||!input.modelKey||!input.playing||input.reducedMotion||input.manualPriority)
    return {...base,selectedName:null,lastPhrase:'',recent:[]};
  const phraseLength=16*60_000/clamp(input.bpm,120,55,220);
  const phrase=`${motionSectionV536(input.section)}:${Math.floor(position/phraseLength)}`;
  const ranked=rankGenreMotionsV536(input,phrase,state.recent);
  if(!ranked.length)return {...base,selectedName:null,lastPhrase:''};
  const available=ranked.some(c=>c.name===state.selectedName);
  if(!available)return {...base,selectedName:ranked[0].name,lastSwitchMs:position,lastPhrase:phrase,recent:[ranked[0].name]};
  if(phrase===state.lastPhrase||position-state.lastSwitchMs<8_000)
    return {...base,lastPhrase:phrase};
  // Do not change to markedly worse genre/section fits just to create variation.
  const eligible=ranked.filter(r=>r.score>=ranked[0].score-1.75).slice(0,5);
  const fresh=eligible.find(r=>r.name!==state.selectedName&&!state.recent.slice(-2).includes(r.name));
  const alternate=fresh??eligible.find(r=>r.name!==state.selectedName);
  const chosen=ranked[0].name===state.selectedName && alternate ? alternate.name : ranked[0].name;
  if(chosen===state.selectedName)return {...base,lastPhrase:phrase};
  return {...base,selectedName:chosen,lastSwitchMs:position,lastPhrase:phrase,
    recent:[...state.recent,chosen].slice(-3)};
}
/** Reuse the existing V492 pose matching / crossfade; do not touch clip timing. */
export function genreCrossfadeSecondsV536(input:Pick<GenreMotionInputV536,'section'|'energy'>):number {
  return motionSectionV536(input.section)==='quiet'?.8:clamp(input.energy,.5,0,1)>.78?.55:.7;
}
