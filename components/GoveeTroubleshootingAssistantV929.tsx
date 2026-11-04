'use client';
import {useState} from 'react';
import {createGoveeTroubleshootingReportV929,getGoveeSymptomGuideV929,
 type GoveeDiagnosticCategoryV929,type GoveeDiagnosticSeverityV929,
 type GoveeSymptomV929,type GoveeTroubleshootingResultV929} from '@/lib/goveeTroubleshootingV929';

type Filter='all'|GoveeDiagnosticCategoryV929;
const categories:ReadonlyArray<{id:Filter;label:string}>=[
 {id:'all',label:'Alle Hinweise'},{id:'bridge',label:'Bridge'},
 {id:'device',label:'Geräte'},{id:'music',label:'Musik'},
 {id:'show',label:'Lichtshows'},{id:'timing',label:'Timing'}
];
const severityLabel:Record<GoveeDiagnosticSeverityV929,string>={critical:'Handlungsbedarf',warning:'Prüfen',info:'Information'};
const statusLabel:Record<GoveeTroubleshootingResultV929['status'],string>={
 'action-required':'Verbindung oder Konfiguration prüfen',
 'check-recommended':'Prüfhinweise vorhanden',
 configured:'Keine offensichtlichen Konfigurationsfehler'
};
/** Only a read-only assistance UI. The link anchors scroll to existing user controls.
 * No automatic settings changes, no network requests, no separate monitoring timer.
 */
export function GoveeTroubleshootingAssistantV929({result}:{result:GoveeTroubleshootingResultV929}){
 const [filter,setFilter]=useState<Filter>('all');
 const [symptom,setSymptom]=useState<GoveeSymptomV929>('automatic');
 const [expanded,setExpanded]=useState<string[]>([]);
 const [copyNotice,setCopyNotice]=useState('');
 const visible=result.issues.filter(issue=>filter==='all'||issue.category===filter);
 const guide=getGoveeSymptomGuideV929(symptom);
 const toggle=(id:string)=>setExpanded(previous=>previous.includes(id)?previous.filter(item=>item!==id):[...previous,id]);
 const copy=async()=>{
  try{
   await navigator.clipboard.writeText(createGoveeTroubleshootingReportV929(result,new Date().toISOString()));
   setCopyNotice('Anonymisierter V929-Diagnosebericht in die Zwischenablage kopiert.');
  }catch{setCopyNotice('Kopieren nicht möglich. Bitte die Berechtigung für die Zwischenablage prüfen.');}
 };
 return <section className="govee-v929" aria-label="V929 Smart Govee Troubleshooting Assistant">
  <div className="govee-v929-header">
   <div><h4>V929 · Smart Govee Troubleshooting Assistant</h4>
    <p className="settings-note">Konkrete Lösungsschritte aus den aktuellen V928-Statusdaten. Keine automatischen Reparaturen, keine zusätzlichen LAN-Anfragen.</p></div>
   <span className={`govee-v929-status ${result.status}`} role="status">{statusLabel[result.status]}</span>
  </div>
  <div className="govee-v929-totals" aria-label="Diagnoseüberblick">
   <span><strong>{result.criticalCount}</strong> dringend</span>
   <span><strong>{result.warningCount}</strong> prüfen</span>
   <span><strong>{result.infoCount}</strong> Informationen</span>
  </div>
  <div className="govee-v929-actions">
   <label>Hinweise filtern
    <select value={filter} onChange={event=>setFilter(event.target.value as Filter)} aria-label="Diagnosekategorie">
     {categories.map(category=><option key={category.id} value={category.id}>{category.label}</option>)}
    </select>
   </label>
   <label>Gezielt ein Symptom untersuchen
    <select value={symptom} onChange={event=>setSymptom(event.target.value as GoveeSymptomV929)} aria-label="Govee-Symptom">
     <option value="automatic">Automatische Statusdiagnose</option>
     <option value="no-light">Musik läuft, kein Licht</option>
     <option value="no-bass">Bass/Kick reagiert nicht</option>
     <option value="wrong-timing">Lichtwellen sind verzögert</option>
     <option value="no-show">Hook/Drop-Show fehlt</option>
    </select>
   </label>
  </div>
  {guide&&<div className="govee-v929-guide" aria-label="Symptombezogene Hilfestellung">
   <strong>{guide.title}</strong><p>{guide.description}</p>
   <ol>{guide.steps.map((step,index)=><li key={index}>{step}</li>)}</ol>
   <small>Allgemeiner Prüfpfad, keine Feststellung einer konkreten Ursache.</small>
  </div>}
  <div className="govee-v929-issues" aria-live="polite">
   {visible.length===0?<p className="settings-note">In dieser Kategorie sind keine Hinweise vorhanden. Ein sichtbarer Lichtbefehl ist damit nicht bestätigt.</p>:visible.map(issue=>
    <article key={issue.id} className={`govee-v929-issue ${issue.severity}`}>
     <div className="govee-v929-issue-header">
      <div><small>{severityLabel[issue.severity]}</small><strong>{issue.title}</strong></div>
      <button type="button" onClick={()=>toggle(issue.id)} aria-expanded={expanded.includes(issue.id)} aria-controls={`v929-steps-${issue.id}`}>
       {expanded.includes(issue.id)?'Schritte ausblenden':'Lösungsschritte ansehen'}
      </button>
     </div>
     <p>{issue.description}</p>
     <div id={`v929-steps-${issue.id}`} className="govee-v929-steps" hidden={!expanded.includes(issue.id)}>
      <ol>{issue.steps.map((step,index)=><li key={index}>{step}</li>)}</ol>
      {issue.targetId&&<a className="govee-v929-anchor" href={`#${issue.targetId}`}>Zur passenden Einstellung</a>}
     </div>
    </article>
   )}
  </div>
  <div className="govee-v929-footer">
   <button type="button" onClick={()=>void copy()}>V929-Diagnosebericht kopieren (anonymisiert)</button>
   {copyNotice&&<p className="settings-note" role="status">{copyNotice}</p>}
  </div>
  <p className="settings-note">Statusanzeigen und UDP-Antworten sind kein Nachweis sichtbarer LED-Reaktionen. Für Bassanalysen, die tatsächliche optische Verzögerung und Songabschnitte werden zusätzliche Quellen benötigt. Dieser Assistent ändert keine Konfiguration.</p>
 </section>;
}
