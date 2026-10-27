/** V568 – bounded orchestration for already-existing concert channels.
 * The show director never chooses a singer, creates a camera pose, edits lyrics,
 * schedules a motion clip, or adds render/timing loops. Authored controls win.
 */
import type {ConcertDynamicsV502} from './smartConcertDynamicsV502';
import type {ConcertSceneV528} from './cinematicConcertCoordinationV528';
import type {VisualBalanceV451} from '../../services/show/visualBalanceV451';

export type SmartConcertModeV568='off'|'verse'|'hook'|'build'|'drop'|'break'|'handoff'|'ensemble';
export type SmartConcertEvidenceV568='none'|'estimated'|'labeled'|'authored';
export type SmartConcertDirectionV568={
 active:boolean;mode:SmartConcertModeV568;evidence:SmartConcertEvidenceV568;
 /** Valid only for a track-bound V528 authored vocal scene – otherwise null. */
 focusSlot:number|null;vocalSlots:readonly number[];
 lyricsProtected:boolean;dynamics:ConcertDynamicsV502;
};
type Input={
 base:ConcertDynamicsV502;scene:ConcertSceneV528|null|undefined;
 attention:VisualBalanceV451;enabled:boolean;strength:number;
 trackId:string;progressMs:number;playing:boolean;reducedMotion:boolean;
 tier:'low'|'balanced'|'high';lyricsVisible:boolean;
 manualDance:boolean;manualCamera:boolean;manualLighting:boolean;manualLyrics:boolean;
};
const clamp=(v:number,min:number,max:number)=>Number.isFinite(v)?Math.max(min,Math.min(max,v)):min;
const round=(v:number)=>Math.round(v*10000)/10000;
const bound=(n:number)=>round(clamp(n,.88,1.12));
const off=(base:ConcertDynamicsV502):SmartConcertDirectionV568=>({
 active:false,mode:'off',evidence:'none',focusSlot:null,vocalSlots:[],lyricsProtected:false,dynamics:base,
});
function validScene(scene:ConcertSceneV528|null|undefined,trackId:string,time:number):scene is ConcertSceneV528{
 return !!scene?.active&&scene.trackId===trackId&&trackId.trim().length>0&&
   Number.isFinite(scene.cueStartMs)&&Number.isFinite(scene.cueEndMs)&&
   Number.isFinite(scene.strength)&&scene.strength>0&&
   scene.cueStartMs>=0&&scene.cueEndMs>scene.cueStartMs&&time>=scene.cueStartMs&&time<scene.cueEndMs&&
   Number.isInteger(scene.count)&&scene.count>=2&&scene.count<=4&&
   Number.isInteger(scene.leadSlot)&&scene.leadSlot>=0&&scene.leadSlot<scene.count&&
   scene.singingSlots.length>=1&&scene.singingSlots.every(slot=>Number.isInteger(slot)&&slot>=0&&slot<scene.count)&&
   new Set(scene.singingSlots).size===scene.singingSlots.length&&scene.singingSlots.includes(scene.leadSlot)&&
   (scene.handoffFrom===null||(Number.isInteger(scene.handoffFrom)&&scene.handoffFrom>=0&&scene.handoffFrom<scene.count&&scene.handoffFrom!==scene.leadSlot));
}
/** One decision for automatic camera/dance/lighting/decorative lyrics intensity.
 * The V502 timetable stays authoritative; V528 adds focus only with an authored
 * cast and the V451 attention budget protects active readable lyrics.
 */
export function coordinateSmartConcertV568(input:Input):SmartConcertDirectionV568{
 const {base,trackId,progressMs,tier}=input;
 if(!input.enabled||!base.active||!trackId?.trim()||!input.playing||input.reducedMotion||tier==='low'||
   !Number.isFinite(progressMs)||progressMs<0||!Number.isFinite(input.strength)||input.strength<=0||
   !['verse','hook','build','drop','break'].includes(base.section)||!['labeled','estimated'].includes(base.evidence))return off(base);
 const verified=validScene(input.scene,trackId,progressMs);
 // An absent or malformed V528 cast is NEVER replaced by credit order/phrase focus.
 const scene=verified?input.scene!:null;
 const handoff=!!scene&&scene.focus==='handoff'&&scene.handoffFrom!==null;
 const ensemble=!!scene&&scene.focus==='ensemble'&&scene.singingSlots.length>=2;
 const mode:SmartConcertModeV568=handoff?'handoff':ensemble?'ensemble':base.section;
 const lyricsProtected=input.lyricsVisible&&input.attention.attention==='lyrics'&&
   (input.attention.reason==='active-lyrics'||input.attention.reason==='lyric-boundary');
 const evidence:SmartConcertEvidenceV568=scene?'authored':base.evidence;
 const sourceGain=base.evidence==='estimated'?.45:1;
 const tierGain=tier==='balanced'?.58:1;
 const power=clamp(input.strength,0,100)/100*sourceGain*tierGain;
 const focusGain=scene?clamp(scene.strength,0,.8):1;
 // Shared stage direction is intentionally small and bounded. V528 owns poses,
 // V515 owns motion limits, V566 owns face lighting and V567 owns word accents.
 const section=({verse:{dance:.986,camera:1.008,lighting:.997,lyrics:0},
   hook:{dance:1.028,camera:1.014,lighting:1.021,lyrics:.006},
   build:{dance:1.014,camera:1.012,lighting:1.008,lyrics:.003},
   drop:{dance:1.024,camera:1.016,lighting:1.026,lyrics:.006},
   break:{dance:.988,camera:.994,lighting:.991,lyrics:0},
   handoff:{dance:.963,camera:1.026,lighting:1.018,lyrics:0},
   ensemble:{dance:1.019,camera:.991,lighting:1.022,lyrics:.003}} as const)[mode];
 // These four accents are a single bounded plan, not independent random effects.
 const gain=power*(scene?focusGain:1);
 const lyrGain=lyricsProtected?.33:1;
 const dynamics:ConcertDynamicsV502={...base,
   dance:input.manualDance?base.dance:bound(base.dance*(1+(section.dance-1)*gain*(lyricsProtected?.62:1))),
   camera:input.manualCamera?base.camera:bound(base.camera*(1+(section.camera-1)*gain*lyrGain)),
   lighting:input.manualLighting?base.lighting:bound(base.lighting*(1+(section.lighting-1)*gain*lyrGain)),
   // Only decorative glow; never modify word-fill, line, opacity or geometry.
   lyrics:input.manualLyrics||!input.lyricsVisible?base.lyrics:
     round(clamp(base.lyrics+section.lyrics*gain*(lyricsProtected?0:1),0,.12)),
 };
 return {active:true,mode,evidence,focusSlot:scene?scene.leadSlot:null,
   vocalSlots:scene?[...scene.singingSlots]:[],lyricsProtected,dynamics};
}
