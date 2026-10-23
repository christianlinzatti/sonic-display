/** V441: purely visual attribution based on Spotify artist credits and STAGE slots.
 * No vocal/speaker recognition; authored V416 ranges are stage-direction overrides only.
 */
export type ArtistBubbleModeV441="focus"|"always"|"intro";
export type ArtistBubbleStyleV441="comic"|"neon"|"minimal";
export type ArtistBubbleSceneV441="hook"|"duet"|"verse"|"reply"|"build"|"drop"|"break"|"none";
export type ArtistBubbleAssignmentV441={fromLine:number;toLine:number;leadSlot:number;partnerSlot:number;style:string};
export type ArtistBubbleV441={slot:number;name:string;displayName:string;visible:boolean;emphasized:boolean};
export type ArtistBubblePlanV441={enabled:boolean;style:ArtistBubbleStyleV441;mode:ArtistBubbleModeV441;
  source:"spotify-credits"|"manual-stage"|"disabled";bubbles:ArtistBubbleV441[];activeSlot:number|null};

export function normalizeArtistBubbleModeV441(v:unknown):ArtistBubbleModeV441 {
  return v==="intro"||v==="always"?v:"focus";
}
export function normalizeArtistBubbleStyleV441(v:unknown):ArtistBubbleStyleV441 {
  return v==="neon"||v==="minimal"?v:"comic";
}
function normalizedCredits(artists:readonly string[]):string[]{
  const seen=new Set<string>();const out:string[]=[];
  for(const raw of artists.slice(0,16)){
    if(typeof raw!=="string")continue;
    const cleaned=raw.replace(/\s+/g," ").trim();
    const key=cleaned.toLocaleLowerCase();
    if(!cleaned||seen.has(key))continue;
    seen.add(key);out.push(cleaned.slice(0,140));
  }
  return out;
}
function selectedLineAt(lines:readonly {startMs:number}[]|undefined,ms:number):number{
  if(!lines?.length)return -1;
  let lo=0,hi=Math.min(lines.length,5000)-1,found=-1;
  while(lo<=hi){const mid=(lo+hi)>>1;const x=lines[mid]?.startMs;
    if(typeof x==="number"&&Number.isFinite(x)&&x<=ms){found=mid;lo=mid+1;}else hi=mid-1;
  }return found;
}
export function planArtistBubblesV441(input:{enabled:boolean;artists:readonly string[];visibleCount:number;
  mode?:ArtistBubbleModeV441;style?:ArtistBubbleStyleV441;showSolo?:boolean;
  progressMs:number;playing:boolean;scene?:ArtistBubbleSceneV441;focusSlot?:number;
  phrase?:number;lyrics?:{synced:boolean;lines:readonly {startMs:number}[]}|null;
  authored?:readonly ArtistBubbleAssignmentV441[];authoredEnabled?:boolean;
  manualVocalPriority?:boolean}):ArtistBubblePlanV441{
  const mode=normalizeArtistBubbleModeV441(input.mode);
  const style=normalizeArtistBubbleStyleV441(input.style);
  const credits=normalizedCredits(input.artists);
  const count=Math.max(0,Math.min(4,Math.trunc(Number.isFinite(input.visibleCount)?input.visibleCount:0),credits.length));
  const enabled=Boolean(input.enabled&&count>0&&(count>1||input.showSolo!==false));
  const fallback:ArtistBubblePlanV441={enabled:false,style,mode,source:"disabled",bubbles:[],activeSlot:null};
  if(!enabled)return fallback;
  const ms=Number.isFinite(input.progressMs)?Math.max(0,input.progressMs):0;
  let focus=Math.max(0,Math.min(count-1,Math.trunc(input.focusSlot??0)));
  let authoredScene:ArtistBubbleSceneV441|null=null;
  let source:ArtistBubblePlanV441["source"]="spotify-credits";
  const lineIndex=input.lyrics?.synced?selectedLineAt(input.lyrics.lines,ms):-1;
  if(input.authoredEnabled&&lineIndex>=0&&input.authored?.length){
    for(let i=Math.min(input.authored.length,150)-1;i>=0;i--){
      const entry=input.authored[i];
      if(entry&&entry.fromLine<=lineIndex&&entry.toLine>=lineIndex&&
        Number.isInteger(entry.leadSlot)&&entry.leadSlot>=0&&entry.leadSlot<count){
        focus=entry.leadSlot;
        authoredScene=entry.style==="hook"?"hook":entry.style==="duet"?"duet":"verse";
        source="manual-stage";break;
      }
    }
  }
  // Vocal override can't be mapped to Spotify credits. Prefer showing everyone instead of a misleading lead.
  const sectionDuo=Boolean(input.manualVocalPriority||authoredScene==="hook"||authoredScene==="duet"||
    (!authoredScene&&(input.scene==="hook"||input.scene==="duet")));
  const phrase=Math.max(0,Math.floor(Number.isFinite(input.phrase)?(input.phrase as number):ms/12000));
  const sectionStart=input.lyrics?.synced&&lineIndex>=0
    ?input.lyrics.lines[Math.floor(lineIndex/4)*4]?.startMs
    :undefined;
  const elapsedInSection=typeof sectionStart==="number"&&Number.isFinite(sectionStart)
    ?ms-sectionStart:ms%12000;
  const introVisible=ms<4500||(input.playing&&(phrase>0||lineIndex>=4)&&
    elapsedInSection>=0&&elapsedInSection<1650);
  const group=sectionDuo||(source!=="manual-stage"&&(ms<4500||(mode==="intro"&&introVisible)));
  const bubbles=credits.slice(0,count).map((name,slot):ArtistBubbleV441=>({
    slot,name,displayName:name.length>30?name.slice(0,29).trimEnd()+"…":name,
    visible:mode!=="intro"||introVisible,
    emphasized:group||mode==="always"||slot===focus
  }));
  return {enabled,style,mode,source,bubbles,activeSlot:group||mode==="always"?null:focus};
}
