'use client';
import {useEffect,useState} from 'react';
import {goveeBridgeRequestV909,type GoveeConfigV909,type GoveeDeviceV909,type GoveeRoleSelectionV911} from '@/lib/goveeLanV909';
import {resolveGoveeRoleV911,planGoveeConcertLookV911,type GoveePhaseV911} from '@/lib/goveeConcertDirectorV911';
import {loadGoveeShowsV912} from '@/lib/goveeLightShowV912';
import {planGoveeAdvancedShowLookV914} from '@/lib/goveeTransitionsV914';
import {GOVEE_GROUPS_EVENT_V915,GOVEE_GROUPS_KEY_V915,EMPTY_GOVEE_GROUPS_V915,
 assignGoveeGroupMemberV915,loadGoveeGroupsV915,saveGoveeGroupsV915,
 applyGoveeGroupBrightnessV915,getGoveeGroupSourceIpV915,
 normalizeGoveeGroupsV915,type GoveeGroupV915,type GoveeGroupLibraryV915} from '@/lib/goveeDeviceGroupsV915';

type Props={config:GoveeConfigV909;devices:GoveeDeviceV909[];genre:string;onConfig:(patch:Partial<GoveeConfigV909>)=>void};
const roleNames:Record<GoveeRoleSelectionV911,string>={auto:'Automatisch (erstes Gruppenmitglied)',wall:'Bühnenlicht',rhythm:'Rhythmus / Bass',neon:'Neon',ambient:'Ambient'};
const phaseLabels:Record<GoveePhaseV911,string>={ambient:'Ambient',verse:'Verse',hook:'Hook',build:'Build-up',drop:'Drop',break:'Break'};
const demoMetrics={bass:0,beatStrength:0,energyEnvelope:.45,volume:.45};
const rgb=(color:string)=>{const x=parseInt(color.slice(1),16);return {r:(x>>16)&255,g:(x>>8)&255,b:x&255};};
const colorHex=(r:number,g:number,b:number)=>'#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');
const newGroupId=()=>`group_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;
export function GoveeDeviceGroupStudioV915({config,devices,genre,onConfig}:Props){
 const [saved,setSaved]=useState<GoveeGroupLibraryV915>({...EMPTY_GOVEE_GROUPS_V915,groups:[]});
 const [draft,setDraft]=useState<GoveeGroupLibraryV915>({...EMPTY_GOVEE_GROUPS_V915,groups:[]});
 const [dirty,setDirty]=useState(false);
 const [name,setName]=useState('Meine Lichtgruppe');
 const [phase,setPhase]=useState<GoveePhaseV911>('hook');
 const [manualColors,setManualColors]=useState<Record<string,string>>({});
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState('Gruppen werden lokal im Browser gespeichert.');
 useEffect(()=>{
  const refresh=()=>{const next=loadGoveeGroupsV915();setSaved(next);setDraft(next);setDirty(false);};
  const onStorage=(e:StorageEvent)=>{if(e.key===GOVEE_GROUPS_KEY_V915||e.key===null)refresh();};
  refresh();window.addEventListener(GOVEE_GROUPS_EVENT_V915,refresh);window.addEventListener('storage',onStorage);
  return()=>{window.removeEventListener(GOVEE_GROUPS_EVENT_V915,refresh);window.removeEventListener('storage',onStorage);};
 },[]);
 const edit=(next:GoveeGroupLibraryV915)=>{setDraft(next);setDirty(true);};
 const editGroup=(id:string,patch:Partial<GoveeGroupV915>)=>edit({...draft,groups:draft.groups.map(g=>g.id===id?{...g,...patch}:g)});
 const create=()=>{
  if(draft.groups.length>=12){setNotice('Maximal zwölf Gruppen möglich.');return;}
  const label=name.trim().slice(0,48);
  if(!label){setNotice('Bitte einen Gruppennamen eingeben.');return;}
  edit({...draft,groups:[...draft.groups,{id:newGroupId(),name:label,members:[],mode:'individual',role:'auto',brightnessPercent:100}]});
  setNotice(`Gruppe „${label}“ angelegt. Geräte zuordnen und speichern.`);
 };
 const persist=()=>{
  try{const next=saveGoveeGroupsV915(draft);setSaved(next);setDraft(next);setDirty(false);setNotice('Lichtgruppen gespeichert. Die aktivierte Musiksteuerung übernimmt die Gruppeneinstellungen.');}
  catch(e){setNotice(e instanceof Error?e.message:'Speichern fehlgeschlagen.');}
 };
 const exportGroups=()=>{
  if(!saved.groups.length){setNotice('Keine gespeicherten Gruppen zum Exportieren.');return;}
  const url=URL.createObjectURL(new Blob([JSON.stringify(saved,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='sonic-govee-groups-v915.json';document.body.appendChild(a);a.click();a.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1500);setNotice('Gespeicherte Gruppen exportiert – ohne Bridge-Token.');
 };
 const importGroups=async(file?:File)=>{
  if(!file)return;
  if(file.size>48_000){setNotice('Importdatei zu groß (maximal 48 KB).');return;}
  try{
   const raw:unknown=JSON.parse(await file.text());
   const obj=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Record<string,unknown>:{};
   if(obj.schema!=='govee-device-groups-v915'||!Array.isArray(obj.groups)||obj.groups.length>12)throw Error('Kein gültiges V915-Gruppenformat.');
   const data=normalizeGoveeGroupsV915(raw);
   if(data.groups.length!==obj.groups.length)throw Error('Mindestens eine Gruppe im Import ist ungültig.');
   edit({...data,enabled:false});setNotice('Gruppen importiert, aber noch nicht aktiviert. IP-Adressen prüfen und speichern.');
  }catch(e){setNotice(e instanceof Error?e.message:'Import fehlgeschlagen.');}
 };
 const groupMembers=(group:GoveeGroupV915)=>group.members.filter(ip=>config.selectedIps.includes(ip));
 const command=async(group:GoveeGroupV915,action:'power'|'color'|'brightness',value:unknown)=>{
  const fresh=saved.groups.find(g=>g.id===group.id);
  const ips=fresh?groupMembers(fresh):[];
  if(!ips.length){setNotice('Zuerst speichern und mindestens ein ausgewähltes Gerät der Gruppe zuordnen.');return;}
  if(!config.token.trim()){setNotice('Für manuelle Befehle zuerst den Bridge-Token eintragen.');return;}
  setBusy(true);let successes=0;const errors:string[]=[];
  try{
   // Manual control takes priority over an active concert show. No automatic power commands exist.
   if(config.autoSync)onConfig({autoSync:false});
   for(const ip of ips){
    try{
     await goveeBridgeRequestV909(config,'/devices/add','POST',{ip});
     await goveeBridgeRequestV909(config,'/command','POST',{ip,action,value});successes++;
    }catch{errors.push(ip);}
   }
   setNotice(`${successes} von ${ips.length} LAN-Befehl(en) versendet${errors.length?` · Fehler: ${errors.join(', ')}`:''}. UDP bestätigt nicht, ob das Gerät den Befehl ausgeführt hat.`);
  }finally{setBusy(false);}
 };
 const preview=(group:GoveeGroupV915,ip:string)=>{
  const sourceIp=group.mode==='unison'?getGoveeGroupSourceIpV915(group,ip,config.selectedIps):ip;
  const role=resolveGoveeRoleV911(group.mode==='unison'?group.role:config.deviceRolesV911[ip],devices.find(d=>d.ip===sourceIp)?.sku);
  const phaseCue={phase,previous:phase,transition:1,verified:phase!=='ambient'};
  const args={genre,progressMs:8000,phase:phaseCue,role,config,microphoneActive:false,metrics:demoMetrics};
  const show=loadGoveeShowsV912().find(s=>config.showEnabledV912&&s.id===config.selectedShowIdV912);
  const look=show?planGoveeAdvancedShowLookV914({...args,show,ip:sourceIp}):planGoveeConcertLookV911(args);
  return applyGoveeGroupBrightnessV915(look,group,config.masterBrightness);
 };
 return <section className="govee-v915" aria-label="V915 Govee Device Group Studio">
  <h3>V915 · Govee Device Group Studio</h3>
  <p className="settings-note">Ordne jede Leuchte höchstens einer Gruppe zu. <strong>Synchron:</strong> dieselbe Lichtfarbe und derselbe Show-Cue für alle Gruppenmitglieder. <strong>Individuell:</strong> eigene Gerätestile behalten, aber gemeinsam dimmen. Änderungen wirken erst nach „Gruppen speichern“. Keine Vorschau sendet LAN-Befehle.</p>
  <label className="setting-check"><input type="checkbox" checked={draft.enabled} onChange={e=>edit({...draft,enabled:e.target.checked})}/> Gruppen bei aktiver Musik-Synchronisierung verwenden</label>
  <div className="govee-v915-create"><label>Neue Gruppe<input type="text" maxLength={48} value={name} onChange={e=>setName(e.target.value)}/></label>
   <button type="button" disabled={draft.groups.length>=12} onClick={create}>Gruppe hinzufügen</button>
   <label>Songphase der Vorschau<select value={phase} onChange={e=>setPhase(e.target.value as GoveePhaseV911)}>{Object.entries(phaseLabels).map(([p,label])=><option key={p} value={p}>{label}</option>)}</select></label>
  </div>
  {!draft.groups.length&&<p className="settings-note">Noch keine Gruppen. Beispiel: „Bühne“ mit H6063 und H61A2, „Rhythmus“ mit H610B, „Ambient“ mit H6051.</p>}
  <div className="govee-v915-groups">
   {draft.groups.map(group=>{
    const members=groupMembers(group),savedGroup=saved.groups.find(g=>g.id===group.id);
    const color=manualColors[group.id]??'#a51bc9';
    return <div key={group.id} className="govee-v915-card">
     <div className="govee-v915-top"><label>Gruppenname<input type="text" maxLength={48} value={group.name} onChange={e=>editGroup(group.id,{name:e.target.value})}/></label>
      <button type="button" onClick={()=>edit({...draft,groups:draft.groups.filter(g=>g.id!==group.id)})}>Gruppe entfernen</button></div>
     <div className="govee-v915-controls"><label>Verhalten<select value={group.mode} onChange={e=>editGroup(group.id,{mode:e.target.value as GoveeGroupV915['mode']})}>
      <option value="individual">Individuell – eigene Rollen behalten</option><option value="unison">Synchron – gemeinsamer Licht-Cue</option>
     </select></label>
     {group.mode==='unison'&&<label>Gemeinsame Lichtrolle<select value={group.role} onChange={e=>editGroup(group.id,{role:e.target.value as GoveeRoleSelectionV911})}>
       {Object.entries(roleNames).map(([role,label])=><option key={role} value={role}>{label}</option>)}
      </select></label>}
     <label>Gruppenhelligkeit ({group.brightnessPercent} %)<input type="range" min={10} max={100} step={5} value={group.brightnessPercent} onChange={e=>editGroup(group.id,{brightnessPercent:Number(e.target.value)})}/></label></div>
     <div className="govee-v915-members" aria-label={`Mitglieder von ${group.name}`}>
      {config.selectedIps.map(ip=>{
       const device=devices.find(d=>d.ip===ip);
       return <label key={ip}><input type="checkbox" checked={group.members.includes(ip)} onChange={e=>edit(assignGoveeGroupMemberV915(draft,group.id,ip,e.target.checked))}/>
        <span>{device?.name||device?.sku||ip} <small>{device?.sku||''} · {ip}</small></span></label>;
      })}
      {!config.selectedIps.length&&<p className="settings-note">Zuerst oben Govee-Leuchten auswählen.</p>}
     </div>
     {members.length>0&&<div className="govee-v915-preview" aria-label={`Farbvorschau für ${group.name}`}>
      {members.map(ip=>{
       const look=preview(group,ip);return <div key={ip} className="govee-v915-preview-lamp">
        <span style={{backgroundColor:colorHex(look.color.r,look.color.g,look.color.b)}} aria-label={`RGB ${look.color.r}, ${look.color.g}, ${look.color.b}`}/>
        <small>{devices.find(d=>d.ip===ip)?.sku||ip} · {look.brightness}%</small>
       </div>;
      })}
     </div>}
     <div className="govee-v915-manual">
      <label>Manuelle Gruppenfarbe<input type="color" value={color} onChange={e=>setManualColors(old=>({...old,[group.id]:e.target.value}))}/></label>
      <div className="govee-v909-actions">
       <button type="button" disabled={busy||dirty||!savedGroup?.members.length} onClick={()=>void command(group,'color',rgb(color))}>Farbe senden</button>
       <button type="button" disabled={busy||dirty||!savedGroup?.members.length} onClick={()=>void command(group,'brightness',Math.max(1,Math.round(config.masterBrightness*group.brightnessPercent/100)))}>Helligkeit senden</button>
       <button type="button" disabled={busy||dirty||!savedGroup?.members.length} onClick={()=>void command(group,'power',true)}>Gruppe EIN</button>
       <button type="button" disabled={busy||dirty||!savedGroup?.members.length} onClick={()=>void command(group,'power',false)}>Gruppe AUS</button>
      </div>
     </div>
    </div>;
   })}
  </div>
  <div className="govee-v909-actions">
   <button type="button" className="govee-v912-save" disabled={!dirty} onClick={persist}>Gruppen speichern</button>
   <button type="button" disabled={!dirty} onClick={()=>{setDraft(saved);setDirty(false);setNotice('Nicht gespeicherte Änderungen verworfen.');}}>Verwerfen</button>
   <button type="button" onClick={exportGroups} disabled={!saved.groups.length}>JSON exportieren</button>
   <label className="govee-v912-file">JSON importieren<input type="file" accept="application/json,.json" onChange={e=>{void importGroups(e.target.files?.[0]);e.target.value='';}}/></label>
  </div>
  <p role="status" className="settings-note">{dirty?'Ungespeicherte Gruppenänderungen · ':''}{notice}</p>
  <p className="settings-note">Die Gruppensteuerung bleibt lokal auf deinem Raspberry Pi / Chromium-Browser gespeichert. Beim Import auf ein anderes Gerät bitte die privaten IP-Adressen prüfen. Gruppen gelten nur für ausgewählte Leuchten; Geräte ohne Gruppe behalten ihre bisherige V911–V914-Beleuchtung.</p>
 </section>;
}
