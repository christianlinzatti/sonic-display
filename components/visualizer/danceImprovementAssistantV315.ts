/** V315: evidence-based, opt-in suggestions. Pure planner; preview never mutates settings.
 * Metrics are proxies for additive movement, not frame-accurate synchronization. */
import type { ReviewSnapshotV314, ReviewSampleV314 } from './dancePerformanceReviewV314';
import type { ShowQualitySettingsV310 } from './smartShowQualityV310';
import type { DanceQualitySettings } from './danceQualityV307';
import type { AdvancedDanceSettingsV311 } from './advancedDancePerformanceV311';

export type ImprovementSettingsV315 = {quality:ShowQualitySettingsV310; dance:DanceQualitySettings; performance:AdvancedDanceSettingsV311};
export type ImprovementFieldV315 = 'quality.minHoldSeconds'|'quality.variety'|'quality.fxCeiling'|'dance.intensity'|'performance.footProtection'|'performance.fluidity';
export type ImprovementSuggestionV315 = {id:string; field:ImprovementFieldV315; title:string; explanation:string;
  limitation:string; before:number; after:number; evidence:string; evidenceCount:number; strength:'Hinweis'|'Mehrere Hinweise'};
export type ImprovementPlanV315 = {trackId:string; trackLabel:string; sampleCount:number; spanMs:number; suggestions:ImprovementSuggestionV315[];
  status:'ready'|'insufficient'|'no-issues';};
