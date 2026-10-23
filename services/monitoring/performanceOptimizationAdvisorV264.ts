import type {BottleneckFinding} from "./performanceBottleneckDetectorV263";
export type OptimizationAction = "render-balanced" | "render-low" | "multi-avatar-director";
export type OptimizationProposal = Readonly<{id:OptimizationAction; title:string; explanation:string; confidence:"moderate"|"low"}>;
/** Advisory only: proposals never modify settings. Duplicate actions are eliminated. */
export function proposeOptimizations(findings:readonly BottleneckFinding[], currentMode:string, directorEnabled:boolean):OptimizationProposal[]{
 const proposals:OptimizationProposal[]=[];
 const has=(kind:string)=>findings.some(f=>f.kind===kind);
 if(has("render-pressure") || has("unclassified")){
   if(currentMode==="high" || currentMode==="auto") proposals.push({id:"render-balanced",title:"Rendering auf Balanced stellen",explanation:"Senkt das Rendering-Budget. Bei Auto wird die automatische Qualitätsregelung durch Balanced ersetzt.",confidence:has("render-pressure")?"moderate":"low"});
   else if(currentMode==="balanced") proposals.push({id:"render-low",title:"Rendering auf Low stellen",explanation:"Reduziert das Rendering-Budget weiter. Nur sinnvoll, wenn Ruckler sichtbar sind.",confidence:has("render-pressure")?"moderate":"low"});
 }
 if(has("avatar-cpu") && !directorEnabled) proposals.push({id:"multi-avatar-director",title:"Multi-Avatar Director aktivieren",explanation:"Verringert unter Last sekundäre Berechnungen, ohne die ausgewählten Avatare zu ersetzen.",confidence:"moderate"});
 return proposals;
}
