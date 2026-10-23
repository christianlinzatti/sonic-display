"use client";
import {useMemo,useRef,useState,type PointerEvent,type KeyboardEvent} from 'react';
import type {MotionTimeline,TimelineSegment} from './motionTimelineEngine';
import {timelineDuration,timelineWeights} from './motionTimelineEngine';
import type {TrackAnalysisV318} from '@/services/musicAnalysis/trackAnalysisV318';
import {editMotionSegmentV319,makeMotionGridV319,snapMotionSecondV319,type EditModeV319,type SnapModeV319} from './musicMotionTimelineV319';

export function MusicAlignedTimelineEditorV319({timeline,trackId,analysis,playhead,onSeek,onChange}:{
 timeline:MotionTimeline;trackId:string;analysis:TrackAnalysisV318|null;playhead:number;onSeek:(seconds:number)=>void;onChange:(next:MotionTimeline)=>void;
}){
 const [draft,setDraft]=useState<{id:string;segment:TimelineSegment;track:number}|null>(null);
 const gesture=useRef<{pointer:number;originX:number;width:number;mode:EditModeV319;segment:TimelineSegment;track:number}|null>(null);
 const duration=Math.max(8,Math.ceil((timelineDuration(timeline)+2)/4)*4,Math.min(240,Math.max(0,playhead)+4));
 const grid=useMemo(()=>makeMotionGridV319(trackId,analysis,timeline.bpm??120,duration),[trackId,analysis,timeline.bpm,duration]);
 const mode:SnapModeV319=timeline.snap===false?'off':(timeline.snapMode??'beat');
 const displayed=useMemo(()=>draft?{...timeline,segments:timeline.segments.map(s=>s.id===draft.id?{...draft.segment,track:draft.track}:s)}:timeline,[timeline,draft]);
 const viewSeconds=duration;
 const tracks=Array.from({length:Math.max(3,Math.min(8,Math.max(0,...timeline.segments.map(s=>s.track??0))+1))},(_,i)=>i);
 const current=timelineWeights(displayed,playhead);
 const px=(seconds:number)=>`${Math.min(100,Math.max(0,seconds/viewSeconds*100))}%`;
 const changeSegment=(id:string,next:TimelineSegment,track?:number)=>onChange({...timeline,segments:timeline.segments.map(s=>s.id===id?{...next,track:track??s.track}:s)});
 const down=(e:PointerEvent<HTMLElement>,s:TimelineSegment,track:number,edit:EditModeV319)=>{
   if(e.button!==0)return;
   const lane=e.currentTarget.closest('[data-v319-lane]') as HTMLElement|null;
   if(!lane)return;
   e.preventDefault();e.stopPropagation();
   e.currentTarget.setPointerCapture(e.pointerId);
   gesture.current={pointer:e.pointerId,originX:e.clientX,width:lane.getBoundingClientRect().width,mode:edit,segment:s,track};
 };
 const move=(e:PointerEvent<HTMLElement>)=>{
   const g=gesture.current;
   if(!g||g.pointer!==e.pointerId)return;
   const offset=(e.clientX-g.originX)/Math.max(1,g.width)*viewSeconds;
   const segment=editMotionSegmentV319(g.segment,g.mode,offset,grid,mode);
   let track=g.track;
   if(g.mode==='move'){
     const element=document.elementFromPoint(e.clientX,e.clientY) as HTMLElement|null;
     const lane=element?.closest('[data-v319-lane]') as HTMLElement|null;
     const candidate=Number(lane?.dataset.v319Lane);
     if(lane&&Number.isInteger(candidate)&&candidate>=0&&candidate<=7)track=candidate;
   }
   setDraft({id:g.segment.id,segment,track});
 };
 const finish=(e:PointerEvent<HTMLElement>,cancel=false)=>{
   const g=gesture.current;if(!g||g.pointer!==e.pointerId)return;
   gesture.current=null;
   if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
   if(!cancel){const delta=(e.clientX-g.originX)/Math.max(1,g.width)*viewSeconds;
     const segment=editMotionSegmentV319(g.segment,g.mode,delta,grid,mode);
     let track=g.track;
     // Use the last observed lane for vertical moves; pointer capture can obscure the underlying lane on release.
     if(g.mode==='move'&&draft?.id===g.segment.id)track=draft.track;
     changeSegment(g.segment.id,segment,track);
   }
   setDraft(null);
 };
 const keyboard=(e:KeyboardEvent<HTMLElement>,s:TimelineSegment)=>{
   if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
   e.preventDefault();
   const sign=e.key==='ArrowRight'?1:-1;
   const markers=mode==='bar'?grid.bars:grid.beats;
   const at=mode==='off'?s.start+sign*.1:markers.findIndex(t=>t>s.start+.001);
   let next=s.start+sign*(60/grid.tempo*(mode==='bar'?grid.timeSignature:1));
   if(mode!=='off'&&markers.length){
     if(sign>0){next=typeof at==='number'&&at>=0?markers[at]:next;}
     else{const previous=[...markers].reverse().find(t=>t<s.start-.001);if(previous!==undefined)next=previous;}
   }
   const delta=next-s.start;
   changeSegment(s.id,editMotionSegmentV319(s,e.shiftKey?'trim-end':'move',delta,grid,mode));
 };
 const gridMarkers=grid.beats.filter(t=>t<=viewSeconds).slice(0,700);
 const barMarkers=grid.bars.filter(t=>t<=viewSeconds).slice(0,350);
 return <fieldset aria-label="Advanced Music-Aligned Motion Timeline V319" style={{minWidth:0}}>
   <legend>Advanced Motion Timeline Studio · V319</legend>
   <p>Clips ziehen, an den Seiten kürzen und die Ein-/Ausblendung über die schmalen Fade-Griffe verändern. Startpositionen und Schnittpunkte rasten optional auf <strong>echte importierte Beats oder Takte</strong> ein.</p>
   <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
     <label>Raster <select aria-label="Musikraster V319" value={mode} onChange={e=>onChange({...timeline,snap:e.target.value!=='off',snapMode:e.target.value as SnapModeV319})}>
       <option value="off">Frei</option><option value="beat">Beat</option><option value="bar">Takt</option>
     </select></label>
     <label className="setting-check"><input type="checkbox" disabled={!trackId} checked={Boolean(timeline.songSync&&timeline.trackId===trackId)} onChange={e=>onChange({...timeline,songSync:e.target.checked,trackId:e.target.checked?trackId:''})}/> Timeline an aktuelle Songposition binden</label>
     <button type="button" disabled={!timeline.segments.length} onClick={()=>onChange({...timeline,segments:timeline.segments.map(s=>({...s,start:snapMotionSecondV319(s.start,grid,mode)}))})}>Alle Clip-Anfänge ausrichten</button>
   </div>
   <p><small>{grid.source==='imported'?`Musikraster für diesen Titel: Beats ${grid.beatSource==='imported'?'importiert':'BPM-basiert'}, Takte ${grid.barSource==='imported'?'importiert':'abgeleitet'} (je ${grid.beats.length}/${grid.bars.length} Markierungen).`:`BPM-Raster (${grid.tempo.toFixed(1)} BPM), keine gemessenen Beatzeiten verfügbar.`} {timeline.songSync?timeline.trackId===trackId?'Die Live-Timeline folgt der absoluten Trackposition.':'Diese Timeline ist an einen anderen Track gebunden und spielt dort nicht automatisch.':'Ohne Songbindung bleibt der bisherige Sequenz-Taktgeber erhalten.'}</small></p>
   <div style={{overflowX:'auto',padding:8,border:'1px solid #53617a',borderRadius:8,background:'#151b2b'}}>
     <div style={{display:'flex',gap:6,fontSize:11,marginBottom:8}}><div style={{width:58,flexShrink:0}}>Takt</div><div style={{height:24,position:'relative',minWidth:470,flex:1}}>
       {barMarkers.map((t,i)=><span key={i} style={{position:'absolute',left:px(t),color:'#a6ecf5',whiteSpace:'nowrap'}}>{i+1}</span>)}
     </div></div>
     {tracks.map(track=><div key={track} style={{display:'flex',gap:6,marginBottom:5,alignItems:'stretch',minHeight:70}}>
       <div style={{width:58,flexShrink:0,display:'flex',alignItems:'center',fontSize:12}}>Spur {track+1}</div>
       <div data-v319-lane={track} aria-label={`Motion-Spur ${track+1}`} style={{position:'relative',flex:1,minWidth:470,borderRadius:5,background:'#202b3f',touchAction:'pan-y'}}
         onClick={e=>{if(e.target!==e.currentTarget)return;const bounds=e.currentTarget.getBoundingClientRect();onSeek(Math.max(0,(e.clientX-bounds.left)/bounds.width*viewSeconds));}}>
         {gridMarkers.map((t,i)=><div key={`b-${i}`} style={{position:'absolute',left:px(t),width:1,height:'100%',background:'#64748b',opacity:.25,pointerEvents:'none'}}/>)}
         {barMarkers.map((t,i)=><div key={`r-${i}`} style={{position:'absolute',left:px(t),width:1,height:'100%',background:'#78dce8',opacity:.7,pointerEvents:'none'}}/>)}
         {grid.sections.filter(s=>s.at<=viewSeconds).map((s,i)=><div key={`s-${i}`} title={s.label??'Abschnittsgrenze (ohne Genre-Zuordnung)'} style={{position:'absolute',left:px(s.at),height:'100%',borderLeft:'2px dashed #faab6c',pointerEvents:'none'}}/>)}
         {displayed.segments.filter(s=>(s.track??0)===track).map((s,i)=><div key={s.id} role="button" tabIndex={0} aria-label={`${s.clip}, Start ${s.start.toFixed(2)} Sekunden, Länge ${s.duration.toFixed(2)} Sekunden`}
           onKeyDown={e=>keyboard(e,s)} onPointerDown={e=>down(e,s,track,'move')} onPointerMove={move} onPointerUp={finish} onPointerCancel={e=>finish(e,true)}
           style={{position:'absolute',left:px(s.start),width:`${Math.max(0.6,Math.min(100-s.start/viewSeconds*100,s.duration/viewSeconds*100))}%`,top:16,height:45,boxSizing:'border-box',border:'1px solid #bef2ff',borderRadius:4,background:i%2?'#673d96':'#226c83',color:'#fff',touchAction:'none',cursor:'grab',display:'flex',alignItems:'stretch',overflow:'visible'}}>
             <span title="Start verschieben" onPointerDown={e=>down(e,s,track,'trim-start')} onPointerMove={move} onPointerUp={finish} onPointerCancel={e=>finish(e,true)} style={{width:9,flexShrink:0,background:'#b3e9ee',cursor:'ew-resize',touchAction:'none'}}/>
             <span title="Einblendung anpassen" onPointerDown={e=>down(e,s,track,'fade-in')} onPointerMove={move} onPointerUp={finish} onPointerCancel={e=>finish(e,true)} style={{position:'absolute',left:`${Math.min(100,s.fadeIn/s.duration*100)}%`,top:0,width:5,height:9,background:'#ffdf6e',cursor:'ew-resize',touchAction:'none'}}/>
             <span style={{flex:1,overflow:'hidden',padding:'4px 4px',fontSize:11,whiteSpace:'nowrap',textOverflow:'ellipsis',pointerEvents:'none'}}>{s.clip}<div style={{fontSize:10,opacity:.9}}>{Math.round((current[s.clip]??0)*100)} % · {s.duration.toFixed(1)} s</div></span>
             <span title="Ausblendung anpassen" onPointerDown={e=>down(e,s,track,'fade-out')} onPointerMove={move} onPointerUp={finish} onPointerCancel={e=>finish(e,true)} style={{position:'absolute',right:`${Math.min(100,s.fadeOut/s.duration*100)}%`,bottom:0,width:5,height:9,background:'#ffdf6e',cursor:'ew-resize',touchAction:'none'}}/>
             <span title="Ende verschieben" onPointerDown={e=>down(e,s,track,'trim-end')} onPointerMove={move} onPointerUp={finish} onPointerCancel={e=>finish(e,true)} style={{width:9,flexShrink:0,background:'#b3e9ee',cursor:'ew-resize',touchAction:'none'}}/>
           </div>)}
         <span style={{position:'absolute',left:px(playhead),top:0,height:'100%',borderLeft:'2px solid #ffe184',pointerEvents:'none'}}/>
       </div>
     </div>)}
   </div>
   <p style={{fontSize:12}}>Hellblaue Linien: Taktanfänge · feine Linien: Beats · orange Striche: Abschnittsgrenzen · gelbe Griffe: Crossfade. Tastatur: Pfeiltasten zum Verschieben.</p>
 </fieldset>;
}