const clamp=(n:number,min:number,max:number)=>Number.isFinite(n)?Math.min(max,Math.max(min,n)):min;
const average=(xs:number[])=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0;
export function improvementValueV315(settings:ImprovementSettingsV315,field:ImprovementFieldV315):number {
  switch(field){
    case 'quality.minHoldSeconds':return settings.quality.minHoldSeconds;
    case 'quality.variety':return settings.quality.variety;
    case 'quality.fxCeiling':return settings.quality.fxCeiling;
    case 'dance.intensity':return settings.dance.intensity;
    case 'performance.footProtection':return settings.performance.footProtection;
    case 'performance.fluidity':return settings.performance.fluidity;
  }
}
export function withImprovementValueV315(s:ImprovementSettingsV315,field:ImprovementFieldV315,value:number):ImprovementSettingsV315{
  switch(field){
    case 'quality.minHoldSeconds':return {...s,quality:{...s.quality,minHoldSeconds:clamp(Math.round(value),8,40)}};
    case 'quality.variety':return {...s,quality:{...s.quality,variety:clamp(Math.round(value),0,100)}};
    case 'quality.fxCeiling':return {...s,quality:{...s.quality,fxCeiling:clamp(Math.round(value),0,100)}};
    case 'dance.intensity':return {...s,dance:{...s.dance,intensity:clamp(Math.round(value),0,100)}};
    case 'performance.footProtection':return {...s,performance:{...s.performance,footProtection:clamp(Math.round(value),0,100)}};
    case 'performance.fluidity':return {...s,performance:{...s.performance,fluidity:clamp(Math.round(value),0,100)}};
  }
}
export function improvementFieldEnabledV315(settings:ImprovementSettingsV315,field:ImprovementFieldV315):boolean{
  return field.startsWith('quality.')?settings.quality.enabled:field.startsWith('dance.')?settings.dance.enabled:settings.performance.enabled;
}
const validSamples=(samples:readonly ReviewSampleV314[]):ReviewSampleV314[]=>samples.filter(s=>Number.isFinite(s.atMs)&&s.atMs>=0&&Number.isFinite(s.energy)&&Number.isFinite(s.fx));
export function planDanceImprovementsV315(review:ReviewSnapshotV314,settings:ImprovementSettingsV315):ImprovementPlanV315{
  const samples=validSamples(review.samples);
  const spanMs=samples.length>1?Math.max(0,samples[samples.length-1].atMs-samples[0].atMs):0;
  const base={trackId:review.trackId,trackLabel:review.trackLabel,sampleCount:samples.length,spanMs};
  if(!review.trackId||samples.length<8||spanMs<12_000)return {...base,suggestions:[],status:'insufficient'};
  const suggestions:ImprovementSuggestionV315[]=[];
  const add=(item:Omit<ImprovementSuggestionV315,'before'|'strength'> & {after:number})=>{
    const before=improvementValueV315(settings,item.field);
    if(!improvementFieldEnabledV315(settings,item.field)||before===item.after)return;
    if(suggestions.some(s=>s.field===item.field))return;
    suggestions.push({...item,before,strength:item.evidenceCount>=4?'Mehrere Hinweise':'Hinweis'});
  };
  // Only same-section shot switches can actually be addressed by V310 minHoldSeconds.
  const rapid=samples.slice(1).filter((s,i)=>{
    const prior=samples[i];return s.shot!==prior.shot&&s.section===prior.section&&
      s.shot!=='manuell/aus'&&prior.shot!=='manuell/aus'&&s.atMs-prior.atMs>0&&s.atMs-prior.atMs<6500;
  });
  if(rapid.length>=2)add({id:'camera-pacing',field:'quality.minHoldSeconds',title:'Kameraperspektiven länger halten',
    explanation:'Die Aufzeichnung enthält schnelle automatische Kameraschnitte innerhalb desselben Songabschnitts.',
    limitation:'Der Regler verlängert nur die Mindestdauer für optionale Schnitte innerhalb eines Abschnitts. Manuelle Keyframes und neue Songabschnitte behalten Vorrang.',
    after:Math.min(40,settings.quality.minHoldSeconds+6),evidence:`${rapid.length} schnelle Schnitte im selben Abschnitt`,evidenceCount:rapid.length});
  let start=0,longShot=0;
  for(let i=1;i<=samples.length;i++){
    const prior=samples[i-1],next=samples[i];
    if(!next||next.shot!==prior.shot||next.section!==prior.section){
      if(prior.shot!=='manuell/aus'&&prior.atMs-samples[start].atMs>=45_000)longShot++;
      start=i;
    }
  }
  if(longShot>=1)add({id:'camera-variety',field:'quality.variety',title:'Kameraperspektiven variieren',
    explanation:'Eine automatische Perspektive blieb innerhalb desselben Musikabschnitts sehr lange bestehen.',
    limitation:'Mehr Abwechslung wird ausschließlich an geeigneten Phrasengrenzen versucht; eine sichtbare Änderung ist nicht garantiert.',
    after:Math.min(100,settings.quality.variety+15),evidence:`${longShot} lange Kamerapassage(n) über 45 Sekunden`,evidenceCount:longShot});
  const noisyBreaks=samples.filter(s=>s.section==='break'&&s.fx>.69);
  const abruptFx=samples.slice(1).filter((s,i)=>s.atMs-samples[i].atMs<4000&&Math.abs(s.fx-samples[i].fx)>.55);
  if(noisyBreaks.length>=3||abruptFx.length>=3){
    const evidenceCount=noisyBreaks.length>=3?noisyBreaks.length:abruptFx.length;
    add({id:'fx-restraint',field:'quality.fxCeiling',title:'Showeffekte etwas zurücknehmen',
      explanation:noisyBreaks.length>=3?'Mehrere ruhige Abschnitte enthielten intensive automatische Effekte.':'Mehrere deutliche FX-Sprünge wurden aufgezeichnet.',
      limitation:'Begrenzt ausschließlich automatische Dance FX; vorhandene Licht-Timelines und manuelle Effekte bleiben unverändert.',
      after:Math.max(20,settings.quality.fxCeiling-10),evidence:noisyBreaks.length>=3?`${noisyBreaks.length} auffällige Break-Messpunkte`:`${abruptFx.length} starke FX-Sprünge`,evidenceCount});
  }
  const planted=samples.filter(s=>s.hasGroundContact===true&&s.footImpulse!==null&&Number.isFinite(s.footImpulse));
  const highFoot=planted.filter(s=>(s.footImpulse??0)>.58);
  if(planted.length>=5&&highFoot.length>=3&&average(highFoot.map(s=>s.footImpulse??0))>.63){
    add({id:'foot-guard',field:'performance.footProtection',title:'Zusatzbewegung der Füße reduzieren',
      explanation:'Mehrere hohe zusätzliche Fußimpulse wurden bei aktivem Fußkontakt beobachtet.',
      limitation:'Schützt additive Schrittimpulse, nicht die tatsächlichen Füße eines importierten GLB-Clips. Die bestehende Fuß-IK bleibt zuständig.',
      after:Math.min(100,settings.performance.footProtection+10),evidence:`${highFoot.length} erhöhte Kontaktimpulse aus ${planted.length} Messpunkten`,evidenceCount:highFoot.length});
  }
  const energetic=samples.filter(s=>s.energy>.66&&s.movement!==null&&Number.isFinite(s.movement));
  if(energetic.length>=7&&average(energetic.map(s=>s.movement??0))<.17){
    add({id:'dance-presence',field:'dance.intensity',title:'Zusätzliche Tanzakzente verstärken',
      explanation:'Bei hoher Musikenergie war die gemessene zusätzliche Rig-Bewegung vergleichsweise gering.',
      limitation:'Nur additive Bewegungsakzente werden stärker; importierte Motion-Clips bleiben unverändert. Reduced Motion und Fußschutz haben weiter Vorrang.',
      after:Math.min(90,settings.dance.intensity+8),evidence:`${energetic.length} energiereiche Messpunkte mit geringer Zusatzbewegung`,evidenceCount:energetic.length});
  }
  const unstable=samples.slice(1).filter((s,i)=>s.movement!==null&&samples[i].movement!==null&&s.atMs-samples[i].atMs<4000&&Math.abs((s.movement??0)-(samples[i].movement??0))>.42);
  if(unstable.length>=3)add({id:'movement-smoothing',field:'performance.fluidity',title:'Bewegungsübergänge glätten',
    explanation:'Die gemessene additive Bewegungsenergie änderte sich mehrfach deutlich zwischen benachbarten Messpunkten.',
    limitation:'Nicht jeder Sprung ist ein Fehler: musikalische Drops können absichtlich abrupt sein. Nur die V311-Zusatzbewegungen werden gedämpft.',
    after:Math.min(90,settings.performance.fluidity+8),evidence:`${unstable.length} große Bewegungsänderungen`,evidenceCount:unstable.length});
  return {...base,suggestions:suggestions.slice(0,5),status:suggestions.length?'ready':'no-issues'};
}
