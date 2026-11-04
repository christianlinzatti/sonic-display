'use client';
/** V902 – proposal preview is a deliberate, two-click workflow. No effects,
 * timers, image analysis, storage writes or automatic mutation in this panel.
 * The V901 parent subscribes to V826 telemetry; this reuses that snapshot.
 */
import {useMemo,useState} from 'react';
import type {QualityReportV901} from './concertQualityIntelligenceV901';
import {adviseConcertV902,confirmConcertAdviceV902,exportConcertAdviceV902,
 type AdvisorConfigV902,type AdvisorProposalV902,type AdvisorPatchV902} from './concertQualityAdvisorV902';
interface Props {report:QualityReportV901;controls:AdvisorConfigV902;onApply:(p:AdvisorPatchV902)=>void}
const describe=(v:number|boolean)=>typeof v==='boolean'?(v?'Ein':'Aus'):`${v} %`;
export function ConcertQualityAdvisorPanelV902({report,controls,onApply}:Props){
 const [selected,setSelected]=useState<AdvisorProposalV902|null>(null);
 const [notice,setNotice]=useState('');
 const result=useMemo(()=>adviseConcertV902(report,controls),[report,controls]);
 const fresh=selected?confirmConcertAdviceV902(selected,report,controls):null;
 const apply=()=>{
  if(!selected)return;
  const patch=confirmConcertAdviceV902(selected,report,controls);
  if(!patch){setNotice('Die Vorschau ist veraltet. Bitte den Vorschlag erneut öffnen.');setSelected(null);return;}
  onApply(patch);setSelected(null);
  setNotice(`Änderung angefordert: ${selected.title}. V903 überprüft, ob der neue Wert tatsächlich aktiv ist.`);
 };
 const download=()=>{
  const url=URL.createObjectURL(new Blob([exportConcertAdviceV902(report,result)],{type:'application/json;charset=utf-8'}));
  try{const a=document.createElement('a');a.href=url;a.download='sonic-concert-advisor-v902-preview.json';a.click();}
  finally{URL.revokeObjectURL(url);}
 };
 return <fieldset className="concert-director-options-v895 concert-quality-advisor-v902" aria-label="Automatic Concert Quality Advisor">
  <legend>V902 · Automatic Concert Quality Advisor</legend>
  <p style={{margin:'4px 0 8px'}}>Vorschläge aus V901 – jede Änderung benötigt eine gesonderte Vorschau und ausdrückliche Bestätigung.</p>
  {result.state!=='ready'?<small>Keine aktive, bestätigte Konzertszene. Keine Optimierung möglich.</small>:<>
   <div aria-label="V902 Optimierungsvorschläge" style={{display:'grid',gap:7}}>
    {result.proposals.map(x=><div key={x.id} style={{border:'1px solid #7778',borderRadius:8,padding:9}}>
     <b>{x.title}</b><small style={{display:'block',margin:'5px 0'}}>{x.why}</small>
     <span style={{fontSize:12}}>Ist: <b>{describe(x.before)}</b> → Vorschlag: <b>{describe(x.after)}</b></span>{' '}
     <button type="button" className="concert-transition-export-v884"
      onClick={()=>{setSelected(x);setNotice('');}}>Vorschau anzeigen</button>
    </div>)}
    {!result.proposals.length&&<small>Aus den verfügbaren Daten ergeben sich gerade keine sicheren Einstellungsänderungen.</small>}
   </div>
  </>}
  {selected&&<section aria-label="V902 Änderungsvorschau" style={{margin:'10px 0',padding:10,border:'1px solid #86a5bc',borderRadius:9}}>
   <strong>Vorher → Nachher: {selected.title}</strong>
   <div style={{margin:'5px 0'}}>Ist: <b>{describe(selected.before)}</b> → Neu: <b>{describe(selected.after)}</b></div>
   <small>{selected.expected}</small>
   <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
    <button type="button" disabled={!fresh} className="concert-transition-export-v884" onClick={apply}>Diese Änderung bestätigen</button>
    <button type="button" className="concert-transition-export-v884" onClick={()=>{setSelected(null);setNotice('');}}>Abbrechen</button>
   </div>
   {!fresh&&<small style={{display:'block'}}>Die Szene, Messlage oder Einstellung hat sich geändert. Bitte neue Vorschau wählen.</small>}
  </section>}
  {notice&&<div role="status" aria-live="polite"><small>{notice}</small></div>}
  {result.observations.map((note,i)=><small key={i} style={{display:'block',marginTop:5}}>{note}</small>)}
  <button type="button" className="concert-transition-export-v884" onClick={download}>V902 Vorschläge als JSON exportieren</button>
  <small style={{display:'block'}}>Keine automatische Übernahme und keine Bearbeitung manueller Timelines. Es werden ausschließlich bestehende automatische Einstellungen verändert. Messungen belegen keinen zukünftigen FPS-Gewinn; Änderungen im Browser erneut prüfen.</small>
 </fieldset>;
}
